/**
 * Structured syllabus templates.
 *
 * These are maintained in code (no scraping, no third-party fetching at runtime)
 * and are copied into the student's own database rows on first use, so everything
 * stays fully editable afterwards.
 *
 * Chapter lists for Physics / Chemistry / Mathematics follow the Class 11 JEE
 * master tracker; other subjects follow the NCERT book structure.
 */

export type ChapterTemplate = { name: string; section?: string; topics: string[] };
export type SubjectTemplate = { name: string; chapters: ChapterTemplate[] };

const PHYSICS_11: ChapterTemplate[] = [
  { name: "Mathematical Tools", topics: ["Basic algebra & functions", "Differentiation", "Integration", "Vectors"] },
  { name: "Units and Measurements", topics: ["SI units", "Dimensional analysis", "Errors in measurement", "Significant figures"] },
  { name: "Motion in a Straight Line", topics: ["Distance & displacement", "Speed & velocity", "Acceleration", "Motion graphs", "Equations of motion"] },
  { name: "Motion in a Plane", topics: ["Vector addition", "Projectile motion", "Relative motion", "Uniform circular motion"] },
  { name: "Laws of Motion & Friction", topics: ["Newton's laws", "Free body diagrams", "Friction", "Pulley & constraint motion"] },
  { name: "Circular Motion", topics: ["Centripetal acceleration", "Banking of roads", "Vertical circular motion"] },
  { name: "Work, Energy and Power", topics: ["Work done", "Work-energy theorem", "Conservative forces", "Power", "Potential energy curves"] },
  { name: "Centre of Mass & System of Particles", topics: ["Centre of mass", "Momentum conservation", "Collisions", "Variable mass systems"] },
  { name: "Rotational Motion", topics: ["Moment of inertia", "Torque & angular momentum", "Rolling motion", "Rotational equilibrium"] },
  { name: "Gravitation", topics: ["Newton's law of gravitation", "Gravitational field & potential", "Satellites & orbits", "Kepler's laws"] },
  { name: "Mechanical Properties of Solids", topics: ["Stress & strain", "Hooke's law", "Elastic moduli", "Elastic potential energy"] },
  { name: "Mechanical Properties of Fluids", topics: ["Pressure & Pascal's law", "Buoyancy", "Viscosity", "Surface tension", "Bernoulli's theorem"] },
  { name: "Thermal Properties of Matter", topics: ["Thermal expansion", "Calorimetry", "Change of state", "Heat transfer", "Newton's law of cooling"] },
  { name: "Kinetic Theory & Thermodynamics", topics: ["Kinetic theory of gases", "Degrees of freedom", "First law", "Thermodynamic processes", "Heat engines"] },
  { name: "Simple Harmonic Motion", topics: ["SHM equations", "Spring & pendulum systems", "Energy in SHM", "Damped & forced oscillations"] },
  { name: "Waves", topics: ["Wave equation", "Superposition", "Standing waves", "Beats", "Doppler effect"] },
];

const CHEMISTRY_11: ChapterTemplate[] = [
  { name: "Some Basic Concepts of Chemistry", section: "Physical Chemistry", topics: ["Mole concept", "Stoichiometry", "Concentration terms", "Empirical & molecular formula"] },
  { name: "Structure of Atom", section: "Physical Chemistry", topics: ["Atomic models", "Quantum numbers", "Orbitals & shapes", "Electronic configuration"] },
  { name: "State of Matter", section: "Physical Chemistry", topics: ["Gas laws", "Ideal gas equation", "Kinetic molecular theory", "Liquefaction & real gases"] },
  { name: "Thermodynamics & Thermochemistry", section: "Physical Chemistry", topics: ["First law", "Enthalpy", "Hess's law", "Entropy & Gibbs energy"] },
  { name: "Redox Reaction", section: "Physical Chemistry", topics: ["Oxidation number", "Balancing redox reactions", "Redox titrations"] },
  { name: "Chemical Equilibrium", section: "Physical Chemistry", topics: ["Equilibrium constant", "Le Chatelier's principle", "Kp and Kc relations"] },
  { name: "Ionic Equilibrium", section: "Physical Chemistry", topics: ["Acids & bases", "pH and buffers", "Solubility product", "Salt hydrolysis"] },
  { name: "Classification of Elements & Periodicity", section: "Inorganic Chemistry", topics: ["Modern periodic table", "Periodic trends", "Anomalous properties"] },
  { name: "Chemical Bonding and Molecular Structure", section: "Inorganic Chemistry", topics: ["Ionic & covalent bonding", "VSEPR theory", "Hybridisation", "Molecular orbital theory", "Hydrogen bonding"] },
  { name: "Hydrogen", section: "Inorganic Chemistry", topics: ["Position of hydrogen", "Hydrides", "Water & hydrogen peroxide"] },
  { name: "The s-Block Elements", section: "Inorganic Chemistry", topics: ["Alkali metals", "Alkaline earth metals", "Important compounds"] },
  { name: "The p-Block Elements", section: "Inorganic Chemistry", topics: ["Group 13 elements", "Group 14 elements", "Important compounds"] },
  { name: "Some Basic Principles and Techniques (IUPAC, GOC, Isomerism)", section: "Organic Chemistry", topics: ["IUPAC nomenclature", "Electronic effects", "Isomerism", "Purification techniques"] },
  { name: "Hydrocarbon", section: "Organic Chemistry", topics: ["Alkanes", "Alkenes", "Alkynes", "Aromatic hydrocarbons"] },
  { name: "Purification and Analysis of Organic Compound", section: "Organic Chemistry", topics: ["Qualitative analysis", "Quantitative estimation", "Chromatography"] },
  { name: "Environmental Chemistry", section: "Organic Chemistry", topics: ["Atmospheric pollution", "Water & soil pollution", "Green chemistry"] },
];

const MATHS_11: ChapterTemplate[] = [
  { name: "Sets", topics: ["Types of sets", "Venn diagrams", "Operations on sets"] },
  { name: "Basic Mathematics", topics: ["Number system", "Ratio & proportion", "Logarithms", "Inequalities basics"] },
  { name: "Quadratic Equations", topics: ["Nature of roots", "Relation between roots & coefficients", "Location of roots", "Quadratic expressions"] },
  { name: "Sequence and Series", topics: ["AP", "GP", "HP & AGP", "Sum of special series"] },
  { name: "Trigonometric Functions", topics: ["Trigonometric ratios", "Identities", "Graphs", "Transformation formulae"] },
  { name: "Trigonometric Equation", topics: ["General solutions", "Principal solutions", "Equations with constraints"] },
  { name: "Relation Function", topics: ["Types of relations", "Domain & range", "Types of functions", "Composition & inverse"] },
  { name: "Permutations and Combinations", topics: ["Fundamental principle of counting", "Permutations", "Combinations", "Distribution problems"] },
  { name: "Binomial Theorem", topics: ["General & middle term", "Properties of coefficients", "Multinomial basics"] },
  { name: "Straight Lines", topics: ["Slope & forms of a line", "Angle between lines", "Distance formulae", "Family of lines"] },
  { name: "Circles", topics: ["Equation of a circle", "Tangents & normals", "Family of circles", "Radical axis"] },
  { name: "Conic Sections (Parabola, Ellipse, Hyperbola)", topics: ["Parabola", "Ellipse", "Hyperbola", "Tangents & normals"] },
  { name: "Complex Number", topics: ["Algebra of complex numbers", "Argand plane & polar form", "De Moivre's theorem", "Roots of unity"] },
  { name: "Limits and Derivatives", topics: ["Limits & standard forms", "Continuity", "Derivatives from first principles", "Rules of differentiation"] },
  { name: "Statistics", topics: ["Measures of central tendency", "Mean deviation", "Variance & standard deviation"] },
  { name: "Probability", topics: ["Sample space & events", "Addition theorem", "Conditional probability"] },
  { name: "Introduction to Three Dimensional Geometry", topics: ["Coordinates in space", "Distance formula", "Section formula"] },
  { name: "Linear Inequalities", topics: ["Solving linear inequalities", "Graphical solutions", "System of inequalities"] },
  { name: "Solution of Triangle", topics: ["Sine & cosine rule", "Area of a triangle", "Circles connected with triangles"] },
];

const BIOLOGY_11: ChapterTemplate[] = [
  { name: "The Living World", topics: ["Diversity of life", "Taxonomic categories", "Taxonomical aids"] },
  { name: "Biological Classification", topics: ["Five kingdom classification", "Monera & Protista", "Fungi", "Viruses & lichens"] },
  { name: "Plant Kingdom", topics: ["Algae", "Bryophytes & pteridophytes", "Gymnosperms & angiosperms"] },
  { name: "Animal Kingdom", topics: ["Basis of classification", "Non-chordates", "Chordates"] },
  { name: "Morphology of Flowering Plants", topics: ["Root, stem & leaf", "Inflorescence", "Flower, fruit & seed"] },
  { name: "Anatomy of Flowering Plants", topics: ["Tissues", "Tissue systems", "Secondary growth"] },
  { name: "Structural Organisation in Animals", topics: ["Animal tissues", "Frog morphology & anatomy"] },
  { name: "Cell: The Unit of Life", topics: ["Cell theory", "Prokaryotic & eukaryotic cells", "Cell organelles"] },
  { name: "Biomolecules", topics: ["Carbohydrates & lipids", "Proteins & nucleic acids", "Enzymes"] },
  { name: "Cell Cycle and Cell Division", topics: ["Cell cycle", "Mitosis", "Meiosis"] },
  { name: "Photosynthesis in Higher Plants", topics: ["Light reaction", "Calvin cycle", "C4 pathway & photorespiration"] },
  { name: "Respiration in Plants", topics: ["Glycolysis", "Krebs cycle", "ETS & oxidative phosphorylation"] },
  { name: "Plant Growth and Development", topics: ["Growth phases", "Plant growth regulators", "Photoperiodism & vernalisation"] },
  { name: "Breathing and Exchange of Gases", topics: ["Respiratory organs", "Mechanism of breathing", "Transport of gases"] },
  { name: "Body Fluids and Circulation", topics: ["Blood & lymph", "Human heart", "Cardiac cycle & ECG"] },
  { name: "Excretory Products and their Elimination", topics: ["Human excretory system", "Urine formation", "Regulation of kidney function"] },
  { name: "Locomotion and Movement", topics: ["Muscle contraction", "Skeletal system", "Joints & disorders"] },
  { name: "Neural Control and Coordination", topics: ["Neuron & nerve impulse", "Central nervous system", "Sense organs"] },
  { name: "Chemical Coordination and Integration", topics: ["Endocrine glands", "Hormones of the human body", "Mechanism of hormone action"] },
];

const ENGLISH_11: ChapterTemplate[] = [
  { name: "Hornbill — Prose", topics: ["The Portrait of a Lady", "We're Not Afraid to Die", "Discovering Tut", "The Ailing Planet", "The Browning Version"] },
  { name: "Hornbill — Poetry", topics: ["A Photograph", "The Laburnum Top", "The Voice of the Rain", "Childhood", "Father to Son"] },
  { name: "Snapshots", topics: ["The Summer of the Beautiful White Horse", "The Address", "Ranga's Marriage", "Albert Einstein at School", "Mother's Day"] },
  { name: "Writing Skills", topics: ["Notice & poster", "Letter writing", "Article & speech", "Report writing"] },
  { name: "Grammar", topics: ["Tenses", "Determiners & modals", "Reported speech", "Error correction"] },
];

const HINDI_11: ChapterTemplate[] = [
  { name: "आरोह — काव्य खंड", topics: ["कबीर", "मीरा", "पथिक", "घर की याद"] },
  { name: "आरोह — गद्य खंड", topics: ["नमक का दारोगा", "मियाँ नसीरुद्दीन", "अपू के साथ ढाई साल", "गलता लोहा"] },
  { name: "वितान", topics: ["भारतीय गायिकाओं में बेजोड़", "राजस्थान की रजत बूँदें", "आलो-आँधारि"] },
  { name: "अभिव्यक्ति और माध्यम", topics: ["जनसंचार माध्यम", "पत्रकारीय लेखन", "फीचर लेखन"] },
  { name: "व्याकरण एवं रचना", topics: ["शब्द-भंडार", "मुहावरे", "निबंध लेखन", "पत्र लेखन"] },
];

const CS_11: ChapterTemplate[] = [
  { name: "Computer Systems and Organisation", topics: ["Basic computer organisation", "Software types", "Number systems", "Boolean logic"] },
  { name: "Python Fundamentals", topics: ["Data types & variables", "Operators & expressions", "Input/output", "Control flow"] },
  { name: "Strings, Lists and Tuples", topics: ["String methods", "List operations", "Tuples", "Sorting & searching"] },
  { name: "Dictionaries", topics: ["Dictionary operations", "Nested dictionaries", "Common problems"] },
  { name: "Functions and Modules", topics: ["User defined functions", "Scope", "Standard library modules"] },
  { name: "Society, Law and Ethics", topics: ["Digital footprint", "Cyber safety", "IT Act & IPR", "E-waste"] },
];

const PE_11: ChapterTemplate[] = [
  { name: "Changing Trends & Career in Physical Education", topics: ["Concept & objectives", "Career options", "Khelo India"] },
  { name: "Olympism Value Education", topics: ["Olympic movement", "Olympic symbols & values", "IOA"] },
  { name: "Yoga", topics: ["Elements of yoga", "Asanas & pranayama", "Yoga for concentration"] },
  { name: "Physical Education & Sports for CWSN", topics: ["Disability types", "Inclusion", "Advantages of physical activity"] },
  { name: "Physical Fitness, Wellness & Lifestyle", topics: ["Components of fitness", "Wellness", "Preventing lifestyle disease"] },
  { name: "Test, Measurement & Evaluation", topics: ["BMI", "Somatotypes", "Fitness tests"] },
  { name: "Fundamentals of Anatomy & Physiology", topics: ["Skeletal system", "Muscular system", "Respiratory & circulatory systems"] },
];

/** Canonical templates keyed by a normalised subject name. */
export const SUBJECT_TEMPLATES: Record<string, SubjectTemplate> = {
  physics: { name: "Physics", chapters: PHYSICS_11 },
  chemistry: { name: "Chemistry", chapters: CHEMISTRY_11 },
  mathematics: { name: "Mathematics", chapters: MATHS_11 },
  biology: { name: "Biology", chapters: BIOLOGY_11 },
  english: { name: "English", chapters: ENGLISH_11 },
  hindi: { name: "Hindi", chapters: HINDI_11 },
  "computer science": { name: "Computer Science", chapters: CS_11 },
  "physical education": { name: "Physical Education", chapters: PE_11 },
};

const ALIASES: Record<string, string> = {
  maths: "mathematics",
  math: "mathematics",
  "maths (full lecture series)": "mathematics",
  bio: "biology",
  cs: "computer science",
  "comp sci": "computer science",
  pe: "physical education",
  "physical edu": "physical education",
};

export function normaliseSubjectKey(name: string) {
  const key = name.trim().toLowerCase();
  return ALIASES[key] ?? key;
}

export function templateFor(name: string): SubjectTemplate | null {
  return SUBJECT_TEMPLATES[normaliseSubjectKey(name)] ?? null;
}

/** Subjects auto-created for a stream. Extend this map to support more streams. */
export const STREAM_SUBJECTS: Record<string, string[]> = {
  PCM: ["Physics", "Chemistry", "Mathematics"],
  PCB: ["Physics", "Chemistry", "Biology"],
  PCMB: ["Physics", "Chemistry", "Mathematics", "Biology"],
};

export function subjectsForStream(stream: string | null | undefined): string[] {
  if (!stream) return [];
  return STREAM_SUBJECTS[stream] ?? [];
}

/** Suggestions shown in the "Add subject" picker. */
export const ADDITIONAL_SUBJECTS = [
  "English",
  "Hindi",
  "Computer Science",
  "Physical Education",
  "Biology",
  "Mathematics",
];

/** Default chapter-wise tracking resources (from the Class 11 JEE master tracker). */
export const DEFAULT_TRACKING_RESOURCES = [
  "Lectures",
  "Notes",
  "Rev 1",
  "DPPs",
  "Module",
  "Class HW",
  "Sheets",
  "NCERT",
  "Ref Book",
  "Rev 2",
  "PYQs",
  "Rev 3",
  "Test",
  "Test Analysis",
];
