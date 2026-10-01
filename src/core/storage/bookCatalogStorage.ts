import { BookProject, BookRecord, BookTheme, AgeGroup } from '../../types/book';

const CATALOG_STORAGE_KEY = 'kunta_kdp_book_catalog_v1';

/**
 * Generates a standardized, professional publishing SKU for Kunta Publications
 * Example: KP-SPACE-AGE4TO6-24P-v8A3F
 */
export function generateBookSku(
  theme: BookTheme,
  ageGroup: AgeGroup,
  pageCount: number,
  seed: number = Date.now()
): string {
  const cleanTheme = theme.toUpperCase();
  const cleanAge = ageGroup.replace(/[^0-9+]/g, 'TO').toUpperCase();
  const hexCode = Math.abs(seed % 0xffff)
    .toString(16)
    .padStart(4, '0')
    .toUpperCase();
  return `KP-${cleanTheme}-AGE${cleanAge}-${pageCount}P-v${hexCode}`;
}

/**
 * Creates a complete BookRecord from a BookProject
 */
export function createBookRecordFromProject(
  project: BookProject,
  isPublishedOnAmazon: boolean = false
): BookRecord {
  const sku = generateBookSku(
    project.config.theme,
    project.config.ageGroup,
    project.config.pageCount,
    project.config.seed
  );

  return {
    id: `book-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    sku,
    title: project.config.title,
    subtitle: project.config.subtitle,
    theme: project.config.theme,
    ageGroup: project.config.ageGroup,
    pageCount: project.config.pageCount,
    puzzleCount: project.pages.length,
    createdAt: new Date().toISOString(),
    isPublishedOnAmazon,
    project,
    tier: 'free',
    isFeatured: false,
  };
}

import { generateFullBookProject, createDefaultConfig } from '../assembly/bookAssembler';

export function createStarterRoadTripBooks(): BookRecord[] {
  const seeds: { title: string; subtitle: string; theme: BookTheme; ageGroup: AgeGroup; childName: string }[] = [
    // Toshi's Books (Ages 4-6)
    {
      title: "🦁 Toshi's Safari Animal Fun",
      subtitle: "Ages 4-6 • Fun Mazes, Animal Word Finds & 4x4 Mini-Sudoku",
      theme: 'animals',
      ageGroup: '4-6',
      childName: 'Toshi',
    },
    {
      title: "🦕 Toshi's Dino Valley Adventure",
      subtitle: "Ages 4-6 • Prehistoric Mazes, Dot-to-Dot & Dino Coloring",
      theme: 'dinosaurs',
      ageGroup: '4-6',
      childName: 'Toshi',
    },
    {
      title: "🌊 Toshi's Ocean Reef Quest",
      subtitle: "Ages 4-6 • Friendly Fish Mazes & Underwater Puzzles",
      theme: 'underwater',
      ageGroup: '4-6',
      childName: 'Toshi',
    },
    // Maan's Books (Ages 10+)
    {
      title: "🚀 Maan's Cosmic Starship Odyssey",
      subtitle: "Ages 10+ • 9x9 Sudoku, Complex Loop Mazes & Alien Word Hunts",
      theme: 'space',
      ageGroup: '10+',
      childName: 'Maan',
    },
    {
      title: "🐉 Maan's Fantasy Dragon Labyrinth",
      subtitle: "Ages 10+ • Medieval Castle Mazes, Logic Sudoku & Mythic Puzzles",
      theme: 'fantasy',
      ageGroup: '10+',
      childName: 'Maan',
    },
    {
      title: "🌴 Maan's Deep Jungle Expedition",
      subtitle: "Ages 10+ • Wild Rainforest Logic, Intricate Mazes & Word Grids",
      theme: 'jungle',
      ageGroup: '10+',
      childName: 'Maan',
    },
  ];

  return seeds.map((s, idx) => {
    const config = {
      ...createDefaultConfig(),
      title: s.title,
      subtitle: s.subtitle,
      authorName: `${s.childName} & Dad`,
      childName: s.childName,
      ageGroup: s.ageGroup,
      theme: s.theme,
      pageCount: 24,
      seed: 100000 + idx * 7777,
    };
    const project = generateFullBookProject(config);
    return createBookRecordFromProject(project, false);
  });
}

/**
 * Load all books from localStorage, auto-seeding if empty
 */
export function loadBookCatalog(): BookRecord[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(CATALOG_STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 2) {
        return parsed;
      }
    }
    const starterBooks = createStarterRoadTripBooks();
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(starterBooks));
    }
    return starterBooks;
  } catch (err) {
    console.error('Failed to load book catalog from localStorage:', err);
    return createStarterRoadTripBooks();
  }
}

/**
 * Save / Upsert a book record to the catalog
 */
export function saveBookToCatalog(record: BookRecord): BookRecord[] {
  try {
    const current = loadBookCatalog();
    const existingIndex = current.findIndex((b) => b.id === record.id || b.sku === record.sku);

    let updated: BookRecord[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...record };
    } else {
      updated = [record, ...current];
    }

    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save book to catalog in localStorage:', err);
    return loadBookCatalog();
  }
}

/**
 * Update the "Published on Amazon (Yes/No)" status of a book
 */
export function updateBookPublishStatus(bookId: string, isPublished: boolean): BookRecord[] {
  try {
    const current = loadBookCatalog();
    const updated = current.map((book) =>
      book.id === bookId ? { ...book, isPublishedOnAmazon: isPublished } : book
    );
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to update published status in localStorage:', err);
    return loadBookCatalog();
  }
}

/**
 * Delete a book from the catalog
 */
export function deleteBookFromCatalog(bookId: string): BookRecord[] {
  try {
    const current = loadBookCatalog();
    const updated = current.filter((b) => b.id !== bookId);
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to delete book from catalog in localStorage:', err);
    return loadBookCatalog();
  }
}
