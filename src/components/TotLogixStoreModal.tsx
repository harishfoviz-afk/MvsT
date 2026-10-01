import React, { useState, useMemo } from 'react';
import {
  PASS_PLANS,
  PassPlan,
  PassState,
  loadPassState,
  formatRemainingPassTime,
  TransactionRecord,
} from '../core/monetization/passStorage';
import { RazorpayModal } from './RazorpayModal';
import {
  X,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Zap,
  Star,
  Award,
  Calendar,
  Layers,
  ArrowRight,
  Printer,
} from 'lucide-react';

interface TotLogixStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPassPurchased?: (updatedPass: PassState) => void;
  initialSelectedTier?: string;
}

export const TotLogixStoreModal: React.FC<TotLogixStoreModalProps> = ({
  isOpen,
  onClose,
  onPassPurchased,
  initialSelectedTier,
}) => {
  const [passState, setPassState] = useState<PassState>(() => loadPassState());
  const [selectedPlan, setSelectedPlan] = useState<PassPlan | null>(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [lastTx, setLastTx] = useState<TransactionRecord | null>(null);

  // Parental Gate Challenge (random multiplication problem)
  const mathChallenge = useMemo(() => {
    const a = Math.floor(Math.random() * 4) + 6; // 6 to 9
    const b = Math.floor(Math.random() * 5) + 4; // 4 to 8
    return { a, b, answer: a * b };
  }, [isOpen]);

  const [parentInput, setParentInput] = useState('');
  const [isParentUnlocked, setIsParentUnlocked] = useState(false);
  const [gateError, setGateError] = useState(false);

  if (!isOpen) return null;

  const handleVerifyParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(parentInput.trim(), 10) === mathChallenge.answer) {
      setIsParentUnlocked(true);
      setGateError(false);
    } else {
      setGateError(true);
      setParentInput('');
    }
  };

  const handleSelectPlan = (plan: PassPlan) => {
    setSelectedPlan(plan);
    setShowRazorpay(true);
  };

  const handlePaymentSuccess = (tx: TransactionRecord) => {
    setShowRazorpay(false);
    setLastTx(tx);
    const updated = loadPassState();
    setPassState(updated);
    if (onPassPurchased) onPassPurchased(updated);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm font-sans animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-300/40 flex flex-col max-h-[94vh]">
          {/* Top Modal Header */}
          <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 text-white p-5 sm:p-6 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
                💎
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight font-heading">
                    TotLogix Pass Store
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-amber-950 shadow-xs">
                    ₹ INR Pricing
                  </span>
                </div>
                <p className="text-xs text-indigo-100 font-medium mt-0.5">
                  Unlock unlimited cognitive challenges, puzzle themes, and printable packs
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              title="Close Store"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Parental Gate Step (if not yet solved) */}
          {!isParentUnlocked ? (
            <div className="p-8 sm:p-12 text-center space-y-6 max-w-md mx-auto my-auto">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
                🔒
              </div>
              <div className="space-y-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-700 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
                  Grown-Ups Only
                </span>
                <h3 className="text-xl font-black text-slate-900 font-heading">
                  Parental Gate Verification
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Please answer this quick question to enter the TotLogix Pass Store and manage purchases:
                </p>
              </div>

              <form onSubmit={handleVerifyParent} className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200">
                  <span className="text-base font-black text-slate-800 tracking-wider">
                    What is {mathChallenge.a} × {mathChallenge.b} ?
                  </span>
                </div>

                <div>
                  <input
                    type="number"
                    autoFocus
                    value={parentInput}
                    onChange={(e) => setParentInput(e.target.value)}
                    placeholder="Enter answer"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-slate-300 text-center font-black text-lg focus:outline-hidden focus:border-indigo-600"
                  />
                  {gateError && (
                    <p className="text-xs font-bold text-rose-600 mt-2">
                      Incorrect answer. Please try again.
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 rounded-2xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                  >
                    Continue to Store →
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Main Store Content (Parent verified) */
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/60">
              {/* Active Pass Banner */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                    🛡️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                        Current Status
                      </span>
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {passState.activePassName}
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
                      {passState.expiresAt ? (
                        <>
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>{formatRemainingPassTime(passState.expiresAt)}</span>
                        </>
                      ) : (
                        <span>Animals Theme Unlocked • First 3 Puzzles Free on all books</span>
                      )}
                    </div>
                  </div>
                </div>

                {lastTx && (
                  <div className="text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Payment verified! Ref: {lastTx.paymentId.slice(0, 10)}...</span>
                  </div>
                )}
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PASS_PLANS.filter((p) => p.id !== 'free').map((plan) => {
                  const isCurrent = passState.activeTier === plan.id;
                  const isFeatured = plan.id === 'annual';

                  return (
                    <div
                      key={plan.id}
                      className={`relative bg-white rounded-3xl p-5 border-2 transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                        isFeatured
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {plan.badge && (
                        <div className="absolute -top-3 left-5">
                          <span
                            className={`text-[10px] font-black px-3 py-1 rounded-full shadow-xs uppercase tracking-wider ${
                              isFeatured
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                : 'bg-amber-400 text-amber-950'
                            }`}
                          >
                            {plan.badge}
                          </span>
                        </div>
                      )}

                      <div className="space-y-3 pt-2">
                        <div>
                          <h4 className="text-base font-black text-slate-900 font-heading">
                            {plan.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
                            {plan.tagline}
                          </p>
                        </div>

                        {/* Price Tag */}
                        <div className="flex items-baseline gap-2 py-1">
                          <span className="text-2xl font-black text-slate-900 font-heading">
                            ₹{plan.priceInr}
                          </span>
                          {plan.originalPriceInr && (
                            <span className="text-xs text-slate-400 line-through font-bold">
                              ₹{plan.originalPriceInr}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 font-bold ml-auto bg-slate-100 px-2 py-0.5 rounded-lg">
                            {plan.durationLabel}
                          </span>
                        </div>

                        {/* Features List */}
                        <ul className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-600">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 font-medium leading-tight">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* CTA Button */}
                      <div className="pt-5 mt-4 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleSelectPlan(plan)}
                          className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                            isCurrent
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isFeatured
                              ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 text-white shadow-sm hover:shadow-md'
                              : 'bg-slate-900 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Pass Active (Extend)</span>
                            </>
                          ) : (
                            <>
                              <span>Unlock with Razorpay</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Safety & Compliance Guarantee Note */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900 flex items-center gap-3">
                <div className="text-xl">🛡️</div>
                <div className="space-y-0.5">
                  <p className="font-extrabold">100% Parent Friendly &amp; Transparent</p>
                  <p className="text-[11px] text-indigo-700 font-medium">
                    Zero ads, zero dark patterns, no hidden in-app coin traps. Tested securely via Razorpay sandbox.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Razorpay Test Modal */}
      <RazorpayModal
        isOpen={showRazorpay}
        plan={selectedPlan}
        onClose={() => setShowRazorpay(false)}
        onPaymentComplete={handlePaymentSuccess}
      />
    </>
  );
};
