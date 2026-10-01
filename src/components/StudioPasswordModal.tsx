import React, { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, ShieldAlert, KeyRound, X, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StudioPasswordModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
}

const REQUIRED_PASSWORD = 'KUNTA';

export const StudioPasswordModal: React.FC<StudioPasswordModalProps> = ({
  isOpen,
  onSuccess,
  onClose,
}) => {
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setErrorMessage(null);
      setIsSuccess(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = password.trim().toUpperCase();

    if (clean === REQUIRED_PASSWORD) {
      setIsSuccess(true);
      setErrorMessage(null);
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        onSuccess();
      }, 450);
    } else {
      setErrorMessage('⚠️ Incorrect password. Hint: "KUNTA"');
      setPassword('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-4 border-indigo-500 relative flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Lock Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all ${
            isSuccess
              ? 'bg-emerald-500 scale-110'
              : errorMessage
              ? 'bg-red-500 animate-shake'
              : 'bg-gradient-to-tr from-indigo-600 to-purple-600'
          }`}
        >
          {isSuccess ? (
            <Unlock className="w-8 h-8 animate-bounce" />
          ) : (
            <Lock className="w-8 h-8" />
          )}
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-heading">
            Publisher Studio Gate
          </h2>
          <p className="text-xs text-slate-500">
            Enter the publisher password to access book creation &amp; KDP export:
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3.5">
          <div className="space-y-1">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter password..."
                autoComplete="off"
                className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-2xl text-center text-lg font-black tracking-widest uppercase transition-all focus:outline-none ${
                  errorMessage
                    ? 'border-red-400 bg-red-50/50 text-red-900 focus:border-red-500'
                    : 'border-slate-200 text-slate-900 focus:border-indigo-600 focus:bg-white'
                }`}
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {errorMessage && (
              <div className="text-xs font-bold text-red-600 flex items-center justify-center gap-1 animate-in fade-in">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Stay in Kids Club
            </button>

            <button
              type="submit"
              className={`py-3 px-4 rounded-xl font-black text-xs text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                isSuccess
                  ? 'bg-emerald-600'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
              }`}
            >
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Unlocked!</span>
                </>
              ) : (
                <span>Open Studio</span>
              )}
            </button>
          </div>
        </form>

        <div className="text-[10px] text-slate-400 font-medium">
          🔒 Protected by Kunta Publications Imprint Security
        </div>
      </div>
    </div>
  );
};
