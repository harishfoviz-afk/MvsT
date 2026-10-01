import React, { useState } from 'react';
import { BookProject } from '../types/book';
import { auditBookForAmazonKdp, KdpBookAuditResult } from '../core/audit/kdpRankEngine';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Sparkles,
  Layers,
  Search,
  BookOpen,
  ChevronRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

interface KdpAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: BookProject | null;
  sku?: string;
}

export const KdpAuditModal: React.FC<KdpAuditModalProps> = ({
  isOpen,
  onClose,
  project,
  sku,
}) => {
  if (!isOpen || !project) return null;

  const audit: KdpBookAuditResult = auditBookForAmazonKdp(project);
  const [selectedPillarKey, setSelectedPillarKey] = useState<string>('all');

  const pillarList = [
    { key: 'uniqueness', data: audit.pillars.uniqueness, icon: Sparkles },
    { key: 'kdpPrintCompliance', data: audit.pillars.kdpPrintCompliance, icon: Layers },
    { key: 'ageCalibration', data: audit.pillars.ageCalibration, icon: BookOpen },
    { key: 'gamificationValue', data: audit.pillars.gamificationValue, icon: Award },
    { key: 'amazonSeoReadiness', data: audit.pillars.amazonSeoReadiness, icon: Search },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Amazon KDP Quality &amp; Bestseller Audit</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 font-heading">
                <span>{project.config.title}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                SKU: <span className="font-mono text-indigo-200 font-bold">{sku || 'CURRENT-PROJECT'}</span> • Ages {project.config.ageGroup} • {project.config.pageCount} Pages
              </p>
            </div>

            {/* Big Rank Badge */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15">
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-black text-amber-300 leading-none">
                  {audit.totalScore}<span className="text-sm text-slate-300 font-normal">/100</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wide">
                  Grade {audit.grade}
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-slate-950 shadow-md">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className="mt-4 flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{audit.readinessVerdict}</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* 5 Pillars Quick Score Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {pillarList.map((p) => {
              const Icon = p.icon;
              const isSelected = selectedPillarKey === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => setSelectedPillarKey(selectedPillarKey === p.key ? 'all' : p.key)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <Icon className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-extrabold text-slate-900 font-mono">
                      {p.data.score}/{p.data.maxScore}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 line-clamp-1 leading-tight">
                    {p.data.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    {p.data.status === 'passed' ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Pass
                      </span>
                    ) : (
                      <span className="text-amber-600 font-semibold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Note
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Pillars Detailed Item Checklists */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600" />
                <span>Publishing Readiness Breakdown</span>
              </h3>
              {selectedPillarKey !== 'all' && (
                <button
                  onClick={() => setSelectedPillarKey('all')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  Show All Pillars
                </button>
              )}
            </div>

            <div className="space-y-3">
              {pillarList
                .filter((p) => selectedPillarKey === 'all' || selectedPillarKey === p.key)
                .map((pillar) => (
                  <div
                    key={pillar.key}
                    className="border border-slate-200 rounded-2xl p-4 bg-white shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                          <pillar.icon className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{pillar.data.name}</h4>
                          <p className="text-xs text-slate-500">{pillar.data.summary}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {pillar.data.score} / {pillar.data.maxScore} pts
                      </span>
                    </div>

                    <div className="space-y-2">
                      {pillar.data.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 text-xs p-2 rounded-xl bg-slate-50/60"
                        >
                          {item.passed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <span className="font-bold text-slate-800 mr-1">{item.label}:</span>
                            <span className="text-slate-600">{item.detail}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Recommendations Card */}
          {audit.recommendations.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-amber-700" />
                <span>Actionable Recommendations Before Upload</span>
              </h4>
              <ul className="space-y-1.5">
                {audit.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-xs text-amber-800 flex items-start gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Engine calibrated against official <strong>Amazon KDP Publishing &amp; A9 Algorithm Standards</strong>.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer shadow-xs"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
