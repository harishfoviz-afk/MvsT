import { ActivityPage, ActivityType, BookConfig, BookProject, BookTheme } from '../../types/book';
import { generateMaze, renderMazeSVG } from '../generators/mazeGenerator';
import { generateWordSearch, renderWordSearchSVG } from '../generators/wordSearchGenerator';
import { generateDotToDot, renderDotToDotSVG } from '../generators/dotToDotGenerator';
import { generateColoringPage, renderColoringSVG } from '../generators/coloringGenerator';
import { generateSudoku, renderSudokuSVG } from '../generators/sudokuGenerator';
import { runPageQualityCheck } from '../qc/qcEngine';

export function createDefaultConfig(): BookConfig {
  return {
    title: 'Super Fun Activity Book for Kids',
    subtitle: '100+ Awesome Mazes, Word Searches, Dot-to-Dot & Coloring Activities',
    authorName: 'Toshith Charish', // Default author for Ages 4-6
    ageGroup: '4-6',
    theme: 'animals',
    pageCount: 24, // Starting KDP paperback compliant size
    singleSided: true, // Crucial feature to prevent marker bleed
    activityDistribution: {
      maze: 30,
      wordsearch: 30,
      dottodot: 20,
      coloring: 10,
      sudoku: 10,
    },
    seed: Math.floor(Date.now() + Math.random() * 100000),
  };
}

export function generateSingleActivityPage(
  type: ActivityType,
  pageNumber: number,
  config: BookConfig,
  existingPages: ActivityPage[] = [],
  challengeNumber: number = 1
): ActivityPage {
  let attempts = 0;
  let page: ActivityPage | null = null;

  while (attempts < 10) {
    const pageSeed = config.seed + pageNumber * 1000 + attempts * 17;
    let data: any;
    let title = '';
    let instructions = '';
    let difficulty: 'easy' | 'medium' | 'hard' = config.ageGroup === '4-6' ? 'easy' : config.ageGroup === '7-9' ? 'medium' : 'hard';
    let svgContent = '';
    let solutionSvgContent = '';

    if (type === 'maze') {
      data = generateMaze(config.ageGroup, config.theme, pageSeed);
      const themeMazeTitles: Record<BookTheme, string[]> = {
        animals: ["Puppy's Bone Quest", "Kitten's Yarn Trail", "Bunny's Carrot Run", "Lion Cub's Safari Path", "Bear's Honey Hunt", "Panda's Bamboo Pathway", "Fox's Forest Run", "Monkey's Jungle Vine"],
        space: ["Rocket's Planet Run", "Astronaut's Moon Walk", "Comet Cruiser Path", "Saturn Ring Odyssey", "Alien UFO Pathway", "Galaxy Star Nav", "Cosmic Asteroid Trail", "Space Station Docking"],
        dinosaurs: ["T-Rex Jurassic Trail", "Triceratops Canyon Run", "Velociraptor Valley", "Stegosaurus Mountain Path", "Brontosaurus Forest Walk", "Pterodactyl Skyway", "Fossil Hunter's Labyrinth", "Volcano Escape Route"],
        fantasy: ["Unicorn's Rainbow Path", "Dragon's Castle Labyrinth", "Wizard's Mystic Tower", "Knight's Quest Trail", "Fairy Glade Escape", "Enchanted Forest Maze", "Crystal Cave Odyssey", "Pegasus Cloud Pathway"],
        underwater: ["Dolphin's Coral Reef", "Sea Turtle's Ocean Current", "Clownfish Anemone Run", "Blue Whale's Deep Voyage", "Seahorse Sunken Ship", "Octopus Secret Cavern", "Starfish Lagoon Trail", "Submarine Trench Quest"],
        jungle: ["Monkey's Banana Trail", "Tiger's Hidden Path", "Parrot's Canopy Flight", "Chameleon's Vine Walk", "Jaguar's Rainforest Run", "Toucan's Fruit Haven", "Treefrog River Run", "Gorilla Jungle Trek"],
      };
      const list = themeMazeTitles[config.theme] || themeMazeTitles.animals;
      const mazeIndex = existingPages.filter((p) => p.type === 'maze').length;
      title = list[mazeIndex % list.length].toUpperCase();
      instructions = 'Find the path from the start to the finish! Avoid the dead ends.';
      svgContent = renderMazeSVG(data, false);
      solutionSvgContent = renderMazeSVG(data, true);
    } else if (type === 'wordsearch') {
      const usedWords = existingPages
        .filter((p) => p.type === 'wordsearch' && p.data?.words)
        .flatMap((p) => p.data.words as string[]);
      data = generateWordSearch(config.ageGroup, config.theme, pageSeed, usedWords);
      const wsSubtitles: Record<BookTheme, string[]> = {
        animals: ['Safari Friends', 'Ocean Creatures', 'Jungle Critters', 'Farm Animals', 'Forest Explorers', 'Pet Pals'],
        space: ['Planets & Moons', 'Astronaut Gear', 'Stars & Skies', 'Cosmic Rockets', 'Galaxies & Comets', 'Deep Space'],
        dinosaurs: ['Mighty Predators', 'Gentle Herbivores', 'Prehistoric Giants', 'Fossils & Bones', 'Jurassic Flora', 'Ancient Skies'],
        fantasy: ['Magical Creatures', 'Spells & Potions', 'Castle Kingdom', 'Enchanted Forests', 'Treasure Quests', 'Mystic Beasts'],
        underwater: ['Coral Reef Life', 'Deep Sea Divers', 'Tidal Treasures', 'Ocean Giants', 'Coastal Wonders', 'Shell Explorers'],
        jungle: ['Rainforest Canopy', 'River Dwellers', 'Tropical Birds', 'Exotic Wildlife', 'Jungle Trees', 'Wild Vines'],
      };
      const wsList = wsSubtitles[config.theme] || wsSubtitles.animals;
      const wsIndex = existingPages.filter((p) => p.type === 'wordsearch').length;
      title = `${config.theme.toUpperCase()} WORD SEARCH: ${wsList[wsIndex % wsList.length].toUpperCase()}`;
      instructions = config.ageGroup === '4-6' 
        ? 'Search across and down to find the hidden words!' 
        : 'Find and circle all the hidden words in the puzzle grid!';
      svgContent = renderWordSearchSVG(data, false);
      solutionSvgContent = renderWordSearchSVG(data, true);
    } else if (type === 'dottodot') {
      const usedDotNames = existingPages
        .filter((p) => p.type === 'dottodot' && p.data?.name)
        .map((p) => p.data.name as string);
      data = generateDotToDot(config.ageGroup, config.theme, pageSeed, usedDotNames);
      title = `CONNECT THE DOTS: ${data.name.toUpperCase()}`;
      instructions = `Connect the numbered dots in order from 1 to ${data.points.length} and color the picture!`;
      svgContent = renderDotToDotSVG(data, false);
      solutionSvgContent = renderDotToDotSVG(data, true);
    } else if (type === 'coloring') {
      const usedColoringTitles = existingPages
        .filter((p) => p.type === 'coloring' && p.data?.title)
        .map((p) => p.data.title as string);
      data = generateColoringPage(config.ageGroup, config.theme, pageSeed, usedColoringTitles);
      title = data.title.toUpperCase();
      instructions = 'Use your favorite crayons and colors to bring this scene to life!';
      svgContent = renderColoringSVG(data);
      solutionSvgContent = svgContent; // Coloring pages don't have separate answers
    } else {
      data = generateSudoku(config.ageGroup, config.theme, pageSeed);
      title = `KIDS SUDOKU CHALLENGE #${challengeNumber} (${data.size}x${data.size})`;
      instructions = data.size === 4 
        ? 'Place numbers 1 through 4 so each number appears once per row, column, and box.'
        : `Place numbers 1 through ${data.size} without repeating in any row or column.`;
      svgContent = renderSudokuSVG(data, false);
      solutionSvgContent = renderSudokuSVG(data, true);
    }

    const unvalidatedPage = {
      id: `p-${pageNumber}-${Date.now()}-${attempts}`,
      pageNumber,
      challengeNumber,
      type,
      title,
      instructions,
      difficulty,
      theme: config.theme,
      data,
      solutionData: data,
      svgContent,
      solutionSvgContent,
    };

    const qc = runPageQualityCheck(unvalidatedPage, config.ageGroup, existingPages);

    if (qc.passed || attempts === 9) {
      page = { ...unvalidatedPage, qc };
      break;
    }
    attempts++;
  }

  return page!;
}

export function generateFullBookProject(config: BookConfig): BookProject {
  const pages: ActivityPage[] = [];

  // Determine number of activity pages to generate
  // Front matter uses 4 pages (Title, Belongs To, Instructions, Stamp Passport)
  // Back matter uses ~3-4 pages (Solutions + Certificate)
  // If singleSided, each activity page has an alternate blank backing page
  const frontCount = 4;
  const backCount = Math.max(2, Math.ceil(config.pageCount / 8));
  const availableInterior = Math.max(6, config.pageCount - frontCount - backCount);
  const targetActivities = config.singleSided 
    ? Math.max(4, Math.floor(availableInterior / 2)) 
    : availableInterior;

  // Build activity type pool based on distribution
  const pool: ActivityType[] = [];
  const dist = config.activityDistribution;
  const types: ActivityType[] = ['maze', 'wordsearch', 'dottodot', 'coloring', 'sudoku'];

  for (const t of types) {
    const count = Math.round((dist[t] / 100) * targetActivities);
    for (let i = 0; i < count; i++) {
      pool.push(t);
    }
  }

  // Adjust pool length to match targetActivities
  while (pool.length < targetActivities) {
    pool.push(types[pool.length % types.length]);
  }
  while (pool.length > targetActivities) {
    pool.pop();
  }

  // Generate pages
  for (let i = 0; i < pool.length; i++) {
    const pageNumber = frontCount + (config.singleSided ? i * 2 + 1 : i + 1);
    const newPage = generateSingleActivityPage(pool[i], pageNumber, config, pages, i + 1);
    pages.push(newPage);
  }

  return {
    config,
    pages,
    frontMatter: {
      titlePage: true,
      belongsToPage: true,
      instructionsPage: true,
      stampPassportPage: true,
      childName: config.childName,
    },
    backMatter: {
      solutionsPage: true,
      pictureDictionaryPage: true,
      congratulationsPage: true,
    },
    cover: {
      templateId: 'playful-adventure',
      theme: config.theme,
      title: config.title,
      subtitle: config.subtitle,
      authorName: config.authorName,
      primaryColor: '#3b82f6',
      secondaryColor: '#f59e0b',
      accentColor: '#10b981',
      fontFamily: 'Fredoka',
      spineText: `${config.title} • ${config.authorName}`,
      backCoverBlurb: `Packed with fun and engaging activities, this book is specifically designed for ages ${config.ageGroup} to spark creativity, boost problem-solving skills, and provide hours of screen-free entertainment!`,
      features: [
        '✨ Variety of Puzzles: Mazes, Word Searches, Dot-to-Dot & Coloring',
        '🧠 Age-Appropriate Challenge Levels',
        '🖍️ Single-Sided Pages to Prevent Marker Bleed-Through',
        '✅ Complete Solutions & Answer Key Included at the Back',
        '📏 Perfect 8.5" x 11" Large Format for Little Hands',
      ],
      showBarcodePlaceholder: true,
      showPublisherLogo: true,
      logoPlacement: 'both',
    },
  };
}
