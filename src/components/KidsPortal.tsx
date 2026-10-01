import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BookRecord, ActivityPage, AgeGroup, BookTheme } from '../types/book';
import { renderStampPassportSVG, getStampBadges, StampBadge } from '../core/generators/stampPassportGenerator';
import { renderPictureDictionarySVG } from '../core/generators/pictureDictionaryGenerator';
import { InteractivePuzzleCanvas } from './InteractivePuzzleCanvas';
import { ExplorerProfileModal } from './ExplorerProfileModal';
import {
  loadExplorerProfile,
  createDefaultProfile,
  clearExplorerProfile,
  hasSavedExplorerProfile,
  updateExplorerIdentity,
  calculateAgeFromBirthDate,
  recordPuzzleCompletion,
  formatSeconds,
  ExplorerProfile,
  PuzzleCompletionResult,
} from '../core/storage/kidsProfileStorage';
import { generateFullBookProject, createDefaultConfig } from '../core/assembly/bookAssembler';
import { createBookRecordFromProject, saveBookToCatalog } from '../core/storage/bookCatalogStorage';
import { getDefaultAuthorForAge } from '../core/marketing/kdpMarketing';
import {
  loadPassState,
  isThemeUnlocked,
  canAccessChallenge,
  formatRemainingPassTime,
  PassState,
} from '../core/monetization/passStorage';
import {
  loadAllChildProfiles,
  setActiveChildIndex,
  getActiveChildIndex,
} from '../core/storage/kidsProfileStorage';
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
  Shield,
  Star,
  Award,
  BookOpen,
  X,
  Zap,
  RotateCcw,
  Calendar,
  Filter,
  Plus,
  Lock,
  Home,
  CreditCard,
  Users,
} from 'lucide-react';

interface KidsPortalProps {
  catalog: BookRecord[];
  initialBook?: BookRecord | null;
  onExitToAdmin?: () => void;
  onGoToLanding?: () => void;
  onUpdateCatalog?: (newCatalog: BookRecord[]) => void;
}

const AVATARS = [
  { id: 'lion', emoji: '🦁', name: 'Safari Scout' },
  { id: 'rocket', emoji: '🚀', name: 'Astro Cadet' },
  { id: 'dino', emoji: '🦖', name: 'Dino Tracker' },
  { id: 'unicorn', emoji: '🦄', name: 'Magic Hero' },
  { id: 'dolphin', emoji: '🐬', name: 'Ocean Diver' },
  { id: 'bear', emoji: '🐻', name: 'Forest Bear' },
];

export const KidsPortal: React.FC<KidsPortalProps> = ({
  catalog,
  initialBook,
  onExitToAdmin,
  onGoToLanding,
  onUpdateCatalog,
}) => {
  // Explorer Profile & Gamification State
  const [profile, setProfile] = useState<ExplorerProfile>(() => loadExplorerProfile());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [lastSolveResult, setLastSolveResult] = useState<PuzzleCompletionResult | null>(null);

  const [activeChildIdx, setActiveChildIdx] = useState<number>(() => getActiveChildIndex());

  const handleSwitchChild = (idx: number) => {
    const switched = setActiveChildIndex(idx);
    setActiveChildIdx(idx);
    setProfile(switched);
    setExplorerName(switched.name || '');
    setExplorerAvatar(switched.avatar || '🦁');
    setSelectedAgeGroup(switched.ageGroup || '4-6');
    setSelectedAgeNumber(switched.ageYears || null);
    setBirthDate(switched.birthDate || '');
    setIsNameSet(Boolean(switched.name && switched.name.trim().length > 0));
    setActiveBook(null);
  };

  const [explorerName, setExplorerName] = useState<string>(() => profile.name || '');
  const [explorerAvatar, setExplorerAvatar] = useState<string>(() => profile.avatar || '🦁');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup>(() => profile.ageGroup || '4-6');
  const [selectedAgeNumber, setSelectedAgeNumber] = useState<number | string | null>(() => profile.ageYears || null);
  const [birthDate, setBirthDate] = useState<string>(() => profile.birthDate || '');
  const [calculatedFromDob, setCalculatedFromDob] = useState<{ ageYears: number; ageGroup: AgeGroup } | null>(() => {
    return profile.birthDate ? calculateAgeFromBirthDate(profile.birthDate) : null;
  });

  const [isNameSet, setIsNameSet] = useState<boolean>(() => {
    return hasSavedExplorerProfile();
  });

  // Local books list synced with catalog prop
  const [booksList, setBooksList] = useState<BookRecord[]>(catalog);
  useEffect(() => {
    setBooksList(catalog);
  }, [catalog]);

  // Bookshelf Filter: 'recommended', 'all', '4-6', '7-9', '10+'
  const [bookshelfFilter, setBookshelfFilter] = useState<'recommended' | 'all' | AgeGroup>('recommended');

  // Handle selecting an age number pill
  const handleSelectAgePill = (val: number | string) => {
    setSelectedAgeNumber(val);
    const num = typeof val === 'number' ? val : 12;
    let grp: AgeGroup = '4-6';
    if (num >= 10) grp = '10+';
    else if (num >= 7) grp = '7-9';
    else grp = '4-6';
    setSelectedAgeGroup(grp);
  };

  // Handle live Date of Birth input change
  const handleBirthDateChange = (val: string) => {
    setBirthDate(val);
    const res = calculateAgeFromBirthDate(val);
    if (res) {
      setCalculatedFromDob(res);
      setSelectedAgeGroup(res.ageGroup);
      setSelectedAgeNumber(res.ageYears >= 12 ? '12+' : res.ageYears);
    } else {
      setCalculatedFromDob(null);
    }
  };

  // Reset explorer profile completely for a fresh start
  const handleResetProfile = () => {
    const ok = window.confirm(
      'Are you sure you want to reset your explorer profile and start completely fresh? All solved puzzle records, stars, and XP will be cleared.'
    );
    if (!ok) return;

    clearExplorerProfile();
    const fresh = createDefaultProfile();
    setProfile(fresh);
    setExplorerName('');
    setExplorerAvatar('🦁');
    setSelectedAgeGroup('4-6');
    setSelectedAgeNumber(null);
    setBirthDate('');
    setCalculatedFromDob(null);
    setIsNameSet(false);
    setShowProfileModal(false);
    setCompletedPuzzles(new Set());
    setActiveBook(null);
  };

  // Handle 1-click starter book generation calibrated for selected age
  const handleGenerateStarterBook = (targetAge: AgeGroup) => {
    const author = getDefaultAuthorForAge(targetAge);
    const themesList: BookTheme[] = ['animals', 'space', 'dinosaurs', 'fantasy', 'underwater', 'jungle'];
    const chosenTheme = themesList[Math.floor(Math.random() * themesList.length)];
    const themeTitles: Record<string, string> = {
      animals: 'Jungle & Safari Animal Adventures',
      space: 'Cosmic Starship & Planet Explorer',
      dinosaurs: 'Prehistoric Dinosaur Quest',
      fantasy: 'Magical Kingdom & Dragon Chronicles',
      underwater: 'Deep Sea Reef & Ocean Odyssey',
      jungle: 'Rainforest Canopy Expedition',
    };

    const newProject = generateFullBookProject({
      ...createDefaultConfig(),
      title: themeTitles[chosenTheme] || 'Super Fun Activity Book',
      subtitle: `Specially Calibrated for Ages ${targetAge} • Mazes, Word Searches & Sudoku`,
      authorName: author.fullName,
      ageGroup: targetAge,
      theme: chosenTheme,
      pageCount: 24,
      seed: Date.now(),
    });

    const record = createBookRecordFromProject(newProject, false);
    const updatedList = saveBookToCatalog(record);
    setBooksList(updatedList);
    if (onUpdateCatalog) onUpdateCatalog(updatedList);
    handleOpenBook(record);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
  };

  // Active playing book
  const [activeBook, setActiveBook] = useState<BookRecord | null>(initialBook || null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [completedPuzzles, setCompletedPuzzles] = useState<Set<number>>(() => {
    if (!initialBook) return new Set();
    const solved = new Set<number>();
    for (let ch = 1; ch <= initialBook.project.pages.length; ch++) {
      if (profile.puzzleRecords[`${initialBook.id}_ch_${ch}`]) {
        solved.add(ch);
      }
    }
    return solved;
  });
  const [showCelebration, setShowCelebration] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [justSolvedChallenge, setJustSolvedChallenge] = useState<number | null>(null);
  const [progressionMode, setProgressionMode] = useState<'free' | 'locked'>('free');
  const celebrationTimerRef = useRef<number | null>(null);

  // Play celebration audio fanfare
  const playVictorySound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.32);
      });
    } catch {
      // Audio unsupported or restricted
    }
  };

  // Login handler with Age and Date of Birth persistence
  const handleStartAdventure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!explorerName.trim()) return;
    const numYears = typeof selectedAgeNumber === 'number'
      ? selectedAgeNumber
      : (calculatedFromDob?.ageYears || (selectedAgeGroup === '4-6' ? 5 : selectedAgeGroup === '7-9' ? 8 : 11));
    const updated = updateExplorerIdentity(
      explorerName.trim(),
      explorerAvatar,
      selectedAgeGroup,
      birthDate || undefined,
      numYears
    );
    setProfile(updated);
    setIsNameSet(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  // Handle opening a book from the bookshelf with saved solved challenges
  const handleOpenBook = (book: BookRecord) => {
    setActiveBook(book);
    setCurrentPageIndex(0);
    const solvedInBook = new Set<number>();
    for (let ch = 1; ch <= book.project.pages.length; ch++) {
      if (profile.puzzleRecords[`${book.id}_ch_${ch}`]) {
        solvedInBook.add(ch);
      }
    }
    setCompletedPuzzles(solvedInBook);
  };

  const totalChallenges = activeBook ? activeBook.project.pages.length : 0;
  const stampBadges = useMemo(() => getStampBadges(totalChallenges), [totalChallenges]);

  // Calculate next unsolved challenge
  const nextUnsolvedChallenge = useMemo(() => {
    for (let i = 1; i <= totalChallenges; i++) {
      if (!completedPuzzles.has(i)) return i;
    }
    return null;
  }, [totalChallenges, completedPuzzles]);

  // Celebration handler
  const triggerPuzzleCelebration = (challengeNum: number, result?: PuzzleCompletionResult | null) => {
    playVictorySound();
    confetti({
      particleCount: 120,
      spread: 95,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'],
    });

    let msg = `🌟 AWESOME JOB, ${profile.name.toUpperCase()}! Stamp #${challengeNum} Claimed!`;
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

  // Mark solved, celebrate, record in profile, and immediately show the Adventure Passport page!
  const handleSolveChallenge = (
    challengeNum: number,
    elapsedSeconds: number = 45,
    conflictsCount: number = 0
  ) => {
    let solveResult: PuzzleCompletionResult | null = null;

    if (activeBook) {
      const actPage =
        activeBook.project.pages.find((p) => p.challengeNumber === challengeNum) ||
        activeBook.project.pages[challengeNum - 1];

      solveResult = recordPuzzleCompletion(
        activeBook,
        challengeNum,
        actPage?.type || 'maze',
        actPage?.title || `Challenge #${challengeNum}`,
        elapsedSeconds,
        conflictsCount
      );
      setProfile(solveResult.profile);
      setLastSolveResult(solveResult);
    }

    setCompletedPuzzles((prev) => {
      const next = new Set(prev);
      const isNewSolve = !next.has(challengeNum);
      if (isNewSolve) {
        next.add(challengeNum);
      }
      setJustSolvedChallenge(challengeNum);
      triggerPuzzleCelebration(challengeNum, solveResult);

      // Immediately navigate to the Adventure Passport page
      const passportIdx = playPages.findIndex((p) => p.type === 'passport');
      setCurrentPageIndex(passportIdx !== -1 ? passportIdx : 1);

      if (activeBook && next.size === activeBook.project.pages.length && isNewSolve) {
        setTimeout(() => {
          setShowCertificate(true);
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 } });
        }, 2200);
      }
      return next;
    });
  };

  // Reset challenge if user explicitly wishes to re-attempt
  const handleResetChallenge = (challengeNum: number) => {
    setCompletedPuzzles((prev) => {
      const next = new Set(prev);
      next.delete(challengeNum);
      return next;
    });
    if (justSolvedChallenge === challengeNum) {
      setJustSolvedChallenge(null);
    }
  };

  // Handle clicking on any badge directly on the interactive Passport SVG
  const handlePassportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('[data-id]');
    if (target) {
      const challengeId = parseInt(target.getAttribute('data-id') || '', 10);
      if (challengeId) {
        const targetIndex = playPages.findIndex(
          (p) => p.type === 'activity' && p.challengeNumber === challengeId
        );
        if (targetIndex !== -1) {
          setJustSolvedChallenge(null);
          setCurrentPageIndex(targetIndex);
          if (showPassportModal) setShowPassportModal(false);
        }
      }
    }
  };

  // Build the book pages
  interface PlayPage {
    id: string;
    type: 'cover' | 'belongsTo' | 'passport' | 'activity' | 'dictionary' | 'certificate';
    title: string;
    challengeNumber?: number;
    activityPage?: ActivityPage;
  }

  const playPages: PlayPage[] = useMemo(() => {
    if (!activeBook) return [];
    const list: PlayPage[] = [];

    // 0. Cover
    list.push({ id: 'cover', type: 'cover', title: activeBook.title });

    // 1. Belongs To Personalization Page
    list.push({ id: 'belongsTo', type: 'belongsTo', title: 'This Book Belongs To' });

    // 2. Stamp Passport
    list.push({ id: 'passport', type: 'passport', title: `My ${totalChallenges}-Challenge Passport` });

    // Activities
    activeBook.project.pages.forEach((act, idx) => {
      list.push({
        id: act.id,
        type: 'activity',
        title: act.title,
        challengeNumber: act.challengeNumber || (idx + 1),
        activityPage: act,
      });
    });

    // 2. Picture Dictionary & Vocabulary Guide
    list.push({ id: 'dictionary', type: 'dictionary', title: "Explorer's Picture Dictionary" });

    // 3. Final Certificate
    list.push({ id: 'cert', type: 'certificate', title: 'Grand Explorer Certificate' });

    return list;
  }, [activeBook, totalChallenges]);

  const currentPage = playPages[currentPageIndex] || playPages[0];

  // SVG Stamp Passport
  const passportSVG = useMemo(() => {
    if (!activeBook) return '';
    return renderStampPassportSVG(
      totalChallenges,
      Array.from(completedPuzzles),
      activeBook.project.config.authorName,
      activeBook.project.config.theme
    );
  }, [activeBook, totalChallenges, completedPuzzles]);

  // SVG Picture Dictionary
  const pictureDictionarySVG = useMemo(() => {
    if (!activeBook) return '';
    const words = activeBook.project.pages
      .filter((p) => p.type === 'wordsearch' && p.data?.words)
      .flatMap((p) => p.data.words as string[]);
    return renderPictureDictionarySVG({
      words: words.length > 0 ? words : ['BEE', 'FOX', 'MULE', 'SWAN', 'BULL', 'CAT', 'DOG', 'LION'],
      theme: activeBook.project.config.theme,
      authorName: activeBook.project.config.authorName,
    });
  }, [activeBook]);

  // If explorer name is not set, show the playful Login Screen
  if (!isNameSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
        {/* Top return to player selector */}
        {onGoToLanding && (
          <div className="absolute top-4 left-4">
            <button
              onClick={onGoToLanding}
              className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Choose Player</span>
            </button>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border-4 border-white/40 text-center space-y-5 max-h-[94vh] overflow-y-auto">
          <div className="space-y-1.5">
            <div className="text-4xl sm:text-5xl animate-bounce">🦁 🚀 🧩</div>
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              TotLogix Kids Hub
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Solve mazes, word searches &amp; logic puzzles, earn real stamps, and unlock your official certificate!
            </p>
          </div>

          <form onSubmit={handleStartAdventure} className="space-y-4 text-left">
            {/* Step 1: Avatar */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                1. Pick Your Explorer Avatar
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setExplorerAvatar(av.emoji)}
                    className={`text-2xl p-2 rounded-2xl border-2 transition-all cursor-pointer ${
                      explorerAvatar === av.emoji
                        ? 'border-amber-500 bg-amber-50 scale-110 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                    title={av.name}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                2. What is Your Explorer Name?
              </label>
              <input
                type="text"
                required
                maxLength={24}
                placeholder="Enter your name (e.g. Leo, Maya)..."
                value={explorerName}
                onChange={(e) => setExplorerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Step 3: Age & Date of Birth */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. How Old Are You?
                </label>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Calibrates Puzzle Size &amp; Rules
                </span>
              </div>

              {/* Quick Age Buttons: 4 to 12+ */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {[4, 5, 6, 7, 8, 9, 10, 11, '12+'].map((ageVal) => {
                  const isSelected = selectedAgeNumber === ageVal;
                  return (
                    <button
                      key={String(ageVal)}
                      type="button"
                      onClick={() => handleSelectAgePill(ageVal)}
                      className={`flex-1 min-w-[32px] py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer border-2 text-center ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs scale-105'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {ageVal}
                    </button>
                  );
                })}
              </div>

              {/* 3 Age Group Tier Cards */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAgeGroup('4-6');
                    setSelectedAgeNumber(5);
                  }}
                  className={`p-2 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedAgeGroup === '4-6'
                      ? 'border-emerald-500 bg-emerald-50 shadow-xs ring-2 ring-emerald-400/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">👶</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                      selectedAgeGroup === '4-6' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      Ages 4–6
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="text-[11px] font-black text-slate-800 leading-tight">Junior Scout</div>
                    <p className="text-[9px] text-slate-500 font-medium leading-tight mt-0.5">
                      4x4 Sudoku • 8x8 Mazes • 5 Words
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedAgeGroup('7-9');
                    setSelectedAgeNumber(8);
                  }}
                  className={`p-2 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedAgeGroup === '7-9'
                      ? 'border-blue-500 bg-blue-50 shadow-xs ring-2 ring-blue-400/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">👦</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                      selectedAgeGroup === '7-9' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      Ages 7–9
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="text-[11px] font-black text-slate-800 leading-tight">Explorer</div>
                    <p className="text-[9px] text-slate-500 font-medium leading-tight mt-0.5">
                      6x6 Sudoku • 15x15 Mazes • Diagonals
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedAgeGroup('10+');
                    setSelectedAgeNumber(11);
                  }}
                  className={`p-2 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedAgeGroup === '10+'
                      ? 'border-purple-500 bg-purple-50 shadow-xs ring-2 ring-purple-400/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">🧑</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full ${
                      selectedAgeGroup === '10+' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      Ages 10+
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="text-[11px] font-black text-slate-800 leading-tight">Master</div>
                    <p className="text-[9px] text-slate-500 font-medium leading-tight mt-0.5">
                      9x9 Sudoku • 25x25 Mazes • 14 Words
                    </p>
                  </div>
                </button>
              </div>

              {/* Optional Date of Birth Input with live auto-calculation */}
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <span>🎂 Date of Birth (Optional)</span>
                  </label>
                  <span className="text-[9px] text-slate-400 font-medium">Auto-calibrates age</span>
                </div>
                <input
                  type="date"
                  value={birthDate}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => handleBirthDateChange(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
                {birthDate && calculatedFromDob && (
                  <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    <span>🎈</span>
                    <span>
                      Awesome! You are <strong>{calculatedFromDob.ageYears} years old</strong> — calibrated for <strong>Ages {calculatedFromDob.ageGroup}</strong>!
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white font-extrabold text-base shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>Start My Adventure!</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // If a child has logged in, but has not picked a book yet: Show Bookshelf
  if (!activeBook) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* Kid Portal Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 text-left p-1.5 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer group"
              title="Click to view your Explorer Profile, Stars, and Brain Stats!"
            >
              <div className="relative">
                <span className="text-3xl block">{profile.avatar}</span>
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-black shadow-2xs">
                  Lv.{profile.level}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Explorer {profile.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">
                    {profile.levelTitle}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200">
                    🎯 Ages {profile.ageGroup || '4-6'}{profile.ageYears !== undefined ? ` (${profile.ageYears} yrs)` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                  <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {profile.totalStarsEarned} Stars
                  </span>
                  <span>•</span>
                  <span>{profile.totalPuzzlesSolved} Solved</span>
                  {profile.birthDate && (
                    <>
                      <span>•</span>
                      <span>🎂 {profile.birthDate}</span>
                    </>
                  )}
                  <span>•</span>
                  <span className="text-indigo-600 font-bold underline">View Stats 📊</span>
                </div>
              </div>
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {/* Multi-Child Sibling Switcher */}
              {/* Maan & Toshi Road Trip Sibling Switcher */}
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

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setSoundEnabled((prev) => !prev)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                title={soundEnabled ? 'Mute Sounds' : 'Turn On Sounds'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>

              {onGoToLanding && (
                <button
                  type="button"
                  onClick={onGoToLanding}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="Return to Kid Selection Screen"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Choose Player</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-900 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                <span>My Profile</span>
              </button>
            </div>
          </div>
        </header>

        {/* Bookshelf Stage */}
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 space-y-6 w-full">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-slate-900 font-heading">
              Your Interactive Activity Bookshelf 📚
            </h1>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Select any activity book below to play on your tablet or computer. Complete all challenges to win your certificate!
            </p>

            {/* Age Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBookshelfFilter('recommended')}
                className={`px-3.5 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  bookshelfFilter === 'recommended'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm scale-105'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current text-amber-200" />
                <span>⭐ Recommended for You (Ages {profile.ageGroup || '4-6'})</span>
              </button>

              <button
                type="button"
                onClick={() => setBookshelfFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
                  bookshelfFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm scale-105'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>All Books ({booksList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setBookshelfFilter('4-6')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  bookshelfFilter === '4-6'
                    ? 'bg-emerald-600 text-white shadow-sm scale-105'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                👶 Ages 4–6
              </button>

              <button
                type="button"
                onClick={() => setBookshelfFilter('7-9')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  bookshelfFilter === '7-9'
                    ? 'bg-blue-600 text-white shadow-sm scale-105'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                👦 Ages 7–9
              </button>

              <button
                type="button"
                onClick={() => setBookshelfFilter('10+')}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  bookshelfFilter === '10+'
                    ? 'bg-purple-600 text-white shadow-sm scale-105'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                🧑 Ages 10+
              </button>
            </div>
          </div>

          {/* Filtered Books Grid or Age Starter Generator */}
          {(() => {
            const filteredBooks = booksList.filter((b) => {
              if (bookshelfFilter === 'recommended') return b.ageGroup === (profile.ageGroup || '4-6');
              if (bookshelfFilter === 'all') return true;
              return b.ageGroup === bookshelfFilter;
            });

            const targetAge: AgeGroup =
              bookshelfFilter === 'recommended' || bookshelfFilter === 'all'
                ? profile.ageGroup || '4-6'
                : bookshelfFilter;

            if (filteredBooks.length === 0) {
              return (
                <div className="bg-white rounded-3xl p-10 text-center border-2 border-dashed border-slate-300 space-y-4 max-w-lg mx-auto shadow-xs">
                  <div className="text-5xl animate-pulse">🌟</div>
                  <div className="space-y-1">
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      {bookshelfFilter === 'recommended'
                        ? `No Starter Books for Ages ${profile.ageGroup || '4-6'} Yet!`
                        : `No Books in Library for Ages ${bookshelfFilter}`}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Puzzles are dynamically calibrated for target age groups. Click below to generate and launch a 100% complete, age-calibrated activity book right now!
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-center">
                    <button
                      onClick={() => handleGenerateStarterBook(targetAge)}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white font-black text-xs shadow-md transition-all transform hover:scale-105 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>⚡ Generate Adventure Book for Ages {targetAge}!</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredBooks.map((book) => {
                  const isPerfectAge = book.ageGroup === (profile.ageGroup || '4-6');
                  const solvedCount = Object.keys(profile.puzzleRecords).filter((k) =>
                    k.startsWith(`${book.id}_ch_`)
                  ).length;
                  const isMastered = solvedCount === book.puzzleCount && book.puzzleCount > 0;

                  return (
                    <div
                      key={book.id}
                      className={`bg-white rounded-3xl border-2 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between group ${
                        isPerfectAge
                          ? 'border-amber-400 ring-2 ring-amber-300/40 shadow-amber-100/50'
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="p-6 space-y-4">
                        {/* Status Badges */}
                        <div className="flex items-center justify-between gap-1 flex-wrap">
                          {isPerfectAge ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black flex items-center gap-1 shadow-2xs">
                              <Star className="w-3 h-3 fill-current" />
                              <span>Recommended for You</span>
                            </span>
                          ) : <div />}

                          {isMastered ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                              🏆 Mastered
                            </span>
                          ) : null}
                        </div>

                        {/* Cover Thumbnail */}
                        <div className="aspect-[4/3] rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-pink-500 p-4 text-white flex flex-col justify-between shadow-inner">
                          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-100">
                            {book.project.config.authorName}
                          </span>
                          <div>
                            <h3 className="text-lg font-black uppercase leading-tight line-clamp-2">
                              {book.title}
                            </h3>
                            <p className="text-[11px] text-amber-100 mt-1 line-clamp-1">
                              {book.subtitle}
                            </p>
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-bold">
                            <span className="bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                              Ages {book.ageGroup}
                            </span>
                            <span>{book.puzzleCount} Puzzles</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] text-slate-400 font-bold">
                              {book.sku}
                            </span>
                            <span className="text-[11px] font-bold text-indigo-600">
                              {solvedCount > 0
                                ? `${solvedCount} / ${book.puzzleCount} Solved`
                                : `${book.puzzleCount} Challenges`}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 font-medium">
                            Packed with mazes, word searches, dot-to-dot &amp; coloring!
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleOpenBook(book)}
                          className="w-full py-2.5 rounded-xl font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white transform hover:scale-102"
                        >
                          <Gamepad2 className="w-4 h-4" />
                          <span>{solvedCount > 0 ? 'Continue Playing!' : 'Open & Play!'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </main>

        {/* Explorer Profile & Stats Modal on Bookshelf */}
        <ExplorerProfileModal
          profile={profile}
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onUpdateProfile={(name, avatar, ageGroup, birthDate, ageYears) => {
            const updated = updateExplorerIdentity(name, avatar, ageGroup, birthDate, ageYears);
            setProfile(updated);
            setExplorerName(updated.name);
            setExplorerAvatar(updated.avatar);
            setSelectedAgeGroup(updated.ageGroup);
            setSelectedAgeNumber(updated.ageYears || null);
            setBirthDate(updated.birthDate || '');
          }}
          onResetProfile={handleResetProfile}
        />
      </div>
    );
  }

  // Active Interactive Puzzle Player Stage
  const isActivityPage = currentPage.type === 'activity';
  const currentChallengeNum = currentPage.challengeNumber;
  const isCurrentSolved = currentChallengeNum ? completedPuzzles.has(currentChallengeNum) : false;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* Kid Solver Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveBook(null)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
              title="Return to Bookshelf"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Bookshelf</span>
            </button>

            <div className="hidden sm:block">
              <h2 className="text-xs font-bold text-slate-800 truncate max-w-xs">
                {activeBook.title}
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">{activeBook.sku}</span>
            </div>
          </div>

          {/* Center: Stamp Progress */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPassportModal(true)}
              className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-2xs hover:scale-105 cursor-pointer"
              title="Click to view all stamps in your Adventure Passport!"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>
                {completedPuzzles.size} / {totalChallenges} Stamps
              </span>
              <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                View Passport
              </span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            {/* Progression Mode Switch: Free Reading vs Challenge Lock */}
            <button
              type="button"
              onClick={() => setProgressionMode((m) => (m === 'free' ? 'locked' : 'free'))}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                progressionMode === 'locked'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
              title={
                progressionMode === 'locked'
                  ? 'Challenge Lock is ON: You must solve this puzzle before unlocking the next challenge!'
                  : 'Free Reading is ON: You can flip pages freely like a Kindle e-reader.'
              }
            >
              {progressionMode === 'locked' ? (
                <>
                  <Shield className="w-3.5 h-3.5 text-amber-700" />
                  <span>🔒 Challenge Lock</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">📖 Free Reading</span>
                  <span className="sm:hidden">📖 Free</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Explorer Profile & Admin Link */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-slate-800 transition-all cursor-pointer shadow-2xs hover:scale-102"
              title="View your Explorer Profile & Stars"
            >
              <span className="text-xl leading-none">{profile.avatar}</span>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-black text-slate-900 leading-tight flex items-center gap-1">
                  <span>{profile.name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[9px] font-black">
                    Lv.{profile.level}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-amber-700 leading-tight flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                  <span>{profile.totalStarsEarned} Stars</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Enriched Gamification Celebration Banner */}
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

      {/* Main Solver Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 max-w-4xl mx-auto w-full">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden w-full flex flex-col items-center p-4 md:p-6 min-h-[580px] justify-between">
          {/* 1. Cover View */}
          {currentPage.type === 'cover' && (
            <div className="my-auto text-center space-y-4 max-w-md w-full">
              <div className="aspect-[4/3] rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-600 to-purple-600 p-6 text-white flex flex-col justify-between shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-black text-amber-300 tracking-wider">
                    {activeBook.project.config.authorName}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/90 bg-white/20 px-2 py-0.5 rounded-md">
                    Kunta Publications
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-black uppercase text-white leading-tight">
                    {activeBook.title}
                  </h1>
                  <p className="text-xs text-blue-100 mt-2">{activeBook.subtitle}</p>
                </div>
                <div className="inline-block mx-auto px-3 py-1 bg-amber-400 text-slate-900 rounded-full text-xs font-bold">
                  Explorer Edition for {explorerName || 'Young Adventurer'}
                </div>
              </div>

              <button
                onClick={() => setCurrentPageIndex(1)}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                <span>Open Book!</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 2. Interactive "This Book Belongs To" Personalization Page */}
          {currentPage.type === 'belongsTo' && (
            <div className="my-auto text-center space-y-6 max-w-lg w-full p-6 sm:p-8 bg-gradient-to-b from-amber-50/70 via-white to-sky-50/70 rounded-3xl border-4 border-dashed border-amber-200 shadow-sm">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-3xl shadow-inner mb-1">
                ✏️
              </div>
              
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-wider font-heading uppercase">
                  This Book Belongs To:
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Type your name below to personalize this activity edition!
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <input
                  type="text"
                  maxLength={32}
                  placeholder="Type your name here..."
                  value={explorerName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setExplorerName(newName);
                    if (activeBook) {
                      activeBook.project.config.childName = newName;
                    }
                  }}
                  onBlur={() => {
                    if (explorerName.trim()) {
                      const updated = updateExplorerIdentity(explorerName.trim(), explorerAvatar);
                      setProfile(updated);
                    }
                  }}
                  className="w-full text-center text-2xl sm:text-3xl font-black font-serif tracking-wide text-indigo-700 bg-transparent border-b-4 border-dashed border-indigo-400 focus:border-indigo-600 focus:outline-none pb-2 transition-all placeholder-slate-300"
                />
                <div className="text-[11px] text-slate-400 italic">
                  (Write your name above or color your signature!)
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={() => {
                    const passportIdx = playPages.findIndex((p) => p.type === 'passport');
                    setCurrentPageIndex(passportIdx !== -1 ? passportIdx : 2);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer hover:scale-102"
                >
                  <span>Continue to Passport</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 2. Stamp Passport View */}
          {currentPage.type === 'passport' && (
            <div className="w-full flex flex-col items-center space-y-3 max-w-xl">
              {/* Celebration Banner if a stamp was just completed */}
              {justSolvedChallenge && (
                <div className="w-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 p-4 rounded-2xl text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white text-emerald-600 font-black text-2xl flex items-center justify-center shadow-md border-2 border-emerald-300 shrink-0">
                      ✓
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-black uppercase tracking-wider text-amber-200">
                        Passport Updated! ★
                      </div>
                      <div className="text-sm font-extrabold text-white">
                        Challenge #{justSolvedChallenge} Stamped Below!
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {nextUnsolvedChallenge ? (
                      <button
                        onClick={() => {
                          const targetIdx = playPages.findIndex(
                            (p) => p.type === 'activity' && p.challengeNumber === nextUnsolvedChallenge
                          );
                          if (targetIdx !== -1) {
                            setJustSolvedChallenge(null);
                            setCurrentPageIndex(targetIdx);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-white text-slate-900 hover:bg-amber-100 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap hover:scale-105"
                      >
                        <span>Play Challenge #{nextUnsolvedChallenge}</span>
                        <ChevronRight className="w-4 h-4 text-emerald-600" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowCertificate(true)}
                        className="px-4 py-2 rounded-xl bg-amber-300 text-slate-900 font-black text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap hover:scale-105"
                      >
                        <span>Certificate 🏆</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Header if not just solved */}
              {!justSolvedChallenge && (
                <div className="w-full bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center justify-between gap-3">
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800">
                      {completedPuzzles.size === 0
                        ? 'Ready to begin your adventure?'
                        : `🏆 ${completedPuzzles.size} of ${totalChallenges} Badges Completed!`}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {completedPuzzles.size === totalChallenges
                        ? 'All challenges solved! Grand Champion!'
                        : `Next up: Challenge #${nextUnsolvedChallenge || 1}`}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const targetIdx = playPages.findIndex(
                        (p) => p.type === 'activity' && p.challengeNumber === (nextUnsolvedChallenge || 1)
                      );
                      if (targetIdx !== -1) {
                        setJustSolvedChallenge(null);
                        setCurrentPageIndex(targetIdx);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white font-black text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                  >
                    <span>
                      {completedPuzzles.size === 0
                        ? 'Start Challenge #1'
                        : `Play Challenge #${nextUnsolvedChallenge || 1}`}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Interactive Passport SVG - Tap any badge to jump directly to that puzzle */}
              <div
                onClick={handlePassportClick}
                className="w-full max-w-[500px] aspect-[612/792] shadow-md rounded-2xl overflow-hidden border-2 border-slate-300 bg-white cursor-pointer hover:border-amber-400 transition-colors"
                title="Tap any badge to jump to its puzzle challenge!"
                dangerouslySetInnerHTML={{ __html: passportSVG }}
              />

              <div className="w-full flex items-center justify-between text-[11px] text-slate-500 px-2">
                <span>💡 Tip: Click any badge above to jump straight to that puzzle!</span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Passport</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. Activity Puzzle Solver */}
          {currentPage.type === 'activity' && currentPage.activityPage && (
            <div className="w-full max-w-xl flex flex-col items-center space-y-3">
              <div className="w-full flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                  Challenge #{currentChallengeNum} of {totalChallenges}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 uppercase">
                  {currentPage.activityPage.type}
                </span>
              </div>

                {/* Interactive Mouse Cursor & Touch Drawing Canvas */}
                <InteractivePuzzleCanvas
                  svgContent={currentPage.activityPage.svgContent || ''}
                  solutionSvgContent={currentPage.activityPage.solutionSvgContent}
                  puzzleType={currentPage.activityPage.type}
                  puzzleData={currentPage.activityPage.data}
                  challengeNumber={currentChallengeNum}
                  ageGroup={activeBook?.ageGroup}
                  bestTimeSeconds={
                    activeBook && currentChallengeNum
                      ? profile.puzzleRecords[`${activeBook.id}_ch_${currentChallengeNum}`]?.bestTimeSeconds
                      : undefined
                  }
                  isSolved={isCurrentSolved}
                  onSolve={(elapsedSeconds, conflictsCount) =>
                    currentChallengeNum && handleSolveChallenge(currentChallengeNum, elapsedSeconds, conflictsCount)
                  }
                />

                {/* Solved Status & Optional Reset */}
                {isCurrentSolved && (
                  <div className="w-full flex items-center justify-between px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                    <span className="text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Stamp #{currentChallengeNum} is stamped in your Adventure Passport!
                    </span>
                    <button
                      type="button"
                      onClick={() => currentChallengeNum && handleResetChallenge(currentChallengeNum)}
                      className="text-[11px] text-slate-400 hover:text-red-600 underline font-medium cursor-pointer"
                      title="Clear this puzzle's solved stamp"
                    >
                      Reset Challenge
                    </button>
                  </div>
                )}
              </div>
          )}

          {/* 3.5 Picture Dictionary & Glossary */}
          {currentPage.type === 'dictionary' && (
            <div className="w-full flex flex-col items-center space-y-3 max-w-xl">
              <div
                className="w-full max-w-[500px] aspect-[612/792] shadow-md rounded-2xl overflow-hidden border-2 border-slate-300 bg-white"
                dangerouslySetInnerHTML={{ __html: pictureDictionarySVG }}
              />
              <div className="w-full flex items-center justify-between text-[11px] text-slate-500 px-2">
                <span>📚 Explorer Vocabulary Guide &amp; Glossary</span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Dictionary</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Explorer Certificate */}
          {currentPage.type === 'certificate' && (
            <div className="my-auto w-full max-w-md aspect-[8.5/11] border-4 border-double border-amber-500 rounded-3xl p-8 bg-amber-50/40 shadow-xl flex flex-col justify-between text-center">
              <div className="space-y-2">
                <div className="text-4xl">🏆 🎓 🌟</div>
                <div className="text-xs font-black uppercase tracking-widest text-amber-700">
                  Official Kunta Publications Certificate
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase">
                  Master Brain Explorer
                </h2>
                <p className="text-xs text-slate-500">This official award is proudly presented to:</p>
                <div className="text-2xl font-black text-indigo-700 underline decoration-amber-400 decoration-wavy my-2">
                  {explorerName}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                  For showing extraordinary brilliance, curiosity, and persistence in completing all {totalChallenges} puzzle challenges in {activeBook.title}!
                </p>
              </div>

              <div className="flex justify-around items-end pt-4 border-t border-amber-300 text-[10px] text-slate-500">
                <div>
                  <div className="font-bold text-slate-700">{new Date().toLocaleDateString()}</div>
                  <div>Date Awarded</div>
                </div>
                <div className="w-14 h-14 rounded-full border-2 border-amber-500 bg-amber-100/50 flex flex-col items-center justify-center font-bold text-[9px] text-amber-800 shadow-inner">
                  <span>★ SEAL ★</span>
                  <span className="text-[7px]">VERIFIED</span>
                </div>
                <div>
                  <div className="font-bold text-slate-700">Kunta Publications</div>
                  <div>Official Publisher</div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Page Navigation Controls */}
          <div className="w-full flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-600 mt-4">
            <button
              onClick={() => setCurrentPageIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentPageIndex === 0}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 hidden sm:inline">
                {currentPage.title} ({currentPageIndex + 1} of {playPages.length})
              </span>
              <button
                type="button"
                onClick={() => setShowPassportModal(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                <span>Passport ({completedPuzzles.size}/{totalChallenges})</span>
              </button>
            </div>

            {/* Next Button with Lock Control */}
            {(() => {
              const isNextLocked =
                progressionMode === 'locked' &&
                currentPage.type === 'activity' &&
                currentChallengeNum !== undefined &&
                !completedPuzzles.has(currentChallengeNum);

              if (isNextLocked) {
                return (
                  <button
                    type="button"
                    onClick={() => {
                      alert(
                        `🔒 Challenge #${currentChallengeNum} is not solved yet!\n\nSolve this challenge first to unlock the next page, or switch top bar to "📖 Free Reading" mode.`
                      );
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Solve this puzzle to unlock the next page!"
                  >
                    <span>🔒 Next</span>
                  </button>
                );
              }

              return (
                <button
                  onClick={() => setCurrentPageIndex((prev) => Math.min(playPages.length - 1, prev + 1))}
                  disabled={currentPageIndex === playPages.length - 1}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              );
            })()}
          </div>
        </div>
      </main>

      {/* 📖 FULL PASSPORT PREVIEW MODAL 📖 */}
      {showPassportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 shadow-2xl border-4 border-amber-400 relative flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{explorerAvatar}</span>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    {explorerName}'s Adventure Passport
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Official Kunta Publications Challenge Collection
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Print your passport"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPassportModal(false)}
                  className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Passport SVG View - Interactive */}
            <div
              onClick={handlePassportClick}
              className="w-full max-w-[480px] aspect-[612/792] shadow-md rounded-2xl overflow-hidden border border-slate-200 bg-white cursor-pointer hover:border-amber-400 transition-colors"
              title="Click any badge to jump directly to that puzzle!"
              dangerouslySetInnerHTML={{ __html: passportSVG }}
            />

            {/* Footer */}
            <div className="w-full flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-amber-800">
                🏆 {completedPuzzles.size} of {totalChallenges} Stamps Collected
              </span>
              <button
                type="button"
                onClick={() => setShowPassportModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs cursor-pointer shadow-sm transition-all"
              >
                Back to Solving!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explorer Profile & Stats Modal */}
      <ExplorerProfileModal
        profile={profile}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpdateProfile={(name, avatar, ageGroup, birthDate, ageYears) => {
          const updated = updateExplorerIdentity(name, avatar, ageGroup, birthDate, ageYears);
          setProfile(updated);
          setExplorerName(updated.name);
          setExplorerAvatar(updated.avatar);
          setSelectedAgeGroup(updated.ageGroup);
          setSelectedAgeNumber(updated.ageYears || null);
          setBirthDate(updated.birthDate || '');
        }}
        onResetProfile={handleResetProfile}
      />
    </div>
  );
};
