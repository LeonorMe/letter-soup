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
  '#FF85A1'  // Light Red/Pink
];

// Directions: [dx, dy]
const DIRECTIONS = [
  [0, 1],   // right
  [1, 0],   // down
  [1, 1],   // diagonal right-down
  [-1, 1],  // diagonal right-up
  [0, -1],  // left
  [-1, 0],  // up
  [-1, -1], // diagonal left-up
  [1, -1]   // diagonal left-down
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function generateSoup(inputWords, manualSize = null) {
  // Sanitize and filter words
  const words = inputWords
    .map(w => {
       if (typeof w === 'string') return { word: w.toUpperCase().replace(/\s+/g, ''), meaning: null };
       return { word: w.word.toUpperCase().replace(/\s+/g, ''), meaning: w.meaning };
    })
    .filter(w => w.word.length > 1)
    .slice(0, 12); // Max 12 words

  if (words.length === 0) {
     return { grid: [], words: [], size: 10 };
  }

  // Determine grid size
  const maxWordLength = Math.max(...words.map(w => w.word.length));
  
  // Grid size defaults to either 10, or exactly the length of the longest word
  const minRequiredSize = Math.max(5, maxWordLength);
  const size = manualSize ? Math.max(manualSize, minRequiredSize) : Math.max(10, minRequiredSize);

  // Initialize empty grid
  const grid = Array(size).fill(null).map(() => Array(size).fill(null));
  
  // Track placed words for answers
  const placedWords = [];

  // Assign a color to each word
  const wordsWithColors = words.map((wObj, index) => ({
    word: wObj.word,
    meaning: wObj.meaning,
    color: RAINBOW_COLORS[index % RAINBOW_COLORS.length],
    found: false,
    cells: [] // will store {r, c}
  }));

  // Try to place each word
  for (const wordObj of wordsWithColors) {
    const word = wordObj.word;
    let placed = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 500;

    while (!placed && attempts < MAX_ATTEMPTS) {
      attempts++;
      
      // Pick random start and direction
      const dir = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
      const startR = Math.floor(Math.random() * size);
      const startC = Math.floor(Math.random() * size);

      let canPlace = true;
      const targetCells = [];

      // Check if word fits
      for (let i = 0; i < word.length; i++) {
        const r = startR + (dir[0] * i);
        const c = startC + (dir[1] * i);

        // Out of bounds
        if (r < 0 || r >= size || c < 0 || c >= size) {
          canPlace = false;
          break;
        }

        // Cell is already occupied by a different letter
        if (grid[r][c] !== null && grid[r][c] !== word[i]) {
          canPlace = false;
          break;
        }

        targetCells.push({ r, c });
      }

      if (canPlace) {
        // Place it!
        for (let i = 0; i < word.length; i++) {
          const { r, c } = targetCells[i];
          grid[r][c] = word[i];
        }
        wordObj.cells = targetCells;
        placedWords.push(wordObj);
        placed = true;
      }
    }
    
    if (!placed) {
       console.warn(`Failed to place word: ${word}`);
    }
  }

  // Fill empty spaces with random letters
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) {
        grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
      }
    }
  }

  return { grid, words: placedWords, size };
}

export function generateRandomEnglishWords() {
    // A small subset of fun random words for vocabulary with meanings
    const dictionary = [
        { word: "MOUNTAIN", meaning: "A large natural elevation of the earth's surface." },
        { word: "OCEAN", meaning: "A very large expanse of sea." },
        { word: "GALAXY", meaning: "A system of millions or billions of stars." },
        { word: "PIZZA", meaning: "A dish of Italian origin consisting of a flat round base." },
        { word: "BICYCLE", meaning: "A vehicle composed of two wheels held in a frame." },
        { word: "BANANA", meaning: "A long curved fruit which grows in clusters." },
        { word: "PENGUIN", meaning: "A flightless seabird of the southern hemisphere." },
        { word: "TORNADO", meaning: "A localized, violently destructive windstorm." },
        { word: "UNICORN", meaning: "A mythical animal typically represented as a horse with a single straight horn." },
        { word: "WHISPER", meaning: "Speaking softly without using the vocal cords." },
        { word: "JUNGLE", meaning: "An area of land overgrown with dense forest." },
        { word: "ZOMBIE", meaning: "A fictional undead creature created through the reanimation of a corpse." },
        { word: "CHAMPION", meaning: "A person who has defeated all opponents in a competition." },
        { word: "PUZZLE", meaning: "A game, toy, or problem designed to test ingenuity." },
        { word: "WIZARD", meaning: "A man who has magical powers." },
        { word: "DRAGON", meaning: "A mythical monster resembling a giant reptile." },
        { word: "DIAMOND", meaning: "A precious stone consisting of a clear and colourless crystalline." },
        { word: "MYSTERY", meaning: "Something that is difficult or impossible to understand or explain." },
        { word: "PYRAMID", meaning: "A monumental structure with a square or triangular base." },
        { word: "SECRET", meaning: "Not known or seen or not meant to be known or seen by others." }
    ];

    // shuffle and take exactly 6 words for 10x10 grids
    const shuffled = [...dictionary].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
}
