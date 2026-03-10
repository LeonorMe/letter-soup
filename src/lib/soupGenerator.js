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
    .map(w => w.toUpperCase().replace(/\s+/g, ''))
    .filter(w => w.length > 0)
    .slice(0, 12); // Max 12 words

  if (words.length === 0) {
     return { grid: [], words: [], size: 15 };
  }

  // Determine grid size
  const maxWordLength = Math.max(...words.map(w => w.length));
  
  // User requested: default 10x10, or 2 words bigger diagonally than the biggest word
  // Let's interpret "2 words bigger diagonally" as size = maxWordLength + 2
  const minRequiredSize = Math.max(10, maxWordLength + 2);
  const size = manualSize ? Math.max(manualSize, minRequiredSize) : minRequiredSize;

  // Initialize empty grid
  const grid = Array(size).fill(null).map(() => Array(size).fill(null));
  
  // Track placed words for answers
  const placedWords = [];

  // Assign a color to each word
  const wordsWithColors = words.map((word, index) => ({
    word,
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
    // A small subset of fun random words for vocabulary (could be expanded)
    const dictionary = [
        "MOUNTAIN", "OCEAN", "GALAXY", "PIZZA", "BICYCLE", "BANANA", "PENGUIN", 
        "TORNADO", "UNICORN", "WHISPER", "JUNGLE", "ZOMBIE", "CHAMPION", "PUZZLE",
        "WIZARD", "DRAGON", "DIAMOND", "MYSTERY", "PYRAMID", "SECRET"
    ];

    // shuffle and take random amount between 6 and 12
    const shuffled = [...dictionary].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 7) + 6; // 6 to 12
    return shuffled.slice(0, count);
}
