import React, { useState } from 'react';
import {
  ExplorerProfile,
  formatSeconds,
  calculateLevel,
  calculateAgeFromBirthDate,
  LEVEL_TITLES,
} from '../core/storage/kidsProfileStorage';
import { AgeGroup } from '../types/book';
import {
  X,
  Trophy,
  Star,
  Clock,
  CheckCircle2,
  Zap,
  BookOpen,
  Award,
  Sparkles,
  Edit2,
  Save,
  Gamepad2,
  ShieldCheck,
  RotateCcw,
  Calendar,
} from 'lucide-react';

interface ExplorerProfileModalProps {
  profile: ExplorerProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (
    name: string,
    avatar: string,
    ageGroup: AgeGroup,
    birthDate?: string,
    ageYears?: number
  ) => void;
  onResetProfile?: () => void;
}

const AVATAR_OPTIONS = [
  { emoji: '🦁', name: 'Safari Scout' },
  { emoji: '🚀', name: 'Astro Cadet' },
  { emoji: '🦖', name: 'Dino Tracker' },
  { emoji: '🦄', name: 'Magic Hero' },
  { emoji: '🐬', name: 'Ocean Diver' },
  { emoji: '🐻', name: 'Forest Bear' },
  { emoji: '🦊', name: 'Clever Fox' },
  { emoji: '🐯', name: 'Brave Tiger' },
];

export const ExplorerProfileModal: React.FC<ExplorerProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onUpdateProfile,
  onResetProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'books' | 'puzzles' | 'trophies'>('books');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editAvatar, setEditAvatar] = useState(profile.avatar);
  const [editAge, setEditAge] = useState<AgeGroup>(profile.ageGroup || '4-6');
  const [editBirthDate, setEditBirthDate] = useState(profile.birthDate || '');
  const [editAgeYears, setEditAgeYears] = useState<number | undefined>(profile.ageYears);

  if (!isOpen) return null;

  const levelInfo = calculateLevel(profile.totalXp);
  const completedGamesList = Object.values(profile.completedGames);
  const puzzleRecordsList = Object.values(profile.puzzleRecords).sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt)
  );

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(
      editName.trim() || profile.name,
      editAvatar,
      editAge,
      editBirthDate || undefined,
      editAgeYears
    );
    setIsEditing(false);
  };

  // Milestone Achievements
  const trophies = [
    {
      id: 'first_step',
      title: 'First Step! 👣',
      desc: 'Solve your very first puzzle challenge',
      unlocked: profile.totalPuzzlesSolved >= 1,
    },
    {
      id: 'star_collector',
      title: 'Star Collector ⭐',
      desc: 'Earn 15 or more total Gold Stars',
      unlocked: profile.totalStarsEarned >= 15,
    },
    {
      id: 'speed_demon',
      title: 'Lightning Fast ⚡',
      desc: 'Solve any challenge in under 60 seconds',
      unlocked: puzzleRecordsList.some((p) => p.bestTimeSeconds <= 60),
    },
    {
      id: 'clean_mind',
      title: 'Master Focus 🎯',
      desc: 'Solve 3 puzzles with zero mistakes or hints',
      unlocked: profile.cleanSolvesCount >= 3,
    },
    {
      id: 'level_five',
      title: 'Star Navigator 🚀',
      desc: 'Advance your rank to Level 5 or higher',
      unlocked: profile.level >= 5,
    },
    {
      id: 'book_worm',
      title: 'Book Champion 🏆',
      desc: '100% complete all challenges in a full book',
      unlocked: completedGamesList.some((g) => g.isFullyCompleted),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border-4 border-amber-400 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 text-white shadow-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-200" />
            <h2 className="text-base sm:text-lg font-black tracking-tight">
              Explorer Profile &amp; Brain Stats
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer transition-colors"
            title="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Hero Explorer Card */}
          <div className="bg-gradient-to-br from-indigo-50 via-sky-50 to-amber-50 rounded-2xl p-4 sm:p-5 border-2 border-indigo-100 shadow-xs relative">
            {!isEditing ? (
              <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                {/* Avatar Badge */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white border-4 border-amber-400 shadow-md flex items-center justify-center text-4xl select-none animate-in zoom-in">
                    {profile.avatar}
                  </div>
                  <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black shadow-xs border border-white">
                    Lv. {profile.level}
                  </span>
                </div>

                {/* Identity & Level */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      {profile.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-black">
                      {profile.levelTitle}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditName(profile.name);
                        setEditAvatar(profile.avatar);
                        setEditAge(profile.ageGroup || '4-6');
                        setEditBirthDate(profile.birthDate || '');
                        setEditAgeYears(profile.ageYears);
                        setIsEditing(true);
                      }}
                      className="text-slate-400 hover:text-indigo-600 p-1 cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 font-semibold flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                      🎯 Calibrated for Ages {profile.ageGroup || '4-6'}
                    </span>
                    {profile.ageYears !== undefined && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700">
                        🎈 {profile.ageYears} Years Old
                      </span>
                    )}
                    {profile.birthDate && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700">
                        🎂 {profile.birthDate}
                      </span>
                    )}
                  </p>

                  {/* XP Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600">
                      <span>XP Progress</span>
                      <span>
                        {profile.totalXp} / {levelInfo.nextLevelXp} XP ({levelInfo.progressPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${levelInfo.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Inline Edit Form */
              <form onSubmit={handleSaveEdit} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800">Customize Your Explorer:</span>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 underline"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Explorer Name:</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      maxLength={18}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm bg-white focus:outline-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      Date of Birth (Optional):
                    </label>
                    <input
                      type="date"
                      value={editBirthDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditBirthDate(val);
                        const res = calculateAgeFromBirthDate(val);
                        if (res) {
                          setEditAge(res.ageGroup);
                          setEditAgeYears(res.ageYears);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm bg-white focus:outline-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-500 block">Age Tier:</label>
                      {editAgeYears !== undefined && (
                        <span className="text-[10px] text-emerald-600 font-bold">
                          {editAgeYears} yrs old
                        </span>
                      )}
                    </div>
                    <select
                      value={editAge}
                      onChange={(e) => {
                        const grp = e.target.value as AgeGroup;
                        setEditAge(grp);
                        if (grp === '4-6') setEditAgeYears(5);
                        else if (grp === '7-9') setEditAgeYears(8);
                        else setEditAgeYears(11);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-sm bg-white focus:outline-indigo-500"
                    >
                      <option value="4-6">Ages 4–6 (Junior Scout)</option>
                      <option value="7-9">Ages 7–9 (Adventure Scout)</option>
                      <option value="10+">Ages 10+ (Logic Champion)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Select Avatar:</label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_OPTIONS.map((av) => (
                      <button
                        key={av.emoji}
                        type="button"
                        onClick={() => setEditAvatar(av.emoji)}
                        className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all cursor-pointer ${
                          editAvatar === av.emoji
                            ? 'border-indigo-600 bg-indigo-100 scale-110 shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                        title={av.name}
                      >
                        {av.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </form>
            )}
          </div>

          {/* 4-Stat Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 text-center space-y-1 shadow-2xs">
              <div className="flex items-center justify-center text-amber-600">
                <Gamepad2 className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {profile.totalPuzzlesSolved}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Puzzles Solved
              </div>
            </div>

            <div className="bg-yellow-50/80 border border-yellow-200 rounded-2xl p-3 text-center space-y-1 shadow-2xs">
              <div className="flex items-center justify-center text-yellow-600">
                <Star className="w-5 h-5 fill-yellow-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {profile.totalStarsEarned}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Total Stars
              </div>
            </div>

            <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-3 text-center space-y-1 shadow-2xs">
              <div className="flex items-center justify-center text-sky-600">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {formatSeconds(profile.totalSecondsPlayed)}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Brain Time
              </div>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 text-center space-y-1 shadow-2xs">
              <div className="flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {profile.cleanSolvesCount}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Clean Solves
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('books')}
              className={`px-4 py-2 border-b-2 font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'books'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Books Played ({completedGamesList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('puzzles')}
              className={`px-4 py-2 border-b-2 font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'puzzles'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Best Records ({puzzleRecordsList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('trophies')}
              className={`px-4 py-2 border-b-2 font-black text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'trophies'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Trophy Cabinet ({trophies.filter((t) => t.unlocked).length}/{trophies.length})</span>
            </button>
          </div>

          {/* Tab 1: Books Played Showcase */}
          {activeTab === 'books' && (
            <div className="space-y-3">
              {completedGamesList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="font-bold text-xs">No books played yet!</p>
                  <p className="text-[11px] mt-1">Open an activity book from the bookshelf to start collecting stamps!</p>
                </div>
              ) : (
                completedGamesList.map((game) => {
                  const percent = Math.round((game.solvedPuzzlesCount / game.totalPuzzles) * 100);
                  return (
                    <div
                      key={game.bookId}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-sm text-slate-900">{game.bookTitle}</h4>
                          {game.isFullyCompleted && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              100% COMPLETE! 🏆
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                          <span>Ages {game.ageGroup}</span>
                          <span>•</span>
                          <span>{game.solvedPuzzlesCount} of {game.totalPuzzles} Solved</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {game.totalStars} Stars
                          </span>
                        </div>
                      </div>

                      {/* Mini Progress */}
                      <div className="w-full sm:w-36 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600">
                          <span>Book Progress</span>
                          <span>{percent}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab 2: Puzzle Records & Best Times */}
          {activeTab === 'puzzles' && (
            <div className="space-y-2">
              {puzzleRecordsList.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="font-bold text-xs">No puzzles recorded yet!</p>
                  <p className="text-[11px] mt-1">Solve any puzzle to record your fastest time!</p>
                </div>
              ) : (
                puzzleRecordsList.map((rec) => (
                  <div
                    key={`${rec.bookId}_${rec.challengeNumber}`}
                    className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-black flex items-center justify-center text-xs">
                        #{rec.challengeNumber}
                      </span>
                      <div>
                        <div className="font-extrabold text-slate-900">{rec.title}</div>
                        <div className="text-[10px] font-bold uppercase text-slate-400">
                          {rec.activityType} • {rec.attemptsCount} {rec.attemptsCount === 1 ? 'play' : 'plays'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rec.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Best Time */}
                      <span className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 font-mono font-black text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3 text-sky-600" />
                        {formatSeconds(rec.bestTimeSeconds)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Tab 3: Trophy Cabinet */}
          {activeTab === 'trophies' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trophies.map((tr) => (
                <div
                  key={tr.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                    tr.unlocked
                      ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 opacity-60'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-2xs border ${
                      tr.unlocked
                        ? 'bg-amber-400 text-white border-amber-500'
                        : 'bg-slate-200 text-slate-400 border-slate-300'
                    }`}
                  >
                    {tr.unlocked ? '🏆' : '🔒'}
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-black text-xs text-slate-900">{tr.title}</div>
                    <p className="text-[11px] text-slate-500 leading-snug">{tr.desc}</p>
                    <span
                      className={`inline-block text-[9px] font-black uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded ${
                        tr.unlocked
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {tr.unlocked ? '✓ Unlocked' : 'Locked'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {onResetProfile ? (
            <button
              type="button"
              onClick={onResetProfile}
              className="px-3.5 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs hover:scale-102"
              title="Wipe explorer records and start completely fresh"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-600" />
              <span>Reset Profile / Fresh Start</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-black transition-all cursor-pointer shadow-sm hover:scale-102"
          >
            Awesome, Back to Puzzles! 👍
          </button>
        </div>
      </div>
    </div>
  );
};
