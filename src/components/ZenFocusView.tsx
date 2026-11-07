import React, { useState } from 'react';
import { DocumentItem } from '../types';
import { Sparkles, Eye, Edit3, Check, Copy } from 'lucide-react';

interface ZenFocusViewProps {
  document: DocumentItem;
  onUpdateText: (text: string) => void;
  onSynthesize: () => void;
}

export const ZenFocusView: React.FC<ZenFocusViewProps> = ({
  document,
  onUpdateText,
  onSynthesize,
}) => {
  const [isRaw, setIsRaw] = useState(true);
  const [copied, setCopied] = useState(false);

  const wordCount = document.rawText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = document.rawText.length;

  const handleCopy = () => {
    navigator.clipboard.writeText(document.rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#ffffff] select-text overflow-hidden">
      {/* Zen Status Top Bar */}
      <div className="py-2 px-6 border-b border-[#23273a]/50 flex items-center justify-between text-[11px] font-mono text-[#94a3b8] shrink-0">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#10b981]" />
          <span className="text-[#f1f5f9] font-medium">{document.title}</span>
          <span>·</span>
          <span>{document.revision}</span>
        </div>

        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
          <div className="flex items-center bg-[#0d0e15] border border-[#23273a] rounded p-0.5">
            <button
              onClick={() => setIsRaw(true)}
              className={`px-2 py-0.5 rounded text-xs transition-all ${
                isRaw ? 'bg-[#141622] text-[#818cf8]' : 'text-[#94a3b8]'
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setIsRaw(false)}
              className={`px-2 py-0.5 rounded text-xs transition-all ${
                !isRaw ? 'bg-[#141622] text-[#818cf8]' : 'text-[#94a3b8]'
              }`}
            >
              Preview
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="p-1 text-[#94a3b8] hover:text-[#ffffff] transition-colors"
            title="Copy Text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onSynthesize}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded bg-[#6366f1] hover:bg-[#818cf8] text-[#ffffff] shadow-[0_0_12px_rgba(99,102,241,0.35)] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Synthesize</span>
          </button>
        </div>
      </div>

      {/* Main Focus Writing Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 max-w-4xl w-full mx-auto">
        {isRaw ? (
          <textarea
            value={document.rawText}
            onChange={e => onUpdateText(e.target.value)}
            className="w-full h-full bg-transparent text-[#ffffff] font-mono text-sm leading-relaxed resize-none border-none outline-none focus:outline-none placeholder-[#94a3b8]/40"
            placeholder="Type freely without distractions..."
            autoFocus
          />
        ) : (
          <div className="prose prose-invert max-w-none text-sm text-[#d4e4fa] leading-relaxed whitespace-pre-wrap font-sans">
            {document.rawText}
          </div>
        )}
      </div>
    </div>
  );
};
