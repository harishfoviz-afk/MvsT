import React, { useState } from 'react';
import { BookProject, BookTheme } from '../types/book';
import { calculateCoverDimensions } from '../core/assembly/kdpSpecs';
import {
  COVER_THEMES,
  generateCoverWrapSVG,
  generateFrontCoverSVG,
  generateBookSummaryForAi,
  generateAiCoverPrompts,
} from '../core/cover/coverGenerator';
import { exportCoverPDF, exportKindleCoverJpg, downloadBlob } from '../core/assembly/pdfExport';
import {
  Sparkles,
  Copy,
  Check,
  Download,
  FileText,
  Sliders,
  Ruler,
  Layers,
  Palette,
  ExternalLink,
  Bot,
  Wand2,
  UploadCloud,
  Image as ImageIcon,
  RotateCcw,
  ShieldCheck,
  Tag,
  Tablet,
} from 'lucide-react';
import { KUNTA_LOGO_PNG_PATH } from '../core/assets/publisherLogo';

interface CoverStudioProps {
  project: BookProject;
  onUpdateCover: (cover: BookProject['cover']) => void;
}

export const CoverStudio: React.FC<CoverStudioProps> = ({ project, onUpdateCover }) => {
  const [activeSubTab, setActiveSubTab] = useState<'prompts' | 'upload' | 'specs' | 'preview'>('upload');
  const [previewMode, setPreviewMode] = useState<'2d' | 'front' | '3d'>('2d');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingKindle, setIsExportingKindle] = useState(false);
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string | null>(null);
  const [selectedAiEngine, setSelectedAiEngine] = useState<'gemini' | 'chatgpt'>('gemini');

  const { data: summaryData, textSummary } = generateBookSummaryForAi(project);
  const aiPrompts = generateAiCoverPrompts(project);
  const coverSvg = generateCoverWrapSVG(project);
  const frontCoverSvg = generateFrontCoverSVG(project);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, mode: 'front' | 'full') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (mode === 'front') {
        onUpdateCover({
          ...project.cover,
          coverMode: 'uploaded-front',
          uploadedFrontCoverUrl: dataUrl,
        });
        setUploadStatusMsg('✓ Front Cover Art uploaded! Spine and Back Cover have been auto-wrapped.');
      } else {
        onUpdateCover({
          ...project.cover,
          coverMode: 'uploaded-full',
          uploadedFullWrapUrl: dataUrl,
        });
        setUploadStatusMsg('✓ Full-Wrap Spread uploaded! Ready for KDP PDF generation.');
      }
      setTimeout(() => setUploadStatusMsg(null), 5000);
    };
    reader.readAsDataURL(file);
  };

  const handleResetCover = () => {
    onUpdateCover({
      ...project.cover,
      coverMode: 'template',
      uploadedFrontCoverUrl: undefined,
      uploadedFullWrapUrl: undefined,
    });
    setUploadStatusMsg('Cover reset to default template.');
    setTimeout(() => setUploadStatusMsg(null), 3000);
  };

  const handleDownloadCover = async () => {
    setIsExporting(true);
    try {
      const pdfBytes = await exportCoverPDF(project, coverSvg);
      downloadBlob(pdfBytes, `${project.config.title.replace(/\s+/g, '_')}_KDP_Paperback_Cover_FullWrap.pdf`);
    } catch (err) {
      console.error('Failed to export cover:', err);
      alert('Error exporting cover. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadKindleCover = async () => {
    setIsExportingKindle(true);
    try {
      const frontSvg = generateFrontCoverSVG(project);
      const jpgBytes = await exportKindleCoverJpg(project, frontSvg, 2550, 3300, 0.95);
      downloadBlob(
        jpgBytes,
        `${project.config.title.replace(/\s+/g, '_')}_Kindle_Cover_2550x3300.jpg`,
        'image/jpeg'
      );
    } catch (err) {
      console.error('Failed to export Kindle eBook cover:', err);
      alert('Error generating Kindle cover JPEG. Please retry.');
    } finally {
      setIsExportingKindle(false);
    }
  };

  const themes: BookTheme[] = ['space', 'dinosaurs', 'animals', 'fantasy', 'underwater', 'jungle'];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white p-2.5 rounded-xl shadow-sm">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-900">AI Cover Generator &amp; Upload Studio</h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                Google Gemini • ChatGPT • Direct AI Art
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Copy AI prompts to generate your artwork, then upload your front cover or full wrap for instant 3D preview and print-ready PDF export.
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('upload')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'upload' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
            <span>Upload AI Cover</span>
          </button>
          <button
            onClick={() => setActiveSubTab('prompts')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'prompts' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Prompts &amp; Summary</span>
          </button>
          <button
            onClick={() => setActiveSubTab('specs')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'specs' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 text-indigo-600" />
            <span>KDP Canvas Specs</span>
          </button>
          <button
            onClick={() => setActiveSubTab('preview')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'preview' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-indigo-600" />
            <span>Preview &amp; Mockup</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 0: UPLOAD AI COVER (DIRECT USER WORKFLOW)                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'upload' && (
        <div className="space-y-8">
          {uploadStatusMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs">
              <span>{uploadStatusMsg}</span>
              <button
                onClick={() => setUploadStatusMsg(null)}
                className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Current Cover Status Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-xl ${
                project.cover.coverMode && project.cover.coverMode !== 'template'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Cover Mode</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700">
                    {project.cover.coverMode === 'uploaded-full'
                      ? 'Custom Full-Wrap Spread'
                      : project.cover.coverMode === 'uploaded-front'
                      ? 'Custom Front Cover (Auto-Spine & Back)'
                      : 'Built-in Template'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {project.cover.coverMode === 'uploaded-full'
                    ? 'Using your uploaded full-wrap file for KDP Cover PDF export.'
                    : project.cover.coverMode === 'uploaded-front'
                    ? 'Using your uploaded front cover art with auto-calculated spine and back blurb.'
                    : 'Using pre-built template. Upload your AI-generated cover below to replace it!'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {project.cover.coverMode && project.cover.coverMode !== 'template' && (
                <button
                  onClick={handleResetCover}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>Reset to Default</span>
                </button>
              )}
              <button
                onClick={handleDownloadKindleCover}
                disabled={isExportingKindle}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                title="Download 2550×3300 px high-resolution JPG for Kindle eBook Cover (Min 1000px height rule)"
              >
                <Tablet className="w-4 h-4 mr-1.5" />
                <span>{isExportingKindle ? 'Generating JPG...' : 'Download Kindle eBook Cover (JPG)'}</span>
              </button>
              <button
                onClick={handleDownloadCover}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                title="Download Print-Ready Full-Wrap Cover PDF for Amazon KDP Paperback"
              >
                <Download className="w-4 h-4 mr-1.5" />
                <span>{isExporting ? 'Generating PDF...' : 'Export Paperback Cover PDF'}</span>
              </button>
            </div>
          </div>

          {/* Official Publisher Logo Tagging Control Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-700 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center space-x-4">
              <div className="bg-[#0b192c] p-2 rounded-xl border border-white/20 shadow-inner shrink-0">
                <img
                  src={KUNTA_LOGO_PNG_PATH}
                  alt="Published by Kunta Publications"
                  className="h-10 sm:h-12 w-auto object-contain rounded"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-white">
                    Default Publisher Logo: Kunta Publications
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    ✓ Official Imprint Active
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Automatically tags and overlays the official Kunta Publications imprint onto your cover wrap and uploaded AI artwork at Amazon KDP safe zones.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 bg-white/10 p-2.5 rounded-xl border border-white/15 shrink-0">
              <label className="flex items-center space-x-2 text-xs font-bold text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={project.cover.showPublisherLogo !== false}
                  onChange={(e) =>
                    onUpdateCover({
                      ...project.cover,
                      showPublisherLogo: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-indigo-500 focus:ring-indigo-400 cursor-pointer"
                />
                <span>Tag Logo on Covers</span>
              </label>

              {project.cover.showPublisherLogo !== false && (
                <select
                  value={project.cover.logoPlacement || 'both'}
                  onChange={(e) =>
                    onUpdateCover({
                      ...project.cover,
                      logoPlacement: e.target.value as 'back' | 'front' | 'both',
                    })
                  }
                  className="bg-slate-800 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg border border-white/20 focus:outline-none focus:border-indigo-400 cursor-pointer"
                >
                  <option value="both">Placement: Both Covers</option>
                  <option value="back">Placement: Back Cover Only</option>
                  <option value="front">Placement: Front Cover Only</option>
                </select>
              )}
            </div>
          </div>

          {/* Two Upload Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Upload Front Cover Art */}
            <div className="bg-white rounded-2xl p-6 border-2 border-indigo-100 hover:border-indigo-300 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                    Midjourney / DALL-E / Ideogram
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">1. Upload Front Cover Only (PNG / JPG)</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload your AI generated front cover art (e.g. from Midjourney with <code>--ar 8.5:11</code>).
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 space-y-1.5 border border-slate-200">
                  <p className="font-semibold text-slate-800">✨ Automatic Book Assembly:</p>
                  <p>• Positions your image onto the front cover zone.</p>
                  <p>• Auto-calculates exact spine width ({summaryData.spineWidthInches}") based on {summaryData.totalInteriorPages} pages.</p>
                  <p>• Auto-generates matching back cover with blurb, bullets, and barcode safe zone.</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-xl bg-indigo-50/40 hover:bg-indigo-50/80 cursor-pointer transition-all">
                  <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
                  <span className="text-xs font-bold text-indigo-950">Click or Drag &amp; Drop Front Cover Image</span>
                  <span className="text-[10px] text-indigo-700 mt-0.5">PNG, JPG, WEBP up to 25MB</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => handleFileUpload(e, 'front')}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* Card 2: Upload Full-Wrap Spread */}
            <div className="bg-white rounded-2xl p-6 border-2 border-purple-100 hover:border-purple-300 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    Direct AI Art / Panoramic Spread
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">2. Upload Full-Wrap Spread (PNG / JPG)</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload your complete panoramic spread (Back + Spine + Front) generated from Gemini, ChatGPT, or Midjourney (<code>--ar 17:11</code>).
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 space-y-1.5 border border-slate-200">
                  <p className="font-semibold text-slate-800">📏 Recommended Dimensions:</p>
                  <p>• Pixels at 300 DPI: {summaryData.coverDimensions300Dpi.width} × {summaryData.coverDimensions300Dpi.height} px</p>
                  <p>• Inches with bleed: {summaryData.coverDimensionsInches.width}" × {summaryData.coverDimensionsInches.height}"</p>
                  <p>• Spine Width: {summaryData.spineWidthInches}" centered</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-xl bg-purple-50/40 hover:bg-purple-50/80 cursor-pointer transition-all">
                  <UploadCloud className="w-8 h-8 text-purple-500 mb-2" />
                  <span className="text-xs font-bold text-purple-950">Click or Drag &amp; Drop Full-Wrap Spread</span>
                  <span className="text-[10px] text-purple-700 mt-0.5">PNG, JPG, WEBP up to 25MB</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => handleFileUpload(e, 'full')}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Live Preview of Uploaded Cover */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Live Cover Mockup &amp; Wrap Preview</h3>
                <p className="text-xs text-slate-500">
                  Real-time preview of how your cover appears wrapped around the book with fold lines and 3D lighting.
                </p>
              </div>
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setPreviewMode('2d')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    previewMode === '2d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  2D Full-Wrap
                </button>
                <button
                  onClick={() => setPreviewMode('3d')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    previewMode === '3d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  3D Book Mockup
                </button>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col items-center justify-center min-h-[460px] overflow-hidden">
              {previewMode === '2d' ? (
                <div className="w-full max-w-2xl shadow-2xl rounded-sm overflow-hidden border border-slate-700">
                  <div dangerouslySetInnerHTML={{ __html: coverSvg }} className="w-full h-auto" />
                </div>
              ) : (
                <div className="py-12 flex items-center justify-center">
                  <div className="relative group perspective-[1000px]">
                    <div className="w-[280px] h-[360px] rounded-r-xl shadow-2xl bg-slate-800 border border-slate-600 relative overflow-hidden flex flex-col justify-between p-6 transform rotate-y-[-24deg] rotate-x-[8deg]">
                      <div className="absolute inset-0 opacity-95">
                        <div
                          className="w-full h-full scale-[1.35] origin-top-right -mr-12"
                          dangerouslySetInnerHTML={{ __html: coverSvg }}
                        />
                      </div>
                      <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/40 via-white/20 to-transparent pointer-events-none" />
                      <div className="absolute right-[-14px] top-2 bottom-2 w-4 bg-slate-200 shadow-md transform skew-y-[12deg] rounded-r-xs border-r border-slate-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: AI PROMPTS & BOOK SUMMARY (MAIN WORKFLOW)                      */}
      {/* ========================================================================= */}
      {activeSubTab === 'prompts' && (
        <div className="space-y-8">
          {/* Quick Stat Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Book Format</span>
              <span className="text-base font-extrabold text-slate-900 block mt-0.5">8.5" × 11" Paperback</span>
              <span className="text-xs text-slate-500">{summaryData.totalInteriorPages} Total Interior Pages</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Calculated Spine Width</span>
              <span className="text-base font-extrabold text-indigo-600 block mt-0.5">
                {summaryData.spineWidthInches}"
              </span>
              <span className="text-xs text-slate-500">{summaryData.spineWidthMm} mm (55# white paper)</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">300 DPI Canvas Size</span>
              <span className="text-base font-extrabold text-slate-900 block mt-0.5">
                {summaryData.coverDimensions300Dpi.width} × {summaryData.coverDimensions300Dpi.height} px
              </span>
              <span className="text-xs text-slate-500">{summaryData.coverDimensionsInches.width}" × {summaryData.coverDimensionsInches.height}" (with bleed)</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-400 block uppercase">Target Reader</span>
              <span className="text-base font-extrabold text-emerald-600 block mt-0.5">{summaryData.ageGroup}</span>
              <span className="text-xs text-slate-500 capitalize">{summaryData.theme} Adventure</span>
            </div>
          </div>

          {/* Synchronized Visual Style Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-emerald-500/10 border-2 border-indigo-200 text-indigo-950 flex items-start space-x-3.5 shadow-xs">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <span className="font-extrabold text-sm text-indigo-950 block">
                ✨ Synchronized AI Prompts (Matching Kindle eBook &amp; Paperback Output):
              </span>
              <p className="text-indigo-900 leading-relaxed">
                Both prompts below share identical 3D Disney-Pixar character animation models, lighting, and high-contrast color palettes. Generate <strong>Prompt 1</strong> for your Kindle eBook Front Cover, and <strong>Prompt 2</strong> for your physical Paperback Full-Wrap Spread. They will look like the exact same matching book series!
              </p>
            </div>
          </div>

          {/* AI Engine Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-600" />
                <span>Target AI Generation Engine:</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Optimized for direct generation in Google Gemini or ChatGPT (no 3rd-party tools required).
              </p>
            </div>

            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedAiEngine('gemini')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedAiEngine === 'gemini'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>♊ Google Gemini (Imagen 3)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedAiEngine('chatgpt')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedAiEngine === 'chatgpt'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🤖 ChatGPT (DALL-E 3)</span>
              </button>
            </div>
          </div>

          {/* THE 2 MASTER PROMPTS (Side-by-Side) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* PROMPT 1: Front Cover (Kindle eBook & KDP Front Cover) */}
            <div className="bg-white rounded-3xl p-6 border-2 border-indigo-200 hover:border-indigo-400 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    📱 Prompt 1: Front Cover (Kindle eBook &amp; KDP Front)
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Portrait 8.5:11
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Hero Front Cover Artwork</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generates the standalone front cover with charming characters and clean sky for title placement.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 select-all leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                  {selectedAiEngine === 'gemini' ? aiPrompts.frontCoverGemini : aiPrompts.frontCoverChatGpt}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(aiPrompts.frontCoverGemini, 'front-gemini')}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedKey === 'front-gemini' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'front-gemini' ? 'Copied Gemini!' : 'Copy for Gemini ♊'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(aiPrompts.frontCoverChatGpt, 'front-chatgpt')}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedKey === 'front-chatgpt' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'front-chatgpt' ? 'Copied ChatGPT!' : 'Copy for ChatGPT 🤖'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* PROMPT 2: Full Book Specification & Full-Wrap Paperback Spread */}
            <div className="bg-white rounded-3xl p-6 border-2 border-purple-200 hover:border-purple-400 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    📖 Prompt 2: Full-Wrap Spread (Paperback Print Version)
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    Panoramic 17:11 Spread
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">Full-Wrap Spread (Back + Spine + Front)</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Shares 100% matching art style and characters with the front cover, formatted across the full wrap.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 select-all leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                  {selectedAiEngine === 'gemini' ? aiPrompts.fullWrapGemini : aiPrompts.fullWrapChatGpt}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(aiPrompts.fullWrapGemini, 'wrap-gemini')}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedKey === 'wrap-gemini' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'wrap-gemini' ? 'Copied Gemini!' : 'Copy for Gemini ♊'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(aiPrompts.fullWrapChatGpt, 'wrap-chatgpt')}
                    className="py-2.5 px-3 rounded-xl font-bold text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    {copiedKey === 'wrap-chatgpt' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedKey === 'wrap-chatgpt' ? 'Copied ChatGPT!' : 'Copy for ChatGPT 🤖'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Master Book Summary Box (Comprehensive Specification for AI Creative Director) */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 bg-indigo-500/30 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-200">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Comprehensive Book Summary for AI</span>
                </div>
                <h3 className="text-xl font-extrabold text-white">Full Book Specification &amp; Design Summary</h3>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(textSummary, 'master-summary')}
                className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {copiedKey === 'master-summary' ? <Check className="w-4 h-4 text-emerald-600 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                <span>{copiedKey === 'master-summary' ? 'Copied Full Summary!' : 'Copy Entire Summary for AI'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              Paste this entire specification into <strong>ChatGPT</strong>, <strong>Gemini</strong>, or <strong>Claude</strong> to generate custom A+ marketing hooks, visual concepts, and complete layout blueprints.
            </p>

            <div className="bg-black/40 border border-white/10 rounded-xl p-4 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
              {textSummary}
            </div>
          </div>

          {/* Pro-Tip: Avoid Dimension Artifacts */}
          <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start space-x-3.5 shadow-sm">
            <span className="text-2xl shrink-0 mt-0.5">⚠️</span>
            <div className="text-xs space-y-1.5">
              <span className="font-extrabold block text-sm text-amber-950">
                How to Avoid Borders, Dimension Numbers &amp; Instructional Text in Your AI Cover:
              </span>
              <p className="text-amber-900 leading-relaxed">
                Do <strong>NOT</strong> paste numerical canvas dimensions (such as <em>"17.31 x 11.25"</em>, <em>"5193 x 3375 px"</em>, or <em>"0.06 spine"</em>) into AI image generation prompts. If dimensions are pasted, image generators mistakenly paint measurement rulers, numbers, arrows, crop marks, and barcode boxes right onto your artwork!
              </p>
              <p className="text-amber-900 font-semibold">
                ✓ Use our clean prompts above. They feature built-in negative instructions for 100% borderless, full-bleed artwork.
              </p>
            </div>
          </div>

          {/* Back Cover Copywriting & Highlights */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Back Cover Copywriting &amp; Story Blurb</h3>
                <p className="text-xs text-slate-500">
                  Ready-to-paste text for the back cover blurb and feature highlights.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blurb */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Back Cover Story Blurb</span>
                  <p className="text-xs text-slate-700 mt-2 italic leading-relaxed">"{summaryData.backCoverBlurb}"</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(summaryData.backCoverBlurb, 'blurb')}
                  className="mt-3 inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {copiedKey === 'blurb' ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  <span>{copiedKey === 'blurb' ? 'Copied Blurb!' : 'Copy Blurb'}</span>
                </button>
              </div>

              {/* Bullets */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Feature Highlights</span>
                  <ul className="text-xs text-slate-700 mt-2 space-y-1">
                    {summaryData.featureBullets.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(summaryData.featureBullets.join('\n'), 'bullets')}
                  className="mt-3 inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {copiedKey === 'bullets' ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  <span>{copiedKey === 'bullets' ? 'Copied Bullets!' : 'Copy Bullet Points'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: KDP PRINT SPECIFICATIONS & EXACT DIMENSIONS                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'specs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Amazon KDP Full-Wrap Cover Print Specifications</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact full-bleed dimensions and calculations to guarantee zero Amazon KDP trim rejection.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Canvas Resolution (300 DPI)</span>
                <span className="text-xl font-extrabold text-indigo-600 block mt-1">
                  {summaryData.coverDimensions300Dpi.width} × {summaryData.coverDimensions300Dpi.height} px
                </span>
                <span className="text-xs text-slate-500">Full-bleed print resolution at 300 DPI.</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Canvas Size (Inches)</span>
                <span className="text-xl font-extrabold text-slate-900 block mt-1">
                  {summaryData.coverDimensionsInches.width}" × {summaryData.coverDimensionsInches.height}"
                </span>
                <span className="text-xs text-slate-500">Includes 0.125" bleed on top, bottom, and outside edges.</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Exact Spine Width</span>
                <span className="text-xl font-extrabold text-purple-600 block mt-1">
                  {summaryData.spineWidthInches}" ({summaryData.spineWidthMm} mm)
                </span>
                <span className="text-xs text-slate-500">Based on {summaryData.totalInteriorPages} interior pages on standard 55# white paper.</span>
              </div>
            </div>

            {/* Visual Blueprint Diagram */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Full-Wrap KDP Layout Blueprint
              </h4>

              <div className="w-full aspect-[17.3/11.2] max-h-[300px] border-2 border-dashed border-slate-600 rounded-lg p-2 flex items-center justify-between text-center relative bg-slate-800">
                {/* Back Cover Zone */}
                <div className="flex-1 h-full border border-slate-700 bg-slate-800/80 rounded flex flex-col justify-between p-3">
                  <span className="text-xs font-bold text-slate-300">BACK COVER (8.5" × 11")</span>
                  <p className="text-[10px] text-slate-400">Blurb, Bullet Points, &amp; Highlights</p>
                  <div className="self-end bg-white text-slate-900 px-2 py-1 rounded text-[9px] font-bold border border-slate-400">
                    Barcode Zone (2" × 1.2")
                  </div>
                </div>

                {/* Spine Zone */}
                <div className="w-12 h-full bg-indigo-950 border-x border-indigo-500 flex flex-col items-center justify-center p-1 mx-1">
                  <span className="text-[10px] font-bold text-indigo-300 transform -rotate-90 whitespace-nowrap">
                    SPINE ({summaryData.spineWidthInches}")
                  </span>
                </div>

                {/* Front Cover Zone */}
                <div className="flex-1 h-full border border-slate-700 bg-indigo-900/30 rounded flex flex-col justify-between p-3">
                  <span className="text-xs font-bold text-amber-300">FRONT COVER (8.5" × 11")</span>
                  <p className="text-[10px] text-slate-300">AI Hero Illustration + Big Title Typography</p>
                  <span className="text-[10px] text-indigo-300">Ages {project.config.ageGroup} Badge</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center">
                Outer dashed line indicates the 0.125" (3.2 mm) trim bleed. Keep text at least 0.375" (9.5 mm) away from all edges and fold lines!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: BUILT-IN PREVIEW (2D/3D FALLBACK GENERATOR)                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'preview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setPreviewMode('2d')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  previewMode === '2d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                2D Full-Wrap
              </button>
              <button
                onClick={() => setPreviewMode('front')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  previewMode === 'front' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                📱 Kindle Front Cover
              </button>
              <button
                onClick={() => setPreviewMode('3d')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  previewMode === '3d' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                3D Mockup
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadKindleCover}
                disabled={isExportingKindle}
                className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Download 2550×3300 px high-res JPG for Kindle eBook Cover"
              >
                <Tablet className="w-3.5 h-3.5 mr-1" />
                <span>{isExportingKindle ? 'Exporting...' : 'Download Kindle JPG'}</span>
              </button>
              <button
                onClick={handleDownloadCover}
                disabled={isExporting}
                className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Download Print-Ready Full-Wrap Cover PDF for Paperback"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                <span>{isExporting ? 'Exporting...' : 'Download Wrap PDF'}</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center min-h-[480px]">
            {previewMode === '2d' ? (
              <div className="w-full max-w-2xl shadow-2xl rounded-sm overflow-hidden border border-slate-700">
                <div dangerouslySetInnerHTML={{ __html: coverSvg }} className="w-full h-auto" />
              </div>
            ) : previewMode === 'front' ? (
              <div className="w-full max-w-sm shadow-2xl rounded-2xl overflow-hidden border-2 border-slate-700">
                <div dangerouslySetInnerHTML={{ __html: frontCoverSvg }} className="w-full h-auto" />
              </div>
            ) : (
              <div className="py-12 flex items-center justify-center">
                <div className="relative group perspective-[1000px]">
                  <div className="w-[280px] h-[360px] rounded-r-xl shadow-2xl bg-slate-800 border border-slate-600 relative overflow-hidden flex flex-col justify-between p-6 transform rotate-y-[-24deg] rotate-x-[8deg]">
                    <div className="absolute inset-0 opacity-95">
                      <div
                        className="w-full h-full scale-[1.35] origin-top-right -mr-12"
                        dangerouslySetInnerHTML={{ __html: coverSvg }}
                      />
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/40 via-white/20 to-transparent pointer-events-none" />
                    <div className="absolute right-[-14px] top-2 bottom-2 w-4 bg-slate-200 shadow-md transform skew-y-[12deg] rounded-r-xs border-r border-slate-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
