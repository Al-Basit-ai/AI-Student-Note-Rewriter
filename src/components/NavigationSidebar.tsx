import React, { useState } from 'react';
import { DocumentItem } from '../types';
import { 
  Plus, 
  Search, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  BookOpen,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface NavigationSidebarProps {
  documents: DocumentItem[];
  activeDocumentId: string;
  onSelectDocument: (id: string) => void;
  onCreateDocument: () => void;
  onDeleteDocument: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  masteredCount: number;
  reviewCount: number;
  newCount: number;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  documents,
  activeDocumentId,
  onSelectDocument,
  onCreateDocument,
  onDeleteDocument,
  isCollapsed,
  onToggleCollapse,
  masteredCount,
  reviewCount,
  newCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract unique tags
  const allTags = Array.from(
    new Set(documents.flatMap(doc => doc.tags || []))
  );

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.rawText.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTag = selectedTag ? doc.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  if (isCollapsed) {
    return (
      <aside className="w-12 bg-[#0d0e15] border-r border-[#23273a] flex flex-col items-center py-3 select-none transition-all duration-200 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded text-[#94a3b8] hover:text-[#ffffff] hover:bg-[#141622] transition-colors mb-4"
          title="Expand Navigation Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={onCreateDocument}
          className="w-8 h-8 rounded bg-[#6366f1] text-[#ffffff] flex items-center justify-center hover:bg-[#818cf8] shadow-[0_0_12px_rgba(99,102,241,0.35)] transition-all mb-4"
          title="New Research Note"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="flex-1 flex flex-col items-center gap-3 overflow-y-auto w-full px-1">
          {documents.map(doc => {
            const isActive = doc.id === activeDocumentId;
            return (
              <button
                key={doc.id}
                onClick={() => onSelectDocument(doc.id)}
                className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[#141622] text-[#818cf8] border border-[#6366f1] shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                    : 'text-[#94a3b8] hover:text-[#ffffff] hover:bg-[#141622]/50'
                }`}
                title={doc.title}
              >
                <FileText className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 lg:w-80 bg-[#0d0e15] border-r border-[#23273a] flex flex-col select-none transition-all duration-200 shrink-0 h-[calc(100vh-3.5rem)]">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-[#23273a] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#818cf8]" />
          <span className="font-headline font-semibold text-xs tracking-wider uppercase text-[#f1f5f9]">
            Research Corpus
          </span>
          <span className="font-mono text-[10px] text-[#94a3b8] px-1.5 py-0.5 rounded bg-[#141622] border border-[#23273a]">
            {documents.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onCreateDocument}
            className="p-1 rounded bg-[#6366f1] hover:bg-[#818cf8] text-[#ffffff] shadow-[0_0_12px_rgba(99,102,241,0.35)] active:scale-95 transition-all"
            title="Create New Research Note"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1 text-[#94a3b8] hover:text-[#ffffff] hover:bg-[#141622] rounded transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search notes, invariants, tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#000000] border border-[#23273a] rounded px-8 py-1.5 text-xs text-[#ffffff] placeholder-[#94a3b8] focus-lumina transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#94a3b8] hover:text-[#ffffff]"
            >
              ESC
            </button>
          )}
        </div>
      </div>

      {/* Tag Filters (Chips & Monospace Tags based on design spec) */}
      <div className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedTag(null)}
          className={`font-mono text-[11px] px-2 py-0.5 rounded transition-all whitespace-nowrap ${
            selectedTag === null
              ? 'bg-[#6366f1]/15 border border-[#6366f1] text-[#818cf8]'
              : 'bg-[#141622] border border-[#23273a] text-[#94a3b8] hover:text-[#f1f5f9]'
          }`}
        >
          All
        </button>
        {allTags.map(tag => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              onClick={() => setSelectedTag(isSelected ? null : tag)}
              className={`font-mono text-[11px] px-2 py-0.5 rounded transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-[#6366f1]/15 border border-[#6366f1] text-[#818cf8]'
                  : 'bg-[#141622] border border-[#23273a] text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
            >
              #{tag}
            </button>
          );
        })}
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1.5">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-xs text-[#94a3b8]">
            <p>No documents match criteria.</p>
          </div>
        ) : (
          filteredDocuments.map(doc => {
            const isActive = doc.id === activeDocumentId;
            return (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc.id)}
                className={`group relative p-2.5 rounded cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#141622] border border-[#6366f1] glow-indigo'
                    : 'bg-[#0d0e15] border border-[#1e2235] hover:bg-[#141622] hover:border-[#3b4263]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-headline font-semibold text-xs text-[#ffffff] leading-snug line-clamp-2">
                    {doc.title}
                  </h4>
                  <span className="font-mono text-[10px] text-[#06b6d4] shrink-0">
                    {doc.revision}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#94a3b8]">
                  <span className="truncate max-w-[140px] text-[10px]">
                    {doc.category}
                  </span>
                  <span className="font-mono text-[10px] text-[#94a3b8]/80">
                    {doc.lastModified.split(' ')[0]}
                  </span>
                </div>

                {/* Tag Pills */}
                <div className="mt-2 flex flex-wrap gap-1">
                  {doc.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#000000] border border-[#23273a] text-[#94a3b8]"
                    >
                      {tag}
                    </span>
                  ))}
                  {doc.tags.length > 3 && (
                    <span className="font-mono text-[9px] text-[#94a3b8]">
                      +{doc.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Delete button (hidden until hover) */}
                {documents.length > 1 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteDocument(doc.id);
                    }}
                    className="absolute right-2 bottom-2 p-1 text-[#94a3b8] hover:text-[#f87171] opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Spaced Repetition Mastery Metrics Footer */}
      <div className="p-3 border-t border-[#23273a] bg-[#000000]/60">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] tracking-wider text-[#94a3b8] uppercase">
            Active Recall Retention
          </span>
          <span className="font-mono text-[11px] font-semibold text-[#10b981]">
            {Math.round((masteredCount / Math.max(1, masteredCount + reviewCount + newCount)) * 100)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-[#141622] rounded-full overflow-hidden flex border border-[#23273a]">
          <div
            style={{ width: `${(masteredCount / Math.max(1, masteredCount + reviewCount + newCount)) * 100}%` }}
            className="bg-[#10b981] h-full transition-all"
            title={`Mastered: ${masteredCount}`}
          />
          <div
            style={{ width: `${(reviewCount / Math.max(1, masteredCount + reviewCount + newCount)) * 100}%` }}
            className="bg-[#a855f7] h-full transition-all"
            title={`Review: ${reviewCount}`}
          />
          <div
            style={{ width: `${(newCount / Math.max(1, masteredCount + reviewCount + newCount)) * 100}%` }}
            className="bg-[#06b6d4] h-full transition-all"
            title={`New: ${newCount}`}
          />
        </div>

        {/* Metric counts */}
        <div className="mt-2.5 grid grid-cols-3 gap-1 font-mono text-[10px] text-center">
          <div className="p-1 rounded bg-[#141622] border border-[#23273a]">
            <span className="text-[#10b981] font-semibold">{masteredCount}</span>
            <div className="text-[#94a3b8] text-[9px]">Mastered</div>
          </div>
          <div className="p-1 rounded bg-[#141622] border border-[#23273a]">
            <span className="text-[#c084fc] font-semibold">{reviewCount}</span>
            <div className="text-[#94a3b8] text-[9px]">Review</div>
          </div>
          <div className="p-1 rounded bg-[#141622] border border-[#23273a]">
            <span className="text-[#06b6d4] font-semibold">{newCount}</span>
            <div className="text-[#94a3b8] text-[9px]">New</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
