import React, { useState } from 'react';
import { Proposal, BudgetLineItem } from '../types/placemaking';
import { X, Plus, Sparkles, Building2 } from 'lucide-react';

interface CustomProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (newProposal: Proposal) => void;
}

export const CustomProposalModal: React.FC<CustomProposalModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [artform, setArtform] = useState('Public Sculpture & Performance');
  const [precinct, setPrecinct] = useState('Civic District / Bras Basah');
  const [locationSpecifics, setLocationSpecifics] = useState('Open State Reserve / Public Lawn');
  const [venueTenure, setVenueTenure] = useState<Proposal['venueTenure']>('state_land_reserve');
  const [durationDays, setDurationDays] = useState(7);
  const [expectedAudience, setExpectedAudience] = useState(5000);
  const [hasTemporaryStructures, setHasTemporaryStructures] = useState(true);
  const [structureHeightMeters, setStructureHeightMeters] = useState(3.5);
  const [structureFootprintSqm, setStructureFootprintSqm] = useState(60);
  const [hasAmplifiedSound, setHasAmplifiedSound] = useState(true);
  const [decibelEstimateDb, setDecibelEstimateDb] = useState(65);
  const [nightLighting, setNightLighting] = useState(true);
  const [totalBudget, setTotalBudget] = useState(35000);
  const [leadArtistCollective, setLeadArtistCollective] = useState('Independent Singapore Artists');
  const [description, setDescription] = useState('');
  const [communityPlan, setCommunityPlan] = useState('');
  const [safetyPlan, setSafetyPlan] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const lineItems: BudgetLineItem[] = [
      {
        id: `custom-li-1-${Date.now()}`,
        title: 'Artist Honoraria & Production Team Stipends',
        category: 'artistic_fees',
        cost: Math.round(totalBudget * 0.4),
        assignedGrant: 'NAC_PP',
        isAllowableGovExpense: true,
        notes: 'Covers rehearsals, fabrication, and live presentations.'
      },
      {
        id: `custom-li-2-${Date.now()}`,
        title: 'Modular Temporary Infrastructure & Physical Materials',
        category: 'production_staging',
        cost: Math.round(totalBudget * 0.35),
        assignedGrant: 'URA_LIVELY',
        isAllowableGovExpense: true,
        notes: 'Demountable structure with zero permanent ground fixing.'
      },
      {
        id: `custom-li-3-${Date.now()}`,
        title: 'SLA TOL / Venue Rental & Reinstatement Deposit',
        category: 'permits_engineering',
        cost: Math.round(totalBudget * 0.1),
        assignedGrant: 'SELF_COMMERCIAL',
        isAllowableGovExpense: false,
        notes: 'Mandatory licensing fee and refundable bond.'
      },
      {
        id: `custom-li-4-${Date.now()}`,
        title: 'Public Liability Insurance (S$1,000,000) & SCDF Equipment',
        category: 'insurance_admin',
        cost: Math.round(totalBudget * 0.15),
        assignedGrant: 'NAC_PP',
        isAllowableGovExpense: true,
        notes: 'Required statutory indemnity for public space activation.'
      }
    ];

    const proposal: Proposal = {
      id: `custom-${Date.now()}`,
      title: title || 'Custom Placemaking Initiative',
      subtitle: subtitle || 'Ground-up arts activation in public space',
      artform,
      precinct,
      locationSpecifics,
      venueTenure,
      durationDays: Number(durationDays),
      expectedAudience: Number(expectedAudience),
      isOutdoor: true,
      hasTemporaryStructures,
      structureHeightMeters: Number(structureHeightMeters),
      structureFootprintSqm: Number(structureFootprintSqm),
      hasAmplifiedSound,
      decibelEstimateDb: Number(decibelEstimateDb),
      nightLighting,
      isTicketedOrPaid: false,
      totalBudget: Number(totalBudget),
      lineItems,
      leadArtistCollective,
      applicantType: 'individual_sep',
      description:
        description ||
        'A ground-up arts placemaking project designed to animate public spaces and engage local communities in Singapore.',
      objectives: [
        'Animate public realm through site-specific arts intervention',
        'Facilitate intergenerational community participation',
        'Model compliant, sustainable temporary public space use'
      ],
      communityInvolvementPlan:
        communityPlan || 'Participatory weekend workshops with local residents and interest groups.',
      safetyPlan:
        safetyPlan ||
        'Engineered ballast weights; certified fire extinguishers; 4m emergency corridor maintained at all times.',
      imagePath: '/navigator/images/telok_ayer_artwalk_1793422637749.jpg'
    };

    onCreate(proposal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create Custom Placemaking Proposal
            </h3>
            <p className="text-xs text-slate-500">
              Input your arts project parameters to calculate agency roadmap & OurSG grant fit
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-900 dark:text-white mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Whispers of the River: Clarke Quay Audio Walk"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                Artform / Medium
              </label>
              <input
                type="text"
                value={artform}
                onChange={e => setArtform(e.target.value)}
                placeholder="e.g. Kinetic Sculpture, Outdoor Theatre"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                Precinct / Location
              </label>
              <input
                type="text"
                value={precinct}
                onChange={e => setPrecinct(e.target.value)}
                placeholder="e.g. Kampong Gelam, Telok Ayer, Jurong Lake"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                Venue Land Tenure *
              </label>
              <select
                value={venueTenure}
                onChange={e => setVenueTenure(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value="state_land_reserve">SLA State Land / Reserve Site (TOL Required)</option>
                <option value="public_pedestrian_mall">Public Pedestrian Mall (URA Place Management)</option>
                <option value="hdb_void_deck">HDB Void Deck (Town Council)</option>
                <option value="park_connector">NParks Park Connector / Public Park</option>
                <option value="private_commercial">Private Commercial Plaza</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                Total Budget (SGD) *
              </label>
              <input
                type="number"
                min={2000}
                max={500000}
                step={1000}
                value={totalBudget}
                onChange={e => setTotalBudget(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={durationDays}
                onChange={e => setDurationDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                Structure Height (Meters)
              </label>
              <input
                type="number"
                step={0.1}
                min={0}
                max={15}
                value={structureHeightMeters}
                onChange={e => setStructureHeightMeters(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
              <span className="text-[10px] text-slate-500">Above 4.0m triggers BCA PE review</span>
            </div>

            <div>
              <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                Audience Estimate
              </label>
              <input
                type="number"
                min={50}
                max={100000}
                step={500}
                value={expectedAudience}
                onChange={e => setExpectedAudience(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasTemporaryStructures}
                onChange={e => setHasTemporaryStructures(e.target.checked)}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Temporary Staging / Structures</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAmplifiedSound}
                onChange={e => setHasAmplifiedSound(e.target.checked)}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Amplified Sound (&gt;60 dB)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={nightLighting}
                onChange={e => setNightLighting(e.target.checked)}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-slate-700 dark:text-slate-300">Night Lighting (LEW Turn-on)</span>
            </label>
          </div>

          <div>
            <label className="block font-semibold text-slate-900 dark:text-white mb-1">
              Project Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Summarize artistic vision, community relevance, and space intervention..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition-colors shadow-sm"
            >
              Analyze & Generate Workplan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
