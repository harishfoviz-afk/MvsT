import React, { useState } from 'react';
import { ActivityPage, BookConfig } from '../types/book';
import { CheckCircle, AlertTriangle, RefreshCw, Eye, EyeOff, ArrowLeft, ArrowRight, Trash2, ZoomIn, ShieldCheck, Tablet } from 'lucide-react';

interface PageInspectorProps {
  pages: ActivityPage[];
  config: BookConfig;
  onUpdatePage: (pageId: string, updatedPage: ActivityPage) => void;
  onRegeneratePage: (pageId: string) => void;
  onDeletePage: (pageId: string) => void;
  onMovePage: (index: number, direction: 'left' | 'right') => void;
  onOpenKindleSimulator?: () => void;
}

export const PageInspector: React.FC<PageInspectorProps> = ({
  pages,
  onRegeneratePage,
  onDeletePage,
  onMovePage,
  onOpenKindleSimulator,
}) => {
  const [showSolutions, setShowSolutions] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(pages[0]?.id || null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const selectedPage = pages.find((p) => p.id === selectedPageId) || pages[0];
  const selectedIndex = pages.findIndex((p) => p.id === selectedPage?.id);

  const handleRegenerate = async (id: string) => {
    setRegeneratingId(id);
    await new Promise((r) => setTimeout(r, 200));
    onRegeneratePage(id);
    setRegeneratingId(null);
  };

  if (!pages || pages.length === 0) {
    return (
      <div className="max-w-5xl mx-auto py-16 px-4 text-center">
        <p className="text-slate-500">No activity pages generated yet. Go to the Book Wizard to generate a book!</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-50 text-indigo-700 p-2 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Interactive Page Inspector &amp; QC</h2>
            <p className="text-xs text-slate-500">
              Review each page, verify solvability, check answer keys, and regenerate any individual puzzle.
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowSolutions(!showSolutions)}
            className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              showSolutions
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            {showSolutions ? <EyeOff className="w-4 h-4 text-amber-700" /> : <Eye className="w-4 h-4 text-slate-500" />}
            <span>{showSolutions ? 'Hide Solutions' : 'Reveal Answer Keys'}</span>
          </button>

          {onOpenKindleSimulator && (
            <button
              onClick={onOpenKindleSimulator}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-amber-500 hover:bg-amber-600 text-white shadow-xs"
            >
              <Tablet className="w-4 h-4" />
              <span>Kindle Simulator</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Split Layout: Big Preview on Left, Page Grid on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Large Page Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            {/* Header info of selected page */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm text-slate-900">
                    Page {selectedPage.pageNumber}: {selectedPage.title}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                    {selectedPage.type}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{selectedPage.instructions}</p>
              </div>

              {/* Action Buttons for Selected Page */}
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => onMovePage(selectedIndex, 'left')}
                  disabled={selectedIndex === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  title="Move Page Earlier"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onMovePage(selectedIndex, 'right')}
                  disabled={selectedIndex === pages.length - 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  title="Move Page Later"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRegenerate(selectedPage.id)}
                  disabled={regeneratingId === selectedPage.id}
                  className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                  title="Regenerate this puzzle"
                >
                  <RefreshCw className={`w-4 h-4 ${regeneratingId === selectedPage.id ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => onDeletePage(selectedPage.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                  title="Delete Page"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quality Control Details */}
            <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2.5 ${
              selectedPage.qc.passed
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-amber-50/70 border-amber-200 text-amber-900'
            }`}>
              {selectedPage.qc.passed ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5 min-w-0">
                <div className="font-bold flex items-center space-x-2">
                  <span>QC Score: {selectedPage.qc.score}/100</span>
                  <span className="text-[11px] font-normal opacity-80">
                    • {selectedPage.qc.checks.solvable ? 'Solvable ✓' : 'Unsolvable ✗'}
                    • {selectedPage.qc.checks.ageAppropriate ? 'Age Calibrated ✓' : 'Difficulty Mismatch'}
                  </span>
                </div>
                <div className="text-[11px] opacity-90">{selectedPage.qc.messages.join(' ')}</div>
              </div>
            </div>

            {/* 8.5" x 11" Paper Canvas Preview */}
            <div className="bg-slate-100 p-4 rounded-xl flex items-center justify-center">
              <div className="w-full max-w-[460px] aspect-kdp-interior bg-white shadow-lg rounded-sm border border-slate-300 p-6 flex flex-col justify-between relative overflow-hidden">
                {/* Print Margins Guide */}
                <div className="border border-dashed border-slate-200 w-full h-full p-4 flex flex-col justify-between">
                  {/* Top Header inside page */}
                  <div className="text-center border-b border-slate-200 pb-2">
                    <h3 className="font-extrabold text-sm text-slate-900">{selectedPage.title}</h3>
                    <p className="text-[10px] text-slate-500">{selectedPage.instructions}</p>
                  </div>

                  {/* SVG Canvas Render */}
                  <div
                    className="w-full my-auto flex items-center justify-center"
                    dangerouslySetInnerHTML={{
                      __html: showSolutions && selectedPage.solutionSvgContent
                        ? selectedPage.solutionSvgContent
                        : selectedPage.svgContent || '',
                    }}
                  />

                  {/* Page Footer */}
                  <div className="text-center text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-1">
                    Page {selectedPage.pageNumber}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Grid of all pages (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">All Interior Puzzles ({pages.length})</h3>
            <span className="text-xs text-slate-500">Click a thumbnail to inspect</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3 max-h-[720px] overflow-y-auto pr-1">
            {pages.map((p, idx) => {
              const isSelected = p.id === selectedPage.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPageId(p.id)}
                  className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer bg-white group flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-600/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-800">P. {p.pageNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-indigo-50 text-indigo-700 uppercase tracking-wide">
                      {p.type}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      p.qc.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {p.qc.passed ? 'QC ✓' : 'QC !'}
                    </span>
                  </div>

                  {/* Thumbnail Mini-Preview */}
                  <div className="w-full aspect-square bg-slate-50 border border-slate-100 rounded-lg overflow-hidden p-1 flex items-center justify-center">
                    <div
                      className="w-full h-full scale-[0.92] pointer-events-none"
                      dangerouslySetInnerHTML={{
                        __html: showSolutions && p.solutionSvgContent ? p.solutionSvgContent : p.svgContent || '',
                      }}
                    />
                  </div>

                  <div className="mt-2 text-xs font-black text-slate-800 truncate" title={p.title}>
                    {p.title}
                  </div>

                  {/* Reroll single button */}
                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="capitalize font-semibold">{p.difficulty}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegenerate(p.id);
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer px-1.5 py-0.5 rounded-md hover:bg-indigo-50 transition-colors"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${regeneratingId === p.id ? 'animate-spin' : ''}`} />
                      <span>Reroll</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
