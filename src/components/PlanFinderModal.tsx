import React, { useState, useMemo } from 'react';
import { PASS_PLANS, PassPlan } from '../core/monetization/passStorage';
import {
  Compass,
  Check,
  Lock,
  X,
  Sparkles,
} from 'lucide-react';

interface PlanFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: PassPlan) => void;
  onViewDetails: (planId: string) => void;
}

export const PlanFinderModal: React.FC<PlanFinderModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  onViewDetails,
}) => {
  const [selectedNeed, setSelectedNeed] = useState<'weekend' | 'holiday' | 'print' | 'annual'>('weekend');
  const [selectedMedium, setSelectedMedium] = useState<'tablet' | 'paper' | 'both'>('tablet');

  // Compute guided recommendation
  const recommendedPlan = useMemo(() => {
    if (selectedMedium === 'both') {
      return PASS_PLANS.find((p) => p.id === 'phygital_bundle') || PASS_PLANS[1];
    }
    if (selectedMedium === 'paper' || selectedNeed === 'print') {
      return PASS_PLANS.find((p) => p.id === 'sunday_print_club') || PASS_PLANS[1];
    }
    if (selectedNeed === 'annual') {
      return PASS_PLANS.find((p) => p.id === 'annual') || PASS_PLANS[1];
    }
    if (selectedNeed === 'holiday') {
      return PASS_PLANS.find((p) => p.id === 'holiday') || PASS_PLANS[1];
    }
    return PASS_PLANS.find((p) => p.id === 'weekend') || PASS_PLANS[1];
  }, [selectedNeed, selectedMedium]);

  const recommendationRationale = useMemo(() => {
    switch (recommendedPlan.id) {
      case 'weekend':
        return 'Best low-cost impulse spend for road trips and weekend outings. 48 hours of all-theme puzzles with zero recurring fees.';
      case 'holiday':
        return 'Ideal for vacation breaks, Diwali, or Dussehra. 14 full days of cognitive growth across all 6 activity themes.';
      case 'sunday_print_club':
        return 'Pure zero-screen routine. A fresh 25-page curated PDF delivered straight to WhatsApp every Sunday morning at 8 AM.';
      case 'phygital_bundle':
        return 'Best of both worlds: 30 days of digital tablet play on trips + instant 25-page printable PDF for kitchen table pencil practice.';
      case 'annual':
        return 'Ultimate value at just ₹2.20/day. 365 days of full brain gym access with simultaneous support for up to 2 siblings.';
      default:
        return 'Tailored for your child’s cognitive development and screen-time balance.';
    }
  }, [recommendedPlan.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
      {/* Click backdrop to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl border-2 border-amber-300 shadow-2xl overflow-hidden z-10 my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-indigo-50 border-b border-amber-200/80 p-5 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 font-heading">
                  Need Help Choosing? 10-Second Plan Finder
                </h3>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Interactive
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Answer 2 quick questions to get the exact pass tailored for your child’s routine.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Question 1: Immediate Need */}
            <div className="lg:col-span-4 space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                Immediate Requirement:
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'weekend', label: '🚗 Weekend Outing / Road Trip', sub: '₹49 • 48-Hour access' },
                  { id: 'holiday', label: '🏖️ Vacation / School Break', sub: '₹149 • 14 Days all themes' },
                  { id: 'print', label: '🖨️ Zero-Screen Paper Worksheets', sub: '₹199 • Weekly WhatsApp delivery' },
                  { id: 'annual', label: '🌟 Year-Round Daily Growth', sub: '₹799 • 365 Days + Sibling access' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedNeed(opt.id as any)}
                    className={`text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                      selectedNeed === opt.id
                        ? 'border-amber-500 bg-amber-50 font-bold text-amber-950 ring-1 ring-amber-400'
                        : 'border-slate-200 bg-white/70 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="leading-snug">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{opt.sub}</div>
                    </div>
                    {selectedNeed === opt.id && <Check className="w-4 h-4 text-amber-600 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Learning Medium */}
            <div className="lg:col-span-3 space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                Learning Medium:
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'tablet', label: '📱 Tablet / Digital', sub: 'Interactive puzzles & sound FX' },
                  { id: 'paper', label: '📄 Physical Paper', sub: 'Pencil practice & fine motor skills' },
                  { id: 'both', label: '⚡ Both Combined', sub: 'Digital on trips + desk worksheets' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedMedium(opt.id as any)}
                    className={`text-left px-3.5 py-2.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                      selectedMedium === opt.id
                        ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-950 ring-1 ring-indigo-400'
                        : 'border-slate-200 bg-white/70 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="leading-snug">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{opt.sub}</div>
                    </div>
                    {selectedMedium === opt.id && <Check className="w-4 h-4 text-indigo-600 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Dynamic Recommendation Result Card */}
            <div className="lg:col-span-5 bg-white rounded-2xl border-2 border-amber-300 p-4 sm:p-5 flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    🎯 Best Match for You
                  </span>
                  <span className="text-xs font-bold text-slate-500">{recommendedPlan.durationLabel}</span>
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-900 font-heading leading-tight">
                    {recommendedPlan.name}
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-slate-900">₹{recommendedPlan.priceInr}</span>
                    {recommendedPlan.originalPriceInr && (
                      <span className="text-xs text-slate-400 line-through">₹{recommendedPlan.originalPriceInr}</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  💡 <span className="font-bold text-slate-800">Why this fits:</span> {recommendationRationale}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectPlan(recommendedPlan)}
                  className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Get {recommendedPlan.name} (₹{recommendedPlan.priceInr})</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewDetails(recommendedPlan.id)}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                  title="Scroll to plan details below"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
