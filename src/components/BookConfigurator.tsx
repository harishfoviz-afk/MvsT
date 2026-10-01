import React from 'react';
import { AgeGroup, BookConfig, BookTheme } from '../types/book';
import { Wand2, Shield, Info, Sliders, RefreshCw, Check, User } from 'lucide-react';
import { getDefaultAuthorForAge } from '../core/marketing/kdpMarketing';

interface BookConfiguratorProps {
  config: BookConfig;
  onChange: (updated: Partial<BookConfig>) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
}

export const BookConfigurator: React.FC<BookConfiguratorProps> = ({
  config,
  onChange,
  onGenerate,
  isGenerating = false,
}) => {
  const ageOptions: { id: AgeGroup; label: string; subtitle: string; icon: string }[] = [
    { id: '4-6', label: 'Ages 4–6', subtitle: 'Preschool & Kindergarten: Large elements, simple paths, 1-15 dots', icon: '🐣' },
    { id: '7-9', label: 'Ages 7–9', subtitle: 'Early Elementary: Moderate mazes, diagonals, 1-35 dots, 6x6 sudoku', icon: '🚀' },
    { id: '10+', label: 'Ages 10+', subtitle: 'Tweens & Logic: Dense labyrinths, 8-way word finds, 9x9 sudoku', icon: '🧠' },
  ];

  const themes: { id: BookTheme; label: string; icon: string; color: string }[] = [
    { id: 'animals', label: 'Cute Animals', icon: '🐶', color: 'from-amber-400 to-orange-500' },
    { id: 'space', label: 'Space Galaxy', icon: '🚀', color: 'from-blue-600 to-indigo-800' },
    { id: 'dinosaurs', label: 'Dinosaur Era', icon: '🦖', color: 'from-emerald-500 to-teal-700' },
    { id: 'fantasy', label: 'Magic & Fantasy', icon: '🦄', color: 'from-fuchsia-500 to-pink-600' },
    { id: 'underwater', label: 'Ocean Quest', icon: '🐬', color: 'from-cyan-500 to-blue-600' },
    { id: 'jungle', label: 'Wild Jungle', icon: '🐒', color: 'from-lime-500 to-green-700' },
  ];

  const handleDistributionChange = (key: keyof BookConfig['activityDistribution'], value: number) => {
    onChange({
      activityDistribution: {
        ...config.activityDistribution,
        [key]: value,
      },
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            <Wand2 className="w-3.5 h-3.5" />
            <span>KDP Activity Book Wizard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
            Create an Amazon Best-Seller in Seconds
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            Configure age level, themes, and activities. The engine automatically generates 100% solvable, unique puzzles calibrated for print-on-demand standards.
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-15 pointer-events-none text-9xl">
          📚
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Configuration Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Age Selection */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">1. Select Target Age Group</h2>
                <p className="text-xs text-slate-500">Automatically adjusts grid density, vocabulary, and puzzle difficulty.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {ageOptions.map((opt) => {
                const isSelected = config.ageGroup === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      const defaultAuthor = getDefaultAuthorForAge(opt.id);
                      const isDefaultAuthor =
                        !config.authorName ||
                        config.authorName === 'Toshith Charish' ||
                        config.authorName === 'Maanvith Charish' ||
                        config.authorName === 'Chaitanya Bandaru' ||
                        config.authorName === 'Kunta Publications';
                      onChange({
                        ageGroup: opt.id,
                        ...(isDefaultAuthor ? { authorName: defaultAuthor.fullName } : {}),
                      });
                    }}
                    className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-600/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-3xl">{opt.icon}</span>
                        {isSelected && (
                          <span className="p-1 rounded-full bg-indigo-600 text-white">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="block font-black text-slate-900 text-base sm:text-lg">{opt.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-medium">{opt.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Theme Selection */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">2. Select Book Theme</h2>
              <p className="text-xs text-slate-500 font-medium">Curates puzzle vocabulary, illustrations, and cover artwork.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {themes.map((th) => {
                const isSelected = config.theme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => onChange({ theme: th.id })}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center space-x-3.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-600/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white shadow-2xs'
                    }`}
                  >
                    <span className="text-3xl shrink-0">{th.icon}</span>
                    <div className="min-w-0">
                      <span className="block font-black text-slate-900 text-sm truncate">{th.label}</span>
                      <span className="text-[11px] text-slate-500 font-semibold capitalize">{th.id}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Book Metadata (Title, Subtitle, Author) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">3. Book Titles &amp; Branding</h2>
              <p className="text-xs text-slate-500">These will appear on your front cover, title page, and KDP metadata.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Book Main Title</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => onChange({ title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  placeholder="e.g. Super Fun Activity Book for Kids"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subtitle (Amazon SEO Boosted)</label>
                <input
                  type="text"
                  value={config.subtitle}
                  onChange={(e) => onChange({ subtitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. 100+ Awesome Mazes, Word Searches &amp; Coloring Activities"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Author / Pen Name</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Assigned for Ages {config.ageGroup}: <strong className="text-indigo-600 font-bold">{getDefaultAuthorForAge(config.ageGroup).fullName}</strong>
                  </span>
                </label>
                <input
                  type="text"
                  value={config.authorName}
                  onChange={(e) => onChange({ authorName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                  placeholder="e.g. Toshith Charish"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Select:</span>
                  {[
                    { name: 'Toshith Charish', age: 'Ages 4-6' },
                    { name: 'Maanvith Charish', age: 'Ages 7-9' },
                    { name: 'Chaitanya Bandaru', age: 'Ages 10+' },
                    { name: 'Kunta Publications', age: 'Brand Imprint' },
                  ].map((a) => (
                    <button
                      key={a.name}
                      type="button"
                      onClick={() => onChange({ authorName: a.name })}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-all cursor-pointer ${
                        config.authorName === a.name
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {a.name} <span className="opacity-70 text-[10px]">({a.age})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Explorer / Child's Name (Optional Personalization)</span>
                  <span className="text-[11px] text-indigo-600 font-normal">Prints on "This Book Belongs To" page</span>
                </label>
                <input
                  type="text"
                  value={config.childName || ''}
                  onChange={(e) => onChange({ childName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="e.g. Leo, Maya (or leave blank to write by hand with pencil)"
                />
              </div>
            </div>
          </div>

          {/* 4. Activity Mix Sliders */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">4. Activity Mix Distribution</h2>
                <p className="text-xs text-slate-500">Customize the proportion of each puzzle type.</p>
              </div>
              <Sliders className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-4">
              {[
                { key: 'maze', label: '🌀 Mazes', val: config.activityDistribution.maze, color: 'bg-indigo-500' },
                { key: 'wordsearch', label: '🔍 Word Searches', val: config.activityDistribution.wordsearch, color: 'bg-blue-500' },
                { key: 'dottodot', label: '🔢 Dot-to-Dot', val: config.activityDistribution.dottodot, color: 'bg-emerald-500' },
                { key: 'coloring', label: '🖍️ Coloring Pages', val: config.activityDistribution.coloring, color: 'bg-pink-500' },
                { key: 'sudoku', label: '🧩 Kids Sudoku', val: config.activityDistribution.sudoku, color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.key} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.val}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={item.val}
                    onChange={(e) => handleDistributionChange(item.key as any, parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: KDP Specifics & Action Box */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
            <h2 className="text-base font-bold text-slate-900">KDP Print Settings</h2>

            {/* Page Count Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Total Interior Pages
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { count: 24, label: '24 Pages', sub: 'Standard' },
                  { count: 40, label: '40 Pages', sub: 'Popular' },
                  { count: 60, label: '60 Pages', sub: 'Jumbo' },
                  { count: 80, label: '80 Pages', sub: 'Mega' },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => onChange({ pageCount: item.count })}
                    className={`py-3 px-3 rounded-xl text-center border-2 transition-all cursor-pointer ${
                      config.pageCount === item.count
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-xs ring-2 ring-indigo-600/20'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="font-black text-sm text-slate-900">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{item.sub}</div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Amazon minimum is 24 pages for paperback.</p>
            </div>

            {/* Single Sided Toggle */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Single-Sided Activity Pages</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.singleSided}
                    onChange={(e) => onChange({ singleSided: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Inserts a blank doodle backing page behind each puzzle to prevent ink bleed-through from markers.
              </p>
            </div>

            {/* KDP Standard Checklist */}
            <div className="space-y-2.5 border-t border-slate-100 pt-4">
              <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Standard 8.5" x 11" Trim Size</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>0.5" Safe Gutter Margins</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>0.125" Standard Bleed Compliance</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-600 font-medium">
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Auto-Appended Answer Keys</span>
              </div>
            </div>

            {/* Main CTA */}
            <button
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full py-4 px-6 rounded-2xl text-white font-black text-base bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Generating Activities &amp; Verifying QC...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate Full Activity Book</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
