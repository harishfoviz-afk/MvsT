/**
 * TotLogix Kids Hub - Explorer Profile & Gamification Storage Engine
 * 
 * Manages player profiles, live completion timers, 3-star evaluations,
 * age-based XP progression, personal best records, and completed game tracking.
 */

import { ActivityType, AgeGroup, BookTheme, BookRecord } from '../../types/book';

export interface PuzzleRecord {
  bookId: string;
  challengeNumber: number;
  activityType: ActivityType;
  title: string;
  bestTimeSeconds: number;
  stars: 1 | 2 | 3;
  completedAt: string;
  attemptsCount: number;
  conflictsCount: number;
}

export interface CompletedGameRecord {
  bookId: string;
  bookTitle: string;
  bookSku: string;
  ageGroup: AgeGroup;
  theme: BookTheme;
  totalPuzzles: number;
  solvedPuzzlesCount: number;
  totalStars: number;
  totalTimeSeconds: number;
  isFullyCompleted: boolean;
  lastPlayedAt: string;
}

export interface ExplorerProfile {
  name: string;
  avatar: string;
  ageGroup: AgeGroup;
  birthDate?: string; // YYYY-MM-DD
  ageYears?: number;  // Exact calculated age in years
  totalXp: number;
  level: number;
  levelTitle: string;
  totalPuzzlesSolved: number;
  totalStarsEarned: number;
  totalSecondsPlayed: number;
  cleanSolvesCount: number;
  puzzleRecords: Record<string, PuzzleRecord>; // key: `${bookId}_ch_${challengeNumber}`
  completedGames: Record<string, CompletedGameRecord>; // key: bookId
  lastPlayedBookId?: string;
  lastPlayedChallengeNum?: number;
  lastPlayedAt?: string;
}

export interface PuzzleCompletionResult {
  profile: ExplorerProfile;
  isNewBest: boolean;
  previousBestSeconds?: number;
  timeSeconds: number;
  starsEarned: 1 | 2 | 3;
  xpGained: number;
  leveledUp: boolean;
  newLevel?: number;
  newLevelTitle?: string;
}

const STORAGE_KEY = 'kunta_kids_profile_v2';
const FRESH_START_FLAG = 'kunta_kids_fresh_start_v2';

// Automatic one-time cleanup of stale test explorer profiles for a 100% fresh start
if (typeof localStorage !== 'undefined') {
  try {
    if (!localStorage.getItem(FRESH_START_FLAG)) {
      localStorage.removeItem('kunta_kids_profile_v1');
      localStorage.removeItem('kunta_kids_explorer_name');
      localStorage.removeItem('kunta_kids_explorer_avatar');
      localStorage.setItem(FRESH_START_FLAG, 'true');
    }
  } catch {
    // Ignore in SSR / test environments
  }
}

const memoryStorage = new Map<string, string>();

function getStorageItem(key: string): string | null {
  if (typeof localStorage !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch {
      // fallback
    }
  }
  return memoryStorage.get(key) || null;
}

function setStorageItem(key: string, val: string): void {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, val);
    } catch {
      // fallback
    }
  }
  memoryStorage.set(key, val);
}

// Level thresholds and titles
export const LEVEL_TITLES: { minXp: number; title: string }[] = [
  { minXp: 0, title: 'Junior Scout 🌿' },
  { minXp: 200, title: 'Curious Cub 🐾' },
  { minXp: 500, title: 'Trail Blazer 🧭' },
  { minXp: 900, title: 'Brave Adventurer ⚔️' },
  { minXp: 1400, title: 'Star Navigator 🚀' },
  { minXp: 2000, title: 'Puzzle Knight 🛡️' },
  { minXp: 2800, title: 'Riddle Master 📜' },
  { minXp: 3800, title: 'Brain Champion 🧠' },
  { minXp: 5000, title: 'Logic Wizard 🔮' },
  { minXp: 6500, title: 'Grand Legend 👑' },
];

/**
 * Calculates level, current level title, and progress percentage towards next level
 */
export function calculateLevel(xp: number): {
  level: number;
  levelTitle: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
} {
  let level = 1;
  let levelTitle = LEVEL_TITLES[0].title;
  let currentLevelXp = 0;
  let nextLevelXp = LEVEL_TITLES[1].minXp;

  for (let i = 0; i < LEVEL_TITLES.length; i++) {
    if (xp >= LEVEL_TITLES[i].minXp) {
      level = i + 1;
      levelTitle = LEVEL_TITLES[i].title;
      currentLevelXp = LEVEL_TITLES[i].minXp;
      nextLevelXp = i < LEVEL_TITLES.length - 1 ? LEVEL_TITLES[i + 1].minXp : currentLevelXp + 2000;
    } else {
      break;
    }
  }

  const range = nextLevelXp - currentLevelXp;
  const progress = Math.min(100, Math.max(0, Math.round(((xp - currentLevelXp) / range) * 100)));

  return {
    level,
    levelTitle,
    currentLevelXp,
    nextLevelXp,
    progressPercent: progress,
  };
}

/**
 * Evaluates stars (1, 2, or 3) earned for a given activity based on elapsed seconds and age group
 */
export function calculateStars(
  activityType: ActivityType,
  ageGroup: AgeGroup = '4-6',
  seconds: number
): 1 | 2 | 3 {
  // Target seconds for 3 stars and 2 stars
  let threeStarMax = 90;
  let twoStarMax = 180;

  if (ageGroup === '4-6') {
    switch (activityType) {
      case 'sudoku': // 4x4
        threeStarMax = 90;
        twoStarMax = 180;
        break;
      case 'maze': // 9x9
        threeStarMax = 60;
        twoStarMax = 120;
        break;
      case 'wordsearch': // 5 words
        threeStarMax = 90;
        twoStarMax = 180;
        break;
      case 'dottodot':
        threeStarMax = 60;
        twoStarMax = 120;
        break;
      case 'coloring':
        threeStarMax = 45;
        twoStarMax = 90;
        break;
    }
  } else if (ageGroup === '7-9') {
    switch (activityType) {
      case 'sudoku': // 6x6
        threeStarMax = 120;
        twoStarMax = 240;
        break;
      case 'maze': // 17x17
        threeStarMax = 90;
        twoStarMax = 180;
        break;
      case 'wordsearch': // 8 words + diagonals
        threeStarMax = 120;
        twoStarMax = 240;
        break;
      case 'dottodot':
        threeStarMax = 75;
        twoStarMax = 150;
        break;
      case 'coloring':
        threeStarMax = 60;
        twoStarMax = 120;
        break;
    }
  } else {
    // 10+
    switch (activityType) {
      case 'sudoku': // 9x9
        threeStarMax = 180;
        twoStarMax = 360;
        break;
      case 'maze': // 27x27
        threeStarMax = 120;
        twoStarMax = 240;
        break;
      case 'wordsearch': // 12 words 8-way
        threeStarMax = 150;
        twoStarMax = 300;
        break;
      case 'dottodot':
        threeStarMax = 90;
        twoStarMax = 180;
        break;
      case 'coloring':
        threeStarMax = 60;
        twoStarMax = 120;
        break;
    }
  }

  if (seconds <= threeStarMax) return 3;
  if (seconds <= twoStarMax) return 2;
  return 1;
}

/**
 * Returns a human-friendly formatted time string (e.g., "01:24")
 */
export function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Creates a default explorer profile:
 * Index 0 = Maan (10 Years Old, 10+)
 * Index 1 = Toshi (6 Years Old, 4-6)
 */
export function createDefaultProfile(childIdx?: number): ExplorerProfile {
  const targetIdx = childIdx !== undefined ? childIdx : getActiveChildIndex();

  if (targetIdx === 1) {
    return {
      name: 'Toshi',
      avatar: '🦁',
      ageGroup: '4-6',
      ageYears: 6,
      totalXp: 0,
      level: 1,
      levelTitle: 'Junior Explorer 🌿',
      totalPuzzlesSolved: 0,
      totalStarsEarned: 0,
      totalSecondsPlayed: 0,
      cleanSolvesCount: 0,
      puzzleRecords: {},
      completedGames: {},
      lastPlayedBookId: 'book-animals-4-6-starter',
      lastPlayedChallengeNum: 1,
    };
  }

  return {
    name: 'Maan',
    avatar: '🚀',
    ageGroup: '10+',
    ageYears: 10,
    totalXp: 0,
    level: 1,
    levelTitle: 'Brain Champion 🧠',
    totalPuzzlesSolved: 0,
    totalStarsEarned: 0,
    totalSecondsPlayed: 0,
    cleanSolvesCount: 0,
    puzzleRecords: {},
    completedGames: {},
    lastPlayedBookId: 'book-space-10-starter',
    lastPlayedChallengeNum: 1,
  };
}

/**
 * Checks whether an active explorer profile with a non-empty name exists in storage
 */
export function hasSavedExplorerProfile(): boolean {
  const activeKey = getCurrentStorageKey();
  const raw = getStorageItem(activeKey);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    return Boolean(parsed.name && parsed.name.trim().length > 0 && parsed.avatar);
  } catch {
    return false;
  }
}

/**
 * Completely resets and clears explorer profile data from localStorage and memory for a fresh start
 */
export function clearExplorerProfile(): ExplorerProfile {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`${STORAGE_KEY}_sibling`);
      localStorage.removeItem('kunta_kids_profile_v1');
      localStorage.removeItem('kunta_kids_explorer_name');
      localStorage.removeItem('kunta_kids_explorer_avatar');
    } catch {
      // fallback
    }
  }
  memoryStorage.clear();
  return {
    ...createDefaultProfile(getActiveChildIndex()),
    name: '',
    puzzleRecords: {},
    completedGames: {},
  };
}

const ACTIVE_CHILD_KEY = 'totlogix_active_child_index_v1';

export function getActiveChildIndex(): number {
  const val = getStorageItem(ACTIVE_CHILD_KEY);
  return val === '1' ? 1 : 0;
}

export function setActiveChildIndex(index: number): ExplorerProfile {
  const normalized = index === 1 ? '1' : '0';
  setStorageItem(ACTIVE_CHILD_KEY, normalized);
  return loadExplorerProfile();
}

function getCurrentStorageKey(): string {
  return getActiveChildIndex() === 1 ? `${STORAGE_KEY}_sibling` : STORAGE_KEY;
}

/**
 * Loads the active Explorer profile from storage with fallback
 */
export function loadExplorerProfile(): ExplorerProfile {
  const activeIdx = getActiveChildIndex();
  try {
    const activeKey = getCurrentStorageKey();
    const raw = getStorageItem(activeKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const defaultProfile = createDefaultProfile(activeIdx);
        return {
          ...defaultProfile,
          ...parsed,
          name: parsed.name || defaultProfile.name,
          ageGroup: parsed.ageGroup || defaultProfile.ageGroup,
          ageYears: parsed.ageYears || defaultProfile.ageYears,
          puzzleRecords: parsed.puzzleRecords || {},
          completedGames: parsed.completedGames || {},
          lastPlayedBookId: parsed.lastPlayedBookId || defaultProfile.lastPlayedBookId,
          lastPlayedChallengeNum: parsed.lastPlayedChallengeNum || defaultProfile.lastPlayedChallengeNum,
          lastPlayedAt: parsed.lastPlayedAt,
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse explorer profile from storage:', err);
  }

  return createDefaultProfile(activeIdx);
}

/**
 * Saves the last played book and challenge for the active child
 */
export function saveLastPlayedProgress(bookId: string, challengeNum: number): void {
  const profile = loadExplorerProfile();
  profile.lastPlayedBookId = bookId;
  profile.lastPlayedChallengeNum = challengeNum;
  profile.lastPlayedAt = new Date().toISOString();
  saveExplorerProfile(profile);
}

/**
 * Gets the last played book and challenge for a given child index (0 = Maan, 1 = Toshi)
 */
export function getLastPlayedProgress(childIdx?: number): {
  bookId: string;
  challengeNum: number;
} | null {
  const targetIdx = childIdx !== undefined ? childIdx : getActiveChildIndex();
  const rawKey = targetIdx === 1 ? `${STORAGE_KEY}_sibling` : STORAGE_KEY;
  const raw = getStorageItem(rawKey);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed.lastPlayedBookId) {
        return {
          bookId: parsed.lastPlayedBookId,
          challengeNum: parsed.lastPlayedChallengeNum || 1,
        };
      }
    } catch {
      // fallback
    }
  }
  const defaultProf = createDefaultProfile(targetIdx);
  if (defaultProf.lastPlayedBookId) {
    return {
      bookId: defaultProf.lastPlayedBookId,
      challengeNum: defaultProf.lastPlayedChallengeNum || 1,
    };
  }
  return null;
}

/**
 * Persists the profile to storage
 */
export function saveExplorerProfile(profile: ExplorerProfile): void {
  try {
    const activeKey = getCurrentStorageKey();
    if (getActiveChildIndex() === 0) {
      setStorageItem('kunta_kids_explorer_name', profile.name);
      setStorageItem('kunta_kids_explorer_avatar', profile.avatar);
    }
    setStorageItem(activeKey, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save explorer profile:', err);
  }
}

/**
 * Loads all sibling child profiles for quick switching:
 * [0] = Maan (10yo, 10+)
 * [1] = Toshi (6yo, 4-6)
 */
export function loadAllChildProfiles(): {
  profiles: [ExplorerProfile, ExplorerProfile];
  activeIndex: number;
} {
  const activeIdx = getActiveChildIndex();
  const raw0 = getStorageItem(STORAGE_KEY);
  const def0 = createDefaultProfile(0);
  const p0: ExplorerProfile = raw0
    ? { ...def0, ...JSON.parse(raw0) }
    : def0;

  const raw1 = getStorageItem(`${STORAGE_KEY}_sibling`);
  const def1 = createDefaultProfile(1);
  const p1: ExplorerProfile = raw1
    ? { ...def1, ...JSON.parse(raw1) }
    : def1;

  return {
    profiles: [p0, p1],
    activeIndex: activeIdx,
  };
}

/**
 * Calculates child's age in years and calibrated ageGroup tier from a birth date string
 */
export function calculateAgeFromBirthDate(birthDateStr: string): { ageYears: number; ageGroup: AgeGroup } | null {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  const ageYears = Math.max(0, age);
  let ageGroup: AgeGroup = '4-6';
  if (ageYears >= 10) {
    ageGroup = '10+';
  } else if (ageYears >= 7) {
    ageGroup = '7-9';
  } else {
    ageGroup = '4-6';
  }

  return { ageYears, ageGroup };
}

/**
 * Updates player name, avatar emoji, age tier, birth date, and exact age
 */
export function updateExplorerIdentity(
  name: string,
  avatar: string,
  ageGroup?: AgeGroup,
  birthDate?: string,
  ageYears?: number
): ExplorerProfile {
  const profile = loadExplorerProfile();
  profile.name = name.trim() || profile.name;
  profile.avatar = avatar || profile.avatar;
  if (ageGroup) profile.ageGroup = ageGroup;
  if (birthDate !== undefined) profile.birthDate = birthDate;
  if (ageYears !== undefined) profile.ageYears = ageYears;
  saveExplorerProfile(profile);
  return profile;
}

/**
 * Records a puzzle completion, calculates stars, XP, personal bests, and updates the profile
 */
export function recordPuzzleCompletion(
  book: BookRecord,
  challengeNumber: number,
  activityType: ActivityType,
  title: string,
  timeSeconds: number,
  conflictsCount: number = 0
): PuzzleCompletionResult {
  const profile = loadExplorerProfile();
  const puzzleKey = `${book.id}_ch_${challengeNumber}`;
  const existingRecord = profile.puzzleRecords[puzzleKey];

  const stars = calculateStars(activityType, book.ageGroup, timeSeconds);
  const isCleanSolve = conflictsCount === 0;

  let isNewBest = false;
  let previousBestSeconds: number | undefined = undefined;

  if (existingRecord) {
    previousBestSeconds = existingRecord.bestTimeSeconds;
    if (timeSeconds < existingRecord.bestTimeSeconds) {
      isNewBest = true;
      existingRecord.bestTimeSeconds = timeSeconds;
      existingRecord.stars = Math.max(existingRecord.stars, stars) as 1 | 2 | 3;
    }
    existingRecord.attemptsCount += 1;
    existingRecord.completedAt = new Date().toISOString();
    existingRecord.conflictsCount = Math.min(existingRecord.conflictsCount, conflictsCount);
  } else {
    isNewBest = true;
    profile.puzzleRecords[puzzleKey] = {
      bookId: book.id,
      challengeNumber,
      activityType,
      title,
      bestTimeSeconds: timeSeconds,
      stars,
      completedAt: new Date().toISOString(),
      attemptsCount: 1,
      conflictsCount,
    };
    profile.totalPuzzlesSolved += 1;
  }

  // Calculate XP Gained
  let xpGained = 100; // Base completion XP
  if (stars === 3) xpGained += 50; // 3-Star speed bonus
  else if (stars === 2) xpGained += 25;

  if (isCleanSolve) xpGained += 25; // Clean solve without mistakes

  const prevLevelInfo = calculateLevel(profile.totalXp);
  profile.totalXp += xpGained;
  profile.totalSecondsPlayed += timeSeconds;
  if (isCleanSolve) profile.cleanSolvesCount += 1;

  // Re-aggregate total stars earned across all unique puzzles
  let totalStars = 0;
  for (const key in profile.puzzleRecords) {
    totalStars += profile.puzzleRecords[key].stars;
  }
  profile.totalStarsEarned = totalStars;

  // Update Completed Games aggregation
  const bookChallenges = book.project.pages.length;
  let bookSolvedCount = 0;
  let bookStars = 0;
  let bookTotalTime = 0;

  for (let ch = 1; ch <= bookChallenges; ch++) {
    const rec = profile.puzzleRecords[`${book.id}_ch_${ch}`];
    if (rec) {
      bookSolvedCount++;
      bookStars += rec.stars;
      bookTotalTime += rec.bestTimeSeconds;
    }
  }

  profile.completedGames[book.id] = {
    bookId: book.id,
    bookTitle: book.title,
    bookSku: book.sku,
    ageGroup: book.ageGroup,
    theme: book.theme,
    totalPuzzles: bookChallenges,
    solvedPuzzlesCount: bookSolvedCount,
    totalStars: bookStars,
    totalTimeSeconds: bookTotalTime,
    isFullyCompleted: bookSolvedCount === bookChallenges,
    lastPlayedAt: new Date().toISOString(),
  };

  // Check Level-up
  const newLevelInfo = calculateLevel(profile.totalXp);
  const leveledUp = newLevelInfo.level > prevLevelInfo.level;
  profile.level = newLevelInfo.level;
  profile.levelTitle = newLevelInfo.levelTitle;

  saveExplorerProfile(profile);

  return {
    profile,
    isNewBest,
    previousBestSeconds,
    timeSeconds,
    starsEarned: stars,
    xpGained,
    leveledUp,
    newLevel: newLevelInfo.level,
    newLevelTitle: newLevelInfo.levelTitle,
  };
}
