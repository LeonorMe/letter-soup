/**
 * soupGenerator.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Core word-search puzzle generation logic and vocabulary dictionaries.
 *
 * Exports:
 *   RAINBOW_COLORS              – 12-colour palette for word highlighting
 *   generateSoup(words, size)   – build a word-search grid
 *   generateVocabularyWords(lang) – pick environment-themed words for a language
 */

// ─── 12 visually distinct colours, one per word slot ─────────────────────────
export const RAINBOW_COLORS = [
  '#FF595E', // Red
  '#FF924C', // Orange
  '#FFCA3A', // Yellow
  '#C5CA30', // Lime
  '#8AC926', // Green
  '#52A675', // Mint
  '#1982C4', // Cyan
  '#4267AC', // Blue
  '#6A4C93', // Violet
  '#9B5DE5', // Purple
  '#F15BB5', // Pink
  '#FF85A1', // Light pink
];

// ─── All 8 possible word directions [rowDelta, colDelta] ─────────────────────
const DIRECTIONS = [
  [ 0,  1], // →  right
  [ 1,  0], // ↓  down
  [ 1,  1], // ↘  diagonal right-down
  [-1,  1], // ↗  diagonal right-up
  [ 0, -1], // ←  left
  [-1,  0], // ↑  up
  [-1, -1], // ↖  diagonal left-up
  [ 1, -1], // ↙  diagonal left-down
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// ─── Environment-themed vocabulary dictionaries by language ──────────────────
//     Each word has { word, meaning } where `meaning` is in the target language.
const VOCABULARY = {
  en: [
    { word: 'SOLAR',       meaning: 'Energy from the sun, a clean renewable source.' },
    { word: 'FOREST',      meaning: 'A large area covered chiefly with trees.' },
    { word: 'OCEAN',       meaning: 'A vast body of salt water covering most of the Earth.' },
    { word: 'CORAL',       meaning: 'Marine organisms that build reefs critical to ocean life.' },
    { word: 'RECYCLE',     meaning: 'Convert waste into reusable material.' },
    { word: 'COMPOST',     meaning: 'Decayed organic matter used as a plant fertiliser.' },
    { word: 'HABITAT',     meaning: 'The natural environment where a species lives.' },
    { word: 'SPECIES',     meaning: 'A group of living organisms that can reproduce together.' },
    { word: 'GLACIER',     meaning: 'A slow-moving mass of ice formed from compacted snow.' },
    { word: 'WETLAND',     meaning: 'Land area saturated with water, home to rich biodiversity.' },
    { word: 'POLLEN',      meaning: 'Fine powder produced by plants for reproduction.' },
    { word: 'BIOME',       meaning: 'A large naturally occurring community of plants and animals.' },
    { word: 'CARBON',      meaning: 'A chemical element key to all known life on Earth.' },
    { word: 'OZONE',       meaning: 'A molecule in the stratosphere that shields Earth from UV rays.' },
    { word: 'FAUNA',       meaning: 'The animals of a particular region or habitat.' },
    { word: 'FLORA',       meaning: 'The plants of a particular region or habitat.' },
    { word: 'WIND',        meaning: 'Moving air, a clean source of renewable energy.' },
    { word: 'SEED',        meaning: 'A plant\'s unit of reproduction, capable of growing into a new plant.' },
    { word: 'RAIN',        meaning: 'Water falling from clouds, essential for all ecosystems.' },
    { word: 'TIDE',        meaning: 'The rise and fall of sea levels caused by the Moon\'s gravity.' },
    { word: 'DUNE',        meaning: 'A mound of sand shaped by wind, often protecting coastal ecosystems.' },
    { word: 'SOIL',        meaning: 'The upper layer of earth, teaming with life.' },
  ],
  pt: [
    { word: 'SOLAR',       meaning: 'Energia proveniente do sol, uma fonte limpa e renovável.' },
    { word: 'FLORESTA',    meaning: 'Grande área coberta principalmente por árvores.' },
    { word: 'OCEANO',      meaning: 'Vasto corpo de água salgada que cobre a maior parte da Terra.' },
    { word: 'CORAL',       meaning: 'Organismos marinhos que constroem recifes vitais para o oceano.' },
    { word: 'RECICLAR',    meaning: 'Converter resíduos em materiais reutilizáveis.' },
    { word: 'COMPOSTO',    meaning: 'Matéria orgânica decomposta usada como adubo natural.' },
    { word: 'HABITAT',     meaning: 'O ambiente natural onde uma espécie vive.' },
    { word: 'ESPECIE',     meaning: 'Grupo de organismos que se podem reproduzir entre si.' },
    { word: 'GLACIAR',     meaning: 'Massa de gelo de movimento lento formada por neve compactada.' },
    { word: 'PANTANO',     meaning: 'Terra saturada de água, lar de grande biodiversidade.' },
    { word: 'POLEN',       meaning: 'Pó fino produzido pelas plantas para a reprodução.' },
    { word: 'BIOMA',       meaning: 'Grande comunidade natural de plantas e animais.' },
    { word: 'CARBONO',     meaning: 'Elemento químico essencial para toda a vida conhecida.' },
    { word: 'OZONO',       meaning: 'Molécula na estratosfera que protege a Terra dos raios UV.' },
    { word: 'FAUNA',       meaning: 'Os animais de uma região ou habitat particular.' },
    { word: 'FLORA',       meaning: 'As plantas de uma região ou habitat particular.' },
    { word: 'VENTO',       meaning: 'Ar em movimento, uma fonte limpa de energia renovável.' },
    { word: 'SEMENTE',     meaning: 'Unidade de reprodução de uma planta.' },
    { word: 'CHUVA',       meaning: 'Água que cai das nuvens, essencial para os ecossistemas.' },
    { word: 'SOLO',        meaning: 'A camada superior da terra, rica em vida.' },
    { word: 'MARE',        meaning: 'Subida e descida do nível do mar causada pela gravidade da Lua.' },
    { word: 'RIO',         meaning: 'Curso de água doce que flui para o mar ou lago.' },
  ],
  es: [
    { word: 'SOLAR',       meaning: 'Energía proveniente del sol, una fuente limpia y renovable.' },
    { word: 'BOSQUE',      meaning: 'Gran área cubierta principalmente de árboles.' },
    { word: 'OCEANO',      meaning: 'Vasto cuerpo de agua salada que cubre la mayor parte de la Tierra.' },
    { word: 'CORAL',       meaning: 'Organismos marinos que construyen arrecifes vitales.' },
    { word: 'RECICLAR',    meaning: 'Convertir residuos en materiales reutilizables.' },
    { word: 'COMPOST',     meaning: 'Materia orgánica descompuesta usada como abono natural.' },
    { word: 'HABITAT',     meaning: 'El entorno natural donde vive una especie.' },
    { word: 'ESPECIE',     meaning: 'Grupo de organismos que pueden reproducirse entre sí.' },
    { word: 'GLACIAR',     meaning: 'Masa de hielo de movimiento lento formada por nieve compactada.' },
    { word: 'PANTANO',     meaning: 'Tierra saturada de agua, hogar de gran biodiversidad.' },
    { word: 'POLEN',       meaning: 'Polvo fino producido por las plantas para la reproducción.' },
    { word: 'BIOMA',       meaning: 'Gran comunidad natural de plantas y animales.' },
    { word: 'CARBONO',     meaning: 'Elemento químico esencial para toda la vida conocida.' },
    { word: 'OZONO',       meaning: 'Molécula en la estratosfera que protege la Tierra de los rayos UV.' },
    { word: 'FAUNA',       meaning: 'Los animales de una región o hábitat particular.' },
    { word: 'FLORA',       meaning: 'Las plantas de una región o hábitat particular.' },
    { word: 'VIENTO',      meaning: 'Aire en movimiento, una fuente limpia de energía renovable.' },
    { word: 'SEMILLA',     meaning: 'Unidad de reproducción de una planta.' },
    { word: 'LLUVIA',      meaning: 'Agua que cae de las nubes, esencial para los ecosistemas.' },
    { word: 'SUELO',       meaning: 'La capa superior de la tierra, repleta de vida.' },
    { word: 'MAREA',       meaning: 'El sube y baja del nivel del mar causado por la gravedad lunar.' },
    { word: 'RIO',         meaning: 'Corriente de agua dulce que fluye hacia el mar o un lago.' },
  ],
  it: [
    { word: 'SOLARE',      meaning: "Energia proveniente dal sole, una fonte pulita e rinnovabile." },
    { word: 'FORESTA',     meaning: "Grande area coperta principalmente da alberi." },
    { word: 'OCEANO',      meaning: "Vasto corpo d'acqua salata che copre la maggior parte della Terra." },
    { word: 'CORALLO',     meaning: "Organismi marini che costruiscono barriere coralline vitali." },
    { word: 'RICICLO',     meaning: "Convertire i rifiuti in materiali riutilizzabili." },
    { word: 'COMPOST',     meaning: "Materia organica decomposta usata come fertilizzante naturale." },
    { word: 'HABITAT',     meaning: "L'ambiente naturale in cui vive una specie." },
    { word: 'SPECIE',      meaning: "Gruppo di organismi che possono riprodursi tra loro." },
    { word: 'GHIACCIAIO',  meaning: "Massa di ghiaccio a lento movimento formata da neve compattata." },
    { word: 'PALUDE',      meaning: "Terra saturata d'acqua, ricca di biodiversità." },
    { word: 'POLLINE',     meaning: "Polvere fine prodotta dalle piante per la riproduzione." },
    { word: 'BIOMA',       meaning: "Grande comunità naturale di piante e animali." },
    { word: 'CARBONIO',    meaning: "Elemento chimico essenziale per tutta la vita conosciuta." },
    { word: 'OZONO',       meaning: "Molecola nella stratosfera che protegge la Terra dai raggi UV." },
    { word: 'FAUNA',       meaning: "Gli animali di una particolare regione o habitat." },
    { word: 'FLORA',       meaning: "Le piante di una particolare regione o habitat." },
    { word: 'VENTO',       meaning: "Aria in movimento, fonte pulita di energia rinnovabile." },
    { word: 'SEME',        meaning: "Unità di riproduzione di una pianta." },
    { word: 'PIOGGIA',     meaning: "Acqua che cade dalle nuvole, essenziale per gli ecosistemi." },
    { word: 'SUOLO',       meaning: "Lo strato superficiale della terra, ricco di vita." },
    { word: 'MAREA',       meaning: "Il flusso e riflusso del livello del mare causato dalla Luna." },
    { word: 'FIUME',       meaning: "Corso d'acqua dolce che scorre verso il mare o un lago." },
  ],
  de: [
    { word: 'SOLAR',       meaning: 'Energie aus der Sonne – eine saubere erneuerbare Quelle.' },
    { word: 'WALD',        meaning: 'Großes Gebiet, das hauptsächlich mit Bäumen bedeckt ist.' },
    { word: 'OZEAN',       meaning: 'Riesiges Salzwassermeer, das den größten Teil der Erde bedeckt.' },
    { word: 'KORALLE',     meaning: 'Meeresorganismen, die lebenswichtige Riffe bilden.' },
    { word: 'RECYCELN',    meaning: 'Abfall in wiederverwendbares Material umwandeln.' },
    { word: 'KOMPOST',     meaning: 'Zersetztes organisches Material als natürlicher Dünger.' },
    { word: 'HABITAT',     meaning: 'Die natürliche Umgebung, in der eine Art lebt.' },
    { word: 'SPEZIES',     meaning: 'Gruppe von Organismen, die sich miteinander fortpflanzen können.' },
    { word: 'GLETSCHER',   meaning: 'Langsam fließende Eismasse aus verdichtetem Schnee.' },
    { word: 'MOOR',        meaning: 'Wassergesättigtes Land, Heimat reicher Artenvielfalt.' },
    { word: 'POLLEN',      meaning: 'Feiner Staub, den Pflanzen zur Fortpflanzung produzieren.' },
    { word: 'BIOM',        meaning: 'Große natürliche Gemeinschaft von Pflanzen und Tieren.' },
    { word: 'KOHLENSTOFF', meaning: 'Grundlegendes chemisches Element für alles bekannte Leben.' },
    { word: 'OZON',        meaning: 'Molekül in der Stratosphäre, das die Erde vor UV-Strahlen schützt.' },
    { word: 'FAUNA',       meaning: 'Die Tiere einer bestimmten Region oder eines Lebensraums.' },
    { word: 'FLORA',       meaning: 'Die Pflanzen einer bestimmten Region oder eines Lebensraums.' },
    { word: 'WIND',        meaning: 'Bewegte Luft – eine saubere erneuerbare Energiequelle.' },
    { word: 'SAMEN',       meaning: 'Die Fortpflanzungseinheit einer Pflanze.' },
    { word: 'REGEN',       meaning: 'Aus Wolken fallendes Wasser, lebenswichtig für alle Ökosysteme.' },
    { word: 'BODEN',       meaning: 'Die oberste Erdschicht, voller Leben.' },
    { word: 'FLUT',        meaning: 'Das Steigen und Fallen des Meeresspiegels durch die Schwerkraft des Mondes.' },
    { word: 'FLUSS',       meaning: 'Ein Süßwasserstrom, der ins Meer oder einen See fließt.' },
  ],
  fr: [
    { word: 'SOLAIRE',     meaning: "Énergie provenant du soleil, une source propre et renouvelable." },
    { word: 'FORET',       meaning: "Grande zone couverte principalement d'arbres." },
    { word: 'OCEAN',       meaning: "Vaste étendue d'eau salée couvrant la majeure partie de la Terre." },
    { word: 'CORAIL',      meaning: "Organismes marins qui construisent des récifs essentiels à la vie océanique." },
    { word: 'RECYCLER',    meaning: "Convertir les déchets en matériaux réutilisables." },
    { word: 'COMPOST',     meaning: "Matière organique décomposée utilisée comme engrais naturel." },
    { word: 'HABITAT',     meaning: "L'environnement naturel dans lequel vit une espèce." },
    { word: 'ESPECE',      meaning: "Groupe d'organismes pouvant se reproduire entre eux." },
    { word: 'GLACIER',     meaning: "Masse de glace à mouvement lent formée de neige compactée." },
    { word: 'MARAIS',      meaning: "Terre saturée d'eau, abritant une riche biodiversité." },
    { word: 'POLLEN',      meaning: "Fine poudre produite par les plantes pour la reproduction." },
    { word: 'BIOME',       meaning: "Grande communauté naturelle de plantes et d'animaux." },
    { word: 'CARBONE',     meaning: "Élément chimique essentiel à toute vie connue sur Terre." },
    { word: 'OZONE',       meaning: "Molécule dans la stratosphère protégeant la Terre des rayons UV." },
    { word: 'FAUNE',       meaning: "Les animaux d'une région ou d'un habitat particulier." },
    { word: 'FLORE',       meaning: "Les plantes d'une région ou d'un habitat particulier." },
    { word: 'VENT',        meaning: "Air en mouvement, source d'énergie renouvelable propre." },
    { word: 'GRAINE',      meaning: "Unité de reproduction d'une plante." },
    { word: 'PLUIE',       meaning: "Eau tombant des nuages, essentielle pour tous les écosystèmes." },
    { word: 'SOL',         meaning: "La couche supérieure de la terre, foisonnant de vie." },
    { word: 'MAREE',       meaning: "La montée et la descente du niveau de la mer causées par la Lune." },
    { word: 'FLEUVE',      meaning: "Cours d'eau douce qui se jette dans la mer ou un lac." },
  ],
};

/**
 * generateSoup
 * ─────────────────────────────────────────────────────────────────────────────
 * Builds a word-search puzzle grid from a list of words.
 *
 * @param {Array<string|{word:string, meaning:string}>} inputWords
 *   Up to 12 words. Each item may be a plain string or an object with
 *   { word, meaning } for vocabulary definitions.
 * @param {number|null} manualSize
 *   Explicit grid dimension. When null the grid is auto-sized (10 minimum).
 * @returns {{ grid: string[][], words: Object[], size: number }}
 */
export function generateSoup(inputWords, manualSize = null) {
  // Normalise input; filter single-letter words; cap at 12
  const words = inputWords
    .map(w => typeof w === 'string'
      ? { word: w.toUpperCase().replace(/\s+/g, ''), meaning: null }
      : { word: w.word.toUpperCase().replace(/\s+/g, ''), meaning: w.meaning }
    )
    .filter(w => w.word.length > 1)
    .slice(0, 12);

  if (words.length === 0) return { grid: [], words: [], size: 10 };

  // Grid must fit the longest word, and be at least 5
  const maxLen  = Math.max(...words.map(w => w.word.length));
  const minSize = Math.max(5, maxLen);
  const size    = manualSize ? Math.max(manualSize, minSize) : Math.max(10, minSize);

  // Initialise empty grid
  const grid = Array.from({ length: size }, () => Array(size).fill(null));

  // Assign rainbow colours and prepare word metadata
  const wordsWithMeta = words.map((w, i) => ({
    ...w,
    color: RAINBOW_COLORS[i % RAINBOW_COLORS.length],
    found: false,
    cells: [],
  }));

  // Attempt to place each word with up to 500 random tries
  for (const wordObj of wordsWithMeta) {
    const { word } = wordObj;
    let placed   = false;
    let attempts = 0;

    while (!placed && attempts < 500) {
      attempts++;
      const dir    = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const startR = Math.floor(Math.random() * size);
      const startC = Math.floor(Math.random() * size);

      let canPlace = true;
      const cells  = [];

      for (let i = 0; i < word.length; i++) {
        const r = startR + dir[0] * i;
        const c = startC + dir[1] * i;

        if (r < 0 || r >= size || c < 0 || c >= size)           { canPlace = false; break; }
        if (grid[r][c] !== null && grid[r][c] !== word[i])       { canPlace = false; break; }

        cells.push({ r, c });
      }

      if (canPlace) {
        cells.forEach(({ r, c }, i) => { grid[r][c] = word[i]; });
        wordObj.cells = cells;
        placed = true;
      }
    }

    if (!placed) console.warn(`generateSoup: failed to place "${word}" after 500 attempts`);
  }

  // Fill remaining empty cells with random letters
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null)
        grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
  }

  // Return only words that were placed successfully
  return { grid, words: wordsWithMeta.filter(w => w.cells.length > 0), size };
}

/**
 * generateVocabularyWords
 * ─────────────────────────────────────────────────────────────────────────────
 * Returns a shuffled selection of environment-themed vocabulary words for
 * the given language.
 *
 * ⚠️  TESTING MODE – returns 1 short word (≤5 letters) for a 5×5 grid.
 *     TODO: Remove the filter and change slice(0, 1) → slice(0, 6) for production.
 *
 * @param {string} langCode  'en' | 'pt' | 'es' | 'it' | 'de' | 'fr'
 * @returns {Array<{word: string, meaning: string}>}
 */
export function generateVocabularyWords(langCode = 'en') {
  const pool = VOCABULARY[langCode] || VOCABULARY.en;
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
}

// ─── Backwards-compatibility alias (used by older references) ─────────────────
export const generateRandomEnglishWords = () => generateVocabularyWords('en');
