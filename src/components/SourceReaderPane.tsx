import React, { useState, useRef } from 'react';
import { DocumentItem } from '../types';
import { 
  Eye, 
  Edit3, 
  Copy, 
  Check, 
  ArrowRightCircle, 
  Plus, 
  Tag, 
  Sparkles,
  BookOpen,
  Code2
} from 'lucide-react';

interface SourceReaderPaneProps {
  document: DocumentItem;
  onUpdateText: (newText: string) => void;
  onUpdateTitle: (newTitle: string) => void;
  onSendToSynthesizer: (selectedText?: string) => void;
  onCreateFlashcardFromSelection: (selection: string) => void;
}

export const SourceReaderPane: React.FC<SourceReaderPaneProps> = ({
  document,
  onUpdateText,
  onUpdateTitle,
  onSendToSynthesizer,
  onCreateFlashcardFromSelection,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [selectionCoords, setSelectionCoords] = useState<{ x: number; y: number } | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const textContainerRef = useRef<HTMLDivElement>(null);

  // Compute metrics
  const wordCount = document.rawText.trim().split(/\s+/).filter(Boolean).length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 220));

  const handleCopy = () => {
    navigator.clipboard.writeText(document.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 5) {
      const text = selection.toString().trim();
      setSelectedText(text);

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectionCoords({
        x: Math.max(20, rect.left + rect.width / 2 - 110),
        y: Math.max(10, rect.top - 45),
      });
    } else {
      setSelectionCoords(null);
      setSelectedText('');
    }
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTagInput.trim() && !document.tags.includes(newTagInput.trim())) {
      document.tags.push(newTagInput.trim());
      setNewTagInput('');
      setShowTagInput(false);
    }
  };

  // Simple, clean Markdown renderer for deep focus reading
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre
              key={`code-${index}`}
              className="my-3 p-3 bg-[#000000] border border-[#23273a] rounded font-mono text-xs text-[#06b6d4] overflow-x-auto shadow-inner"
            >
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={index} className="font-headline font-bold text-xl lg:text-2xl text-[#ffffff] mt-4 mb-2 tracking-tight">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={index} className="font-headline font-semibold text-base lg:text-lg text-[#f1f5f9] mt-4 mb-1.5 border-b border-[#23273a]/50 pb-1">
            {line.replace('## ', '')}
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={index} className="font-headline font-medium text-sm text-[#c0c1ff] mt-3 mb-1">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={index} className="ml-4 list-disc text-xs text-[#d4e4fa] leading-relaxed my-0.5">
            {line.replace(/^[-*]\s+/, '')}
          </li>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={index} className="my-2 pl-3 border-l-2 border-[#6366f1] text-xs italic text-[#c7c4d7] bg-[#141622]/40 py-1">
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={index} className="h-2" />);
      } else {
        elements.push(
          <p key={index} className="text-xs text-[#d4e4fa] leading-relaxed my-1">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#141622] border-r border-[#23273a] overflow-hidden select-text relative">
      {/* Pane 2 Header */}
      <div className="p-3 border-b border-[#23273a] bg-[#0d0e15]/70 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex-1 min-w-[200px]">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#94a3b8] mb-1">
            <span>CORPUS</span>
            <span>/</span>
            <span className="text-[#818cf8]">{document.category}</span>
          </div>

          <input
            type="text"
            value={document.title}
            onChange={e => onUpdateTitle(e.target.value)}
            className="font-headline font-bold text-sm lg:text-base text-[#ffffff] bg-transparent hover:bg-[#000000]/40 focus:bg-[#000000] px-1 py-0.5 rounded border border-transparent focus:border-[#6366f1] focus-lumina w-full transition-all"
          />
        </div>

        {/* Reader Action Controls */}
        <div className="flex items-center gap-2">
          {/* Metrics */}
          <div className="hidden sm:flex items-center gap-2 font-mono text-[10px] text-[#94a3b8] px-2 py-1 rounded bg-[#000000] border border-[#23273a]">
            <span>{wordCount} words</span>
            <span className="text-[#23273a]">·</span>
            <span>~{readTimeMin}m read</span>
          </div>

          {/* Edit / Render Toggle */}
          <div className="flex items-center bg-[#000000] border border-[#23273a] rounded p-0.5">
            <button
              onClick={() => setIsEditing(false)}
              className={`p-1 rounded text-xs flex items-center gap-1 transition-all ${
                !isEditing ? 'bg-[#141622] text-[#818cf8]' : 'text-[#94a3b8] hover:text-[#ffffff]'
              }`}
              title="Markdown View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className={`p-1 rounded text-xs flex items-center gap-1 transition-all ${
                isEditing ? 'bg-[#141622] text-[#818cf8]' : 'text-[#94a3b8] hover:text-[#ffffff]'
              }`}
              title="Raw Editor"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded bg-[#000000] border border-[#23273a] hover:border-[#6366f1] text-[#94a3b8] hover:text-[#ffffff] transition-colors"
            title="Copy Raw Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Send to Synthesizer Trigger */}
          <button
            onClick={() => onSendToSynthesizer()}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#6366f1] hover:bg-[#818cf8] text-[#ffffff] shadow-[0_0_12px_rgba(99,102,241,0.35)] active:scale-95 transition-all"
            title="Load entire text into Active Rewriter Workspace"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Rewrite</span>
          </button>
        </div>
      </div>

      {/* Tags strip */}
      <div className="px-3 py-1.5 border-b border-[#23273a]/60 bg-[#0d0e15]/40 flex items-center gap-1.5 flex-wrap shrink-0">
        <Tag className="w-3 h-3 text-[#94a3b8]" />
        {document.tags.map(t => (
          <span
            key={t}
            className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#000000] border border-[#23273a] text-[#c7c4d7]"
          >
            #{t}
          </span>
        ))}
        {showTagInput ? (
          <form onSubmit={handleAddTag} className="inline-flex items-center">
            <input
              type="text"
              placeholder="tag name..."
              value={newTagInput}
              onChange={e => setNewTagInput(e.target.value)}
              className="bg-[#000000] border border-[#818cf8] rounded px-1.5 py-0.5 text-[10px] font-mono text-[#ffffff] w-20 focus:outline-none"
              autoFocus
              onBlur={() => setShowTagInput(false)}
            />
          </form>
        ) : (
          <button
            onClick={() => setShowTagInput(true)}
            className="text-[10px] font-mono text-[#94a3b8] hover:text-[#818cf8] px-1 py-0.5"
            title="Add tag"
          >
            +tag
          </button>
        )}
      </div>

      {/* Content Area */}
      <div
        ref={textContainerRef}
        onMouseUp={handleMouseUp}
        className="flex-1 overflow-y-auto p-4 lg:p-6 text-sm text-[#ffffff]"
      >
        {isEditing ? (
          <div className="h-full flex flex-col">
            <div className="mb-2 flex items-center justify-between text-[11px] font-mono text-[#94a3b8]">
              <span>EDITING RAW SOURCE // AUTOSAVE ACTIVE</span>
              <span>LINES: {document.rawText.split('\n').length}</span>
            </div>
            <textarea
              value={document.rawText}
              onChange={e => onUpdateText(e.target.value)}
              className="w-full flex-1 bg-[#000000] border border-[#23273a] rounded-md p-3 font-mono text-xs text-[#ffffff] leading-relaxed resize-none focus-lumina"
              placeholder="Paste or write raw technical text, equations, or notes..."
            />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-1">
            {renderMarkdown(document.rawText)}
          </div>
        )}
      </div>

      {/* Floating Selection Tooltip */}
      {selectionCoords && selectedText && (
        <div
          style={{
            position: 'fixed',
            left: `${selectionCoords.x}px`,
            top: `${selectionCoords.y}px`,
          }}
          className="z-50 flex items-center gap-1.5 p-1 bg-[#1c1e2e] border border-[#313752] rounded shadow-[0_0_16px_rgba(99,102,241,0.3)] animate-in fade-in zoom-in-95 duration-150"
        >
          <button
            onClick={() => {
              onSendToSynthesizer(selectedText);
              setSelectionCoords(null);
            }}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-[#6366f1] text-[#ffffff] rounded hover:bg-[#818cf8] transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            <span>Rewrite Excerpt</span>
          </button>

          <button
            onClick={() => {
              onCreateFlashcardFromSelection(selectedText);
              setSelectionCoords(null);
            }}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium bg-[#141622] text-[#c084fc] border border-[#a855f7]/40 rounded hover:bg-[#a855f7]/20 transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            <span>Make Flashcard</span>
          </button>
        </div>
      )}
    </div>
  );
};
