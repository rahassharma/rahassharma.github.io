export type AccentKey = 'terracotta' | 'forest' | 'cobalt' | 'ochre' | 'custom';

export interface CustomColorPreset {
  id: string;
  label: string;
  hex: string;
}

export type SocialPlatform =
  | 'linkedin'
  | 'x'
  | 'scholar'
  | 'orcid'
  | 'ieee'
  | 'github'
  | 'youtube'
  | 'instagram'
  | 'website';

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  label: string;
  url: string;
  enabled: boolean;
}

export type ProjectCategory =
  | 'All'
  | 'Precision Agriculture'
  | 'Humanitarian Wearables';

export interface Publication {
  id: string;
  indexLabel: string;
  title: string;
  venue: string;
  location?: string;
  year: string;
  status: string;
  statusType: 'paper' | 'poster' | 'late-breaking';
  role: string;
  abstract: string;
  note?: string;
  bibtex: string;
  tags: string[];
}

export interface ProjectSpecBlock {
  label: string;
  content: string;
}

export type ImageFit = 'cover' | 'contain';

export interface Project {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  domain: string;
  category: Exclude<ProjectCategory, 'All'>;
  year: string;
  statusBadge: string;
  image: string;
  imageAlt?: string;
  imagePosition?: string;
  imageFit?: ImageFit;
  imageZoom?: number;
  summary: string;
  problem: string;
  specs: ProjectSpecBlock[];
  outcomes: { label: string; value: string }[];
  stack: string[];
  repoUrl?: string;
}

export interface HonorItem {
  id: string;
  year: string;
  title: string;
  shortTag: string;
  distinction: string;
  details: string;
  credentialMeta?: string;
}

export interface SiteProfile {
  name: string;
  monogram: string;
  tagline: string;
  currentStatus: string;
  institution: string;
  location: string;
  coordinates: string;
  timezone: string;
  email: string;
  githubUrl: string;
  githubHandle: string;
  githubNote: string;
  socialLinks: SocialLink[];
  accent: AccentKey;
  customAccentHex: string;
  savedColorPresets: CustomColorPreset[];
  headlineStart: string;
  headlineAccent: string;
  headlineEnd: string;
  heroSummary: string;
  heroImage: string;
  heroImageCaption: string;
  heroImageAlt: string;
  heroImagePosition: string;
  heroImageFit: ImageFit;
  heroImageZoom: number;
  missionStatement: string;
  philosophyPillars: {
    title: string;
    description: string;
  }[];
  demographicsServed: {
    label: string;
    detail: string;
  }[];
}

export const ACCENT_OPTIONS: {
  key: Exclude<AccentKey, 'custom'>;
  label: string;
  swatch: string;
}[] = [
  { key: 'terracotta', label: 'Terracotta', swatch: '#C04B2D' },
  { key: 'forest', label: 'Forest', swatch: '#265C4B' },
  { key: 'cobalt', label: 'Cobalt', swatch: '#2552B0' },
  { key: 'ochre', label: 'Ochre', swatch: '#A56A1B' },
];

export const DEFAULT_PROFILE: SiteProfile = {
  name: 'Rahas Sharma',
  monogram: 'RS',
  tagline: 'Independent Researcher | Edge Computing & Humanitarian Technology',
  currentStatus: 'Class XI Student (Science) · Expected Graduation 2028',
  institution: 'Kendriya Vidyalaya No. 1 Akhnoor',
  location: 'Akhnoor, Jammu & Kashmir, India',
  coordinates: '32.90° N, 74.74° E',
  timezone: 'Asia/Kolkata',
  email: 'rahas.sudan10@gmail.com',
  githubUrl: 'https://github.com/rahassharma',
  githubHandle: 'github.com/rahassharma',
  githubNote:
    'Public repositories hosted here; double-blind anonymous repositories are linked directly inside peer-reviewed manuscripts.',
  socialLinks: [
    {
      id: 'social-linkedin',
      platform: 'linkedin',
      label: 'LinkedIn',
      url: '',
      enabled: true,
    },
  ],
  accent: 'forest',
  customAccentHex: '#265C4B',
  savedColorPresets: [],
  headlineStart: 'Offline-first',
  headlineAccent: 'edge systems',
  headlineEnd: 'for the people commercial tech overlooks.',
  heroSummary:
    'Bridging sensor fusion, applied machine learning, and rugged hardware engineering to solve systemic challenges in Indian agriculture and public health — sole author of three IEEE conference acceptances.',
  heroImage: '/images/hero-lab.jpg',
  heroImageCaption: 'FIG. 01 — EDGE HARDWARE BENCH',
  heroImageAlt: 'Edge computing and sensor fusion hardware research bench',
  heroImagePosition: '50% 50%',
  heroImageFit: 'cover',
  heroImageZoom: 1,
  missionStatement:
    'I am an independent researcher specializing in low-cost, offline-first edge architectures for resource-constrained environments. My work bridges sensor fusion, applied machine learning, and hardware engineering to solve systemic challenges in Indian agriculture and public health. I build systems for the people commercial technology overlooks: smallholder farmers without reliable internet, informal workers without smartphones, and rural citizens outside English-language infrastructure. My engineering philosophy centers on auditable decision logic, safety-interlocked automation, and hardware ruggedness.',
  philosophyPillars: [
    {
      title: 'Auditable Decision Logic',
      description:
        'Transparent Kalman filtering, expected-utility algorithms, and explainable fallback rules instead of opaque black-box models.',
    },
    {
      title: 'Safety-Interlocked Automation',
      description:
        'Multi-check hardware interlocks and two-tier fail-safe escalation protocols designed for critical field and health deployments.',
    },
    {
      title: 'Hardware Ruggedness',
      description:
        'Low-cost, phone-free, offline-resilient embedded architectures engineered for heat, dust, and intermittent rural connectivity.',
    },
  ],
  demographicsServed: [
    {
      label: 'Smallholder Farmers',
      detail: 'Operating without reliable cellular internet or commercial precision-ag subscriptions.',
    },
    {
      label: 'Informal Outdoor Workforce',
      detail: 'Construction and agricultural workers without smartphones exposed to heat-stroke and cardiac risk.',
    },
    {
      label: 'Non-English Rural Citizens',
      detail: 'Communities served through regional-language voice alerts and intuitive hardware feedback.',
    },
  ],
};

export const DEFAULT_PUBLICATIONS: Publication[] = [
  {
    id: 'pub-astra-indicon-2026',
    indexLabel: '[1]',
    title:
      'ASTRA: An Explainable Edge-and-App Decision Support Architecture for Water Optimisation in Indian Smallholder Agriculture',
    venue: '2026 IEEE India Council International Conference (INDICON)',
    location: 'Chennai, India',
    year: '2026',
    status: 'Full Technical Paper Accepted · IEEE Xplore',
    statusType: 'paper',
    role: 'Sole Author',
    abstract:
      'Designed an offline-first edge architecture utilizing an on-device 1D Kalman filter and live India Meteorological Department (IMD) API integration for precision irrigation. Passed double-blind peer review.',
    tags: [
      'IEEE INDICON 2026',
      'Double-Blind Peer Reviewed',
      '1D Kalman Filter',
      'IMD API',
      'Precision Agriculture',
    ],
    bibtex: `@inproceedings{sharma2026astra,
  author    = {Sharma, Rahas},
  title     = {ASTRA: An Explainable Edge-and-App Decision Support Architecture for Water Optimisation in Indian Smallholder Agriculture},
  booktitle = {2026 IEEE India Council International Conference (INDICON)},
  address   = {Chennai, India},
  year      = {2026},
  note      = {Accepted for publication in IEEE Xplore}
}`,
  },
  {
    id: 'pub-kavach-ghtc-2026',
    indexLabel: '[2]',
    title:
      "Aarogya Kavach: A Phone-Free, Voice-Driven Wristband for Cardiac and Heat-Stress Early Warning in India's Smartphone-less Workforce",
    venue: 'IEEE Global Humanitarian Technology Conference (GHTC 2026)',
    location: 'Boulder, CO, USA',
    year: '2026',
    status: 'Poster Accepted',
    statusType: 'poster',
    role: 'Sole Author',
    abstract:
      'A standalone, phone-free wearable system combining 1-lead ECG, infrared skin thermometry, 6-axis motion sensing, and TensorFlow Lite Micro classifiers with regional-language voice alerts and autonomous 108 emergency cellular escalation.',
    note: 'Attendance declined due to age/travel constraints; academic credential maintained.',
    tags: [
      'IEEE GHTC 2026',
      'Humanitarian Wearables',
      'TinyML',
      'Phone-Free Escalation',
      'Public Health',
    ],
    bibtex: `@inproceedings{sharma2026aarogyakavach,
  author    = {Sharma, Rahas},
  title     = {Aarogya Kavach: A Phone-Free, Voice-Driven Wristband for Cardiac and Heat-Stress Early Warning in India's Smartphone-less Workforce},
  booktitle = {2026 IEEE Global Humanitarian Technology Conference (GHTC)},
  address   = {Boulder, CO, USA},
  year      = {2026},
  note      = {Poster Accepted}
}`,
  },
  {
    id: 'pub-kavach-ssci-2026',
    indexLabel: '[3]',
    title:
      "Aarogya Kavach: A Phone-Free, Voice-Driven Wristband for Cardiac and Heat-Stress Early Warning in India's Smartphone-less Workforce",
    venue: 'IEEE Symposium Series on Computational Intelligence (SSCI)',
    year: '2026',
    status: 'Late-Breaking Paper Accepted · Withdrawn',
    statusType: 'late-breaking',
    role: 'Sole Author',
    abstract:
      'Accepted as a Late-Breaking Paper presenting the same Aarogya Kavach standalone wearable architecture for phone-free cardiac and heat-stress early warning using TinyML and two-tier emergency escalation.',
    note: 'Withdrawn due to the non-archival nature of the Late-Breaking Paper track.',
    tags: [
      'IEEE SSCI',
      'Late-Breaking Paper',
      'Withdrawn (Non-Archival)',
      'Humanitarian Wearables',
      'TinyML',
    ],
    bibtex: `@inproceedings{sharma2026aarogyakavach_ssci,
  author    = {Sharma, Rahas},
  title     = {Aarogya Kavach: A Phone-Free, Voice-Driven Wristband for Cardiac and Heat-Stress Early Warning in India's Smartphone-less Workforce},
  booktitle = {IEEE Symposium Series on Computational Intelligence (SSCI)},
  year      = {2026},
  note      = {Accepted as Late-Breaking Paper; withdrawn due to non-archival nature}
}`,
  },
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'astra',
    code: 'PROJECT 01',
    title: 'ASTRA',
    subtitle: 'Adaptive Soil Thinking and Resource Analytics',
    domain: 'Precision Agriculture / Cyber-Physical Systems',
    category: 'Precision Agriculture',
    year: '2025–2026',
    statusBadge: 'IEEE INDICON 2026 · NCSC Field Trials',
    image: '/images/project-astra.jpg',
    summary:
      'An explainable, offline-first precision irrigation edge architecture combining a custom 1D Kalman filter, Hargreaves ET0 evapotranspiration modeling, IMD weather probabilities, and a 3-check safety-interlocked solenoid relay.',
    problem:
      'Groundwater depletion in the Indo-Gangetic plains caused by unguided flood irrigation; existing agri-apps fail due to internet dependency and English-only black-box AI.',
    specs: [
      {
        label: 'The Hardware Stack',
        content:
          'Arduino UNO R4 WiFi, capacitive soil-moisture probe, DS18B20 (soil temperature), and DHT22 (air temperature/humidity), integrated with a 3-check safety-interlocked solenoid actuator relay.',
      },
      {
        label: 'The Software Stack',
        content:
          '1D Kalman Filter coded from scratch (achieved 58.2% variance reduction with empirical R = 0.059), Hargreaves ET0 calculation, expected-utility decision algorithm, and an auditable fallback rule engine.',
      },
      {
        label: 'API Integration',
        content:
          'Live REST API integration with the India Meteorological Department (IMD) cityforecastloc endpoint, converting natural-language weather forecasts into a probabilistic scalar (p_t) for the decision algorithm.',
      },
      {
        label: 'Data Provenance',
        content:
          '24.5-hour physical bench capture (294 samples). Dataset and source code are fully open-sourced for independent scientific reproducibility.',
      },
    ],
    outcomes: [
      { label: 'Variance Reduction', value: '58.2%' },
      { label: 'Empirical Noise R', value: '0.059' },
      { label: 'Bench Capture', value: '24.5h / 294' },
    ],
    stack: [
      'Arduino UNO R4 WiFi',
      '1D Kalman Filter',
      'Hargreaves ET0',
      'IMD REST API',
      'DS18B20 / DHT22',
      'Safety-Interlocked Relay',
    ],
    repoUrl: 'https://github.com/rahassharma',
  },
  {
    id: 'aarogya-kavach',
    code: 'PROJECT 02',
    title: 'Aarogya Kavach',
    subtitle: '"Health Shield" — Phone-Free Humanitarian Wearable',
    domain: 'Humanitarian Wearables / Edge ML',
    category: 'Humanitarian Wearables',
    year: '2025–2026',
    statusBadge: 'IEEE GHTC 2026 & IEEE SSCI Accepted',
    image: '/images/project-kavach.jpg',
    summary:
      'A standalone, voice-driven wristband detecting cardiac anomalies and heat-stress on-device using TinyML, delivering regional-language audio warnings and autonomous 108 cellular emergency dialing without a smartphone.',
    problem:
      "Uncounted heat-stroke and cardiac deaths among India's informal outdoor workforce (construction, farming), who lack the smartphones and disposable income required for commercial medical wearables.",
    specs: [
      {
        label: 'The Hardware Specification',
        content:
          'MAX30003 (1-lead ECG analog front-end), MLX90614 (IR thermopile for skin temperature), BMI270 (6-axis IMU), and analog GSR sensor integrated on a Nordic nRF52840 MCU.',
      },
      {
        label: 'The Software Stack',
        content:
          'TensorFlow Lite Micro on-device classifiers benchmarked on the PhysioNet MIT-BIH Arrhythmia Database for low-power edge inference.',
      },
      {
        label: 'The Escalation Protocol',
        content:
          'Phone-free, two-tier safety escalation. Tier 1: Regional-language voice alerts via eSpeak NG and an onboard micro-speaker. Tier 2: Cellular auto-dialing to emergency services (108) via SIM7600 4G LTE-M with Neo-6M GPS coordinates if the wearer fails to acknowledge.',
      },
    ],
    outcomes: [
      { label: 'Architecture', value: 'Phone-Free' },
      { label: 'Safety Protocol', value: '2-Tier / 108' },
      { label: 'Benchmark', value: 'MIT-BIH' },
    ],
    stack: [
      'Nordic nRF52840',
      'MAX30003 ECG',
      'MLX90614 IR',
      'BMI270 IMU',
      'TFLite Micro',
      'SIM7600 LTE-M / GPS',
      'eSpeak NG',
    ],
    repoUrl: 'https://github.com/rahassharma',
  },
  {
    id: 'soilsense',
    code: 'PROJECT 03',
    title: 'SoilSense',
    subtitle: 'Foundational Soil-Monitoring Hardware Prototype',
    domain: 'Early-stage Precision Agriculture',
    category: 'Precision Agriculture',
    year: '2024',
    statusBadge: 'RSBVP 2024 National Selection',
    image: '/images/project-soilsense.jpg',
    summary:
      'National-level science exhibition hardware prototype engineered to measure real-time soil moisture dynamics in low-resource farming contexts — serving as the direct technical precursor to the ASTRA architecture.',
    problem:
      'Demonstrating affordable, field-accessible soil moisture telemetry for rural farming demonstrations without reliance on costly commercial agricultural telemetry units.',
    specs: [
      {
        label: 'System Role & Evolution',
        content:
          'Validated foundational sensing hardware, calibration behavior, and local farmer usability at the national science exhibition level, directly informing the Kalman filtering, evapotranspiration modeling, and safety-interlocked relay design of ASTRA.',
      },
      {
        label: 'National Recognition',
        content:
          'Selected at the national level for the Rashtriya Bal Vaigyanik Pradarshani (RSBVP) 2024.',
      },
    ],
    outcomes: [
      { label: 'Selection', value: 'RSBVP National' },
      { label: 'Year', value: '2024' },
      { label: 'Successor', value: 'ASTRA' },
    ],
    stack: [
      'Embedded Sensors',
      'Soil Moisture Sensing',
      'Hardware Prototyping',
      'Precursor to ASTRA',
    ],
    repoUrl: 'https://github.com/rahassharma',
  },
];

export const DEFAULT_HONORS: HonorItem[] = [
  {
    id: 'honor-pmrbp',
    year: '2026',
    title: 'Pradhan Mantri Rashtriya Bal Puraskar (PMRBP)',
    shortTag: 'National Civilian Honor · Innovation',
    distinction: 'Applicant',
    credentialMeta: 'Application ID: 5056981',
    details:
      "Applicant for India's highest civilian honor for students under 18 in the Innovation category, submitting independent research in offline-first humanitarian and agricultural edge systems.",
  },
  {
    id: 'honor-ncsc',
    year: '2026–27',
    title: "National Children's Science Congress (NCSC)",
    shortTag: 'Field Deployment',
    distinction: 'Active Participant',
    details:
      'Active participant deploying the ASTRA edge-and-app precision irrigation prototype for supervised agricultural field trials.',
  },
  {
    id: 'honor-nypc',
    year: '2025',
    title: 'National Youth Parliament Competition (36th NYPC)',
    shortTag: 'Parliament House · Civic Leadership',
    distinction: 'Zonal Winner',
    credentialMeta: 'Sansad Bhavan, New Delhi',
    details:
      'Zonal Winner in the 36th National Youth Parliament Competition; felicitated at Sansad Bhavan (Parliament House) by Union Minister of State Sh. Arjun Ram Meghwal.',
  },
  {
    id: 'honor-rsbvp',
    year: '2024',
    title: 'Rashtriya Bal Vaigyanik Pradarshani (RSBVP)',
    shortTag: 'National Science Exhibition',
    distinction: 'National Selection',
    credentialMeta: 'SoilSense Prototype',
    details:
      'Selected at the national level for the "SoilSense" early-stage precision agriculture hardware prototype, the foundational precursor to ASTRA.',
  },
];
