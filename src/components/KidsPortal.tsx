import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BookRecord, ActivityPage, AgeGroup, BookTheme, ActivityType } from '../types/book';
import { renderStampPassportSVG, getStampBadges } from '../core/generators/stampPassportGenerator';
import { renderPictureDictionarySVG } from '../core/generators/pictureDictionaryGenerator';
import { InteractivePuzzleCanvas } from './InteractivePuzzleCanvas';
import { ExplorerProfileModal } from './ExplorerProfileModal';
import {
  loadExplorerProfile,
  createDefaultProfile,
  clearExplorerProfile,
  hasSavedExplorerProfile,
  updateExplorerIdentity,
  recordPuzzleCompletion,
  formatSeconds,
  ExplorerProfile,
  PuzzleCompletionResult,
  setActiveChildIndex,
  getActiveChildIndex,
  saveLastPlayedProgress,
  getLastPlayedProgress,
} from '../core/storage/kidsProfileStorage';
import {
  generateSingleActivityPage,
  createDefaultConfig,
} from '../core/assembly/bookAssembler';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Trophy,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Volume2,
  VolumeX,
  Printer,
  ArrowLeft,
  Gamepad2,
  Star,
  BookOpen,
  X,
  Zap,
  RotateCcw,
  Users,
} from 'lucide-react';

export type CategoryTab = 'paths' | 'sudoku' | 'tracing' | 'wordhunt' | 'coloring';

export interface CategoryGameItem {
  id: string;
  category: CategoryTab;
  levelNumber: number;
  title: string;
  theme: BookTheme;
  themeIcon: string;
  bookId: string;
  bookTitle: string;
  challengeNumber: number;
  activityPage: ActivityPage;
  ageGroup: AgeGroup;
}

interface KidsPortalProps {
  catalog: BookRecord[];
  initialBook?: BookRecord | null;
  onExitToAdmin?: () => void;
  onGoToLanding?: () => void;
  onUpdateCatalog?: (newCatalog: BookRecord[]) => void;
}

const AVATARS = [
  { id: 'rocket', emoji: '🚀', name: 'Astro Rocket' },
  { id: 'lion', emoji: '🦁', name: 'Safari Lion' },
  { id: 'dino', emoji: '🦖', name: 'Dino Explorer' },
  { id: 'unicorn', emoji: '🦄', name: 'Magic Unicorn' },
  { id: 'dolphin', emoji: '🐬', name: 'Ocean Dolphin' },
  { id: 'bear', emoji: '🐻', name: 'Brave Bear' },
  { id: 'racecar', emoji: '🏎️', name: 'Speed Racer' },
  { id: 'tiger', emoji: '🐯', name: 'Wild Tiger' },
  { id: 'panda', emoji: '🐼', name: 'Kung-Fu Panda' },
  { id: 'fox', emoji: '🦊', name: 'Clever Fox' },
  { id: 'robot', emoji: '🤖', name: 'Cosmic Bot' },
  { id: 'zap', emoji: '⚡', name: 'Lightning Star' },
  { id: 'crown', emoji: '👑', name: 'Royal Champ' },
  { id: 'gamepad', emoji: '🎮', name: 'Game Master' },
  { id: 'soccer', emoji: '⚽', name: 'Sports Ace' },
  { id: 'monkey', emoji: '🐵', name: 'Silly Monkey' },
  { id: 'eagle', emoji: '🦅', name: 'Sky Eagle' },
  { id: 'star', emoji: '🌟', name: 'Super Star' },
];

const CATEGORY_TABS: {
  id: CategoryTab;
  label: string;
  emoji: string;
  badgeBg: string;
  accentColor: string;
  gradientBg: string;
  description: string;
}[] = [
  {
    id: 'paths',
    label: 'Paths',
    emoji: '🌀',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    accentColor: 'text-amber-600',
    gradientBg: 'from-amber-500 to-orange-500',
    description: 'Mazes & Labyrinths • Touch & D-Pad Glide controls for mobile fingers!',
  },
  {
    id: 'sudoku',
    label: 'Sudoku',
    emoji: '🔢',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    accentColor: 'text-blue-600',
    gradientBg: 'from-blue-600 to-indigo-600',
    description: 'Kid-friendly logic grids • 4x4 Mini for early learners, 9x9 for older kids!',
  },
  {
    id: 'tracing',
    label: 'Tracing',
    emoji: '✏️',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    accentColor: 'text-emerald-600',
    gradientBg: 'from-emerald-500 to-teal-600',
    description: 'Dot-to-Dot & Precision Motor Tracing Pages!',
  },
  {
    id: 'wordhunt',
    label: 'Word Hunts',
    emoji: '🔍',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    accentColor: 'text-purple-600',
    gradientBg: 'from-purple-600 to-pink-600',
    description: 'Word Search, Phonics Flashcards & Aloud Speech Audio!',
  },
  {
    id: 'coloring',
    label: 'Coloring',
    emoji: '🎨',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    accentColor: 'text-rose-600',
    gradientBg: 'from-rose-500 to-red-600',
    description: 'Creative coloring & beautiful bold line art scenes!',
  },
];

const THEME_ICONS: Record<BookTheme, string> = {
  animals: '🦁',
  space: '🚀',
  dinosaurs: '🦖',
  fantasy: '🦄',
  underwater: '🐬',
  jungle: '🐒',
};

export const KidsPortal: React.FC<KidsPortalProps> = ({
  catalog,
  initialBook,
  onExitToAdmin,
  onGoToLanding,
  onUpdateCatalog,
}) => {
  // Explorer Profile & Active Child State
  const [profile, setProfile] = useState<ExplorerProfile>(() => loadExplorerProfile());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [lastSolveResult, setLastSolveResult] = useState<PuzzleCompletionResult | null>(null);

  const [activeChildIdx, setActiveChildIdx] = useState<number>(() => getActiveChildIndex());
  const [explorerAvatar, setExplorerAvatar] = useState<string>(() => profile.avatar || '🦁');
  const [isNameSet, setIsNameSet] = useState<boolean>(() => hasSavedExplorerProfile());

  // Top Category Tabs Navigation
  const [activeCategoryTab, setActiveCategoryTab] = useState<CategoryTab>('paths');
  const [activeGameItem, setActiveGameItem] = useState<CategoryGameItem | null>(null);

  // Sound, Celebration & Passport Modals
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCelebration, setShowCelebration] = useState<string | null>(null);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const celebrationTimerRef = useRef<number | null>(null);

  // Sync books list with catalog prop
  const [booksList, setBooksList] = useState<BookRecord[]>(catalog);
  useEffect(() => {
    setBooksList(catalog);
  }, [catalog]);

  // Switch between Maan (idx 0) and Toshi (idx 1)
  const handleSwitchChild = (idx: number) => {
    const switched = setActiveChildIndex(idx);
    setActiveChildIdx(idx);
    setProfile(switched);
    setExplorerAvatar(switched.avatar || (idx === 0 ? '🚀' : '🦁'));
    setIsNameSet(true);
    setActiveGameItem(null); // Return to category grid for fresh selection
  };

  // Play celebration audio fanfare
  const playVictorySound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.09);
        osc.stop(ctx.currentTime + i * 0.09 + 0.32);
      });
    } catch {
      // Audio unsupported
    }
  };

  // Celebration handler
  const triggerPuzzleCelebration = (levelNum: number, result?: PuzzleCompletionResult | null) => {
    playVictorySound();
    confetti({
      particleCount: 120,
      spread: 95,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
    });

    let msg = `🌟 AWESOME JOB, ${profile.name.toUpperCase()}! Level #${levelNum} Solved!`;
    if (result) {
      const starText = '⭐'.repeat(result.starsEarned);
      msg = `${starText} ${formatSeconds(result.timeSeconds)} • +${result.xpGained} XP! ${
        result.isNewBest ? '🎉 NEW BEST TIME!' : ''
      }`;
    }

    setShowCelebration(msg);
    if (celebrationTimerRef.current) clearTimeout(celebrationTimerRef.current);
    celebrationTimerRef.current = window.setTimeout(() => setShowCelebration(null), 5500);
  };

  // Start Adventure directly from 1-tap Avatar Selector
  const handleStartAdventure = (chosenAvatar?: string) => {
    const avatar = chosenAvatar || explorerAvatar;
    const defaultName = activeChildIdx === 0 ? 'Maan' : 'Toshi';
    const defaultAge = activeChildIdx === 0 ? '10+' : '4-6';
    const defaultYears = activeChildIdx === 0 ? 10 : 6;

    const updated = updateExplorerIdentity(
      profile.name || defaultName,
      avatar,
      profile.ageGroup || defaultAge,
      profile.birthDate || undefined,
      profile.ageYears || defaultYears
    );
    setProfile(updated);
    setExplorerAvatar(avatar);
    setIsNameSet(true);
    confetti({ particleCount: 70, spread: 75, origin: { y: 0.6 } });
  };

  // Reset Explorer Profile completely
  const handleResetProfile = () => {
    const ok = window.confirm(
      'Are you sure you want to reset your explorer profile and start fresh? All solved puzzle records and stars will be cleared.'
    );
    if (!ok) return;

    clearExplorerProfile();
    const fresh = createDefaultProfile(activeChildIdx);
    setProfile(fresh);
    setExplorerAvatar(fresh.avatar);
    setIsNameSet(false);
    setShowProfileModal(false);
    setActiveGameItem(null);
  };

  // Build the Category Games Catalog for the Active Child
  const categoryGames = useMemo(() => {
    const targetAge: AgeGroup = profile.ageGroup || (activeChildIdx === 0 ? '10+' : '4-6');
    let childBooks = booksList.filter((b) => b.ageGroup === targetAge);
    if (childBooks.length === 0) {
      childBooks = booksList;
    }

    const items: Record<CategoryTab, CategoryGameItem[]> = {
      paths: [],
      sudoku: [],
      tracing: [],
      wordhunt: [],
      coloring: [],
    };

    // Index all activities from existing books in the catalog
    childBooks.forEach((book) => {
      book.project.pages.forEach((page, pIdx) => {
        let cat: CategoryTab | null = null;
        if (page.type === 'maze') cat = 'paths';
        else if (page.type === 'sudoku') cat = 'sudoku';
        else if (page.type === 'dottodot') cat = 'tracing';
        else if (page.type === 'wordsearch') cat = 'wordhunt';
        else if (page.type === 'coloring') cat = 'coloring';

        if (cat) {
          items[cat].push({
            id: `${book.id}_ch_${page.challengeNumber || pIdx + 1}`,
            category: cat,
            levelNumber: items[cat].length + 1,
            title: page.title,
            theme: book.theme,
            themeIcon: THEME_ICONS[book.theme] || '⭐',
            bookId: book.id,
            bookTitle: book.title,
            challengeNumber: page.challengeNumber || pIdx + 1,
            activityPage: page,
            ageGroup: book.ageGroup,
          });
        }
      });
    });

    // Guarantee at least 12 exciting levels per category by generating extra on-demand
    const catTypes: Record<CategoryTab, ActivityType> = {
      paths: 'maze',
      sudoku: 'sudoku',
      tracing: 'dottodot',
      wordhunt: 'wordsearch',
      coloring: 'coloring',
    };
    const themesList: BookTheme[] = ['animals', 'space', 'dinosaurs', 'fantasy', 'underwater', 'jungle'];

    (['paths', 'sudoku', 'tracing', 'wordhunt', 'coloring'] as CategoryTab[]).forEach((cat) => {
      let genIdx = items[cat].length;
      while (items[cat].length < 12) {
        genIdx++;
        const theme = themesList[genIdx % themesList.length];
        const extraPage = generateSingleActivityPage(
          catTypes[cat],
          genIdx,
          {
            ...createDefaultConfig(),
            ageGroup: targetAge,
            theme,
            seed: 700000 + genIdx * 1337 + (activeChildIdx === 0 ? 1000 : 2000),
          },
          [],
          genIdx
        );
        items[cat].push({
          id: `roadtrip_${targetAge}_${cat}_lvl_${genIdx}`,
          category: cat,
          levelNumber: items[cat].length + 1,
          title: extraPage.title,
          theme,
          themeIcon: THEME_ICONS[theme] || '⭐',
          bookId: childBooks[0]?.id || `book-${targetAge}`,
          bookTitle: childBooks[0]?.title || `Road Trip Adventure`,
          challengeNumber: 100 + genIdx,
          activityPage: extraPage,
          ageGroup: targetAge,
        });
      }
    });

    return items;
  }, [booksList, profile.ageGroup, activeChildIdx]);

  // Handle Solving a Game within its Category
  const handleSolveCategoryGame = (
    game: CategoryGameItem,
    elapsedSeconds: number = 45,
    conflictsCount: number = 0
  ) => {
    const book = booksList.find((b) => b.id === game.bookId) || booksList[0];
    if (!book) return;

    const solveResult = recordPuzzleCompletion(
      book,
      game.challengeNumber,
      game.activityPage.type,
      game.title,
      elapsedSeconds,
      conflictsCount
    );
    setProfile(solveResult.profile);
    setLastSolveResult(solveResult);

    saveLastPlayedProgress(game.bookId, game.challengeNumber);
    triggerPuzzleCelebration(game.levelNumber, solveResult);

    // Auto-advance to the next game in this category!
    const currentCategoryList = categoryGames[game.category];
    const nextGame = currentCategoryList.find((g) => g.levelNumber === game.levelNumber + 1);

    if (nextGame) {
      setTimeout(() => {
        setActiveGameItem(nextGame);
        saveLastPlayedProgress(nextGame.bookId, nextGame.challengeNumber);
      }, 1800);
    }
  };

  // Re-attempt / Reset a Challenge
  const handleResetGameRecord = (game: CategoryGameItem) => {
    const puzzleKey = `${game.bookId}_ch_${game.challengeNumber}`;
    const nextProf = { ...profile };
    delete nextProf.puzzleRecords[puzzleKey];
    setProfile(nextProf);
  };

  // SVG Stamp Passport
  const totalCategoryChallenges = useMemo(() => {
    return Object.values(categoryGames).reduce((acc, list) => acc + list.length, 0);
  }, [categoryGames]);

  const solvedChallengeNumbers = useMemo(() => {
    const solvedNums: number[] = [];
    Object.values(categoryGames).forEach((list) => {
      list.forEach((g) => {
        if (profile.puzzleRecords[`${g.bookId}_ch_${g.challengeNumber}`]) {
          solvedNums.push(g.challengeNumber);
        }
      });
    });
    return solvedNums;
  }, [categoryGames, profile.puzzleRecords]);

  const passportSVG = useMemo(() => {
    return renderStampPassportSVG(
      Math.min(32, totalCategoryChallenges),
      solvedChallengeNumbers.slice(0, 32),
      `${profile.name}'s Road Trip`,
      activeChildIdx === 0 ? 'space' : 'animals'
    );
  }, [totalCategoryChallenges, solvedChallengeNumbers, profile.name, activeChildIdx]);

  // View 1: Fast 1-Tap Avatar Selector (If name/avatar not confirmed yet)
  if (!isNameSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 flex flex-col items-center justify-center p-4 select-none">
        {onGoToLanding && (
          <div className="absolute top-4 left-4">
            <button
              onClick={onGoToLanding}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Choose Player</span>
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-amber-400 text-center space-y-6">
          <div className="space-y-2">
            <div className="text-6xl animate-bounce">{explorerAvatar}</div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              Ready, {profile.name}! 🚗
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Pick your favorite explorer avatar to start your road trip adventure!
            </p>
          </div>

          {/* 18 Fun Avatars Grid */}
          <div className="grid grid-cols-6 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => {
                  setExplorerAvatar(av.emoji);
                  handleStartAdventure(av.emoji);
                }}
                className={`text-2xl sm:text-3xl p-2 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${
                  explorerAvatar === av.emoji
                    ? 'border-amber-500 bg-amber-100 scale-110 shadow-md ring-2 ring-amber-400'
                    : 'border-slate-200 hover:bg-white hover:scale-105'
                }`}
                title={av.name}
              >
                <span>{av.emoji}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => handleStartAdventure()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500 hover:from-amber-300 hover:to-emerald-400 text-slate-950 font-black text-base shadow-xl transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-slate-950" />
            <span>Start Adventure! 🚀</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Category Info
  const activeCategoryTabInfo =
    CATEGORY_TABS.find((t) => t.id === activeCategoryTab) || CATEGORY_TABS[0];
  const activeTabGames = categoryGames[activeCategoryTab] || [];
  const solvedCountInActiveTab = activeTabGames.filter((g) =>
    Boolean(profile.puzzleRecords[`${g.bookId}_ch_${g.challengeNumber}`])
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* 1. Kid Top Bar Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs px-3 sm:px-4 py-2">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Child Profile Badge */}
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer group text-left"
            title="View Profile & Brain Stats"
          >
            <div className="relative">
              <span className="text-2xl sm:text-3xl block">{profile.avatar}</span>
              <span className="absolute -bottom-1 -right-1 px-1 py-0.2 rounded-full bg-amber-500 text-white text-[8px] font-black">
                Lv.{profile.level}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {profile.name}
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 text-[9px] font-black hidden sm:inline">
                  Ages {profile.ageGroup || '4-6'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-700 font-bold">
                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                <span>{profile.totalStarsEarned} Stars</span>
                <span>•</span>
                <span>{profile.totalPuzzlesSolved} Solved</span>
              </div>
            </div>
          </button>

          {/* Center: Maan & Toshi Sibling Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => handleSwitchChild(0)}
              className={`px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeChildIdx === 0
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm scale-102'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Play as Maan (10 Years Old • Ages 10+)"
            >
              <span>🚀 Maan (10y)</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchChild(1)}
              className={`px-3 py-1.5 rounded-xl font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeChildIdx === 1
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm scale-102'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Play as Toshi (6 Years Old • Ages 4-6)"
            >
              <span>🦁 Toshi (6y)</span>
            </button>
          </div>

          {/* Right Controls: Passport, Audio & Player Chooser */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowPassportModal(true)}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs hover:scale-105"
              title="Adventure Passport"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden md:inline">Passport</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled((prev) => !prev)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title={soundEnabled ? 'Mute' : 'Turn on audio'}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {onGoToLanding && (
              <button
                type="button"
                onClick={onGoToLanding}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer hidden sm:flex items-center gap-1"
                title="Return to Player Chooser"
              >
                <Users className="w-3.5 h-3.5 text-indigo-600" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Top Category Tabs Bar: Paths, Sudoku, Tracing, Word Hunts, Coloring */}
      <nav className="bg-white border-b border-slate-200 sticky top-12 sm:top-13 z-20 shadow-xs px-2 sm:px-4 py-2">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = activeCategoryTab === tab.id;
            const games = categoryGames[tab.id];
            const solvedInTab = games.filter((g) =>
              Boolean(profile.puzzleRecords[`${g.bookId}_ch_${g.challengeNumber}`])
            ).length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveCategoryTab(tab.id);
                  setActiveGameItem(null); // Return to level grid for that category
                }}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-2xl font-black text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer select-none ${
                  isSelected
                    ? `bg-gradient-to-r ${tab.gradientBg} text-white shadow-md scale-102 ring-2 ring-offset-1 ring-slate-400/20`
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span className="text-base sm:text-lg">{tab.emoji}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {solvedInTab}/{games.length}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Celebration Banner */}
      {showCelebration && (
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 text-white text-xs sm:text-sm font-black py-2.5 px-4 text-center shadow-md animate-in slide-in-from-top duration-300 flex flex-wrap items-center justify-center gap-2">
          <span>{showCelebration}</span>
          {lastSolveResult?.isNewBest && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-300 text-slate-900 text-[10px] font-black uppercase tracking-wider animate-pulse">
              ⚡ NEW PERSONAL RECORD!
            </span>
          )}
          {lastSolveResult?.leveledUp && (
            <span className="px-2 py-0.5 rounded-full bg-white text-indigo-700 text-[10px] font-black uppercase tracking-wider animate-bounce">
              🏆 LEVEL UP! {lastSolveResult.newLevelTitle}
            </span>
          )}
        </div>
      )}

      {/* 3. Main Stage: Either Category Game Grid OR Active Game Player */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-6 w-full flex flex-col items-center">
        {/* State A: Playing a Specific Game Level */}
        {activeGameItem ? (
          <div className="w-full flex flex-col items-center space-y-4">
            {/* Top Sub-Bar: Return to Category + Level Navigation */}
            <div className="w-full bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-3 shadow-xs flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setActiveGameItem(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title={`Back to ${activeCategoryTabInfo.label} Levels`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to {activeCategoryTabInfo.label}</span>
              </button>

              <div className="flex items-center gap-2 text-center">
                <span className="text-base sm:text-lg">{activeCategoryTabInfo.emoji}</span>
                <span className="text-xs sm:text-sm font-black text-slate-900 truncate">
                  Level {activeGameItem.levelNumber} • {activeGameItem.title}
                </span>
              </div>

              {/* Prev / Next Level Switchers */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={activeGameItem.levelNumber <= 1}
                  onClick={() => {
                    const prevGame = activeTabGames.find(
                      (g) => g.levelNumber === activeGameItem.levelNumber - 1
                    );
                    if (prevGame) setActiveGameItem(prevGame);
                  }}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  title="Previous Level"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-bold text-slate-500 px-1">
                  {activeGameItem.levelNumber}/{activeTabGames.length}
                </span>
                <button
                  type="button"
                  disabled={activeGameItem.levelNumber >= activeTabGames.length}
                  onClick={() => {
                    const nextGame = activeTabGames.find(
                      (g) => g.levelNumber === activeGameItem.levelNumber + 1
                    );
                    if (nextGame) setActiveGameItem(nextGame);
                  }}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  title="Next Level"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Interactive Puzzle Canvas with Mobile Touch/D-Pad Accommodation */}
            <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-4 sm:p-6 flex flex-col items-center">
              {(() => {
                const puzzleKey = `${activeGameItem.bookId}_ch_${activeGameItem.challengeNumber}`;
                const solvedRecord = profile.puzzleRecords[puzzleKey];
                const isCurrentSolved = Boolean(solvedRecord);

                return (
                  <div className="w-full max-w-xl flex flex-col items-center space-y-3">
                    <InteractivePuzzleCanvas
                      svgContent={activeGameItem.activityPage.svgContent || ''}
                      solutionSvgContent={activeGameItem.activityPage.solutionSvgContent}
                      puzzleType={activeGameItem.activityPage.type}
                      puzzleData={activeGameItem.activityPage.data}
                      challengeNumber={activeGameItem.challengeNumber}
                      ageGroup={activeGameItem.ageGroup}
                      avatarEmoji={profile.avatar}
                      bestTimeSeconds={solvedRecord?.bestTimeSeconds}
                      isSolved={isCurrentSolved}
                      onSolve={(elapsedSeconds, conflictsCount) =>
                        handleSolveCategoryGame(activeGameItem, elapsedSeconds, conflictsCount)
                      }
                    />

                    {/* Solved Status & Replay */}
                    {isCurrentSolved && (
                      <div className="w-full flex items-center justify-between px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                        <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>
                            Level {activeGameItem.levelNumber} Completed! Best:{' '}
                            {formatSeconds(solvedRecord.bestTimeSeconds)} (
                            {'⭐'.repeat(solvedRecord.stars)})
                          </span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleResetGameRecord(activeGameItem)}
                          className="text-[11px] text-slate-400 hover:text-red-600 underline font-medium cursor-pointer"
                        >
                          Re-attempt
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        ) : (
          /* State B: Category Level Grid */
          <div className="w-full space-y-6">
            {/* Category Header Banner */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="text-4xl sm:text-5xl p-2 bg-slate-50 rounded-2xl border border-slate-200">
                  {activeCategoryTabInfo.emoji}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                    {activeCategoryTabInfo.label} Adventures
                  </h1>
                  <p className="text-xs text-slate-600 font-medium max-w-md">
                    {activeCategoryTabInfo.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                    <span className="text-xs font-bold text-amber-700">
                      🏆 {solvedCountInActiveTab} of {activeTabGames.length} Levels Solved
                    </span>
                    <span>•</span>
                    <span className="text-xs font-bold text-indigo-700">
                      Calibrated for {profile.name} (Ages {profile.ageGroup || '4-6'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Resume Button */}
              {(() => {
                const nextUnsolved =
                  activeTabGames.find(
                    (g) => !profile.puzzleRecords[`${g.bookId}_ch_${g.challengeNumber}`]
                  ) || activeTabGames[0];

                if (!nextUnsolved) return null;

                return (
                  <button
                    type="button"
                    onClick={() => setActiveGameItem(nextUnsolved)}
                    className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500 hover:from-amber-300 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>Play Level {nextUnsolved.levelNumber}! 🚀</span>
                  </button>
                );
              })()}
            </div>

            {/* Game Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activeTabGames.map((game) => {
                const record = profile.puzzleRecords[`${game.bookId}_ch_${game.challengeNumber}`];
                const isSolved = Boolean(record);
                const stars = record?.stars || 0;

                return (
                  <div
                    key={game.id}
                    className={`bg-white rounded-3xl border-2 p-5 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group transform hover:-translate-y-1 ${
                      isSolved
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-amber-400'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-black text-[10px]">
                          Level {game.levelNumber}
                        </span>
                        {isSolved ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Solved</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            Ready
                          </span>
                        )}
                      </div>

                      {/* Theme Icon & Title */}
                      <div className="flex items-start gap-3">
                        <div className="text-3xl p-2 bg-slate-50 rounded-2xl border border-slate-100 group-hover:scale-110 transition-transform">
                          {game.themeIcon}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {game.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 font-medium capitalize mt-0.5">
                            {game.theme} Theme • Ages {game.ageGroup}
                          </p>
                        </div>
                      </div>

                      {/* Stars & Best Time */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                isSolved && i < stars
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        {isSolved && record?.bestTimeSeconds ? (
                          <span className="text-[10px] font-bold text-slate-500">
                            ⏱️ {formatSeconds(record.bestTimeSeconds)}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">3 Stars Target</span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => setActiveGameItem(game)}
                        className={`w-full py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs ${
                          isSolved
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white hover:scale-102'
                        }`}
                      >
                        <Gamepad2 className="w-3.5 h-3.5" />
                        <span>{isSolved ? 'Replay Level' : 'Play Level!'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 4. Full Passport Preview Modal */}
      {showPassportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 shadow-2xl border-4 border-amber-400 relative flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{profile.avatar}</span>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    {profile.name}'s Adventure Passport
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Official Road Trip Challenge Stamps &amp; Badges
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassportModal(false)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className="w-full max-w-[480px] aspect-[612/792] shadow-md rounded-2xl overflow-hidden border border-slate-200 bg-white"
              dangerouslySetInnerHTML={{ __html: passportSVG }}
            />

            <div className="w-full flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-amber-800">
                🏆 {profile.totalPuzzlesSolved} Challenges Completed
              </span>
              <button
                type="button"
                onClick={() => setShowPassportModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs cursor-pointer shadow-sm"
              >
                Back to Adventures!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Explorer Profile & Stats Modal */}
      <ExplorerProfileModal
        profile={profile}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpdateProfile={(name, avatar, ageGroup, birthDate, ageYears) => {
          const updated = updateExplorerIdentity(name, avatar, ageGroup, birthDate, ageYears);
          setProfile(updated);
          setExplorerAvatar(updated.avatar);
        }}
        onResetProfile={handleResetProfile}
      />
    </div>
  );
};
