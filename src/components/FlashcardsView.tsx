import React, { useState } from 'react';
import { Flashcard } from '../types';
import { 
  RotateCw, 
  CheckCircle2, 
  RotateCcw, 
  HelpCircle, 
  Plus, 
  BookOpen, 
  Sparkles, 
  Trash2,
  Filter,
  Check,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface FlashcardsViewProps {
  cards: Flashcard[];
  onUpdateCardMastery: (id: string, level: 'new' | 'review' | 'mastered') => void;
  onAddCard: (card: Omit<Flashcard, 'id'>) => void;
  onDeleteCard: (id: string) => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  cards,
  onUpdateCardMastery,
  onAddCard,
  onDeleteCard,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New card modal form state
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('Core Concepts');
  const [newTags, setNewTags] = useState('active-recall, technical');

  // Filter cards
  const categories = Array.from(new Set(cards.map(c => c.category)));
  const allTags = Array.from(new Set(cards.flatMap(c => c.tags)));

  const filteredCards = cards.filter(card => {
    const matchCat = selectedCategory ? card.category === selectedCategory : true;
    const matchTag = selectedTag ? card.tags.includes(selectedTag) : true;
    return matchCat && matchTag;
  });

  const activeCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1);
    }
  };

  const handleGrade = (level: 'new' | 'review' | 'mastered') => {
    if (activeCard) {
      onUpdateCardMastery(activeCard.id, level);
      handleNext();
    }
  };

  const handleCreateCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    onAddCard({
      documentId: 'custom',
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      category: newCategory.trim() || 'General',
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      masteryLevel: 'new',
      repetitions: 0,
    });

    setNewQuestion('');
    setNewAnswer('');
    setShowAddModal(false);
  };

  const masteredTotal = cards.filter(c => c.masteryLevel === 'mastered').length;
  const reviewTotal = cards.filter(c => c.masteryLevel === 'review').length;
  const newTotal = cards.filter(c => c.masteryLevel === 'new').length;

  return (
    <div className="flex-1 flex flex-col bg-[#000000] overflow-y-auto select-text p-4 lg:p-8">
      {/* Top Deck Banner */}
      <div className="max-w-4xl mx-auto w-full mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] text-[#a855f7] tracking-wider uppercase">
              STUDY DECK // SPACED RETRIEVAL PRACTICE
            </span>
          </div>
          <h2 className="font-headline font-bold text-2xl text-[#ffffff] tracking-tight">
            Active Recall Flashcards
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#6366f1] hover:bg-[#818cf8] text-[#ffffff] text-xs font-semibold shadow-[0_0_16px_rgba(99,102,241,0.35)] active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Flashcard</span>
          </button>
        </div>
      </div>

      {/* Filter and stats bar */}
      <div className="max-w-4xl mx-auto w-full mb-6 p-3 bg-[#0d0e15] border border-[#23273a] rounded-lg flex flex-wrap items-center justify-between gap-3">
        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => { setSelectedCategory(null); setSelectedTag(null); setCurrentIndex(0); }}
            className={`font-mono text-[11px] px-2.5 py-1 rounded transition-all ${
              selectedCategory === null && selectedTag === null
                ? 'bg-[#6366f1]/20 border border-[#6366f1] text-[#818cf8]'
                : 'bg-[#141622] border border-[#23273a] text-[#94a3b8] hover:text-[#ffffff]'
            }`}
          >
            All Decks ({cards.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setSelectedTag(null); setCurrentIndex(0); }}
              className={`font-mono text-[11px] px-2.5 py-1 rounded transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#a855f7]/20 border border-[#a855f7] text-[#c084fc]'
                  : 'bg-[#141622] border border-[#23273a] text-[#94a3b8] hover:text-[#ffffff]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Global counts */}
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1 text-[#10b981]">
            <span className="w-2 h-2 rounded-full bg-[#10b981]" /> {masteredTotal} Mastered
          </span>
          <span className="flex items-center gap-1 text-[#c084fc]">
            <span className="w-2 h-2 rounded-full bg-[#a855f7]" /> {reviewTotal} Review
          </span>
          <span className="flex items-center gap-1 text-[#06b6d4]">
            <span className="w-2 h-2 rounded-full bg-[#06b6d4]" /> {newTotal} New
          </span>
        </div>
      </div>

      {/* Main Flashcard Interactive Stage */}
      {filteredCards.length === 0 ? (
        <div className="max-w-md mx-auto my-12 text-center p-8 bg-[#0d0e15] border border-[#23273a] rounded-lg">
          <HelpCircle className="w-10 h-10 text-[#94a3b8] mx-auto mb-3" />
          <h3 className="font-headline font-semibold text-sm text-[#ffffff] mb-1">
            No Flashcards in this Category
          </h3>
          <p className="text-xs text-[#94a3b8] mb-4">
            Create a card manually or use the Active Rewriter Workspace to generate cards from research papers.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 rounded bg-[#6366f1] text-[#ffffff] text-xs font-medium"
          >
            Add New Flashcard
          </button>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center">
          {/* Deck Counter and Navigation */}
          <div className="flex items-center justify-between text-xs font-mono text-[#94a3b8] mb-3">
            <span className="flex items-center gap-1.5">
              <span>CARD {currentIndex + 1} OF {filteredCards.length}</span>
              <span className="text-[#23273a]">·</span>
              <span className="text-[#818cf8]">{activeCard.category}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                className="p-1 rounded bg-[#0d0e15] border border-[#23273a] hover:border-[#6366f1] text-[#94a3b8] hover:text-[#ffffff] transition-colors"
                title="Previous Card"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded bg-[#0d0e15] border border-[#23273a] hover:border-[#6366f1] text-[#94a3b8] hover:text-[#ffffff] transition-colors"
                title="Next Card"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className={`min-h-[280px] sm:min-h-[320px] rounded-xl p-6 sm:p-8 bg-[#141622] border transition-all cursor-pointer select-none flex flex-col justify-between relative group ${
              isFlipped
                ? 'border-[#a855f7] glow-violet'
                : 'border-[#23273a] hover:border-[#6366f1] glow-indigo'
            }`}
          >
            {/* Upper Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-[#94a3b8] uppercase tracking-wider">
                  {isFlipped ? 'ANSWER / THEORETICAL MECHANISM' : 'QUESTION / PROMPT'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {activeCard.masteryLevel === 'mastered' && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/40">
                    MASTERED
                  </span>
                )}
                {activeCard.masteryLevel === 'review' && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#a855f7]/15 text-[#c084fc] border border-[#a855f7]/40">
                    DUE FOR REVIEW
                  </span>
                )}
                {activeCard.masteryLevel === 'new' && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/40">
                    NEW
                  </span>
                )}

                <button
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteCard(activeCard.id);
                  }}
                  className="p-1 text-[#94a3b8] hover:text-[#f87171] opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete Card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Central Card Content */}
            <div className="my-auto py-4 text-center">
              {!isFlipped ? (
                <h3 className="font-headline font-semibold text-lg sm:text-xl text-[#ffffff] leading-relaxed">
                  {activeCard.question}
                </h3>
              ) : (
                <div className="text-sm sm:text-base text-[#d4e4fa] leading-relaxed font-sans text-left max-w-xl mx-auto">
                  {activeCard.answer}
                </div>
              )}
            </div>

            {/* Card Footer: Tags & Flip hint */}
            <div className="flex items-center justify-between pt-3 border-t border-[#23273a]/60">
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeCard.tags.map(t => (
                  <span
                    key={t}
                    className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#000000] border border-[#23273a] text-[#94a3b8]"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <span className="font-mono text-[10px] text-[#94a3b8] flex items-center gap-1">
                <RotateCw className="w-3 h-3 text-[#818cf8]" />
                <span>{isFlipped ? 'Click to view question' : 'Click to flip'}</span>
              </span>
            </div>
          </div>

          {/* Spaced Repetition Grading Controls */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => handleGrade('new')}
              className="px-4 py-2 rounded-md bg-[#141622] border border-[#f87171]/40 hover:border-[#f87171] text-[#f87171] font-mono text-xs flex items-center gap-1.5 hover:bg-[#f87171]/10 transition-all shadow-[0_0_12px_rgba(244,63,94,0.15)] active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Again (Reset)</span>
            </button>

            <button
              onClick={() => handleGrade('review')}
              className="px-4 py-2 rounded-md bg-[#141622] border border-[#a855f7]/40 hover:border-[#a855f7] text-[#c084fc] font-mono text-xs flex items-center gap-1.5 hover:bg-[#a855f7]/10 transition-all shadow-[0_0_12px_rgba(168,85,247,0.15)] active:scale-95"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Good (Review)</span>
            </button>

            <button
              onClick={() => handleGrade('mastered')}
              className="px-5 py-2 rounded-md bg-[#141622] border border-[#10b981] hover:bg-[#10b981] text-[#10b981] hover:text-[#000000] font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_16px_rgba(16,185,129,0.3)] active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mastered (+1)</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Flashcard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#000000]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0d0e15] border border-[#23273a] rounded-lg p-6 shadow-[0_0_24px_rgba(99,102,241,0.25)] animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-headline font-semibold text-base text-[#ffffff] mb-1">
              Create New Flashcard
            </h3>
            <p className="font-mono text-[11px] text-[#94a3b8] mb-4">
              Draft an atomic active recall prompt and mechanistic answer.
            </p>

            <form onSubmit={handleCreateCardSubmit} className="space-y-3">
              <div>
                <label className="block font-mono text-[10px] text-[#94a3b8] mb-1">
                  QUESTION / PROMPT
                </label>
                <textarea
                  required
                  value={newQuestion}
                  onChange={e => setNewQuestion(e.target.value)}
                  placeholder="e.g. What condition ensures Raft election safety?"
                  className="w-full bg-[#000000] border border-[#23273a] rounded p-2.5 text-xs text-[#ffffff] focus-lumina h-20 resize-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-[#94a3b8] mb-1">
                  EXPLANATION / ANSWER
                </label>
                <textarea
                  required
                  value={newAnswer}
                  onChange={e => setNewAnswer(e.target.value)}
                  placeholder="e.g. Followers vote at most once per term..."
                  className="w-full bg-[#000000] border border-[#23273a] rounded p-2.5 text-xs text-[#ffffff] focus-lumina h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] text-[#94a3b8] mb-1">
                    CATEGORY
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full bg-[#000000] border border-[#23273a] rounded p-2 text-xs text-[#ffffff] focus-lumina"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] text-[#94a3b8] mb-1">
                    TAGS (COMMA SEPARATED)
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    className="w-full bg-[#000000] border border-[#23273a] rounded p-2 text-xs text-[#ffffff] focus-lumina"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#23273a]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded text-xs text-[#94a3b8] hover:text-[#ffffff] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#6366f1] hover:bg-[#818cf8] text-[#ffffff] text-xs font-semibold shadow-[0_0_12px_rgba(99,102,241,0.35)]"
                >
                  Save to Deck
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
