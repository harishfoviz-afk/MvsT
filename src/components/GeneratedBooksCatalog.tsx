import React, { useState } from 'react';
import { BookProject, BookRecord, BookTheme } from '../types/book';
import { exportInteriorPDF, downloadBlob } from '../core/assembly/pdfExport';
import { auditBookForAmazonKdp } from '../core/audit/kdpRankEngine';
import { KdpAuditModal } from './KdpAuditModal';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  Download,
  Gamepad2,
  Edit3,
  Trash2,
  Search,
  Filter,
  Layers,
  Sparkles,
  Calendar,
  Clock,
  Award,
  ShieldCheck,
  Tag,
  FileCheck,
} from 'lucide-react';

interface GeneratedBooksCatalogProps {
  catalog: BookRecord[];
  onSelectBook: (book: BookRecord) => void;
  onLaunchKidsPortal: (book: BookRecord) => void;
  onTogglePublished: (bookId: string, isPublished: boolean) => void;
  onDeleteBook: (bookId: string) => void;
  onCreateNewBook: () => void;
}

export const GeneratedBooksCatalog: React.FC<GeneratedBooksCatalogProps> = ({
  catalog,
  onSelectBook,
  onLaunchKidsPortal,
  onTogglePublished,
  onDeleteBook,
  onCreateNewBook,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [auditProject, setAuditProject] = useState<{ project: BookProject; sku: string } | null>(null);

  // Statistics
  const totalBooks = catalog.length;
  const publishedBooks = catalog.filter((b) => b.isPublishedOnAmazon).length;
  const draftBooks = totalBooks - publishedBooks;
  const totalPuzzles = catalog.reduce((sum, b) => sum + b.puzzleCount, 0);

  // Filtered books
  const filteredBooks = catalog.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTheme = selectedTheme === 'all' || book.theme === selectedTheme;

    const matchesStatus =
      publishedFilter === 'all' ||
      (publishedFilter === 'published' && book.isPublishedOnAmazon) ||
      (publishedFilter === 'draft' && !book.isPublishedOnAmazon);

    return matchesSearch && matchesTheme && matchesStatus;
  });

  // Direct 1-Click PDF Download
  const handleQuickDownloadPdf = async (book: BookRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setDownloadingId(book.id);
    try {
      if (!book.project || !book.project.pages || book.project.pages.length === 0) {
        throw new Error('Book project data is empty or has no pages.');
      }
      const pdfBytes = await exportInteriorPDF(book.project);
      downloadBlob(pdfBytes, `${book.sku}_Interior_8.5x11_KDP.pdf`);
    } catch (err: any) {
      console.error('Failed to download PDF:', err);
      alert(`Could not download PDF: ${err?.message || 'Unknown error'}. Check browser console.`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & KPI Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 font-heading">
              Generated Books Catalog
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
              {totalBooks} Books
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track all generated Kunta Publications books, manage Amazon publishing status, and download KDP PDFs.
          </p>
        </div>

        <button
          onClick={onCreateNewBook}
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all duration-150 active:scale-95 cursor-pointer gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Generate New Book</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            📚
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-800">{totalBooks}</div>
            <div className="text-xs text-slate-500 font-medium">Total Books Created</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-emerald-600">{publishedBooks}</div>
            <div className="text-xs text-slate-500 font-medium">Published on Amazon</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-amber-600">{draftBooks}</div>
            <div className="text-xs text-slate-500 font-medium">Drafts / In Progress</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-purple-600">{totalPuzzles}</div>
            <div className="text-xs text-slate-500 font-medium">Total Unique Puzzles</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Title, Subtitle, or SKU (e.g. KP-SPACE)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Theme Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
          >
            <option value="all">All Themes</option>
            <option value="animals">Animals 🦁</option>
            <option value="space">Space 🚀</option>
            <option value="dinosaurs">Dinosaurs 🦖</option>
            <option value="fantasy">Fantasy 🏰</option>
            <option value="underwater">Underwater 🐬</option>
            <option value="jungle">Jungle 🌴</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setPublishedFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              publishedFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({totalBooks})
          </button>
          <button
            onClick={() => setPublishedFilter('published')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              publishedFilter === 'published'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Published ({publishedBooks})
          </button>
          <button
            onClick={() => setPublishedFilter('draft')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              publishedFilter === 'draft'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Drafts ({draftBooks})
          </button>
        </div>
      </div>

      {/* Book Catalog Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
          <div className="text-4xl">📖</div>
          <h3 className="text-base font-bold text-slate-800">No books found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {catalog.length === 0
              ? 'You have not generated any books yet. Click "Generate New Book" to create your first KDP masterpiece!'
              : 'No books matched your search and filter criteria. Try resetting the filters.'}
          </p>
          {catalog.length === 0 && (
            <button
              onClick={onCreateNewBook}
              className="mt-2 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Create First Book
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => {
            const isDownloading = downloadingId === book.id;
            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Card Top */}
                <div className="p-5 space-y-4">
                  {/* SKU & Published Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 truncate">
                      {book.sku}
                    </span>

                    {/* Published Yes/No Toggle Badge */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePublished(book.id, !book.isPublishedOnAmazon);
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${
                        book.isPublishedOnAmazon
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                      }`}
                      title="Click to toggle Amazon published status"
                    >
                      {book.isPublishedOnAmazon ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Published: YES</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>Published: NO</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {book.subtitle}
                    </p>
                  </div>

                  {/* Badges / Specs & KDP Rank */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200/60">
                      Ages {book.ageGroup}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-bold border border-purple-200/60 capitalize">
                      {book.theme}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                      {book.pageCount} Pages ({book.puzzleCount} Puzzles)
                    </span>

                    {/* Amazon KDP Quality & Rank Badge */}
                    {book.project && (() => {
                      const audit = auditBookForAmazonKdp(book.project);
                      return (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAuditProject({ project: book.project, sku: book.sku });
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 transition-all cursor-pointer text-xs"
                          title="Click to view full Amazon KDP Quality & Bestseller Audit Report"
                        >
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>KDP Rank: {audit.totalScore}% ({audit.grade})</span>
                        </button>
                      );
                    })()}
                  </div>

                  {/* Date & Time Created */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Created on <strong className="text-slate-700">{new Date(book.createdAt).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' })}</strong></span>
                    </div>
                    <div className="inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200/70 text-[11px] shadow-2xs">
                      <Clock className="w-3 h-3 text-purple-500" />
                      <span>{new Date(book.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* Launch Kids Portal */}
                    <button
                      onClick={() => onLaunchKidsPortal(book)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                      title="Play in Kids Interactive Puzzle Portal"
                    >
                      <Gamepad2 className="w-3.5 h-3.5" />
                      <span>Kids Play</span>
                    </button>

                    {/* Quick Download PDF */}
                    <button
                      onClick={(e) => handleQuickDownloadPdf(book, e)}
                      disabled={isDownloading}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 border border-indigo-200 transition-all cursor-pointer disabled:opacity-50"
                      title="Direct PDF Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isDownloading ? 'Exporting...' : 'PDF'}</span>
                    </button>

                    {/* Open in Editor / Inspector */}
                    <button
                      onClick={() => onSelectBook(book)}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1 border border-slate-200 transition-all cursor-pointer"
                      title="Load in Studio Inspector"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${book.title}" from catalog?`)) {
                        onDeleteBook(book.id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete book from catalog"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Amazon KDP Quality & Bestseller Audit Modal */}
      {auditProject && (
        <KdpAuditModal
          isOpen={true}
          onClose={() => setAuditProject(null)}
          project={auditProject.project}
          sku={auditProject.sku}
        />
      )}
    </div>
  );
};
