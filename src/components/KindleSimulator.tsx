import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BookProject, ActivityPage } from '../types/book';
import { renderStampPassportSVG, getStampBadges } from '../core/generators/stampPassportGenerator';
import { InteractivePuzzleCanvas } from './InteractivePuzzleCanvas';
import confetti from 'canvas-confetti';
import {
  ChevronLeft,
  ChevronRight,
  Tablet,
  CheckCircle2,
  Sparkles,
  Trophy,
  RotateCcw,
  BookOpen,
  Award,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { loadExplorerProfile } from '../core/storage/kidsProfileStorage';
import { KUNTA_LOGO_PNG_PATH } from '../core/assets/publisherLogo';

interface KindleSimulatorProps {
  project: BookProject;
  onExitPreview?: () => void;
  onUpdateChildName?: (name: string) => void;
}

type DeviceMode = 'fire-tablet' | 'paperwhite';

export const KindleSimulator: React.FC<KindleSimulatorProps> = ({
  project,
  onExitPreview,
  onUpdateChildName,
}) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('fire-tablet');
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState<Set<number>>(new Set());
  const [showCelebration, setShowCelebration] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showStampDrawer, setShowStampDrawer] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const celebrationTimeoutRef = useRef<number | null>(null);

  // Personalized child's name for "This Book Belongs To" page
  const [childName, setChildName] = useState<string>(project.config.childName || '');

  const savedExplorerName = useMemo(() => {
    try {
      const prof = loadExplorerProfile();
      return prof.name || '';
    } catch {
      return '';
    }
  }, []);

  useEffect(() => {
    if (project.config.childName !== undefined) {
      setChildName(project.config.childName);
    }
  }, [project.config.childName]);

  const handleNameChange = (val: string) => {
    setChildName(val);
    onUpdateChildName?.(val);
  };

  const totalChallenges = project.pages.length;
  const stampBadges = useMemo(() => getStampBadges(totalChallenges), [totalChallenges]);

  // Play synthetic Web Audio victory fanfare
  const playVictorySound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
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
      // Audio not supported or blocked
    }
  };

  // Trigger Confetti Celebration
  const triggerCelebration = (challengeNum: number, badgeLabel: string) => {
    playVictorySound();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'],
    });

    setShowCelebration(`🎉 CHALLENGE #${challengeNum} SOLVED! Unlocked: "${badgeLabel}" Stamp!`);

    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
    }
    celebrationTimeoutRef.current = window.setTimeout(() => {
      setShowCelebration(null);
    }, 3800);
  };

  // Toggle Challenge Completion
  const toggleChallenge = (challengeNum: number) => {
    setCompletedChallenges((prev) => {
      const next = new Set(prev);
      if (next.has(challengeNum)) {
        next.delete(challengeNum);
      } else {
        next.add(challengeNum);
        const badge = stampBadges[challengeNum - 1];
        triggerCelebration(challengeNum, badge ? badge.label : 'Super Star');

        // Check if all completed!
        if (next.size === totalChallenges) {
          setTimeout(() => {
            setShowCertificateModal(true);
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.4 },
            });
          }, 800);
        }
      }
      return next;
    });
  };

  // Build the complete array of Kindle Reader Virtual Pages
  interface VirtualPage {
    id: string;
    type: 'cover' | 'title' | 'belongsTo' | 'instructions' | 'passport' | 'activity' | 'doodle' | 'solutions' | 'certificate';
    title: string;
    pageNumber: number;
    challengeNumber?: number;
    activityPage?: ActivityPage;
  }

  const virtualPages: VirtualPage[] = useMemo(() => {
    const pages: VirtualPage[] = [];

    // 0. Cover Page
    pages.push({ id: 'cover', type: 'cover', title: 'Book Cover', pageNumber: 0 });

    // 1. Title Page
    pages.push({ id: 'title', type: 'title', title: 'Title Page', pageNumber: 1 });

    // 2. Belongs To
    pages.push({ id: 'belongsTo', type: 'belongsTo', title: 'Belongs To', pageNumber: 2 });

    // 3. Instructions
    pages.push({ id: 'instructions', type: 'instructions', title: 'Instructions & Guide', pageNumber: 3 });

    // 4. Dynamic Adventure Stamp Passport
    pages.push({ id: 'passport', type: 'passport', title: `My ${totalChallenges}-Challenge Stamp Passport`, pageNumber: 4 });

    // Interior Activity Pages
    project.pages.forEach((act, idx) => {
      const chNum = act.challengeNumber || (idx + 1);
      pages.push({
        id: act.id,
        type: 'activity',
        title: act.title,
        pageNumber: act.pageNumber,
        challengeNumber: chNum,
        activityPage: act,
      });

      // If single sided, include doodle backing page
      if (project.config.singleSided) {
        pages.push({
          id: `${act.id}-doodle`,
          type: 'doodle',
          title: 'Free Doodle Space',
          pageNumber: act.pageNumber + 1,
        });
      }
    });

    // Solutions Page
    pages.push({ id: 'solutions', type: 'solutions', title: 'Solutions Appendix', pageNumber: pages.length + 1 });

    // Congratulations Certificate
    pages.push({ id: 'certificate', type: 'certificate', title: 'Explorer Certificate', pageNumber: pages.length + 1 });

    return pages;
  }, [project, totalChallenges]);

  const currentPage = virtualPages[currentPageIndex] || virtualPages[0];
  const isActivityPage = currentPage.type === 'activity';
  const currentChallengeNum = currentPage.challengeNumber;
  const isCurrentChallengeCompleted = currentChallengeNum ? completedChallenges.has(currentChallengeNum) : false;

  // Navigation handlers
  const handlePrevPage = () => {
    setCurrentPageIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPageIndex((prev) => Math.min(virtualPages.length - 1, prev + 1));
  };

  const jumpToPageType = (type: VirtualPage['type']) => {
    const targetIdx = virtualPages.findIndex((p) => p.type === type);
    if (targetIdx !== -1) setCurrentPageIndex(targetIdx);
  };

  const jumpToChallenge = (challengeNum: number) => {
    const targetIdx = virtualPages.findIndex((p) => p.challengeNumber === challengeNum);
    if (targetIdx !== -1) setCurrentPageIndex(targetIdx);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevPage();
      if (e.key === 'ArrowRight') handleNextPage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [virtualPages.length]);

  // Render SVG Stamp Passport for the Passport Page
  const passportSVG = useMemo(() => {
    return renderStampPassportSVG(
      totalChallenges,
      Array.from(completedChallenges),
      project.config.authorName,
      project.config.theme
    );
  }, [totalChallenges, completedChallenges, project.config.authorName, project.config.theme]);

  const progressPercent = Math.round((completedChallenges.size / totalChallenges) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Top Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
            <Tablet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">Kindle App Reader Simulator</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                Live Interactive Mode
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Review your e-book layout, test puzzle solving, and watch the dynamic {totalChallenges}-stamp reward loop in action!
            </p>
          </div>
        </div>

        {/* Device Mode & Sound Toggles */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setDeviceMode('fire-tablet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                deviceMode === 'fire-tablet'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kindle Fire HD (Color)
            </button>
            <button
              onClick={() => setDeviceMode('paperwhite')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                deviceMode === 'paperwhite'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kindle Paperwhite (E-Ink)
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title={soundEnabled ? 'Mute Celebration Sound' : 'Enable Celebration Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          <button
            onClick={() => setCompletedChallenges(new Set())}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            title="Reset solved stamps to test again"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Stamps
          </button>
        </div>
      </div>

      {/* Main Kindle Device Stage */}
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        {/* The Device Frame */}
        <div className="flex-1 flex flex-col items-center w-full max-w-2xl">
          {/* Outer Tablet Frame */}
          <div
            className={`w-full transition-all duration-300 rounded-[38px] p-4 md:p-6 shadow-2xl relative ${
              deviceMode === 'fire-tablet'
                ? 'bg-gradient-to-b from-slate-900 via-slate-800 to-black border-4 border-slate-700 ring-8 ring-slate-900/40'
                : 'bg-neutral-800 border-4 border-neutral-600 ring-8 ring-neutral-900/30'
            }`}
          >
            {/* Front Camera Dot & Speaker */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-700/80 shadow-inner" />
              <div className="w-10 h-1 rounded-full bg-slate-950/60" />
            </div>

            {/* Inner Screen Bezel */}
            <div
              className={`rounded-2xl overflow-hidden shadow-inner flex flex-col transition-colors ${
                deviceMode === 'fire-tablet'
                  ? 'bg-white text-slate-900'
                  : 'bg-[#f4f2ea] text-neutral-900 filter grayscale contrast-125'
              }`}
              style={{ minHeight: '680px' }}
            >
              {/* Kindle Reader Header Bar */}
              <div className="px-4 py-2 bg-slate-100/90 border-b border-slate-200/80 flex items-center justify-between text-xs text-slate-600 select-none">
                <button
                  onClick={() => setCurrentPageIndex(0)}
                  className="flex items-center gap-1 font-semibold text-slate-700 hover:text-amber-600"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Library
                </button>
                <div className="text-center font-medium truncate max-w-[200px] text-slate-800">
                  {project.config.title}
                </div>
                <div className="flex items-center gap-2.5 font-mono text-[11px] text-slate-500">
                  <span>Aa</span>
                  <span>🔖</span>
                  <span>88%</span>
                </div>
              </div>

              {/* Celebration Banner / Flag Notification */}
              {showCelebration && (
                <div className="bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 text-white text-xs font-bold px-4 py-2.5 text-center flex items-center justify-center gap-2 shadow-md animate-bounce">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{showCelebration}</span>
                  <Trophy className="w-4 h-4" />
                </div>
              )}

              {/* Page Content Viewport */}
              <div className="flex-1 p-3 md:p-6 flex flex-col items-center justify-center relative overflow-hidden bg-white">
                {/* 1. Cover View */}
                {currentPage.type === 'cover' && (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    {project.cover.uploadedFrontCoverUrl || project.cover.uploadedFullWrapUrl ? (
                      <img
                        src={project.cover.uploadedFrontCoverUrl || project.cover.uploadedFullWrapUrl}
                        alt="Front Cover"
                        className="max-h-[500px] rounded-lg shadow-xl object-contain"
                      />
                    ) : (
                      <div className="w-full max-w-[380px] aspect-[8.5/11] bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl shadow-xl p-6 text-white flex flex-col justify-between border-4 border-white/20">
                        <div className="text-xs tracking-wider uppercase font-extrabold text-amber-300">
                          {project.config.authorName}
                        </div>
                        <div className="my-auto">
                          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight text-white drop-shadow-md">
                            {project.config.title}
                          </h1>
                          <p className="mt-2 text-xs text-blue-100 font-medium">
                            {project.config.subtitle}
                          </p>
                          <div className="mt-4 inline-block px-3 py-1 bg-amber-400 text-slate-900 rounded-full text-xs font-bold shadow-sm">
                            Ages {project.config.ageGroup}
                          </div>
                        </div>
                        <div className="text-[11px] text-blue-200">
                          ★ Includes {totalChallenges} Challenge Stamps & Answer Key ★
                        </div>
                      </div>
                    )}
                    <button
                      onClick={handleNextPage}
                      className="mt-4 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      Open Activity Book <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* 2. Title Page */}
                {currentPage.type === 'title' && (
                  <div className="w-full max-w-[420px] aspect-[8.5/11] border-2 border-slate-800 rounded-xl p-6 flex flex-col justify-between text-center bg-white shadow-sm">
                    <div className="border border-slate-200 rounded-lg p-4 my-auto">
                      <div className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">
                        {project.config.authorName} Presents
                      </div>
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">
                        {project.config.title}
                      </h1>
                      <p className="text-xs text-slate-600 mb-4">{project.config.subtitle}</p>
                      <div className="inline-block px-4 py-1.5 rounded-full border border-blue-600 text-blue-600 text-xs font-bold">
                        Special Edition for Ages {project.config.ageGroup}
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1 pt-2">
                      <img
                        src={KUNTA_LOGO_PNG_PATH}
                        alt="Published by Kunta Publications"
                        className="h-6 w-auto object-contain"
                      />
                      <div className="text-[10px] text-slate-400">
                        Published by Kunta Publications • All Rights Reserved
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Belongs To (Interactive Key-in Name) */}
                {currentPage.type === 'belongsTo' && (
                  <div className="w-full max-w-[420px] aspect-[8.5/11] border-2 border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-white shadow-sm select-text">
                    <div className="text-4xl mb-3">⭐ 🎨 🚀</div>
                    <h2 className="text-xl font-black text-slate-800 mb-3 uppercase tracking-wider">
                      This Book Belongs To:
                    </h2>

                    {/* Interactive Name Input Field */}
                    <div className="w-full max-w-[320px] my-3 flex flex-col items-center">
                      <div className="relative w-full">
                        <input
                          type="text"
                          value={childName}
                          onChange={(e) => handleNameChange(e.target.value)}
                          placeholder="✍️ Click to key in name..."
                          maxLength={28}
                          className="w-full text-center font-black text-xl text-indigo-700 bg-amber-50/60 hover:bg-amber-50 focus:bg-white rounded-xl border-2 border-dashed border-amber-400 focus:border-indigo-600 py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-400 placeholder:font-normal placeholder:text-sm shadow-2xs transition-all"
                        />
                        {childName && (
                          <button
                            type="button"
                            onClick={() => handleNameChange('')}
                            className="absolute right-2 top-2.5 text-slate-400 hover:text-red-500 p-1 text-xs cursor-pointer"
                            title="Clear name"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {childName ? (
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Book personalised for {childName}
                          </span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 mt-2 font-medium">
                          (Key in your name above, or leave blank to write with a pencil!)
                        </p>
                      )}

                      {/* Quick fill suggestion if explorer profile exists */}
                      {!childName && savedExplorerName && (
                        <button
                          type="button"
                          onClick={() => handleNameChange(savedExplorerName)}
                          className="mt-2.5 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          <span>Use Explorer Name: "{savedExplorerName}"</span>
                        </button>
                      )}
                    </div>

                    <p className="text-[10px] text-slate-400 mt-3 font-medium">
                      Official Kunta Publications Young Explorer Edition
                    </p>
                  </div>
                )}

                {/* 4. Instructions */}
                {currentPage.type === 'instructions' && (
                  <div className="w-full max-w-[420px] aspect-[8.5/11] border-2 border-slate-800 rounded-xl p-6 flex flex-col justify-between bg-white shadow-sm text-left">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 uppercase mb-3 text-center">
                        Welcome, Young Adventurer!
                      </h2>
                      <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                        <p className="font-semibold text-slate-800">
                          Are you ready to test your brain power with {totalChallenges} fun puzzles?
                        </p>
                        <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                          <li><strong>🌀 Mazes:</strong> Guide characters to the goal without hitting dead ends.</li>
                          <li><strong>🔍 Word Searches:</strong> Find all hidden words in the grid.</li>
                          <li><strong>✏️ Dot-to-Dot:</strong> Connect the numbers to uncover hidden art.</li>
                          <li><strong>🎨 Coloring:</strong> Unleash your imagination with bright crayons!</li>
                          <li><strong>🧠 Sudoku:</strong> Logic challenge with no repeating numbers.</li>
                        </ul>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800">
                      <strong>🎯 Stamp Passport Rule:</strong> Each puzzle page has a matching badge on Page 4. Mark or color them as you solve to earn your final certificate!
                    </div>
                  </div>
                )}

                {/* 5. Dynamic Adventure Stamp Passport Page */}
                {currentPage.type === 'passport' && (
                  <div className="w-full max-h-[540px] flex items-center justify-center">
                    <div
                      className="w-full max-w-[440px] aspect-[612/792] shadow-md rounded-lg overflow-hidden border border-slate-200"
                      dangerouslySetInnerHTML={{ __html: passportSVG }}
                    />
                  </div>
                )}

                {/* 6. Activity Page (Maze, Word Search, Sudoku, etc.) */}
                {currentPage.type === 'activity' && currentPage.activityPage && (
                  <div className="w-full max-w-[440px] flex flex-col items-center">
                    {/* Activity Page Header */}
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        Challenge #{currentChallengeNum} of {totalChallenges}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                        {currentPage.activityPage.type}
                      </span>
                    </div>

                    {/* Interactive Mouse & Touch Vector Activity Canvas */}
                    <InteractivePuzzleCanvas
                      svgContent={currentPage.activityPage.svgContent || ''}
                      solutionSvgContent={currentPage.activityPage.solutionSvgContent}
                      puzzleType={currentPage.activityPage.type}
                      puzzleData={currentPage.activityPage.data}
                      challengeNumber={currentChallengeNum}
                      ageGroup={project.config.ageGroup}
                      isSolved={isCurrentChallengeCompleted}
                      onSolve={() => currentChallengeNum && toggleChallenge(currentChallengeNum)}
                    />

                    {/* Completion Action Bar (Crucial Feature Requested by User) */}
                    <div className="mt-3 w-full flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                            isCurrentChallengeCompleted
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : 'bg-slate-200 text-slate-500'
                          }`}
                        >
                          {isCurrentChallengeCompleted ? '✓' : `#${currentChallengeNum}`}
                        </div>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-800">
                            {isCurrentChallengeCompleted ? 'Challenge Solved!' : 'Solved this puzzle?'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {isCurrentChallengeCompleted
                              ? `Stamp #${currentChallengeNum} colored in Passport!`
                              : `Tap to mark completed and unlock Stamp #${currentChallengeNum}`}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => currentChallengeNum && toggleChallenge(currentChallengeNum)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                          isCurrentChallengeCompleted
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                            : 'bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white shadow-md hover:scale-105'
                        }`}
                      >
                        {isCurrentChallengeCompleted ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Solved!
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" /> Mark Solved!
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 7. Doodle Backing Page */}
                {currentPage.type === 'doodle' && (
                  <div className="w-full max-w-[420px] aspect-[8.5/11] border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50">
                    <div className="text-3xl text-slate-300 mb-3">🖍️ 🎨 ⭐</div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Free Doodle & Coloring Space
                    </div>
                    <p className="text-[10px] text-slate-400">
                      (Blank backing protects the next puzzle from marker bleed-through)
                    </p>
                  </div>
                )}

                {/* 8. Solutions Page */}
                {currentPage.type === 'solutions' && (
                  <div className="w-full max-w-[420px] aspect-[8.5/11] border-2 border-slate-800 rounded-xl p-6 flex flex-col justify-between text-center bg-white shadow-sm">
                    <div>
                      <div className="text-2xl mb-2">🔍 💡</div>
                      <h2 className="text-lg font-black text-slate-900 uppercase mb-2">
                        Solutions & Answer Key
                      </h2>
                      <p className="text-xs text-slate-500 mb-4">
                        All {totalChallenges} puzzle solutions and maze paths are provided here for quick verification.
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-left">
                        {project.pages.slice(0, 6).map((p, idx) => (
                          <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 text-[10px]">
                            <span className="font-bold text-slate-700">P.{p.pageNumber}:</span> {p.title} ✓
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Great job checking your work!
                    </div>
                  </div>
                )}

                {/* 9. Explorer Certificate */}
                {currentPage.type === 'certificate' && (
                  <div className="w-full max-w-[420px] aspect-[8.5/11] border-4 border-double border-amber-500 rounded-xl p-6 flex flex-col items-center justify-between text-center bg-amber-50/30 shadow-md">
                    <div>
                      <div className="text-4xl mb-2">🏆 🎓</div>
                      <div className="text-xs uppercase font-extrabold tracking-widest text-amber-700">
                        Official Certificate of Achievement
                      </div>
                      <h2 className="text-xl font-black text-slate-900 uppercase my-2">
                        Master Brain Explorer!
                      </h2>
                      <p className="text-xs text-slate-600">
                        Proudly presented for completing all {totalChallenges} challenging puzzles, mazes, and games in this book!
                      </p>
                    </div>
                    <div className="w-full flex justify-around items-end pt-4 border-t border-amber-200 text-[10px] text-slate-500">
                      <div>
                        <div className="w-24 border-b border-slate-400 mb-1" />
                        Date Completed
                      </div>
                      <div className="w-12 h-12 rounded-full border-2 border-amber-500 flex items-center justify-center font-bold text-[9px] text-amber-700">
                        SEAL
                      </div>
                      <div>
                        <div className="w-24 border-b border-slate-400 mb-1 font-semibold text-slate-700">
                          Kunta Publications
                        </div>
                        Publisher
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Kindle Reader Bottom Navigation & Scrubber Bar */}
              <div className="px-4 py-2.5 bg-slate-100/95 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600 select-none">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPageIndex === 0}
                  className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-30 transition-colors flex items-center gap-1 font-medium"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>

                <div className="flex flex-col items-center text-center">
                  <div className="text-[11px] font-semibold text-slate-800">
                    {currentPage.title}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Page {currentPageIndex + 1} of {virtualPages.length} • {Math.round(((currentPageIndex + 1) / virtualPages.length) * 100)}%
                  </div>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPageIndex === virtualPages.length - 1}
                  className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-30 transition-colors flex items-center gap-1 font-medium"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bottom Kindle Logo Deboss */}
            <div className="text-center mt-2.5">
              <span className="font-serif tracking-widest text-slate-500 text-[11px] uppercase font-bold opacity-70">
                kindle
              </span>
            </div>
          </div>
        </div>

        {/* Gamification & Dynamic Stamp HUD (Right Panel / Sidebar) */}
        <div className="w-full lg:w-96 flex flex-col gap-4">
          {/* Progress Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {totalChallenges}-Stamp Brain Passport
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800">
                {completedChallenges.size} / {totalChallenges} Done
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 mb-2">
              <div
                className="bg-gradient-to-r from-amber-400 via-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>{progressPercent}% Brain Power Unlocked</span>
              <span>{totalChallenges - completedChallenges.size} stamps left</span>
            </div>

            <button
              onClick={() => jumpToPageType('passport')}
              className="mt-3 w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              View Full Stamp Passport (Page 4)
            </button>
          </div>

          {/* All Dynamic Stamps Matrix (Colored vs Greyed Out) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Puzzle Stamp Badges ({totalChallenges} Total)
              </h4>
              <span className="text-[10px] text-slate-400">Tap to jump or toggle</span>
            </div>

            <div className="grid grid-cols-4 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
              {stampBadges.map((badge) => {
                const isDone = completedChallenges.has(badge.id);
                return (
                  <button
                    key={badge.id}
                    onClick={() => {
                      jumpToChallenge(badge.id);
                    }}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all group relative ${
                      isDone
                        ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-xs hover:scale-105'
                        : 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-65 hover:opacity-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xl mb-1 filter drop-shadow-xs">
                      {isDone ? badge.icon : '⚪'}
                    </div>
                    <div className="text-[10px] font-bold leading-tight truncate w-full">
                      #{badge.id} {badge.label}
                    </div>
                    <div
                      className={`text-[9px] font-semibold mt-1 px-1.5 py-0.2 rounded-full ${
                        isDone ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isDone ? 'SOLVED' : 'GREYED'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Completion Modal when all puzzles solved */}
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border-4 border-amber-400 relative">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4 shadow-inner">
              🏆
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-1 uppercase">
              Grand Champion!
            </h3>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-3">
              All {totalChallenges} Challenge Stamps Unlocked!
            </p>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Incredible job! You have demonstrated exceptional problem solving, focus, and creativity. Your Adventure Stamp Passport is 100% complete!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCertificateModal(false);
                  jumpToPageType('certificate');
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-500 text-white font-bold rounded-xl text-xs shadow-md hover:brightness-105"
              >
                View Explorer Certificate
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
