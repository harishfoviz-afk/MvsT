import { AgeGroup, BookTheme } from '../../types/book';
import { createRNG } from './mazeGenerator';
import { getWordDefinition } from '../data/wordDictionary';

export interface PlacedWord {
  word: string;
  start: { x: number; y: number };
  end: { x: number; y: number };
  dx: number;
  dy: number;
}

export interface WordSearchData {
  gridSize: number;
  grid: string[][];
  words: string[];
  placedWords: PlacedWord[];
  theme: BookTheme;
  difficulty: 'easy' | 'medium' | 'hard';
  seed: number;
}

// Curated age-friendly vocabulary database (Expanded for 0% cross-page duplication)
export const THEME_VOCABULARY: Record<BookTheme, { easy: string[]; medium: string[]; hard: string[] }> = {
  animals: {
    easy: [
      'CAT', 'DOG', 'BEAR', 'LION', 'FROG', 'BIRD', 'DUCK', 'PIG', 'FOX', 'COW',
      'BAT', 'BEE', 'ANT', 'OWL', 'HEN', 'RAM', 'YAK', 'ELK', 'GOAT', 'WOLF',
      'SEAL', 'DEER', 'FISH', 'PUP', 'CUB', 'CALF', 'TOAD', 'CRAB', 'MOLE', 'HARE',
      'LAMB', 'COLT', 'FOAL', 'PONY', 'APES', 'BULL', 'MOTH', 'SWAN', 'MULE', 'LYNX'
    ],
    medium: [
      'TIGER', 'ZEBRA', 'PANDA', 'RABBIT', 'MONKEY', 'GIRAFFE', 'TURTLE', 'DOLPHIN', 'EAGLE', 'PARROT',
      'KOALA', 'WALRUS', 'BADGER', 'BEAVER', 'OTTER', 'FALCON', 'LIZARD', 'CAMEL', 'JAGUAR', 'LEOPARD',
      'PANTHER', 'COUGAR', 'PELICAN', 'PENGUIN', 'DONKEY', 'CHEETAH', 'GORILLA', 'HAMSTER', 'MEERKAT', 'RACCOON'
    ],
    hard: [
      'CHAMELEON', 'KANGAROO', 'CROCODILE', 'HIPPOPOTAMUS', 'RHINOCEROS', 'CHIMPANZEE', 'FLAMINGO', 'HEDGEHOG',
      'ARMADILLO', 'PLATYPUS', 'ALLIGATOR', 'WOLVERINE', 'WOODPECKER', 'PORCUPINE', 'SALAMANDER', 'KINGFISHER',
      'ALBATROSS', 'ORANGUTAN', 'KOMODODRAGON', 'BARRACUDA'
    ],
  },
  space: {
    easy: [
      'SUN', 'MOON', 'STAR', 'MARS', 'EARTH', 'COMET', 'SKY', 'ORBIT', 'PLUTO', 'NOVA',
      'BEAM', 'GLOW', 'RING', 'DARK', 'RAY', 'LUNA', 'DEEP', 'VAST', 'HEAT', 'COLD',
      'ROCK', 'SHIP', 'POD', 'DOME', 'BASE', 'SUIT', 'CAP', 'BOOT', 'DISK', 'DUST',
      'BLUE', 'RED', 'FAR', 'PATH', 'ATOM', 'FLUX', 'DAWN', 'SOLAR', 'FLARE', 'CORE'
    ],
    medium: [
      'ROCKET', 'PLANET', 'VENUS', 'SATURN', 'GALAXY', 'METEOR', 'ASTEROID', 'CRATER', 'SOLAR', 'ALIEN',
      'JUPITER', 'MERCURY', 'NEPTUNE', 'URANUS', 'COSMOS', 'MODULE', 'SHUTTLE', 'ECLIPSE', 'SPACEMAN', 'GRAVITY',
      'ORBITER', 'STATION', 'ROCKETS', 'LANDER', 'PROBE', 'CORONA', 'PULSAR', 'ZENITH', 'AURORA', 'VOYAGER'
    ],
    hard: [
      'TELESCOPE', 'ASTRONAUT', 'CONSTELLATION', 'SUPERNOVA', 'SATELLITE', 'SPACESHIP', 'LIGHTYEAR', 'NEBULA',
      'ATMOSPHERE', 'INTERSTELLAR', 'WEIGHTLESS', 'EXOPLANET', 'PROPULSION', 'SPACECRAFT', 'HELIOSPHERE', 'SOLARSYSTEM',
      'ASTRONOMY', 'COSMOLOGY', 'STRATOSPHERE', 'BLACKHOLE'
    ],
  },
  dinosaurs: {
    easy: [
      'BONE', 'EGG', 'CLAW', 'ROAR', 'FANG', 'FOOT', 'TAIL', 'NEST', 'HERD', 'LAND',
      'MUD', 'ROCK', 'SWAMP', 'FERN', 'CAVE', 'JAW', 'HORN', 'BIG', 'TALL', 'WILD',
      'PREY', 'RUN', 'HUNT', 'BITE', 'WALK', 'TREE', 'LAKE', 'LEAF', 'HIDE', 'CLAN'
    ],
    medium: [
      'FOSSIL', 'RAPTOR', 'SPIKES', 'ARMOR', 'JURASSIC', 'EXTINCT', 'CARNIVORE', 'VOLCANO', 'PREY', 'TRIASSIC',
      'CRETACEOUS', 'SCALES', 'PLATES', 'TALONS', 'TRACKS', 'SKELETON', 'HUNTER', 'GIANT', 'MUSEUM', 'BEAST',
      'DIGSITE', 'REPTILE', 'MONSTER', 'ANCIENT', 'DEFENSE', 'PREDATOR', 'HERBIVORE'
    ],
    hard: [
      'TYRANNOSAURUS', 'TRICERATOPS', 'STEGOSAURUS', 'BRACHIOSAURUS', 'VELOCIRAPTOR', 'PTERODACTYL', 'HERBIVORE',
      'ANKYLOSAURUS', 'DIPLODOCUS', 'SPINOSAURUS', 'ALLOSAURUS', 'IGUANODON', 'PARASAUROLOPHUS', 'PALEONTOLOGY',
      'PTEROSAUR', 'ARCHAEOPTERYX', 'MEGALOSAURUS'
    ],
  },
  fantasy: {
    easy: [
      'WAND', 'KING', 'MOAT', 'RING', 'HERO', 'GEM', 'FAIRY', 'ELVES', 'GOLD', 'ROBE',
      'CAPE', 'GATE', 'BELL', 'CROWN', 'BOOK', 'MAP', 'FLAG', 'STAR', 'WISH', 'TALE',
      'SPARK', 'GLOW', 'MAZE', 'KEEP', 'TOWER', 'ISLE', 'LAMP', 'SHINE', 'WOODS', 'CAST'
    ],
    medium: [
      'CASTLE', 'DRAGON', 'KNIGHT', 'WIZARD', 'MAGIC', 'POTION', 'SHIELD', 'PRINCE', 'SWORD', 'CROWN',
      'PALACE', 'SPELL', 'CHEST', 'CRYSTAL', 'PORTAL', 'PRINCESS', 'AMULET', 'LEGEND', 'ARMOR', 'SCEPTRE',
      'SCROLL', 'GOBLIN', 'PEGASUS', 'PHOENIX', 'VALLEY', 'FEATHER', 'BEACON', 'CHAMPION'
    ],
    hard: [
      'UNICORN', 'SPELLBOOK', 'ENCHANTMENT', 'MYTHOLOGY', 'KINGDOM', 'SORCERESS', 'TREASURE', 'QUEST',
      'LABYRINTH', 'EXCALIBUR', 'ALCHEMIST', 'CENTAUR', 'SPELLCASTER', 'SPELLBOUND', 'SOVEREIGN', 'FORTRESS',
      'MAGICIAN', 'APPRENTICE', 'PROPHECY'
    ],
  },
  underwater: {
    easy: [
      'FISH', 'SEAL', 'CRAB', 'WAVE', 'CLAM', 'REEF', 'SAND', 'SWIM', 'TIDE', 'KELP',
      'BLUE', 'BOAT', 'FIN', 'GILL', 'GULF', 'SURF', 'SALT', 'FOAM', 'DEEP', 'SHIP',
      'DIVE', 'NET', 'CRAY', 'SQUID', 'PIER', 'MAST', 'HOOK', 'WET', 'GULL', 'SAIL'
    ],
    medium: [
      'SHARK', 'WHALE', 'CORAL', 'TURTLE', 'OTTER', 'STARFISH', 'OCTOPUS', 'DOLPHIN', 'SHELL', 'OCEAN',
      'LAGOON', 'HARBOR', 'CURRENT', 'ISLAND', 'ANCHOR', 'WALRUS', 'PENGUIN', 'SPONGE', 'DIVING', 'PIRATE',
      'TRENCH', 'PELICAN', 'MARINERS', 'BARNACLE', 'TREASURE', 'VOYAGE'
    ],
    hard: [
      'SUBMARINE', 'SEAHORSE', 'JELLYFISH', 'STINGRAY', 'LOBSTER', 'BARRACUDA', 'SHIPWRECK', 'ANEMONE',
      'BENTHIC', 'PELAGIC', 'SCUBA', 'CRUSTACEAN', 'CORALREEF', 'AQUARIUM', 'WHALESHARK', 'NAUTILUS',
      'HAMMERHEAD', 'HYDROTHERMAL'
    ],
  },
  jungle: {
    easy: [
      'TREE', 'LEAF', 'VINE', 'APE', 'BIRD', 'BUG', 'RAIN', 'FERN', 'FROG', 'MUD',
      'MOSS', 'WILD', 'WOOD', 'PATH', 'WARM', 'WET', 'BUSH', 'ROOT', 'NEST', 'BARK',
      'SEED', 'PALM', 'CREEK', 'SWAMP', 'DUSK', 'BEAK', 'CLAW', 'LOG', 'WING', 'RUSH'
    ],
    medium: [
      'MONKEY', 'PARROT', 'JAGUAR', 'SNAKE', 'BAMBOO', 'CANOPY', 'TIGER', 'SLOTH', 'TOUCAN', 'ORCHID',
      'LEMUR', 'IGUANA', 'PYTHON', 'PANTHER', 'BRANCH', 'STREAM', 'FOREST', 'NATURE', 'SAFARI', 'TROOP',
      'GIBBON', 'OCELOT', 'BEETLE', 'SPIDER', 'AMAZON', 'CHAMELEON'
    ],
    hard: [
      'RAINFOREST', 'CHIMPANZEE', 'TARANTULA', 'ANACONDA', 'WATERFALL', 'EXPEDITION', 'BUTTERFLY', 'WILDLIFE',
      'UNDERSTORY', 'ORANGUTAN', 'POISONFROG', 'BIODIVERSITY', 'CARNIVORE', 'CONSERVATION', 'ECOSYSTEM', 'EQUATORIAL'
    ],
  },
};

export function generateWordSearch(
  ageGroup: AgeGroup,
  theme: BookTheme,
  seed: number = Date.now(),
  excludedWords: string[] = []
): WordSearchData {
  const rng = createRNG(seed);
  const themeWords = THEME_VOCABULARY[theme] || THEME_VOCABULARY.animals;

  let gridSize = 8;
  let wordCount = 5;
  let allowedDirections: [number, number][] = [];
  let candidatePool: string[] = [];
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';

  if (ageGroup === '4-6') {
    gridSize = 8;
    wordCount = 5;
    difficulty = 'easy';
    candidatePool = [...themeWords.easy];
    // Ages 4-6: ONLY Left-to-Right and Top-to-Bottom
    allowedDirections = [
      [1, 0], // Horizontal L to R
      [0, 1], // Vertical T to B
    ];
  } else if (ageGroup === '7-9') {
    gridSize = 12;
    wordCount = 9;
    difficulty = 'medium';
    candidatePool = [...themeWords.easy, ...themeWords.medium];
    // Ages 7-9: Horizontal, Vertical, and Diagonals (down-right, down-left)
    allowedDirections = [
      [1, 0],
      [0, 1],
      [1, 1],
      [-1, 1],
    ];
  } else {
    gridSize = 15;
    wordCount = 14;
    difficulty = 'hard';
    candidatePool = [...themeWords.medium, ...themeWords.hard];
    // Ages 10+: All 8 directions (including backwards)
    allowedDirections = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ];
  }

  // Smart Anti-Overlap: Prioritize words that have NOT been used on earlier pages in this book!
  if (excludedWords.length > 0) {
    const excludedSet = new Set(excludedWords.map((w) => w.toUpperCase()));
    const freshWords = candidatePool.filter((w) => !excludedSet.has(w));
    const usedWords = candidatePool.filter((w) => excludedSet.has(w));
    candidatePool = [...freshWords, ...usedWords];
  }

  // Shuffle within the candidate sections using RNG
  for (let i = candidatePool.length - 1; i > 0; i--) {
    // If we have excludedWords, only shuffle within fresh words if we have enough
    const j = Math.floor(rng() * (i + 1));
    [candidatePool[i], candidatePool[j]] = [candidatePool[j], candidatePool[i]];
  }

  // Initialize empty grid
  const grid: (string | null)[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
  const placedWords: PlacedWord[] = [];
  const wordsToPlace: string[] = [];

  for (const rawWord of candidatePool) {
    if (wordsToPlace.length >= wordCount) break;
    const word = rawWord.toUpperCase().replace(/[^A-Z]/g, '');
    if (word.length > gridSize) continue;

    // Try placing word in grid
    let placed = false;
    // Shuffle possible starting positions and directions
    const attempts = 150;
    for (let a = 0; a < attempts; a++) {
      const [dx, dy] = allowedDirections[Math.floor(rng() * allowedDirections.length)];
      
      // Calculate valid start ranges
      const minX = dx < 0 ? word.length - 1 : 0;
      const maxX = dx > 0 ? gridSize - word.length : gridSize - 1;
      const minY = dy < 0 ? word.length - 1 : 0;
      const maxY = dy > 0 ? gridSize - word.length : gridSize - 1;

      if (minX > maxX || minY > maxY) continue;

      const startX = minX + Math.floor(rng() * (maxX - minX + 1));
      const startY = minY + Math.floor(rng() * (maxY - minY + 1));

      // Check if word can fit
      let canPlace = true;
      for (let i = 0; i < word.length; i++) {
        const nx = startX + i * dx;
        const ny = startY + i * dy;
        const existing = grid[ny][nx];
        if (existing !== null && existing !== word[i]) {
          canPlace = false;
          break;
        }
      }

      if (canPlace) {
        // Place word
        for (let i = 0; i < word.length; i++) {
          const nx = startX + i * dx;
          const ny = startY + i * dy;
          grid[ny][nx] = word[i];
        }

        const endX = startX + (word.length - 1) * dx;
        const endY = startY + (word.length - 1) * dy;

        placedWords.push({
          word,
          start: { x: startX, y: startY },
          end: { x: endX, y: endY },
          dx,
          dy,
        });

        wordsToPlace.push(word);
        placed = true;
        break;
      }
    }
  }

  // Fill remaining empty cells with random letters
  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const finalGrid: string[][] = [];

  for (let y = 0; y < gridSize; y++) {
    const row: string[] = [];
    for (let x = 0; x < gridSize; x++) {
      if (grid[y][x] !== null) {
        row.push(grid[y][x]!);
      } else {
        const randomChar = ALPHABET[Math.floor(rng() * ALPHABET.length)];
        row.push(randomChar);
      }
    }
    finalGrid.push(row);
  }

  return {
    gridSize,
    grid: finalGrid,
    words: wordsToPlace,
    placedWords,
    theme,
    difficulty,
    seed,
  };
}

export function renderWordSearchSVG(data: WordSearchData, showSolution: boolean = false): string {
  const { gridSize, grid, words, placedWords } = data;

  const width = 500;
  const height = 580;
  const gridPadding = 20;
  const gridWidth = 420;
  const cellSize = gridWidth / gridSize;
  const gridOffsetX = (width - gridWidth) / 2;
  const gridOffsetY = 30;

  // Render Grid Cells: Separate background rects from letter texts so highlights render properly
  let cellBackgroundsSVG = '';
  let cellTextsSVG = '';
  const fontSize = Math.min(24, Math.max(12, cellSize * 0.55));

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cx = gridOffsetX + x * cellSize;
      const cy = gridOffsetY + y * cellSize;
      const letter = grid[y][x];

      // Subtle cell background / border
      cellBackgroundsSVG += `
        <rect x="${cx}" y="${cy}" width="${cellSize}" height="${cellSize}" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" rx="4" />
      `;

      cellTextsSVG += `
        <text x="${cx + cellSize / 2}" y="${cy + cellSize / 2 + fontSize * 0.35}" 
              font-family="'Outfit', sans-serif" font-weight="${showSolution ? '800' : '700'}" font-size="${fontSize}" 
              text-anchor="middle" fill="#0f172a">${letter}</text>
      `;
    }
  }

  // Render Solution Highlights (drawn OVER cell white backgrounds, UNDER letter text)
  let solutionHighlights = '';
  if (showSolution) {
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4', '#ea580c'];
    placedWords.forEach((pw, idx) => {
      const color = colors[idx % colors.length];
      const startX = gridOffsetX + pw.start.x * cellSize + cellSize / 2;
      const startY = gridOffsetY + pw.start.y * cellSize + cellSize / 2;
      const endX = gridOffsetX + pw.end.x * cellSize + cellSize / 2;
      const endY = gridOffsetY + pw.end.y * cellSize + cellSize / 2;

      solutionHighlights += `
        <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" 
              stroke="${color}" stroke-width="${cellSize * 0.78}" stroke-linecap="round" opacity="0.45" />
      `;
    });
  }

  // Render Word Bank below grid
  const bankStartY = gridOffsetY + gridSize * cellSize + 24;
  let wordBankSVG = `
    <text x="${width / 2}" y="${bankStartY}" font-family="'Outfit', sans-serif" font-weight="800" font-size="14" text-anchor="middle" fill="#475569" letter-spacing="1">${showSolution ? 'SOLVED WORDS:' : 'FIND THESE WORDS:'}</text>
  `;

  const wordsPerRow = gridSize <= 8 ? 3 : 4;
  const colWidth = (width - 60) / wordsPerRow;

  words.forEach((w, idx) => {
    const col = idx % wordsPerRow;
    const row = Math.floor(idx / wordsPerRow);
    const wx = 24 + col * colWidth + 8;
    const wy = bankStartY + 24 + row * 22;
    const def = getWordDefinition(w, data.theme);
    const icon = def?.icon ? `${def.icon} ` : '';

    wordBankSVG += `
      <g class="${showSolution ? 'word-found' : 'word-unfound'}">
        <rect x="${wx}" y="${wy - 11}" width="12" height="12" rx="3" 
              fill="${showSolution ? '#10b981' : 'none'}" 
              stroke="${showSolution ? '#059669' : '#94a3b8'}" stroke-width="1.5" />
        ${showSolution ? `<text x="${wx + 6}" y="${wy - 1}" font-family="sans-serif" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">✓</text>` : ''}
        <text x="${wx + 18}" y="${wy}" font-family="'Outfit', sans-serif" font-weight="700" font-size="12" 
              fill="${showSolution ? '#059669' : '#334155'}">${icon}${w}</text>
      </g>
    `;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-full">
      <rect width="${width}" height="${height}" fill="#ffffff" />
      
      <!-- Word Grid Background Frame -->
      <rect x="${gridOffsetX - 6}" y="${gridOffsetY - 6}" width="${gridWidth + 12}" height="${gridSize * cellSize + 12}" 
            fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" rx="8" />

      <!-- Cell Backgrounds -->
      ${cellBackgroundsSVG}

      <!-- Solution Highlights (drawn on top of white cells, behind letter text) -->
      ${solutionHighlights}

      <!-- Grid Cell Letters -->
      ${cellTextsSVG}

      <!-- Word Bank -->
      ${wordBankSVG}
    </svg>
  `;
}
