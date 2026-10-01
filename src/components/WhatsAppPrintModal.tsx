import React, { useState } from 'react';
import { BookRecord, BookTheme } from '../types/book';
import { exportInteriorPDF, downloadBlob } from '../core/assembly/pdfExport';
import {
  X,
  Printer,
  Smartphone,
  Share2,
  CheckCircle2,
  Download,
  Loader2,
  Sparkles,
  ExternalLink,
  MessageCircle,
} from 'lucide-react';

interface WhatsAppPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: BookRecord[];
}

export const WhatsAppPrintModal: React.FC<WhatsAppPrintModalProps> = ({
  isOpen,
  onClose,
  catalog,
}) => {
  const [selectedBookId, setSelectedBookId] = useState<string>(() => (catalog[0] ? catalog[0].id : ''));
  const [packTier, setPackTier] = useState<'single_49' | 'mega_89' | 'bundle_149'>('single_49');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [isExporting, setIsExporting] = useState(false);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentBook = catalog.find((b) => b.id === selectedBookId) || catalog[0] || null;

  const handleDownloadPdf = async () => {
    if (!currentBook) return;
    setIsExporting(true);
    try {
      const pdfBytes = await exportInteriorPDF(currentBook.project);
      downloadBlob(pdfBytes, `TotLogix_${currentBook.project.config.theme}_Printable_Pack.pdf`, 'application/pdf');
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSimulateWhatsAppDispatch = async () => {
    setIsSendingWhatsApp(true);
    setDispatchStatus(null);

    await new Promise((r) => setTimeout(r, 1200));

    setIsSendingWhatsApp(false);
    setDispatchStatus(
      `Success! 25-Page Vector Activity Pack PDF dispatched to ${phoneNumber} via TotLogix WhatsApp Cloud API webhook.`
    );
  };

  const whatsappShareText = encodeURIComponent(
    `🧠 *TotLogix Printable Brain Pack* for Kids (Ages 4–12)\n\n` +
      `Instant 25-page vectorized activity workbook with mazes, word searches & mini-sudoku!\n` +
      `Print at home or your neighborhood Xerox shop.\n\n` +
      `👉 Instant WhatsApp Delivery: ₹49 only!\n` +
      `Check it out at TotLogix Kids Hub: https://totlogix.app`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-sm font-sans animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 text-white p-5 sm:p-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              🖨️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight font-heading">
                  TotLogix Print-on-Demand Hub
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-950/40 text-emerald-200 border border-emerald-400/40">
                  WhatsApp Engine
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                Instant delivery of high-contrast, ink-friendly printable workbook PDFs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {/* Pack Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Select Printable Activity Pack
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'single_49',
                  title: 'Single Themed Pack',
                  pages: '15 Pages',
                  price: '₹49',
                  desc: 'Quick weekend brain workout',
                },
                {
                  id: 'mega_89',
                  title: 'Mega Vector Pack',
                  pages: '30 Pages',
                  price: '₹89',
                  desc: 'Comprehensive multi-puzzle book',
                },
                {
                  id: 'bundle_149',
                  title: 'Phygital Bundle',
                  pages: 'App + 25 Pg PDF',
                  price: '₹149',
                  desc: 'Digital unlock + paper workbook',
                },
              ].map((pack) => (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => setPackTier(pack.id as any)}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    packTier === pack.id
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800">{pack.title}</span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {pack.price}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[10px] font-bold text-slate-400 block">{pack.pages}</span>
                    <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                      {pack.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Book / Theme Selector */}
          {catalog.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Select Theme Source Book
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                {catalog.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.project.config.title} (Ages {b.project.config.ageGroup} • {b.project.config.theme})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* WhatsApp Direct Dispatch Simulator */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                Simulate Instant WhatsApp PDF Delivery
              </h4>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleSimulateWhatsAppDispatch}
                disabled={isSendingWhatsApp}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                {isSendingWhatsApp ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Send WhatsApp Test</span>
                  </>
                )}
              </button>
            </div>

            {dispatchStatus && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-start gap-2 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{dispatchStatus}</span>
              </div>
            )}
          </div>

          {/* Direct WhatsApp Share & Download Bar */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
            <a
              href={`https://api.whatsapp.com/send?text=${whatsappShareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-[200px] py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer text-center"
            >
              <Share2 className="w-4 h-4" />
              <span>Share WhatsApp Pitch Link</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex-1 min-w-[200px] py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Vector PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Sample Printable PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
