import React, { useState } from 'react';
import { NLB_HERITAGE_ARCHIVES, NLBTitleRecord } from '../data/nlbCatalogue';
import { Proposal } from '../types/placemaking';
import {
  BookOpen,
  Search,
  MapPin,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  Code,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Building2,
  Headphones,
  Compass,
  Library
} from 'lucide-react';

interface NLBArchiveExplorerProps {
  proposal: Proposal;
  attachedCitations: string[];
  onToggleCitation: (record: NLBTitleRecord) => void;
}

export const NLBArchiveExplorer: React.FC<NLBArchiveExplorerProps> = ({
  proposal,
  attachedCitations,
  onToggleCitation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [showApiInspector, setShowApiInspector] = useState(false);

  // Auto-filter based on current proposal precinct, or all
  const defaultPrecinctFilter = proposal.precinct.toLowerCase().includes('telok ayer')
    ? 'Telok Ayer'
    : proposal.precinct.toLowerCase().includes('bishan')
    ? 'Bishan'
    : proposal.precinct.toLowerCase().includes('rail corridor')
    ? 'Rail Corridor'
    : 'all';

  const [precinctFilter, setPrecinctFilter] = useState<string>(defaultPrecinctFilter);

  const filteredRecords = NLB_HERITAGE_ARCHIVES.filter(record => {
    const matchesQuery =
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.callNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.summary.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFormat = selectedFormat === 'all' || record.format === selectedFormat;
    const matchesPrecinct = precinctFilter === 'all' || record.precinctTag === precinctFilter;

    const matchesBranch =
      selectedBranch === 'all' ||
      record.availability.some(a => a.branchName.toLowerCase().includes(selectedBranch.toLowerCase()));

    return matchesQuery && matchesFormat && matchesPrecinct && matchesBranch;
  });

  const getFormatIcon = (format: NLBTitleRecord['format']) => {
    switch (format) {
      case 'Physical Book':
        return <BookOpen className="w-4 h-4 text-rose-700 dark:text-rose-400" />;
      case 'Historical Map':
        return <Compass className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'Oral History Recording':
        return <Headphones className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* NLB Civic Header Banner */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">
              <Library className="w-4 h-4" />
              <span>National Library Board Singapore · OpenWeb API v2 Explorer</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Heritage Archives & Archival Citation Builder
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Ground your placemaking proposal in verified Singapore historical records.
              Attach archival call numbers and oral history references directly to your NHB and URA grant submissions.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
            <button
              onClick={() => setShowApiInspector(!showApiInspector)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            >
              <Code className="w-3.5 h-3.5 text-rose-600" />
              <span>{showApiInspector ? 'Hide API Spec' : 'Inspect OpenWeb API'}</span>
            </button>
            <a
              href="https://openweb.nlb.gov.sg"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline"
            >
              <span>openweb.nlb.gov.sg</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Live Search & Filter Bar (NLB Mobile Style) */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search NLB Catalogue (e.g. Telok Ayer, Bishan, Malayan Railway)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-600"
            />
          </div>

          <div>
            <select
              value={selectedFormat}
              onChange={e => setSelectedFormat(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-600"
            >
              <option value="all">All Formats</option>
              <option value="Physical Book">Physical Books</option>
              <option value="Historical Map">Historical Maps & Surveys</option>
              <option value="Oral History Recording">Oral History Sound Recordings</option>
              <option value="Digital eResource">Digital eResources (OverDrive)</option>
            </select>
          </div>

          <div>
            <select
              value={precinctFilter}
              onChange={e => setPrecinctFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-600"
            >
              <option value="all">All Precincts</option>
              <option value="Telok Ayer">Telok Ayer (Historic District)</option>
              <option value="Bishan">Bishan (Heartland Estate)</option>
              <option value="Rail Corridor">Rail Corridor (Green Spine)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Raw OpenWeb API v2 Inspector Drawer */}
      {showApiInspector && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 font-mono text-xs shadow-xl border border-slate-800 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 rounded text-[11px] font-bold">GET</span>
              <span className="text-slate-300">https://openweb.nlb.gov.sg/api/v2/Catalogue/SearchTitles</span>
            </div>
            <span className="text-slate-400 text-[11px]">NLB OpenWeb Spec v2</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px]">
            <div>
              <div className="text-slate-400 font-semibold mb-1">Mandatory Request Headers:</div>
              <div className="bg-slate-950 p-2.5 rounded-lg text-slate-300 space-y-1">
                <div>X-App-Code: <span className="text-rose-400">ART_TO_PLACES_SG</span></div>
                <div>X-Api-Key: <span className="text-amber-400">NLB_LABS_SEC_KEY_8f921...</span></div>
                <div>Accept: <span className="text-blue-400">application/json</span></div>
              </div>
            </div>

            <div>
              <div className="text-slate-400 font-semibold mb-1">Active Query Parameters:</div>
              <div className="bg-slate-950 p-2.5 rounded-lg text-slate-300 space-y-1">
                <div>Keywords: <span className="text-emerald-400">{searchQuery || proposal.precinct}</span></div>
                <div>Format: <span className="text-emerald-400">{selectedFormat}</span></div>
                <div>SortBy: <span className="text-emerald-400">Relevance</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attached Archival Citations Bar */}
      {attachedCitations.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-xl p-4 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200">
            <Bookmark className="w-4 h-4 text-rose-600 fill-rose-600" />
            <span>
              <strong className="font-bold">{attachedCitations.length} NLB Archival References</strong> attached to {proposal.title} dossier.
            </span>
          </div>
          <span className="text-[11px] text-rose-700 dark:text-rose-300">
            These will be included in the exported submission pack.
          </span>
        </div>
      )}

      {/* Catalogue Cards Grid */}
      <div className="space-y-4">
        {filteredRecords.map(record => {
          const isAttached = attachedCitations.includes(record.id);
          const isExpanded = expandedRecordId === record.id;

          return (
            <div
              key={record.id}
              className={`bg-white dark:bg-slate-800/80 rounded-2xl border transition-all p-5 shadow-sm ${
                isAttached
                  ? 'border-rose-400 dark:border-rose-500/80 ring-1 ring-rose-400/20'
                  : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    {getFormatIcon(record.format)}
                  </div>

                  <div>
                    {/* Metadata Header */}
                    <div className="flex flex-wrap items-center gap-2 text-xs mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {record.format}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="font-mono tabular-nums text-rose-700 dark:text-rose-400 font-semibold">
                        {record.callNumber}
                      </span>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-slate-500">{record.publishYear}</span>
                    </div>

                    {/* Title & Author */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {record.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      By {record.author} · Published by {record.publisher}
                    </p>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                      {record.summary}
                    </p>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                  <button
                    onClick={() => onToggleCitation(record)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                      isAttached
                        ? 'bg-rose-700 text-white hover:bg-rose-800'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isAttached ? 'fill-white' : ''}`} />
                    <span>{isAttached ? 'Attached to Dossier' : 'Attach to Proposal'}</span>
                  </button>

                  <button
                    onClick={() => setExpandedRecordId(isExpanded ? null : record.id)}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white inline-flex items-center gap-1 py-1"
                  >
                    <span>{isExpanded ? 'Hide Availability' : 'Branch Availability'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Branch Availability Details (NLB OpenWeb /GetAvailabilityInfo) */}
              {isExpanded && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-900/40 rounded-xl p-3 text-xs space-y-2">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Physical Shelf & Branch Circulation Status (/GetAvailabilityInfo):</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Barcode ref: {record.availability[0]?.itemBarcode}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                    {record.availability.map((loc, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700/80"
                      >
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {loc.branchName}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {loc.shelfLocation}
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[11px]">
                          <span
                            className={`font-semibold ${
                              loc.status === 'Available' || loc.status === 'Digital Access'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {loc.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredRecords.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center text-xs text-slate-500">
            No matching NLB titles found for "{searchQuery}". Try searching "Telok Ayer", "Bishan", or "Corridor".
          </div>
        )}
      </div>
    </div>
  );
};
