/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DocumentItem, Flashcard, GraphNode, ViewMode } from './types';
import { INITIAL_DOCUMENTS, INITIAL_FLASHCARDS, INITIAL_GRAPH_NODES } from './data/defaultDocuments';
import { Header } from './components/Header';
import { NavigationSidebar } from './components/NavigationSidebar';
import { SourceReaderPane } from './components/SourceReaderPane';
import { RewriterPane } from './components/RewriterPane';
import { FlashcardsView } from './components/FlashcardsView';
import { ConceptGraphView } from './components/ConceptGraphView';
import { ZenFocusView } from './components/ZenFocusView';

export default function App() {
  // Load persistent documents or defaults
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem('obsidian_lumina_docs');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DOCUMENTS;
  });

  const [activeDocumentId, setActiveDocumentId] = useState<string>(() => {
    return documents[0]?.id || 'doc-raft';
  });

  // Load persistent flashcards or defaults
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem('obsidian_lumina_cards');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_FLASHCARDS;
  });

  const [graphNodes] = useState<GraphNode[]>(INITIAL_GRAPH_NODES);
  const [currentView, setCurrentView] = useState<ViewMode>('studio');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [synthesizerExcerpt, setSynthesizerExcerpt] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('obsidian_lumina_docs', JSON.stringify(documents));
    } catch {
      // ignore
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem('obsidian_lumina_cards', JSON.stringify(flashcards));
    } catch {
      // ignore
    }
  }, [flashcards]);

  const activeDoc = documents.find(d => d.id === activeDocumentId) || documents[0];

  // Document Operations
  const handleCreateDocument = () => {
    const newDocId = `doc-${Date.now()}`;
    const newDoc: DocumentItem = {
      id: newDocId,
      title: 'Untitled Research Draft',
      category: 'General Notes',
      tags: ['draft', 'scratchpad'],
      lastModified: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
      rawText: `# Untitled Research Draft\n\nRecord operational invariants, formal proofs, or architecture notes here.\n\n## 1. System Invariants\n- Define foundational constraints.`,
      revision: 'REV 01.0',
      diffStats: { additions: 0, deletions: 0 },
    };

    setDocuments([newDoc, ...documents]);
    setActiveDocumentId(newDocId);
    if (currentView !== 'studio') {
      setCurrentView('studio');
    }
  };

  const handleDeleteDocument = (id: string) => {
    if (documents.length <= 1) return;
    const remaining = documents.filter(d => d.id !== id);
    setDocuments(remaining);
    if (activeDocumentId === id) {
      setActiveDocumentId(remaining[0].id);
    }
  };

  const handleUpdateText = (newText: string) => {
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === activeDocumentId
          ? {
              ...doc,
              rawText: newText,
              lastModified: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
            }
          : doc
      )
    );
  };

  const handleUpdateTitle = (newTitle: string) => {
    setDocuments(docs =>
      docs.map(doc =>
        doc.id === activeDocumentId
          ? { ...doc, title: newTitle }
          : doc
      )
    );
  };

  const handleApplySynthesizedToSource = (synthesizedText: string) => {
    const currentRevNum = parseFloat(activeDoc.revision.replace('REV ', '')) || 1.0;
    const nextRev = `REV ${(currentRevNum + 0.1).toFixed(1)}`;

    setDocuments(docs =>
      docs.map(doc =>
        doc.id === activeDocumentId
          ? {
              ...doc,
              rawText: synthesizedText,
              synthesizedText: synthesizedText,
              revision: nextRev,
              lastModified: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' UTC',
            }
          : doc
      )
    );
  };

  // Flashcards Operations
  const handleAddFlashcard = (cardData: Omit<Flashcard, 'id'>) => {
    const newCard: Flashcard = {
      ...cardData,
      id: `fc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setFlashcards(prev => [newCard, ...prev]);
  };

  const handleUpdateCardMastery = (id: string, level: 'new' | 'review' | 'mastered') => {
    setFlashcards(cards =>
      cards.map(c =>
        c.id === id
          ? {
              ...c,
              masteryLevel: level,
              repetitions: level === 'mastered' ? c.repetitions + 1 : c.repetitions,
              lastStudied: 'Just now',
            }
          : c
      )
    );
  };

  const handleDeleteCard = (id: string) => {
    setFlashcards(cards => cards.filter(c => c.id !== id));
  };

  const handleSendToSynthesizer = (selectedText?: string) => {
    if (selectedText) {
      setSynthesizerExcerpt(selectedText);
    } else {
      setSynthesizerExcerpt(null);
    }
    if (currentView !== 'studio') {
      setCurrentView('studio');
    }
  };

  const handleCreateFlashcardFromSelection = (selection: string) => {
    handleAddFlashcard({
      documentId: activeDoc.id,
      question: `Define / explain mechanism: "${selection.slice(0, 70)}..."`,
      answer: selection,
      category: activeDoc.category,
      tags: [...activeDoc.tags],
      masteryLevel: 'new',
      repetitions: 0,
    });
    setCurrentView('flashcards');
  };

  const handleExport = () => {
    const blob = new Blob([activeDoc.rawText], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeDoc.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const masteredCount = flashcards.filter(c => c.masteryLevel === 'mastered').length;
  const reviewCount = flashcards.filter(c => c.masteryLevel === 'review').length;
  const newCount = flashcards.filter(c => c.masteryLevel === 'new').length;

  return (
    <div className="min-h-screen bg-[#000000] text-[#ffffff] flex flex-col font-sans select-none antialiased">
      {/* Top Application Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        activeRevision={activeDoc?.revision || 'REV 01.0'}
        diffStats={activeDoc?.diffStats}
        onExport={handleExport}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex overflow-hidden">
        {currentView === 'studio' && (
          <div className="flex-1 flex w-full overflow-hidden">
            {/* Pane 1: Collapsible Navigation Sidebar */}
            <NavigationSidebar
              documents={documents}
              activeDocumentId={activeDocumentId}
              onSelectDocument={setActiveDocumentId}
              onCreateDocument={handleCreateDocument}
              onDeleteDocument={handleDeleteDocument}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              masteredCount={masteredCount}
              reviewCount={reviewCount}
              newCount={newCount}
            />

            {/* Pane 2: Source Document Reader Panel */}
            <SourceReaderPane
              document={activeDoc}
              onUpdateText={handleUpdateText}
              onUpdateTitle={handleUpdateTitle}
              onSendToSynthesizer={handleSendToSynthesizer}
              onCreateFlashcardFromSelection={handleCreateFlashcardFromSelection}
            />

            {/* Pane 3: Active Rewriter Workspace */}
            <RewriterPane
              sourceText={synthesizerExcerpt || activeDoc.rawText}
              synthesizedText={activeDoc.synthesizedText}
              onApplyToSource={handleApplySynthesizedToSource}
              onAddFlashcard={handleAddFlashcard}
            />
          </div>
        )}

        {currentView === 'flashcards' && (
          <FlashcardsView
            cards={flashcards}
            onUpdateCardMastery={handleUpdateCardMastery}
            onAddCard={handleAddFlashcard}
            onDeleteCard={handleDeleteCard}
          />
        )}

        {currentView === 'graph' && (
          <ConceptGraphView
            nodes={graphNodes}
            documents={documents}
            onSelectDocument={docId => {
              setActiveDocumentId(docId);
              setCurrentView('studio');
            }}
          />
        )}

        {currentView === 'focus' && (
          <ZenFocusView
            document={activeDoc}
            onUpdateText={handleUpdateText}
            onSynthesize={() => setCurrentView('studio')}
          />
        )}
      </main>
    </div>
  );
}
