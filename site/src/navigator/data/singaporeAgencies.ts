import { AgencyRequirement, GrantOpportunity, Proposal } from '../types/placemaking';

export const OFFICIAL_GRANTS: GrantOpportunity[] = [
  {
    id: 'NAC_PP',
    name: 'Presentation & Participation (P&P) Grant',
    agency: 'National Arts Council (NAC) via OurSG Grants Portal',
    maxFundingCap: 100000,
    maxProjectSharePercentage: 80,
    allowableCostCategories: [
      'Artistic personnel & performer fees',
      'Production, technical rigging & staging',
      'Materials, fabrication & installation',
      'Direct marketing, documentation & accessibility features'
    ],
    disallowedExpenses: [
      'Capital asset purchase (e.g. buying speakers/cameras)',
      'Hospitality, meals, catering & alcohol',
      'Contingency buffer percentages',
      'Retrospective costs incurred prior to application approval'
    ],
    doubleFundingRule:
      'CRITICAL: Strict non-duplication rule across OurSG Grants. You cannot claim NAC P&P for the exact same budget line items funded by other government grants (e.g., URA Lively Places or NHB). Total government co-funding across all public sources cannot exceed 80% of total project costs.',
    applicationLeadWeeks: 12,
    eligibilityNotes: [
      'Open to Singapore Citizens, PRs, and registered local arts collectives / entities',
      'Self-Employed Persons (SEPs) receive priority consideration',
      'Must have public presentation or community participation in Singapore',
      'Application must precede project start date by at least 8 to 12 weeks'
    ],
    isEligible: true,
    officialPortalUrl: 'https://oursggrants.gov.sg',
    grantWindowDescription: 'Rolling quarterly windows on OurSG Grants portal. Results typically released 6-8 weeks after window close.'
  },
  {
    id: 'URA_LIVELY',
    name: 'Lively Places Fund (LPF)',
    agency: 'Urban Redevelopment Authority (URA) & HDB',
    maxFundingCap: 20000,
    maxProjectSharePercentage: 80,
    allowableCostCategories: [
      'Temporary physical placemaking infrastructure (seating, shade, art dividers)',
      'Community engagement workshops & toolkits',
      'Public space installation materials',
      'Wayfinding, lighting and precinct signage'
    ],
    disallowedExpenses: [
      'Commercial sales stalls setup costs',
      'Permanent structural alterations without masterplan approval',
      'Overseas travel or residency costs'
    ],
    doubleFundingRule:
      'Co-funding allowed with NAC or NHB ONLY IF distinct cost line items are designated. E.g., URA funds physical place activation items while NAC covers artist/performer honoraria.',
    applicationLeadWeeks: 8,
    eligibilityNotes: [
      'Must activate a publicly accessible space (pedestrian mall, plaza, parklet, state reserve)',
      'Requires site owner consent in-principle (SLA, Town Council, or URA)',
      'Must include active ground-up community or merchant participation'
    ],
    isEligible: true,
    officialPortalUrl: 'https://www.ura.gov.sg/Corporate/Get-Involved/Enliven-Public-Spaces/Lively-Places-Programme',
    grantWindowDescription: 'Year-round applications. Evaluation takes 4 to 6 weeks from receipt of complete site plan.'
  },
  {
    id: 'NHB_HERITAGE',
    name: 'Heritage Project Grant',
    agency: 'National Heritage Board (NHB) via OurSG Grants Portal',
    maxFundingCap: 50000,
    maxProjectSharePercentage: 70,
    allowableCostCategories: [
      'Historical research, oral history recording & archival documentation',
      'Heritage trail design & community walking guides',
      'Conservation-themed interactive exhibits and audio guides'
    ],
    disallowedExpenses: [
      'Commercial merchandise production for profit',
      'Unsubstantiated management fees'
    ],
    doubleFundingRule:
      'Governed by OurSG Grants co-funding ceilings. Eligible for heritage interpretation components when paired with NAC arts presentation.',
    applicationLeadWeeks: 10,
    eligibilityNotes: [
      'Must focus on Singapore tangible or intangible cultural heritage',
      'Site or subject must have recognized historical or community resonance (e.g. Telok Ayer, Chinatown, Little India)'
    ],
    isEligible: true,
    officialPortalUrl: 'https://www.nhb.gov.sg/what-we-do/our-work/grants-and-partnerships/grants',
    grantWindowDescription: 'Cycles close every 3-4 months. Strict lead time of 8-10 weeks prior to launch.'
  }
];

export const PRESET_PROPOSALS: Proposal[] = [
  {
    id: 'telok-ayer-walk',
    title: 'Echoes of the Canal: Telok Ayer Heritage & Light Art Walk',
    subtitle: 'Interactive evening placemaking trail celebrating Singapore shoreline history across State Land and pedestrian plazas',
    artform: 'Interactive Light Sculptures & Architectural Heritage Soundscapes',
    precinct: 'Telok Ayer Conservation Area (Downtown Core)',
    locationSpecifics: 'Interim State Reserve plot at Telok Ayer Green + Nagore Dargah pedestrianized mall segment',
    venueTenure: 'state_land_reserve',
    durationDays: 14,
    expectedAudience: 12500,
    isOutdoor: true,
    hasTemporaryStructures: true,
    structureHeightMeters: 3.2,
    structureFootprintSqm: 85,
    hasAmplifiedSound: true,
    decibelEstimateDb: 68,
    nightLighting: true,
    isTicketedOrPaid: false,
    totalBudget: 42500,
    leadArtistCollective: 'Urban Lumens Collective & Maritime Heritage Voices (Singapore SEPs)',
    applicantType: 'individual_sep',
    description:
      'A two-week dusk-to-night arts intervention weaving 4 kinetic, solar-assisted light lanterns and localized acoustic narratives along the historic 19th-century coastline of Telok Ayer. Free for the public, activating underutilized SLA State Land and connecting office workers, residents, and heritage visitors.',
    objectives: [
      'Re-animate the historical pre-reclamation shoreline through non-invasive light art',
      'Foster intergenerational night-time walking between Tanjong Pagar and Amoy Street',
      'Model an exemplary cross-agency civic activation using temporary sustainable structures'
    ],
    communityInvolvementPlan:
      'Co-creation lanterns workshops with Telok Ayer Merchants Association and weekend heritage docent-led walking tours for local residents and seniors.',
    safetyPlan:
      'Certified Class 1 flame-retardant fabric skins; 24/7 licensed security guard patrol; dual 4m-wide unobstructed emergency corridors verified against SCDF evacuation standards; IP65 outdoor electrical cabling with ground-fault circuit interrupters.',
    imagePath: '/navigator/images/telok_ayer_artwalk_1793422637749.jpg',
    lineItems: [
      {
        id: 'li-1',
        title: 'Lead Artist, Creative Technologist & Curator Fees (3 SEPs)',
        category: 'artistic_fees',
        cost: 14000,
        assignedGrant: 'NAC_PP',
        isAllowableGovExpense: true,
        notes: 'Covers 6 weeks of fabrication, programming kinetic sensors, and live curation'
      },
      {
        id: 'li-2',
        title: 'Lantern Structural Fabrication, Modular Trussing & Rigging',
        category: 'production_staging',
        cost: 11500,
        assignedGrant: 'URA_LIVELY',
        isAllowableGovExpense: true,
        notes: 'Demountable non-invasive weighted bases (zero ground drilling on State land)'
      },
      {
        id: 'li-3',
        title: 'SLA TOL Rental Fee, Security Deposit & Professional Engineer (PE) Inspection',
        category: 'permits_engineering',
        cost: 4800,
        assignedGrant: 'SELF_COMMERCIAL',
        isAllowableGovExpense: false,
        notes: 'Direct regulatory licensing and refundable SLA reinstatement deposit'
      },
      {
        id: 'li-4',
        title: 'Oral History Audio Production & Bilingual Heritage Wayfinding Panels',
        category: 'marketing_community',
        cost: 6200,
        assignedGrant: 'NHB_HERITAGE',
        isAllowableGovExpense: true,
        notes: 'Community storytelling with Telok Ayer elders & bilingual QR audio guides'
      },
      {
        id: 'li-5',
        title: 'Public Liability Insurance (S$2,000,000 SLA/URA Indemnity) & SCDF Fire Extinguishers',
        category: 'insurance_admin',
        cost: 3200,
        assignedGrant: 'NAC_PP',
        isAllowableGovExpense: true,
        notes: 'Statutory prerequisite for SLA Temporary Occupation Licence issuance'
      },
      {
        id: 'li-6',
        title: 'Community Lantern-Making Workshops (Materials & Docents)',
        category: 'marketing_community',
        cost: 2800,
        assignedGrant: 'URA_LIVELY',
        isAllowableGovExpense: true,
        notes: 'Direct public participation component matching Lively Places guidelines'
      }
    ]
  },
  {
    id: 'void-deck-theatre',
    title: 'The Living Room Below: Bishan Void Deck Community Soundscape',
    subtitle: 'Participatory community acoustic theatre & oral history in an HDB common space',
    artform: 'Immersive Acoustic Theatre & Intergenerational Storytelling',
    precinct: 'Bishan North Estate (Blk 284 Void Deck)',
    locationSpecifics: 'Sheltered HDB void deck adjacent to community garden',
    venueTenure: 'hdb_void_deck',
    durationDays: 3,
    expectedAudience: 1800,
    isOutdoor: false,
    hasTemporaryStructures: false,
    structureHeightMeters: 2.1,
    structureFootprintSqm: 40,
    hasAmplifiedSound: true,
    decibelEstimateDb: 62,
    nightLighting: false,
    isTicketedOrPaid: false,
    totalBudget: 18200,
    leadArtistCollective: 'Heartland Dramatists Guild & Bishan Active Ageing Circle',
    applicantType: 'clg_nonprofit',
    description:
      'A site-responsive community theatre performance turning standard void deck pillars and benches into an acoustic living room. Senior residents co-perform vignettes of everyday Singapore life alongside young musicians.',
    objectives: [
      'Transform ordinary HDB common corridors into intergenerational gathering spaces',
      'Promote resident social cohesion through shared neighborhood memories',
      'Provide barrier-free arts access for elderly and mobility-impaired residents'
    ],
    communityInvolvementPlan:
      'Resident casting calls with Bishan CC senior groups, open-microphone memory sharing, and post-show communal tea reception.',
    safetyPlan:
      'Clear 2.5m passageway maintained for resident thoroughfare; acoustic limiter calibrated to 65 dB; compliant with Town Council noise curfew at 9:30 PM.',
    imagePath: '/navigator/images/voiddeck_theatre_1793422637830.jpg',
    lineItems: [
      {
        id: 'vd-1',
        title: 'Community Playwright, Director & Dramaturg Fees',
        category: 'artistic_fees',
        cost: 7500,
        assignedGrant: 'NAC_PP',
        isAllowableGovExpense: true,
        notes: 'Script development grounded in resident interviews'
      },
      {
        id: 'vd-2',
        title: 'Acoustic Partition Screens & Stage Lighting Racks',
        category: 'production_staging',
        cost: 4200,
        assignedGrant: 'NAC_PP',
        isAllowableGovExpense: true,
        notes: 'Mobile demountable panels that do not mark HDB terrazzo tiles'
      },
      {
        id: 'vd-3',
        title: 'Town Council Void Deck Booking Fee & Conservancy Deposit',
        category: 'permits_engineering',
        cost: 900,
        assignedGrant: 'SELF_COMMERCIAL',
        isAllowableGovExpense: false,
        notes: 'Standard Town Council event deposit'
      },
      {
        id: 'vd-4',
        title: 'Resident Memory Booklets & Accessibility Large-Print Scripts',
        category: 'marketing_community',
        cost: 3600,
        assignedGrant: 'URA_LIVELY',
        isAllowableGovExpense: true,
        notes: 'Distributed to estate residents'
      },
      {
        id: 'vd-5',
        title: 'Public Liability Insurance (S$1,000,000 Town Council requirement)',
        category: 'insurance_admin',
        cost: 2000,
        assignedGrant: 'NAC_PP',
        isAllowableGovExpense: true,
        notes: 'Insurance policy covering audience and performers'
      }
    ]
  },
  {
    id: 'rail-corridor-textile',
    title: 'Canopy Weaves: Rail Corridor Bio-Sculpture & Green Trail',
    subtitle: 'Biodegradable bamboo and botanical fiber pavilion along Singapore green corridor',
    artform: 'Eco-Sculpture & Environmental Craft Installation',
    precinct: 'Rail Corridor Central (near Holland Green)',
    locationSpecifics: 'Off-path green buffer along former KTM railway alignment',
    venueTenure: 'park_connector',
    durationDays: 28,
    expectedAudience: 24000,
    isOutdoor: true,
    hasTemporaryStructures: true,
    structureHeightMeters: 3.6,
    structureFootprintSqm: 65,
    hasAmplifiedSound: false,
    decibelEstimateDb: 40,
    nightLighting: false,
    isTicketedOrPaid: false,
    totalBudget: 26000,
    leadArtistCollective: 'Bio-Fibers Atelier & Singapore Botanical Guild',
    applicantType: 'individual_sep',
    description:
      'A month-long natural art pavilion woven from locally pruned bamboo and native dried plant fibers. Blends seamlessly into the Rail Corridor landscape, decomposing naturally and providing a contemplative resting node for trail walkers.',
    objectives: [
      'Demonstrate circular zero-waste placemaking in high-traffic ecological corridors',
      'Encourage nature stewardship and local flora appreciation among urban trail users',
      'Highlight non-invasive art that leaves zero footprint after removal'
    ],
    communityInvolvementPlan:
      'Weekend natural weaving workshops inviting corridor joggers and school groups to contribute woven patterns to the structure.',
    safetyPlan:
      'Certified wind-load anchor pegs non-damaging to tree roots; 1.5m clearance from active trail running paths; weekly structural integrity inspections by certified arborists.',
    imagePath: '/navigator/images/park_connector_art_1793422638218.jpg',
    lineItems: [
      {
        id: 'rc-1',
        title: 'Sculptor & Bio-Material Specialists (2 Artists)',
        category: 'artistic_fees',
        cost: 9500,
        assignedGrant: 'NAC_PP',
        isAllowableGovExpense: true,
        notes: 'Artistic design, bamboo heat curing, and weave curation'
      },
      {
        id: 'rc-2',
        title: 'Harvested Bamboo Poles, Natural Dyes & Biodegradable Jute Cords',
        category: 'production_staging',
        cost: 5800,
        assignedGrant: 'URA_LIVELY',
        isAllowableGovExpense: true,
        notes: 'Eco-materials with certified non-toxic plant dye pigments'
      },
      {
        id: 'rc-3',
        title: 'NParks Venue Application Fee & Ground Reinstatement Bond',
        category: 'permits_engineering',
        cost: 2200,
        assignedGrant: 'SELF_COMMERCIAL',
        isAllowableGovExpense: false,
        notes: 'Bond refunded upon site clearance'
      },
      {
        id: 'rc-4',
        title: 'Botanical Trail Interpretation Signs & Digital Species Guide',
        category: 'marketing_community',
        cost: 4500,
        assignedGrant: 'URA_LIVELY',
        isAllowableGovExpense: true,
        notes: 'Educational placemaking signage linked to NParks biodiversity portal'
      },
      {
        id: 'rc-5',
        title: 'Public Liability Insurance (S$1,000,000 NParks requirement) & First Aid Post',
        category: 'insurance_admin',
        cost: 4000,
        assignedGrant: 'NAC_PP',
        isAllowableGovExpense: true,
        notes: 'Outdoor liability coverage'
      }
    ]
  }
];

export function computeAgencyRequirements(proposal: Proposal): AgencyRequirement[] {
  const reqs: AgencyRequirement[] = [];

  // 1. SLA Temporary Occupation Licence (TOL)
  const isStateLand = proposal.venueTenure === 'state_land_reserve';
  reqs.push({
    agencyId: 'SLA',
    agencyName: 'Singapore Land Authority (SLA)',
    permitName: 'Temporary Occupation Licence (TOL) for Short-Term Use of State Land',
    statutoryLeadTimeWeeks: 4,
    phase: 'T-12 (Land Tenure & Venue Agreement)',
    isApplicable: isStateLand,
    status: isStateLand ? 'verified_requirement' : 'exempt',
    triggerReason: isStateLand
      ? 'The proposal occupies State Land / Reserve Site not managed by other statutory boards. A Temporary Occupation Licence (TOL) is legally required under the State Lands Act.'
      : 'Site is not State Land directly managed by SLA.',
    prerequisites: [
      'Preliminary site boundary check on SLA State Land Information System (SLIS) / OneMap',
      'Endorsement / in-principle clearance from relevant agencies (URA, LTA, SCDF)',
      'Proof of Public Liability Insurance ($1,000,000 to $2,000,000 indemnity naming SLA)'
    ],
    mandatoryDocs: [
      'Scale layout plan showing proposed installation footprint and boundary setback',
      'ACRA Business Profile or NRIC of lead applicant (for SEPs)',
      'Reinstatement Undertaking & security deposit payment receipt'
    ],
    costEstimate: 'S$200 application fee + site rental fee (calculated per sqm per day) + Refundable Security Deposit',
    portalUrl: 'https://www.sla.gov.sg/services/licence-and-land-rentals',
    officialCitation: 'State Lands Act (Cap. 314) & SLA Short-Term Use Guidelines',
    riskSeverity: isStateLand ? 'high' : 'low',
    riskMitigation:
      'Apply at least 6-8 weeks in advance (SLA statutory SLA is 4 weeks, but back-and-forth agency referral restarts the timer if layout plans lack dimensions).',
    verifiedRuleDetails:
      'Verified: SLA requires minimum 4 weeks processing from receipt of complete plans. SLA will consult URA and SCDF before issuing TOL.',
    assumedContextGap: isStateLand
      ? 'Verify whether the exact plot is tagged as "Interim Reserve" or under another agency’s maintenance contract on OneMap.'
      : undefined
  });

  // 2. URA Place Management & Conservation
  const isConservationOrPedestrian =
    proposal.precinct.toLowerCase().includes('telok ayer') ||
    proposal.precinct.toLowerCase().includes('chinatown') ||
    proposal.venueTenure === 'public_pedestrian_mall' ||
    proposal.venueTenure === 'state_land_reserve';

  reqs.push({
    agencyId: 'URA',
    agencyName: 'Urban Redevelopment Authority (URA)',
    permitName: 'Place Management & Temporary Use Clearance in Conservation / Pedestrian Zone',
    statutoryLeadTimeWeeks: 4,
    phase: 'T-8 (Urban Planning & Place Clearances)',
    isApplicable: isConservationOrPedestrian,
    status: isConservationOrPedestrian ? 'verified_requirement' : 'conditional',
    triggerReason: isConservationOrPedestrian
      ? 'Activities in designated conservation areas (e.g. Telok Ayer Historic District) or pedestrian malls require URA Place Management review to ensure no damage to heritage facades, uninterrupted emergency pedestrian circulation, and alignment with street life guidelines.'
      : 'Standard urban zone with low conservation impact.',
    prerequisites: [
      'Venue owner in-principle consent (SLA or Town Council)',
      'Clearance of pedestrian circulation width (minimum 2.0m to 3.0m clear walkway)'
    ],
    mandatoryDocs: [
      'Pedestrian flow diagram and emergency escape route layout',
      'Non-invasive fixing method statement (strictly no drilling/anchoring into conserved fabric)',
      'Merchant Association / Stakeholder notification record'
    ],
    costEstimate: 'Free for non-commercial community arts / S$100-300 if formal Temporary Change of Use required',
    portalUrl: 'https://www.ura.gov.sg/Corporate/Guidelines/Development-Control',
    officialCitation: 'Planning Act (Cap. 232) Conservation Guidelines & URA Lively Places Framework',
    riskSeverity: 'medium',
    riskMitigation:
      'Engage URA Place Management early; demonstrate clear community benefit and zero structural penetration on conserved stone or five-foot ways.',
    verifiedRuleDetails:
      'Verified: URA requires unimpeded five-foot-way clearance and strict non-anchoring to gazetted monuments or conservation walls.',
    assumedContextGap:
      'Assume nearby F&B patio operations are briefed to prevent crowd bottlenecking on Amoy/Telok Ayer streets.'
  });

  // 3. SCDF Fire Safety & Temporary Structures
  const requiresScdf =
    proposal.hasTemporaryStructures ||
    proposal.structureFootprintSqm > 50 ||
    proposal.nightLighting ||
    proposal.expectedAudience > 500;

  reqs.push({
    agencyId: 'SCDF',
    agencyName: 'Singapore Civil Defence Force (SCDF)',
    permitName: 'Temporary Fire Safety Permit for Tents / Temporary Structures / Electrical Installations',
    statutoryLeadTimeWeeks: 3,
    phase: 'T-4 (Safety, Structures & Licences)',
    isApplicable: requiresScdf,
    status: requiresScdf ? 'verified_requirement' : 'exempt',
    triggerReason: requiresScdf
      ? 'Temporary outdoor structures, enclosed pavilions, high-voltage lighting, or crowds exceeding 500 people require SCDF fire safety assessment, clear fire engine accessways, and certified fire extinguishers.'
      : 'Low-footprint activity without temporary structures or fire hazards.',
    prerequisites: [
      'Approved site layout with 4.0m minimum fire engine accessway clearance',
      'Electrical single-line diagram endorsed by a Licensed Electrical Worker (LEW) if using external generators'
    ],
    mandatoryDocs: [
      'SCDF Temporary Fire Safety Permit Form (TFSP)',
      'Fire retardant test certificates for fabrics/materials (Class 1 or 2)',
      'Fire extinguisher positioning layout plan'
    ],
    costEstimate: 'S$100 to S$250 application fee depending on tentage area',
    portalUrl: 'https://www.scdf.gov.sg/home/fire-safety/plans-and-consultations',
    officialCitation: 'Fire Safety Act 1993 (FSA) & Code of Practice for Fire Precautions in Buildings',
    riskSeverity: 'high',
    riskMitigation:
      'Engage an LEW early for power drops; install dry powder fire extinguishers at each lantern node; maintain clear 4.5m height clearance for SCDF aerial appliances.',
    verifiedRuleDetails:
      'Verified: SCDF mandates that covered tents >300 sqm or temporary structural setups with electrical hookups have an approved Temporary Fire Safety Permit before event opening.',
    assumedContextGap:
      'Assume power source is either solar battery bank or mobile quiet generator with SCDF-compliant fuel bunding.'
  });

  // 4. BCA Temporary Building Permit
  const requiresBca = proposal.hasTemporaryStructures && proposal.structureHeightMeters >= 4.0;
  const isBorderlineBca = proposal.hasTemporaryStructures && proposal.structureHeightMeters >= 2.5;

  reqs.push({
    agencyId: 'BCA',
    agencyName: 'Building and Construction Authority (BCA)',
    permitName: 'Temporary Building Permit for Temporary Stages / Truss / Pavilions',
    statutoryLeadTimeWeeks: 3,
    phase: 'T-4 (Safety, Structures & Licences)',
    isApplicable: requiresBca || isBorderlineBca,
    status: requiresBca ? 'verified_requirement' : isBorderlineBca ? 'conditional' : 'exempt',
    triggerReason: requiresBca
      ? 'Structures exceeding 4.0m in height or carrying significant crowd/lighting dead-load require BCA Temporary Building Permit endorsed by a registered Professional Engineer (PE).'
      : isBorderlineBca
      ? `Structures at ${proposal.structureHeightMeters}m height: Exemption applies if under 4.0m, provided ballast weight is certified wind-stable by manufacturer or PE.`
      : 'Height is below BCA regulatory thresholds.',
    prerequisites: [
      'Structural drawings signed and endorsed by a Professional Engineer (Civil/Structural)',
      'Soil anchorage / ballast calculations confirming wind-stability (minimum wind load 0.25 kPa)'
    ],
    mandatoryDocs: [
      'BCA Form BCA-BC-TEMPP01',
      'PE Wind Load Analysis & Ballast Specification Report',
      'Site layout showing setback from public roads and drains'
    ],
    costEstimate: 'S$400 BCA application fee + S$1,500-3,000 for PE structural endorsement',
    portalUrl: 'https://www1.bca.gov.sg/regulatory-building-control',
    officialCitation: 'Building Control Act (Cap. 29) & Building Control (Temporary Buildings) Regulations',
    riskSeverity: requiresBca ? 'high' : 'medium',
    riskMitigation:
      'Design structures under 3.8m to fall within standard temporary structure exemptions, or bundle PE endorsement into the fabrication budget.',
    verifiedRuleDetails:
      'Verified: BCA exempts single-storey temporary open sheds/scaffolding under 4m if not accessible to public on upper platforms. Above 4m, PE submission is mandatory.',
    assumedContextGap:
      'Check whether the lantern frames will hold wind-catching fabric skins which could act as a sail in sudden tropical storms.'
  });

  // 5. IMDA Arts Entertainment Classification
  const requiresImda = proposal.isOutdoor && (proposal.hasAmplifiedSound || proposal.durationDays > 1);
  reqs.push({
    agencyId: 'IMDA',
    agencyName: 'Infocomm Media Development Authority (IMDA)',
    permitName: 'Arts Entertainment Classification (AEC) / Licence',
    statutoryLeadTimeWeeks: 4,
    phase: 'T-4 (Safety, Structures & Licences)',
    isApplicable: requiresImda,
    status: requiresImda ? 'verified_requirement' : 'exempt',
    triggerReason: requiresImda
      ? 'Public outdoor arts exhibitions, multimedia installations, theatrical recitals, and audio walking tours require IMDA classification under the Public Entertainments Act.'
      : 'Private or non-theatrical installation.',
    prerequisites: [
      'Full script, audio synopsis, visual installation photos, and artist portfolio',
      'Singpass / Corppass authorization for online submission via GoBusiness'
    ],
    mandatoryDocs: [
      'IMDA AEC Online Application via GoBusiness Licensing',
      'Artistic synopsis and exact audio voiceover transcripts',
      'Site plan showing display positioning'
    ],
    costEstimate: 'S$20 - S$50 classification fee',
    portalUrl: 'https://www.imda.gov.sg/regulations-and-licensing-listing/arts-entertainment-licensing',
    officialCitation: 'Public Entertainments Act 1958 & Arts Entertainment Classification Code',
    riskSeverity: 'low',
    riskMitigation:
      'Submit verbatim audio scripts and narrative synopses 4 weeks before public launch to ensure classification rating is secured.',
    verifiedRuleDetails:
      'Verified: IMDA requires submission at least 15 to 20 working days prior to public exhibition for outdoor arts presentations.',
    assumedContextGap:
      'Assume audio walking tour recordings contain historical maritime accounts in neutral cultural context with appropriate music licensing.'
  });

  // 6. SPF Public Entertainment Licence (PEL)
  const requiresSpf = proposal.hasAmplifiedSound && proposal.isOutdoor;
  reqs.push({
    agencyId: 'SPF',
    agencyName: 'Singapore Police Force (SPF - Police Licensing)',
    permitName: 'Public Entertainment Licence (PEL) / Police Permit for Public Assembly',
    statutoryLeadTimeWeeks: 3,
    phase: 'T-4 (Safety, Structures & Licences)',
    isApplicable: requiresSpf,
    status: requiresSpf ? 'verified_requirement' : 'conditional',
    triggerReason: requiresSpf
      ? 'Live amplified sound or performance in a public space accessible to general public requires PEL or Police Notification, plus crowd management coordination if groups gather.'
      : 'No amplified music or stationary performance.',
    prerequisites: [
      'IMDA Arts Entertainment Classification approval',
      'Venue owner approval letter (SLA or Town Council)'
    ],
    mandatoryDocs: [
      'Crowd control and queue management plan',
      'Event programme schedule and artist roster'
    ],
    costEstimate: 'S$22 to S$44 per day licence fee',
    portalUrl: 'https://www.police.gov.sg/e-Services/Police-Licences/Public-Entertainment-Licence',
    officialCitation: 'Public Entertainments Act (Cap. 257) & Public Order Act',
    riskSeverity: 'medium',
    riskMitigation:
      'Design the audio experience as personal headphone walking tours (QR code based) or ambient directional speakers under 65 dB to simplify police licensing.',
    verifiedRuleDetails:
      'Verified: Unamplified background exhibitions do not require PEL; amplified live music in outdoor spaces requires standard ad-hoc PEL.',
    assumedContextGap:
      'Assume sound levels strictly adhere to NEA Environmental Noise Regulations (below 65 dBA at perimeter after 7 PM).'
  });

  return reqs;
}

export function auditGrantCoFunding(proposal: Proposal) {
  const total = proposal.totalBudget;
  const lineItems = proposal.lineItems;

  const nacAmount = lineItems
    .filter(item => item.assignedGrant === 'NAC_PP')
    .reduce((sum, item) => sum + item.cost, 0);

  const uraAmount = lineItems
    .filter(item => item.assignedGrant === 'URA_LIVELY')
    .reduce((sum, item) => sum + item.cost, 0);

  const nhbAmount = lineItems
    .filter(item => item.assignedGrant === 'NHB_HERITAGE')
    .reduce((sum, item) => sum + item.cost, 0);

  const selfAmount = lineItems
    .filter(item => item.assignedGrant === 'SELF_COMMERCIAL' || item.assignedGrant === 'UNASSIGNED')
    .reduce((sum, item) => sum + item.cost, 0);

  const totalGovGrant = nacAmount + uraAmount + nhbAmount;
  const govSharePercentage = Math.round((totalGovGrant / (total || 1)) * 100);

  const warnings: string[] = [];
  const overlaps: string[] = [];

  // Check 1: 80% OurSG Government Co-funding Cap
  if (govSharePercentage > 80) {
    warnings.push(
      `Gov Co-funding Cap Exceeded: Total government grants ($${totalGovGrant.toLocaleString()}, ${govSharePercentage}%) exceed the maximum 80% co-funding cap allowed under OurSG Grants. You must fund at least 20% ($${(total * 0.2).toLocaleString()}) via self-funding, ticketing, or commercial sponsorship.`
    );
  }

  // Check 2: NAC P&P $100k cap
  if (nacAmount > 100000) {
    warnings.push(`NAC P&P Cap Exceeded: Requested NAC amount ($${nacAmount.toLocaleString()}) exceeds the S$100,000 maximum annual cap.`);
  }

  // Check 3: URA Lively Places $20k cap
  if (uraAmount > 20000) {
    warnings.push(`URA Lively Places Cap Exceeded: Requested URA amount ($${uraAmount.toLocaleString()}) exceeds the S$20,000 ceiling.`);
  }

  // Check 4: Check for disallowed expenses claimed under grants
  lineItems.forEach(item => {
    if (!item.isAllowableGovExpense && item.assignedGrant !== 'SELF_COMMERCIAL' && item.assignedGrant !== 'UNASSIGNED') {
      overlaps.push(
        `Disallowed Grant Expense: "${item.title}" ($${item.cost.toLocaleString()}) is assigned to ${item.assignedGrant}, but licensing fees, security deposits, or capital assets are excluded under OurSG guidelines. Reassign this item to Self/Commercial funding.`
      );
    }
  });

  return {
    totalBudget: total,
    nacAmount,
    uraAmount,
    nhbAmount,
    selfAmount,
    totalGovGrant,
    govSharePercentage,
    isValid: warnings.length === 0 && overlaps.length === 0,
    warnings,
    overlaps
  };
}
