/* ═══════════════════════════════════════════════════════════════════════════
   event-terms.mjs — THE VOCABULARY THE DETECTOR READS THE NEWS WITH.
   ───────────────────────────────────────────────────────────────────────────
   Separated from detect-climate-events.mjs on purpose. This file is the part a
   human will actually want to tune — a hazard that keeps being missed, a place
   name that keeps being mis-read, a word that keeps producing false positives.
   Keeping it apart from the scoring machinery means tuning the vocabulary
   never risks editing the logic by accident.

   ★ EVERYTHING HERE IS EVIDENCE OF WORDS, NOT EVIDENCE OF EVENTS.
   A headline containing "cloudburst" is evidence that somebody wrote
   "cloudburst". The detector's whole job is to turn a pile of such evidence
   into a defensible guess, and every threshold that guess passes through is in
   the sibling file, visible, weighted and inspectable. Nothing here decides
   anything on its own.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── HAZARD VOCABULARY — THE RAIN-DRIVEN FAMILY, AND ONLY THAT ────────────
   These are /now/climate-event's own hazards. Heat, fire and forest loss have
   their own situation pages and are handled by OTHER_SITUATIONS below, which
   REJECTS them rather than letting them fall through to a hazard this page
   does cover. Without that, a story about deaths in a heatwave would match
   "deaths" plus a place and get filed as a flood.

   Order matters: the first hazard whose `strong` terms match wins, so the
   specific hazards are listed before the general ones. "glacial lake outburst"
   must beat "flood", and "cloudburst" must beat "heavy rain", or every
   Himalayan event would be filed as a generic flood and pull the wrong context
   pack.

   `strong`  a term that alone identifies the hazard type.
   `weak`    a term that supports a hazard already suggested by a strong one,
             or that combines with another weak term. Never enough by itself.  */
export const HAZARD_TERMS = [
  {
    hazard: 'glof',
    strong: ['glacial lake outburst', 'glof', 'glacier lake burst', 'glacial lake burst',
      'glacier burst', 'glacial flood', 'moraine dam'],
    weak: ['glacier', 'glacial lake', 'ice dam', 'supraglacial'],
  },
  {
    hazard: 'cloudburst',
    strong: ['cloudburst', 'cloud burst', 'cloud-burst'],
    weak: ['flash flood', 'torrential downpour', 'sudden downpour'],
  },
  {
    hazard: 'landslide',
    strong: ['landslide', 'landslip', 'mudslide', 'rockslide', 'debris flow', 'land slide'],
    weak: ['hillside collapse', 'slope failure', 'buried under debris', 'boulders'],
  },
  {
    hazard: 'cyclone',
    strong: ['cyclone', 'cyclonic storm', 'super cyclone', 'landfall', 'depression intensified'],
    weak: ['storm surge', 'bay of bengal', 'arabian sea', 'imd storm warning'],
  },
  {
    hazard: 'flood',
    strong: ['flood', 'flooding', 'floods', 'inundated', 'deluge', 'submerged'],
    weak: ['waterlogging', 'water logging', 'breached embankment', 'dam released',
      'river in spate', 'above danger mark', 'evacuated'],
  },
  {
    hazard: 'extreme_rain',
    strong: ['extremely heavy rain', 'record rainfall', 'heaviest rainfall'],
    weak: ['heavy rain', 'very heavy rain', 'downpour', 'red alert rain', 'orange alert'],
  },
];

/* ── HAZARDS THAT BELONG TO A SIBLING PAGE ────────────────────────────────
   ★ RECOGNISED SO THEY CAN BE REJECTED, NOT IGNORED.
   Heat, fire and forest loss each have their own situation page with its own
   dataset and its own cadence. If this detector simply did not know those
   words, a story headlined "12 dead as heatwave grips Vidarbha" would still
   match `deaths` and a TIER1 place and be filed here as a flood — a wrong
   hazard, the wrong context pack, and a subject stolen from /now/heat.

   So the words are listed, and a story whose dominant hazard is one of these
   is dropped. `owner` is recorded for the log line, so a rejection reads as a
   routing decision rather than a silent miss. */
export const OTHER_SITUATIONS = [
  { owner: '/now/heat', terms: ['heatwave', 'heat wave', 'heat stroke', 'heatstroke',
    'heat action plan', 'severe heat', 'scorching heat', 'mercury soars', 'mercury crosses'] },
  { owner: '/now/forest-fire', terms: ['forest fire', 'wildfire', 'bushfire', 'jungle fire',
    'blaze in the forest', 'hectares burnt', 'hectares burned'] },
  { owner: '/now/forest-loss', terms: ['deforestation', 'forest loss', 'forest cover loss',
    'tree felling', 'land diversion', 'compensatory afforestation'] },
  { owner: '/now/yamuna', terms: ['yamuna pollution', 'dissolved oxygen', 'sewage discharge',
    'froth', 'effluent'] },
  { owner: '/now/air', terms: ['air quality', 'aqi', 'smog', 'stubble burning', 'pm2.5', 'pm10'] },
];

/** Which sibling page owns this story, if any. Checked BEFORE hazard
 *  classification, so a heat story never reaches the flood matcher. */
export function ownedElsewhere(h) {
  for (const s of OTHER_SITUATIONS) {
    const hit = s.terms.filter((t) => h.includes(t));
    if (hit.length) return { owner: s.owner, term: hit[0] };
  }
  return null;
}

/* ── GEOGRAPHY ────────────────────────────────────────────────────────────
   TIER 1 is inside India. TIER 2 is the region, and — this is the part that
   matters — each tier-2 place must name the MECHANISM by which it reaches
   India. "It is nearby" is not a mechanism, so no entry says that. A Nepal
   event is on an Indian page because the Kosi drains into Bihar, not because
   Nepal is adjacent.

   `relevance` maps to RELEVANCE in lib/climate-events.mjs, and the `why`
   string is printed on the page verbatim — it is the sentence that justifies a
   foreign event's presence, so it is written here once rather than generated. */

export const TIER1 = [
  // States and union territories.
  'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh', 'goa', 'gujarat',
  'haryana', 'himachal', 'himachal pradesh', 'jharkhand', 'karnataka', 'kerala',
  'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram', 'nagaland', 'odisha',
  'punjab', 'rajasthan', 'sikkim', 'tamil nadu', 'telangana', 'tripura', 'uttar pradesh',
  'uttarakhand', 'west bengal', 'ladakh', 'jammu', 'kashmir', 'puducherry', 'andaman',
  'nicobar', 'lakshadweep', 'chandigarh',
  // Cities and districts that carry a story on their own name.
  'delhi', 'new delhi', 'mumbai', 'chennai', 'kolkata', 'bengaluru', 'bangalore', 'hyderabad',
  'pune', 'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'patna', 'guwahati',
  'bhubaneswar', 'thiruvananthapuram', 'kochi', 'mangaluru', 'mangalore', 'shimla', 'dehradun',
  'srinagar', 'leh', 'gangtok', 'itanagar', 'imphal', 'shillong', 'aizawl', 'kohima', 'agartala',
  'wayanad', 'kedarnath', 'badrinath', 'joshimath', 'chamoli', 'rudraprayag', 'uttarkashi',
  'dharali', 'kullu', 'manali', 'mandi', 'kinnaur', 'lahaul', 'spiti', 'darjeeling', 'sundarbans',
  'amarnath', 'gaurikund', 'nainital', 'haridwar', 'rishikesh', 'malin', 'raigad', 'satara',
  'kodagu', 'idukki', 'alappuzha', 'kuttanad', 'silchar', 'dibrugarh', 'majuli', 'cachar',
  // Rivers, because a river name often carries the location in Indian reporting.
  'ganga', 'ganges', 'yamuna', 'brahmaputra', 'teesta', 'tista', 'kosi', 'koshi', 'gandak',
  'godavari', 'krishna', 'narmada', 'tapi', 'mahanadi', 'sutlej', 'beas', 'ravi', 'chenab',
  'jhelum', 'alaknanda', 'bhagirathi', 'mandakini', 'periyar', 'cauvery', 'kaveri',
];

export const TIER2 = [
  { match: ['nepal', 'kathmandu', 'pokhara', 'everest', 'khumbu', 'solukhumbu', 'rasuwa',
    'sindhupalchok', 'melamchi', 'bhote koshi', 'sun koshi', 'langtang', 'mustang',
    'annapurna', 'dolakha', 'humla', 'manang'],
  relevance: 'downstream',
  why: 'Nepal’s rivers drain into Bihar and eastern Uttar Pradesh. An outburst or a '
     + 'landslide dam on the Koshi, Gandak or Karnali becomes an Indian flood within days.' },

  { match: ['bhutan', 'thimphu', 'punakha', 'paro', 'wangdue'],
  relevance: 'downstream',
  why: 'Bhutan’s rivers feed the Brahmaputra through Assam and West Bengal.' },

  { match: ['tibet', 'xizang', 'yarlung', 'tsangpo', 'lhasa', 'shigatse', 'nyingchi'],
  relevance: 'downstream',
  why: 'The Yarlung Tsangpo becomes the Brahmaputra. India has no gauge upstream of the '
     + 'border and depends on a data-sharing arrangement for warning.' },

  { match: ['bangladesh', 'dhaka', 'sylhet', 'chittagong', 'chattogram', 'padma', 'jamuna',
    'meghna', 'cox’s bazar', 'coxs bazar'],
  relevance: 'shared_range',
  why: 'India and Bangladesh share the Ganga–Brahmaputra–Meghna delta. The same '
     + 'weather system and the same rivers produce both countries’ floods.' },

  { match: ['pakistan', 'karachi', 'lahore', 'sindh', 'balochistan', 'khyber pakhtunkhwa',
    'gilgit', 'baltistan', 'hunza', 'indus'],
  relevance: 'shared_range',
  why: 'The Indus basin and the western Himalaya are shared. Systems that flood Pakistan '
     + 'commonly cross Punjab, Rajasthan and Gujarat.' },

  { match: ['myanmar', 'burma', 'yangon', 'rakhine', 'irrawaddy', 'ayeyarwady', 'sagaing'],
  relevance: 'regional_context',
  why: 'Bay of Bengal systems that strike Myanmar frequently affect India’s eastern '
     + 'seaboard and the northeast in the same week.' },

  { match: ['sri lanka', 'colombo', 'jaffna', 'maldives', 'malé'],
  relevance: 'regional_context',
  why: 'The same Bay of Bengal and Arabian Sea systems reach India’s southern coast.' },

  { match: ['hindu kush', 'karakoram', 'himalaya', 'himalayas', 'high mountain asia'],
  relevance: 'shared_range',
  why: 'India holds a long stretch of the same range, with the same glaciers, the same '
     + 'moraine-dammed lakes and the same failure mechanism.' },

  { match: ['bay of bengal', 'arabian sea', 'north indian ocean', 'andaman sea'],
  relevance: 'direct',
  why: 'These are the basins that make India’s cyclones.' },
];

/* ── SEVERITY LANGUAGE ────────────────────────────────────────────────────
   Words that suggest a story is about a consequential event rather than a
   forecast, an anniversary or a policy discussion. Each carries points in the
   scorer. They are deliberately about IMPACT, not about intensity adjectives —
   "devastating" is a writer's word, "evacuated" is a thing that happened. */
export const SEVERITY_TERMS = {
  casualty: ['dead', 'death', 'deaths', 'killed', 'toll', 'bodies', 'perished', 'fatalities',
    'died', 'casualties'],
  missing: ['missing', 'unaccounted', 'feared dead', 'search and rescue', 'trapped'],
  displacement: ['evacuated', 'evacuation', 'displaced', 'relief camp', 'shelter', 'stranded',
    'marooned', 'rescued', 'airlifted'],
  infrastructure: ['bridge collapsed', 'bridge washed', 'highway blocked', 'road washed',
    'dam', 'barrage', 'power cut', 'washed away', 'swept away', 'damaged', 'destroyed',
    'submerged', 'cut off'],
  official: ['red alert', 'orange alert', 'imd warning', 'ndrf', 'sdrf', 'army deployed',
    'disaster declared', 'emergency declared', 'high alert', 'evacuation order'],
  record: ['record', 'worst in', 'highest ever', 'unprecedented', 'first time in',
    'heaviest since', 'wettest'],
};

/* ── WORDS THAT MEAN "THIS IS NOT AN EVENT" ───────────────────────────────
   The single biggest source of false positives is not a wrong hazard, it is a
   story ABOUT a hazard: a study, a memorial, a budget line, a film. These
   terms subtract, hard. "Flood of applications" is in here for the obvious
   reason, and it earns its place. */
export const NEGATIVE_TERMS = [
  'anniversary', 'commemorat', 'memorial', 'years ago', 'decades ago', 'lessons from',
  'study finds', 'research shows', 'report says', 'according to a study', 'scientists say',
  'could', 'may face', 'at risk of', 'warns of future', 'by 2050', 'by 2100', 'projection',
  'film', 'movie', 'documentary', 'book', 'novel', 'series review',
  'budget', 'allocation', 'crore allocated', 'scheme launched', 'policy', 'bill passed',
  'flood of applications', 'flood of', 'wave of support', 'drought of ideas',
  'stock', 'shares', 'market', 'ipo', 'cricket', 'match', 'election',
];

/** Lowercased haystack for a news item: title plus publisher. */
export const hay = (item) => `${item.title || ''} ${item.publisher || ''}`.toLowerCase();

/* ── COORDINATES, FOR THE LIVE WEATHER READING ────────────────────────────
   Only the places this detector can actually name. A coordinate here is a
   representative point for the region, NOT the location of any event — it is
   used to ask Open-Meteo what the weather is doing over that area, and the
   page says exactly that beside the reading. An event whose place is not in
   this table simply gets no live weather panel, which is the correct
   degradation: no coordinate, no claim about conditions there. */
export const PLACE_COORDS = {
  nepal: [28.39, 84.12], kathmandu: [27.71, 85.32], rasuwa: [28.12, 85.30],
  solukhumbu: [27.79, 86.71], sindhupalchok: [27.95, 85.68], dolakha: [27.67, 86.17],
  langtang: [28.21, 85.51], mustang: [28.99, 83.83], humla: [30.00, 81.83],
  bhutan: [27.51, 90.43], thimphu: [27.47, 89.64],
  tibet: [31.00, 88.00], 'yarlung tsangpo': [29.30, 91.00], lhasa: [29.65, 91.14],
  bangladesh: [23.68, 90.36], sylhet: [24.90, 91.87], dhaka: [23.81, 90.41],
  pakistan: [30.38, 69.35], gilgit: [35.92, 74.31], hunza: [36.32, 74.65],
  myanmar: [21.91, 95.96],
  himalaya: [29.00, 83.00], 'hindu kush': [36.00, 71.50], karakoram: [35.80, 76.50],
  sikkim: [27.53, 88.51], uttarakhand: [30.07, 79.09], himachal: [31.10, 77.17],
  'himachal pradesh': [31.10, 77.17], 'arunachal pradesh': [28.22, 94.73],
  assam: [26.20, 92.94], bihar: [25.10, 85.31], 'west bengal': [22.99, 87.86],
  kerala: [10.85, 76.27], odisha: [20.95, 85.10], maharashtra: [19.75, 75.71],
  gujarat: [22.26, 71.19], karnataka: [15.32, 75.71], 'tamil nadu': [11.13, 78.66],
  'andhra pradesh': [15.91, 79.74], telangana: [17.12, 79.02], ladakh: [34.15, 77.58],
  'jammu': [33.28, 75.34], kashmir: [34.08, 74.80], meghalaya: [25.47, 91.37],
  manipur: [24.66, 93.91], mizoram: [23.16, 92.94], nagaland: [26.16, 94.56],
  tripura: [23.94, 91.99], jharkhand: [23.61, 85.28], chhattisgarh: [21.28, 81.87],
  'madhya pradesh': [22.97, 78.66], rajasthan: [27.02, 74.22], punjab: [31.15, 75.34],
  haryana: [29.06, 76.09], 'uttar pradesh': [26.85, 80.95], goa: [15.30, 74.12],
  delhi: [28.61, 77.21], mumbai: [19.08, 72.88], chennai: [13.08, 80.27],
  kolkata: [22.57, 88.36], guwahati: [26.14, 91.74], patna: [25.59, 85.14],
  dehradun: [30.32, 78.03], shimla: [31.10, 77.17], srinagar: [34.08, 74.80],
  leh: [34.16, 77.58], gangtok: [27.34, 88.61], darjeeling: [27.04, 88.26],
  wayanad: [11.61, 76.08], kedarnath: [30.73, 79.07], joshimath: [30.55, 79.56],
  chamoli: [30.41, 79.32], uttarkashi: [30.73, 78.44], dharali: [31.02, 78.79],
  rudraprayag: [30.28, 78.98], kullu: [31.96, 77.11], manali: [32.24, 77.19],
  mandi: [31.71, 76.93], kinnaur: [31.58, 78.44], 'lahaul': [32.57, 77.03],
  sundarbans: [21.95, 88.90], silchar: [24.83, 92.78], dibrugarh: [27.47, 94.91],
  kochi: [9.93, 76.27], mangaluru: [12.91, 74.86], bengaluru: [12.97, 77.59],
  hyderabad: [17.39, 78.49], pune: [18.52, 73.86], nainital: [29.38, 79.45],
  amarnath: [34.21, 75.50], teesta: [27.33, 88.62], kosi: [26.50, 86.90],
  koshi: [26.50, 86.90], brahmaputra: [26.20, 91.75], ganga: [25.32, 83.01],
  yamuna: [28.61, 77.25], sutlej: [31.35, 76.30], godavari: [17.00, 81.78],
  alaknanda: [30.22, 78.78], bhagirathi: [30.73, 78.44], mandakini: [30.49, 79.06],
  /* THE KOSHI HEADWATERS, added for the August 2026 Nepal event. The dossier's
     own place was "Nepal", whose centroid is 250 km from the Bhote Koshi and in
     a different basin's catchment — so a map built on it drew the wrong river.
     These are representative points on named rivers, which is exactly what
     every river entry in this table already is, and the caption on the map
     says so. */
  'bhote koshi': [27.90, 85.85], 'sun koshi': [27.20, 86.10],
  rasuwagadhi: [28.28, 85.38], rasuwa: [28.12, 85.30],
  'lhende khola': [28.28, 85.38],
};

export const coordsFor = (place) => PLACE_COORDS[String(place || '').toLowerCase()] || null;

/* ── REGIONS: WHAT COUNTS AS THE SAME EVENT ───────────────────────────────
   ★ THE FIRST RUN PUBLISHED TWENTY PAGES, AND FOUR OF THEM WERE ONE EVENT.
   Clustering on (hazard, place) split a single Himalayan disaster across
   `flood @ Nepal`, `glof @ Nepal`, `landslide @ Nepal`, `flood @ Kathmandu`,
   `flood @ Rasuwa` and `flood @ Koshi` — six clusters, six candidate pages,
   each carrying a fraction of the corroboration that should have made one
   page obviously significant. Meanwhile a district's ordinary monsoon
   waterlogging cleared the same bar.

   Two fixes, and this is the first: a sub-place resolves to its region, so
   Rasuwa and Kathmandu and the Koshi are all Nepal, and a district is its
   state. Coarse on purpose — merging two genuinely separate floods in one
   state into one dossier a human can split is a far better failure than
   fragmenting one disaster into six pages nobody can rank. */
const REGION_OF = {
  // Nepal and its catchments
  kathmandu: 'Nepal', pokhara: 'Nepal', everest: 'Nepal', khumbu: 'Nepal',
  solukhumbu: 'Nepal', rasuwa: 'Nepal', sindhupalchok: 'Nepal', melamchi: 'Nepal',
  'bhote koshi': 'Nepal', 'sun koshi': 'Nepal', langtang: 'Nepal', mustang: 'Nepal',
  annapurna: 'Nepal', dolakha: 'Nepal', humla: 'Nepal', manang: 'Nepal',
  koshi: 'Nepal', kosi: 'Nepal',
  // Tibet
  xizang: 'Tibet', yarlung: 'Tibet', tsangpo: 'Tibet', lhasa: 'Tibet',
  shigatse: 'Tibet', nyingchi: 'Tibet',
  // Bhutan / Bangladesh / Pakistan
  thimphu: 'Bhutan', punakha: 'Bhutan', paro: 'Bhutan', wangdue: 'Bhutan',
  dhaka: 'Bangladesh', sylhet: 'Bangladesh', chittagong: 'Bangladesh',
  chattogram: 'Bangladesh', padma: 'Bangladesh', jamuna: 'Bangladesh', meghna: 'Bangladesh',
  karachi: 'Pakistan', lahore: 'Pakistan', sindh: 'Pakistan', balochistan: 'Pakistan',
  'khyber pakhtunkhwa': 'Pakistan', gilgit: 'Pakistan', baltistan: 'Pakistan',
  hunza: 'Pakistan', indus: 'Pakistan',
  // Indian districts and cities to their state
  wayanad: 'Kerala', idukki: 'Kerala', alappuzha: 'Kerala', kuttanad: 'Kerala',
  kochi: 'Kerala', thiruvananthapuram: 'Kerala', periyar: 'Kerala',
  kedarnath: 'Uttarakhand', badrinath: 'Uttarakhand', joshimath: 'Uttarakhand',
  chamoli: 'Uttarakhand', rudraprayag: 'Uttarakhand', uttarkashi: 'Uttarakhand',
  dharali: 'Uttarakhand', dehradun: 'Uttarakhand', nainital: 'Uttarakhand',
  haridwar: 'Uttarakhand', rishikesh: 'Uttarakhand', gaurikund: 'Uttarakhand',
  alaknanda: 'Uttarakhand', bhagirathi: 'Uttarakhand', mandakini: 'Uttarakhand',
  kullu: 'Himachal Pradesh', manali: 'Himachal Pradesh', mandi: 'Himachal Pradesh',
  kinnaur: 'Himachal Pradesh', lahaul: 'Himachal Pradesh', spiti: 'Himachal Pradesh',
  shimla: 'Himachal Pradesh', himachal: 'Himachal Pradesh', beas: 'Himachal Pradesh',
  darjeeling: 'West Bengal', sundarbans: 'West Bengal', kolkata: 'West Bengal',
  teesta: 'West Bengal', tista: 'West Bengal',
  silchar: 'Assam', dibrugarh: 'Assam', majuli: 'Assam', cachar: 'Assam',
  guwahati: 'Assam', brahmaputra: 'Assam',
  patna: 'Bihar', gandak: 'Bihar',
  mumbai: 'Maharashtra', pune: 'Maharashtra', raigad: 'Maharashtra',
  satara: 'Maharashtra', malin: 'Maharashtra', nagpur: 'Maharashtra',
  chennai: 'Tamil Nadu', bengaluru: 'Karnataka', bangalore: 'Karnataka',
  mangaluru: 'Karnataka', mangalore: 'Karnataka', kodagu: 'Karnataka',
  hyderabad: 'Telangana', bhubaneswar: 'Odisha', ahmedabad: 'Gujarat',
  surat: 'Gujarat', jaipur: 'Rajasthan', lucknow: 'Uttar Pradesh',
  kanpur: 'Uttar Pradesh', 'new delhi': 'Delhi', yamuna: 'Delhi',
  srinagar: 'Kashmir', jammu: 'Kashmir', jhelum: 'Kashmir', chenab: 'Kashmir',
  leh: 'Ladakh', gangtok: 'Sikkim', itanagar: 'Arunachal Pradesh',
  imphal: 'Manipur', shillong: 'Meghalaya', aizawl: 'Mizoram',
  kohima: 'Nagaland', agartala: 'Tripura', amarnath: 'Kashmir',
  // Ranges and basins keep their own identity
  'hindu kush': 'Himalaya', karakoram: 'Himalaya', himalayas: 'Himalaya',
  'high mountain asia': 'Himalaya',
};

export const regionOf = (place) => {
  const k = String(place || '').toLowerCase();
  return REGION_OF[k] || place;
};
