import React, { useState } from 'react';
import { 
  Compass, MapPin, DollarSign, ShieldAlert, Award, FileText, ChevronRight, 
  ExternalLink, CheckCircle, AlertTriangle, HelpCircle, Layers, Calendar, 
  Building2, Users, Music, Utensils, Zap, Info, Printer, Sparkles, Sliders,
  Send, Bot, RefreshCw, MessageSquare, Plus, ArrowUpRight, Check, Play, Pause,
  Eye, GitBranch, Terminal, Cpu, Database
} from 'lucide-react';

const SITES_DATA = [
  {
    id: 'queensway',
    name: 'Queensway Viaduct / Rail Corridor Spur',
    cadastral: 'Lot MK03-02100W (State Land under SLA)',
    agencyLead: 'Singapore Land Authority (SLA)',
    nscSegment: null,
    typology: 'Sub-Flyover Void Deck & Green Spine Connector',
    baselineViability: 62,
    dimensions: '65m x 18m (Clearance 5.4m to viaduct soffit)',
    noiseTolerance: 'Moderate (Nearest residential HDB: Blk 24 Queensway ~85m)',
    description: 'An underutilized sheltered ground level beneath the expressway viaduct, bridging Queenstown residential estates and the 24km Rail Corridor.'
  },
  {
    id: 'nsc-rochor',
    name: 'NSC Life Reserve: Rochor & Ophir Cultural Gateway',
    cadastral: 'Lot TS13-00450A (Future NSC Surface Civic Plaza)',
    agencyLead: 'Land Transport Authority (LTA) / URA',
    nscSegment: '3.5km Cultural-Heritage Segment',
    typology: 'Surface Linear Park & Heritage Street Canvas',
    baselineViability: 74,
    dimensions: '120m x 24m (Surface Promenade)',
    noiseTolerance: 'High (Commercial & Shophouse buffer zone)',
    description: 'Part of Henning Larsen’s 21.5km North-South Corridor masterplan connecting Kampong Gelam and Little India with artisanal stalls and public performance zones.'
  },
  {
    id: 'nsc-novena',
    name: 'NSC Life Reserve: Novena HealthCity Green Ribbon',
    cadastral: 'Lot TS28-01120K (Civic Boulevard)',
    agencyLead: 'LTA / MOH Holdings',
    nscSegment: '5.0km People’s Wellness Corridor',
    typology: 'Biophilic Shaded Pavilion & Wellness Trail',
    baselineViability: 68,
    dimensions: '80m x 20m (Semi-sheltered)',
    noiseTolerance: 'Low (Hospital precinct buffer requires <65 dBA acoustic cap)',
    description: 'A health and active living corridor integrating passive cooling, sensory gardens, and community therapy art installations.'
  },
  {
    id: 'nsc-bishan',
    name: 'NSC Life Reserve: Bishan-AMK Eco-Loop Junction',
    cadastral: 'Lot MK17-04310P (Park Connector & Drainage Reserve)',
    agencyLead: 'NParks / PUB / LTA',
    nscSegment: '7.0km Ecological Loop',
    typology: 'Riparian Amphitheater & Canopy Boardwalk',
    baselineViability: 71,
    dimensions: '150m x 30m (Open parkland with bio-swales)',
    noiseTolerance: 'Sensitive (Wildlife corridor acoustic restrictions)',
    description: 'The ecological heart of the corridor intersecting Bishan-Ang Mo Kio Park, featuring bio-swale boardwalks and nature-themed art pavilions.'
  },
  {
    id: 'nsc-woodlands',
    name: 'NSC Life Reserve: Woodlands Gateway & Maker Commons',
    cadastral: 'Lot MK13-05900X (Northern Terminus Hub)',
    agencyLead: 'LTA / JTC / URA',
    nscSegment: '6.0km Community-Industrial Segment',
    typology: 'Fabrication Yard & Youth Creative Depot',
    baselineViability: 80,
    dimensions: '110m x 35m (Paved industrial-grade surface)',
    noiseTolerance: 'Very High (Industrial setback allows up to 85 dBA)',
    description: 'The northern gateway terminus connecting cross-border transit with large-scale sculptural installations and youth subcultural workshops.'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [selectedSiteId, setSelectedSiteId] = useState('queensway');
  const [jampsStep, setJampsStep] = useState(2); // Layer 2 default
  const [explodedElevation, setExplodedElevation] = useState(45);
  const [activeLayers, setActiveLayers] = useState({
    cadastre: true,
    utilities: true,
    arts: true,
    regulatory: true
  });
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [isRotating, setIsRotating] = useState(true);
  const [radarAngle, setRadarAngle] = useState(0);

  // Enhancements
  const [appliedEnhancements, setAppliedEnhancements] = useState({
    cccEndorsement: true,
    acousticLimiter: true,
    zeroWaste: false,
    intergenerational: false
  });

  // Chatbot State
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am your Smart-JAMPS Layer 2 Statutory & Placemaking Advisor. I can optimize your agency workplan, solve licensing roadblocks (SLA, SPF, LTA, SFA), or maximize your dual-grant funding. How can I help fine-tune your proposal today?",
      suggestions: [
        "How can I eliminate acoustic objections from nearby HDBs?",
        "Can we split budget between OurSG Fund and NAC P&P?",
        "What approvals are required for temporary food stalls?"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const activeSite = SITES_DATA.find(s => s.id === selectedSiteId) || SITES_DATA[0];

  // Viability calculation
  const viabilityScore = Math.min(100, activeSite.baselineViability 
    + (appliedEnhancements.cccEndorsement ? 12 : 0)
    + (appliedEnhancements.acousticLimiter ? 10 : 0)
    + (appliedEnhancements.zeroWaste ? 6 : 0)
    + (appliedEnhancements.intergenerational ? 8 : 0)
  );

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsAiThinking(true);

    setTimeout(() => {
      let replyText = "";
      let newSuggestions = [];

      const lower = text.toLowerCase();
      if (lower.includes('acoustic') || lower.includes('noise') || lower.includes('hdb') || lower.includes('spf')) {
        replyText = `For ${activeSite.name}, the nearest sensitive boundary is approximately 80–100m away. To ensure SPF PLRD grants a Public Entertainment Licence without neighbor disputes, I suggest enforcing directional cardoid speaker angling away from residences and installing a calibrated 75 dBA acoustic limiter.`;
        newSuggestions = ["Apply acoustic limiter enhancement", "View Layer 4 Regulatory Envelope", "Check SPF licence lead time"];
      } else if (lower.includes('grant') || lower.includes('oursg') || lower.includes('nac') || lower.includes('fund') || lower.includes('budget')) {
        replyText = `Smart-JAMPS Layer 2 strictly bifurcates co-funding to comply with Singapore public funding anti-double-dipping regulations. We allocate civic bonding & participatory painting to MCCY OurSG Fund (up to $20,000 or 80%), and artist honoraria & production gear to NAC Presentation & Participation Grant (up to $50,000 or 70%).`;
        newSuggestions = ["Toggle Intergenerational Workshops (+$3,200)", "Export Grant Budget Sheet", "What is SLA TOL concession rate?"];
      } else if (lower.includes('food') || lower.includes('sfa') || lower.includes('stall')) {
        replyText = `Under SFA guidelines for Temporary Fairs/Pop-ups, food booths must be registered under a single master event licensee. Ensure you provide portable greywater holding tanks and handwash stations with pedal taps. No open flaming is permitted beneath transit flyovers per LTA guidelines.`;
        newSuggestions = ["Inspect Layer 2 Utilities", "Review SFA permit lead time", "What are LTA soffit fire clearances?"];
      } else {
        replyText = `Based on the Smart-JAMPS Layer 2 parameters for "${activeSite.name}", the primary critical path is securing the SLA Temporary Occupation Licence (TOL) at T-12 weeks. Once tenure is locked, LTA soffit clearance and SPF PLRD licenses proceed in parallel.`;
        newSuggestions = ["How do I improve our project viability score?", "Switch to Henning Larsen Rochor segment", "Download full Agency Dossier"];
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: replyText,
        suggestions: newSuggestions
      }]);
      setIsAiThinking(false);
    }, 700);
  };

  const toggleLayer = (layerKey) => {
    setActiveLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const toggleEnhancement = (key) => {
    setAppliedEnhancements(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Smart-JAMPS Pipeline Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Compass className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-lg">Smart-JAMPS</span>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-mono border border-emerald-500/30 font-semibold">
                  Layer 2 Proposal Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Joint Agency Multi-Agency Placemaking System • Singapore</p>
            </div>
          </div>

          {/* 4-Layer JAMPS Pipeline Status Bar */}
          <div className="hidden lg:flex items-center bg-slate-950/70 p-1.5 rounded-xl border border-slate-800 text-xs">
            <button 
              onClick={() => setJampsStep(1)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${jampsStep === 1 ? 'bg-slate-800 text-white font-medium border border-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>1. Site Ingestion</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-600 mx-0.5" />
            <button 
              onClick={() => setJampsStep(2)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${jampsStep === 2 ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Proposal Synthesis</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-600 mx-0.5" />
            <button 
              onClick={() => setJampsStep(3)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${jampsStep === 3 ? 'bg-slate-800 text-white font-medium border border-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>3. Cross-Agency Interlock</span>
            </button>
            <ChevronRight className="w-3 h-3 text-slate-600 mx-0.5" />
            <button 
              onClick={() => setJampsStep(4)}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${jampsStep === 4 ? 'bg-slate-800 text-white font-medium border border-slate-700' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>4. Submission Pack</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'landing' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Master Map (3D)
            </button>
            <button
              onClick={() => setActiveTab('axonometric')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'axonometric' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Site Layers
            </button>
            <button
              onClick={() => setActiveTab('workplan')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'workplan' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Agency Sequence
            </button>
            <button
              onClick={() => setActiveTab('funding')}
              className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'funding' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Grant Matrix
            </button>
            <button
              onClick={() => setActiveTab('advisor')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${activeTab === 'advisor' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-teal-400 hover:text-teal-300'}`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Advisor</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col gap-6">

        {/* TAB 1: 3D SINGAPORE MASTER MAP & CORRIDOR */}
        {activeTab === 'landing' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 p-6 md:p-8">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  Henning Larsen 21.5km North-South Corridor (NSC) & Rail Spine Integration
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
                  Singapore Island Placemaking Axonometric Master Plan
                </h1>
                <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-6">
                  Select an active activation zone to synthesize cadastral ownership, physical viaduct clearances, statutory licensing (SLA, LTA, SPF, SFA), and dual-grant optimization.
                </p>

                {/* Quick Site Selector Pill Bar */}
                <div className="flex flex-wrap gap-2">
                  {SITES_DATA.map(site => (
                    <button
                      key={site.id}
                      onClick={() => {
                        setSelectedSiteId(site.id);
                      }}
                      className={`text-xs px-3 py-2 rounded-xl border transition flex items-center gap-2 ${
                        selectedSiteId === site.id
                          ? 'bg-emerald-500 text-slate-950 font-bold border-emerald-400 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{site.name.split(':')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorative Background Grid */}
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
            </div>

            {/* Interactive 3D Axonometric Canvas */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    3D Isometric Placemaking Canvas (SVY21 Projection)
                  </h2>
                  <p className="text-xs text-slate-400">Click any pulsing node or landmark to inspect its exploded multi-agency layer model.</p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-slate-300">NSC 21.5km Spine Active</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('axonometric')}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Inspect Exploded Layers</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SVG Isometric Stage */}
              <div className="relative w-full h-[420px] bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center select-none">
                <svg viewBox="0 0 900 500" className="w-full h-full max-h-[480px]">
                  <defs>
                    <linearGradient id="islandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0f172a" />
                      <stop offset="50%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#064e3b" />
                    </linearGradient>
                    <linearGradient id="nscPulse" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                    <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" strokeDasharray="2,4" />
                    </pattern>
                  </defs>

                  {/* Isometric Base Grid */}
                  <rect width="900" height="500" fill="url(#gridPattern)" opacity="0.25" />

                  {/* Singapore Island Slab - 3D Isometric Representation */}
                  <g className="animate-island-float" transform="translate(0, 10)">
                    {/* Shadow / Extrusion Depth */}
                    <path
                      d="M 180,260 L 320,180 L 560,190 L 730,250 L 680,340 L 480,390 L 260,370 Z"
                      fill="#020617"
                      opacity="0.8"
                    />
                    <path
                      d="M 180,240 L 320,160 L 560,170 L 730,230 L 680,320 L 480,370 L 260,350 Z"
                      fill="#0f172a"
                      stroke="#1e293b"
                      strokeWidth="3"
                    />
                    {/* Top Island Surface */}
                    <path
                      d="M 180,230 L 320,150 L 560,160 L 730,220 L 680,310 L 480,360 L 260,340 Z"
                      fill="url(#islandGrad)"
                      stroke="#334155"
                      strokeWidth="2"
                    />

                    {/* Henning Larsen 21.5km North-South Corridor (NSC) Life Reserve Spine */}
                    <path
                      d="M 450,170 C 460,210 490,240 500,300"
                      fill="none"
                      stroke="url(#nscPulse)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="6,4"
                      className="animate-pulse"
                    />

                    {/* 24km Rail Corridor Green Spine */}
                    <path
                      d="M 370,185 C 360,220 380,265 410,320"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeDasharray="4,3"
                      opacity="0.7"
                    />

                    {/* Marina Bay Sands 3D Isometric Landmark Representation */}
                    <g transform="translate(525, 290)">
                      <rect x="0" y="-30" width="6" height="30" fill="#38bdf8" opacity="0.8" />
                      <rect x="10" y="-32" width="6" height="32" fill="#38bdf8" opacity="0.8" />
                      <rect x="20" y="-30" width="6" height="30" fill="#38bdf8" opacity="0.8" />
                      <polygon points="-4,-32 30,-32 26,-36 -2,-36" fill="#0284c7" />
                    </g>

                    {/* Clickable Node 1: Queensway Viaduct (Rail Corridor) */}
                    <g 
                      className="cursor-pointer transition-transform hover:scale-110"
                      onClick={() => { setSelectedSiteId('queensway'); setActiveTab('axonometric'); }}
                      transform="translate(405, 305)"
                    >
                      <circle r="14" fill="#10b981" opacity="0.2" className="animate-ping" />
                      <circle r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                      <text x="12" y="4" fill="#ffffff" fontSize="11" fontWeight="bold" className="drop-shadow">Queensway Flyover</text>
                    </g>

                    {/* Clickable Node 2: Rochor / Ophir NSC Segment */}
                    <g 
                      className="cursor-pointer transition-transform hover:scale-110"
                      onClick={() => { setSelectedSiteId('nsc-rochor'); setActiveTab('axonometric'); }}
                      transform="translate(490, 275)"
                    >
                      <circle r="14" fill="#38bdf8" opacity="0.2" className="animate-ping" />
                      <circle r="7" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" />
                      <text x="12" y="4" fill="#ffffff" fontSize="11" fontWeight="bold" className="drop-shadow">Rochor Heritage (NSC)</text>
                    </g>

                    {/* Clickable Node 3: Novena HealthCity */}
                    <g 
                      className="cursor-pointer transition-transform hover:scale-110"
                      onClick={() => { setSelectedSiteId('nsc-novena'); setActiveTab('axonometric'); }}
                      transform="translate(470, 235)"
                    >
                      <circle r="6" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
                      <text x="10" y="4" fill="#cbd5e1" fontSize="10">Novena HealthCity</text>
                    </g>

                    {/* Clickable Node 4: Bishan-AMK Eco Loop */}
                    <g 
                      className="cursor-pointer transition-transform hover:scale-110"
                      onClick={() => { setSelectedSiteId('nsc-bishan'); setActiveTab('axonometric'); }}
                      transform="translate(460, 205)"
                    >
                      <circle r="6" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                      <text x="10" y="4" fill="#cbd5e1" fontSize="10">Bishan-AMK Park</text>
                    </g>

                    {/* Clickable Node 5: Woodlands Gateway */}
                    <g 
                      className="cursor-pointer transition-transform hover:scale-110"
                      onClick={() => { setSelectedSiteId('nsc-woodlands'); setActiveTab('axonometric'); }}
                      transform="translate(440, 165)"
                    >
                      <circle r="6" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
                      <text x="10" y="4" fill="#cbd5e1" fontSize="10">Woodlands Terminus</text>
                    </g>
                  </g>
                </svg>

                {/* Legend Overlay */}
                <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur p-3 rounded-xl border border-slate-800 text-xs flex flex-col gap-1.5">
                  <div className="font-semibold text-slate-300">Spatial Overlay Legend</div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-3 h-1 bg-gradient-to-r from-emerald-400 to-sky-400 rounded"></span>
                    <span>Henning Larsen NSC 21.5km "Life Reserve"</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-3 h-1 bg-emerald-500 rounded"></span>
                    <span>Rail Corridor (24km continuous spine)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-white border border-slate-700"></span>
                    <span>State Land Activation Nodes (SLA / LTA)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Selected Site Card */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex flex-col gap-2 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                    {activeSite.cadastral}
                  </span>
                  <span className="text-xs text-slate-400">• Lead: {activeSite.agencyLead}</span>
                </div>
                <h3 className="text-xl font-bold text-white">{activeSite.name}</h3>
                <p className="text-xs text-slate-300">{activeSite.description}</p>
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 mt-2">
                  <div><strong>Dimensions:</strong> {activeSite.dimensions}</div>
                  <div><strong>Acoustic Cap:</strong> {activeSite.noiseTolerance}</div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Proposal Readiness Index</div>
                  <div className="text-3xl font-black text-emerald-400">{viabilityScore}%</div>
                </div>
                <button
                  onClick={() => setActiveTab('axonometric')}
                  className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center justify-center gap-2 text-sm shadow-md"
                >
                  <span>Explore Site Layers</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: EXPLODED MICRO AXONOMETRIC LAYERS */}
        {activeTab === 'axonometric' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Control Bar */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="text-base font-bold text-white">Exploded Placemaking Spatial Model</h2>
                  <p className="text-xs text-slate-400">{activeSite.name} — 4 Statutory Tiers</p>
                </div>
              </div>

              {/* Layer Toggles */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => toggleLayer('regulatory')}
                  className={`px-3 py-1.5 rounded-lg border transition ${
                    activeLayers.regulatory 
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold' 
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  Layer 4: Regulatory Envelope (SPF/LTA)
                </button>
                <button
                  onClick={() => toggleLayer('arts')}
                  className={`px-3 py-1.5 rounded-lg border transition ${
                    activeLayers.arts 
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold' 
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  Layer 3: Arts Program & Stage
                </button>
                <button
                  onClick={() => toggleLayer('utilities')}
                  className={`px-3 py-1.5 rounded-lg border transition ${
                    activeLayers.utilities 
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-semibold' 
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  Layer 2: Community Amenity (SFA/PUB)
                </button>
                <button
                  onClick={() => toggleLayer('cadastre')}
                  className={`px-3 py-1.5 rounded-lg border transition ${
                    activeLayers.cadastre 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold' 
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}
                >
                  Layer 1: Cadastre (SLA TOL)
                </button>
              </div>

              {/* Elevation slider */}
              <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" />
                  Explosion Spacing:
                </span>
                <input
                  type="range"
                  min="15"
                  max="70"
                  value={explodedElevation}
                  onChange={(e) => setExplodedElevation(Number(e.target.value))}
                  className="w-24 accent-emerald-500 cursor-pointer"
                />
                <span className="font-mono text-emerald-400 w-8">{explodedElevation}px</span>
              </div>
            </div>

            {/* 4-Layer Exploded Canvas */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col lg:flex-row gap-6">
              <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800/80 p-4 h-[500px] flex items-center justify-center relative overflow-hidden">
                <svg viewBox="0 0 700 500" className="w-full h-full">
                  <defs>
                    <linearGradient id="layerSlabGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1e293b" />
                      <stop offset="100%" stopColor="#0f172a" />
                    </linearGradient>
                  </defs>

                  {/* LAYER 1: GROUND CADASTRE (SLA TOL MK03-02100W) */}
                  {activeLayers.cadastre && (
                    <g transform={`translate(0, ${180 + explodedElevation * 1.5})`}>
                      <polygon points="120,180 350,70 580,180 350,290" fill="#064e3b" opacity="0.3" stroke="#10b981" strokeWidth="2" />
                      <text x="140" y="230" fill="#10b981" fontSize="12" fontWeight="bold">LAYER 1: CADASTRAL LOT (SLA TOL TENURE)</text>
                      <text x="140" y="246" fill="#6ee7b7" fontSize="10">{activeSite.cadastral}</text>
                      {/* Concrete Flyover Piers */}
                      <rect x="240" y="110" width="20" height="40" fill="#334155" stroke="#475569" />
                      <rect x="440" y="110" width="20" height="40" fill="#334155" stroke="#475569" />
                    </g>
                  )}

                  {/* LAYER 2: UTILITIES & COMMUNITY AMENITIES (SFA & PUB) */}
                  {activeLayers.utilities && (
                    <g transform={`translate(0, ${180 + explodedElevation * 0.5})`}>
                      <polygon points="120,150 350,40 580,150 350,260" fill="#0369a1" opacity="0.25" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3,3" />
                      <text x="140" y="200" fill="#38bdf8" fontSize="12" fontWeight="bold">LAYER 2: AMENITY & GREYWATER RECOVERY</text>
                      {/* SFA Food Booth & Handwashing Station */}
                      <g 
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedHotspot({
                          title: 'SFA Temporary Food Booth & Sullage Station',
                          agency: 'Singapore Food Agency (SFA)',
                          desc: 'Requires portable grease trap, dedicated greywater recovery tank, and certified food hygiene handlers. Minimum 3.0m fire clear path.'
                        })}
                        transform="translate(260, 100)"
                      >
                        <rect width="40" height="25" fill="#0284c7" stroke="#bae6fd" rx="4" />
                        <text x="8" y="16" fill="#ffffff" fontSize="9" fontWeight="bold">SFA</text>
                      </g>
                    </g>
                  )}

                  {/* LAYER 3: CREATIVE ARTS PROGRAM & DEMOUNTABLE STAGE */}
                  {activeLayers.arts && (
                    <g transform={`translate(0, ${180 - explodedElevation * 0.5})`}>
                      <polygon points="120,120 350,10 580,120 350,230" fill="#b45309" opacity="0.25" stroke="#fbbf24" strokeWidth="2" />
                      <text x="140" y="170" fill="#fbbf24" fontSize="12" fontWeight="bold">LAYER 3: DEMOUNTABLE ARTS PLATFORM</text>
                      {/* Low Demountable Timber Stage (<1.5m BCA Exemption) */}
                      <g 
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedHotspot({
                          title: '0.6m Low-Rise Demountable Stage',
                          agency: 'BCA / SCDF Temporary Structures',
                          desc: 'Kept under 1.5m to qualify for statutory BCA PE Structural Certification exemption. Zero anchoring/drilling into SLA ground slab.'
                        })}
                        transform="translate(320, 70)"
                      >
                        <polygon points="0,30 30,15 60,30 30,45" fill="#f59e0b" stroke="#fef3c7" />
                        <text x="12" y="34" fill="#78350f" fontSize="8" fontWeight="bold">STAGE</text>
                      </g>
                    </g>
                  )}

                  {/* LAYER 4: REGULATORY ENVELOPE (SPF & LTA SOFFIT) */}
                  {activeLayers.regulatory && (
                    <g transform={`translate(0, ${180 - explodedElevation * 1.5})`}>
                      <polygon points="120,90 350,-20 580,90 350,200" fill="#be123c" opacity="0.2" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5,3" />
                      <text x="140" y="140" fill="#f43f5e" fontSize="12" fontWeight="bold">LAYER 4: STATUTORY REGULATORY ENVELOPE</text>
                      {/* 3.0m Flyover Soffit Clearance Buffer */}
                      <line x1="200" y1="40" x2="500" y2="40" stroke="#fb7185" strokeWidth="2" strokeDasharray="4,2" />
                      <text x="310" y="34" fill="#fb7185" fontSize="9">3.0m Soffit Buffer (LTA)</text>
                      {/* Cardioid Acoustic Enclosure */}
                      <g 
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => setSelectedHotspot({
                          title: 'SPF PLRD 75 dBA Acoustic Cone',
                          agency: 'Police Licensing & Regulatory Department (PLRD)',
                          desc: 'Public Entertainment Licence condition: directional cardoid sound enclosure angled away from residential blocks, restricted past 22:00 hrs.'
                        })}
                        transform="translate(420, 60)"
                      >
                        <circle r="18" fill="#fda4af" opacity="0.3" />
                        <circle r="6" fill="#e11d48" />
                        <text x="10" y="4" fill="#fecdd3" fontSize="9">75 dBA Limit</text>
                      </g>
                    </g>
                  )}
                </svg>
              </div>

              {/* Hotspot & Layer Detail Inspector */}
              <div className="w-full lg:w-80 flex flex-col gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-400" />
                    Spatial Layer Inspector
                  </h3>
                  {selectedHotspot ? (
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {selectedHotspot.agency}
                      </div>
                      <div className="font-bold text-white text-sm">{selectedHotspot.title}</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{selectedHotspot.desc}</p>
                      <button 
                        onClick={() => setSelectedHotspot(null)}
                        className="text-xs text-slate-400 hover:text-white underline mt-2 text-left"
                      >
                        Clear selection
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Click any element on the exploded spatial model (SFA Stall, Low Stage, Acoustic Cone) to view exact statutory restrictions and agency clearances.
                    </p>
                  )}
                </div>

                {/* Strategic Enhancements Panel */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Proposal Enhancements
                  </h3>
                  <div className="flex flex-col gap-2 text-xs">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={appliedEnhancements.cccEndorsement} 
                        onChange={() => toggleEnhancement('cccEndorsement')}
                        className="rounded accent-emerald-500"
                      />
                      <span className={appliedEnhancements.cccEndorsement ? 'text-emerald-300 font-medium' : 'text-slate-400'}>
                        CCC / Grassroots Co-Partnership (+12% Viability)
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={appliedEnhancements.acousticLimiter} 
                        onChange={() => toggleEnhancement('acousticLimiter')}
                        className="rounded accent-emerald-500"
                      />
                      <span className={appliedEnhancements.acousticLimiter ? 'text-emerald-300 font-medium' : 'text-slate-400'}>
                        Calibrated Directional Acoustic Limiter (+10%)
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={appliedEnhancements.zeroWaste} 
                        onChange={() => toggleEnhancement('zeroWaste')}
                        className="rounded accent-emerald-500"
                      />
                      <span className={appliedEnhancements.zeroWaste ? 'text-emerald-300 font-medium' : 'text-slate-400'}>
                        Zero-Waste Plan (NEA Compliant) (+6%)
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={appliedEnhancements.intergenerational} 
                        onChange={() => toggleEnhancement('intergenerational')}
                        className="rounded accent-emerald-500"
                      />
                      <span className={appliedEnhancements.intergenerational ? 'text-emerald-300 font-medium' : 'text-slate-400'}>
                        Intergenerational Senior Workshops (+8%)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AGENCY WORKPLAN & SEQUENCING */}
        {activeTab === 'workplan' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-400" />
                    Statutory Agency Clearance Workplan (Chronological Linear Path)
                  </h2>
                  <p className="text-xs text-slate-400">Strict dependency chain for {activeSite.name}</p>
                </div>
                <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                  Critical Path: T-12 Weeks
                </span>
              </div>

              {/* Linear Steps */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/40 relative">
                  <div className="text-xs font-mono font-bold text-emerald-400 mb-1">STAGE 1 • T-12 wks</div>
                  <div className="font-bold text-white text-sm mb-1">SLA Land Tenure</div>
                  <div className="text-xs text-slate-400 mb-2">Singapore Land Authority</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Submit Temporary Occupation Licence (TOL). Proof of land tenure is prerequisite before applying for all secondary licences.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
                  <div className="text-xs font-mono font-bold text-sky-400 mb-1">STAGE 2 • T-8 wks</div>
                  <div className="font-bold text-white text-sm mb-1">LTA Infrastructure</div>
                  <div className="text-xs text-slate-400 mb-2">Land Transport Authority</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Road structure inspection & viaduct soffit clearance clearance. Maintain 3m vertical buffer with zero drilling into pillars.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
                  <div className="text-xs font-mono font-bold text-rose-400 mb-1">STAGE 3 • T-6 wks</div>
                  <div className="font-bold text-white text-sm mb-1">SPF PLRD Licence</div>
                  <div className="text-xs text-slate-400 mb-2">Singapore Police Force</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Public Entertainment Licence application. Submit acoustic management plan and directional speaker layout.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
                  <div className="text-xs font-mono font-bold text-amber-400 mb-1">STAGE 4 • T-4 wks</div>
                  <div className="font-bold text-white text-sm mb-1">SFA Food Hygiene</div>
                  <div className="text-xs text-slate-400 mb-2">Singapore Food Agency</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Temporary Fair Permit. Submit stall layouts, food handler hygiene certifications, and wastewater collection plan.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative">
                  <div className="text-xs font-mono font-bold text-purple-400 mb-1">STAGE 5 • T-3 wks</div>
                  <div className="font-bold text-white text-sm mb-1">SCDF / BCA Audit</div>
                  <div className="text-xs text-slate-400 mb-2">Building & Fire Safety</div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Fire safety clearance for emergency egress routes (3m minimum clear path). Stage structural safety exemption under 1.5m.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DUAL GRANT FUNDING MATRIX */}
        {activeTab === 'funding' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    Public Funding Matrix & Anti-Double-Dipping Audit
                  </h2>
                  <p className="text-xs text-slate-400">Strict bifurcation between MCCY OurSG Fund and NAC Presentation & Participation Grant</p>
                </div>
              </div>

              {/* Dual Grant Budget Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3">Proposal Line Item</th>
                      <th className="p-3">Eligible Scheme</th>
                      <th className="p-3">Funding Agency</th>
                      <th className="p-3">Estimated Cost</th>
                      <th className="p-3">Grant Coverage</th>
                      <th className="p-3">Co-Funding Guardrail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    <tr>
                      <td className="p-3 font-medium text-white">Community Placemaking Workshops & Murals</td>
                      <td className="p-3 text-emerald-400 font-semibold">OurSG Fund</td>
                      <td className="p-3 text-slate-300">MCCY / NYC</td>
                      <td className="p-3 font-mono">$12,000</td>
                      <td className="p-3 text-emerald-400 font-semibold">Up to 80% ($9,600)</td>
                      <td className="p-3 text-slate-400">Only eligible for civic bonding & active citizen engagement</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-white">Artist Performance Honoraria & Sound Tech</td>
                      <td className="p-3 text-purple-400 font-semibold">Presentation & Participation Grant</td>
                      <td className="p-3 text-slate-300">National Arts Council (NAC)</td>
                      <td className="p-3 font-mono">$18,500</td>
                      <td className="p-3 text-purple-400 font-semibold">Up to 70% ($12,950)</td>
                      <td className="p-3 text-slate-400">Restricted to artistic creation & local practitioner fees</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-white">Temporary Demountable Stage & Truss</td>
                      <td className="p-3 text-purple-400 font-semibold">Presentation & Participation Grant</td>
                      <td className="p-3 text-slate-300">National Arts Council (NAC)</td>
                      <td className="p-3 font-mono">$8,000</td>
                      <td className="p-3 text-purple-400 font-semibold">50% ($4,000)</td>
                      <td className="p-3 text-slate-400">Production hardware cap applied</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-white">SLA Temporary Occupation Licence (TOL) Fee</td>
                      <td className="p-3 text-slate-500 font-semibold">Self-Funded / Concession</td>
                      <td className="p-3 text-slate-300">SLA</td>
                      <td className="p-3 font-mono">$2,400</td>
                      <td className="p-3 text-slate-500 font-semibold">0% (Ineligible)</td>
                      <td className="p-3 text-amber-400">Concessionary civic rate applied via CCC grassroots co-support</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Total Project Quantum: </span>
                  <span className="font-mono font-bold text-white">$40,900</span>
                  <span className="mx-2 text-slate-600">|</span>
                  <span className="text-slate-400">Public Co-Funding Secured: </span>
                  <span className="font-mono font-bold text-emerald-400">$26,550 (64.9%)</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Double-Dipping Audit: PASSED</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI PLACEMAKING ADVISOR CHATBOT */}
        {activeTab === 'advisor' && (
          <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full animate-fadeIn">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col h-[600px]">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Smart-JAMPS Layer 2 Statutory Copilot</h2>
                    <p className="text-xs text-slate-400">Active context: {activeSite.name} ({activeSite.cadastral})</p>
                  </div>
                </div>
                <div className="text-xs bg-slate-950 px-3 py-1 rounded-full border border-slate-800 text-slate-400">
                  Viability: <strong className="text-emerald-400">{viabilityScore}%</strong>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-500 text-slate-950 font-medium'
                          : 'bg-slate-950 text-slate-200 border border-slate-800'
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Interactive suggestions attached to bot message */}
                    {msg.suggestions && msg.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.suggestions.map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(sug)}
                            className="text-xs bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/30 px-3 py-1 rounded-lg transition"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {isAiThinking && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800 w-fit">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />
                    <span>Analyzing statutory cross-agency rules...</span>
                  </div>
                )}
              </div>

              {/* Input Box */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about SLA TOL permits, SPF acoustic constraints, or NAC grant rules..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleSendMessage()}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold transition flex items-center justify-center shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            Smart-JAMPS • Layer 2 (Proposal Synthesis & Statutory Clearance Engine)
          </div>
          <div className="flex items-center gap-4">
            <span>SVY21 Coordinates</span>
            <span>MCCY OurSG</span>
            <span>NAC P&P</span>
            <span>SLA State Land</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
