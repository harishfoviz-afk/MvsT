import React from 'react';
import { BookRecord } from '../types/book';
import {
  Sparkles,
  Gamepad2,
  Trophy,
  Star,
  CheckCircle2,
  Zap,
  Award,
  BookOpen,
  Compass,
  ShieldCheck,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getLastPlayedProgress, loadAllChildProfiles } from '../core/storage/kidsProfileStorage';

interface LandingPageProps {
  onSelectChild: (childIndex: number) => void;
  catalog?: BookRecord[];
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectChild, catalog = [] }) => {
  const { profiles } = loadAllChildProfiles();
  const maanProfile = profiles[0];
  const toshiProfile = profiles[1];
  const maanProgress = getLastPlayedProgress(0);
  const toshiProgress = getLastPlayedProgress(1);

  const maanBook = catalog.find((b) => b.id === maanProgress?.bookId);
  const toshiBook = catalog.find((b) => b.id === toshiProgress?.bookId);

  const handlePickMaan = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
    onSelectChild(0);
  };

  const handlePickToshi = () => {
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.6 },
    });
    onSelectChild(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-slate-900 to-indigo-950 text-white font-sans flex flex-col justify-between selection:bg-amber-400 selection:text-slate-900">
      {/* Top Vacation Banner */}
      <header className="px-6 py-6 border-b border-indigo-800/60 backdrop-blur-md bg-indigo-950/40 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-orange-500/20">
              🚗
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl md:text-2xl tracking-tight text-white font-heading">
                  Maan vs Toshi
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Vacation Edition 🌴
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 font-medium">
                Self-Drive Road Trip Puzzle &amp; Activity Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Free • Offline Ready</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Hero & Kid Selector */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center space-y-10 w-full">
        {/* Playful Heading */}
        <div className="text-center space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs md:text-sm font-bold shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Ready for the road? Pick who is playing!</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-heading">
            Who Is Playing Today?
          </h1>
          <p className="text-sm sm:text-base text-indigo-200 max-w-xl mx-auto leading-relaxed">
            Choose your profile to jump into games, puzzles, and mazes carefully tuned for your age. Perfect for passing time during the drive!
          </p>
        </div>

        {/* 2 Big Kid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl">
          {/* Card 1: Maan (10 Years Old) */}
          <div
            onClick={handlePickMaan}
            className="group relative bg-gradient-to-b from-indigo-800/90 to-purple-900/90 hover:from-indigo-700 hover:to-purple-800 border-2 border-indigo-400/30 hover:border-amber-400 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/30 cursor-pointer text-left"
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {maanProgress && (
                <span className="bg-amber-400/90 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[11px] shadow-sm flex items-center gap-1 animate-pulse">
                  ▶ Ch. #{maanProgress.challengeNum}
                </span>
              )}
              <div className="bg-indigo-900/80 px-3 py-1 rounded-full text-xs font-black text-indigo-300 border border-indigo-500/30">
                Ages 10+
              </div>
            </div>

            <div className="space-y-4">
              {/* Figure Avatar */}
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-400 to-indigo-500 p-1 shadow-xl flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
                {maanProfile.avatar || '🚀'}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-black text-white font-heading group-hover:text-amber-300 transition-colors">
                    Maan
                  </h2>
                  <span className="text-lg">🧠</span>
                </div>
                <div className="text-amber-300 font-extrabold text-sm flex items-center gap-1.5 mt-0.5">
                  <span>10 Years Old</span>
                  <span>•</span>
                  <span>Brain Master</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                Challenging puzzles built to keep big kids thinking and having fun during long drives!
              </p>

              {/* Age-Appropriate Features */}
              <div className="space-y-2 pt-2 border-t border-indigo-700/60">
                <div className="flex items-center text-xs font-bold text-indigo-200 gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>9×9 Full Logic Sudoku</span>
                </div>
                <div className="flex items-center text-xs font-bold text-indigo-200 gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Complex Loop Mazes with Dead Ends</span>
                </div>
                <div className="flex items-center text-xs font-bold text-indigo-200 gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>8-Direction Diagonal Word Searches</span>
                </div>
                <div className="flex items-center text-xs font-bold text-indigo-200 gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Space, Fantasy &amp; Jungle Adventures</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                type="button"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 hover:from-amber-300 hover:to-pink-400 text-slate-950 font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-102 cursor-pointer"
              >
                <Gamepad2 className="w-5 h-5 text-slate-950" />
                <span>
                  {maanProgress && maanProgress.challengeNum > 1
                    ? `Resume Challenge #${maanProgress.challengeNum} (Maan)`
                    : 'Play as Maan (10y)'}
                </span>
              </button>
            </div>
          </div>

          {/* Card 2: Toshi (6 Years Old) */}
          <div
            onClick={handlePickToshi}
            className="group relative bg-gradient-to-b from-amber-950/80 to-orange-950/90 hover:from-amber-900/90 hover:to-orange-900/90 border-2 border-amber-500/30 hover:border-amber-300 rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 cursor-pointer text-left"
          >
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {toshiProgress && (
                <span className="bg-amber-400/90 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[11px] shadow-sm flex items-center gap-1 animate-pulse">
                  ▶ Ch. #{toshiProgress.challengeNum}
                </span>
              )}
              <div className="bg-amber-900/80 px-3 py-1 rounded-full text-xs font-black text-amber-300 border border-amber-500/30">
                Ages 4–6
              </div>
            </div>

            <div className="space-y-4">
              {/* Figure Avatar */}
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 p-1 shadow-xl flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-300">
                {toshiProfile.avatar || '🦁'}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-black text-white font-heading group-hover:text-amber-300 transition-colors">
                    Toshi
                  </h2>
                  <span className="text-lg">🌿</span>
                </div>
                <div className="text-amber-300 font-extrabold text-sm flex items-center gap-1.5 mt-0.5">
                  <span>6 Years Old</span>
                  <span>•</span>
                  <span>Junior Explorer</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
                Fun, friendly, and rewarding preschool activities with big outlines and easy controls!
              </p>

              {/* Age-Appropriate Features */}
              <div className="space-y-2 pt-2 border-t border-amber-800/60">
                <div className="flex items-center text-xs font-bold text-amber-200 gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>4×4 Mini-Sudoku with Hints</span>
                </div>
                <div className="flex items-center text-xs font-bold text-amber-200 gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Gentle Winding Safari &amp; Dino Mazes</span>
                </div>
                <div className="flex items-center text-xs font-bold text-amber-200 gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Simple Left-to-Right Word Finds</span>
                </div>
                <div className="flex items-center text-xs font-bold text-amber-200 gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dot-to-Dot &amp; Bold Line Art Coloring</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                type="button"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 text-slate-950 font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 group-hover:scale-102 cursor-pointer"
              >
                <Gamepad2 className="w-5 h-5 text-slate-950" />
                <span>
                  {toshiProgress && toshiProgress.challengeNum > 1
                    ? `Resume Challenge #${toshiProgress.challengeNum} (Toshi)`
                    : 'Play as Toshi (6y)'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Road Trip Features Strip */}
        <div className="w-full max-w-4xl bg-indigo-950/60 border border-indigo-800/70 rounded-2xl p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl">🚗</div>
            <div className="text-xs font-black text-white">Car-Friendly</div>
            <div className="text-[11px] text-indigo-300">Big touch areas for back seat play</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">📴</div>
            <div className="text-xs font-black text-white">100% Offline</div>
            <div className="text-[11px] text-indigo-300">Zero data or WiFi needed on the road</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">⭐</div>
            <div className="text-xs font-black text-white">Earn Stars</div>
            <div className="text-[11px] text-indigo-300">3-star ranks &amp; passport stamps</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl">🆓</div>
            <div className="text-xs font-black text-white">No Ads or Payments</div>
            <div className="text-[11px] text-indigo-300">Pure distraction-free fun</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-indigo-300/60 border-t border-indigo-900/40">
        Maan vs Toshi Fun • Road Trip Companion
      </footer>
    </div>
  );
};
