import React, { useState, useMemo } from 'react';
import { BookProject } from '../types/book';
import { exportInteriorPDF, exportCoverPDF, exportKindleCoverJpg, downloadBlob } from '../core/assembly/pdfExport';
import { generateCoverWrapSVG, generateFrontCoverSVG } from '../core/cover/coverGenerator';
import { generateKdpMarketing, exportMarketingBundleAsText } from '../core/marketing/kdpMarketing';
import {
  Download,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  FileCheck,
  Layers,
  BookCheck,
  Tablet,
  Calculator,
  Coins,
  TrendingUp,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Tag,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  User,
  ListFilter,
  CheckSquare,
  FileText,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  calculatePaperbackPricing,
  calculateEbookPricing,
  KDP_CURRENCIES,
  MarketplaceCurrency,
} from '../core/pricing/kdpPricing';

interface ExportModalProps {
  project: BookProject;
  onOpenKindleSimulator?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, onOpenKindleSimulator }) => {
  const [isExportingInterior, setIsExportingInterior] = useState(false);
  const [isExportingKindleCover, setIsExportingKindleCover] = useState(false);
  const [isExportingCover, setIsExportingCover] = useState(false);
  const [exportProgress, setExportProgress] = useState<{ msg: string; percent: number }>({
    msg: '',
    percent: 0,
  });

  const [selectedCurrency, setSelectedCurrency] = useState<MarketplaceCurrency>('USD');
  const [paperbackPrice, setPaperbackPrice] = useState<number>(7.99);
  const [ebookPrice, setEbookPrice] = useState<number>(2.99);

  // KDP Publishing Assistant State
  const [selectedAuthor, setSelectedAuthor] = useState<string>(project.config.authorName);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeStepTab, setActiveStepTab] = useState<'all' | 'step1' | 'step2' | 'step3'>('all');
  const [showHtmlCode, setShowHtmlCode] = useState(false);

  const metadata = useMemo(() => {
    return generateKdpMarketing({
      ...project,
      config: {
        ...project.config,
        authorName: selectedAuthor,
      },
    });
  }, [project, selectedAuthor]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const actualInteriorPages = project.pages.length * (project.config.singleSided ? 2 : 1) + 6;

  const handleCurrencyChange = (newCurrency: MarketplaceCurrency) => {
    setSelectedCurrency(newCurrency);
    setPaperbackPrice(KDP_CURRENCIES[newCurrency].defaultPaperbackPrice);
    setEbookPrice(KDP_CURRENCIES[newCurrency].defaultEbookPrice);
  };

  const curr = KDP_CURRENCIES[selectedCurrency];
  const pbPricing = calculatePaperbackPricing(actualInteriorPages, paperbackPrice, selectedCurrency);
  const ebPricing = calculateEbookPricing(ebookPrice, selectedCurrency);

  const handleExportInterior = async () => {
    setIsExportingInterior(true);
    setExportProgress({ msg: 'Starting PDF engine...', percent: 5 });

    try {
      const pdfBytes = await exportInteriorPDF(project, (msg, percent) => {
        setExportProgress({ msg, percent });
      });

      downloadBlob(
        pdfBytes,
        `${project.config.title.replace(/\s+/g, '_')}_Interior_8.5x11_KDP.pdf`
      );

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Error generating interior PDF:', err);
      alert('Failed to generate interior PDF. Please check console for details.');
    } finally {
      setIsExportingInterior(false);
    }
  };

  const handleExportKindleCover = async () => {
    setIsExportingKindleCover(true);
    try {
      const frontSvg = generateFrontCoverSVG(project);
      const jpgBytes = await exportKindleCoverJpg(project, frontSvg, 2550, 3300, 0.95);
      downloadBlob(
        jpgBytes,
        `${project.config.title.replace(/\s+/g, '_')}_Kindle_Cover_2550x3300.jpg`,
        'image/jpeg'
      );
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Error generating Kindle eBook cover:', err);
      alert('Failed to generate Kindle eBook cover JPEG. Please check console for details.');
    } finally {
      setIsExportingKindleCover(false);
    }
  };

  const handleExportCover = async () => {
    setIsExportingCover(true);
    try {
      const coverSvg = generateCoverWrapSVG(project);
      const pdfBytes = await exportCoverPDF(project, coverSvg);
      downloadBlob(
        pdfBytes,
        `${project.config.title.replace(/\s+/g, '_')}_Cover_FullWrap_KDP.pdf`
      );
    } catch (err) {
      console.error('Error generating cover PDF:', err);
      alert('Failed to generate cover PDF. Please check console for details.');
    } finally {
      setIsExportingCover(false);
    }
  };

  const handleExportMetadata = () => {
    const txt = exportMarketingBundleAsText(metadata);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.config.title.replace(/\s+/g, '_')}_KDP_Publishing_Metadata.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">KDP Export Center</h2>
            <p className="text-xs text-slate-500">
              Download your print-ready Amazon KDP assets: 8.5"x11" interior PDF, full-wrap cover PDF, and SEO metadata.
            </p>
          </div>
        </div>

        {onOpenKindleSimulator && (
          <button
            onClick={onOpenKindleSimulator}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer hover:scale-105"
          >
            <Tablet className="w-4 h-4" />
            <span>Review in Kindle App Simulator</span>
          </button>
        )}
      </div>

      {/* Progress bar if actively exporting */}
      {isExportingInterior && (
        <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-md space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
            <span className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
              <span>{exportProgress.msg}</span>
            </span>
            <span>{exportProgress.percent}%</span>
          </div>
          <div className="w-full h-3 bg-indigo-50 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 rounded-full"
              style={{ width: `${exportProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* 3 Core Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Interior PDF */}
        <div className="bg-white rounded-2xl p-6 border-2 border-indigo-100 hover:border-indigo-300 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <h3 className="font-extrabold text-slate-900 text-base">Interior PDF (Manuscript)</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  Upload to Amazon "Upload manuscript"
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {actualInteriorPages} pages • 8.5" x 11" • Vector 300 DPI • Answer keys included.
              </p>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Title, Belongs-To, &amp; Guide pages</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{project.pages.length} activity pages + anti-bleed backs</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Compact Solutions section</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Completion Certificate</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleExportInterior}
            disabled={isExportingInterior}
            className="w-full py-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
          >
            {isExportingInterior ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Rendering Interior...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Interior PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Cover Assets */}
        <div className="bg-white rounded-2xl p-6 border-2 border-purple-100 hover:border-purple-300 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <h3 className="font-extrabold text-slate-900 text-base">Book Covers (Kindle &amp; Print)</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  KDP Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Front cover JPG for Kindle eBook + Full-wrap PDF with spine &amp; bleed for Paperback.
              </p>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>Kindle JPG:</strong> 2550 × 3300 px (passes Amazon &gt;1000px rule)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span><strong>Paperback PDF:</strong> Spine width calculated for {actualInteriorPages} pages</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Barcode reserved safe zone &amp; 0.125" bleed</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleExportKindleCover}
              disabled={isExportingKindleCover}
              className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-amber-950 bg-amber-400 hover:bg-amber-500 shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              title="Upload to Amazon KDP 'Upload a cover you already have (JPG/TIFF only)'"
            >
              {isExportingKindleCover ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Rendering Kindle JPG...</span>
                </>
              ) : (
                <>
                  <Tablet className="w-4 h-4" />
                  <span>Download Kindle Cover (JPG)</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportCover}
              disabled={isExportingCover}
              className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              title="Upload to Amazon KDP Paperback 'Book Cover' (PDF only)"
            >
              {isExportingCover ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Rendering Full-Wrap PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Paperback Cover (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Marketing Metadata */}
        <div className="bg-white rounded-2xl p-6 border-2 border-emerald-100 hover:border-emerald-300 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <h3 className="font-extrabold text-slate-900 text-base">Listing Metadata (.txt)</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Copy to Amazon "Book Details"
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Everything ready to copy-paste directly into your KDP book details tab.
              </p>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1">
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>7 KDP Backend Search Term Boxes</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>HTML Formatted Product Description</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Amazon Category &amp; Age paths</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleExportMetadata}
            className="w-full py-3 rounded-xl font-bold text-xs text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Metadata (.txt)</span>
          </button>
        </div>
      </div>

      {/* 🚀 OFFICIAL AMAZON KDP 1-CLICK PUBLISHING FORM ASSISTANT 🚀 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-200 shadow-sm space-y-6">
        {/* Assistant Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-amber-200 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 font-heading">
                  Amazon KDP 1-Click Publishing Form Assistant
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                  Dashboard Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact values formatted for Amazon KDP Kindle eBook &amp; Paperback setup. Click any <strong>Copy</strong> button to paste directly into your publishing tabs!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const fullText = exportMarketingBundleAsText(metadata);
                handleCopy(fullText, 'copy-all-bundle');
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:scale-102"
              title="Copy all 3 pages of metadata formatted as text"
            >
              {copiedKey === 'copy-all-bundle' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === 'copy-all-bundle' ? 'Copied Entire KDP Guide!' : 'Copy Entire KDP Guide'}</span>
            </button>

            <button
              onClick={handleExportMetadata}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Download metadata as .txt file"
            >
              <Download className="w-4 h-4" />
              <span>.txt File</span>
            </button>
          </div>
        </div>

        {/* 3 Step Navigation Tabs (Mirroring KDP's 3-step publishing tabs) */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          {[
            { id: 'all', label: 'All 3 Pages (Scroll View)', icon: Layers },
            { id: 'step1', label: 'Page 1: Book & Author Details', icon: User },
            { id: 'step2', label: 'Page 2: Audience, Description & Categories', icon: ListFilter },
            { id: 'step3', label: 'Page 3: Upload & Pre-Order', icon: CheckSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveStepTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeStepTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ======================================================== */}
        {/* STEP 1: [KDP] Edit Details (Title, Subtitle & Author) */}
        {/* ======================================================== */}
        {(activeStepTab === 'all' || activeStepTab === 'step1') && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-50/40 via-white to-sky-50/40 border-2 border-indigo-100 space-y-5">
            <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Amazon KDP Page 1: Kindle eBook / Paperback Details
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Language, Titles, Series, and Primary Author by Age Group
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                Ages {project.config.ageGroup} Edition
              </span>
            </div>

            {/* Author Quick Selector Bar */}
            <div className="p-3.5 rounded-xl bg-white border border-indigo-200/80 shadow-2xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Primary Author Assignment (Current Age: Ages {project.config.ageGroup}):</span>
                </span>
                <span className="text-[11px] text-slate-500">
                  Click any chip to switch active author:
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { name: 'Toshith Charish', age: 'Ages 4-6', desc: 'Preschool & Kindergarten' },
                  { name: 'Maanvith Charish', age: 'Ages 7-9', desc: 'Early Elementary' },
                  { name: 'Chaitanya Bandaru', age: 'Age 10+', desc: 'Middle Grade & Logic' },
                ].map((auth) => {
                  const isSelected = selectedAuthor === auth.name;
                  return (
                    <button
                      key={auth.name}
                      type="button"
                      onClick={() => setSelectedAuthor(auth.name)}
                      className={`p-2.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-indigo-300 bg-white'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-black text-slate-900">{auth.name}</div>
                        <div className="text-[10px] text-slate-500">{auth.desc}</div>
                      </div>
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {auth.age}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Fields Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Language */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">1. Language</span>
                  <span className="text-sm font-bold text-slate-900">English</span>
                </div>
                <button
                  onClick={() => handleCopy('English', 'lang')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'lang' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'lang' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* 2. Series */}
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">4. Series Title (Optional)</span>
                  <span className="text-sm font-bold text-slate-900">{metadata.seriesTitle}</span>
                </div>
                <button
                  onClick={() => handleCopy(metadata.seriesTitle, 'series')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'series' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'series' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              {/* 3. Book Title */}
              <div className="md:col-span-2 p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div className="min-w-0 pr-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">2. Book Title</span>
                  <span className="text-sm font-bold text-slate-900 truncate block">{metadata.title}</span>
                </div>
                <button
                  onClick={() => handleCopy(metadata.title, 'title')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedKey === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'title' ? 'Copied Title' : 'Copy Title'}</span>
                </button>
              </div>

              {/* 4. Subtitle */}
              <div className="md:col-span-2 p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div className="min-w-0 pr-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">3. Subtitle (Optional)</span>
                  <span className="text-xs font-medium text-slate-700 truncate block">{metadata.subtitle}</span>
                </div>
                <button
                  onClick={() => handleCopy(metadata.subtitle, 'subtitle')}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedKey === 'subtitle' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'subtitle' ? 'Copied Subtitle' : 'Copy Subtitle'}</span>
                </button>
              </div>

              {/* 5. Author First Name & Last Name (Separate boxes matching KDP!) */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border-2 border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider">
                    6. Primary Author: First Name
                  </span>
                  <button
                    onClick={() => handleCopy(metadata.authorDetails.firstName, 'auth-first')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'auth-first' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'auth-first' ? 'Copied' : 'Copy First'}</span>
                  </button>
                </div>
                <div className="text-base font-black text-slate-900">
                  {metadata.authorDetails.firstName}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border-2 border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider">
                    6. Primary Author: Last Name
                  </span>
                  <button
                    onClick={() => handleCopy(metadata.authorDetails.lastName, 'auth-last')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'auth-last' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'auth-last' ? 'Copied' : 'Copy Last'}</span>
                  </button>
                </div>
                <div className="text-base font-black text-slate-900">
                  {metadata.authorDetails.lastName}
                </div>
              </div>

              {/* 6. Contributors */}
              <div className="md:col-span-2 p-3.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">7. Contributors (Optional)</span>
                  <span className="text-xs font-bold text-slate-800">
                    Role: <span className="text-indigo-600 font-black">Publisher</span> • First Name: <strong>Kunta</strong> • Last Name: <strong>Publications</strong>
                  </span>
                </div>
                <button
                  onClick={() => handleCopy('Kunta Publications', 'contrib')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'contrib' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'contrib' ? 'Copied' : 'Copy Publisher'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: Description, Rights, Audience, Categories & Keywords */}
        {/* ======================================================== */}
        {(activeStepTab === 'all' || activeStepTab === 'step2') && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-purple-50/40 via-white to-pink-50/40 border-2 border-purple-100 space-y-6">
            <div className="flex items-center justify-between border-b border-purple-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-purple-600 text-white font-black text-xs flex items-center justify-center">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Amazon KDP Page 2: Description, Categories &amp; Keywords
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    HTML Description, 3 Category Placements, and 7 Backend Keyword Boxes
                  </p>
                </div>
              </div>
            </div>

            {/* 1. Amazon HTML Product Description */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    8. Product Description
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                    {metadata.htmlDescription.length} / 4,000 chars (KDP Compliant ✓)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHtmlCode(!showHtmlCode)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                  >
                    {showHtmlCode ? 'Show Formatted Preview' : 'Show Raw HTML Code'}
                  </button>

                  <button
                    onClick={() => handleCopy(metadata.htmlDescription, 'html-code')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    {copiedKey === 'html-code' ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'html-code' ? 'Copied HTML!' : 'Copy HTML Code'}</span>
                  </button>

                  <button
                    onClick={() => handleCopy(metadata.plainDescription, 'plain-desc')}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === 'plain-desc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'plain-desc' ? 'Copied Text!' : 'Copy Plain Text'}</span>
                  </button>
                </div>
              </div>

              {showHtmlCode ? (
                <textarea
                  readOnly
                  value={metadata.htmlDescription}
                  className="w-full h-44 p-3.5 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs border border-slate-800 focus:outline-none"
                />
              ) : (
                <div className="p-4 rounded-xl bg-white border border-slate-200 max-h-52 overflow-y-auto text-xs text-slate-700 space-y-2 leading-relaxed shadow-2xs">
                  <div dangerouslySetInnerHTML={{ __html: metadata.htmlDescription }} />
                </div>
              )}
            </div>

            {/* 2. Publishing Rights & Audience & Marketplace */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">9. Publishing Rights</span>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>I own copyright &amp; rights</span>
                </div>
                <button
                  onClick={() => handleCopy(metadata.publishingRights, 'rights')}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors pt-1 block cursor-pointer"
                >
                  {copiedKey === 'rights' ? '✓ Copied statement' : 'Copy confirmation'}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">10. Explicit Content</span>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Select: <strong>"No"</strong></span>
                </div>
                <p className="text-[10px] text-slate-400">Child-friendly educational book</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">11. Primary Marketplace</span>
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>{metadata.primaryMarketplace}</span>
                  <button
                    onClick={() => handleCopy(metadata.primaryMarketplace, 'mkt')}
                    className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                  >
                    {copiedKey === 'mkt' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">Global Amazon network distribution</p>
              </div>
            </div>

            {/* 3. Reading Age Range */}
            <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 space-y-2">
              <span className="text-xs font-extrabold text-sky-950 flex items-center gap-1.5">
                <span>Reading Age Selection in KDP:</span>
                <span className="text-[10px] font-normal text-sky-700">(Select in the Minimum &amp; Maximum dropdowns)</span>
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-sky-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Minimum Age</span>
                    <span className="text-sm font-black text-slate-900">{metadata.primaryAudience.minimumAge}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(metadata.primaryAudience.minimumAge, 'min-age')}
                    className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded text-xs font-bold cursor-pointer"
                  >
                    {copiedKey === 'min-age' ? '✓' : 'Copy'}
                  </button>
                </div>

                <div className="bg-white p-3 rounded-lg border border-sky-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Maximum Age</span>
                    <span className="text-sm font-black text-slate-900">{metadata.primaryAudience.maximumAge}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(metadata.primaryAudience.maximumAge, 'max-age')}
                    className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded text-xs font-bold cursor-pointer"
                  >
                    {copiedKey === 'max-age' ? '✓' : 'Copy'}
                  </button>
                </div>

                <div className="bg-white p-3 rounded-lg border border-sky-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Grade Level Range</span>
                  <span className="text-xs font-bold text-slate-900 block mt-0.5">{metadata.primaryAudience.gradeRange}</span>
                </div>
              </div>
            </div>

            {/* 4. EXACT AMAZON CATEGORY SELECTION GUIDE (Matching user's modal screenshot!) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border-2 border-amber-300 space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                    ★
                  </span>
                  <div>
                    <h5 className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide">
                      12. Amazon KDP Category Selection Guide (Up to 3 Placements)
                    </h5>
                    <p className="text-[11px] text-amber-800">
                      In the Amazon Categories Modal (shown in your screenshot), click <strong>"Add another category"</strong> until you have checked all 3 placements:
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                  3 of 3 Recommended
                </span>
              </div>

              <div className="space-y-2.5">
                {metadata.categoryGuides.map((cg, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-white border border-amber-200/90 shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-black text-[11px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-black text-slate-900">
                          {cg.placement}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(cg.fullPath, `cat-${idx}`)}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === `cat-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === `cat-${idx}` ? 'Copied Path' : 'Copy Path'}</span>
                      </button>
                    </div>

                    <div className="text-[11px] font-mono text-indigo-700 bg-indigo-50/50 p-1.5 rounded-md border border-indigo-100">
                      {cg.fullPath}
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      👉 <strong>Step-by-Step Selection:</strong> {cg.stepInstruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. 7 Amazon Backend Search Term Boxes */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                    13. 7 Amazon Backend Search Term Boxes (Keywords)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Copy each line into one of the 7 keyword fields in your KDP dashboard (all under 50 chars).
                  </p>
                </div>
                <button
                  onClick={() => {
                    const allKw = metadata.backendKeywords.join('\n');
                    handleCopy(allKw, 'copy-all-kw');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'copy-all-kw' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'copy-all-kw' ? 'Copied All 7 Lines!' : 'Copy All 7 Lines'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {metadata.backendKeywords.map((kw, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">
                        <span>Keyword Box {i + 1}</span>
                        <span className={kw.length > 50 ? 'text-rose-600 font-black' : 'text-slate-500'}>
                          {kw.length}/50 chars
                        </span>
                      </div>
                      <div className="text-xs font-mono font-bold text-slate-800 truncate">
                        {kw}
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(kw, `kw-box-${i}`)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-all cursor-pointer shrink-0"
                      title="Copy keyword"
                    >
                      {copiedKey === `kw-box-${i}` ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: Content, Pre-Order & Pricing Checklist */}
        {/* ======================================================== */}
        {(activeStepTab === 'all' || activeStepTab === 'step3') && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/40 border-2 border-emerald-100 space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                    Amazon KDP Page 3: Content, Pre-Order &amp; Pricing Checklist
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    PDF Files, Release Setting, and Recommended Sale Prices
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">14. Pre-Order</span>
                <span className="font-bold text-slate-900 block">I am ready to release my book now</span>
                <span className="text-[10px] text-slate-400">Published in 72 hours</span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">15. Interior Manuscript</span>
                <span className="font-bold text-indigo-700 block truncate">{project.config.title.replace(/\s+/g, '_')}_Interior.pdf</span>
                <button onClick={handleExportInterior} className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer">
                  Download Interior PDF
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">16. Full-Wrap Cover</span>
                <span className="font-bold text-purple-700 block truncate">{project.config.title.replace(/\s+/g, '_')}_Cover.pdf</span>
                <button onClick={handleExportCover} className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer">
                  Download Cover PDF
                </button>
              </div>

              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">17. Suggested Retail</span>
                <span className="font-bold text-emerald-700 block">{curr.symbol}{selectedCurrency === 'INR' ? pbPricing.listPrice.toFixed(0) : pbPricing.listPrice.toFixed(2)} Paperback</span>
                <span className="text-[10px] text-emerald-600 font-bold">+{curr.symbol}{pbPricing.authorRoyalty.toFixed(2)} Net Author Profit</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 💰 AMAZON KDP PRICING & TENTATIVE BOOK SALE COST CALCULATOR 💰 */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 shadow-sm space-y-6">
        {/* Header with Title and Currency Selector */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-200 shrink-0">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  Tentative Book Sale Cost &amp; Amazon Royalty Estimator
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Official KDP Formulas
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate your exact Amazon print cost, minimum list price, and net author profit for this {actualInteriorPages}-page edition.
              </p>
            </div>
          </div>

          {/* Currency Toggle */}
          <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            {(['USD', 'GBP', 'EUR', 'INR'] as MarketplaceCurrency[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCurrencyChange(c)}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-extrabold ${
                  selectedCurrency === c
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{KDP_CURRENCIES[c].symbol} {c}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amazon.in Marketplace Callout for INR */}
        {selectedCurrency === 'INR' && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
            <span className="text-xl shrink-0">🇮🇳</span>
            <div className="space-y-0.5">
              <span className="font-extrabold block">Amazon India (Amazon.in) Marketplace &amp; Royalties:</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Indian authors receive direct INR bank deposits via EFT. KDP fulfills paperback orders in India through Amazon Global / International POD distribution (calculated from the standard base print cost ~₹85/$1 rate), while Kindle eBooks on Amazon.in support native INR pricing with the full 70% royalty tier (₹99–₹449).
              </p>
            </div>
          </div>
        )}

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. KDP Print Cost */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              KDP Print-On-Demand Cost
            </span>
            <div className="text-2xl font-black text-slate-900">
              {curr.symbol}{pbPricing.printingCost.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-500">
              {curr.symbol}{curr.fixedCost.toFixed(2)} fixed + ({actualInteriorPages}p × {curr.symbol}{curr.perPageCost.toFixed(selectedCurrency === 'INR' ? 2 : 3)})
            </p>
          </div>

          {/* 2. Minimum Allowed Price */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Minimum List Price
            </span>
            <div className="text-2xl font-black text-slate-700">
              {curr.symbol}{pbPricing.minListPrice.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-500">
              Amazon 60% break-even floor
            </p>
          </div>

          {/* 3. Your Sale Price */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-1">
            <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
              Recommended Retail Price
            </span>
            <div className="text-2xl font-black text-indigo-950">
              {curr.symbol}{selectedCurrency === 'INR' ? pbPricing.listPrice.toFixed(0) : pbPricing.listPrice.toFixed(2)}
            </div>
            <p className="text-[11px] text-indigo-600 font-semibold">
              Top market sweet spot
            </p>
          </div>

          {/* 4. Your Net Author Royalty */}
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 space-y-1 shadow-xs">
            <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
              <span>Your Net Royalty</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 font-black">
                {pbPricing.profitMarginPercent.toFixed(1)}% margin
              </span>
            </span>
            <div className="text-2xl font-black text-emerald-700">
              +{curr.symbol}{pbPricing.authorRoyalty.toFixed(2)}
            </div>
            <p className="text-[11px] text-emerald-700 font-bold">
              Pure profit into your bank / sale
            </p>
          </div>
        </div>

        {/* Interactive Pricing Controls & Presets */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-800">
              Choose or Adjust Your Tentative Offering Price:
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Custom Price ({curr.symbol}):</span>
              <input
                type="number"
                step={selectedCurrency === 'INR' ? "10" : "0.10"}
                min={pbPricing.minListPrice}
                max={selectedCurrency === 'INR' ? 4999 : 29.99}
                value={paperbackPrice}
                onChange={(e) => setPaperbackPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-24 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 text-right focus:outline-indigo-500 shadow-2xs"
              />
            </div>
          </div>

          {/* Quick Price Preset Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {curr.recommendedTiers.map((tier) => {
              const isSelected = Math.abs(paperbackPrice - tier.price) < 0.01;
              return (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => setPaperbackPrice(tier.price)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-102 font-black'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <div className="text-xs font-extrabold">
                    {curr.symbol}{selectedCurrency === 'INR' ? tier.price.toFixed(0) : tier.price.toFixed(2)}
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100 font-bold' : 'text-slate-500'}`}>
                    {tier.label}
                  </div>
                  {tier.badge && (
                    <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                      isSelected ? 'bg-white text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {tier.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Waterfall Royalty Breakdown & eBook Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Waterfall Profit Breakdown */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>Where Every Dollar Goes (Paperback @ {curr.symbol}{pbPricing.listPrice.toFixed(2)})</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-800 font-bold pb-1 border-b border-slate-100">
                <span>Customer Pays:</span>
                <span>{curr.symbol}{pbPricing.listPrice.toFixed(2)} (100%)</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pl-2">
                <span>Amazon Distribution Cut (40%):</span>
                <span className="text-rose-600 font-semibold">-{curr.symbol}{pbPricing.amazonFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 pl-2">
                <span>Print-On-Demand Manufacturing ({actualInteriorPages}p):</span>
                <span className="text-rose-600 font-semibold">-{curr.symbol}{pbPricing.printingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center font-black text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                <span>Your Net Author Royalty:</span>
                <span className="text-sm">+{curr.symbol}{pbPricing.authorRoyalty.toFixed(2)} ({pbPricing.profitMarginPercent.toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          {/* Kindle eBook Offering & Side-by-Side Advantage */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/60 border border-indigo-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                <Tablet className="w-4 h-4 text-indigo-600" />
                <span>Kindle eBook Companion Offering</span>
              </h4>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                70% Royalty Tier
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              When published alongside your paperback, your Kindle interactive edition has <strong>zero print cost</strong>:
            </p>

            <div className="space-y-1.5 text-xs bg-white/80 p-3 rounded-xl border border-indigo-100">
              <div className="flex justify-between items-center text-slate-800 font-bold">
                <span>Suggested eBook Price:</span>
                <span>{curr.symbol}{ebPricing.listPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Print-On-Demand Cost:</span>
                <span className="text-emerald-600 font-bold">$0.00 (Instant Delivery)</span>
              </div>
              <div className="flex justify-between items-center font-black text-indigo-900 pt-1 border-t border-indigo-100">
                <span>Net Royalty per Download:</span>
                <span className="text-emerald-700">+{curr.symbol}{ebPricing.authorRoyalty.toFixed(2)} (70%)</span>
              </div>
            </div>

            <div className="text-[11px] text-indigo-900/80 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Offering both paperback &amp; eBook captures both print lovers and iPad/Kindle readers!</span>
            </div>
          </div>
        </div>

        {/* Monthly Projection Table */}
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 justify-center sm:justify-start">
              <TrendingUp className="w-4 h-4" />
              <span>Projected Author Earnings (at {curr.symbol}{pbPricing.authorRoyalty.toFixed(2)}/book):</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Based on realistic passive monthly volume on Amazon KDP
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 text-center w-full sm:w-auto">
            <div className="bg-white/10 px-3 py-1.5 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold">25 sales</div>
              <div className="text-xs font-black text-emerald-300 mt-0.5">
                {curr.symbol}{(pbPricing.authorRoyalty * 25).toFixed(0)}
              </div>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold">100 sales</div>
              <div className="text-xs font-black text-emerald-300 mt-0.5">
                {curr.symbol}{(pbPricing.authorRoyalty * 100).toFixed(0)}
              </div>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl">
              <div className="text-[10px] text-slate-400 font-bold">250 sales</div>
              <div className="text-xs font-black text-emerald-300 mt-0.5">
                {curr.symbol}{(pbPricing.authorRoyalty * 250).toFixed(0)}
              </div>
            </div>
            <div className="bg-emerald-500/20 border border-emerald-400/40 px-3 py-1.5 rounded-xl">
              <div className="text-[10px] text-emerald-300 font-bold">500 sales</div>
              <div className="text-xs font-black text-emerald-300 mt-0.5">
                {curr.symbol}{(pbPricing.authorRoyalty * 500).toFixed(0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Amazon KDP Upload Guide */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Recommended Settings for Amazon KDP Paperback Setup</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Print Option</span>
            <span className="font-bold text-slate-800 block mt-1">Black &amp; white interior</span>
            <span className="text-slate-500 text-[11px]">with white paper (55#)</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Trim Size</span>
            <span className="font-bold text-slate-800 block mt-1">8.5 x 11 in (21.59 x 27.94 cm)</span>
            <span className="text-slate-500 text-[11px]">Standard kids activity size</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Bleed Settings</span>
            <span className="font-bold text-slate-800 block mt-1">Bleed (PDF-only)</span>
            <span className="text-slate-500 text-[11px]">Enables full edge margin print</span>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Cover Finish</span>
            <span className="font-bold text-slate-800 block mt-1">Glossy (Recommended)</span>
            <span className="text-slate-500 text-[11px]">Bright, durable &amp; wipeable for kids</span>
          </div>
        </div>
      </div>
    </div>
  );
};
