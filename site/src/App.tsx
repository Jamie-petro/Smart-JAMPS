import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Layers,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Code2,
  Printer,
  Compass,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  Sliders,
  FileText,
  DollarSign,
  Clock,
  Info,
  Copy,
  Check,
  Terminal,
  Volume2,
  Droplets,
  Frame,
  Users,
  Globe,
  Building2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Activity,
  ExternalLink,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

// ============================================================================
// 1. OPENFREEMAP + MAPLIBRE GL JS + SLA ONEMAP CONFIGURATION
// ============================================================================

declare global {
  interface Window {
    maplibregl?: any;
  }
}

const MAPLIBRE_JS_CDN = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
const MAPLIBRE_CSS_CDN = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';

const OPENFREEMAP_STYLES: Record<string, any> = {
  monolith_dark: {
    id: 'monolith_dark',
    name: 'HeartLah Dark 3D (OpenFreeMap)',
    badge: 'HeartLah Default',
    styleUrl: 'https://tiles.openfreemap.org/styles/positron',
    isDarkFilter: true,
    buildingColor: '#1e2530',
    buildingOpacity: 0.86
  },
  openfreemap_positron: {
    id: 'openfreemap_positron',
    name: 'OpenFreeMap Positron Light',
    badge: 'Vector 3D',
    styleUrl: 'https://tiles.openfreemap.org/styles/positron',
    isDarkFilter: false,
    buildingColor: '#cbd5e1',
    buildingOpacity: 0.82
  },
  openfreemap_liberty: {
    id: 'openfreemap_liberty',
    name: 'OpenFreeMap Liberty 3D',
    badge: 'OSM Liberty',
    styleUrl: 'https://tiles.openfreemap.org/styles/liberty',
    isDarkFilter: false,
    buildingColor: '#94a3b8',
    buildingOpacity: 0.8
  },
  sla_onemap_night: {
    id: 'sla_onemap_night',
    name: 'SLA OneMap Night (SG Official)',
    badge: 'SLA Cadastral',
    styleUrl: {
      version: 8,
      sources: {
        onemap: {
          type: 'raster',
          tiles: ['https://www.onemap.gov.sg/maps/tiles/Night/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© SLA OneMap · OpenStreetMap'
        }
      },
      layers: [
        {
          id: 'onemap-raster-layer',
          type: 'raster',
          source: 'onemap',
          minzoom: 0,
          maxzoom: 20
        }
      ]
    },
    isDarkFilter: false,
    buildingColor: '#1e293b',
    buildingOpacity: 0.78
  }
};

// Island-wide North-South Corridor (NSC 21.5km) & Rail Corridor (24km) GeoJSON coordinates ([lng, lat])
const NSC_LINE_COORDS = [
  [103.7860, 1.4360],
  [103.8150, 1.4210],
  [103.8320, 1.4050],
  [103.8385, 1.3845],
  [103.8465, 1.3622],
  [103.8462, 1.3360],
  [103.8438, 1.3204],
  [103.8495, 1.3112],
  [103.8545, 1.3036],
  [103.8588, 1.2930]
];

const RAIL_CORRIDOR_COORDS = [
  [103.7620, 1.4255],
  [103.7605, 1.3985],
  [103.7662, 1.3780],
  [103.7815, 1.3355],
  [103.7922, 1.3125],
  [103.7997, 1.3039],
  [103.8070, 1.2880],
  [103.8325, 1.2735]
];

// ============================================================================
// 2. CURATED STATUTORY & GEOSPATIAL DATASET (5 SINGAPORE PLACEMAKING NODES)
// ============================================================================

const SITES_DATA: Record<string, any> = {
  queensway: {
    id: 'queensway',
    code: 'LOT MK03-02100W',
    name: 'Queensway / Rail Corridor Viaduct',
    projectTitle: 'Viaduct Vibes: Under-Flyover Arts Commons',
    corridor: 'Rail Corridor × Queensway Flyover Node',
    lat: 1.3039,
    lng: 103.7997,
    svy21: { x: 24285.4, y: 31812.6 },
    parcelBearingDeg: -14,
    parcelDimensionsMeters: { width: 56, depth: 46 },
    noiseRadiusMeters: 50,
    tenure: 'SLA State Land + LTA Viaduct Reserve',
    zoneType: 'Under-Viaduct Infrastructure Space (Near HDB Residential)',
    baseReadiness: 62,
    summary:
      'Adaptive activation of vacant State Land beneath the Queensway concrete viaduct (1.3039°N, 103.7997°E) where the Rail Corridor intersects Queensway Flyover near Blk 166A Queensway.',
    viaductSoffitHeight: '5.8m clear height (3.0m LTA maintenance buffer required)',
    nearestResidential: '42m to HDB Blk 166A / Blk 2 Queensway (Acoustic-sensitive boundary)',
    surroundingContextBlocks: [
      { name: 'HDB Blk 166A Queensway', dx: -82, dz: -68, w: 38, d: 20, h: 48 },
      { name: 'HDB Blk 168A Queensway', dx: 68, dz: -72, w: 42, d: 22, h: 52 },
      { name: 'Queensway Secondary Context', dx: -92, dz: 55, w: 36, d: 26, h: 24 }
    ],
    layers: [
      {
        id: 'layer-1',
        index: 0,
        shortCode: 'L1',
        title: 'Cadastral Land & Viaduct Infrastructure',
        agencies: ['SLA', 'LTA', 'NParks'],
        color: '#64748b',
        accent: '#94a3b8',
        baseHeightM: 0,
        thicknessM: 1.2,
        elevationLabel: '+0.00m Ground Datum',
        description:
          'Geo-anchored SLA State Land Lot MK03-02100W footprint on Queensway, twin-pier concrete viaduct superstructure, and NParks Rail Corridor porous trail interface.',
        statutoryRule:
          'State Lands Act (TOL): Short-term occupation of vacant State land requires SLA Temporary Occupation Licence prior to any site works. Zero structural drilling into LTA viaduct piers.',
        officialSource: 'SLA Short-Term Rental / TOL Guidance (spio.sla.gov.sg)',
        status: 'VERIFIED RULE'
      },
      {
        id: 'layer-2',
        index: 1,
        shortCode: 'L2',
        title: 'Community Amenity & Utilities',
        agencies: ['SFA', 'PUB', 'EMA'],
        color: '#0284c7',
        accent: '#38bdf8',
        baseHeightM: 0.4,
        thicknessM: 2.8,
        elevationLabel: '+0.15m Utility Deck',
        description:
          'SFA-compliant artisanal food pop-up bay, portable greywater & handwashing skid, barrier-free portable restrooms, and zero-emission lithium solar battery bank.',
        statutoryRule:
          'Environmental Public Health Act (SFA): Temporary fair food stalls require potable water supply and enclosed sullage/greywater containment tanks where no sewer point exists.',
        officialSource: 'SFA Temporary Fair Permit Guidelines (sfa.gov.sg)',
        status: 'ASSUMPTION'
      },
      {
        id: 'layer-3',
        index: 2,
        shortCode: 'L3',
        title: 'Creative & Arts Program',
        agencies: ['NAC', 'MCCY', 'BCA'],
        color: '#d97706',
        accent: '#fbbf24',
        baseHeightM: 0.8,
        thicknessM: 3.2,
        elevationLabel: '+0.50m Program Tier',
        description:
          '0.5m elevated modular timber acoustic deck, freestanding counterweighted community mural frames, senior-youth co-creation zone, and illuminated wayfinding arches.',
        statutoryRule:
          'Building Control (Temporary Buildings) Regulations: Platforms <=0.5m height and freestanding display structures <1.5m height qualify for BCA PE structural plan exemption.',
        officialSource: 'OurSG Grants Portal & BCA Temporary Building Guide',
        status: 'VERIFIED RULE'
      },
      {
        id: 'layer-4',
        index: 3,
        shortCode: 'L4',
        title: 'Regulatory Envelopes & Acoustic Cones',
        agencies: ['SPF (PLRD)', 'SCDF', 'LTA'],
        color: '#dc2626',
        accent: '#f87171',
        baseHeightM: 3.0,
        thicknessM: 4.5,
        elevationLabel: '+3.00m Statutory Envelope',
        description:
          '3D statutory compliance volumes: SPF 75dBA/65dBA acoustic propagation cone toward Queensway HDB blocks, LTA 3.0m vertical soffit inspection clearance zone, and SCDF 1.5m egress lanes.',
        statutoryRule:
          'Public Entertainments Act (SPF PLRD) & Fire Safety Act (SCDF): Amplified indie music near residential estates requires strict decibel cutoff by 22:00 hrs and dual 1.5m emergency escape paths.',
        officialSource: 'SPF Public Entertainment Licence Conditions (police.gov.sg)',
        status: 'CRITICAL GAP'
      }
    ],
    hotspots: [
      {
        id: 'hs-sla-boundary',
        number: '01',
        layerId: 'layer-1',
        title: 'SLA Cadastral Lot MK03-02100W Boundary',
        agency: 'SLA (Singapore Land Authority)',
        timing: 'T-12 to T-10 Weeks',
        posMeters: { dx: -18, dy: 0.5, dz: 16 },
        category: 'Land Tenure',
        verificationType: 'VERIFIED RULE',
        officialRef: 'SLA SPIO Short-Term TOL Portal',
        whyApproach:
          'Foundational land permission. All downstream licences (SPF, SFA, SCDF) and NAC grant disbursements require proof of landowner in-principle approval / TOL.',
        requirementDetail:
          'Submit geo-referenced site plan demarcating exact 450 sqm occupation boundary on Lot MK03-02100W via SLA SPIO portal at least 10–12 weeks ahead.',
        linkedGrant: 'Eligible under MCCY OurSG Fund venue hire (up to 80% cap) if endorsed by Queenstown CCC.',
        enhancerKey: 'cccEndorsement'
      },
      {
        id: 'hs-lta-piers',
        number: '02',
        layerId: 'layer-1',
        title: 'Queensway Viaduct Concrete Piers & Soffit',
        agency: 'LTA (Land Transport Authority)',
        timing: 'T-8 Weeks',
        posMeters: { dx: -16, dy: 3.0, dz: -11 },
        category: 'Structural Protection',
        verificationType: 'VERIFIED RULE',
        officialRef: 'LTA Code of Practice for Works on Public Streets',
        whyApproach:
          'Site sits directly within the LTA Road Structure Safety Zone beneath Queensway Flyover.',
        requirementDetail:
          'Zero mechanical anchoring into concrete piers; maintain 1.5m horizontal buffer around columns and 3.0m vertical clearance below viaduct box girder soffit.',
        linkedGrant: 'N/A (Statutory compliance condition)',
        enhancerKey: 'lowProfileMurals'
      },
      {
        id: 'hs-sfa-food',
        number: '03',
        layerId: 'layer-2',
        title: 'F&B Pop-Up & Greywater Containment Bay',
        agency: 'SFA (Singapore Food Agency)',
        timing: 'T-4 Weeks',
        posMeters: { dx: 14, dy: 1.5, dz: 10 },
        category: 'Public Health',
        verificationType: 'CRITICAL GAP',
        officialRef: 'SFA Temporary Fair Permit & EPHA Sec 31',
        whyApproach:
          'Required for any temporary fair stall serving pre-packed or light preparation refreshments.',
        requirementDetail:
          'Under-viaduct State land lacks direct PUB potable water taps and floor traps. Proposal assumes water availability; must add self-contained potable tank + greywater haulage.',
        linkedGrant: 'Excluded from NAC artistic grant (Commercial/F&B ancillary item — zero overlap enforced).',
        enhancerKey: 'potableWaterUnit'
      },
      {
        id: 'hs-solar-gen',
        number: '04',
        layerId: 'layer-2',
        title: 'Zero-Emission Solar Battery Bank & ADA Pod',
        agency: 'EMA / SCDF / BCA',
        timing: 'T-4 Weeks',
        posMeters: { dx: -17, dy: 1.5, dz: 5 },
        category: 'Site Utilities',
        verificationType: 'VERIFIED RULE',
        officialRef: 'EMA LEW Temporary Supply & SCDF Fire Code',
        whyApproach:
          'Diesel generators under viaducts pose SCDF exhaust/fire hazards and LTA soot staining on soffits.',
        requirementDetail:
          'Lithium-iron-phosphate (LiFePO4) battery bank (<30kWh) eliminates fumes and generator noise, certified by Licensed Electrical Worker (LEW).',
        linkedGrant: 'Co-funded under OurSG Sustainability / Technical Production line item.',
        enhancerKey: null
      },
      {
        id: 'hs-stage-deck',
        number: '05',
        layerId: 'layer-3',
        title: '0.5m Modular Acoustic Timber Stage',
        agency: 'NAC / BCA',
        timing: 'T-6 Weeks (Grant) / T-3 Weeks (BCA)',
        posMeters: { dx: -5, dy: 2.5, dz: -7 },
        category: 'Arts Infrastructure',
        verificationType: 'VERIFIED RULE',
        officialRef: 'BCA Temporary Buildings Regs & NAC P&P Guidelines',
        whyApproach:
          'Core performance platform for indie musicians and spoken-word artists.',
        requirementDetail:
          'Stage height fixed strictly at 500mm (0.5m) with non-slip timber decking and ramp access, exempting the structure from costly BCA Professional Engineer (PE) submission.',
        linkedGrant: 'NAC Presentation & Participation Grant (Covers Artist Honoraria & Acoustic Stage Rental).',
        enhancerKey: null
      },
      {
        id: 'hs-mural-panels',
        number: '06',
        layerId: 'layer-3',
        title: 'Freestanding Community Mural Matrix',
        agency: 'MCCY / SCDF / BCA',
        timing: 'T-6 Weeks',
        posMeters: { dx: 10, dy: 3.2, dz: -4 },
        category: 'Community Placemaking',
        verificationType: 'ASSUMPTION',
        officialRef: 'MCCY OurSG Fund & BCA <1.5m Exemption Rule',
        whyApproach:
          'Co-created visual arts panels painted with Queenstown residents and seniors.',
        requirementDetail:
          'Tall unbraced panels risk wind toppling inside the viaduct wind tunnel. Keeping freestanding A-frames under 1.5m with concrete ballast avoids BCA permit & LTA drilling.',
        linkedGrant: 'MCCY OurSG Fund (Covers Community Workshop Facilitators & Mural Materials — separate from NAC).',
        enhancerKey: 'lowProfileMurals'
      },
      {
        id: 'hs-spf-acoustic',
        number: '07',
        layerId: 'layer-4',
        title: 'SPF 75dBA Acoustic Propagation Cone',
        agency: 'SPF (Police Licensing & Regulatory Dept)',
        timing: 'T-6 to T-4 Weeks',
        posMeters: { dx: -4, dy: 6.2, dz: -15 },
        category: 'Public Entertainment & Noise',
        verificationType: 'CRITICAL GAP',
        officialRef: 'SPF PLRD Category 2 Arts Entertainment Licence',
        whyApproach:
          'Public Entertainment Licence (PEL) required for live amplified music accessible to the public.',
        requirementDetail:
          'Concrete viaduct soffit reflects sound toward HDB Blk 166A Queensway (42m away). Standard omni-speakers risk exceeding 65dBA residential threshold; directional cardioid array advised.',
        linkedGrant: 'Acoustic engineering covered under NAC Production Technical Rider.',
        enhancerKey: 'cardioidAudio'
      },
      {
        id: 'hs-lta-soffit',
        number: '08',
        layerId: 'layer-4',
        title: 'LTA 3.0m Soffit Buffer & SCDF 1.5m Egress',
        agency: 'LTA / SCDF',
        timing: 'T-3 Weeks',
        posMeters: { dx: 14, dy: 7.5, dz: -12 },
        category: 'Statutory Safety Envelope',
        verificationType: 'VERIFIED RULE',
        officialRef: 'SCDF Fire Safety Act & LTA Bridge Inspection Code',
        whyApproach:
          'Ensures vertical clearance beneath viaduct box girders and unobstructed crowd evacuation.',
        requirementDetail:
          'All lighting trusses and wayfinding arches capped at 2.6m height (maintaining >3.2m clearance to 5.8m soffit). Dual 1.5m clear egress paths link directly to Rail Corridor.',
        linkedGrant: 'N/A (Mandatory safety envelope)',
        enhancerKey: null
      }
    ],
    workplan: [
      {
        step: 1,
        window: 'T-12 to T-10 Wks',
        agency: 'SLA (Singapore Land Authority)',
        licence: 'Temporary Occupation Licence (TOL)',
        targetHotspotId: 'hs-sla-boundary',
        targetLayerId: 'layer-1',
        dependency: 'Prerequisite Root — Must precede all permits & grant agreements',
        why: 'Establishes legal right to occupy State Land Lot MK03-02100W. Other agencies will reject applications without landowner consent.',
        status: 'Ready'
      },
      {
        step: 2,
        window: 'T-8 Wks',
        agency: 'LTA (Road Asset Regulation)',
        licence: 'Viaduct Reserve & Soffit Clearance No-Objection',
        targetHotspotId: 'hs-lta-piers',
        targetLayerId: 'layer-1',
        dependency: 'Requires SLA preliminary site boundary plan',
        why: 'Verifies zero drilling into Queensway Flyover piers, 3.0m vertical soffit clearance, and zero glare to overhead traffic.',
        status: 'Ready'
      },
      {
        step: 3,
        window: 'T-8 to T-6 Wks',
        agency: 'NAC & MCCY (OurSG Grants Portal)',
        licence: 'P&P Grant + OurSG Fund Application',
        targetHotspotId: 'hs-stage-deck',
        targetLayerId: 'layer-3',
        dependency: 'Requires venue confirmation & de-conflicted line-item budget',
        why: 'Grant assessment requires minimum 6–8 weeks lead time before project commencement.',
        status: 'Ready'
      },
      {
        step: 4,
        window: 'T-6 to T-4 Wks',
        agency: 'SPF (Police Licensing - PLRD)',
        licence: 'Ad-Hoc Public Entertainment Licence (PEL)',
        targetHotspotId: 'hs-spf-acoustic',
        targetLayerId: 'layer-4',
        dependency: 'Requires SLA TOL approval + acoustic mitigation layout',
        why: 'Mandatory for live indie music & amplified sound open to the public near residential HDB blocks.',
        status: 'Needs Acoustic Mitigation',
        linkedEnhancer: 'cardioidAudio'
      },
      {
        step: 5,
        window: 'T-4 Wks',
        agency: 'SFA (Singapore Food Agency)',
        licence: 'Temporary Fair Permit & Food Hygiene Clearance',
        targetHotspotId: 'hs-sfa-food',
        targetLayerId: 'layer-2',
        dependency: 'Requires portable potable water & greywater specification',
        why: 'Regulates temporary food/beverage stalls to prevent sullage discharge onto State land or Rail Corridor drains.',
        status: 'Needs Water Utility Plan',
        linkedEnhancer: 'potableWaterUnit'
      },
      {
        step: 6,
        window: 'T-3 Wks',
        agency: 'SCDF & BCA',
        licence: 'Temporary Structure Exemption & Fire Safety Declaration',
        targetHotspotId: 'hs-mural-panels',
        targetLayerId: 'layer-3',
        dependency: 'Requires finalized stage (<0.5m) & mural (<1.5m) CAD drawings',
        why: 'Confirms structures remain below statutory PE threshold and verifies 1.5m emergency egress corridors & fire extinguishers.',
        status: 'Needs <1.5m Frame Spec',
        linkedEnhancer: 'lowProfileMurals'
      }
    ],
    budgetItems: [
      {
        id: 'b1',
        component: 'Indie Musicians & Sound Artists Performance Honoraria (6 Acts)',
        layer: 'L3 Creative',
        cost: 12000,
        assignedGrant: 'NAC_PP',
        allowedGrants: ['NAC_PP'],
        coveragePct: 70,
        ruleNote: 'NAC funds artistic fees; strictly isolated from MCCY community budget.'
      },
      {
        id: 'b2',
        component: '0.5m Modular Timber Stage & Cardioid Acoustic Array Rental',
        layer: 'L3 / L4 Tech',
        cost: 8500,
        assignedGrant: 'NAC_PP',
        allowedGrants: ['NAC_PP', 'MCCY_OURSG'],
        coveragePct: 70,
        ruleNote: 'Eligible production equipment; must be claimed from a single grant stream only.'
      },
      {
        id: 'b3',
        component: 'Intergenerational Community Mural Workshops & Art Materials',
        layer: 'L3 Community',
        cost: 9200,
        assignedGrant: 'MCCY_OURSG',
        allowedGrants: ['MCCY_OURSG'],
        coveragePct: 80,
        ruleNote: 'Ring-fenced under MCCY OurSG Fund because primary outcome is resident bonding.'
      },
      {
        id: 'b4',
        component: 'SLA TOL Land Rental, Solar Battery Bank & Portable Greywater Unit',
        layer: 'L1 / L2 Site',
        cost: 6800,
        assignedGrant: 'MCCY_OURSG',
        allowedGrants: ['MCCY_OURSG'],
        coveragePct: 80,
        ruleNote: 'CCC endorsement unlocks community TOL rates & higher OurSG support.'
      },
      {
        id: 'b5',
        component: 'SFA Pop-Up F&B Booth Setup & Commercial Merchandising',
        layer: 'L2 Amenity',
        cost: 3500,
        assignedGrant: 'SELF_SPONSOR',
        allowedGrants: ['SELF_SPONSOR'],
        coveragePct: 0,
        ruleNote: 'Revenue-generating F&B stalls are excluded from both NAC and MCCY grants.'
      }
    ]
  },

  rochor: {
    id: 'rochor',
    code: 'LOT TS16-00412K',
    name: 'Rochor / Kampong Gelam Heritage Segment',
    projectTitle: 'Corridor Chronicles: NSC Surface Heritage Plaza',
    corridor: 'North-South Corridor (Henning Larsen Surface Deck)',
    lat: 1.3036,
    lng: 103.8545,
    svy21: { x: 30384.2, y: 31778.9 },
    parcelBearingDeg: 32,
    parcelDimensionsMeters: { width: 52, depth: 42 },
    noiseRadiusMeters: 45,
    tenure: 'SLA State Land + URA Conservation Interface',
    zoneType: 'Urban Heritage Surface Corridor',
    baseReadiness: 68,
    summary:
      'Sonic and light projection installation along the newly reclaimed North-South Corridor pedestrianized surface deck (1.3036°N, 103.8545°E) bridging Rochor Canal and Kampong Gelam.',
    viaductSoffitHeight: 'Open sky surface plaza (URA facade light lumen limits apply)',
    nearestResidential: '28m to Rochor mixed-use shophouses & HDB blocks',
    surroundingContextBlocks: [
      { name: 'Rochor Centre / HDB Complex', dx: -75, dz: -55, w: 40, d: 24, h: 46 },
      { name: 'Kampong Gelam Conserved Shophouses', dx: 65, dz: -40, w: 32, d: 18, h: 12 }
    ],
    layers: [
      {
        id: 'layer-1',
        index: 0,
        shortCode: 'L1',
        title: 'Cadastral Deck & NSC Surface Spine',
        agencies: ['SLA', 'LTA', 'URA'],
        color: '#64748b',
        accent: '#94a3b8',
        baseHeightM: 0,
        thicknessM: 1.2,
        elevationLabel: '+0.00m NSC Plaza Slab',
        description: 'Reclaimed LTA North-South Corridor surface slab over box tunnel with URA Kampong Gelam conservation sightlines.',
        statutoryRule: 'LTA Tunnel Protection Zone: Surface axle/point load must not exceed 5 kN/sqm over NSC tunnel slab.',
        officialSource: 'LTA Code of Practice for Railway & Tunnel Protection',
        status: 'VERIFIED RULE'
      },
      {
        id: 'layer-2',
        index: 1,
        shortCode: 'L2',
        title: 'Community Amenity & Utilities',
        agencies: ['SFA', 'PUB', 'NEA'],
        color: '#0284c7',
        accent: '#38bdf8',
        baseHeightM: 0.4,
        thicknessM: 2.8,
        elevationLabel: '+0.15m Utility Tier',
        description: 'Heritage tea sampling kiosk, zero-discharge handwashing station, and clean grid feeder pillar tie-in.',
        statutoryRule: 'PUB Active, Beautiful, Clean (ABC) Waters protection along adjacent Rochor Canal edge.',
        officialSource: 'PUB ABC Waters Design Guidelines',
        status: 'ASSUMPTION'
      },
      {
        id: 'layer-3',
        index: 2,
        shortCode: 'L3',
        title: 'Creative & Arts Program',
        agencies: ['NAC', 'NHB', 'URA'],
        color: '#d97706',
        accent: '#fbbf24',
        baseHeightM: 0.8,
        thicknessM: 3.2,
        elevationLabel: '+0.50m Heritage Arts Tier',
        description: 'Traditional Malay & contemporary sonic pavilion, low-profile batik lightboxes (<1.5m), and storytelling amphitheatre.',
        statutoryRule: 'URA Conservation Guidelines: Zero physical attachment or laser projection onto conserved shophouse facades without URA clearance.',
        officialSource: 'URA Kampong Gelam Conservation Guidelines',
        status: 'VERIFIED RULE'
      },
      {
        id: 'layer-4',
        index: 3,
        shortCode: 'L4',
        title: 'Regulatory Envelopes & Sightlines',
        agencies: ['SPF', 'SCDF', 'URA'],
        color: '#dc2626',
        accent: '#f87171',
        baseHeightM: 3.0,
        thicknessM: 4.5,
        elevationLabel: '+3.00m Statutory Cone',
        description: 'SPF acoustic cone, URA heritage view corridor preservation wedge, and SCDF 4.5m fire engine hardstanding lane.',
        statutoryRule: 'SCDF Fire Code: NSC pedestrian plaza must preserve an unobstructed 4.5m emergency vehicle access lane at all times.',
        officialSource: 'SCDF Fire Code Chapter 4 (Fire Engine Accessway)',
        status: 'CRITICAL GAP'
      }
    ],
    hotspots: [
      {
        id: 'hs-rochor-1',
        number: '01',
        layerId: 'layer-1',
        title: 'LTA NSC Box Tunnel Slab Loading Limit',
        agency: 'LTA / SLA',
        timing: 'T-10 Weeks',
        posMeters: { dx: -15, dy: 0.6, dz: 14 },
        category: 'Structural Load',
        verificationType: 'VERIFIED RULE',
        officialRef: 'LTA Street & Tunnel Structure Protection',
        whyApproach: 'Plaza sits directly above the North-South Corridor underground vehicular tunnel.',
        requirementDetail: 'All temporary ballast weights distributed via timber spreader plates (<5 kN/sqm).',
        linkedGrant: 'OurSG Venue Preparation support.',
        enhancerKey: 'lowProfileMurals'
      },
      {
        id: 'hs-rochor-2',
        number: '02',
        layerId: 'layer-3',
        title: 'Kampong Gelam Sonic Pavilion & Lightboxes',
        agency: 'NAC / NHB / URA',
        timing: 'T-8 Weeks',
        posMeters: { dx: 3, dy: 2.8, dz: -5 },
        category: 'Heritage Arts',
        verificationType: 'VERIFIED RULE',
        officialRef: 'OurSG Grants Portal (NAC & NHB)',
        whyApproach: 'Cross-cultural heritage storytelling installation.',
        requirementDetail: 'Freestanding timber frames under 1.5m height preserve sightlines to Sultan Mosque.',
        linkedGrant: 'NAC P&P Grant + NHB Heritage Project Grant (Non-overlapping items).',
        enhancerKey: 'cccEndorsement'
      },
      {
        id: 'hs-rochor-3',
        number: '03',
        layerId: 'layer-4',
        title: 'Acoustic & Shophouse Residential Envelope',
        agency: 'SPF PLRD',
        timing: 'T-6 Weeks',
        posMeters: { dx: -5, dy: 6.2, dz: -14 },
        category: 'Noise Control',
        verificationType: 'CRITICAL GAP',
        officialRef: 'SPF PLRD Outdoor Performance Rules',
        whyApproach: 'Mixed-use residences within 28m along Rochor Road.',
        requirementDetail: 'Cardioid directional audio array required to keep boundary levels below 65dBA after 21:30.',
        linkedGrant: 'NAC Technical Production line item.',
        enhancerKey: 'cardioidAudio'
      }
    ],
    workplan: [
      {
        step: 1,
        window: 'T-12 Wks',
        agency: 'SLA & URA',
        licence: 'NSC Surface Plaza TOL & Conservation Interface Clearance',
        targetHotspotId: 'hs-rochor-1',
        targetLayerId: 'layer-1',
        dependency: 'Root tenure & urban design approval',
        why: 'Secures public plaza occupation and confirms sightline compliance.',
        status: 'Ready'
      },
      {
        step: 2,
        window: 'T-8 Wks',
        agency: 'LTA Structure Protection',
        licence: 'NSC Tunnel Slab Load Clearance',
        targetHotspotId: 'hs-rochor-2',
        targetLayerId: 'layer-3',
        dependency: 'Requires ballast weight distribution plan',
        why: 'Protects shallow underground NSC box tunnel structure.',
        status: 'Ready'
      },
      {
        step: 3,
        window: 'T-6 Wks',
        agency: 'SPF PLRD & SCDF',
        licence: 'Public Entertainment Licence & 4.5m Fire Access Check',
        targetHotspotId: 'hs-rochor-3',
        targetLayerId: 'layer-4',
        dependency: 'Requires acoustic array & egress plan',
        why: 'Ensures acoustic compliance and emergency vehicle access along pedestrianized corridor.',
        status: 'Needs Acoustic Mitigation',
        linkedEnhancer: 'cardioidAudio'
      }
    ],
    budgetItems: [
      {
        id: 'rb1',
        component: 'Sonic Heritage Artists & Traditional Musicians Honoraria',
        layer: 'L3 Creative',
        cost: 14000,
        assignedGrant: 'NAC_PP',
        allowedGrants: ['NAC_PP'],
        coveragePct: 70,
        ruleNote: 'Dedicated to artist fees and curatorial direction.'
      },
      {
        id: 'rb2',
        component: 'Community Batik Lightbox Workshops & Intergenerational Tours',
        layer: 'L3 Community',
        cost: 8800,
        assignedGrant: 'MCCY_OURSG',
        allowedGrants: ['MCCY_OURSG'],
        coveragePct: 80,
        ruleNote: 'Community engagement deliverables separated from NAC artistic costs.'
      }
    ]
  },

  novena: {
    id: 'novena',
    code: 'LOT TS28-01109L',
    name: 'Novena HealthCity Wellness Loop',
    projectTitle: 'Biophilic Resonance: Healing Arts Deck',
    corridor: 'North-South Corridor (Novena Healthcare Node)',
    lat: 1.3204,
    lng: 103.8438,
    svy21: { x: 29193.5, y: 33636.8 },
    parcelBearingDeg: -8,
    parcelDimensionsMeters: { width: 50, depth: 40 },
    noiseRadiusMeters: 55,
    tenure: 'LTA Pedestrian Deck + MOH HealthCity Interface',
    zoneType: 'Acoustic-Sensitive Healthcare & Wellness Corridor',
    baseReadiness: 65,
    summary:
      'Tactile botanical sculpture and quiet spatial soundscape along the NSC Novena wellness linkway (1.3204°N, 103.8438°E) connecting Tan Tock Seng Hospital and Novena Park.',
    viaductSoffitHeight: 'Covered linkway canopy (4.2m height)',
    nearestResidential: '35m to Clinical Ward Tower (Strict 55dBA daytime / 50dBA evening limit)',
    surroundingContextBlocks: [
      { name: 'TTSH Clinical Ward Wing', dx: -72, dz: -62, w: 45, d: 26, h: 54 },
      { name: 'Novena Medical Center', dx: 68, dz: 48, w: 38, d: 28, h: 42 }
    ],
    layers: [
      {
        id: 'layer-1',
        index: 0,
        shortCode: 'L1',
        title: 'Cadastral Deck & Hospital Linkway',
        agencies: ['LTA', 'SLA', 'MOHH'],
        color: '#64748b',
        accent: '#94a3b8',
        baseHeightM: 0,
        thicknessM: 1.2,
        elevationLabel: '+0.00m Wellness Concourse',
        description: 'Step-free NSC surface concourse linking Novena MRT, TTSH, and therapeutic gardens.',
        statutoryRule: 'Unobstructed 2.4m wheelchair and paramedic stretcher thoroughfare mandatory at all times.',
        officialSource: 'BCA Universal Design & MOHH HealthCity Guidelines',
        status: 'VERIFIED RULE'
      },
      {
        id: 'layer-2',
        index: 1,
        shortCode: 'L2',
        title: 'Hydration & Accessible Amenities',
        agencies: ['SFA', 'PUB'],
        color: '#0284c7',
        accent: '#38bdf8',
        baseHeightM: 0.4,
        thicknessM: 2.8,
        elevationLabel: '+0.15m Amenity Tier',
        description: 'Herbal infusion hydration station with self-contained potable/greywater tank and dementia-friendly rest seating.',
        statutoryRule: 'SFA hygiene compliance for herbal beverage distribution.',
        officialSource: 'SFA Temporary Fair Guidelines',
        status: 'ASSUMPTION'
      },
      {
        id: 'layer-3',
        index: 2,
        shortCode: 'L3',
        title: 'Therapeutic Arts & Tactile Murals',
        agencies: ['NAC', 'MCCY'],
        color: '#d97706',
        accent: '#fbbf24',
        baseHeightM: 0.8,
        thicknessM: 3.2,
        elevationLabel: '+0.40m Sensory Arts Tier',
        description: 'Wheelchair-height (<1.3m) tactile sensory mural walls and whispered directional acoustic pods.',
        statutoryRule: 'Universal Design (BCA Accessibility Code) compliance for patients and seniors.',
        officialSource: 'BCA Code on Accessibility in the Built Environment',
        status: 'VERIFIED RULE'
      },
      {
        id: 'layer-4',
        index: 3,
        shortCode: 'L4',
        title: 'Hospital Quiet-Zone Envelope',
        agencies: ['NEA', 'SPF', 'SCDF'],
        color: '#dc2626',
        accent: '#f87171',
        baseHeightM: 3.0,
        thicknessM: 4.5,
        elevationLabel: '+3.00m Hospital Buffer',
        description: 'Strict 55dBA healthcare acoustic boundary cone and zero-strobe lighting zone near clinical wards.',
        statutoryRule: 'NEA Boundary Noise Limits for Hospital Zones: Strict directional audio containment required.',
        officialSource: 'NEA Environmental Protection & Management Regulations',
        status: 'CRITICAL GAP'
      }
    ],
    hotspots: [
      {
        id: 'hs-nov-1',
        number: '01',
        layerId: 'layer-4',
        title: '55dBA Hospital Acoustic Protection Cone',
        agency: 'NEA / MOHH / SPF',
        timing: 'T-8 Weeks',
        posMeters: { dx: -5, dy: 6.0, dz: -14 },
        category: 'Healthcare Acoustic Rule',
        verificationType: 'CRITICAL GAP',
        officialRef: 'NEA Noise Regulations (Hospital Sensitivity)',
        whyApproach: 'Proximity to Tan Tock Seng Hospital recovery wards requires ultra-low ambient spill.',
        requirementDetail: 'Focused cardioid / parametric ultrasonic speakers limit sound solely to a 4m listening circle.',
        linkedGrant: 'NAC Arts & Wellness Innovation track.',
        enhancerKey: 'cardioidAudio'
      }
    ],
    workplan: [
      {
        step: 1,
        window: 'T-12 Wks',
        agency: 'SLA, LTA & HealthCity Novena Committee',
        licence: 'Joint Concourse Occupation Clearance',
        targetHotspotId: 'hs-nov-1',
        targetLayerId: 'layer-1',
        dependency: 'Root venue approval',
        why: 'Ensures arts footprint does not impede hospital pedestrian or ambulance flows.',
        status: 'Ready'
      },
      {
        step: 2,
        window: 'T-6 Wks',
        agency: 'NEA & SPF',
        licence: 'Hospital Zone Acoustic Exemption / Permit',
        targetHotspotId: 'hs-nov-1',
        targetLayerId: 'layer-4',
        dependency: 'Requires directional speaker spec',
        why: 'Protects inpatient rest environments from acoustic spill.',
        status: 'Needs Acoustic Mitigation',
        linkedEnhancer: 'cardioidAudio'
      }
    ],
    budgetItems: [
      {
        id: 'nb1',
        component: 'Art Therapists & Sound Artists Facilitation Fees',
        layer: 'L3 Creative',
        cost: 11500,
        assignedGrant: 'NAC_PP',
        allowedGrants: ['NAC_PP'],
        coveragePct: 70,
        ruleNote: 'Covers professional artists leading therapeutic sound & tactile sessions.'
      },
      {
        id: 'nb2',
        component: 'Tactile Braille/Timber Mural Frames & Senior Co-Creation',
        layer: 'L3 Community',
        cost: 7900,
        assignedGrant: 'MCCY_OURSG',
        allowedGrants: ['MCCY_OURSG'],
        coveragePct: 80,
        ruleNote: 'Supports community healthcare volunteers and patient caregiver workshops.'
      }
    ]
  },

  bishan: {
    id: 'bishan',
    code: 'LOT MK18-04921P',
    name: 'Bishan-AMK Ecological Reserve Edge',
    projectTitle: 'Kallang River Bio-Art Amphitheatre',
    corridor: 'NSC Cycling Trunk × Bishan-Ang Mo Kio Park Connector',
    lat: 1.3622,
    lng: 103.8465,
    svy21: { x: 29494.1, y: 38259.4 },
    parcelBearingDeg: 18,
    parcelDimensionsMeters: { width: 58, depth: 48 },
    noiseRadiusMeters: 55,
    tenure: 'NParks Park Reserve + PUB ABC Waters Edge',
    zoneType: 'Ecological Park Connector & Riverine Buffer',
    baseReadiness: 64,
    summary:
      'Eco-sculptural bamboo pavilion and acoustic sunset performances (1.3622°N, 103.8465°E) where the North-South Corridor cycling trunk intersects Bishan-Ang Mo Kio Park.',
    viaductSoffitHeight: 'Open parkland next to elevated NSC cycling bridge (5.2m clearance)',
    nearestResidential: '55m to Bishan Street 22 HDB blocks',
    surroundingContextBlocks: [
      { name: 'Bishan St 22 HDB Blk 235', dx: -78, dz: -65, w: 42, d: 20, h: 44 }
    ],
    layers: [
      {
        id: 'layer-1',
        index: 0,
        shortCode: 'L1',
        title: 'Park Connector & PUB Riverine Edge',
        agencies: ['NParks', 'PUB', 'LTA'],
        color: '#64748b',
        accent: '#94a3b8',
        baseHeightM: 0,
        thicknessM: 1.2,
        elevationLabel: '+0.00m Floodplain Datum',
        description: 'Turfed park reserve bordering the naturalized Kallang River bio-engineering swale and NSC cycling ramp.',
        statutoryRule: 'PUB Drainage Act: Zero permanent obstructions inside the 6m river maintenance and flood conveyance corridor.',
        officialSource: 'PUB Code of Practice on Surface Water Drainage',
        status: 'VERIFIED RULE'
      },
      {
        id: 'layer-2',
        index: 1,
        shortCode: 'L2',
        title: 'Zero-Runoff Eco Utilities',
        agencies: ['PUB', 'SFA'],
        color: '#0284c7',
        accent: '#38bdf8',
        baseHeightM: 0.4,
        thicknessM: 2.8,
        elevationLabel: '+0.15m Eco Utility Deck',
        description: 'Closed-loop greywater tank (zero discharge into Kallang River) and solar battery pack.',
        statutoryRule: 'Environmental Protection and Management Act: Strict prohibition on greywater runoff into ABC Waters waterways.',
        officialSource: 'PUB & NEA Waterway Protection Guidelines',
        status: 'ASSUMPTION'
      },
      {
        id: 'layer-3',
        index: 2,
        shortCode: 'L3',
        title: 'Bio-Arts Pavilion & Eco-Murals',
        agencies: ['NAC', 'NParks', 'BCA'],
        color: '#d97706',
        accent: '#fbbf24',
        baseHeightM: 0.8,
        thicknessM: 3.2,
        elevationLabel: '+0.50m Timber Deck',
        description: 'Elevated turf-protection modular deck (0.5m) and <1.5m natural dye community art panels.',
        statutoryRule: 'NParks Trees & Plants Act: Root protection zones around mature rain trees must remain uncompacted.',
        officialSource: 'NParks Park Usage & Tree Conservation Guidelines',
        status: 'VERIFIED RULE'
      },
      {
        id: 'layer-4',
        index: 3,
        shortCode: 'L4',
        title: 'Fauna & Residential Acoustic Cone',
        agencies: ['NParks', 'SPF', 'SCDF'],
        color: '#dc2626',
        accent: '#f87171',
        baseHeightM: 3.0,
        thicknessM: 4.5,
        elevationLabel: '+3.00m Ecological Envelope',
        description: 'Directional acoustic cone avoiding nocturnal wildlife roosting trees and Bishan residential blocks.',
        statutoryRule: 'NParks Biodiversity Guidelines: Warm-spectrum (<2700K) downward lighting and controlled acoustic dispersion.',
        officialSource: 'NParks Biodiversity Impact & Lighting Guide',
        status: 'CRITICAL GAP'
      }
    ],
    hotspots: [
      {
        id: 'hs-bis-1',
        number: '01',
        layerId: 'layer-2',
        title: 'Closed-Loop Greywater Protection near Kallang River',
        agency: 'PUB / SFA',
        timing: 'T-6 Weeks',
        posMeters: { dx: 14, dy: 1.5, dz: 10 },
        category: 'Waterway Protection',
        verificationType: 'CRITICAL GAP',
        officialRef: 'PUB ABC Waters & SFA Fair Rules',
        whyApproach: 'Site borders naturalized Kallang River sensitive aquatic habitat.',
        requirementDetail: 'Mandatory sealed greywater containment tank to prevent soap/food sullage entering biosphere.',
        linkedGrant: 'OurSG Green Placemaking line item.',
        enhancerKey: 'potableWaterUnit'
      }
    ],
    workplan: [
      {
        step: 1,
        window: 'T-10 Wks',
        agency: 'NParks & PUB',
        licence: 'Park Venue Permit & ABC Waters Floodplain Clearance',
        targetHotspotId: 'hs-bis-1',
        targetLayerId: 'layer-1',
        dependency: 'Root ecological & landowner approval',
        why: 'Verifies turf protection mats and rapid demountability in heavy rain alerts.',
        status: 'Ready'
      },
      {
        step: 2,
        window: 'T-4 Wks',
        agency: 'SFA & PUB',
        licence: 'Closed-Loop Water & Fair Permit',
        targetHotspotId: 'hs-bis-1',
        targetLayerId: 'layer-2',
        dependency: 'Requires portable greywater tank spec',
        why: 'Prevents any sullage discharge into Kallang River.',
        status: 'Needs Water Utility Plan',
        linkedEnhancer: 'potableWaterUnit'
      }
    ],
    budgetItems: [
      {
        id: 'bb1',
        component: 'Eco-Acoustic Ensemble & Land-Art Sculptors Honoraria',
        layer: 'L3 Creative',
        cost: 10800,
        assignedGrant: 'NAC_PP',
        allowedGrants: ['NAC_PP'],
        coveragePct: 70,
        ruleNote: 'Covers artist commissioning and performance fees.'
      },
      {
        id: 'bb2',
        component: 'Upcycled River-Clay Community Workshops & Turf Protection Mats',
        layer: 'L1 / L3 Community',
        cost: 8400,
        assignedGrant: 'MCCY_OURSG',
        allowedGrants: ['MCCY_OURSG'],
        coveragePct: 80,
        ruleNote: 'Supports community sustainability workshops with Bishan residents.'
      }
    ]
  },

  woodlands: {
    id: 'woodlands',
    code: 'LOT MK13-02881X',
    name: 'Woodlands Industrial Maker Nodes',
    projectTitle: 'Northern Gateway: Kinetic Maker Underpass',
    corridor: 'NSC Northern Terminus × Woodlands Ave 2 Viaduct',
    lat: 1.4360,
    lng: 103.7860,
    svy21: { x: 22761.0, y: 46421.7 },
    parcelBearingDeg: -22,
    parcelDimensionsMeters: { width: 54, depth: 44 },
    noiseRadiusMeters: 60,
    tenure: 'JTC Industrial Land + SLA Viaduct Underpass',
    zoneType: 'Industrial-Maker Under-Viaduct Zone',
    baseReadiness: 71,
    summary:
      'Kinetic light-and-metalwork art market (1.4360°N, 103.7860°E) co-created by Woodlands polytechnic students, industrial fabrication workshops, and northern residents beneath the NSC viaduct.',
    viaductSoffitHeight: '6.8m high-clearance industrial viaduct soffit',
    nearestResidential: '65m across Woodlands Ave 2 (Buffered by industrial facade)',
    surroundingContextBlocks: [
      { name: 'JTC Woodlands Industrial Flatted Factory', dx: -76, dz: -55, w: 46, d: 28, h: 36 }
    ],
    layers: [
      {
        id: 'layer-1',
        index: 0,
        shortCode: 'L1',
        title: 'JTC / SLA Viaduct Cadastral Plot',
        agencies: ['SLA', 'JTC', 'LTA'],
        color: '#64748b',
        accent: '#94a3b8',
        baseHeightM: 0,
        thicknessM: 1.2,
        elevationLabel: '+0.00m Concrete Apron',
        description: 'Hardstanding concrete apron beneath the northern NSC viaduct span adjacent to JTC light industrial workshops.',
        statutoryRule: 'SLA TOL + LTA 3.0m soffit maintenance clearance.',
        officialSource: 'SLA & JTC Temporary Land Use Guidelines',
        status: 'VERIFIED RULE'
      },
      {
        id: 'layer-2',
        index: 1,
        shortCode: 'L2',
        title: 'Maker Power & Utility Pods',
        agencies: ['SFA', 'EMA', 'PUB'],
        color: '#0284c7',
        accent: '#38bdf8',
        baseHeightM: 0.4,
        thicknessM: 2.8,
        elevationLabel: '+0.15m Utility Deck',
        description: 'Solar battery microgrid powering low-voltage kinetic sculptures and portable handwashing station.',
        statutoryRule: 'EMA LEW certification for temporary distribution board.',
        officialSource: 'EMA Electricity (Electrical Workers) Regulations',
        status: 'ASSUMPTION'
      },
      {
        id: 'layer-3',
        index: 2,
        shortCode: 'L3',
        title: 'Kinetic Metal & Light Installations',
        agencies: ['NAC', 'MCCY', 'BCA'],
        color: '#d97706',
        accent: '#fbbf24',
        baseHeightM: 0.8,
        thicknessM: 3.2,
        elevationLabel: '+0.50m Maker Stage',
        description: 'Modular 0.5m stage, <1.5m counterweighted kinetic sculpture plinths, and youth maker showcase bays.',
        statutoryRule: 'BCA exemption for plinths <1.5m with certified ballast.',
        officialSource: 'BCA Temporary Building Regulations',
        status: 'VERIFIED RULE'
      },
      {
        id: 'layer-4',
        index: 3,
        shortCode: 'L4',
        title: 'Traffic Glare & Acoustic Envelope',
        agencies: ['LTA', 'SPF', 'SCDF'],
        color: '#dc2626',
        accent: '#f87171',
        baseHeightM: 3.0,
        thicknessM: 4.5,
        elevationLabel: '+3.00m Safety Envelope',
        description: 'LTA anti-glare light cone shield for overhead motorists, SPF acoustic zone, and SCDF 1.5m egress lanes.',
        statutoryRule: 'LTA Street Works Code: Upward kinetic lighting must be baffled to prevent glare to viaduct motorists.',
        officialSource: 'LTA Street Works Lighting & Glare Control',
        status: 'CRITICAL GAP'
      }
    ],
    hotspots: [
      {
        id: 'hs-wdl-1',
        number: '01',
        layerId: 'layer-3',
        title: '<1.5m Kinetic Sculpture Plinths',
        agency: 'BCA / SCDF / LTA',
        timing: 'T-4 Weeks',
        posMeters: { dx: 9, dy: 3.2, dz: -4 },
        category: 'Structural Exemption',
        verificationType: 'ASSUMPTION',
        officialRef: 'BCA Structural Plan Exemption Threshold',
        whyApproach: 'Heavy kinetic art installations require anti-tip verification.',
        requirementDetail: 'Capping height at 1.45m with wide steel baseplates secures BCA permit exemption.',
        linkedGrant: 'NAC P&P / Creation Grant.',
        enhancerKey: 'lowProfileMurals'
      }
    ],
    workplan: [
      {
        step: 1,
        window: 'T-10 Wks',
        agency: 'SLA, JTC & LTA',
        licence: 'TOL & Viaduct Underpass Clearance',
        targetHotspotId: 'hs-wdl-1',
        targetLayerId: 'layer-1',
        dependency: 'Root land approval',
        why: 'Clears use of under-viaduct apron and verifies traffic sightlines.',
        status: 'Ready'
      },
      {
        step: 2,
        window: 'T-3 Wks',
        agency: 'BCA & SCDF',
        licence: 'Kinetic Plinth Exemption & Egress Audit',
        targetHotspotId: 'hs-wdl-1',
        targetLayerId: 'layer-3',
        dependency: 'Requires <1.5m counterweighted frame spec',
        why: 'Avoids PE submission delays while guaranteeing crowd safety.',
        status: 'Needs <1.5m Frame Spec',
        linkedEnhancer: 'lowProfileMurals'
      }
    ],
    budgetItems: [
      {
        id: 'wb1',
        component: 'Kinetic Sculptors & Electronic Sound Artists Commissions',
        layer: 'L3 Creative',
        cost: 13500,
        assignedGrant: 'NAC_PP',
        allowedGrants: ['NAC_PP'],
        coveragePct: 70,
        ruleNote: 'Artistic commissioning and kinetic showcase fees.'
      },
      {
        id: 'wb2',
        component: 'Woodlands Youth & Senior Maker Fabrication Workshops',
        layer: 'L3 Community',
        cost: 9000,
        assignedGrant: 'MCCY_OURSG',
        allowedGrants: ['MCCY_OURSG'],
        coveragePct: 80,
        ruleNote: 'Community co-making sessions supported under MCCY.'
      }
    ]
  }
};

const GRANT_PROGRAMS: Record<string, any> = {
  NAC_PP: {
    id: 'NAC_PP',
    name: 'NAC Presentation & Participation Grant',
    agency: 'National Arts Council (OurSG Grants)',
    maxCap: 50000,
    fundingRatio: 0.7,
    scope: 'Artistic honoraria, curatorial fees, stage & audio production directly tied to public arts presentation.',
    restriction: 'Cannot double-dip with MCCY OurSG Fund on the same invoice line item.'
  },
  MCCY_OURSG: {
    id: 'MCCY_OURSG',
    name: 'MCCY Our Singapore Fund (OurSG)',
    agency: 'Ministry of Culture, Community & Youth',
    maxCap: 20000,
    fundingRatio: 0.8,
    scope: 'Community co-creation workshops, volunteer engagement, venue TOL rental & neighbourhood placemaking.',
    restriction: 'Strictly for community bonding deliverables; commercial F&B and pure artist fees excluded.'
  },
  SELF_SPONSOR: {
    id: 'SELF_SPONSOR',
    name: 'Self-Financed / Commercial Sponsor',
    agency: 'Organizer / F&B Vendor Co-Funding',
    maxCap: 100000,
    fundingRatio: 0,
    scope: 'Revenue-generating F&B stalls, merchandise, and non-grant-eligible contingency expenses.',
    restriction: 'Ring-fenced from public grant claims.'
  }
};

const STRATEGIC_ENHANCERS = [
  {
    key: 'cardioidAudio',
    title: 'Deploy Cardioid Directional Speaker Array (<65dBA)',
    targetLayer: 'Layer 4 (Regulatory Envelope)',
    agencyResolved: 'SPF PLRD & NEA',
    readinessBoost: 11,
    visualEffect: 'Morphs Layer 4 red omnidirectional acoustic cone on the 3D city map into a compact green directional zone angled away from HDB blocks.',
    regulatoryEffect: 'Resolves residential noise objection risk; unlocks SPF Public Entertainment Licence up to 22:00 hrs.'
  },
  {
    key: 'potableWaterUnit',
    title: 'Add Self-Contained Potable & Greywater Tank Skid',
    targetLayer: 'Layer 2 (Amenity & Utilities)',
    agencyResolved: 'SFA & PUB',
    readinessBoost: 9,
    visualEffect: 'Adds a sealed twin-tank potable/greywater utility module next to the F&B booth on Layer 2.',
    regulatoryEffect: 'Resolves the unverified water access assumption; satisfies SFA Temporary Fair hygiene & PUB zero-runoff rules.'
  },
  {
    key: 'lowProfileMurals',
    title: 'Cap Freestanding Mural Frames at <1.5m with Ballast',
    targetLayer: 'Layer 3 (Creative Program)',
    agencyResolved: 'BCA, SCDF & LTA',
    readinessBoost: 8,
    visualEffect: 'Lowers Layer 3 mural panels to 1.45m height with wide counterweighted baseplates and zero pier contact.',
    regulatoryEffect: 'Qualifies for BCA Temporary Building permit exemption (saving $3,500 PE fee) & satisfies LTA zero-drilling rule.'
  },
  {
    key: 'cccEndorsement',
    title: 'Co-Partner with Local Citizens’ Consultative Committee (CCC)',
    targetLayer: 'Layer 1 & 3 (Tenure & Funding)',
    agencyResolved: 'SLA & MCCY OurSG',
    readinessBoost: 8,
    visualEffect: 'Activates the Community Co-Host Pavilion Banner & expanded resident workshop ring on Layer 3.',
    regulatoryEffect: 'Unlocks SLA community TOL rental tier and raises MCCY OurSG Fund co-funding eligibility to 80%.'
  }
];

const CAMERA_PRESETS: Record<string, any> = {
  axonometric: { name: '3D', pitch: 60, bearing: -28, zoom: 17.8 },
  topDown: { name: 'Plan', pitch: 0, bearing: 0, zoom: 18.0 },
  viaductStreet: { name: 'Street', pitch: 68, bearing: -72, zoom: 18.2 },
  macroIsland: { name: 'Island', pitch: 38, bearing: -12, zoom: 11.6 }
};

// ============================================================================
// 3. GEOSPATIAL METER-OFFSET TO WGS84 [LNG, LAT] CONVERSION HELPERS
// ============================================================================

function offsetMetersToLngLat(centerLat: number, centerLng: number, dxMeters: number, dzMeters: number, bearingDeg: number = 0): [number, number] {
  const rad = (bearingDeg * Math.PI) / 180;
  // Rotate local (dx, dz) by parcel alignment bearing
  const rotEastM = dxMeters * Math.cos(rad) - dzMeters * Math.sin(rad);
  const rotSouthM = dxMeters * Math.sin(rad) + dzMeters * Math.cos(rad);
  const dLat = -rotSouthM / 110574;
  const dLng = rotEastM / (111320 * Math.cos((centerLat * Math.PI) / 180));
  return [centerLng + dLng, centerLat + dLat];
}

function createGeoPolygonRect(centerLat: number, centerLng: number, cxM: number, czM: number, wM: number, dM: number, bearingDeg: number = 0) {
  const hw = wM / 2;
  const hd = dM / 2;
  const p1 = offsetMetersToLngLat(centerLat, centerLng, cxM - hw, czM - hd, bearingDeg);
  const p2 = offsetMetersToLngLat(centerLat, centerLng, cxM + hw, czM - hd, bearingDeg);
  const p3 = offsetMetersToLngLat(centerLat, centerLng, cxM + hw, czM + hd, bearingDeg);
  const p4 = offsetMetersToLngLat(centerLat, centerLng, cxM - hw, czM + hd, bearingDeg);
  return [[p1, p2, p3, p4, p1]];
}

// Builds the GeoJSON FeatureCollection for MapLibre 3D fill-extrusion layers of our 4-layer stack
function buildSiteExtrusionGeoJSON(site: any, explosionFactor: number, enhancers: Record<string, boolean>, visibleLayers: Record<string, boolean>, isolatedLayerId: string | null) {
  const features: any[] = [];
  const gapMeters = explosionFactor * 14; // Up to 14m vertical separation per tier when exploded

  const isVisible = (layerId: string) => {
    if (isolatedLayerId) return isolatedLayerId === layerId;
    return Boolean(visibleLayers[layerId]);
  };

  // Layer 1: Cadastral & Viaduct Piers
  if (isVisible('layer-1')) {
    const base1 = 0;
    features.push({
      type: 'Feature',
      properties: { layerId: 'layer-1', color: '#334155', base: base1, height: base1 + 0.6, opacity: 0.75 },
      geometry: {
        type: 'Polygon',
        coordinates: createGeoPolygonRect(site.lat, site.lng, 0, 0, 48, 40, site.parcelBearingDeg)
      }
    });
    // 4 Concrete Viaduct Piers
    [
      [-16, -11],
      [6, -11],
      [-16, 11],
      [6, 11]
    ].forEach(([px, pz]) => {
      features.push({
        type: 'Feature',
        properties: { layerId: 'layer-1', color: '#94a3b8', base: base1 + 0.6, height: base1 + 6.4, opacity: 0.85 },
        geometry: {
          type: 'Polygon',
          coordinates: createGeoPolygonRect(site.lat, site.lng, px, pz, 3.2, 3.2, site.parcelBearingDeg)
        }
      });
    });
  }

  // Layer 2: Community Amenity & Utilities
  if (isVisible('layer-2')) {
    const base2 = 2 + gapMeters * 1.0;
    // SFA Food Stall
    features.push({
      type: 'Feature',
      properties: { layerId: 'layer-2', color: '#0284c7', base: base2, height: base2 + 3.0, opacity: 0.85 },
      geometry: {
        type: 'Polygon',
        coordinates: createGeoPolygonRect(site.lat, site.lng, 11, 10, 7.0, 5.5, site.parcelBearingDeg)
      }
    });
    // Greywater / Potable Water Skid
    features.push({
      type: 'Feature',
      properties: {
        layerId: 'layer-2',
        color: enhancers.potableWaterUnit ? '#06b6d4' : '#e11d48',
        base: base2,
        height: base2 + 2.2,
        opacity: 0.9
      },
      geometry: {
        type: 'Polygon',
        coordinates: createGeoPolygonRect(site.lat, site.lng, 16.5, 10, 3.2, 4.5, site.parcelBearingDeg)
      }
    });
    // Solar Battery Bank
    features.push({
      type: 'Feature',
      properties: { layerId: 'layer-2', color: '#10b981', base: base2, height: base2 + 2.5, opacity: 0.85 },
      geometry: {
        type: 'Polygon',
        coordinates: createGeoPolygonRect(site.lat, site.lng, -17, 5, 4.5, 6.0, site.parcelBearingDeg)
      }
    });
  }

  // Layer 3: Creative & Arts Program
  if (isVisible('layer-3')) {
    const base3 = 4 + gapMeters * 2.1;
    // 0.5m Modular Timber Acoustic Stage
    features.push({
      type: 'Feature',
      properties: { layerId: 'layer-3', color: '#f59e0b', base: base3, height: base3 + 1.5, opacity: 0.9 },
      geometry: {
        type: 'Polygon',
        coordinates: createGeoPolygonRect(site.lat, site.lng, -5, -7, 13.5, 9.5, site.parcelBearingDeg)
      }
    });
    // Freestanding Community Mural Panels
    const muralH = enhancers.lowProfileMurals ? 1.45 : 3.2;
    [
      [8, -5.5],
      [12, -2],
      [8, 2]
    ].forEach(([mx, mz]) => {
      features.push({
        type: 'Feature',
        properties: {
          layerId: 'layer-3',
          color: enhancers.lowProfileMurals ? '#fde047' : '#fb923c',
          base: base3,
          height: base3 + muralH,
          opacity: 0.9
        },
        geometry: {
          type: 'Polygon',
          coordinates: createGeoPolygonRect(site.lat, site.lng, mx, mz, 4.0, 0.9, site.parcelBearingDeg)
        }
      });
    });
    // CCC Co-Host Pavilion
    if (enhancers.cccEndorsement) {
      features.push({
        type: 'Feature',
        properties: { layerId: 'layer-3', color: '#a855f7', base: base3, height: base3 + 1.8, opacity: 0.85 },
        geometry: {
          type: 'Polygon',
          coordinates: createGeoPolygonRect(site.lat, site.lng, -4.5, 8, 11.5, 8.0, site.parcelBearingDeg)
        }
      });
    }
  }

  // Layer 4: Regulatory Envelopes
  if (isVisible('layer-4')) {
    const base4 = 6.5 + gapMeters * 3.2;
    // SCDF 1.5m Egress Corridors
    features.push({
      type: 'Feature',
      properties: { layerId: 'layer-4', color: '#10b981', base: base4, height: base4 + 0.8, opacity: 0.65 },
      geometry: {
        type: 'Polygon',
        coordinates: createGeoPolygonRect(site.lat, site.lng, 0, 16, 38, 3.0, site.parcelBearingDeg)
      }
    });
  }

  return {
    type: 'FeatureCollection',
    features
  };
}

// ============================================================================
// 4. MAIN MONOLITH APPLICATION COMPONENT
// ============================================================================

export interface AppProps {
  initialSiteId?: string;
  onStateChange?: (payload: any) => void;
  onHotspotSelect?: (hotspot: any) => void;
  onSiteSelect?: (site: any) => void;
}

export default function App({
  initialSiteId = 'queensway',
  onStateChange,
  onHotspotSelect,
  onSiteSelect
}: AppProps = {}) {
  // --- MONOLITH LOADING SCREEN STATE ---
  const [isLoadingBoot, setIsLoadingBoot] = useState(true);
  const [loadingStepText, setLoadingStepText] = useState('Loading city model…');
  const [mapLibreReady, setMapLibreReady] = useState(false);

  // --- MONOLITH SHELL NAVIGATION & TOOLS STATE ---
  const [activeNavMode, setActiveNavMode] = useState('city'); // 'city' | 'workplan' | 'grants' | 'dossier'
  const [activeLeftRailTool, setActiveLeftRailTool] = useState('layers'); // 'layers' | 'workplan' | 'grants' | 'params' | 'api'
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState('inspector'); // 'inspector' | 'matrix' | 'enhancers'

  // --- GEOSPATIAL & 4-LAYER AXONOMETRIC STATE ---
  const [selectedSiteId, setSelectedSiteId] = useState(initialSiteId);
  const [basemapStyleId, setBasemapStyleId] = useState('monolith_dark');
  const [showOsmBuildings3D, setShowOsmBuildings3D] = useState(true);
  const [showGroundCadastralOverlay, setShowGroundCadastralOverlay] = useState(true);
  const [explosionFactor, setExplosionFactor] = useState(0.75);
  const [isolatedLayerId, setIsolatedLayerId] = useState<string | null>(null);
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    'layer-1': true,
    'layer-2': true,
    'layer-3': true,
    'layer-4': true
  });
  const [selectedHotspotId, setSelectedHotspotId] = useState('hs-spf-acoustic');
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [activeCameraPreset, setActiveCameraPreset] = useState('axonometric');

  // --- INTERACTIVE PROPOSAL PARAMETERS (STRESS-TEST TOOL) ---
  const [proposalParams, setProposalParams] = useState({
    crowdSize: 180,
    maxStructureHeightM: 1.45,
    soundDecibels: 64,
    eventDurationDays: 3,
    foodStallsCount: 2
  });

  // --- STRATEGIC PROPOSAL ENHANCERS ---
  const [enhancers, setEnhancers] = useState<Record<string, boolean>>({
    cardioidAudio: false,
    potableWaterUnit: false,
    lowProfileMurals: false,
    cccEndorsement: false
  });

  // --- LIVE GRANT LINE-ITEM ALLOCATIONS (WITH DOUBLE-DIPPING DETECTOR) ---
  const [budgetAllocations, setBudgetAllocations] = useState<Record<string, string>>({});
  const [simulateDoubleDipConflict, setSimulateDoubleDipConflict] = useState(false);

  // --- CAMERA & MAP REFS ---
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fallbackCameraRef = useRef({
    lat: SITES_DATA[initialSiteId].lat,
    lng: SITES_DATA[initialSiteId].lng,
    zoom: 17.8,
    pitch: 60,
    bearing: -28
  });

  const [cameraTelemetry, setCameraTelemetry] = useState({
    lat: SITES_DATA[initialSiteId].lat,
    lng: SITES_DATA[initialSiteId].lng,
    zoom: 17.8,
    pitch: 60,
    bearing: -28
  });
  const [projectedHotspots, setProjectedHotspots] = useState<any[]>([]);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const currentSite = SITES_DATA[selectedSiteId] || SITES_DATA.queensway;
  const currentBasemap = OPENFREEMAP_STYLES[basemapStyleId] || OPENFREEMAP_STYLES.monolith_dark;

  const selectedHotspot = useMemo(() => {
    return (
      currentSite.hotspots.find((h: any) => h.id === selectedHotspotId) ||
      currentSite.hotspots[0]
    );
  }, [currentSite, selectedHotspotId]);

  // Sync budget allocations when site changes
  useEffect(() => {
    const initialMap: Record<string, string> = {};
    currentSite.budgetItems.forEach((item: any) => {
      initialMap[item.id] = item.assignedGrant;
    });
    setBudgetAllocations(initialMap);
  }, [currentSite]);

  // ============================================================================
  // 5. LOAD MAPLIBRE GL JS FROM CDN & INITIALIZE OPENFREEMAP 3D CITY MODEL
  // ============================================================================

  useEffect(() => {
    let isMounted = true;

    const bootSequence = async () => {
      setLoadingStepText('Loading map…');

      // Inject MapLibre CSS if not present
      if (!document.getElementById('maplibre-gl-css')) {
        const link = document.createElement('link');
        link.id = 'maplibre-gl-css';
        link.rel = 'stylesheet';
        link.href = MAPLIBRE_CSS_CDN;
        document.head.appendChild(link);
      }

      // Inject MapLibre JS if not present
      if (!window.maplibregl) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = MAPLIBRE_JS_CDN;
          script.async = true;
          script.onload = resolve;
          script.onerror = resolve;
          document.head.appendChild(script);
        });
      }

      if (!isMounted) return;

      if (window.maplibregl && mapContainerRef.current && !mapInstanceRef.current) {
        try {
          const map = new window.maplibregl.Map({
            container: mapContainerRef.current,
            style: OPENFREEMAP_STYLES.monolith_dark.styleUrl,
            center: [currentSite.lng, currentSite.lat],
            zoom: 17.8,
            pitch: 60,
            bearing: -28,
            antialias: true,
            attributionControl: false
          });

          mapInstanceRef.current = map;

          map.on('load', () => {
            if (!isMounted) return;
            setupMapLibre3DLayers(map);
            setMapLibreReady(true);
            setLoadingStepText('Building 3D layers…');
            setTimeout(() => {
              if (isMounted) setIsLoadingBoot(false);
            }, 350);
          });

          const syncCam = () => {
            if (!isMounted) return;
            const c = map.getCenter();
            const nextCam = {
              lat: c.lat,
              lng: c.lng,
              zoom: map.getZoom(),
              pitch: map.getPitch(),
              bearing: map.getBearing()
            };
            fallbackCameraRef.current = nextCam;
            setCameraTelemetry(nextCam);
          };

          map.on('move', syncCam);
          map.on('rotate', syncCam);
          map.on('pitch', syncCam);
        } catch (err) {
          setIsLoadingBoot(false);
        }
      } else {
        setTimeout(() => {
          if (isMounted) setIsLoadingBoot(false);
        }, 500);
      }
    };

    bootSequence();

    // Safety timeout so loading overlay always dismisses cleanly
    const timer = setTimeout(() => {
      if (isMounted) setIsLoadingBoot(false);
    }, 2400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Configure 3D OSM Buildings + Corridors + 4-Layer Extrusion GeoJSON inside MapLibre
  const setupMapLibre3DLayers = useCallback(
    (map: any) => {
      if (!map || !map.getStyle()) return;

      try {
        // 1. Add 3D OpenStreetMap Building Extrusions if vector source 'openmaptiles' exists
        const sources = map.getStyle().sources || {};
        const vectorSourceKey = Object.keys(sources).find(
          (k) => sources[k].type === 'vector'
        );

        if (vectorSourceKey && !map.getLayer('osm-3d-buildings')) {
          map.addLayer({
            id: 'osm-3d-buildings',
            source: vectorSourceKey,
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 14,
            paint: {
              'fill-extrusion-color': currentBasemap.buildingColor,
              'fill-extrusion-height': [
                'coalesce',
                ['get', 'render_height'],
                ['get', 'height'],
                18
              ],
              'fill-extrusion-base': [
                'coalesce',
                ['get', 'render_min_height'],
                ['get', 'min_height'],
                0
              ],
              'fill-extrusion-opacity': showOsmBuildings3D
                ? currentBasemap.buildingOpacity
                : 0
            }
          });
        }

        // 2. Add North-South Corridor & Rail Corridor GeoJSON Source
        if (!map.getSource('sg-corridors')) {
          map.addSource('sg-corridors', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: { name: 'North-South Corridor (21.5km)', color: '#f59e0b' },
                  geometry: { type: 'LineString', coordinates: NSC_LINE_COORDS }
                },
                {
                  type: 'Feature',
                  properties: { name: 'Rail Corridor (24km)', color: '#10b981' },
                  geometry: { type: 'LineString', coordinates: RAIL_CORRIDOR_COORDS }
                }
              ]
            }
          });

          map.addLayer({
            id: 'sg-corridors-line',
            type: 'line',
            source: 'sg-corridors',
            paint: {
              'line-color': ['get', 'color'],
              'line-width': 4,
              'line-opacity': 0.82
            }
          });
        }

        // 3. Add 4-Layer Placemaking Extrusion Source
        const geojsonData = buildSiteExtrusionGeoJSON(
          currentSite,
          explosionFactor,
          enhancers,
          visibleLayers,
          isolatedLayerId
        );

        if (!map.getSource('placemaking-stack')) {
          map.addSource('placemaking-stack', {
            type: 'geojson',
            data: geojsonData
          });

          map.addLayer({
            id: 'placemaking-stack-extrusion',
            type: 'fill-extrusion',
            source: 'placemaking-stack',
            paint: {
              'fill-extrusion-color': ['get', 'color'],
              'fill-extrusion-base': ['get', 'base'],
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-opacity': 0.85
            }
          });
        } else {
          map.getSource('placemaking-stack').setData(geojsonData);
        }
      } catch (e) {
        // Ignore transient style load race conditions
      }
    },
    [
      currentBasemap,
      showOsmBuildings3D,
      currentSite,
      explosionFactor,
      enhancers,
      visibleLayers,
      isolatedLayerId
    ]
  );

  // Update MapLibre 3D stack source whenever explosion factor, site, or enhancers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLibreReady) return;
    try {
      const src = map.getSource('placemaking-stack');
      if (src) {
        src.setData(
          buildSiteExtrusionGeoJSON(
            currentSite,
            explosionFactor,
            enhancers,
            visibleLayers,
            isolatedLayerId
          )
        );
      }
      if (map.getLayer('osm-3d-buildings')) {
        map.setPaintProperty(
          'osm-3d-buildings',
          'fill-extrusion-opacity',
          showOsmBuildings3D ? currentBasemap.buildingOpacity : 0
        );
      }
    } catch (e) {
      // Safe guard
    }
  }, [
    mapLibreReady,
    currentSite,
    explosionFactor,
    enhancers,
    visibleLayers,
    isolatedLayerId,
    showOsmBuildings3D,
    currentBasemap
  ]);

  // Switch OpenFreeMap / SLA OneMap style
  const handleSelectBasemapStyle = (styleId: string) => {
    const nextStyle = OPENFREEMAP_STYLES[styleId];
    if (!nextStyle) return;
    setBasemapStyleId(styleId);
    const map = mapInstanceRef.current;
    if (map) {
      try {
        map.setStyle(nextStyle.styleUrl);
        map.once('styledata', () => {
          setupMapLibre3DLayers(map);
        });
      } catch (e) {
        // Fallback
      }
    }
  };

  // ============================================================================
  // 6. SYNCHRONIZED 3D AXONOMETRIC WIREFRAME, CONES & CAD LEADER OVERLAY ENGINE
  // ============================================================================

  useEffect(() => {
    let animId: number;
    let phase = 0;

    // Projects a 3D point (lng, lat, altitudeMeters) into exact screen [x, y] synchronized with MapLibre GL
    const projectLngLatAltToScreen = (lng: number, lat: number, altitudeMeters: number, width: number, height: number) => {
      const map = mapInstanceRef.current;
      const pitchDeg = map ? map.getPitch() : fallbackCameraRef.current.pitch;
      const zoom = map ? map.getZoom() : fallbackCameraRef.current.zoom;
      const pitchRad = (pitchDeg * Math.PI) / 180;

      //Meters-per-pixel at current latitude & zoom
      const mpp =
        (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
      const verticalShiftPx = (altitudeMeters / Math.max(0.05, mpp)) * Math.sin(pitchRad);

      if (map && mapLibreReady) {
        const pt = map.project([lng, lat]);
        return {
          x: pt.x,
          y: pt.y - verticalShiftPx,
          groundX: pt.x,
          groundY: pt.y,
          mpp
        };
      }

      // Fallback projection if MapLibre is still initializing
      const cam = fallbackCameraRef.current;
      const dLng = lng - cam.lng;
      const dLat = lat - cam.lat;
      const eastMeters = dLng * 111320 * Math.cos((cam.lat * Math.PI) / 180);
      const southMeters = -dLat * 110574;
      const bearingRad = (cam.bearing * Math.PI) / 180;
      const rx =
        (eastMeters * Math.cos(bearingRad) - southMeters * Math.sin(bearingRad)) /
        mpp;
      const rz =
        (eastMeters * Math.sin(bearingRad) + southMeters * Math.cos(bearingRad)) /
        mpp;
      const gx = width * 0.5 + rx;
      const gy = height * 0.54 + rz * Math.cos(pitchRad);
      return {
        x: gx,
        y: gy - verticalShiftPx,
        groundX: gx,
        groundY: gy,
        mpp
      };
    };

    const projectSiteMetersToScreen = (site: any, dxM: number, altM: number, dzM: number, width: number, height: number) => {
      const [lng, lat] = offsetMetersToLngLat(
        site.lat,
        site.lng,
        dxM,
        dzM,
        site.parcelBearingDeg
      );
      return projectLngLatAltToScreen(lng, lat, altM, width, height);
    };

    const renderOverlay = () => {
      phase += 0.04;
      const canvas = overlayCanvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      if (
        canvas.width !== Math.floor(rect.width * dpr) ||
        canvas.height !== Math.floor(rect.height * dpr)
      ) {
        canvas.width = Math.floor(rect.width * dpr);
        canvas.height = Math.floor(rect.height * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const width = rect.width;
      const height = rect.height;
      ctx.clearRect(0, 0, width, height);

      const zoom = mapInstanceRef.current
        ? mapInstanceRef.current.getZoom()
        : fallbackCameraRef.current.zoom;
      const pitchDeg = mapInstanceRef.current
        ? mapInstanceRef.current.getPitch()
        : fallbackCameraRef.current.pitch;
      const cosPitch = Math.max(0.25, Math.cos((pitchDeg * Math.PI) / 180));

      const gapMeters = explosionFactor * 14;
      const layerAltMeters: Record<string, number> = {
        'layer-1': 0.2,
        'layer-2': 2.0 + gapMeters * 1.0,
        'layer-3': 4.0 + gapMeters * 2.1,
        'layer-4': 6.5 + gapMeters * 3.2
      };

      const isLayerShown = (layerId: string) => {
        if (isolatedLayerId) return isolatedLayerId === layerId;
        return Boolean(visibleLayers[layerId]);
      };

      // 1) DRAW GROUND-LEVEL 50m ACOUSTIC PROXIMITY RING & VERTICAL CAD TETHERS
      if (showGroundCadastralOverlay && zoom > 13.8) {
        const centerGround = projectSiteMetersToScreen(
          currentSite,
          0,
          0,
          0,
          width,
          height
        );
        const radiusPx = Math.max(
          55,
          currentSite.noiseRadiusMeters / Math.max(0.08, centerGround.mpp)
        );

        const noiseExceedsLimit =
          proposalParams.soundDecibels > 65 && !enhancers.cardioidAudio;

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(
          centerGround.x,
          centerGround.y,
          radiusPx,
          radiusPx * cosPitch,
          0,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = noiseExceedsLimit
          ? 'rgba(239, 68, 68, 0.11)'
          : enhancers.cardioidAudio
          ? 'rgba(16, 185, 129, 0.08)'
          : 'rgba(245, 158, 11, 0.07)';
        ctx.fill();
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = noiseExceedsLimit
          ? 'rgba(248, 113, 113, 0.85)'
          : enhancers.cardioidAudio
          ? 'rgba(52, 211, 153, 0.75)'
          : 'rgba(251, 191, 36, 0.75)';
        ctx.stroke();

        // Ground Lot Boundary & Vertical CAD Tethers up to Layer 4
        const halfW = currentSite.parcelDimensionsMeters.width / 2;
        const halfD = currentSite.parcelDimensionsMeters.depth / 2;
        const topAlt = layerAltMeters['layer-4'] + 5;

        const cornersGround = [
          projectSiteMetersToScreen(currentSite, -halfW, 0, -halfD, width, height),
          projectSiteMetersToScreen(currentSite, halfW, 0, -halfD, width, height),
          projectSiteMetersToScreen(currentSite, halfW, 0, halfD, width, height),
          projectSiteMetersToScreen(currentSite, -halfW, 0, halfD, width, height)
        ];
        const cornersTop = [
          projectSiteMetersToScreen(currentSite, -halfW, topAlt, -halfD, width, height),
          projectSiteMetersToScreen(currentSite, halfW, topAlt, -halfD, width, height),
          projectSiteMetersToScreen(currentSite, halfW, topAlt, halfD, width, height),
          projectSiteMetersToScreen(currentSite, -halfW, topAlt, halfD, width, height)
        ];

        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(cornersGround[i].x, cornersGround[i].y);
          ctx.lineTo(cornersTop[i].x, cornersTop[i].y);
          ctx.stroke();

          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(cornersGround[i].x, cornersGround[i].y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 2) DRAW FLOATING AXONOMETRIC LAYER PLATES & CALLOUT LABELS OVER THE 3D CITY MAP
      if (zoom > 14.0) {
        const halfW = currentSite.parcelDimensionsMeters.width / 2;
        const halfD = currentSite.parcelDimensionsMeters.depth / 2;

        currentSite.layers.forEach((layer: any) => {
          if (!isLayerShown(layer.id)) return;
          const alt = layerAltMeters[layer.id];

          const plateCorners = [
            projectSiteMetersToScreen(currentSite, -halfW, alt, -halfD, width, height),
            projectSiteMetersToScreen(currentSite, halfW, alt, -halfD, width, height),
            projectSiteMetersToScreen(currentSite, halfW, alt, halfD, width, height),
            projectSiteMetersToScreen(currentSite, -halfW, alt, halfD, width, height)
          ];

          ctx.save();
          ctx.beginPath();
          plateCorners.forEach((p, idx) =>
            idx === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
          );
          ctx.closePath();
          ctx.fillStyle =
            layer.id === 'layer-1'
              ? 'rgba(30, 41, 59, 0.46)'
              : layer.id === 'layer-2'
              ? 'rgba(2, 132, 199, 0.24)'
              : layer.id === 'layer-3'
              ? 'rgba(217, 119, 6, 0.24)'
              : 'rgba(220, 38, 38, 0.20)';
          ctx.fill();
          ctx.lineWidth = isolatedLayerId === layer.id ? 2.4 : 1.5;
          ctx.strokeStyle = layer.accent;
          ctx.stroke();

          // Internal architectural CAD grid lines on each floating plate
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
          ctx.lineWidth = 0.75;
          for (let step = -0.6; step <= 0.6; step += 0.4) {
            const g1 = projectSiteMetersToScreen(
              currentSite,
              halfW * step,
              alt,
              -halfD,
              width,
              height
            );
            const g2 = projectSiteMetersToScreen(
              currentSite,
              halfW * step,
              alt,
              halfD,
              width,
              height
            );
            ctx.beginPath();
            ctx.moveTo(g1.x, g1.y);
            ctx.lineTo(g2.x, g2.y);
            ctx.stroke();
          }

          // Layer elevation callout tag on left edge
          const labelAnchor = plateCorners[3];
          ctx.fillStyle = 'rgba(12, 15, 22, 0.92)';
          ctx.strokeStyle = layer.accent;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.roundRect(labelAnchor.x - 134, labelAnchor.y - 12, 126, 24, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 10px Inter, system-ui, sans-serif';
          ctx.fillText(
            `${layer.shortCode} · ${layer.title.slice(0, 16)}`,
            labelAnchor.x - 127,
            labelAnchor.y - 1
          );
          ctx.fillStyle = '#94a3b8';
          ctx.font = '9px monospace';
          ctx.fillText(
            `${layer.agencies.join('/')} (${alt.toFixed(1)}m)`,
            labelAnchor.x - 127,
            labelAnchor.y + 9
          );
          ctx.restore();
        });

        // 3) DRAW ANIMATED LAYER 4 ACOUSTIC PROPAGATION CONE & SOFFIT BUFFER WIREFRAME
        if (isLayerShown('layer-4')) {
          const alt4 = layerAltMeters['layer-4'];
          const stagePt = projectSiteMetersToScreen(
            currentSite,
            -5,
            alt4 + 1.2,
            -7,
            width,
            height
          );
          const reachZ = enhancers.cardioidAudio ? 4 : -24;
          const spreadX = enhancers.cardioidAudio ? 9 : 22;
          const coneL = projectSiteMetersToScreen(
            currentSite,
            -5 - spreadX,
            alt4 + 3.2,
            reachZ,
            width,
            height
          );
          const coneR = projectSiteMetersToScreen(
            currentSite,
            -5 + spreadX,
            alt4 + 3.2,
            reachZ,
            width,
            height
          );

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(stagePt.x, stagePt.y);
          ctx.lineTo(coneL.x, coneL.y);
          ctx.lineTo(coneR.x, coneR.y);
          ctx.closePath();
          ctx.fillStyle = enhancers.cardioidAudio
            ? 'rgba(16, 185, 129, 0.36)'
            : 'rgba(239, 68, 68, 0.42)';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = enhancers.cardioidAudio ? '#34d399' : '#f87171';
          ctx.stroke();

          // Animated soundwave wavefronts inside the cone
          for (let w = 1; w <= 3; w++) {
            const t = (w * 0.28 + phase * 0.14) % 1;
            const lx = stagePt.x + (coneL.x - stagePt.x) * t;
            const ly = stagePt.y + (coneL.y - stagePt.y) * t;
            const rx = stagePt.x + (coneR.x - stagePt.x) * t;
            const ry = stagePt.y + (coneR.y - stagePt.y) * t;
            ctx.beginPath();
            ctx.moveTo(lx, ly);
            ctx.lineTo(rx, ry);
            ctx.strokeStyle = enhancers.cardioidAudio
              ? `rgba(110, 231, 183, ${1 - t})`
              : `rgba(252, 165, 165, ${1 - t})`;
            ctx.lineWidth = 1.6;
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      // 4) PROJECT CLICKABLE 3D HOTSPOT PINS ABOVE THE AXONOMETRIC STACK
      const nextHotspots: any[] = [];
      if (zoom > 14.0) {
        currentSite.hotspots.forEach((hs: any) => {
          if (!isLayerShown(hs.layerId)) return;
          const baseAlt = layerAltMeters[hs.layerId] || 0;
          const anchorPt = projectSiteMetersToScreen(
            currentSite,
            hs.posMeters.dx,
            baseAlt + hs.posMeters.dy,
            hs.posMeters.dz,
            width,
            height
          );
          const pinHeadPt = projectSiteMetersToScreen(
            currentSite,
            hs.posMeters.dx,
            baseAlt + hs.posMeters.dy + 4.2,
            hs.posMeters.dz,
            width,
            height
          );

          const isSelected = selectedHotspot?.id === hs.id;
          const isHovered = hoveredHotspotId === hs.id;

          ctx.save();
          ctx.beginPath();
          ctx.moveTo(anchorPt.x, anchorPt.y);
          ctx.lineTo(pinHeadPt.x, pinHeadPt.y);
          ctx.strokeStyle = isSelected ? '#fbbf24' : '#38bdf8';
          ctx.lineWidth = isSelected || isHovered ? 2.4 : 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(anchorPt.x, anchorPt.y, isSelected ? 4.5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = isSelected ? '#fbbf24' : '#38bdf8';
          ctx.fill();
          ctx.restore();

          const isResolvedByEnhancer = hs.enhancerKey
            ? Boolean(enhancers[hs.enhancerKey])
            : false;

          nextHotspots.push({
            ...hs,
            x: pinHeadPt.x,
            y: pinHeadPt.y,
            isSelected,
            isResolvedByEnhancer
          });
        });
      }

      setProjectedHotspots(nextHotspots);
      ctx.restore();
    };

    animId = requestAnimationFrame(function loop() {
      renderOverlay();
      animId = requestAnimationFrame(loop);
    });

    return () => cancelAnimationFrame(animId);
  }, [
    mapLibreReady,
    currentSite,
    explosionFactor,
    isolatedLayerId,
    visibleLayers,
    showGroundCadastralOverlay,
    enhancers,
    proposalParams,
    selectedHotspot,
    hoveredHotspotId
  ]);

  // ============================================================================
  // 7. COMPUTED READINESS, ANTI-DOUBLE-DIPPING AUDIT & STATUTORY MATRIX
  // ============================================================================

  const computedAudit = useMemo(() => {
    let score = currentSite.baseReadiness;
    STRATEGIC_ENHANCERS.forEach((enh) => {
      if (enhancers[enh.key]) score += enh.readinessBoost;
    });

    // Dynamic parameter stress-test penalties/bonuses
    const paramAlerts = [];
    if (proposalParams.maxStructureHeightM > 1.5 && !enhancers.lowProfileMurals) {
      score -= 8;
      paramAlerts.push({
        id: 'p-height',
        agency: 'BCA & SCDF',
        rule: `Structure height (${proposalParams.maxStructureHeightM}m) exceeds 1.5m exemption limit`,
        impact: 'Triggers mandatory BCA Professional Engineer (PE) structural submission.'
      });
    }
    if (proposalParams.soundDecibels > 65 && !enhancers.cardioidAudio) {
      score -= 9;
      paramAlerts.push({
        id: 'p-sound',
        agency: 'SPF PLRD & NEA',
        rule: `Projected sound (${proposalParams.soundDecibels} dBA) exceeds 65 dBA residential boundary limit`,
        impact: 'High risk of SPF Public Entertainment Licence rejection or 21:00 curfew.'
      });
    }
    if (proposalParams.crowdSize > 200) {
      paramAlerts.push({
        id: 'p-crowd',
        agency: 'SCDF & SPF',
        rule: `Crowd capacity (${proposalParams.crowdSize} pax) exceeds 200 pax threshold`,
        impact: 'Requires dedicated SCDF Fire Safety Manager & crowd marshals.'
      });
    }
    if (proposalParams.foodStallsCount > 0 && !enhancers.potableWaterUnit) {
      score -= 6;
      paramAlerts.push({
        id: 'p-food',
        agency: 'SFA & PUB',
        rule: `${proposalParams.foodStallsCount} F&B stall(s) planned on unserviced State land`,
        impact: 'Requires portable potable water tank & sealed sullage haulage contract.'
      });
    }

    score = Math.max(25, Math.min(98, score));

    // Grant allocation & double-dipping detection
    let totalCost = 0;
    let nacClaimed = 0;
    let mccyClaimed = 0;
    let selfFunded = 0;
    const grantConflicts = [];

    currentSite.budgetItems.forEach((item: any) => {
      totalCost += item.cost;
      const assigned = budgetAllocations[item.id] || item.assignedGrant;
      if (!item.allowedGrants.includes(assigned)) {
        grantConflicts.push({
          itemId: item.id,
          component: item.component,
          reason: `Ineligible assignment to ${GRANT_PROGRAMS[assigned]?.name}. ${item.ruleNote}`
        });
      }
      if (assigned === 'NAC_PP') {
        const claim = Math.round(item.cost * 0.7);
        nacClaimed += claim;
        selfFunded += item.cost - claim;
      } else if (assigned === 'MCCY_OURSG') {
        const rate = enhancers.cccEndorsement ? 0.8 : 0.65;
        const claim = Math.round(item.cost * rate);
        mccyClaimed += claim;
        selfFunded += item.cost - claim;
      } else {
        selfFunded += item.cost;
      }
    });

    if (simulateDoubleDipConflict) {
      grantConflicts.push({
        itemId: 'b2',
        component: '0.5m Modular Timber Stage & Cardioid Acoustic Array Rental',
        reason:
          'CRITICAL OVERLAP: Line item simultaneously claimed under both NAC P&P Grant (70%) and MCCY OurSG Fund (80%). Singapore public grant rules strictly prohibit double-dipping on identical expenditure items.'
      });
    }

    // Verified vs Assumptions & Gaps Matrix
    const matrixItems = [
      {
        id: 'm-sla',
        status: 'VERIFIED RULE',
        agency: 'SLA (State Lands Act)',
        title: `Temporary Occupation Licence (TOL) on ${currentSite.code}`,
        detail: 'Short-term rental of vacant State land requires TOL application 10–12 weeks ahead via SPIO.',
        source: 'SLA Short-Term Rental Guidance'
      },
      {
        id: 'm-lta',
        status: 'VERIFIED RULE',
        agency: 'LTA (Street Works Act)',
        title: '3.0m Viaduct Soffit & 1.5m Pier Inspection Buffer',
        detail: 'Zero mechanical drilling into flyover columns; unobstructed structural inspection envelope.',
        source: 'LTA Code of Practice for Works on Public Streets'
      },
      {
        id: 'm-grant',
        status: grantConflicts.length === 0 ? 'VERIFIED RULE' : 'CRITICAL GAP',
        agency: 'OurSG Grants (NAC & MCCY)',
        title: 'Non-Overlapping Co-Funding Line-Item Partition',
        detail:
          grantConflicts.length === 0
            ? 'Artist fees isolated to NAC P&P; resident workshops isolated to MCCY OurSG.'
            : `${grantConflicts.length} grant overlap/ineligibility conflict(s) detected in budget table.`,
        source: 'OurSG Grants Portal Terms & Conditions'
      },
      {
        id: 'm-audio',
        status: enhancers.cardioidAudio ? 'VERIFIED RULE' : 'CRITICAL GAP',
        agency: 'SPF PLRD & NEA',
        title: `Acoustic Spill Control (${currentSite.nearestResidential})`,
        detail: enhancers.cardioidAudio
          ? 'Cardioid directional speaker array caps residential boundary noise below 65 dBA.'
          : 'Unverified assumption that viaduct soffit will not reflect >75 dBA sound into nearby HDB blocks.',
        source: 'SPF Public Entertainment Licence Conditions'
      },
      {
        id: 'm-water',
        status: enhancers.potableWaterUnit ? 'VERIFIED RULE' : 'ASSUMPTION',
        agency: 'SFA & PUB',
        title: 'Potable Water & Sullage Containment on Vacant Land',
        detail: enhancers.potableWaterUnit
          ? 'Self-contained potable + greywater skid specified for zero sullage discharge.'
          : 'Proposal assumes water utility access on State land where no PUB tap or sewer exists.',
        source: 'SFA Temporary Fair Permit Guidelines'
      },
      {
        id: 'm-bca',
        status: enhancers.lowProfileMurals ? 'VERIFIED RULE' : 'ASSUMPTION',
        agency: 'BCA & SCDF',
        title: 'Freestanding Structure Height (<1.5m PE Exemption)',
        detail: enhancers.lowProfileMurals
          ? 'All mural frames capped at 1.45m with certified ballast; exempt from BCA PE submission.'
          : 'Tall unbraced panels risk wind-tunnel tipping beneath viaduct and trigger BCA PE review.',
        source: 'Building Control (Temporary Buildings) Regulations'
      }
    ];

    return {
      readinessScore: grantConflicts.length > 0 ? Math.max(30, score - 15) : score,
      totalCost,
      nacClaimed,
      mccyClaimed,
      selfFunded,
      grantConflicts,
      paramAlerts,
      matrixItems
    };
  }, [currentSite, enhancers, proposalParams, budgetAllocations, simulateDoubleDipConflict]);

  // ============================================================================
  // 8. CAMERA FLY-TO & SITE SELECTION HANDLERS
  // ============================================================================

  const flyToCamera = useCallback((lng: number, lat: number, zoom: number, pitch: number, bearing: number) => {
    fallbackCameraRef.current = { lng, lat, zoom, pitch, bearing };
    setCameraTelemetry({ lng, lat, zoom, pitch, bearing });
    const map = mapInstanceRef.current;
    if (map) {
      try {
        map.flyTo({
          center: [lng, lat],
          zoom,
          pitch,
          bearing,
          duration: 1200,
          essential: true
        });
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const handleSelectSite = useCallback(
    (siteId: string) => {
      if (siteId === 'macro_island') {
        setActiveCameraPreset('macroIsland');
        flyToCamera(103.8198, 1.3521, 11.6, 38, -12);
        return;
      }
      const nextSite = SITES_DATA[siteId];
      if (!nextSite) return;
      setSelectedSiteId(siteId);
      setSelectedHotspotId(nextSite.hotspots[0]?.id || null);
      setIsolatedLayerId(null);
      setActiveCameraPreset('axonometric');
      flyToCamera(nextSite.lng, nextSite.lat, 17.8, 60, -28);
      if (onSiteSelect) onSiteSelect(nextSite);
    },
    [flyToCamera, onSiteSelect]
  );

  const handleApplyCameraPreset = (presetKey: string) => {
    const p = CAMERA_PRESETS[presetKey];
    if (!p) return;
    setActiveCameraPreset(presetKey);
    if (presetKey === 'macroIsland') {
      flyToCamera(103.8198, 1.3521, p.zoom, p.pitch, p.bearing);
    } else {
      flyToCamera(currentSite.lng, currentSite.lat, p.zoom, p.pitch, p.bearing);
    }
  };

  const handleFocusWorkplanStep = (stepItem: any) => {
    if (stepItem.targetHotspotId) {
      setSelectedHotspotId(stepItem.targetHotspotId);
      setActiveRightTab('inspector');
    }
    const hs = currentSite.hotspots.find((h: any) => h.id === stepItem.targetHotspotId);
    if (hs) {
      const [lng, lat] = offsetMetersToLngLat(
        currentSite.lat,
        currentSite.lng,
        hs.posMeters.dx,
        hs.posMeters.dz,
        currentSite.parcelBearingDeg
      );
      flyToCamera(lng, lat, 18.2, 62, -24);
    }
  };

  const handleFixAllGrantConflicts = () => {
    setSimulateDoubleDipConflict(false);
    const cleanMap: Record<string, string> = {};
    currentSite.budgetItems.forEach((item: any) => {
      cleanMap[item.id] = item.assignedGrant;
    });
    setBudgetAllocations(cleanMap);
  };

  // --- TEAMMATE INTEGRATION PAYLOAD & EVENT BUS ---
  const integrationPayload = useMemo(() => {
    return {
      schema: 'heartlah-arts-to-places-sg-v4',
      timestamp: new Date().toISOString(),
      site: {
        id: currentSite.id,
        code: currentSite.code,
        name: currentSite.name,
        wgs84: { lat: currentSite.lat, lng: currentSite.lng },
        svy21: currentSite.svy21
      },
      axonometricState: {
        basemapStyleId,
        explosionFactor,
        isolatedLayerId,
        visibleLayers,
        camera: cameraTelemetry
      },
      selectedHotspot: selectedHotspot
        ? {
            id: selectedHotspot.id,
            number: selectedHotspot.number,
            title: selectedHotspot.title,
            agency: selectedHotspot.agency,
            timing: selectedHotspot.timing
          }
        : null,
      proposalParameters: proposalParams,
      enhancers,
      audit: {
        readinessScore: computedAudit.readinessScore,
        totalCost: computedAudit.totalCost,
        nacClaimed: computedAudit.nacClaimed,
        mccyClaimed: computedAudit.mccyClaimed,
        selfFunded: computedAudit.selfFunded,
        doubleDippingConflicts: computedAudit.grantConflicts.length
      }
    };
  }, [
    currentSite,
    basemapStyleId,
    explosionFactor,
    isolatedLayerId,
    visibleLayers,
    cameraTelemetry,
    selectedHotspot,
    proposalParams,
    enhancers,
    computedAudit
  ]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('artsToPlaces:stateChange', { detail: integrationPayload })
    );
    if (onStateChange) onStateChange(integrationPayload);
  }, [integrationPayload, onStateChange]);

  // Listen for external teammate commands
  useEffect(() => {
    const onExternalCmd = (e: any) => {
      const cmd = e.detail || {};
      if (cmd.action === 'SELECT_SITE' && SITES_DATA[cmd.siteId]) {
        handleSelectSite(cmd.siteId);
      } else if (cmd.action === 'SET_EXPLOSION' && typeof cmd.value === 'number') {
        setExplosionFactor(Math.max(0, Math.min(1, cmd.value)));
      } else if (cmd.action === 'TOGGLE_ENHANCER' && cmd.key in enhancers) {
        setEnhancers((p) => ({ ...p, [cmd.key]: !p[cmd.key] }));
      } else if (cmd.action === 'ISOLATE_LAYER') {
        setIsolatedLayerId(cmd.layerId || null);
      }
    };
    window.addEventListener('artsToPlaces:externalCommand', onExternalCmd);
    return () => window.removeEventListener('artsToPlaces:externalCommand', onExternalCmd);
  }, [enhancers, handleSelectSite]);

  const handleCopyApiSnippet = () => {
    const code = `// Listen to live HeartLah Arts to Places SG state updates:
window.addEventListener('artsToPlaces:stateChange', (e) => {
  console.log('Site:', e.detail.site, 'Readiness:', e.detail.audit.readinessScore);
});

// Dispatch commands into the HeartLah 3D Map:
window.dispatchEvent(new CustomEvent('artsToPlaces:externalCommand', {
  detail: { action: 'SELECT_SITE', siteId: 'queensway' }
}));`;
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  // ============================================================================
  // 9. EXACT MONOLITH TEMPLATE DOM STRUCTURE & DARK ARCHITECTURAL STYLING
  // ============================================================================

  return (
    <div className="relative w-full h-screen bg-[#090b10] text-[#e2e8f0] flex flex-col overflow-hidden font-sans select-none">
      {/* Embedded Monolith Scoped CSS for Dark Filter & Scrollbars */}
      <style>{`
        .monolith-dark-tiles .maplibregl-canvas {
          filter: invert(0.92) hue-rotate(185deg) brightness(0.92) contrast(1.12) saturate(0.35);
        }
        .monolith-scroll::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .monolith-scroll::-webkit-scrollbar-track {
          background: #090b10;
        }
        .monolith-scroll::-webkit-scrollbar-thumb {
          background: #1e2532;
          border-radius: 3px;
        }
      `}</style>

      {/* ===================================================================== */}
      {/* 1. MONOLITH SIGNATURE LOADING SCREEN OVERLAY                          */}
      {/* ===================================================================== */}
      {isLoadingBoot && (
        <div className="fixed inset-0 z-50 bg-[#090b10] flex flex-col items-center justify-center transition-opacity duration-500">
          <div className="flex items-end gap-1.5 mb-4 h-9">
            <span className="w-2 h-5 bg-amber-400 rounded-sm animate-pulse" />
            <span className="w-2 h-9 bg-white rounded-sm animate-pulse" />
            <span className="w-2 h-6 bg-sky-400 rounded-sm animate-pulse" />
          </div>
          <div className="text-lg font-bold tracking-[0.22em] uppercase text-white mb-1">
            HeartLah
          </div>
          <div className="text-xs font-mono text-slate-400 mb-4">
            {loadingStepText}
          </div>
          <div className="w-48 h-0.5 bg-slate-800 overflow-hidden rounded-full">
            <div className="h-full bg-amber-400 w-3/4 animate-pulse" />
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. HEARTLAH TOP <header>                                              */}
      {/* ===================================================================== */}
      <header className="h-12 shrink-0 bg-[#0c0f16] border-b border-[#1e2430] px-3.5 flex items-center justify-between z-30">
        {/* Left: 3-Bar HeartLah Emblem + Title + Divider + Site Selector */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-end gap-[3px] h-4">
              <span className="w-[3px] h-2.5 bg-amber-400 rounded-[1px]" />
              <span className="w-[3px] h-4 bg-white rounded-[1px]" />
              <span className="w-[3px] h-3 bg-sky-400 rounded-[1px]" />
            </div>
            <span className="font-bold text-sm tracking-[0.14em] uppercase text-white">
              HeartLah
            </span>
          </div>

          <div className="h-4 w-[1px] bg-[#1e2430]" />

          <span className="text-xs text-slate-400 hidden xl:inline truncate">
            Arts to Places SG
          </span>

          {/* Quick Site Selector Dropdown */}
          <select
            value={
              activeCameraPreset === 'macroIsland' ? 'macro_island' : selectedSiteId
            }
            onChange={(e) => handleSelectSite(e.target.value)}
            className="bg-[#121722] border border-[#262f40] hover:border-amber-400/60 text-xs font-medium text-slate-200 rounded-md px-2.5 py-1 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            {Object.values(SITES_DATA).map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
            <option value="macro_island">
              Whole island
            </option>
          </select>
        </div>

        {/* Center <nav>: Monolith Workspace Mode Pills */}
        <nav className="hidden md:flex items-center gap-1 bg-[#121722] p-1 rounded-lg border border-[#1e2430]">
          {[
            { id: 'city', label: '3D map' },
            { id: 'workplan', label: 'Workplan' },
            { id: 'grants', label: 'Funding' },
            { id: 'dossier', label: 'Dossier' }
          ].map((navItem) => (
            <button
              key={navItem.id}
              onClick={() => setActiveNavMode(navItem.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activeNavMode === navItem.id
                  ? 'bg-[#1e2638] text-amber-400 border border-amber-400/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {navItem.label}
            </button>
          ))}
        </nav>

        {/* Right: Readiness Badge, Dossier Print Trigger & Signature Gemini Pill */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-[#121722] border border-[#1e2430] px-2.5 py-1 rounded-md">
            <span className="text-[10px] font-mono uppercase text-slate-400">
              Readiness
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                computedAudit.readinessScore >= 80
                  ? 'text-emerald-400'
                  : computedAudit.readinessScore >= 60
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {computedAudit.readinessScore}%
            </span>
          </div>

          <button
            onClick={() => setActiveNavMode(activeNavMode === 'dossier' ? 'city' : 'dossier')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
          >
            <Printer size={13} />
            <span className="hidden sm:inline">PDF</span>
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* 3. MONOLITH MAIN 4-COLUMN WORKSPACE SHELL                             */}
      {/* ===================================================================== */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* ------------------------------------------------------------------- */}
        {/* 3A. LEFT <aside> — MONOLITH ICON RAIL (4 TOOLS + SPACER + API)      */}
        {/* ------------------------------------------------------------------- */}
        <aside className="w-12 shrink-0 bg-[#0c0f16] border-r border-[#1e2430] flex flex-col items-center py-3 z-20">
          {[
            {
              id: 'layers',
              title: 'Layers & map style',
              icon: Layers
            },
            {
              id: 'workplan',
              title: 'Workplan',
              icon: Clock
            },
            {
              id: 'grants',
              title: 'Funding',
              icon: DollarSign
            },
            {
              id: 'params',
              title: 'Test your plan',
              icon: SlidersHorizontal
            }
          ].map((tool) => {
            const Icon = tool.icon;
            const isActive = isLeftDrawerOpen && activeLeftRailTool === tool.id;
            return (
              <button
                key={tool.id}
                title={tool.title}
                onClick={() => {
                  if (activeLeftRailTool === tool.id) {
                    setIsLeftDrawerOpen(!isLeftDrawerOpen);
                  } else {
                    setActiveLeftRailTool(tool.id);
                    setIsLeftDrawerOpen(true);
                  }
                }}
                className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-[#161c28]'
                }`}
              >
                <Icon size={17} />
              </button>
            );
          })}

          {/* Monolith flex spacer */}
          <div className="flex-1" />

          {/* Bottom Icon: Teammate Backend & API Bridge */}
          <button
            title="Teammate API"
            onClick={() => {
              if (activeLeftRailTool === 'api') {
                setIsLeftDrawerOpen(!isLeftDrawerOpen);
              } else {
                setActiveLeftRailTool('api');
                setIsLeftDrawerOpen(true);
              }
            }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              isLeftDrawerOpen && activeLeftRailTool === 'api'
                ? 'bg-purple-500 text-white shadow-md'
                : 'text-slate-400 hover:text-purple-300 hover:bg-[#161c28]'
            }`}
          >
            <Code2 size={17} />
          </button>
        </aside>

        {/* ------------------------------------------------------------------- */}
        {/* 3B. LEFT <section> — COLLAPSIBLE MONOLITH CONTEXT DRAWER            */}
        {/* ------------------------------------------------------------------- */}
        {isLeftDrawerOpen && (
          <section className="w-80 lg:w-[350px] shrink-0 bg-[#0e121b]/95 backdrop-blur-md border-r border-[#1e2430] flex flex-col z-20 overflow-hidden">
            {/* Drawer Header */}
            <div className="h-10 px-3.5 border-b border-[#1e2430] flex items-center justify-between bg-[#0c0f16]">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold">
                {activeLeftRailTool === 'layers' && 'Layers'}
                {activeLeftRailTool === 'workplan' && 'Workplan'}
                {activeLeftRailTool === 'grants' && 'Funding'}
                {activeLeftRailTool === 'params' && 'Test your plan'}
                {activeLeftRailTool === 'api' && 'Teammate API'}
              </span>
              <button
                onClick={() => setIsLeftDrawerOpen(false)}
                className="p-1 rounded hover:bg-[#1a202c] text-slate-400 hover:text-white"
                title="Collapse panel"
              >
                <ChevronLeft size={15} />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="flex-1 overflow-y-auto monolith-scroll p-3.5 space-y-4">
              {/* ============================================================= */}
              {/* TOOL 1: 4-LAYER EXPLODED AXONOMETRIC & OPENFREEMAP CONTROLS   */}
              {/* ============================================================= */}
              {activeLeftRailTool === 'layers' && (
                <>
                  {/* Parcel Telemetry Card */}
                  <div className="bg-[#121722] border border-[#1e2430] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-amber-400 uppercase">
                        {currentSite.code}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {currentSite.lat.toFixed(4)}°N, {currentSite.lng.toFixed(4)}°E
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white mb-1">
                      {currentSite.projectTitle}
                    </div>
                    <p className="line-clamp-3 text-[11px] text-slate-400 leading-relaxed mb-2">
                      {currentSite.summary}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
                      <div className="bg-[#0c0f16] border border-[#1e2430] px-2 py-1 rounded text-slate-300">
                        SVY21: {Math.round(currentSite.svy21.x)}E, {Math.round(currentSite.svy21.y)}N
                      </div>
                      <div className="bg-[#0c0f16] border border-[#1e2430] px-2 py-1 rounded text-sky-300 truncate">
                        {currentSite.tenure.split('+')[0]}
                      </div>
                    </div>
                  </div>

                  {/* Vertical Explosion Slider */}
                  <div className="bg-[#121722] border border-[#1e2430] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Sliders size={13} className="text-amber-400" />
                        Layer spacing
                      </span>
                      <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {Math.round(explosionFactor * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.02"
                      value={explosionFactor}
                      onChange={(e) => setExplosionFactor(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-[#090b10] rounded-lg accent-amber-400 cursor-pointer mb-2"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <button
                        onClick={() => setExplosionFactor(0)}
                        className="hover:text-white"
                      >
                        Flat
                      </button>
                      <button
                        onClick={() => setExplosionFactor(0.5)}
                        className="hover:text-white"
                      >
                        Mid
                      </button>
                      <button
                        onClick={() => setExplosionFactor(1)}
                        className="hover:text-white"
                      >
                        Spread
                      </button>
                    </div>
                  </div>

                  {/* 4 Exploded Axonometric Layers Stack */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 px-0.5">
                      <span>Layers</span>
                      {isolatedLayerId && (
                        <button
                          onClick={() => setIsolatedLayerId(null)}
                          className="text-amber-400 hover:underline"
                        >
                          Show all
                        </button>
                      )}
                    </div>

                    {[...currentSite.layers].reverse().map((layer) => {
                      const isSolo = isolatedLayerId === layer.id;
                      const isVis = visibleLayers[layer.id];
                      return (
                        <div
                          key={layer.id}
                          className={`p-2.5 rounded-lg border transition-all ${
                            isSolo
                              ? 'bg-[#1a2232] border-amber-400'
                              : isVis
                              ? 'bg-[#121722] border-[#1e2430] hover:border-slate-700'
                              : 'bg-[#0c0f16] border-[#161b24] opacity-50'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div
                              onClick={() =>
                                setIsolatedLayerId(isSolo ? null : layer.id)
                              }
                              className="flex items-center gap-2 flex-1 cursor-pointer min-w-0"
                            >
                              <span
                                className="w-2.5 h-6 rounded-sm shrink-0"
                                style={{ backgroundColor: layer.accent }}
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono font-bold px-1.5 bg-[#090b10] text-slate-300 rounded">
                                    {layer.shortCode}
                                  </span>
                                  <span className="text-xs font-semibold text-white truncate">
                                    {layer.title}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-400 truncate">
                                  {layer.agencies.join(' · ')} ({layer.elevationLabel})
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  setIsolatedLayerId(isSolo ? null : layer.id)
                                }
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                                  isSolo
                                    ? 'bg-amber-400 text-slate-950'
                                    : 'bg-[#0c0f16] text-slate-400 hover:text-white'
                                }`}
                              >
                                {isSolo ? 'SOLO' : 'Solo'}
                              </button>
                              <button
                                onClick={() =>
                                  setVisibleLayers((p) => ({
                                    ...p,
                                    [layer.id]: !p[layer.id]
                                  }))
                                }
                                className="p-1 rounded bg-[#0c0f16] text-slate-400 hover:text-white"
                              >
                                {isVis ? <Eye size={13} /> : <EyeOff size={13} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* OpenFreeMap & 3D City Extrusion Settings */}
                  <div className="bg-[#121722] border border-[#1e2430] rounded-lg p-3 space-y-2.5">
                    <div className="text-[10px] font-mono uppercase text-slate-400">
                      Map style
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {Object.values(OPENFREEMAP_STYLES).map((st) => (
                        <button
                          key={st.id}
                          onClick={() => handleSelectBasemapStyle(st.id)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium border transition-all ${
                            basemapStyleId === st.id
                              ? 'bg-sky-500/15 text-sky-300 border-sky-400/50'
                              : 'bg-[#0c0f16] text-slate-400 border-[#1e2430] hover:text-white'
                          }`}
                        >
                          <span className="truncate">{st.name}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#121722] text-slate-300">
                            {st.badge}
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span className="text-slate-300">3D buildings</span>
                      <button
                        onClick={() => setShowOsmBuildings3D(!showOsmBuildings3D)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold ${
                          showOsmBuildings3D
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-[#0c0f16] text-slate-500 border border-[#1e2430]'
                        }`}
                      >
                        {showOsmBuildings3D ? 'EXTRUDED ON' : 'OFF'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300">Noise ring & lot</span>
                      <button
                        onClick={() =>
                          setShowGroundCadastralOverlay(!showGroundCadastralOverlay)
                        }
                        className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold ${
                          showGroundCadastralOverlay
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-[#0c0f16] text-slate-500 border border-[#1e2430]'
                        }`}
                      >
                        {showGroundCadastralOverlay ? 'VISIBLE' : 'HIDDEN'}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ============================================================= */}
              {/* TOOL 2: SEQUENCED AGENCY WORKPLAN (WHOM, WHEN, WHY)           */}
              {/* ============================================================= */}
              {activeLeftRailTool === 'workplan' && (
                <div className="space-y-3">
                  <div className="bg-[#121722] border border-[#1e2430] rounded-lg p-3 text-[11px] text-slate-300 leading-relaxed">
                    Click any statutory step below to fly the 3D MapLibre camera directly to that spatial envelope on <strong>{currentSite.code}</strong>.
                  </div>

                  <div className="relative pl-3.5 border-l border-[#262f40] space-y-2.5">
                    {currentSite.workplan.map((w: any) => {
                      const isCleared = w.linkedEnhancer
                        ? Boolean(enhancers[w.linkedEnhancer])
                        : true;
                      return (
                        <div
                          key={w.step}
                          onClick={() => handleFocusWorkplanStep(w)}
                          className="relative bg-[#121722] hover:bg-[#182030] border border-[#1e2430] hover:border-amber-400/50 rounded-lg p-3 cursor-pointer transition-all"
                        >
                          <span
                            className={`absolute -left-[19px] top-3.5 w-2.5 h-2.5 rounded-full border-2 border-[#090b10] ${
                              isCleared ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                          />
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-[10px] font-mono font-bold text-amber-400">
                              STEP {w.step} · {w.window}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                                isCleared
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {isCleared ? 'READY' : w.status}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-white mb-0.5">
                            {w.licence}
                          </div>
                          <div className="text-[11px] text-sky-300 font-medium mb-1">
                            {w.agency}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed mb-1.5">
                            <strong className="text-slate-200">Why:</strong> {w.why}
                          </p>
                          <div className="text-[10px] font-mono text-slate-400 bg-[#090b10] px-2 py-1 rounded">
                            Prerequisite: {w.dependency}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* TOOL 3: FUNDING SHORTLIST & ANTI-DOUBLE-DIPPING CALCULATOR    */}
              {/* ============================================================= */}
              {activeLeftRailTool === 'grants' && (
                <div className="space-y-3">
                  {/* Grant Totals Summary */}
                  <div className="bg-[#121722] border border-[#1e2430] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase text-slate-400">
                        Total Budget: ${computedAudit.totalCost.toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          computedAudit.grantConflicts.length === 0
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {computedAudit.grantConflicts.length === 0
                          ? '0 Double-Dipping'
                          : `${computedAudit.grantConflicts.length} Overlap Flag`}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 text-center mb-2.5">
                      <div className="bg-[#0c0f16] p-2 rounded border border-[#1e2430]">
                        <div className="text-[9px] text-slate-400">NAC P&P (70%)</div>
                        <div className="text-xs font-mono font-bold text-amber-400">
                          ${computedAudit.nacClaimed.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-[#0c0f16] p-2 rounded border border-[#1e2430]">
                        <div className="text-[9px] text-slate-400">MCCY OurSG</div>
                        <div className="text-xs font-mono font-bold text-sky-400">
                          ${computedAudit.mccyClaimed.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-[#0c0f16] p-2 rounded border border-[#1e2430]">
                        <div className="text-[9px] text-slate-400">Co-Fund / Self</div>
                        <div className="text-xs font-mono font-bold text-slate-200">
                          ${computedAudit.selfFunded.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Test Double-Dipping Guardrail Button */}
                    <div className="flex gap-1.5">
                      <button
                        onClick={() =>
                          setSimulateDoubleDipConflict(!simulateDoubleDipConflict)
                        }
                        className={`flex-1 py-1.5 px-2 rounded text-[10px] font-mono font-semibold border transition-colors ${
                          simulateDoubleDipConflict
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                            : 'bg-[#0c0f16] text-slate-300 border-[#262f40] hover:border-amber-400'
                        }`}
                      >
                        {simulateDoubleDipConflict
                          ? 'Overlap Violation Active'
                          : 'Test Overlap Guardrail'}
                      </button>
                      {computedAudit.grantConflicts.length > 0 && (
                        <button
                          onClick={handleFixAllGrantConflicts}
                          className="py-1.5 px-2.5 rounded text-[10px] font-mono font-bold bg-emerald-500 text-slate-950"
                        >
                          Auto-Fix
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Interactive Line-Item Grant Selector Cards */}
                  <div className="space-y-2">
                    {currentSite.budgetItems.map((item: any) => {
                      const currentGrant =
                        budgetAllocations[item.id] || item.assignedGrant;
                      const isAllowed = item.allowedGrants.includes(currentGrant);
                      return (
                        <div
                          key={item.id}
                          className={`bg-[#121722] border rounded-lg p-2.5 text-xs ${
                            !isAllowed
                              ? 'border-rose-500/70 bg-rose-950/20'
                              : 'border-[#1e2430]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="font-semibold text-white leading-snug">
                              {item.component}
                            </span>
                            <span className="font-mono text-amber-400 font-bold shrink-0">
                              ${item.cost.toLocaleString()}
                            </span>
                          </div>

                          <select
                            value={currentGrant}
                            onChange={(e) =>
                              setBudgetAllocations((p) => ({
                                ...p,
                                [item.id]: e.target.value
                              }))
                            }
                            className="w-full bg-[#090b10] border border-[#262f40] rounded px-2 py-1 text-[11px] text-sky-300 mb-1.5 focus:outline-none"
                          >
                            {Object.values(GRANT_PROGRAMS).map((gp) => (
                              <option key={gp.id} value={gp.id}>
                                {gp.name}
                              </option>
                            ))}
                          </select>

                          <div className="text-[10px] text-slate-400 leading-relaxed">
                            {item.ruleNote}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* TOOL 4: PROPOSAL PARAMETERS & GEMINI AI STRESS-TEST           */}
              {/* ============================================================= */}
              {activeLeftRailTool === 'params' && (
                <div className="space-y-3">
                  <div className="bg-[#121722] border border-[#1e2430] rounded-lg p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Activity size={14} className="text-emerald-400" />
                        Test your plan
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">
                        Rules
                      </span>
                    </div>

                    {/* Crowd Size Slider */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-300">Crowd size</span>
                        <span className="font-mono text-amber-400">
                          {proposalParams.crowdSize} pax
                        </span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="500"
                        step="10"
                        value={proposalParams.crowdSize}
                        onChange={(e) =>
                          setProposalParams((p) => ({
                            ...p,
                            crowdSize: parseInt(e.target.value, 10)
                          }))
                        }
                        className="w-full h-1.5 bg-[#090b10] rounded-lg accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Structure Height Slider */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-300">Structure height</span>
                        <span
                          className={`font-mono ${
                            proposalParams.maxStructureHeightM > 1.5
                              ? 'text-rose-400 font-bold'
                              : 'text-emerald-400'
                          }`}
                        >
                          {proposalParams.maxStructureHeightM.toFixed(2)}m (BCA Limit: 1.50m)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.8"
                        max="3.2"
                        step="0.05"
                        value={proposalParams.maxStructureHeightM}
                        onChange={(e) =>
                          setProposalParams((p) => ({
                            ...p,
                            maxStructureHeightM: parseFloat(e.target.value)
                          }))
                        }
                        className="w-full h-1.5 bg-[#090b10] rounded-lg accent-amber-400 cursor-pointer"
                      />
                    </div>

                    {/* Sound Decibels Slider */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-300">Sound level</span>
                        <span
                          className={`font-mono ${
                            proposalParams.soundDecibels > 65
                              ? 'text-rose-400 font-bold'
                              : 'text-emerald-400'
                          }`}
                        >
                          {proposalParams.soundDecibels} dBA (Limit: 65 dBA)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="85"
                        step="1"
                        value={proposalParams.soundDecibels}
                        onChange={(e) =>
                          setProposalParams((p) => ({
                            ...p,
                            soundDecibels: parseInt(e.target.value, 10)
                          }))
                        }
                        className="w-full h-1.5 bg-[#090b10] rounded-lg accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Triggered Threshold Alerts */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-mono uppercase text-slate-400">
                      Real-Time Statutory Threshold Audit ({computedAudit.paramAlerts.length})
                    </div>
                    {computedAudit.paramAlerts.length === 0 ? (
                      <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-lg p-3 text-xs text-emerald-200 flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                        All values are within the limits this model checks.
                      </div>
                    ) : (
                      computedAudit.paramAlerts.map((al) => (
                        <div
                          key={al.id}
                          className="bg-rose-950/30 border border-rose-500/40 rounded-lg p-2.5 text-xs"
                        >
                          <div className="font-mono text-[10px] text-rose-300 mb-0.5">
                            {al.agency}
                          </div>
                          <div className="font-bold text-white mb-0.5">{al.rule}</div>
                          <div className="text-[11px] text-slate-300">{al.impact}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================= */}
              {/* TOOL 5: TEAMMATE BACKEND / API INTEGRATION BRIDGE             */}
              {/* ============================================================= */}
              {activeLeftRailTool === 'api' && (
                <div className="space-y-3">
                  <div className="bg-[#121722] border border-purple-500/40 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-purple-300">
                        Event Bus (`artsToPlaces:stateChange`)
                      </span>
                      <button
                        onClick={handleCopyApiSnippet}
                        className="px-2 py-1 rounded bg-purple-500 text-slate-950 font-bold text-[10px] flex items-center gap-1"
                      >
                        {copiedSnippet ? <Check size={11} /> : <Copy size={11} />}
                        {copiedSnippet ? 'Copied' : 'Copy Hook'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">
                      The map sends its state to the other layers through this event.
                    </p>
                    <pre className="text-[10px] font-mono text-emerald-300 bg-[#090b10] p-2.5 rounded border border-[#1e2430] overflow-x-auto max-h-64">
                      {JSON.stringify(integrationPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* 3C. CENTER <main> — FULL-BLEED MAPLIBRE GL 3D CITY + AXONOMETRIC    */}
        {/* ------------------------------------------------------------------- */}
        <main
          className={`relative flex-1 bg-[#090b10] overflow-hidden ${
            currentBasemap.isDarkFilter ? 'monolith-dark-tiles' : ''
          }`}
        >
          {/* MapLibre GL WebGL City Container */}
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

          {/* Synchronized 60fps 3D Axonometric Wireframe, Cones & Leader Overlay */}
          <canvas
            ref={overlayCanvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />

          {/* Interactive 3D Hotspot Pins Anchored to Axonometric Stack */}
          {projectedHotspots.map((pin) => {
            const isCritical =
              pin.verificationType === 'CRITICAL GAP' && !pin.isResolvedByEnhancer;
            return (
              <button
                key={pin.id}
                onClick={() => {
                  setSelectedHotspotId(pin.id);
                  setActiveRightTab('inspector');
                  if (onHotspotSelect) onHotspotSelect(pin);
                }}
                onMouseEnter={() => setHoveredHotspotId(pin.id)}
                onMouseLeave={() => setHoveredHotspotId(null)}
                style={{
                  transform: `translate3d(${pin.x}px, ${pin.y}px, 0)`
                }}
                className={`absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold transition-all shadow-xl ${
                  pin.isSelected
                    ? 'bg-amber-400 text-slate-950 border-white scale-110 ring-4 ring-amber-400/30'
                    : isCritical
                    ? 'bg-rose-600/95 text-white border-rose-300 hover:scale-105'
                    : 'bg-[#0c0f16]/95 text-sky-300 border-sky-400/60 hover:border-white hover:scale-105'
                }`}
              >
                <span className="font-mono">#{pin.number}</span>
                <span className="hidden sm:inline max-w-[115px] truncate">
                  {pin.agency.split('(')[0].trim()}
                </span>
                {isCritical ? (
                  <AlertTriangle size={11} className="text-amber-200 shrink-0" />
                ) : (
                  <CheckCircle2 size={11} className="text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}

          {/* TOP FLOATING MONOLITH CAMERA & LAYER ISOLATION BAR */}
          <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
            <div className="bg-[#0c0f16]/90 backdrop-blur-md border border-[#1e2430] rounded-lg p-1 flex items-center gap-1 pointer-events-auto shadow-xl">
              {!isLeftDrawerOpen && (
                <button
                  onClick={() => setIsLeftDrawerOpen(true)}
                  className="px-2 py-1 rounded bg-[#161c28] text-amber-400 text-xs font-semibold flex items-center gap-1 mr-1"
                >
                  <ChevronRight size={13} /> Tools
                </button>
              )}
              <span className="text-[10px] font-mono uppercase text-slate-400 px-2 flex items-center gap-1">
                <Compass size={12} className="text-amber-400" /> View:
              </span>
              {Object.entries(CAMERA_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handleApplyCameraPreset(key)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    activeCameraPreset === key
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:bg-[#161c28]'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Quick Layer Solo Pills & Zoom Controls */}
            <div className="bg-[#0c0f16]/90 backdrop-blur-md border border-[#1e2430] rounded-lg p-1 flex items-center gap-1 pointer-events-auto shadow-xl">
              {currentSite.layers.map((l: any) => (
                <button
                  key={l.id}
                  onClick={() =>
                    setIsolatedLayerId(isolatedLayerId === l.id ? null : l.id)
                  }
                  className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                    isolatedLayerId === l.id
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-[#121722] text-slate-300 hover:text-white'
                  }`}
                  title={`Solo isolate ${l.title}`}
                >
                  {l.shortCode}
                </button>
              ))}
              <div className="h-3.5 w-[1px] bg-[#1e2430] mx-0.5" />
              <button
                onClick={() =>
                  flyToCamera(
                    cameraTelemetry.lng,
                    cameraTelemetry.lat,
                    Math.min(19.5, cameraTelemetry.zoom + 0.6),
                    cameraTelemetry.pitch,
                    cameraTelemetry.bearing
                  )
                }
                className="p-1 rounded hover:bg-[#161c28] text-slate-300"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button
                onClick={() =>
                  flyToCamera(
                    cameraTelemetry.lng,
                    cameraTelemetry.lat,
                    Math.max(10.5, cameraTelemetry.zoom - 0.6),
                    cameraTelemetry.pitch,
                    cameraTelemetry.bearing
                  )
                }
                className="p-1 rounded hover:bg-[#161c28] text-slate-300"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button
                onClick={() => handleSelectSite(selectedSiteId)}
                className="p-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                title="Re-center on Active Site Parcel"
              >
                <Crosshair size={14} />
              </button>
            </div>
          </div>

          {/* CENTER OVERLAY MODALS WHEN HEADER <nav> SWITCHES TO WORKPLAN / GRANTS / DOSSIER */}
          {activeNavMode !== 'city' && (
            <div className="absolute inset-4 bg-[#090b10]/95 backdrop-blur-md border border-[#1e2430] rounded-xl z-30 flex flex-col overflow-hidden shadow-2xl">
              <div className="h-11 px-4 bg-[#0c0f16] border-b border-[#1e2430] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase text-amber-400 font-bold">
                    {activeNavMode === 'workplan' &&
                      `SEQUENCED AGENCY WORKPLAN // ${currentSite.name} (${currentSite.code})`}
                    {activeNavMode === 'grants' &&
                      `OURSG & NAC GRANT CO-FUNDING AUDIT // ${currentSite.name}`}
                    {activeNavMode === 'dossier' &&
                      `SUBMISSION-READY STATUTORY DOSSIER // ${currentSite.projectTitle}`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {activeNavMode === 'dossier' && (
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                    >
                      <Printer size={13} /> Print / Save PDF
                    </button>
                  )}
                  <button
                    onClick={() => setActiveNavMode('city')}
                    className="px-3 py-1 rounded bg-[#161c28] hover:bg-[#1e2638] text-xs font-semibold text-slate-200"
                  >
                    Back to map
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto monolith-scroll p-6 space-y-6">
                {/* Summary Header */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-[#121722] border border-[#1e2430] p-3.5 rounded-lg">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      Site
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {currentSite.name}
                    </div>
                    <div className="text-[11px] font-mono text-amber-400 mt-0.5">
                      {currentSite.code} · {currentSite.lat.toFixed(4)}°N, {currentSite.lng.toFixed(4)}°E
                    </div>
                  </div>
                  <div className="bg-[#121722] border border-[#1e2430] p-3.5 rounded-lg">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      Readiness
                    </div>
                    <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
                      {computedAudit.readinessScore}% Verified Fit
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {Object.values(enhancers).filter(Boolean).length} of 4 Strategic Enhancers Active
                    </div>
                  </div>
                  <div className="bg-[#121722] border border-[#1e2430] p-3.5 rounded-lg">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      NAC P&P + MCCY OurSG
                    </div>
                    <div className="text-sm font-mono font-bold text-sky-400 mt-0.5">
                      NAC: ${computedAudit.nacClaimed.toLocaleString()} · OurSG: ${computedAudit.mccyClaimed.toLocaleString()}
                    </div>
                    <div className="text-[11px] text-emerald-400">
                      {computedAudit.grantConflicts.length} Double-Dipping Conflicts
                    </div>
                  </div>
                  <div className="bg-[#121722] border border-[#1e2430] p-3.5 rounded-lg">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">
                      Disclaimer
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                      Guidance only. Not an approval or a grant decision.
                    </div>
                  </div>
                </div>

                {/* Sequenced Workplan Table */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 mb-2.5">
                    1. Workplan
                  </h3>
                  <div className="overflow-x-auto border border-[#1e2430] rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#121722] text-slate-300 border-b border-[#1e2430]">
                          <th className="p-3 font-mono">When</th>
                          <th className="p-3">Agency</th>
                          <th className="p-3">Why</th>
                          <th className="p-3">Needs first</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2430] bg-[#0c0f16]">
                        {currentSite.workplan.map((w: any) => {
                          const ok = w.linkedEnhancer
                            ? Boolean(enhancers[w.linkedEnhancer])
                            : true;
                          return (
                            <tr key={w.step} className="hover:bg-[#121722]">
                              <td className="p-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                                Step {w.step} · {w.window}
                              </td>
                              <td className="p-3">
                                <div className="font-bold text-white">{w.licence}</div>
                                <div className="text-[11px] text-sky-300">{w.agency}</div>
                              </td>
                              <td className="p-3 text-slate-300 max-w-md">{w.why}</td>
                              <td className="p-3 font-mono text-[11px] text-slate-400">
                                {w.dependency}
                              </td>
                              <td className="p-3">
                                <span
                                  className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                                    ok
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-amber-500/20 text-amber-300'
                                  }`}
                                >
                                  {ok ? 'VERIFIED READY' : w.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Anti-Overlap Grant Allocation Table */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-sky-400 mb-2.5">
                    2. Funding
                  </h3>
                  <div className="overflow-x-auto border border-[#1e2430] rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#121722] text-slate-300 border-b border-[#1e2430]">
                          <th className="p-3">Item</th>
                          <th className="p-3">Layer</th>
                          <th className="p-3 font-mono">S$</th>
                          <th className="p-3">Grant</th>
                          <th className="p-3">Overlap rule</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e2430] bg-[#0c0f16]">
                        {currentSite.budgetItems.map((b: any) => {
                          const assigned =
                            budgetAllocations[b.id] || b.assignedGrant;
                          return (
                            <tr key={b.id} className="hover:bg-[#121722]">
                              <td className="p-3 font-semibold text-white">
                                {b.component}
                              </td>
                              <td className="p-3 font-mono text-[11px] text-slate-400">
                                {b.layer}
                              </td>
                              <td className="p-3 font-mono font-bold text-amber-400">
                                ${b.cost.toLocaleString()}
                              </td>
                              <td className="p-3 text-sky-300 font-medium">
                                {GRANT_PROGRAMS[assigned]?.name}
                              </td>
                              <td className="p-3 text-slate-400">{b.ruleNote}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BOTTOM FLOATING MONOLITH TELEMETRY & OPENFREEMAP ATTRIBUTION BAR */}
          <div className="absolute bottom-2.5 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-20">
            <div className="bg-[#0c0f16]/90 backdrop-blur-md border border-[#1e2430] rounded-md px-2.5 py-1 flex items-center gap-3 text-[10px] font-mono text-slate-400 pointer-events-auto">
              <span className="text-amber-400 font-semibold">
                {currentSite.code}
              </span>
            </div>

            <div className="bg-[#0c0f16]/90 backdrop-blur-md border border-[#1e2430] rounded-md px-2.5 py-1 text-[10px] text-slate-400 pointer-events-auto">
              ©{' '}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white underline"
              >
                OpenStreetMap
              </a>{' '}
              ·{' '}
              <a
                href="https://openfreemap.org"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white underline"
              >
                OpenFreeMap
              </a>{' '}
              ·{' '}
              <a
                href="https://maplibre.org"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white underline"
              >
                MapLibre
              </a>
            </div>
          </div>
        </main>

        {/* ------------------------------------------------------------------- */}
        {/* 3D. RIGHT <aside> — MONOLITH INSPECTOR, MATRIX & ENHANCERS          */}
        {/* ------------------------------------------------------------------- */}
        <aside className="w-80 lg:w-96 shrink-0 bg-[#0c0f16] border-l border-[#1e2430] flex flex-col z-20">
          {/* Right Panel 3-Tab Header */}
          <div className="grid grid-cols-3 gap-1 p-1.5 bg-[#090b10] border-b border-[#1e2430]">
            {[
              { id: 'inspector', label: 'Detail', icon: Info },
              { id: 'matrix', label: 'Checks', icon: ShieldAlert },
              { id: 'enhancers', label: 'Improve', icon: Sparkles }
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveRightTab(t.id)}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded text-[11px] font-semibold transition-all ${
                    activeRightTab === t.id
                      ? 'bg-[#1a2232] text-amber-400 border border-amber-400/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon size={12} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Panel Scrollable Content */}
          <div className="flex-1 overflow-y-auto monolith-scroll p-3.5 space-y-3.5">
            {/* TAB 1: SPATIAL HOTSPOT STATUTORY INSPECTOR */}
            {activeRightTab === 'inspector' && selectedHotspot && (
              <>
                <div className="bg-[#121722] border border-[#1e2430] rounded-lg p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      HOTSPOT #{selectedHotspot.number} · {selectedHotspot.layerId.toUpperCase()}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                        selectedHotspot.verificationType === 'VERIFIED RULE' ||
                        (selectedHotspot.enhancerKey &&
                          enhancers[selectedHotspot.enhancerKey])
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {selectedHotspot.enhancerKey &&
                      enhancers[selectedHotspot.enhancerKey]
                        ? 'RESOLVED (VERIFIED)'
                        : selectedHotspot.verificationType}
                    </span>
                  </div>

                  <h2 className="text-sm font-bold text-white leading-snug">
                    {selectedHotspot.title}
                  </h2>

                  <div className="flex items-center justify-between text-[11px] text-sky-300 font-medium">
                    <span>{selectedHotspot.agency}</span>
                    <span className="font-mono text-amber-300">
                      {selectedHotspot.timing}
                    </span>
                  </div>

                  <div className="bg-[#0c0f16] border border-[#1e2430] rounded p-2.5 text-xs space-y-1">
                    <div className="text-[10px] font-mono uppercase text-slate-400">
                      Why
                    </div>
                    <p className="text-slate-200 leading-relaxed text-[11px]">
                      {selectedHotspot.whyApproach}
                    </p>
                  </div>

                  <div className="bg-[#0c0f16] border border-[#1e2430] rounded p-2.5 text-xs space-y-1">
                    <div className="text-[10px] font-mono uppercase text-slate-400">
                      What to do
                    </div>
                    <p className="text-slate-200 leading-relaxed text-[11px]">
                      {selectedHotspot.requirementDetail}
                    </p>
                  </div>

                  <div className="bg-sky-950/30 border border-sky-500/30 rounded p-2.5 text-xs space-y-1">
                    <div className="text-[10px] font-mono uppercase text-sky-300">
                      Funding
                    </div>
                    <p className="text-sky-100 leading-relaxed text-[11px]">
                      {selectedHotspot.linkedGrant}
                    </p>
                  </div>

                  <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-0.5">
                    <span>Ref: {selectedHotspot.officialRef}</span>
                  </div>

                  {selectedHotspot.enhancerKey && (
                    <button
                      onClick={() =>
                        setEnhancers((p) => ({
                          ...p,
                          [selectedHotspot.enhancerKey]:
                            !p[selectedHotspot.enhancerKey]
                        }))
                      }
                      className={`w-full py-2 px-3 rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        enhancers[selectedHotspot.enhancerKey]
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      }`}
                    >
                      <Sparkles size={13} />
                      {enhancers[selectedHotspot.enhancerKey]
                        ? '3D Strategic Enhancer Applied'
                        : 'Apply Linked 3D Proposal Enhancer'}
                    </button>
                  )}
                </div>

                {/* All Hotspots List */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-mono uppercase text-slate-400">
                    Spatial Hotspots on {currentSite.code}
                  </div>
                  {currentSite.hotspots.map((h: any) => (
                    <button
                      key={h.id}
                      onClick={() => setSelectedHotspotId(h.id)}
                      className={`w-full text-left p-2 rounded-md border text-xs flex items-center justify-between transition-all ${
                        selectedHotspot.id === h.id
                          ? 'bg-[#1a2232] border-amber-400 text-white'
                          : 'bg-[#121722] border-[#1e2430] text-slate-300 hover:bg-[#161c28]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#090b10] text-amber-400">
                          #{h.number}
                        </span>
                        <span className="truncate">{h.title}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-1">
                        {h.timing.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* TAB 2: VERIFIED REQUIREMENTS VS ASSUMPTIONS & GAPS MATRIX */}
            {activeRightTab === 'matrix' && (
              <div className="space-y-2.5">
                <div className="bg-amber-950/30 border border-amber-500/40 rounded-lg p-2.5 text-[11px] text-amber-200 leading-relaxed">
                  <strong>Note:</strong> Explicitly separates verified statutory rules from provisional assumptions and missing site data. Does not promise permit or grant approvals.
                </div>

                {computedAudit.matrixItems.map((item) => (
                  <div
                    key={item.id}
                    className={`bg-[#121722] border rounded-lg p-2.5 text-xs ${
                      item.status === 'VERIFIED RULE'
                        ? 'border-emerald-500/40'
                        : item.status === 'ASSUMPTION'
                        ? 'border-amber-500/50'
                        : 'border-rose-500/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.agency}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          item.status === 'VERIFIED RULE'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : item.status === 'ASSUMPTION'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="font-bold text-white mb-1">{item.title}</div>
                    <p className="text-[11px] text-slate-300 leading-relaxed mb-1">
                      {item.detail}
                    </p>
                    <div className="text-[10px] font-mono text-slate-400">
                      Source: {item.source}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 3: STRATEGIC PROPOSAL ENHANCERS */}
            {activeRightTab === 'enhancers' && (
              <div className="space-y-2.5">
                <div className="bg-[#121722] border border-[#1e2430] rounded-lg p-2.5 text-[11px] text-slate-300">
                  Turn on real changes to the plan. The 3D model updates.
                </div>

                {STRATEGIC_ENHANCERS.map((enh) => {
                  const isOn = enhancers[enh.key];
                  return (
                    <div
                      key={enh.key}
                      onClick={() =>
                        setEnhancers((p) => ({ ...p, [enh.key]: !p[enh.key] }))
                      }
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isOn
                          ? 'bg-emerald-950/35 border-emerald-500/60'
                          : 'bg-[#121722] border-[#1e2430] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-white leading-snug">
                          {enh.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shrink-0 ${
                            isOn
                              ? 'bg-emerald-400 text-slate-950'
                              : 'bg-[#090b10] text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          +{enh.readinessBoost}%
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-sky-300 mb-1.5">
                        {enh.targetLayer} · Clears {enh.agencyResolved}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed mb-1">
                        <strong>On the map:</strong> {enh.visualEffect}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        <strong>Effect:</strong> {enh.regulatoryEffect}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}