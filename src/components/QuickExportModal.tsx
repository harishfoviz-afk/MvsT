import React, { useState } from 'react';
import { BookProject } from '../types/book';
import { exportInteriorPDF, exportCoverPDF, exportKindleCoverJpg, downloadBlob } from '../core/assembly/pdfExport';
import { generateCoverWrapSVG, generateFrontCoverSVG } from '../core/cover/coverGenerator';
import { generateKdpMarketing, exportMarketingBundleAsText } from '../core/marketing/kdpMarketing';
import confetti from 'canvas-confetti';
import {
  X,
  Download,
  BookCheck,
  Layers,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Tablet,
  Image as ImageIcon,
} from 'lucide-react';

interface QuickExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: BookProject | null;
  onGoToSetup: () => void;
  onGoToAdvancedExport: () => void;
}

export const QuickExportModal: React.FC<QuickExportModalProps> = ({
  isOpen,
  onClose,
  project,
  onGoToSetup,
  onGoToAdvancedExport,
}) => {
  const [isExportingInterior, setIsExportingInterior] = useState(false);
  const [isExportingKindleCover, setIsExportingKindleCover] = useState(false);
  const [isExportingCover, setIsExportingCover] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [downloadedItems, setDownloadedItems] = useState<{
    interior: boolean;
    kindleCover: boolean;
    cover: boolean;
    metadata: boolean;
  }>({
    interior: false,
    kindleCover: false,
    cover: false,
    metadata: false,
  });
  const [progressMsg, setProgressMsg] = useState('');

  if (!isOpen) return null;

  // If no book project has been generated yet, show a helpful prompt
  if (!project) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs font-sans animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 text-center space-y-5 border border-slate-200 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-3xl shadow-inner">
            📚
          </div>
          <div className="space-y-1.5">
            <h3 className="text-xl font-black text-slate-900 font-heading">
              No Book Generated Yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              You need to generate or select an activity book before exporting print-ready Amazon KDP PDFs.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onGoToSetup();
              }}
              className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Go to Book Wizard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const actualInteriorPages = project.pages.length * (project.config.singleSided ? 2 : 1) + 6;

  const handleDownloadInterior = async () => {
    setIsExportingInterior(true);
    setProgressMsg('Rendering interior 8.5"x11" vector PDF...');
    try {
      const pdfBytes = await exportInteriorPDF(project, (msg) => setProgressMsg(msg));
      downloadBlob(
        pdfBytes,
        `${project.config.title.replace(/\s+/g, '_')}_Interior_Manuscript_8.5x11_KDP.pdf`
      );
      setDownloadedItems((prev) => ({ ...prev, interior: true }));
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Failed to export interior PDF:', err);
      alert('Error generating interior PDF. Please retry.');
    } finally {
      setIsExportingInterior(false);
      setProgressMsg('');
    }
  };

  const handleDownloadKindleCover = async () => {
    setIsExportingKindleCover(true);
    setProgressMsg('Rendering high-res Kindle eBook Cover JPEG (2550×3300 px)...');
    try {
      const frontSvg = generateFrontCoverSVG(project);
      const jpgBytes = await exportKindleCoverJpg(project, frontSvg, 2550, 3300, 0.95);
      downloadBlob(
        jpgBytes,
        `${project.config.title.replace(/\s+/g, '_')}_Kindle_Cover_2550x3300.jpg`,
        'image/jpeg'
      );
      setDownloadedItems((prev) => ({ ...prev, kindleCover: true }));
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Failed to export Kindle eBook cover:', err);
      alert('Error generating Kindle cover JPEG. Please retry.');
    } finally {
      setIsExportingKindleCover(false);
      setProgressMsg('');
    }
  };

  const handleDownloadCover = async () => {
    setIsExportingCover(true);
    setProgressMsg('Generating full-wrap cover PDF with spine & bleed...');
    try {
      const coverSvg = generateCoverWrapSVG(project);
      const pdfBytes = await exportCoverPDF(project, coverSvg);
      downloadBlob(
        pdfBytes,
        `${project.config.title.replace(/\s+/g, '_')}_Cover_FullWrap_KDP.pdf`
      );
      setDownloadedItems((prev) => ({ ...prev, cover: true }));
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Failed to export cover PDF:', err);
      alert('Error generating cover PDF. Please retry.');
    } finally {
      setIsExportingCover(false);
      setProgressMsg('');
    }
  };

  const handleDownloadMetadata = () => {
    const metadata = generateKdpMarketing(project);
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
    setDownloadedItems((prev) => ({ ...prev, metadata: true }));
  };

  const handleDownloadAll = async () => {
    setIsExportingAll(true);
    try {
      // 1. Metadata
      handleDownloadMetadata();
      await new Promise((r) => setTimeout(r, 600));

      // 2. Interior PDF
      await handleDownloadInterior();
      await new Promise((r) => setTimeout(r, 800));

      // 3. Kindle eBook Cover JPG
      await handleDownloadKindleCover();
      await new Promise((r) => setTimeout(r, 800));

      // 4. Paperback Full-Wrap PDF
      await handleDownloadCover();

      confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
    } catch (err) {
      console.error('Error in batch export:', err);
    } finally {
      setIsExportingAll(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 text-white p-5 sm:p-6 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              📥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight font-heading">
                  Export Amazon KDP Files
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-400 text-emerald-950">
                  Ready to Download
                </span>
              </div>
              <p className="text-xs text-indigo-100 font-medium mt-0.5">
                {project.config.title} • {actualInteriorPages} Pages • Ages {project.config.ageGroup}
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 bg-slate-50/50">
          {/* Amazon KDP Mapping Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
            <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
              <span>💡 Amazon KDP File Destination Guide:</span>
            </div>
            <p className="text-amber-800 font-medium leading-relaxed">
              • <strong>Manuscript:</strong> Upload the <strong>Interior PDF</strong> under Amazon KDP's <strong>"Upload manuscript"</strong>.<br />
              • <strong>Kindle eBook Cover:</strong> Amazon requires <strong>JPG/TIFF only</strong> (min 1000px height). Upload our <strong>Kindle Front Cover (.jpg)</strong>.<br />
              • <strong>Paperback Cover:</strong> Amazon requires a <strong>PDF</strong>. Upload our <strong>Paperback Full-Wrap Cover (.pdf)</strong>.
            </p>
          </div>

          {/* Active Progress Alert */}
          {(isExportingInterior || isExportingKindleCover || isExportingCover || isExportingAll) && (
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900 flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
              <span>{progressMsg || 'Rendering print-ready assets...'}</span>
            </div>
          )}

          {/* 4 Core Download Assets */}
          <div className="space-y-3">
            {/* 1. Manuscript / Interior PDF */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-indigo-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <BookCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">1. Interior PDF (Manuscript)</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      👈 Upload to "Upload manuscript"
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {actualInteriorPages} pages • 8.5" × 11" standard paperback trim • 300 DPI vector lines
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadInterior}
                disabled={isExportingInterior || isExportingAll}
                className={`px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  downloadedItems.interior
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {downloadedItems.interior ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Downloaded ✓</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Manuscript</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. Kindle eBook Front Cover (JPG) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-amber-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Tablet className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h4 className="text-sm font-black text-slate-900">2. Kindle eBook Front Cover (.jpg)</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                      👈 Upload to Kindle "Upload your cover file"
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    <strong>2550 × 3300 px</strong> high-res JPG • Meets Amazon &gt;1000px height rule • Front art only
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadKindleCover}
                disabled={isExportingKindleCover || isExportingAll}
                className={`px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  downloadedItems.kindleCover
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {downloadedItems.kindleCover ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Downloaded ✓</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Kindle JPG</span>
                  </>
                )}
              </button>
            </div>

            {/* 3. Paperback Full-Wrap Cover PDF */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-purple-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h4 className="text-sm font-black text-slate-900">3. Paperback Full-Wrap Cover (.pdf)</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                      👈 Upload to Paperback "Book Cover"
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Back cover + calculated spine width + front cover with 0.125" standard KDP bleed
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadCover}
                disabled={isExportingCover || isExportingAll}
                className={`px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  downloadedItems.cover
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {downloadedItems.cover ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Downloaded ✓</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Wrap PDF</span>
                  </>
                )}
              </button>
            </div>

            {/* 4. KDP Publishing Metadata (.txt) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">4. KDP Metadata &amp; 7 Keywords</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      👈 Copy into KDP Details
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    7 high-ranking backend search term boxes, Amazon HTML description, &amp; BISAC categories
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadMetadata}
                className={`px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  downloadedItems.metadata
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                {downloadedItems.metadata ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Downloaded ✓</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Text</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Master 1-Click Download All Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleDownloadAll}
              disabled={isExportingInterior || isExportingKindleCover || isExportingCover || isExportingAll}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
            >
              {isExportingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Batch Exporting All 4 KDP Assets...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>📦 Download All KDP Files (1-Click Batch: Interior, Kindle JPG, Paperback PDF, SEO)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              onClose();
              onGoToAdvancedExport();
            }}
            className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Open Advanced KDP Publishing Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
