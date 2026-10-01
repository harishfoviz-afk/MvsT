import React, { useState } from 'react';
import { BookProject } from '../types/book';
import { generateKdpMarketing, exportMarketingBundleAsText } from '../core/marketing/kdpMarketing';
import { Search, Copy, Check, FileText, Download, Sparkles, AlertCircle } from 'lucide-react';

interface MarketingSuiteProps {
  project: BookProject;
}

export const MarketingSuite: React.FC<MarketingSuiteProps> = ({ project }) => {
  const metadata = generateKdpMarketing(project);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadTxt = () => {
    const txt = exportMarketingBundleAsText(metadata);
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.config.title.replace(/\s+/g, '_')}_KDP_Metadata.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-xl">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Amazon KDP SEO &amp; Marketing Helper</h2>
            <p className="text-xs text-slate-500">
              High-ranking 7 backend keyword boxes, Amazon-compliant HTML descriptions, and category paths.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadTxt}
          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 mr-1.5" />
          <span>Download Metadata (.txt)</span>
        </button>
      </div>

      {/* 7 Backend Keywords Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>7 Amazon Backend Search Term Boxes</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                SEO Optimized
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Copy each phrase directly into one of Amazon KDP's 7 keyword fields. (Under 50 characters, no punctuation).
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {metadata.backendKeywords.map((kw, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between space-x-3"
            >
              <div className="min-w-0">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Keyword Box {idx + 1} ({kw.length} chars)
                </span>
                <span className="text-xs font-mono font-medium text-slate-800 truncate block mt-0.5">
                  {kw}
                </span>
              </div>
              <button
                onClick={() => handleCopy(kw, `kw-${idx}`)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white transition-all cursor-pointer shrink-0"
                title="Copy Keyword Box"
              >
                {copiedKey === `kw-${idx}` ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* HTML Description Generator */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Amazon-Formatted HTML Product Description</h3>
            <p className="text-xs text-slate-500">
              Formatted with Amazon KDP approved tags (&lt;b&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;) to drive conversions.
            </p>
          </div>

          <button
            onClick={() => handleCopy(metadata.htmlDescription, 'html-desc')}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer"
          >
            {copiedKey === 'html-desc' ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            <span>{copiedKey === 'html-desc' ? 'Copied HTML!' : 'Copy HTML Code'}</span>
          </button>
        </div>

        {/* Live Visual Preview */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-h-72 overflow-y-auto text-xs text-slate-700 space-y-2 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: metadata.htmlDescription }} />
        </div>
      </div>

      {/* Author & KDP Primary Details */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Amazon KDP Author &amp; Book Details</h3>
            <p className="text-xs text-slate-500">
              Assigned primary author based on target age group ({project.config.ageGroup}) and series metadata.
            </p>
          </div>
          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            Ages {project.config.ageGroup} Author
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Author: First Name</span>
              <span className="text-sm font-black text-slate-900">{metadata.authorDetails.firstName}</span>
            </div>
            <button
              onClick={() => handleCopy(metadata.authorDetails.firstName, 'auth-fn')}
              className="p-1.5 rounded-lg bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 cursor-pointer transition-all"
              title="Copy First Name"
            >
              {copiedKey === 'auth-fn' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Author: Last Name</span>
              <span className="text-sm font-black text-slate-900">{metadata.authorDetails.lastName}</span>
            </div>
            <button
              onClick={() => handleCopy(metadata.authorDetails.lastName, 'auth-ln')}
              className="p-1.5 rounded-lg bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 cursor-pointer transition-all"
              title="Copy Last Name"
            >
              {copiedKey === 'auth-ln' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Publisher Contributor</span>
              <span className="text-sm font-bold text-slate-900">Kunta Publications</span>
            </div>
            <button
              onClick={() => handleCopy('Kunta Publications', 'pub-name')}
              className="p-1.5 rounded-lg bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 cursor-pointer transition-all"
              title="Copy Publisher"
            >
              {copiedKey === 'pub-name' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Categories & Audience Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recommended Amazon Browse Categories</h3>
            <span className="text-[10px] font-bold text-slate-400">3 of 3 Placements</span>
          </div>
          <div className="space-y-2.5 text-xs text-slate-600">
            {metadata.categoryGuides.map((cg, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">{i + 1}. {cg.placement}</span>
                  <button
                    onClick={() => handleCopy(cg.fullPath, `cat-ms-${i}`)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {copiedKey === `cat-ms-${i}` ? '✓ Copied Path' : 'Copy Path'}
                  </button>
                </div>
                <div className="text-[10px] font-mono text-indigo-700 bg-white p-1 rounded border border-indigo-100">
                  {cg.fullPath}
                </div>
                <div className="text-[10px] text-slate-500">
                  👉 {cg.stepInstruction}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Target Audience &amp; Age Settings (KDP Metadata)</h3>
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <span className="font-semibold text-slate-700">Minimum Reading Age:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{metadata.primaryAudience.minimumAge}</span>
                <button
                  onClick={() => handleCopy(metadata.primaryAudience.minimumAge, 'min-age-ms')}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {copiedKey === 'min-age-ms' ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <span className="font-semibold text-slate-700">Maximum Reading Age:</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{metadata.primaryAudience.maximumAge}</span>
                <button
                  onClick={() => handleCopy(metadata.primaryAudience.maximumAge, 'max-age-ms')}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  {copiedKey === 'max-age-ms' ? '✓' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <span className="font-semibold text-slate-700">Grade Level Range:</span>
              <span className="font-bold text-slate-900">{metadata.primaryAudience.gradeRange}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <span className="font-semibold text-slate-700">Primary Marketplace:</span>
              <span className="font-bold text-slate-900">Amazon.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
