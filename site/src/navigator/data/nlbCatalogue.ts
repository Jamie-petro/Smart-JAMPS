export interface NLBTitleRecord {
  id: string;
  title: string;
  author: string;
  format: 'Physical Book' | 'Historical Map' | 'Oral History Recording' | 'Archival Photograph' | 'Digital eResource';
  publisher: string;
  publishYear: number;
  isbn?: string;
  callNumber: string;
  precinctTag: 'Telok Ayer' | 'Bishan' | 'Rail Corridor' | 'Singapore Heritage';
  summary: string;
  coverImage?: string;
  availability: {
    branchName: string;
    shelfLocation: string;
    status: 'Available' | 'Reference Only' | 'Digital Access' | 'On Loan';
    itemBarcode: string;
  }[];
}

export const NLB_HERITAGE_ARCHIVES: NLBTitleRecord[] = [
  {
    id: 'nlb-ta-01',
    title: 'Telok Ayer: A Shoreline Remembered (From Waterfront to Urban Heart)',
    author: 'National Library Board & Singapore Heritage Society',
    format: 'Physical Book',
    publisher: 'Landmark Books / National Archives of Singapore',
    publishYear: 2018,
    isbn: '978-981-4189-72-8',
    callNumber: 'SING 959.5703 TEL',
    precinctTag: 'Telok Ayer',
    summary:
      'Archival documentation of the 19th-century reclamation of Telok Ayer Basin, tracing immigrant landing points, clan temples, and commercial trade routes before land reclamation moved the coastline to Marina Bay.',
    availability: [
      {
        branchName: 'National Library / Lee Kong Chian Reference Library',
        shelfLocation: 'Level 8, Singapore & Southeast Asia Collection',
        status: 'Reference Only',
        itemBarcode: 'B28194012'
      },
      {
        branchName: 'library@orchard',
        shelfLocation: 'Adult Arts Collection (700s)',
        status: 'Available',
        itemBarcode: 'B28194013'
      },
      {
        branchName: 'Central Public Library',
        shelfLocation: 'Singapore Collection',
        status: 'Available',
        itemBarcode: 'B28194014'
      }
    ]
  },
  {
    id: 'nlb-ta-02',
    title: 'Plan of Singapore Harbour & Teluk Ayer Bay (1852 Hydrographic Survey)',
    author: 'Surveyor-General of the Straits Settlements',
    format: 'Historical Map',
    publisher: 'National Archives of Singapore Map Collection',
    publishYear: 1852,
    callNumber: 'MAPS SING. 1852 / HC-14',
    precinctTag: 'Telok Ayer',
    summary:
      'High-resolution navigational survey chart mapping original shoreline contours, reef soundings, and jetty outposts adjacent to Nagore Dargah and Thian Hock Keng Temple.',
    availability: [
      {
        branchName: 'National Archives of Singapore (Canning Rise)',
        shelfLocation: 'Cartographic Archives, Preservation Room 2',
        status: 'Reference Only',
        itemBarcode: 'MAP-852-004'
      },
      {
        branchName: 'NLB Digital Collection (BookSG)',
        shelfLocation: 'Online Digital Repository',
        status: 'Digital Access',
        itemBarcode: 'E-MAP-9921'
      }
    ]
  },
  {
    id: 'nlb-ta-03',
    title: 'Voices of Telok Ayer Merchants: Waterfront Trade Oral History Series',
    author: 'Oral History Centre, National Archives of Singapore',
    format: 'Oral History Recording',
    publisher: 'National Heritage Board Oral History Collection',
    publishYear: 1986,
    callNumber: 'OHC 000412 / REELS 1-8',
    precinctTag: 'Telok Ayer',
    summary:
      'Acoustic testimonies of third-generation lightermen and spice merchants recounting the bustling evening street trade, lantern processions, and dragon boat rallies along Telok Ayer Street.',
    availability: [
      {
        branchName: 'Lee Kong Chian Reference Library',
        shelfLocation: 'Level 11, Archives Sound Lab',
        status: 'Available',
        itemBarcode: 'AUD-OHC-412'
      },
      {
        branchName: 'NLB eResources Audio Portal',
        shelfLocation: 'Digital Stream',
        status: 'Digital Access',
        itemBarcode: 'STRM-00812'
      }
    ]
  },
  {
    id: 'nlb-bs-01',
    title: 'From Kampong San Teng to Heartland: The Story of Bishan',
    author: 'Bishan Heritage Committee & National Heritage Board',
    format: 'Physical Book',
    publisher: 'Times Editions',
    publishYear: 2004,
    isbn: '978-981-232-614-2',
    callNumber: 'SING 959.5705 FRO',
    precinctTag: 'Bishan',
    summary:
      'Comprehensive history detailing the transformation of the sprawling 19th-century cemetery and rural vegetable plantations into an award-winning Singapore heartland town pioneering void deck social spaces.',
    availability: [
      {
        branchName: 'Bishan Public Library',
        shelfLocation: 'Level 3, Singapore Collection',
        status: 'Available',
        itemBarcode: 'B39102450'
      },
      {
        branchName: 'Lee Kong Chian Reference Library',
        shelfLocation: 'Level 8, General Heritage',
        status: 'Reference Only',
        itemBarcode: 'B39102451'
      }
    ]
  },
  {
    id: 'nlb-bs-02',
    title: 'Social Life Beneath the Pillars: The Architecture of HDB Void Decks',
    author: 'Tan, Vivienne & Urban Studies Guild',
    format: 'Digital eResource',
    publisher: 'Singapore University Press / NLB ePub',
    publishYear: 2021,
    isbn: '978-981-99-1082-9',
    callNumber: 'E-BOOK 307.76095957 TAN',
    precinctTag: 'Bishan',
    summary:
      'Architectural and sociological study analyzing the void deck as an egalitarian public living room fostering spontaneous communal bonding, cultural ceremonies, and grassroots performances.',
    availability: [
      {
        branchName: 'NLB OverDrive / Libby Digital Library',
        shelfLocation: 'eBook Stream (Available for loan)',
        status: 'Digital Access',
        itemBarcode: 'E-OD-54812'
      }
    ]
  },
  {
    id: 'nlb-rc-01',
    title: 'The Green Corridor: A Living Heritage Trail of the Malayan Railway',
    author: 'Nature Society (Singapore) & Heritage Conservation Group',
    format: 'Physical Book',
    publisher: 'Nature Society Singapore',
    publishYear: 2012,
    isbn: '978-981-07-2301-9',
    callNumber: 'SING 333.72095957 GRE',
    precinctTag: 'Rail Corridor',
    summary:
      'Botanical surveys, railway engineering heritage, and ecological connectivity documentation across the 24km contiguous green spine from Tanjong Pagar to Woodlands.',
    availability: [
      {
        branchName: 'Queenstown Public Library',
        shelfLocation: 'Adult Non-Fiction (300s)',
        status: 'Available',
        itemBarcode: 'B48102911'
      },
      {
        branchName: 'Bukit Timah Community Collection',
        shelfLocation: 'Local Eco-Heritage',
        status: 'Available',
        itemBarcode: 'B48102912'
      }
    ]
  }
];
