/**
 * JEE Main 2027 — Trilingual PCM Practice, Parser, PR & AI Prompt Engine v2.0 (app.js)
 * Pure Vanilla JS • LocalStorage Persistence • KaTeX Auto-Render
 */

(function () {
  'use strict';

  // ================= CONSTANTS & STORAGE KEYS =================
  const STORAGE_KEY_PREFIX = 'jee_main_2027_v2_state_';
  const THEME_STORAGE_KEY = 'jee_main_2027_theme';
  const CUSTOM_MD_STORAGE_KEY = 'jee_main_2027_custom_md';

  // Subject Metadata (Trilingual Labels)
  const SUBJECT_META = {
    physics: {
      key: 'physics',
      gu: 'ભૌતિક વિજ્ઞાન (Physics)',
      hi: 'भौतिक विज्ञान (Physics)',
      en: 'Physics'
    },
    chemistry: {
      key: 'chemistry',
      gu: 'રસાયણ વિજ્ઞાન (Chemistry)',
      hi: 'रसायन विज्ञान (Chemistry)',
      en: 'Chemistry'
    },
    maths: {
      key: 'maths',
      gu: 'ગણિત (Mathematics)',
      hi: 'गणित (Mathematics)',
      en: 'Mathematics'
    }
  };

  // Subject-Specific Percentage-of-Max-Marks to JEE Main Percentile (PR) Curves
  // Maths has a lower raw score threshold for 98-99+ PR than Physics & Chemistry.
  const PR_CURVES = {
    maths: [
      { pct: -25, pr: 5.0 },
      { pct: 0, pr: 28.0 },
      { pct: 10, pr: 55.0 },
      { pct: 20, pr: 74.0 },
      { pct: 30, pr: 85.5 },
      { pct: 40, pr: 92.0 },
      { pct: 50, pr: 95.8 },
      { pct: 60, pr: 98.1 },
      { pct: 65, pr: 98.75 },
      { pct: 75, pr: 99.4 },
      { pct: 85, pr: 99.78 },
      { pct: 95, pr: 99.95 },
      { pct: 100, pr: 99.99 }
    ],
    physics: [
      { pct: -25, pr: 3.0 },
      { pct: 0, pr: 18.0 },
      { pct: 15, pr: 45.0 },
      { pct: 25, pr: 64.0 },
      { pct: 35, pr: 78.0 },
      { pct: 45, pr: 87.5 },
      { pct: 55, pr: 93.2 },
      { pct: 65, pr: 96.8 },
      { pct: 72, pr: 98.2 },
      { pct: 80, pr: 99.15 },
      { pct: 88, pr: 99.65 },
      { pct: 95, pr: 99.9 },
      { pct: 100, pr: 99.99 }
    ],
    chemistry: [
      { pct: -25, pr: 3.0 },
      { pct: 0, pr: 16.0 },
      { pct: 15, pr: 42.0 },
      { pct: 25, pr: 62.0 },
      { pct: 35, pr: 76.5 },
      { pct: 45, pr: 86.5 },
      { pct: 55, pr: 92.8 },
      { pct: 65, pr: 96.5 },
      { pct: 72, pr: 98.1 },
      { pct: 80, pr: 99.1 },
      { pct: 88, pr: 99.6 },
      { pct: 95, pr: 99.88 },
      { pct: 100, pr: 99.99 }
    ],
    overall: [
      { pct: -25, pr: 4.0 },
      { pct: 0, pr: 20.0 },
      { pct: 15, pr: 48.0 },
      { pct: 25, pr: 68.0 },
      { pct: 35, pr: 81.5 },
      { pct: 45, pr: 90.0 },
      { pct: 55, pr: 95.0 },
      { pct: 62, pr: 97.5 },
      { pct: 68, pr: 98.5 },
      { pct: 75, pr: 99.2 },
      { pct: 85, pr: 99.72 },
      { pct: 95, pr: 99.94 },
      { pct: 100, pr: 99.99 }
    ]
  };

  // ================= COMPLETE JEE MAIN 2027 SYLLABUS DATABASE =================
  const SYLLABUS_DB = {
    physics: {
      11: [
        { id: 'p11_1', en: 'Units and Measurements', gu: 'એકમો અને માપન (Units and Measurements)', hi: 'मात्रक एवं मापन (Units and Measurements)' },
        { id: 'p11_2', en: 'Motion in a Straight Line', gu: 'સુરેખ પથ પર ગતિ (Motion in a Straight Line)', hi: 'सरल रेखा में गति (Motion in a Straight Line)' },
        { id: 'p11_3', en: 'Motion in a Plane', gu: 'સમતલમાં ગતિ (Motion in a Plane)', hi: 'समतल में गति (Motion in a Plane)' },
        { id: 'p11_4', en: 'Laws of Motion', gu: 'ગતિના નિયમો (Laws of Motion)', hi: 'गति के नियम (Laws of Motion)' },
        { id: 'p11_5', en: 'Work, Energy and Power', gu: 'કાર્ય, ઊર્જા અને પાવર (Work, Energy and Power)', hi: 'कार्य, ऊर्जा और शक्ति (Work, Energy and Power)' },
        { id: 'p11_6', en: 'System of Particles and Rotational Motion', gu: 'કણોના તંત્રો અને ચાકગતિ (Rotational Motion)', hi: 'कणों के निकाय तथा घूर्णी गति (Rotational Motion)' },
        { id: 'p11_7', en: 'Gravitation', gu: 'ગુરુત્વાકર્ષણ (Gravitation)', hi: 'गुरुत्वाकर्षण (Gravitation)' },
        { id: 'p11_8', en: 'Mechanical Properties of Solids', gu: 'ઘન પદાર્થોના યાંત્રિક ગુણધર્મો (Mechanical Properties of Solids)', hi: 'ठोसों के यांत्रिक गुण (Mechanical Properties of Solids)' },
        { id: 'p11_9', en: 'Mechanical Properties of Fluids', gu: 'તરલના યાંત્રિક ગુણધર્મો (Mechanical Properties of Fluids)', hi: 'तरलों के यांत्रिक गुण (Mechanical Properties of Fluids)' },
        { id: 'p11_10', en: 'Thermal Properties of Matter', gu: 'દ્રવ્યના ઉષ્મીય ગુણધર્મો (Thermal Properties of Matter)', hi: 'द्रव्य के तापीय गुण (Thermal Properties of Matter)' },
        { id: 'p11_11', en: 'Thermodynamics', gu: 'થર્મોડાયનેમિક્સ / ઉષ્માગતિશાસ્ત્ર (Thermodynamics)', hi: 'ऊष्मागतिकी (Thermodynamics)' },
        { id: 'p11_12', en: 'Kinetic Theory', gu: 'ગતિવાદ (Kinetic Theory)', hi: 'अणुगति सिद्धांत (Kinetic Theory)' },
        { id: 'p11_13', en: 'Oscillations', gu: 'દોલનો (Oscillations)', hi: 'दोलन (Oscillations)' },
        { id: 'p11_14', en: 'Waves', gu: 'તરંગો (Waves)', hi: 'तरंगें (Waves)' }
      ],
      12: [
        { id: 'p12_1', en: 'Electric Charges and Fields', gu: 'વિદ્યુતભારો અને ક્ષેત્રો (Electric Charges and Fields)', hi: 'वैद्युत आवेश तथा क्षेत्र (Electric Charges and Fields)' },
        { id: 'p12_2', en: 'Electrostatic Potential and Capacitance', gu: 'સ્થિત વિદ્યુતસ્થિતિમાન અને કેપેસિટન્સ (Potential & Capacitance)', hi: 'स्थिरवैद्युत विभव तथा धारिता (Potential & Capacitance)' },
        { id: 'p12_3', en: 'Current Electricity', gu: 'પ્રવાહ વિદ્યુત (Current Electricity)', hi: 'विद्युत धारा (Current Electricity)' },
        { id: 'p12_4', en: 'Moving Charges and Magnetism', gu: 'ગતિમાન વિદ્યુતભારો અને ચુંબકત્વ (Moving Charges & Magnetism)', hi: 'गतिमान आवेश और चुंबकत्व (Moving Charges & Magnetism)' },
        { id: 'p12_5', en: 'Magnetism and Matter', gu: 'ચુંબકત્વ અને દ્રવ્ય (Magnetism and Matter)', hi: 'चुंबकत्व एवं द्रव्य (Magnetism and Matter)' },
        { id: 'p12_6', en: 'Electromagnetic Induction', gu: 'વિદ્યુતચુંબકીય પ્રેરણ (Electromagnetic Induction)', hi: 'वैद्युतचुंबकीय प्रेरण (Electromagnetic Induction)' },
        { id: 'p12_7', en: 'Alternating Current', gu: 'પ્રત્યાવર્તી પ્રવાહ (Alternating Current)', hi: 'प्रत्यावर्ती धारा (Alternating Current)' },
        { id: 'p12_8', en: 'Electromagnetic Waves', gu: 'વિદ્યુતચુંબકીય તરંગો (Electromagnetic Waves)', hi: 'वैद्युतचुंबकीय तरंगें (Electromagnetic Waves)' },
        { id: 'p12_9', en: 'Ray Optics and Optical Instruments', gu: 'કિરણ પ્રકાશશાસ્ત્ર અને પ્રકાશીય ઉપકરણો (Ray Optics)', hi: 'किरण प्रकाशिकी एवं प्रकाशिक यंत्र (Ray Optics)' },
        { id: 'p12_10', en: 'Wave Optics', gu: 'તરંગ પ્રકાશશાસ્ત્ર (Wave Optics)', hi: 'तरंग-प्रकाशिकी (Wave Optics)' },
        { id: 'p12_11', en: 'Dual Nature of Radiation and Matter', gu: 'વિકિરણ અને દ્રવ્યની દ્વૈત પ્રકૃતિ (Dual Nature)', hi: 'विकिरण तथा द्रव्य की द्वैत प्रकृति (Dual Nature)' },
        { id: 'p12_12', en: 'Atoms', gu: 'પરમાણુઓ (Atoms)', hi: 'परमाणु (Atoms)' },
        { id: 'p12_13', en: 'Nuclei', gu: 'ન્યુક્લિયસ (Nuclei)', hi: 'नाभिक (Nuclei)' },
        { id: 'p12_14', en: 'Semiconductor Electronics', gu: 'અર્ધવાહક ઇલેક્ટ્રોનિક્સ (Semiconductor Electronics)', hi: 'अर्धचालक इलेक्ट्रॉनिकी (Semiconductor Electronics)' }
      ]
    },
    chemistry: {
      11: [
        { id: 'c11_1', en: 'Some Basic Concepts of Chemistry', gu: 'રસાયણ વિજ્ઞાનની કેટલીક પાયાની સંકલ્પનાઓ (Basic Concepts)', hi: 'रसायन विज्ञान की कुछ मूल अवधारणाएँ (Basic Concepts)' },
        { id: 'c11_2', en: 'Structure of Atom', gu: 'પરમાણુનું બંધારણ (Structure of Atom)', hi: 'परमाणु की संरचना (Structure of Atom)' },
        { id: 'c11_3', en: 'Classification of Elements and Periodicity in Properties', gu: 'તત્ત્વોનું વર્ગીકરણ અને ગુણધર્મોમાં આવર્તિતા (Periodicity)', hi: 'तत्वों का वर्गीकरण एवं गुणधर्मों में आवर्तिता (Periodicity)' },
        { id: 'c11_4', en: 'Chemical Bonding and Molecular Structure', gu: 'રાસાયણિક બંધન અને આણ્વીય રચના (Chemical Bonding)', hi: 'रासायनिक आबंधन तथा आण्विक संरचना (Chemical Bonding)' },
        { id: 'c11_5', en: 'Chemical Thermodynamics', gu: 'રાસાયણિક ઉષ્માગતિશાસ્ત્ર (Chemical Thermodynamics)', hi: 'रासायनिक ऊष्मागतिकी (Chemical Thermodynamics)' },
        { id: 'c11_6', en: 'Equilibrium', gu: 'સંતુલન (Equilibrium)', hi: 'साम्यावस्था (Equilibrium)' },
        { id: 'c11_7', en: 'Redox Reactions', gu: 'રેડોક્ષ પ્રક્રિયાઓ (Redox Reactions)', hi: 'अपचयोपचय अभिक्रियाएँ (Redox Reactions)' },
        { id: 'c11_8', en: 'Organic Chemistry: Some Basic Principles and Techniques (GOC)', gu: 'કાર્બનિક રસાયણવિજ્ઞાન: પાયાના સિદ્ધાંતો અને પદ્ધતિઓ (GOC)', hi: 'कार्बनिक रसायन: कुछ आधारभूत सिद्धांत तथा तकनीकें (GOC)' },
        { id: 'c11_9', en: 'Hydrocarbons', gu: 'હાઇડ્રોકાર્બન (Hydrocarbons)', hi: 'हाइड्रोकार्बन (Hydrocarbons)' },
        { id: 'c11_10', en: 'Purification and Characterisation of Organic Compounds', gu: 'કાર્બનિક સંયોજનોનું શુદ્ધિકરણ અને લાક્ષણિકતા (Purification & Characterisation)', hi: 'कार्बनिक यौगिकों का शोधन एवं अभिलक्षणन (Purification & Characterisation)' }
      ],
      12: [
        { id: 'c12_1', en: 'Solutions', gu: 'દ્રાવણો (Solutions)', hi: 'विलयन (Solutions)' },
        { id: 'c12_2', en: 'Electrochemistry', gu: 'વિદ્યુત-રસાયણ (Electrochemistry)', hi: 'वैद्युतरसायन (Electrochemistry)' },
        { id: 'c12_3', en: 'Chemical Kinetics', gu: 'રાસાયણિક ગતિકી (Chemical Kinetics)', hi: 'रासायनिक बलगतिकी (Chemical Kinetics)' },
        { id: 'c12_4', en: 'The p-Block Elements (Group 13 to 18 — JEE Main Syllabus)', gu: 'p-વિભાગનાં તત્ત્વો (p-Block Elements — JEE Main)', hi: 'p-ब्लॉक के तत्व (p-Block Elements — JEE Main)' },
        { id: 'c12_5', en: 'The d- and f-Block Elements', gu: 'd- અને f-વિભાગનાં તત્ત્વો (d- and f-Block Elements)', hi: 'd- एवं f-ब्लॉक के तत्व (d- and f-Block Elements)' },
        { id: 'c12_6', en: 'Coordination Compounds', gu: 'સવર્ગ સંયોજનો (Coordination Compounds)', hi: 'उपसहसंयोजन यौगिक (Coordination Compounds)' },
        { id: 'c12_7', en: 'Haloalkanes and Haloarenes', gu: 'હેલોઆલ્કેન અને હેલોએરીન સંયોજનો (Haloalkanes and Haloarenes)', hi: 'हैलोऐल्केन तथा हैलोऐरीन (Haloalkanes and Haloarenes)' },
        { id: 'c12_8', en: 'Alcohols, Phenols and Ethers', gu: 'આલ્કોહોલ, ફિનોલ અને ઇથર સંયોજનો (Alcohols, Phenols and Ethers)', hi: 'ऐल्कोहॉल, फीनॉल एवं ईथर (Alcohols, Phenols and Ethers)' },
        { id: 'c12_9', en: 'Aldehydes, Ketones and Carboxylic Acids', gu: 'આલ્ડિહાઇડ, કીટોન અને કાર્બોક્સિલિક એસિડ (Aldehydes, Ketones & Acids)', hi: 'ऐल्डिहाइड, कीटोन एवं कार्बोक्सिलिक अम्ल (Aldehydes, Ketones & Acids)' },
        { id: 'c12_10', en: 'Amines', gu: 'એમાઇન સંયોજનો (Amines)', hi: 'ऐमीन (Amines)' },
        { id: 'c12_11', en: 'Biomolecules', gu: 'જૈવિક અણુઓ (Biomolecules)', hi: 'जैव-अणु (Biomolecules)' },
        { id: 'c12_12', en: 'Principles Related to Practical Chemistry', gu: 'પ્રાયોગિક રસાયણ વિજ્ઞાનના સિદ્ધાંતો (Practical Chemistry)', hi: 'प्रायोगिक रसायन से संबंधित सिद्धांत (Practical Chemistry)' }
      ]
    },
    maths: {
      11: [
        { id: 'm11_1', en: 'Sets', gu: 'ગણ (Sets)', hi: 'समुच्चय (Sets)' },
        { id: 'm11_2', en: 'Relations and Functions (Class 11)', gu: 'સંબંધ અને વિધયો (Relations and Functions)', hi: 'संबंध एवं फलन (Relations and Functions)' },
        { id: 'm11_3', en: 'Trigonometric Functions', gu: 'ત્રિકોણમિતિય વિધેય (Trigonometric Functions)', hi: 'त्रिकोणमितीय फलन (Trigonometric Functions)' },
        { id: 'm11_4', en: 'Complex Numbers and Quadratic Equations', gu: 'સંકર સંખ્યાઓ અને દ્વિઘાત સમીકરણો (Complex Numbers & Quadratic Equations)', hi: 'सम्मिश्र संख्याएँ और द्विघात समीकरण (Complex Numbers & Quadratic Equations)' },
        { id: 'm11_5', en: 'Linear Inequalities', gu: 'સુરેખ અસમતાઓ (Linear Inequalities)', hi: 'रैखिक असमिकाएँ (Linear Inequalities)' },
        { id: 'm11_6', en: 'Permutations and Combinations', gu: 'ક્રમચય અને સંચય (Permutations and Combinations)', hi: 'क्रमचय और संचय (Permutations and Combinations)' },
        { id: 'm11_7', en: 'Binomial Theorem', gu: 'દ્વિપદી પ્રમેય (Binomial Theorem)', hi: 'द्विपद प्रमेय (Binomial Theorem)' },
        { id: 'm11_8', en: 'Sequences and Series', gu: 'શ્રેણી અને શ્રેઢી (Sequences and Series)', hi: 'अनुक्रम तथा श्रेणी (Sequences and Series)' },
        { id: 'm11_9', en: 'Straight Lines', gu: 'સુરેખાઓ (Straight Lines)', hi: 'सरल रेखाएँ (Straight Lines)' },
        { id: 'm11_10', en: 'Conic Sections', gu: 'શાંકવો (Conic Sections)', hi: 'शंकु परिच्छेद (Conic Sections)' },
        { id: 'm11_11', en: 'Introduction to Three Dimensional Geometry', gu: 'ત્રિપરિમાણીય ભૂમિતિનો પરિચય (3D Geometry Intro)', hi: 'त्रिविमीय ज्यामिति का परिचय (3D Geometry Intro)' },
        { id: 'm11_12', en: 'Limits and Derivatives', gu: 'લક્ષ અને વિકલન (Limits & Derivatives)', hi: 'सीमा और अवकलज (Limits & Derivatives)' },
        { id: 'm11_13', en: 'Statistics', gu: 'આંકડાશાસ્ત્ર (Statistics)', hi: 'सांख्यिकी (Statistics)' },
        { id: 'm11_14', en: 'Probability (Class 11)', gu: 'સંભાવના - ધોરણ 11 (Probability)', hi: 'प्रायिकता - कक्षा 11 (Probability)' }
      ],
      12: [
        { id: 'm12_1', en: 'Relations and Functions (Class 12)', gu: 'સંબંધ અને વિધેય - ધોરણ 12 (Relations and Functions)', hi: 'संबंध एवं फलन - कक्षा 12 (Relations and Functions)' },
        { id: 'm12_2', en: 'Inverse Trigonometric Functions', gu: 'ત્રિકોણમિતિય પ્રતિવિધયો (Inverse Trigonometric Functions)', hi: 'प्रतिलोम त्रिकोणमितीय फलन (Inverse Trigonometric Functions)' },
        { id: 'm12_3', en: 'Matrices', gu: 'શ્રેણિક (Matrices)', hi: 'आव्यूह (Matrices)' },
        { id: 'm12_4', en: 'Determinants', gu: 'નિશ્ચાયક (Determinants)', hi: 'सारणिक (Determinants)' },
        { id: 'm12_5', en: 'Continuity and Differentiability', gu: 'સાતત્ય અને વિકલનીયતા (Continuity & Differentiability)', hi: 'सांतत्य तथा अवकलनीयता (Continuity & Differentiability)' },
        { id: 'm12_6', en: 'Application of Derivatives', gu: 'વિકલિતના ઉપયોગો (Application of Derivatives)', hi: 'अवकलज के अनुप्रयोग (Application of Derivatives)' },
        { id: 'm12_7', en: 'Integrals', gu: 'સંકલન (Integrals)', hi: 'समाकलन (Integrals)' },
        { id: 'm12_8', en: 'Application of Integrals', gu: 'સંકલનના ઉપયોગો (Application of Integrals)', hi: 'समाकलनों के अनुप्रयोग (Application of Integrals)' },
        { id: 'm12_9', en: 'Differential Equations', gu: 'વિકલ સમીકરણો (Differential Equations)', hi: 'अवकल समीकरण (Differential Equations)' },
        { id: 'm12_10', en: 'Vector Algebra', gu: 'સદીશ બીજગણિત (Vector Algebra)', hi: 'सदिश बीजगणित (Vector Algebra)' },
        { id: 'm12_11', en: 'Three Dimensional Geometry', gu: 'ત્રિપરિમાણીય ભૂમિતિ (Three Dimensional Geometry)', hi: 'त्रिविमीय ज्यामिति (Three Dimensional Geometry)' },
        { id: 'm12_12', en: 'Linear Programming', gu: 'સુરેખ આયોજન (Linear Programming)', hi: 'रैखिक प्रोग्रामन (Linear Programming)' },
        { id: 'm12_13', en: 'Probability (Class 12)', gu: 'સંભાવના - ધોરણ 12 (Probability)', hi: 'प्रायिकता - कक्षा 12 (Probability)' }
      ]
    }
  };

  // ================= APPLICATION STATE =================
  let questions = [];
  let subjectsInPaper = [];
  let chaptersInPaper = [];
  let filteredIndices = [];
  let activeStorageKey = STORAGE_KEY_PREFIX + 'default';
  let timerInterval = null;

  let state = {
    currentQuestionId: 1,
    responses: {},
    markedForReview: {},
    visited: {},
    elapsedSeconds: 0,
    isSubmitted: false
  };

  // Interactive Prompt Generator State
  let pgState = {
    lang: 'gu',
    subjects: new Set(['maths']),
    classFilter: 'both',
    questionCount: 50,
    selectedChapters: new Set(['m11_2', 'm11_3', 'm11_4', 'm12_3', 'm12_4'])
  };

  // ================= DOM ELEMENTS =================
  const dom = {
    currentSubjectBadge: document.getElementById('currentSubjectBadge'),
    currentSectionBadge: document.getElementById('currentSectionBadge'),
    subjectSelect: document.getElementById('subjectSelect'),
    chapterSelect: document.getElementById('chapterSelect'),
    reviewFilterWrap: document.getElementById('reviewFilterWrap'),
    reviewFilterSelect: document.getElementById('reviewFilterSelect'),
    timerDisplay: document.getElementById('timerDisplay'),
    openPromptGenBtn: document.getElementById('openPromptGenBtn'),
    openLoaderBtn: document.getElementById('openLoaderBtn'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    mobilePaletteBtn: document.getElementById('mobilePaletteBtn'),
    answeredCountMobile: document.getElementById('answeredCountMobile'),
    submitExamBtn: document.getElementById('submitExamBtn'),
    viewScorecardBtn: document.getElementById('viewScorecardBtn'),

    examWorkspace: document.getElementById('examWorkspace'),
    questionNumberLabel: document.getElementById('questionNumberLabel'),
    chapterTitleLabel: document.getElementById('chapterTitleLabel'),
    reviewStatusBadge: document.getElementById('reviewStatusBadge'),
    questionText: document.getElementById('questionText'),
    optionsContainer: document.getElementById('optionsContainer'),
    answerVerificationBox: document.getElementById('answerVerificationBox'),

    prevQuestionBtn: document.getElementById('prevQuestionBtn'),
    markReviewBtn: document.getElementById('markReviewBtn'),
    clearResponseBtn: document.getElementById('clearResponseBtn'),
    nextQuestionBtn: document.getElementById('nextQuestionBtn'),

    paletteSidebar: document.getElementById('paletteSidebar'),
    closePaletteBtn: document.getElementById('closePaletteBtn'),
    statAnswered: document.getElementById('statAnswered'),
    statReview: document.getElementById('statReview'),
    statUnanswered: document.getElementById('statUnanswered'),
    statUnvisited: document.getElementById('statUnvisited'),
    paletteGrid: document.getElementById('paletteGrid'),
    resetProgressBtn: document.getElementById('resetProgressBtn'),

    scorecardView: document.getElementById('scorecardView'),
    reviewQuestionsBtn: document.getElementById('reviewQuestionsBtn'),
    retakeExamBtn: document.getElementById('retakeExamBtn'),
    resTotalMarks: document.getElementById('resTotalMarks'),
    resNormalizedMarks: document.getElementById('resNormalizedMarks'),
    resPercentile: document.getElementById('resPercentile'),
    resPrRemark: document.getElementById('resPrRemark'),
    resAccuracy: document.getElementById('resAccuracy'),
    resAttemptRatio: document.getElementById('resAttemptRatio'),
    resTimeTaken: document.getElementById('resTimeTaken'),
    resAvgTime: document.getElementById('resAvgTime'),
    resCorrectCount: document.getElementById('resCorrectCount'),
    resPositiveMarks: document.getElementById('resPositiveMarks'),
    resWrongCount: document.getElementById('resWrongCount'),
    resNegativeMarks: document.getElementById('resNegativeMarks'),
    resSkippedCount: document.getElementById('resSkippedCount'),
    subjectAnalysisBody: document.getElementById('subjectAnalysisBody'),
    chapterAnalysisBody: document.getElementById('chapterAnalysisBody'),

    // Prompt Generator Modal Elements
    promptGenModal: document.getElementById('promptGenModal'),
    closePromptModalBtn: document.getElementById('closePromptModalBtn'),
    pgLangGroup: document.getElementById('pgLangGroup'),
    pgSubjectGroup: document.getElementById('pgSubjectGroup'),
    pgClassGroup: document.getElementById('pgClassGroup'),
    pgQuestionCount: document.getElementById('pgQuestionCount'),
    pgDistributionHint: document.getElementById('pgDistributionHint'),
    pgSelectAllChaptersBtn: document.getElementById('pgSelectAllChaptersBtn'),
    pgClearAllChaptersBtn: document.getElementById('pgClearAllChaptersBtn'),
    pgChaptersContainer: document.getElementById('pgChaptersContainer'),
    pgOutputSection: document.getElementById('pgOutputSection'),
    pgPromptOutput: document.getElementById('pgPromptOutput'),
    pgCopyPromptBtn: document.getElementById('pgCopyPromptBtn'),
    pgSwitchToPasteBtn: document.getElementById('pgSwitchToPasteBtn'),
    pgStatusText: document.getElementById('pgStatusText'),
    pgGenerateBtn: document.getElementById('pgGenerateBtn'),

    // Loader Modal Elements
    loaderModal: document.getElementById('loaderModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    mdFileInput: document.getElementById('mdFileInput'),
    mdPasteTextarea: document.getElementById('mdPasteTextarea'),
    loadPastedMdBtn: document.getElementById('loadPastedMdBtn')
  };

  // ================= INITIALIZATION =================
  function init() {
    initTheme();
    bindEvents();
    renderPromptBuilderUI();
    loadInitialMarkdown();
  }

  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    dom.themeToggleBtn.textContent = savedTheme === 'dark' ? '☀' : '☽';
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
    dom.themeToggleBtn.textContent = next === 'dark' ? '☀' : '☽';
  }

  async function loadInitialMarkdown() {
    // 1. Check if user previously pasted custom AI response or uploaded a file
    const cachedMd = localStorage.getItem(CUSTOM_MD_STORAGE_KEY);

    // 2. Try fetching ./questions.md first if no custom paste override exists
    if (!cachedMd) {
      try {
        const response = await fetch('./questions.md', { cache: 'no-cache' });
        if (response.ok) {
          const mdText = await response.text();
          if (mdText && mdText.trim().length > 50) {
            bootWithMarkdown(mdText);
            return;
          }
        }
      } catch (err) {
        // Ignore fetch error on file:// protocol
      }
    }

    if (cachedMd && cachedMd.trim().length > 50) {
      bootWithMarkdown(cachedMd);
      return;
    }

    // Try ./questions.md as second fallback
    try {
      const response = await fetch('./questions.md', { cache: 'no-cache' });
      if (response.ok) {
        const mdText = await response.text();
        if (mdText && mdText.trim().length > 50) {
          bootWithMarkdown(mdText);
          return;
        }
      }
    } catch (e) {
      // Ignore
    }

    dom.questionText.innerHTML =
      '<code>questions.md</code> ફાઇલ લોડ કરવા માટે ઉપરના <strong>📄 ફાઇલ</strong> બટન પર ક્લિક કરો, અથવા નવા પ્રશ્નો બનાવવા <strong>⚡ Prompt Maker</strong> વાપરો.';
  }

  // ================= SUBJECT AUTO-DETECTION & MARKDOWN PARSER =================
  function detectSubjectKeyFromText(text) {
    const lower = text.toLowerCase();
    if (
      lower.includes('physics') ||
      lower.includes('ભૌતિક') ||
      lower.includes('भौतिक') ||
      lower.includes('electrostatics') ||
      lower.includes('optics') ||
      lower.includes('kinematics') ||
      lower.includes('gravitation')
    ) {
      return 'physics';
    }
    if (
      lower.includes('chemistry') ||
      lower.includes('રસાયણ') ||
      lower.includes('रसायन') ||
      lower.includes('hydrocarbon') ||
      lower.includes('coordination') ||
      lower.includes('electrochemistry') ||
      lower.includes('biomolecules') ||
      lower.includes('haloalkanes')
    ) {
      return 'chemistry';
    }
    if (
      lower.includes('math') ||
      lower.includes('ગણિત') ||
      lower.includes('गणित') ||
      lower.includes('matrices') ||
      lower.includes('શ્રેણિક') ||
      lower.includes('નિશ્ચાયક') ||
      lower.includes('trigonometr') ||
      lower.includes('calculus') ||
      lower.includes('vector')
    ) {
      return 'maths';
    }
    return null;
  }

  /**
   * Parses `questions.md` supporting Physics, Chemistry, and Maths across Gujarati, Hindi, and English.
   */
  function parseQuestionsMarkdown(rawMd) {
    // Strip optional tags if present
        const cleanedMd = rawMd.replace(/\r\n/g, '\n').replace(/\[source:\s*\d+\]/gi, '');

    let bodyPart = cleanedMd;
    let answerPart = '';

    // Match Answer Key header in Gujarati, Hindi, or English
    const answerHeaderMatch = cleanedMd.match(
      /###\s*\*\*.*?(?:ઉત્તરવહી|उत्तर\s*कुंजी|Answer\s*Key).*?\*\*/i
    );
    if (answerHeaderMatch) {
      const splitIdx = answerHeaderMatch.index;
      bodyPart = cleanedMd.slice(0, splitIdx);
      answerPart = cleanedMd.slice(splitIdx);
    }

    // 1. Parse Answer Key Table (supports 4-column or 1-column markdown tables, bold or plain numbers)
    const answerKeyMap = {};
    const ansRegex = /(?:\*\*(\d+)\*\*|\b(\d+)\b)\s*\|\s*\**([A-D])\**/gi;
    let ansMatch;
    while ((ansMatch = ansRegex.exec(answerPart)) !== null) {
      const qNum = parseInt(ansMatch[1] || ansMatch[2], 10);
      const opt = ansMatch[3].toUpperCase();
      if (!Number.isNaN(qNum)) {
        answerKeyMap[qNum] = opt;
      }
    }

    // 2. Parse Hierarchy: Subject (##), Section/Class (###), Chapter (####), Questions (**1.**), Options ((A))
    const lines = bodyPart.split('\n');
    const parsedQuestions = [];
    const subjectSet = new Set();
    const chapterList = [];
    const chapterSeen = new Set();

    // Detect default subject from intro paragraph if no ## Subject header is used
    let currentSubjectKey = detectSubjectKeyFromText(bodyPart.slice(0, 600)) || 'maths';
    let currentSection = 'JEE Main 2027';
    let currentChapter = 'General';
    let currentQ = null;

    const subjectHeaderRegex = /^##\s+\*\*(.+?)\*\*\s*$/;
    const sectionHeaderRegex = /^###\s+\*\*(.+?)\*\*\s*$/;
    const chapterHeaderRegex = /^####\s+\*\*(.+?)\*\*\s*$/;
    const questionStartRegex = /^(?:\*\*(\d+)\.\*\*|\*\*પ્રશ્ન\s*(\d+)\.\*\*|\*\*प्रश्न\s*(\d+)\.\*\*|\*\*Q\.?\s*(\d+)\.\*\*)\s*(.+)$/i;
    const optionLineRegex = /^\(([A-D])\)\s*(.+)$/;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line === '---') continue;

      // Check Subject Header (## **વિષય: ભૌતિક વિજ્ઞાન (Physics)**)
      const subjMatch = line.match(subjectHeaderRegex);
      if (subjMatch) {
        const rawSubj = subjMatch[1].trim();
        const detected = detectSubjectKeyFromText(rawSubj);
        if (detected) currentSubjectKey = detected;
        continue;
      }

      // Check Section / Class Header (### **વિભાગ I: ધોરણ 11 (Class 11)**)
      const secMatch = line.match(sectionHeaderRegex);
      if (secMatch) {
        const rawSec = secMatch[1].trim();
        // Sometimes AI puts Subject inside ### instead of ##
        const detectedSubj = detectSubjectKeyFromText(rawSec);
        if (detectedSubj && (rawSec.toLowerCase().includes('subject') || rawSec.includes('વિષય') || rawSec.includes('विषय'))) {
          currentSubjectKey = detectedSubj;
        } else {
          currentSection = rawSec;
        }
        continue;
      }

      // Check Chapter Header (#### **પ્રકરણ 2: ...**)
      const chapMatch = line.match(chapterHeaderRegex);
      if (chapMatch) {
        currentChapter = chapMatch[1].trim();
        const chapSubj = detectSubjectKeyFromText(currentChapter);
        if (chapSubj && subjectSet.size === 0) {
          currentSubjectKey = chapSubj;
        }
        continue;
      }

      // Check Question Start (**1.** ...)
      const qMatch = line.match(questionStartRegex);
      if (qMatch) {
        if (currentQ) {
          parsedQuestions.push(currentQ);
        }
        const qId = parseInt(qMatch[1] || qMatch[2] || qMatch[3] || qMatch[4], 10);
        const qText = qMatch[5].trim();

        subjectSet.add(currentSubjectKey);
        if (!chapterSeen.has(currentChapter)) {
          chapterSeen.add(currentChapter);
          chapterList.push({ subjectKey: currentSubjectKey, title: currentChapter });
        }

        currentQ = {
          id: qId,
          subjectKey: currentSubjectKey,
          subjectLabel: SUBJECT_META[currentSubjectKey] ? SUBJECT_META[currentSubjectKey].gu : 'ગણિત (Maths)',
          section: currentSection,
          chapter: currentChapter,
          statementLines: [qText],
          options: {},
          correctOption: answerKeyMap[qId] || null
        };
        continue;
      }

      // Inside a Question: Check Option (A)-(D) or multi-line statement continuation
      if (currentQ) {
        const optMatch = line.match(optionLineRegex);
        if (optMatch) {
          const optKey = optMatch[1].toUpperCase();
          currentQ.options[optKey] = optMatch[2].trim();
        } else if (Object.keys(currentQ.options).length === 0) {
          currentQ.statementLines.push(line);
        }
      }
    }

    if (currentQ) {
      parsedQuestions.push(currentQ);
    }

    return {
      questions: parsedQuestions,
      subjects: Array.from(subjectSet),
      chapters: chapterList
    };
  }

  // ================= STATE & LOCALSTORAGE =================
  function computeHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return (hash >>> 0).toString(16);
  }

  function loadStateFromStorage() {
    try {
      const raw = localStorage.getItem(activeStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = {
          currentQuestionId: parsed.currentQuestionId || (questions[0] ? questions[0].id : 1),
          responses: parsed.responses || {},
          markedForReview: parsed.markedForReview || {},
          visited: parsed.visited || {},
          elapsedSeconds: Number.isFinite(parsed.elapsedSeconds) ? parsed.elapsedSeconds : 0,
          isSubmitted: Boolean(parsed.isSubmitted)
        };
        return;
      }
    } catch (e) {
      console.error('Error loading state:', e);
    }

    state = {
      currentQuestionId: questions[0] ? questions[0].id : 1,
      responses: {},
      markedForReview: {},
      visited: {},
      elapsedSeconds: 0,
      isSubmitted: false
    };
  }

  function saveStateToStorage() {
    try {
      localStorage.setItem(activeStorageKey, JSON.stringify(state));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }

  // ================= BOOTSTRAP QUESTION PAPER =================
  function bootWithMarkdown(mdText) {
    const parsed = parseQuestionsMarkdown(mdText);
    if (!parsed.questions.length) {
      alert('આ ફાઇલમાંથી કોઈ પ્રશ્નો મળ્યા નથી. કૃપા કરીને ફોર્મેટ તપાસો.');
      return;
    }

    questions = parsed.questions;
    subjectsInPaper = parsed.subjects;
    chaptersInPaper = parsed.chapters;
    activeStorageKey = STORAGE_KEY_PREFIX + computeHash(mdText.slice(0, 2500) + questions.length);

    loadStateFromStorage();
    populateSubjectDropdown();
    populateChapterDropdown();
    applyFilters();

    if (!questions.some((q) => q.id === state.currentQuestionId)) {
      state.currentQuestionId = questions[0].id;
    }

    state.visited[state.currentQuestionId] = true;
    saveStateToStorage();

    syncSubmissionUI();
    showWorkspaceView();
    startTimer();
  }

  function populateSubjectDropdown() {
    dom.subjectSelect.innerHTML = `<option value="all">બધા વિષયો (All — ${questions.length})</option>`;
    subjectsInPaper.forEach((subjKey) => {
      const count = questions.filter((q) => q.subjectKey === subjKey).length;
      const opt = document.createElement('option');
      opt.value = subjKey;
      const meta = SUBJECT_META[subjKey];
      opt.textContent = `${meta ? meta.gu : subjKey} (${count})`;
      dom.subjectSelect.appendChild(opt);
    });
  }

  function populateChapterDropdown() {
    const selectedSubject = dom.subjectSelect.value;
    dom.chapterSelect.innerHTML = '<option value="all">બધા પ્રકરણો (All Chapters)</option>';

    chaptersInPaper.forEach((chObj) => {
      if (selectedSubject !== 'all' && chObj.subjectKey !== selectedSubject) return;
      const count = questions.filter(
        (q) => q.chapter === chObj.title && (selectedSubject === 'all' || q.subjectKey === selectedSubject)
      ).length;
      const opt = document.createElement('option');
      opt.value = chObj.title;
      opt.textContent = `${chObj.title} (${count})`;
      dom.chapterSelect.appendChild(opt);
    });
  }

  function applyFilters() {
    const selectedSubject = dom.subjectSelect.value;
    const selectedChapter = dom.chapterSelect.value;
    const reviewMode = state.isSubmitted ? dom.reviewFilterSelect.value : 'all';

    filteredIndices = [];
    questions.forEach((q, idx) => {
      if (selectedSubject !== 'all' && q.subjectKey !== selectedSubject) return;
      if (selectedChapter !== 'all' && q.chapter !== selectedChapter) return;

      if (state.isSubmitted && reviewMode !== 'all') {
        const userAns = state.responses[q.id];
        if (reviewMode === 'correct' && (!userAns || userAns !== q.correctOption)) return;
        if (reviewMode === 'incorrect' && (!userAns || userAns === q.correctOption)) return;
        if (reviewMode === 'unattempted' && userAns) return;
      }

      filteredIndices.push(idx);
    });
  }

  // ================= RENDERING & KATEX =================
  function renderLatex(element) {
    if (typeof window.renderMathInElement === 'function') {
      window.renderMathInElement(element, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false },
          { left: '\\[', right: '\\]', display: true }
        ],
        throwOnError: false
      });
    } else {
      setTimeout(() => renderLatex(element), 120);
    }
  }

  function renderCurrentQuestion() {
    if (!questions.length) return;

    let currentIdx = questions.findIndex((q) => q.id === state.currentQuestionId);
    if (currentIdx === -1 || (filteredIndices.length > 0 && !filteredIndices.includes(currentIdx))) {
      currentIdx = filteredIndices.length > 0 ? filteredIndices[0] : 0;
      state.currentQuestionId = questions[currentIdx].id;
    }

    if (filteredIndices.length === 0) {
      dom.questionText.innerHTML = 'આ ફિલ્ટરમાં કોઈ પ્રશ્ન નથી. કૃપા કરીને ઉપરથી બીજો વિષય અથવા પ્રકરણ પસંદ કરો.';
      dom.optionsContainer.innerHTML = '';
      dom.answerVerificationBox.classList.add('hidden');
      return;
    }

    const q = questions[currentIdx];
    state.visited[q.id] = true;
    saveStateToStorage();

    // Update Top & Question Metadata
    const subjMeta = SUBJECT_META[q.subjectKey] || SUBJECT_META.maths;
    dom.currentSubjectBadge.textContent = subjMeta.gu;
    dom.currentSectionBadge.textContent = q.section;
    dom.questionNumberLabel.textContent = `પ્રશ્ન ${q.id} / ${questions.length}`;
    dom.chapterTitleLabel.textContent = q.chapter;

    // Render Statement
    dom.questionText.innerHTML = q.statementLines.join('<br />');

    // Render 4 Options
    const userSelected = state.responses[q.id] || null;
    dom.optionsContainer.innerHTML = '';

    ['A', 'B', 'C', 'D'].forEach((optKey) => {
      if (!q.options[optKey]) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-item';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', userSelected === optKey ? 'true' : 'false');

      if (!state.isSubmitted) {
        if (userSelected === optKey) {
          btn.classList.add('selected');
        }
        btn.addEventListener('click', () => handleSelectOption(q.id, optKey));
      } else {
        btn.classList.add('locked');
        if (optKey === q.correctOption) {
          btn.classList.add('correct-answer');
        } else if (userSelected === optKey && userSelected !== q.correctOption) {
          btn.classList.add('wrong-selected');
        }
      }

      const keySpan = document.createElement('span');
      keySpan.className = 'option-key';
      keySpan.textContent = `(${optKey})`;

      const contentSpan = document.createElement('span');
      contentSpan.className = 'option-content';
      contentSpan.innerHTML = q.options[optKey];

      btn.appendChild(keySpan);
      btn.appendChild(contentSpan);
      dom.optionsContainer.appendChild(btn);
    });

    // Post-Submit Answer Key Verification
    if (state.isSubmitted) {
      dom.reviewStatusBadge.classList.remove('hidden', 'pill-correct', 'pill-wrong', 'pill-skipped');
      dom.answerVerificationBox.classList.remove('hidden');

      if (!userSelected) {
        dom.reviewStatusBadge.textContent = 'છોડી દીધેલ (0)';
        dom.reviewStatusBadge.classList.add('pill-skipped');
        dom.answerVerificationBox.innerHTML = `
          <span>તમારો જવાબ: <strong>અટેમ્પ્ટ નથી કર્યો</strong></span>
          <span>સત્તાવાર સાચો વિકલ્પ (Answer Key): <strong>(${q.correctOption || '?'})</strong></span>
        `;
      } else if (userSelected === q.correctOption) {
        dom.reviewStatusBadge.textContent = 'સાચો જવાબ (+4)';
        dom.reviewStatusBadge.classList.add('pill-correct');
        dom.answerVerificationBox.innerHTML = `
          <span>તમારો જવાબ: <strong>(${userSelected}) — સાચો (+4 ગુણ)</strong></span>
          <span>સત્તાવાર સાચો વિકલ્પ (Answer Key): <strong>(${q.correctOption})</strong></span>
        `;
      } else {
        dom.reviewStatusBadge.textContent = 'ખોટો જવાબ (−1)';
        dom.reviewStatusBadge.classList.add('pill-wrong');
        dom.answerVerificationBox.innerHTML = `
          <span>તમારો જવાબ: <strong>(${userSelected}) — ખોટો (−1 ગુણ)</strong></span>
          <span>સત્તાવાર સાચો વિકલ્પ (Answer Key): <strong>(${q.correctOption || '?'})</strong></span>
        `;
      }
    } else {
      dom.reviewStatusBadge.classList.add('hidden');
      dom.answerVerificationBox.classList.add('hidden');
    }

    // Navigation & Control Buttons
    const posInFilter = filteredIndices.indexOf(currentIdx);
    dom.prevQuestionBtn.disabled = posInFilter <= 0;
    dom.nextQuestionBtn.disabled = posInFilter === -1 || posInFilter >= filteredIndices.length - 1;

    const isMarked = Boolean(state.markedForReview[q.id]);
    dom.markReviewBtn.classList.toggle('active-mark', isMarked);
    dom.markReviewBtn.textContent = isMarked
      ? '★ પુનઃસમીક્ષામાં છે (Marked)'
      : 'પુનઃસમીક્ષા (Mark for Review)';

    dom.markReviewBtn.disabled = state.isSubmitted;
    dom.clearResponseBtn.disabled = state.isSubmitted || !userSelected;

    renderLatex(dom.questionText);
    renderLatex(dom.optionsContainer);
  }

  function renderPalette() {
    dom.paletteGrid.innerHTML = '';

    let answeredCount = 0;
    let reviewCount = 0;
    let unansweredCount = 0;
    let unvisitedCount = 0;

    questions.forEach((q, idx) => {
      const hasAns = Boolean(state.responses[q.id]);
      const isMarked = Boolean(state.markedForReview[q.id]);
      const isVisited = Boolean(state.visited[q.id]);

      if (hasAns) answeredCount++;
      if (isMarked) reviewCount++;
      if (isVisited && !hasAns) unansweredCount++;
      if (!isVisited && !hasAns) unvisitedCount++;

      if (!filteredIndices.includes(idx)) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'palette-btn';
      btn.textContent = q.id;

      if (q.id === state.currentQuestionId) {
        btn.classList.add('current-q');
      }

      if (state.isSubmitted) {
        const userAns = state.responses[q.id];
        if (userAns && userAns === q.correctOption) {
          btn.classList.add('eval-correct');
        } else if (userAns && userAns !== q.correctOption) {
          btn.classList.add('eval-wrong');
        }
      } else {
        if (isMarked) {
          btn.classList.add('st-review');
        } else if (hasAns) {
          btn.classList.add('st-answered');
        } else if (isVisited) {
          btn.classList.add('st-unanswered');
        }
      }

      btn.addEventListener('click', () => {
        state.currentQuestionId = q.id;
        renderCurrentQuestion();
        renderPalette();
        closeMobileDrawer();
      });

      dom.paletteGrid.appendChild(btn);
    });

    dom.statAnswered.textContent = answeredCount;
    dom.statReview.textContent = reviewCount;
    dom.statUnanswered.textContent = unansweredCount;
    dom.statUnvisited.textContent = unvisitedCount;
    dom.answeredCountMobile.textContent = `${answeredCount}/${questions.length}`;
  }

  // ================= USER INTERACTIONS =================
  function handleSelectOption(qId, optKey) {
    if (state.isSubmitted) return;
    if (state.responses[qId] === optKey) {
      delete state.responses[qId];
    } else {
      state.responses[qId] = optKey;
    }
    saveStateToStorage();
    renderCurrentQuestion();
    renderPalette();
  }

  function navigateRelative(delta) {
    const currentIdx = questions.findIndex((q) => q.id === state.currentQuestionId);
    const posInFilter = filteredIndices.indexOf(currentIdx);
    const targetPos = posInFilter + delta;

    if (targetPos >= 0 && targetPos < filteredIndices.length) {
      const nextGlobalIdx = filteredIndices[targetPos];
      state.currentQuestionId = questions[nextGlobalIdx].id;
      renderCurrentQuestion();
      renderPalette();
    }
  }

  function handleToggleReview() {
    if (state.isSubmitted) return;
    const qId = state.currentQuestionId;
    if (state.markedForReview[qId]) {
      delete state.markedForReview[qId];
    } else {
      state.markedForReview[qId] = true;
    }
    saveStateToStorage();
    renderCurrentQuestion();
    renderPalette();
  }

  function handleClearResponse() {
    if (state.isSubmitted) return;
    delete state.responses[state.currentQuestionId];
    saveStateToStorage();
    renderCurrentQuestion();
    renderPalette();
  }

  // ================= TIMER =================
  function formatTime(totalSec) {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return [hrs, mins, secs].map((v) => String(v).padStart(2, '0')).join(':');
  }

  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    dom.timerDisplay.textContent = formatTime(state.elapsedSeconds);
    if (state.isSubmitted) return;

    timerInterval = setInterval(() => {
      if (!state.isSubmitted) {
        state.elapsedSeconds += 1;
        dom.timerDisplay.textContent = formatTime(state.elapsedSeconds);
        if (state.elapsedSeconds % 5 === 0) {
          saveStateToStorage();
        }
      }
    }, 1000);
  }

  // ================= SCORING & SUBJECT-WISE PERCENTILE (PR) ENGINE =================
  function interpolatePR(percentageScore, curveKey) {
    const curve = PR_CURVES[curveKey] || PR_CURVES.overall;
    const clamped = Math.max(-25, Math.min(100, percentageScore));
    for (let i = 0; i < curve.length - 1; i++) {
      const a = curve[i];
      const b = curve[i + 1];
      if (clamped >= a.pct && clamped <= b.pct) {
        const t = (clamped - a.pct) / (b.pct - a.pct);
        return a.pr + t * (b.pr - a.pr);
      }
    }
    return clamped >= 100 ? 99.99 : 4.0;
  }

  function getPrRemark(pr) {
    if (pr >= 99.0) return 'ઉત્તમ! (Top NIT / IIIT CS સ્તરની તૈયારી)';
    if (pr >= 98.0) return 'લક્ષ્યાંક સિદ્ધ! (98+ PR — મજબૂત પકડ)';
    if (pr >= 95.0) return 'ખૂબ સરસ (95+ PR — થોડા સુધારાથી 98+ શક્ય)';
    if (pr >= 90.0) return 'સારી શરૂઆત (JEE Advanced Qualifying સ્તર)';
    if (pr >= 75.0) return 'સરેરાશ (નબળા પ્રકરણોનું પુનરાવર્તન કરો)';
    return 'વધુ મહાવરાની જરૂર છે (NCERT અને પાયાના સૂત્રો તપાસો)';
  }

  function evaluateAndRenderScorecard() {
    const totalQuestions = questions.length;
    const maxMarks = totalQuestions * 4;

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    const subjectStats = {};
    subjectsInPaper.forEach((sKey) => {
      subjectStats[sKey] = { total: 0, attempted: 0, correct: 0, wrong: 0, marks: 0 };
    });

    const chapterStats = {};
    chaptersInPaper.forEach((chObj) => {
      const key = `${chObj.subjectKey}__${chObj.title}`;
      chapterStats[key] = {
        subjectKey: chObj.subjectKey,
        title: chObj.title,
        total: 0,
        attempted: 0,
        correct: 0,
        wrong: 0,
        marks: 0
      };
    });

    questions.forEach((q) => {
      const userAns = state.responses[q.id];
      const sStat = subjectStats[q.subjectKey] || (subjectStats[q.subjectKey] = { total: 0, attempted: 0, correct: 0, wrong: 0, marks: 0 });
      const cKey = `${q.subjectKey}__${q.chapter}`;
      const cStat = chapterStats[cKey] || (chapterStats[cKey] = { subjectKey: q.subjectKey, title: q.chapter, total: 0, attempted: 0, correct: 0, wrong: 0, marks: 0 });

      sStat.total += 1;
      cStat.total += 1;

      if (!userAns) {
        skippedCount += 1;
      } else if (userAns === q.correctOption) {
        correctCount += 1;
        sStat.attempted += 1;
        sStat.correct += 1;
        sStat.marks += 4;
        cStat.attempted += 1;
        cStat.correct += 1;
        cStat.marks += 4;
      } else {
        wrongCount += 1;
        sStat.attempted += 1;
        sStat.wrong += 1;
        sStat.marks -= 1;
        cStat.attempted += 1;
        cStat.wrong += 1;
        cStat.marks -= 1;
      }
    });

    const attemptedCount = correctCount + wrongCount;
    const rawMarks = correctCount * 4 - wrongCount * 1;
    const percentageScore = maxMarks > 0 ? (rawMarks / maxMarks) * 100 : 0;
    const normalizedOutOf300 = (rawMarks / maxMarks) * 300;
    const normalizedOutOf100 = (rawMarks / maxMarks) * 100;

    // Choose curve: if single subject paper, use that subject's curve; otherwise use overall curve
    const primaryCurveKey = subjectsInPaper.length === 1 ? subjectsInPaper[0] : 'overall';
    const overallPR = attemptedCount === 0 ? 0 : interpolatePR(percentageScore, primaryCurveKey);
    const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
    const avgTimePerAttempt = attemptedCount > 0 ? Math.round(state.elapsedSeconds / attemptedCount) : 0;

    dom.resTotalMarks.textContent = `${rawMarks} / ${maxMarks}`;
    dom.resNormalizedMarks.textContent = `100 માંથી: ${normalizedOutOf100.toFixed(1)} | 300 માંથી: ${normalizedOutOf300.toFixed(0)}`;
    dom.resPercentile.textContent = `${overallPR.toFixed(2)} PR`;
    dom.resPrRemark.textContent = getPrRemark(overallPR);
    dom.resAccuracy.textContent = `${accuracy.toFixed(1)}%`;
    dom.resAttemptRatio.textContent = `${attemptedCount} / ${totalQuestions} પ્રશ્નો અટેમ્પ્ટ કર્યા`;
    dom.resTimeTaken.textContent = formatTime(state.elapsedSeconds);
    dom.resAvgTime.textContent = `પ્રતિ અટેમ્પ્ટ સરેરાશ: ${avgTimePerAttempt} સેકન્ડ`;

    dom.resCorrectCount.textContent = correctCount;
    dom.resPositiveMarks.textContent = `(+${correctCount * 4})`;
    dom.resWrongCount.textContent = wrongCount;
    dom.resNegativeMarks.textContent = `(−${wrongCount})`;
    dom.resSkippedCount.textContent = skippedCount;

    // Populate Subject-Wise Table
    dom.subjectAnalysisBody.innerHTML = '';
    subjectsInPaper.forEach((sKey) => {
      const st = subjectStats[sKey];
      const maxSubjMarks = st.total * 4;
      const subjPct = maxSubjMarks > 0 ? (st.marks / maxSubjMarks) * 100 : 0;
      const subjPR = st.attempted === 0 ? 0 : interpolatePR(subjPct, sKey);
      const subjAcc = st.attempted > 0 ? ((st.correct / st.attempted) * 100).toFixed(1) + '%' : '—';
      const meta = SUBJECT_META[sKey] || { gu: sKey };

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${meta.gu}</strong></td>
        <td>${st.total}</td>
        <td>${st.attempted}</td>
        <td>${st.correct}</td>
        <td>${st.wrong}</td>
        <td>${subjAcc}</td>
        <td><strong>${st.marks}</strong> / ${maxSubjMarks}</td>
        <td><strong>${subjPR.toFixed(2)} PR</strong></td>
      `;
      dom.subjectAnalysisBody.appendChild(tr);
    });

    // Populate Chapter-Wise Table
    dom.chapterAnalysisBody.innerHTML = '';
    Object.values(chapterStats).forEach((st) => {
      const chapAcc = st.attempted > 0 ? ((st.correct / st.attempted) * 100).toFixed(0) + '%' : '—';
      const maxChapMarks = st.total * 4;
      const subjMeta = SUBJECT_META[st.subjectKey] || { en: st.subjectKey };

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${subjMeta.en}</td>
        <td><strong>${st.title}</strong></td>
        <td>${st.total}</td>
        <td>${st.attempted}</td>
        <td>${st.correct}</td>
        <td>${st.wrong}</td>
        <td>${chapAcc}</td>
        <td><strong>${st.marks}</strong> / ${maxChapMarks}</td>
      `;
      dom.chapterAnalysisBody.appendChild(tr);
    });
  }

  function syncSubmissionUI() {
    if (state.isSubmitted) {
      dom.submitExamBtn.classList.add('hidden');
      dom.viewScorecardBtn.classList.remove('hidden');
      dom.reviewFilterWrap.classList.remove('hidden');
    } else {
      dom.submitExamBtn.classList.remove('hidden');
      dom.viewScorecardBtn.classList.add('hidden');
      dom.reviewFilterWrap.classList.add('hidden');
      dom.reviewFilterSelect.value = 'all';
    }
  }

  function handleFinalSubmit() {
    const attemptedCount = Object.keys(state.responses).length;
    const confirmMsg = `તમે ${questions.length} માંથી ${attemptedCount} પ્રશ્નોના જવાબ આપ્યા છે.\n\nશું તમે ખરેખર Final Submit કરવા માંગો છો?`;
    if (!window.confirm(confirmMsg)) return;

    state.isSubmitted = true;
    if (timerInterval) clearInterval(timerInterval);
    saveStateToStorage();

    syncSubmissionUI();
    applyFilters();
    renderCurrentQuestion();
    renderPalette();
    showScorecardView();
  }

  function showScorecardView() {
    evaluateAndRenderScorecard();
    dom.examWorkspace.classList.add('hidden');
    dom.scorecardView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function showWorkspaceView() {
    dom.scorecardView.classList.add('hidden');
    dom.examWorkspace.classList.remove('hidden');
    renderCurrentQuestion();
    renderPalette();
  }

  function handleResetOrRetake() {
    const msg = 'શું તમે બધો પ્રોગ્રેસ અને જવાબો ભૂંસીને નવેસરથી શરૂ કરવા માંગો છો?';
    if (!window.confirm(msg)) return;

    localStorage.removeItem(activeStorageKey);
    dom.subjectSelect.value = 'all';
    dom.chapterSelect.value = 'all';
    dom.reviewFilterSelect.value = 'all';

    loadStateFromStorage();
    state.visited[state.currentQuestionId] = true;
    saveStateToStorage();

    syncSubmissionUI();
    populateChapterDropdown();
    applyFilters();
    showWorkspaceView();
    startTimer();
  }

  // ================= INTERACTIVE AI PROMPT GENERATOR =================
  function getVisiblePromptChapters() {
    const list = [];
    ['physics', 'chemistry', 'maths'].forEach((subjKey) => {
      if (!pgState.subjects.has(subjKey)) return;
      const classes = pgState.classFilter === 'both' ? [11, 12] : [parseInt(pgState.classFilter, 10)];
      classes.forEach((cls) => {
        const chaps = SYLLABUS_DB[subjKey][cls] || [];
        chaps.forEach((ch) => {
          list.push({ ...ch, subjectKey: subjKey, classNum: cls });
        });
      });
    });
    return list;
  }

  function updatePromptDistributionHint() {
    const visible = getVisiblePromptChapters();
    const activeSelected = visible.filter((ch) => pgState.selectedChapters.has(ch.id));
    const qCount = Math.max(10, Math.min(200, parseInt(dom.pgQuestionCount.value, 10) || 50));
    pgState.questionCount = qCount;

    if (activeSelected.length === 0) {
      dom.pgDistributionHint.textContent = 'કૃપા કરીને નીચેથી ઓછામાં ઓછું 1 પ્રકરણ પસંદ કરો.';
      return;
    }

    const perChap = (qCount / activeSelected.length).toFixed(1);
    dom.pgDistributionHint.textContent = `પસંદ કરેલા પ્રકરણો: ${activeSelected.length} | કુલ પ્રશ્નો: ${qCount} (પ્રતિ પ્રકરણ સરેરાશ ~${perChap} પ્રશ્નો)`;
  }

  function renderPromptBuilderUI() {
    // Sync Language Pills
    dom.pgLangGroup.querySelectorAll('.pill-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === pgState.lang);
    });

    // Sync Subject Pills
    dom.pgSubjectGroup.querySelectorAll('.pill-btn').forEach((btn) => {
      btn.classList.toggle('active', pgState.subjects.has(btn.dataset.subject));
    });

    // Sync Class Pills
    dom.pgClassGroup.querySelectorAll('.pill-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.class === pgState.classFilter);
    });

    // Render Chapters Container grouped by Subject & Class
    dom.pgChaptersContainer.innerHTML = '';
    const lang = pgState.lang;

    ['physics', 'chemistry', 'maths'].forEach((subjKey) => {
      if (!pgState.subjects.has(subjKey)) return;

      const subjBlock = document.createElement('div');
      subjBlock.className = 'subject-chapter-block';

      const header = document.createElement('div');
      header.className = 'subject-block-header';

      const titleSpan = document.createElement('span');
      titleSpan.className = 'subject-block-title';
      titleSpan.textContent = SUBJECT_META[subjKey][lang];

      const miniBtns = document.createElement('div');
      miniBtns.className = 'subject-mini-btns';

      const btnAllSubj = document.createElement('button');
      btnAllSubj.type = 'button';
      btnAllSubj.className = 'mini-btn';
      btnAllSubj.textContent = 'Select All';
      btnAllSubj.addEventListener('click', () => {
        [11, 12].forEach((cls) => {
          if (pgState.classFilter !== 'both' && parseInt(pgState.classFilter, 10) !== cls) return;
          SYLLABUS_DB[subjKey][cls].forEach((ch) => pgState.selectedChapters.add(ch.id));
        });
        renderPromptBuilderUI();
      });

      const btnNoneSubj = document.createElement('button');
      btnNoneSubj.type = 'button';
      btnNoneSubj.className = 'mini-btn';
      btnNoneSubj.textContent = 'Clear';
      btnNoneSubj.addEventListener('click', () => {
        [11, 12].forEach((cls) => {
          SYLLABUS_DB[subjKey][cls].forEach((ch) => pgState.selectedChapters.delete(ch.id));
        });
        renderPromptBuilderUI();
      });

      miniBtns.appendChild(btnAllSubj);
      miniBtns.appendChild(btnNoneSubj);
      header.appendChild(titleSpan);
      header.appendChild(miniBtns);
      subjBlock.appendChild(header);

      const classesToRender = pgState.classFilter === 'both' ? [11, 12] : [parseInt(pgState.classFilter, 10)];

      classesToRender.forEach((cls) => {
        const subHeading = document.createElement('div');
        subHeading.className = 'class-sub-heading';
        subHeading.textContent =
          lang === 'gu'
            ? `ધોરણ ${cls} (Class ${cls})`
            : lang === 'hi'
            ? `कक्षा ${cls} (Class ${cls})`
            : `Class ${cls}`;
        subjBlock.appendChild(subHeading);

        const grid = document.createElement('div');
        grid.className = 'chapter-checkbox-grid';

        SYLLABUS_DB[subjKey][cls].forEach((chap, idx) => {
          const label = document.createElement('label');
          label.className = 'chap-check-item';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.checked = pgState.selectedChapters.has(chap.id);
          checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
              pgState.selectedChapters.add(chap.id);
            } else {
              pgState.selectedChapters.delete(chap.id);
            }
            updatePromptDistributionHint();
          });

          const textSpan = document.createElement('span');
          textSpan.textContent = `${idx + 1}. ${chap[lang]}`;

          label.appendChild(checkbox);
          label.appendChild(textSpan);
          grid.appendChild(label);
        });

        subjBlock.appendChild(grid);
      });

      dom.pgChaptersContainer.appendChild(subjBlock);
    });

    updatePromptDistributionHint();
  }

  function buildStrictAIPrompt() {
    const visible = getVisiblePromptChapters();
    const activeChapters = visible.filter((ch) => pgState.selectedChapters.has(ch.id));

    if (activeChapters.length === 0) {
      alert('કૃપા કરીને ઓછામાં ઓછું એક પ્રકરણ પસંદ કરો (Please select at least one chapter).');
      return null;
    }

    const totalQ = Math.max(10, Math.min(200, parseInt(dom.pgQuestionCount.value, 10) || 50));
    dom.pgQuestionCount.value = totalQ;
    const lang = pgState.lang;

    const langNameMap = {
      gu: 'Gujarati (ગુજરાતી — using authentic NCERT Gujarati mathematical & scientific terminology)',
      hi: 'Hindi (हिन्दी — using authentic NCERT Hindi mathematical & scientific terminology)',
      en: 'English (using standard NCERT & NTA JEE Main terminology)'
    };

    const sectionTitle11 =
      lang === 'gu'
        ? 'વિભાગ I: ધોરણ 11 (Class 11)'
        : lang === 'hi'
        ? 'खंड I: कक्षा 11 (Class 11)'
        : 'Section I: Class 11';

    const sectionTitle12 =
      lang === 'gu'
        ? 'વિભાગ II: ધોરણ 12 (Class 12)'
        : lang === 'hi'
        ? 'खंड II: कक्षा 12 (Class 12)'
        : 'Section II: Class 12';

    const chapterPrefix = lang === 'gu' ? 'પ્રકરણ' : lang === 'hi' ? 'अध्याय' : 'Chapter';
    const subjectPrefix = lang === 'gu' ? 'વિષય' : lang === 'hi' ? 'विषय' : 'Subject';
    const answerKeyTitle =
      lang === 'gu'
        ? 'સત્તાવાર ઉત્તરવહી (Answer Key)'
        : lang === 'hi'
        ? 'आधिकारिक उत्तर कुंजी (Answer Key)'
        : 'Official Answer Key';

    // Exact Question Allocation across Selected Chapters
    const basePerChap = Math.floor(totalQ / activeChapters.length);
    let remainder = totalQ % activeChapters.length;

    const allocationLines = [];
    let runningQ = 1;

    ['physics', 'chemistry', 'maths'].forEach((subjKey) => {
      const subjChaps = activeChapters.filter((c) => c.subjectKey === subjKey);
      if (!subjChaps.length) return;

      allocationLines.push(`\n## **${subjectPrefix}: ${SUBJECT_META[subjKey][lang]}**`);
      [11, 12].forEach((cls) => {
        const clsChaps = subjChaps.filter((c) => c.classNum === cls);
        if (!clsChaps.length) return;

        allocationLines.push(`### **${cls === 11 ? sectionTitle11 : sectionTitle12}**`);
        clsChaps.forEach((ch, idx) => {
          const countForThis = basePerChap + (remainder > 0 ? 1 : 0);
          if (remainder > 0) remainder--;

          if (countForThis > 0) {
            const startQ = runningQ;
            const endQ = runningQ + countForThis - 1;
            runningQ = endQ + 1;
            allocationLines.push(
              `- #### **${chapterPrefix} ${idx + 1}: ${ch[lang]}** → Generate Questions **${startQ}** to **${endQ}** (${countForThis} MCQs)`
            );
          }
        });
      });
    });

    return `You are an expert NTA JEE Main Paper Setter for JEE Main 2027.
Generate a complete, high-quality JEE Main Multiple Choice Question (MCQ) practice paper in **${langNameMap[lang]}**.

### **1. PAPER SPECIFICATIONS**
- **Total Questions:** Exactly **${totalQ}** MCQs (numbered continuously from **1.** to **${totalQ}.**).
- **Difficulty Level:** Authentic NTA JEE Main level (mix of 30% Moderate NCERT-based conceptual, 50% Standard JEE Main analytical/numerical, and 20% High-Order 99+ Percentile rank-decider problems).
- **Language:** **${langNameMap[lang]}**.
- **Math & Science Equations:** Wrap ALL mathematical expressions, symbols, units, vectors, matrices, and chemical formulas in valid KaTeX inline LaTeX delimiters \`$...$\` (e.g., \`$f(x) = \\sin^{-1}(x)$\`, \`$\\vec{a} \\times \\vec{b}$\`). Do NOT use raw Unicode math symbols when LaTeX can be used.

### **2. REQUIRED CHAPTER & QUESTION DISTRIBUTION**
Follow this exact hierarchy and question numbering range:
${allocationLines.join('\n')}

### **3. STRICT MARKDOWN OUTPUT FORMAT (CRITICAL FOR PARSER)**
You MUST output raw Markdown following this exact template so my web app parser can read it directly without errors:

1. For every Subject, use level-2 heading:
   \`## **${subjectPrefix}: [Subject Name]**\`
2. For Class 11 / Class 12 sections, use level-3 heading:
   \`### **${sectionTitle11}**\` or \`### **${sectionTitle12}**\`
3. For every Chapter, use level-4 heading:
   \`#### **${chapterPrefix} X: [Chapter Name]**\`
4. Format every single Question and its 4 Options on separate lines EXACTLY like this:
**1.** [Question statement here with \`$LaTeX$\`]
(A) [Option A]
(B) [Option B]
(C) [Option C]
(D) [Option D]

5. At the very end of the paper, after Question **${totalQ}**, include the Official Answer Key using this exact heading and 4-column Markdown table format:

---

### **${answerKeyTitle}**

| Q. No | Ans | Q. No | Ans | Q. No | Ans | Q. No | Ans |
| :---: | :-: | :---: | :-: | :---: | :-: | :---: | :-: |
| **1** | A | **2** | B | **3** | C | **4** | D |

*(Fill the table accurately for all questions from **1** to **${totalQ}**. Verify every single mathematical/scientific calculation before assigning the answer key letter).*

Do not skip or summarize any questions. Write all **${totalQ}** questions in full.`;
  }

  // ================= MOBILE DRAWER =================
  function openMobileDrawer() {
    dom.paletteSidebar.classList.add('drawer-open');
  }

  function closeMobileDrawer() {
    dom.paletteSidebar.classList.remove('drawer-open');
  }

  // ================= EVENT LISTENERS =================
  function bindEvents() {
    dom.themeToggleBtn.addEventListener('click', toggleTheme);

    dom.prevQuestionBtn.addEventListener('click', () => navigateRelative(-1));
    dom.nextQuestionBtn.addEventListener('click', () => navigateRelative(1));
    dom.markReviewBtn.addEventListener('click', handleToggleReview);
    dom.clearResponseBtn.addEventListener('click', handleClearResponse);

    dom.subjectSelect.addEventListener('change', () => {
      populateChapterDropdown();
      applyFilters();
      renderCurrentQuestion();
      renderPalette();
    });

    dom.chapterSelect.addEventListener('change', () => {
      applyFilters();
      renderCurrentQuestion();
      renderPalette();
    });

    dom.reviewFilterSelect.addEventListener('change', () => {
      applyFilters();
      renderCurrentQuestion();
      renderPalette();
    });

    dom.submitExamBtn.addEventListener('click', handleFinalSubmit);
    dom.viewScorecardBtn.addEventListener('click', showScorecardView);
    dom.reviewQuestionsBtn.addEventListener('click', showWorkspaceView);
    dom.retakeExamBtn.addEventListener('click', handleResetOrRetake);
    dom.resetProgressBtn.addEventListener('click', handleResetOrRetake);

    dom.mobilePaletteBtn.addEventListener('click', openMobileDrawer);
    dom.closePaletteBtn.addEventListener('click', closeMobileDrawer);

    // Prompt Generator Modal Events
    dom.openPromptGenBtn.addEventListener('click', () => {
      renderPromptBuilderUI();
      dom.promptGenModal.classList.remove('hidden');
    });

    dom.closePromptModalBtn.addEventListener('click', () => {
      dom.promptGenModal.classList.add('hidden');
    });

    // Language Selection in Prompt Maker
    dom.pgLangGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      pgState.lang = btn.dataset.lang;
      renderPromptBuilderUI();
    });

    // Subject Multi-Select in Prompt Maker (allows 1, 2, or all 3)
    dom.pgSubjectGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      const subj = btn.dataset.subject;
      if (pgState.subjects.has(subj)) {
        if (pgState.subjects.size > 1) {
          pgState.subjects.delete(subj);
        }
      } else {
        pgState.subjects.add(subj);
      }
      renderPromptBuilderUI();
    });

    // Class Filter in Prompt Maker (11, 12, or Both)
    dom.pgClassGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      pgState.classFilter = btn.dataset.class;
      renderPromptBuilderUI();
    });

    // Question Count Input & Presets
    dom.pgQuestionCount.addEventListener('input', updatePromptDistributionHint);

    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        dom.pgQuestionCount.value = btn.dataset.count;
        document.querySelectorAll('.preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        updatePromptDistributionHint();
      });
    });

    // Select All / Clear All Visible Chapters
    dom.pgSelectAllChaptersBtn.addEventListener('click', () => {
      getVisiblePromptChapters().forEach((ch) => pgState.selectedChapters.add(ch.id));
      renderPromptBuilderUI();
    });

    dom.pgClearAllChaptersBtn.addEventListener('click', () => {
      getVisiblePromptChapters().forEach((ch) => pgState.selectedChapters.delete(ch.id));
      renderPromptBuilderUI();
    });

    // Generate Prompt Button
    dom.pgGenerateBtn.addEventListener('click', () => {
      const promptText = buildStrictAIPrompt();
      if (!promptText) return;
      dom.pgPromptOutput.value = promptText;
      dom.pgOutputSection.classList.remove('hidden');
      dom.pgStatusText.textContent = '✓ પ્રોમ્પ્ટ તૈયાર છે! તેને કોપી કરીને Google AI Studio કે Gemini માં પેસ્ટ કરો.';
      dom.pgOutputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Copy Prompt Button
    dom.pgCopyPromptBtn.addEventListener('click', async () => {
      const text = dom.pgPromptOutput.value;
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        dom.pgCopyPromptBtn.textContent = '✓ કોપી થઈ ગયું! (Copied)';
        setTimeout(() => {
          dom.pgCopyPromptBtn.textContent = '📋 પ્રોમ્પ્ટ કોપી કરો (Copy Prompt)';
        }, 2000);
      } catch (err) {
        dom.pgPromptOutput.select();
        document.execCommand('copy');
      }
    });

    // Switch directly from Prompt Maker to Paste AI Response Modal
    dom.pgSwitchToPasteBtn.addEventListener('click', () => {
      dom.promptGenModal.classList.add('hidden');
      dom.loaderModal.classList.remove('hidden');
      dom.mdPasteTextarea.focus();
    });

    // File / Paste Loader Modal Events
    dom.openLoaderBtn.addEventListener('click', () => {
      dom.loaderModal.classList.remove('hidden');
    });

    dom.closeModalBtn.addEventListener('click', () => {
      dom.loaderModal.classList.add('hidden');
    });

    dom.mdFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target.result;
        if (content) {
          localStorage.setItem(CUSTOM_MD_STORAGE_KEY, content);
          dom.loaderModal.classList.add('hidden');
          bootWithMarkdown(content);
        }
      };
      reader.readAsText(file, 'UTF-8');
    });

    dom.loadPastedMdBtn.addEventListener('click', () => {
      const pasted = dom.mdPasteTextarea.value;
      if (!pasted || pasted.trim().length < 20) {
        alert('કૃપા કરીને questions.md ફાઇલ પસંદ કરો અથવા AI દ્વારા જનરેટ કરેલું લખાણ પેસ્ટ કરો.');
        return;
      }
      localStorage.setItem(CUSTOM_MD_STORAGE_KEY, pasted);
      dom.loaderModal.classList.add('hidden');
      bootWithMarkdown(pasted);
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (
        !dom.loaderModal.classList.contains('hidden') ||
        !dom.promptGenModal.classList.contains('hidden') ||
        !dom.scorecardView.classList.contains('hidden') ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'ARROWLEFT') {
        e.preventDefault();
        navigateRelative(-1);
      } else if (key === 'ARROWRIGHT') {
        e.preventDefault();
        navigateRelative(1);
      } else if (!state.isSubmitted) {
        if (key === 'A' || key === '1') handleSelectOption(state.currentQuestionId, 'A');
        else if (key === 'B' || key === '2') handleSelectOption(state.currentQuestionId, 'B');
        else if (key === 'C' || key === '3') handleSelectOption(state.currentQuestionId, 'C');
        else if (key === 'D' || key === '4') handleSelectOption(state.currentQuestionId, 'D');
        else if (key === 'R') handleToggleReview();
        else if (key === 'BACKSPACE' || key === 'DELETE') handleClearResponse();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
