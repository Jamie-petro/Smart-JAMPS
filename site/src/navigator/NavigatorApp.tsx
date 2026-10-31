import React, { useState, useEffect } from 'react';
import { Proposal, BudgetLineItem, AIAnalysisResult } from './types/placemaking';
import { PRESET_PROPOSALS, computeAgencyRequirements } from './data/singaporeAgencies';
import { Navbar } from './components/Navbar';
import { ProposalShelf } from './components/ProposalShelf';
import { ProposalOverview } from './components/ProposalOverview';
import { AgencyTimeline } from './components/AgencyTimeline';
import { AgencyMatrix } from './components/AgencyMatrix';
import { FundingOptimizer } from './components/FundingOptimizer';
import { AIAuditPanel } from './components/AIAuditPanel';
import { NLBArchiveExplorer } from './components/NLBArchiveExplorer';
import { NLBTitleRecord } from './data/nlbCatalogue';
import { SubmissionPackModal } from './components/SubmissionPackModal';
import { CustomProposalModal } from './components/CustomProposalModal';
import { Check, Info } from 'lucide-react';
import { generateFallbackAnalysis } from './data/fallbackAnalysis';

// twinCase: the site selected in the Layer 1 twin, built by fromTwin.ts. It is shown first in the shelf.
export default function App({ twinCase }: { twinCase?: Proposal | null } = {}) {
  const [proposals, setProposals] = useState<Proposal[]>(PRESET_PROPOSALS);
  const [selectedId, setSelectedId] = useState<string>(twinCase?.id || 'telok-ayer-walk');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  // Attached NLB Archival Citations per proposal
  const [attachedCitations, setAttachedCitations] = useState<Record<string, string[]>>({
    'telok-ayer-walk': ['nlb-ta-01', 'nlb-ta-02'],
    'void-deck-theatre': ['nlb-bs-01'],
    'rail-corridor-textile': ['nlb-rc-01'],
  });

  // AI Analysis state per proposal
  const [aiAnalyses, setAiAnalyses] = useState<Record<string, AIAnalysisResult>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisSource, setAnalysisSource] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (!twinCase) return;
    setProposals(prev => [twinCase, ...prev.filter(p => p.id !== twinCase.id)]);
    setSelectedId(twinCase.id);
  }, [twinCase]);

  const activeProposal = proposals.find(p => p.id === selectedId) || proposals[0];
  const agencyRequirements = computeAgencyRequirements(activeProposal);

  // Sync theme with documentElement
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3500);
  };

  // Run AI Audit via server endpoint
  const runAIAudit = async (silent = false) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposal: activeProposal }),
      });

      if (!response.ok) throw new Error(`analyze-proposal ${response.status}`);
      const data = await response.json();
      if (!data?.analysis) throw new Error('no analysis returned');
      setAiAnalyses(prev => ({ ...prev, [activeProposal.id]: data.analysis }));
      setAnalysisSource(data.source || 'AI');
      if (!silent) showToast(`AI review done (${data.source || 'AI'}).`);
    } catch (err) {
      // No backend (local dev, static host) or AI error: fixed rule-based advice, labelled as such.
      console.warn('AI audit unavailable, using rule-based fallback:', err);
      setAiAnalyses(prev => ({ ...prev, [activeProposal.id]: generateFallbackAnalysis(activeProposal) }));
      setAnalysisSource('rule-based fallback (not AI)');
      if (!silent) showToast('AI not connected here: showing fixed rule-based advice.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run audit automatically once on initial load for the Telok Ayer preset
  useEffect(() => {
    if (!aiAnalyses[activeProposal.id]) {
      runAIAudit(true);
    }
  }, [selectedId]);

  const handleUpdateLineItems = (newLineItems: BudgetLineItem[]) => {
    setProposals(prev =>
      prev.map(p =>
        p.id === activeProposal.id ? { ...p, lineItems: newLineItems } : p
      )
    );
    showToast('Budget allocation updated. Recalculating co-funding caps...');
  };

  const handleApplyImprovement = (rec: AIAnalysisResult['strengtheningRecommendations'][0]) => {
    setProposals(prev =>
      prev.map(p => {
        if (p.id !== activeProposal.id) return p;
        return {
          ...p,
          description: `${p.description}\n\n[AI Revision - ${rec.area}]: ${rec.concreteImprovement}`,
          communityInvolvementPlan: `${p.communityInvolvementPlan} (Incorporating: ${rec.concreteImprovement})`,
        };
      })
    );
    showToast(`Applied improvement: "${rec.area}" to proposal!`);
  };

  const handleToggleCitation = (record: NLBTitleRecord) => {
    const current = attachedCitations[activeProposal.id] || [];
    const exists = current.includes(record.id);
    const updated = exists
      ? current.filter(id => id !== record.id)
      : [...current, record.id];

    setAttachedCitations(prev => ({
      ...prev,
      [activeProposal.id]: updated,
    }));

    showToast(
      exists
        ? `Removed citation "${record.title.slice(0, 25)}..."`
        : `Attached NLB citation "${record.title.slice(0, 25)}..." to proposal!`
    );
  };

  const handleCreateProposal = (newProposal: Proposal) => {
    setProposals(prev => [newProposal, ...prev]);
    setSelectedId(newProposal.id);
    setActiveTab('overview');
    showToast(`Created custom proposal "${newProposal.title}"!`);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans flex flex-col justify-between">
      <div>
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenExport={() => setIsExportOpen(true)}
          isDark={isDark}
          toggleTheme={toggleTheme}
          onRunAIAudit={() => runAIAudit()}
          isAnalyzing={isAnalyzing}
        />

        {/* Placemaking Case Shelf (NLB-inspired clean proposal library) */}
        <ProposalShelf
          proposals={proposals}
          selectedId={selectedId}
          onSelect={id => {
            setSelectedId(id);
            setActiveTab('overview');
          }}
          onOpenCreate={() => setIsCreateOpen(true)}
        />

        {/* Main Content Viewport */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <ProposalOverview
              proposal={activeProposal}
              onNavigateTab={tab => setActiveTab(tab)}
              onRunAIAudit={() => runAIAudit()}
              isAnalyzing={isAnalyzing}
            />
          )}

          {activeTab === 'timeline' && (
            <AgencyTimeline
              proposal={activeProposal}
              requirements={agencyRequirements}
              onSelectAgency={agencyId => setActiveTab('agencies')}
            />
          )}

          {activeTab === 'agencies' && (
            <AgencyMatrix
              proposal={activeProposal}
              requirements={agencyRequirements}
            />
          )}

          {activeTab === 'funding' && (
            <FundingOptimizer
              proposal={activeProposal}
              onUpdateLineItems={handleUpdateLineItems}
            />
          )}

          {activeTab === 'archives' && (
            <NLBArchiveExplorer
              proposal={activeProposal}
              attachedCitations={attachedCitations[activeProposal.id] || []}
              onToggleCitation={handleToggleCitation}
            />
          )}

          {activeTab === 'ai-audit' && (
            <AIAuditPanel
              proposal={activeProposal}
              analysis={aiAnalyses[activeProposal.id] || null}
              isAnalyzing={isAnalyzing}
              onRunAudit={() => runAIAudit()}
              onApplyImprovement={handleApplyImprovement}
              analysisSource={analysisSource}
            />
          )}
        </main>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Export Submission Pack Modal */}
      <SubmissionPackModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        proposal={activeProposal}
        requirements={agencyRequirements}
        attachedCitations={attachedCitations[activeProposal.id] || []}
      />

      {/* Custom Proposal Builder Modal */}
      <CustomProposalModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateProposal}
      />

      {/* Clean Civic Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 mt-12 bg-white dark:bg-slate-900/60 transition-colors text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">Arts to Places</span>
            <span>·</span>
            <span>Singapore Arts-Led Placemaking & Agency Navigation Prototype</span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-400">
            Grounded in official Singapore SLA, URA, NAC, SCDF & BCA regulatory guidelines.
          </div>
        </div>
      </footer>
    </div>
  );
}
