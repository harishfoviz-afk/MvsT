import React, { useState } from 'react';
import { BookOpen, CheckCircle, Sparkles, Download, Layers, ShieldCheck, Bot, Tablet, Library, Gamepad2, Award, ExternalLink, Lock } from 'lucide-react';
import { BookProject } from '../types/book';
import { calculateSpineWidth } from '../core/assembly/kdpSpecs';
import { auditBookForAmazonKdp } from '../core/audit/kdpRankEngine';
import { KdpAuditModal } from './KdpAuditModal';

interface HeaderProps {
  project: BookProject | null;
  activeTab: 'setup' | 'pages' | 'cover' | 'kindle' | 'marketing' | 'export' | 'catalog';
  setActiveTab: (tab: 'setup' | 'pages' | 'cover' | 'kindle' | 'marketing' | 'export' | 'catalog') => void;
  onQuickExport: () => void;
  currentRoute: 'studio' | 'kids';
  onSwitchRoute: (route: 'studio' | 'kids') => void;
  onLockStudio?: () => void;
  catalogCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  activeTab,
  setActiveTab,
  onQuickExport,
  currentRoute,
  onSwitchRoute,
  onLockStudio,
  catalogCount,
}) => {
  const [showAuditModal, setShowAuditModal] = useState(false);
  const actualPages = project
    ? project.pages.length * (project.config.singleSided ? 2 : 1) + 6
    : 0;
  const spineInches = project ? calculateSpineWidth(actualPages) : '0.00';
  const qcPassedCount = project ? project.pages.filter((p) => p.qc.passed).length : 0;
  const qcRate = project && project.pages.length > 0 ? Math.round((qcPassedCount / project.pages.length) * 100) : 100;
  const audit = project ? auditBookForAmazonKdp(project) : null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2 py-3">
        {/* Row 1: Brand & Studio Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-xl text-slate-900 tracking-tight font-heading">
                  Kids KDP Activity Studio
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> KDP Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Auto-generate 8.5"x11" Amazon KDP paperback books with QC &amp; Amazon SEO
              </p>
            </div>
          </div>

          {/* Mode Switcher & Export CTA */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200/70 shadow-2xs">
              <a
                href="#/"
                className="px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1 cursor-pointer"
                title="TotLogix Landing Page"
              >
                <span>🏠 Home</span>
              </a>
              <button
                onClick={() => onSwitchRoute('studio')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentRoute === 'studio'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👑 Publisher Studio</span>
              </button>
              <button
                onClick={() => onSwitchRoute('kids')}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentRoute === 'kids'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Switch to TotLogix Kids Hub"
              >
                <Gamepad2 className="w-4 h-4" />
                <span>TotLogix Kids Hub</span>
              </button>
              <a
                href="#/play"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-white transition-all cursor-pointer"
                title="Open TotLogix Kids Hub in a New Tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {onLockStudio && (
                <button
                  onClick={onLockStudio}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-white transition-all cursor-pointer"
                  title="Lock Publisher Studio (Requires KUNTA password to re-enter)"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={onQuickExport}
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
              title="Export interior manuscript PDF, full-wrap cover PDF, and KDP SEO files"
            >
              <Download className="w-4 h-4 mr-1.5" />
              <span>Export KDP Files</span>
            </button>
          </div>
        </div>

        {/* Row 2: Expanded Project Status Bar */}
        {project ? (
          <div className="w-full bg-slate-50/90 border border-slate-200/80 rounded-2xl px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 font-bold text-slate-700">
              <div className="flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span><strong className="text-slate-900">{actualPages}</strong> Interior Pages</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span><strong className="text-slate-900">{project.pages.length}</strong> Puzzles</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center space-x-1.5">
                <CheckCircle className={`w-4 h-4 ${qcRate === 100 ? 'text-emerald-500' : 'text-amber-500'}`} />
                <span><strong className="text-slate-900">{qcRate}%</strong> QC Pass</span>
              </div>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-500">Spine:</span>
                <span className="font-mono font-extrabold text-slate-900">{spineInches}"</span>
              </div>
            </div>

            {audit && (
              <button
                onClick={() => setShowAuditModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-black border border-emerald-300 transition-all cursor-pointer shadow-2xs hover:scale-105"
                title="Click to view full Amazon KDP Quality & Bestseller Audit Report"
              >
                <Award className="w-4 h-4 text-amber-600" />
                <span>Rank: {audit.totalScore}% ({audit.grade})</span>
              </button>
            )}
          </div>
        ) : (
          <div className="w-full bg-gradient-to-r from-amber-50/90 via-indigo-50/70 to-purple-50/90 border border-amber-200/80 rounded-2xl px-4 py-2 flex items-center justify-between gap-3 text-xs sm:text-sm shadow-2xs">
            <div className="flex items-center space-x-2 font-bold text-amber-900">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Configure Target Age, Theme &amp; Page Count below, then click <strong>"Generate Full Activity Book"</strong> to create your book!</span>
            </div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden md:inline">
              Step 1 of 7
            </span>
          </div>
        )}

        {/* Row 3: Expanded, Readable Navigation Tabs (7-block grid layout) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          {[
            { id: 'setup', step: '1', label: 'Book Wizard', icon: Sparkles },
            { id: 'pages', step: '2', label: 'Page Inspector', icon: BookOpen, badge: project ? `${project.pages.length}` : undefined },
            { id: 'cover', step: '3', label: 'AI Cover', icon: Bot },
            { id: 'kindle', step: '4', label: 'Kindle Simulator', icon: Tablet, badge: 'Live' },
            { id: 'marketing', step: '5', label: 'Amazon SEO', icon: CheckCircle },
            { id: 'export', step: '6', label: 'KDP Export', icon: Download },
            { id: 'catalog', step: '7', label: 'Book Catalog', icon: Library, badge: `${catalogCount}` },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-500/30'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 text-slate-700 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      #{tab.step}
                    </span>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  </div>
                  {tab.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black leading-none ${
                      isActive ? 'bg-white/25 text-white' : 'bg-indigo-50 text-indigo-700 border border-indigo-200/60'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs sm:text-sm font-extrabold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amazon KDP Quality & Bestseller Audit Modal */}
      <KdpAuditModal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        project={project}
      />
    </header>
  );
};
