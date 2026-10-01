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
  loadAllChildProfiles,
  setActiveChildIndex,
  getActiveChildIndex,
  saveLastPlayedProgress,
  getLastPlayedProgress,
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

function getResumeIndexForBook(
  book: BookRecord,
  profile: ExplorerProfile,
  savedChallengeNum?: number
): number {
  if (!book || !book.project.pages.length) return 0;
  if (savedChallengeNum) {
    const idx = book.project.pages.findIndex(
      (p, i) => (p.challengeNumber || i + 1) === savedChallengeNum
    );
    if (idx !== -1) return idx;
  }
  for (let ch = 1; ch <= book.project.pages.length; ch++) {
    if (!profile.puzzleRecords[`${book.id}_ch_${ch}`]) {
      const idx = book.project.pages.findIndex(
        (p, i) => (p.challengeNumber || i + 1) === ch
      );
      if (idx !== -1) return idx;
    }
  }
  return 0;
}

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
    setExplorerName(switched.name || (idx === 0 ? 'Maan' : 'Toshi'));
    setExplorerAvatar(switched.avatar || (idx === 0 ? '🚀' : '🦁'));
    setSelectedAgeGroup(switched.ageGroup || (idx === 0 ? '10+' : '4-6'));
    setSelectedAgeNumber(switched.ageYears || (idx === 0 ? 10 : 6));
    setBirthDate(switched.birthDate || '');
    setIsNameSet(true);

    // Immediately resume this child's last played book & challenge!
    const lastProgress = getLastPlayedProgress(idx);
    let resumeBook: BookRecord | null = null;
    if (lastProgress) {
      resumeBook = catalog.find((b) => b.id === lastProgress.bookId) || null;
    }
    if (!resumeBook) {
      const targetAge = switched.ageGroup || (idx === 0 ? '10+' : '4-6');
      resumeBook = catalog.find((b) => b.ageGroup === targetAge) || catalog[0] || null;
    }
    if (resumeBook) {
      handleOpenBook(resumeBook, lastProgress?.challengeNum);
    } else {
      setActiveBook(null);
    }
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

  // Active playing book - auto resume where they left off!
  const [activeBook, setActiveBook] = useState<BookRecord | null>(() => {
    if (initialBook) return initialBook;
    const currentIdx = getActiveChildIndex();
    const lastProgress = getLastPlayedProgress(currentIdx);
    if (lastProgress) {
      const found = catalog.find((b) => b.id === lastProgress.bookId);
      if (found) return found;
    }
    const targetAge = currentIdx === 0 ? '10+' : '4-6';
    return catalog.find((b) => b.ageGroup === targetAge) || catalog[0] || null;
  });

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(() => {
    const currentIdx = getActiveChildIndex();
    const curBook = initialBook || (() => {
      const lastProgress = getLastPlayedProgress(currentIdx);
      if (lastProgress) {
        const found = catalog.find((b) => b.id === lastProgress.bookId);
        if (found) return found;
      }
      const targetAge = currentIdx === 0 ? '10+' : '4-6';
      return catalog.find((b) => b.ageGroup === targetAge) || catalog[0] || null;
    })();

    if (!curBook) return 0;
    const lastProgress = getLastPlayedProgress(currentIdx);
    const targetCh = (lastProgress && lastProgress.bookId === curBook.id) ? lastProgress.challengeNum : undefined;
    return getResumeIndexForBook(curBook, loadExplorerProfile(), targetCh);
  });

  const [completedPuzzles, setCompletedPuzzles] = useState<Set<number>>(() => {
    const curBook = activeBook || initialBook;
    if (!curBook) return new Set();
    const solved = new Set<number>();
    for (let ch = 1; ch <= curBook.project.pages.length; ch++) {
      if (profile.puzzleRecords[`${curBook.id}_ch_${ch}`]) {
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

  // Start Adventure directly into the first game!
  const handleStartAdventure = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated = updateExplorerIdentity(
      profile.name || (activeChildIdx === 0 ? 'Maan' : 'Toshi'),
      explorerAvatar,
      profile.ageGroup || (activeChildIdx === 0 ? '10+' : '4-6'),
      profile.birthDate || undefined,
      profile.ageYears || (activeChildIdx === 0 ? 10 : 6)
    );
    setProfile(updated);
    setIsNameSet(true);
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    // Open book directly into the game
    let targetBook = activeBook;
    if (!targetBook) {
      const lastProgress = getLastPlayedProgress(activeChildIdx);
      if (lastProgress) {
        targetBook = catalog.find((b) => b.id === lastProgress.bookId) || null;
      }
      if (!targetBook) {
        const targetAge = profile.ageGroup || (activeChildIdx === 0 ? '10+' : '4-6');
        targetBook = catalog.find((b) => b.ageGroup === targetAge) || catalog[0] || null;
      }
    }
    if (targetBook) {
      handleOpenBook(targetBook);
    }
  };

  // Handle opening a book from the bookshelf with saved solved challenges
  const handleOpenBook = (book: BookRecord, targetChallengeNum?: number) => {
    setActiveBook(book);
    const solvedInBook = new Set<number>();
    for (let ch = 1; ch <= book.project.pages.length; ch++) {
      if (profile.puzzleRecords[`${book.id}_ch_${ch}`]) {
        solvedInBook.add(ch);
      }
    }
    setCompletedPuzzles(solvedInBook);

    let targetCh = targetChallengeNum;
    if (!targetCh) {
      const lastProgress = getLastPlayedProgress(activeChildIdx);
      if (lastProgress && lastProgress.bookId === book.id) {
        targetCh = lastProgress.challengeNum;
      }
    }
    const resumeIdx = getResumeIndexForBook(book, profile, targetCh);
    setCurrentPageIndex(resumeIdx);
    const actPage = book.project.pages[resumeIdx];
    const finalCh = actPage?.challengeNumber || (resumeIdx + 1);
    saveLastPlayedProgress(book.id, finalCh);
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

    let msg = `🌟 AWESOME JOB, ${profile.name.toUpperCase()}! Challenge #${challengeNum} Solved!`;
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

  // Mark solved, celebrate, record in profile, and keep them moving to the next challenge!
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

      const isAllCompleted = activeBook && next.size === activeBook.project.pages.length;

      if (isAllCompleted) {
        setTimeout(() => {
          setShowCertificate(true);
          confetti({ particleCount: 150, spread: 100, origin: { y: 0.4 } });
          const certIdx = playPages.findIndex((p) => p.type === 'certificate');
          if (certIdx !== -1) setCurrentPageIndex(certIdx);
        }, 1500);
      } else {
        // Keep them moving directly to the next challenge!
        const nextChallenge = challengeNum + 1;
        if (activeBook && nextChallenge <= activeBook.project.pages.length) {
          saveLastPlayedProgress(activeBook.id, nextChallenge);
          setTimeout(() => {
            const nextIdx = playPages.findIndex(
              (p) => p.type === 'activity' && p.challengeNumber === nextChallenge
            );
            if (nextIdx !== -1) {
              setJustSolvedChallenge(null);
              setCurrentPageIndex(nextIdx);
            }
          }, 1800);
        }
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

  // Build the book pages (Activity puzzles ONLY - no cover, belongsTo, or passport inline pages)
  interface PlayPage {
    id: string;
    type: 'activity' | 'dictionary' | 'certificate';
    title: string;
    challengeNumber?: number;
    activityPage?: ActivityPage;
  }

  const playPages: PlayPage[] = useMemo(() => {
    if (!activeBook) return [];
    const list: PlayPage[] = [];

    // Activities directly - game starts immediately!
    activeBook.project.pages.forEach((act, idx) => {
      list.push({
        id: act.id,
        type: 'activity',
        title: act.title,
        challengeNumber: act.challengeNumber || (idx + 1),
        activityPage: act,
      });
    });

    // Picture Dictionary at end of book
    list.push({ id: 'dictionary', type: 'dictionary', title: "Explorer's Picture Dictionary" });

    // Grand Certificate
    list.push({ id: 'cert', type: 'certificate', title: 'Grand Explorer Certificate' });

    return list;
  }, [activeBook]);

  const currentPage = playPages[currentPageIndex] || playPages[0];

  // Auto-persist last played challenge whenever the page changes
  useEffect(() => {
    if (activeBook && currentPage?.type === 'activity' && currentPage?.challengeNumber) {
      saveLastPlayedProgress(activeBook.id, currentPage.challengeNumber);
    }
  }, [activeBook, currentPageIndex, currentPage]);

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

  // Fast 1-tap Avatar Selector (Name, Age & Tier already calibrated for Maan & Toshi!)
  if (!isNameSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 flex flex-col items-center justify-center p-4">
        {/* Top return to player selector */}
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
              Pick your favorite explorer avatar to start the road trip adventure!
            </p>
          </div>

          {/* 18 Fun Avatars Grid */}
          <div className="grid grid-cols-6 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => setExplorerAvatar(av.emoji)}
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
