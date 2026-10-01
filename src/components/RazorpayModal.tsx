import React, { useState } from 'react';
import { PassPlan, activatePass, TransactionRecord } from '../core/monetization/passStorage';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  X,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Lock,
} from 'lucide-react';

interface RazorpayModalProps {
  isOpen: boolean;
  plan: PassPlan | null;
  onClose: () => void;
  onPaymentComplete: (tx: TransactionRecord) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  plan,
  onClose,
  onPaymentComplete,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [upiId, setUpiId] = useState('parent@okhdfcbank');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'other'>('gpay');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStatusText, setProcessStatusText] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !plan) return null;

  const handleSimulateSuccess = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    setProcessStatusText('Connecting to Razorpay UPI Gateway...');

    await new Promise((r) => setTimeout(r, 600));
    setProcessStatusText('Authenticating UPI intent on PhonePe / GPay...');

    await new Promise((r) => setTimeout(r, 700));
    setProcessStatusText('Payment verified! Activating TotLogix pass...');

    await new Promise((r) => setTimeout(r, 400));
    const result = activatePass(plan.id, selectedMethod);

    setIsProcessing(false);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6'],
    });

    onPaymentComplete(result.transaction);
  };

  const handleSimulateFailure = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    setProcessStatusText('Verifying payment authorization...');

    await new Promise((r) => setTimeout(r, 800));
    setIsProcessing(false);
    setErrorMsg('Payment was declined by issuing bank (Test Simulation). Please retry or choose another method.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/75 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]">
        {/* Razorpay Header */}
        <div className="bg-[#0c2340] text-white p-5 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-md">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight font-heading">Razorpay</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  Test Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">Merchant: TotLogix Kids Media</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400 font-medium">Amount to Pay</div>
            <div className="text-xl font-black text-emerald-400 tracking-tight">
              ₹{plan.priceInr.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Order Details Bar */}
        <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            <span className="font-bold text-slate-800">{plan.name}</span>
            <span className="text-slate-400 ml-1.5">({plan.durationLabel})</span>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Cancel payment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Payment Methods Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Transaction Failed</p>
                <p className="mt-0.5 text-rose-700">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Payment Method Selector Tabs */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setSelectedMethod('UPI')}
              disabled={isProcessing}
              className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                selectedMethod === 'UPI'
                  ? 'border-sky-600 bg-sky-50/80 text-sky-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Smartphone className="w-5 h-5 text-sky-600" />
              <span>UPI (Instant)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('Card')}
              disabled={isProcessing}
              className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                selectedMethod === 'Card'
                  ? 'border-sky-600 bg-sky-50/80 text-sky-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <span>Card</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('NetBanking')}
              disabled={isProcessing}
              className={`p-3 rounded-2xl border-2 font-bold text-xs flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                selectedMethod === 'NetBanking'
                  ? 'border-sky-600 bg-sky-50/80 text-sky-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-5 h-5 text-purple-600" />
              <span>NetBanking</span>
            </button>
          </div>

          {/* UPI Method Form */}
          {selectedMethod === 'UPI' && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700">
                Choose UPI App or Enter Virtual Payment Address (VPA)
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'gpay', label: 'Google Pay', icon: '🟢 GPay' },
                  { id: 'phonepe', label: 'PhonePe', icon: '🟣 PhonePe' },
                  { id: 'paytm', label: 'Paytm', icon: '🔵 Paytm' },
                  { id: 'other', label: 'BHIM / Any', icon: '🇮🇳 BHIM' },
                ].map((app) => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedUpiApp(app.id as any)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedUpiApp === app.id
                        ? 'border-sky-600 bg-white text-sky-900 shadow-xs'
                        : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {app.icon}
                  </button>
                ))}
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 block mb-1">
                  UPI ID / Mobile Number
                </span>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  disabled={isProcessing}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  placeholder="name@okhdfcbank"
                />
              </div>

              <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/60 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Zero convenience fee. Instant access unlocked after payment.</span>
              </div>
            </div>
          )}

          {/* Card Form */}
          {selectedMethod === 'Card' && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Card Number (Dummy Sandbox)</label>
                <input
                  type="text"
                  readOnly
                  value="4111 •••• •••• 1111 (Test Visa)"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Expiry</label>
                  <input
                    type="text"
                    readOnly
                    value="12 / 28"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">CVV</label>
                  <input
                    type="password"
                    readOnly
                    value="123"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono text-slate-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* NetBanking Form */}
          {selectedMethod === 'NetBanking' && (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-700">Select Bank</label>
              <div className="grid grid-cols-2 gap-2">
                {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBank(b)}
                    className={`py-2 px-3 text-left rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedBank === b
                        ? 'border-sky-600 bg-white text-sky-900 shadow-xs'
                        : 'border-slate-200 bg-white/60 text-slate-600 hover:bg-white'
                    }`}
                  >
                    🏦 {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-center space-y-2 animate-pulse">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-sky-600" />
              <p className="text-xs font-bold">{processStatusText}</p>
              <p className="text-[10px] text-sky-700">Please do not close or refresh this window...</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
          <button
            type="button"
            onClick={handleSimulateSuccess}
            disabled={isProcessing}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>Pay ₹{plan.priceInr.toFixed(2)} • Simulate Success</span>
          </button>

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleSimulateFailure}
              disabled={isProcessing}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline transition-colors cursor-pointer py-1"
            >
              Simulate Failure (Test Error Handling)
            </button>

            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-Bit SSL Encrypted
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
