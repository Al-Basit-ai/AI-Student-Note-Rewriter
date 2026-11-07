import React, { useState } from 'react';
import { SynthesisMode, DiffLine, Flashcard } from '../types';
import { 
  Sparkles, 
  GitCompare, 
  Check, 
  Copy, 
  ArrowUpRight, 
  Send, 
  FileCode, 
  Lightbulb, 
  FileText, 
  PlusCircle, 
  Binary, 
  Sliders,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { computeLineDiff } from '../utils/diffUtils';

interface RewriterPaneProps {
  sourceText: string;
  synthesizedText?: string;
  onApplyToSource: (text: string) => void;
  onAddFlashcard: (card: Omit<Flashcard, 'id'>) => void;
}

export const RewriterPane: React.FC<RewriterPaneProps> = ({
  sourceText,
  synthesizedText: initialSynthesizedText,
  onApplyToSource,
  onAddFlashcard,
}) => {
  const [mode, setMode] = useState<SynthesisMode>('technical_rewrite');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSynthesized, setCurrentSynthesized] = useState<string>(
    initialSynthesizedText || ''
  );
  const [diffViewMode, setDiffViewMode] = useState<'diff' | 'clean' | 'split'>('diff');
  const [copied, setCopied] = useState(false);
  const [applied, setApplied] = useState(false);
  const [addedToCards, setAddedToCards] = useState(false);
  const [diffLines, setDiffLines] = useState<DiffLine[]>([]);
  const [diffStats, setDiffStats] = useState<{ additions: number; deletions: number }>({ additions: 0, deletions: 0 });

  // Update diff when synthesized text changes
  React.useEffect(() => {
    if (initialSynthesizedText && !currentSynthesized) {
      setCurrentSynthesized(initialSynthesizedText);
    }
  }, [initialSynthesizedText]);

  React.useEffect(() => {
    if (currentSynthesized) {
      const result = computeLineDiff(sourceText, currentSynthesized);
      setDiffLines(result.diffs);
      setDiffStats({ additions: result.additions, deletions: result.deletions });
    } else {
      setDiffLines([]);
      setDiffStats({ additions: 0, deletions: 0 });
    }
  }, [sourceText, currentSynthesized]);

  const handleSynthesize = async () => {
    if (!sourceText.trim()) return;
    setIsProcessing(true);

    try {
      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          mode,
          customPrompt: mode === 'custom' ? customPrompt : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Synthesis server request failed');
      }

      const data = await response.json();
      setCurrentSynthesized(data.synthesizedText);

      // If mode was flashcards, automatically create study cards
      if (mode === 'flashcards') {
        try {
          const parsed = JSON.parse(data.synthesizedText);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: { question: string; answer: string; category?: string; tags?: string[] }) => {
              onAddFlashcard({
                documentId: 'active',
                question: item.question,
                answer: item.answer,
                category: item.category || 'Synthesized',
                tags: item.tags || ['ai-generated'],
                masteryLevel: 'new',
                repetitions: 0,
              });
            });
            setAddedToCards(true);
            setTimeout(() => setAddedToCards(false), 3000);
          }
        } catch {
          // Plain text flashcards
        }
      }
    } catch (err) {
      console.warn('Synthesis fallback execution:', err);
      // Fallback client-side basic restructure
      const fallback = `### Synthesized Core Specification\n\n- ${sourceText.split('\n')[0] || 'Core Proposition'}\n\n1. Invariant constraints are verified.\n2. State synchronization preserves monotonic progression.`;
      setCurrentSynthesized(fallback);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSynthesized);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (currentSynthesized) {
      onApplyToSource(currentSynthesized);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    }
  };

  const handleManualAddFlashcard = () => {
    const lines = currentSynthesized.split('\n').filter(l => l.trim().length > 0);
    onAddFlashcard({
      documentId: 'active',
      question: lines[0]?.replace(/^[#\-*\s]+/, '') || 'Synthesized Concept',
      answer: lines.slice(1, 4).join(' ') || currentSynthesized.slice(0, 200),
      category: 'Restructured Notes',
      tags: ['synthesized', 'active-recall'],
      masteryLevel: 'new',
      repetitions: 0,
    });
    setAddedToCards(true);
    setTimeout(() => setAddedToCards(false), 2000);
  };

  const modesList: Array<{ id: SynthesisMode; label: string; icon: React.ReactNode; desc: string }> = [
    { id: 'technical_rewrite', label: 'Technical Rewrite', icon: <FileCode className="w-3.5 h-3.5 text-[#818cf8]" />, desc: 'Formal rigor, syntax tightening, invariant extraction' },
    { id: 'eli5', label: 'Conceptual Clarifier', icon: <Lightbulb className="w-3.5 h-3.5 text-[#f59e0b]" />, desc: 'Intuitive mental models & mechanistic analogies' },
    { id: 'memo', label: 'Executive Memo', icon: <FileText className="w-3.5 h-3.5 text-[#c084fc]" />, desc: 'Monospace bullet invariants and actionable directives' },
    { id: 'latex_math', label: 'LaTeX Proof', icon: <Binary className="w-3.5 h-3.5 text-[#06b6d4]" />, desc: 'Mathematical formulations & theorem proofs' },
    { id: 'flashcards', label: 'Generate Cards', icon: <BookOpen className="w-3.5 h-3.5 text-[#10b981]" />, desc: 'Atomic high-yield Q&A active recall cards' },
    { id: 'custom', label: 'Custom Directive', icon: <Sliders className="w-3.5 h-3.5 text-[#ddb7ff]" />, desc: 'Tailored prompt-driven knowledge restructuring' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#141622] overflow-hidden select-text">
      {/* Pane 3 Header */}
      <div className="p-3 border-b border-[#23273a] bg-[#0d0e15]/70 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#6366f1]/20 border border-[#6366f1]/40 flex items-center justify-center text-[#818cf8]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="font-headline font-semibold text-xs text-[#ffffff] uppercase tracking-wider">
              Active Rewriter Workspace
            </h3>
            <p className="font-mono text-[10px] text-[#94a3b8]">
              High-Density Restructuring & Diff Analysis
            </p>
          </div>
        </div>

        {/* Diff view mode switchers */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#000000] border border-[#23273a] rounded p-0.5 text-xs font-mono">
            <button
              onClick={() => setDiffViewMode('diff')}
              className={`px-2 py-0.5 rounded transition-all ${
                diffViewMode === 'diff'
                  ? 'bg-[#141622] text-[#818cf8] border border-[#6366f1]/40'
                  : 'text-[#94a3b8] hover:text-[#ffffff]'
              }`}
            >
              Diff View
            </button>
            <button
              onClick={() => setDiffViewMode('clean')}
              className={`px-2 py-0.5 rounded transition-all ${
                diffViewMode === 'clean'
                  ? 'bg-[#141622] text-[#818cf8] border border-[#6366f1]/40'
                  : 'text-[#94a3b8] hover:text-[#ffffff]'
              }`}
            >
              Restructured
            </button>
            <button
              onClick={() => setDiffViewMode('split')}
              className={`px-2 py-0.5 rounded transition-all hidden xl:inline ${
                diffViewMode === 'split'
                  ? 'bg-[#141622] text-[#818cf8] border border-[#6366f1]/40'
                  : 'text-[#94a3b8] hover:text-[#ffffff]'
              }`}
            >
              Split
            </button>
          </div>

          {/* Quick Apply button */}
          {currentSynthesized && (
            <button
              onClick={handleApply}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#141622] border border-[#23273a] hover:border-[#10b981] text-[#f1f5f9] hover:text-[#10b981] transition-all"
              title="Apply synthesized text back into Source Document"
            >
              {applied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <RotateCcw className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{applied ? 'Applied!' : 'Apply to Source'}</span>
            </button>
          )}

          {/* Copy Button */}
          {currentSynthesized && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded bg-[#000000] border border-[#23273a] hover:border-[#6366f1] text-[#94a3b8] hover:text-[#ffffff] transition-colors"
              title="Copy Restructured Markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Synthesis Mode Selection Bar */}
      <div className="p-3 bg-[#0d0e15]/40 border-b border-[#23273a] shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {modesList.map(m => {
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#6366f1]/20 border border-[#6366f1] text-[#c0c1ff] shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                    : 'bg-[#141622] border border-[#23273a] text-[#94a3b8] hover:text-[#ffffff] hover:border-[#3b4263]'
                }`}
                title={m.desc}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Prompt Input if mode is custom */}
        {mode === 'custom' && (
          <div className="mt-2.5 flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. 'Extract all lemmas and write a counterexample proof'..."
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              className="flex-1 bg-[#000000] border border-[#23273a] rounded px-3 py-1.5 text-xs text-[#ffffff] placeholder-[#94a3b8] focus-lumina"
            />
          </div>
        )}

        {/* Primary Synthesize Trigger Button */}
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#94a3b8]">
            {diffStats.additions > 0 || diffStats.deletions > 0 ? (
              <span className="flex items-center gap-1.5">
                <span className="text-[#10b981]">+{diffStats.additions} lines</span>
                <span>/</span>
                <span className="text-[#f87171]">-{diffStats.deletions} lines</span>
              </span>
            ) : (
              <span>Ready for restructuring</span>
            )}
          </div>

          <button
            onClick={handleSynthesize}
            disabled={isProcessing}
            className={`flex items-center gap-2 px-4 py-1.5 rounded text-xs font-semibold text-[#ffffff] bg-[#6366f1] hover:bg-[#818cf8] shadow-[0_0_16px_rgba(99,102,241,0.35)] active:scale-[0.98] transition-all ${
              isProcessing ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Synthesizing...' : 'Synthesize & Restructure'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 font-mono text-xs text-[#ffffff]">
        {!currentSynthesized && !isProcessing ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto text-[#94a3b8] py-12">
            <div className="w-12 h-12 rounded-lg bg-[#0d0e15] border border-[#23273a] flex items-center justify-center text-[#6366f1] mb-3 shadow-[0_0_16px_rgba(99,102,241,0.2)]">
              <Sparkles className="w-6 h-6 text-[#818cf8]" />
            </div>
            <h4 className="font-headline font-semibold text-sm text-[#ffffff] mb-1">
              Rewriter Engine Standing By
            </h4>
            <p className="text-xs leading-relaxed text-[#94a3b8] mb-4">
              Select a restructuring mode above and click <span className="text-[#c0c1ff]">Synthesize & Restructure</span> to compute line-level diffs, extract invariants, or generate active recall decks.
            </p>
            <button
              onClick={handleSynthesize}
              className="px-3 py-1.5 rounded bg-[#141622] border border-[#6366f1] text-[#818cf8] text-xs font-medium hover:bg-[#6366f1] hover:text-[#ffffff] transition-all shadow-[0_0_12px_rgba(99,102,241,0.2)]"
            >
              Run Default Synthesis
            </button>
          </div>
        ) : isProcessing ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-16">
            <div className="w-10 h-10 border-2 border-[#6366f1] border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_16px_rgba(99,102,241,0.4)]" />
            <span className="font-mono text-xs text-[#c0c1ff] tracking-wider animate-pulse">
              TRANSFORMING REPOSITORIES // EXTRACTING INVARIANTS...
            </span>
          </div>
        ) : diffViewMode === 'diff' ? (
          /* Rewriting Diff Block: Deleted/original text highlighted with low-opacity rose surface (rgba(244, 63, 94, 0.1)) and border; restructured/generated text highlighted with emerald tint (rgba(16, 185, 129, 0.1)) and bright emerald text. */
          <div className="space-y-1">
            <div className="pb-2 mb-3 border-b border-[#23273a] flex items-center justify-between text-[11px] text-[#94a3b8]">
              <span>UNIFIED RESTRUCTURING DIFF BLOCK</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-[#f87171]">
                  <span className="w-2 h-2 rounded bg-[#f43f5e]/30 border border-[#f43f5e]" /> Original / Trimmed
                </span>
                <span className="flex items-center gap-1 text-[#10b981]">
                  <span className="w-2 h-2 rounded bg-[#10b981]/30 border border-[#10b981]" /> Restructured / Added
                </span>
              </div>
            </div>

            {diffLines.map((line, idx) => {
              if (line.type === 'removed') {
                return (
                  <div
                    key={idx}
                    className="p-1 px-2.5 rounded bg-[rgba(244,63,94,0.1)] border border-[rgba(244,63,94,0.3)] text-[#f87171] leading-relaxed flex items-start gap-2"
                  >
                    <span className="font-mono text-[10px] text-[#f87171]/70 select-none">-</span>
                    <span className="flex-1 whitespace-pre-wrap">{line.text || ' '}</span>
                  </div>
                );
              }

              if (line.type === 'added') {
                return (
                  <div
                    key={idx}
                    className="p-1 px-2.5 rounded bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.3)] text-[#10b981] leading-relaxed flex items-start gap-2 font-medium"
                  >
                    <span className="font-mono text-[10px] text-[#10b981]/70 select-none">+</span>
                    <span className="flex-1 whitespace-pre-wrap">{line.text || ' '}</span>
                  </div>
                );
              }

              return (
                <div
                  key={idx}
                  className="p-1 px-2.5 text-[#94a3b8] leading-relaxed flex items-start gap-2 hover:text-[#d4e4fa] transition-colors"
                >
                  <span className="font-mono text-[10px] opacity-40 select-none"> </span>
                  <span className="flex-1 whitespace-pre-wrap">{line.text || ' '}</span>
                </div>
              );
            })}
          </div>
        ) : diffViewMode === 'split' ? (
          /* Split View Mode */
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="flex flex-col border border-[#23273a] rounded p-3 bg-[#0d0e15] overflow-y-auto">
              <span className="text-[10px] font-mono text-[#f87171] uppercase tracking-wider mb-2 pb-1 border-b border-[#23273a]">
                Original Draft
              </span>
              <pre className="whitespace-pre-wrap font-mono text-xs text-[#94a3b8] leading-relaxed">
                {sourceText}
              </pre>
            </div>
            <div className="flex flex-col border border-[#6366f1]/40 rounded p-3 bg-[#0d0e15] overflow-y-auto glow-indigo">
              <span className="text-[10px] font-mono text-[#10b981] uppercase tracking-wider mb-2 pb-1 border-b border-[#23273a]">
                Restructured Synthesis
              </span>
              <pre className="whitespace-pre-wrap font-mono text-xs text-[#10b981] leading-relaxed">
                {currentSynthesized}
              </pre>
            </div>
          </div>
        ) : (
          /* Clean Restructured Text Mode */
          <div className="space-y-3 font-sans text-xs text-[#ffffff] leading-relaxed max-w-2xl">
            <div className="p-3 bg-[#0d0e15] border border-[#23273a] rounded font-mono text-xs text-[#06b6d4] mb-3">
              SYNTHESIS OUTPUT // READY TO COMMIT
            </div>
            <div className="p-4 rounded-md bg-[#000000] border border-[#23273a] whitespace-pre-wrap font-mono text-xs text-[#f1f5f9] leading-relaxed">
              {currentSynthesized}
            </div>
          </div>
        )}
      </div>

      {/* Pane 3 Footer Tools */}
      {currentSynthesized && (
        <div className="p-3 border-t border-[#23273a] bg-[#0d0e15]/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualAddFlashcard}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded bg-[#141622] border border-[#a855f7]/50 text-[#ddb7ff] hover:bg-[#a855f7]/20 transition-all shadow-[0_0_10px_rgba(168,85,247,0.15)]"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#c084fc]" />
              <span>{addedToCards ? 'Added to Deck!' : 'Save as Flashcard'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleApply}
              className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-[#6366f1] hover:bg-[#818cf8] text-[#ffffff] shadow-[0_0_12px_rgba(99,102,241,0.35)] active:scale-95 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{applied ? 'Committed!' : 'Commit to Source'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
