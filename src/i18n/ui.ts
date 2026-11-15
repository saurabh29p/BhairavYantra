/**
 * Interface labels in English and Hindi.
 *
 * `fromDocs: true` means the Hindi wording is taken from the owner's docs (concept,
 * methodology, visual design). The other Hindi labels were written for the interface and
 * were reviewed on 2026-11-15 at the owner's request (concept §9).
 */
export interface Label {
  en: string;
  hi: string;
  fromDocs?: boolean;
}

/** Working name until the owner decides (CLAUDE.md "Decisions still open"). From README.md. */
export const SITE: Label = { en: 'BhairavYantra', hi: 'भैरव यंत्र', fromDocs: true };

export const UI = {
  library: { en: 'Library', hi: 'ग्रंथालय', fromDocs: true },
  devata: { en: 'Devatā', hi: 'देवता', fromDocs: true },
  grantha: { en: 'Grantha', hi: 'ग्रंथ', fromDocs: true },
  parampara: { en: 'Paramparā', hi: 'परंपरा', fromDocs: true },
  person: { en: 'Sādhakas and Ācāryas', hi: 'साधक और आचार्य' },
  place: { en: 'Places', hi: 'क्षेत्र और मंदिर' },
  passage: { en: 'Passages', hi: 'उद्धरण' },
  mantra: { en: 'Mantras', hi: 'मंत्र', fromDocs: true },
  image: { en: 'Images', hi: 'देव-चित्र', fromDocs: true },
  sources: { en: 'Sources & Method', hi: 'स्रोत-पद्धति', fromDocs: true },
  bibliography: { en: 'Bibliography', hi: 'ग्रंथसूची' },
  claims: { en: 'Claims register', hi: 'दावों की समीक्षा', fromDocs: true },
  corrections: { en: 'Corrections', hi: 'सुधार' },
  glossary: { en: 'Glossary', hi: 'शब्दकोश', fromDocs: true },
  about: { en: 'About & Ethics', hi: 'परिचय और नैतिकता' },
  search: { en: 'Search', hi: 'खोज', fromDocs: true },
  az: { en: 'A–Z index', hi: 'वर्णानुक्रमणिका' },
  home: { en: 'Home', hi: 'मुखपृष्ठ', fromDocs: true },
  menu: { en: 'Menu', hi: 'मेनू' },
  skip: { en: 'Skip to content', hi: 'मुख्य सामग्री पर जाएँ' },
  siteMap: { en: 'Site map', hi: 'साइट-मानचित्र' },
  grades: { en: 'Evidence grades', hi: 'प्रमाण-श्रेणियाँ', fromDocs: true },
  empty: { en: 'No entries yet.', hi: 'अभी कोई प्रविष्टि नहीं।' },
  pending: { en: 'Pending', hi: 'लंबित' },
  inPreparation: { en: 'In preparation', hi: 'तैयारी में' },
  sourcesHeading: { en: 'Sources', hi: 'स्रोत' },
  openQuestions: { en: 'Open questions', hi: 'अनसुलझे प्रश्न' },
  imageDetails: { en: 'Image details', hi: 'चित्र विवरण', fromDocs: true },
  ourRendering: { en: 'Our rendering', hi: 'हमारा अनुवाद' },
  themeDark: { en: 'Dark', hi: 'गहरा' },
  themeLight: { en: 'Light', hi: 'हल्का' },
} as const satisfies Record<string, Label>;

/** Text-status labels, concept §5 (both languages from the concept table). */
export const TEXT_STATUS_LABEL = {
  extant: { en: 'Extant', hi: 'उपलब्ध', fromDocs: true },
  fragmentary: { en: 'Fragmentary', hi: 'खंडित', fromDocs: true },
  'lost-quoted': { en: 'Lost, known through quotation', hi: 'लुप्त, उद्धरणों से ज्ञात', fromDocs: true },
  'lost-name-only': { en: 'Lost, known by name only', hi: 'लुप्त, केवल नाम से ज्ञात', fromDocs: true },
  'claimed-recovered': { en: 'Claimed recovered / claimed source', hi: 'पुनः प्राप्त होने का दावा', fromDocs: true },
} as const satisfies Record<string, Label>;
