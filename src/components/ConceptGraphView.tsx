import React, { useState, useRef, useEffect } from 'react';
import { GraphNode, DocumentItem } from '../types';
import { Network, Sparkles, ArrowRight, Search, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ConceptGraphViewProps {
  nodes: GraphNode[];
  documents: DocumentItem[];
  onSelectDocument: (docId: string) => void;
}

export const ConceptGraphView: React.FC<ConceptGraphViewProps> = ({
  nodes,
  documents,
  onSelectDocument,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[0]?.id || null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const categories = Array.from(new Set(nodes.map(n => n.category)));
  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];
  const associatedDoc = documents.find(d => d.id === selectedNode?.documentId);

  const filteredNodes = nodes.filter(n => {
    const matchSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory ? n.category === filterCategory : true;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-[#000000] overflow-hidden select-none relative">
      {/* Top / Left Toolbar Controls */}
      <div className="p-4 border-b lg:border-b-0 lg:border-r border-[#23273a] bg-[#0d0e15] w-full lg:w-80 flex flex-col gap-4 shrink-0 z-20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Network className="w-4 h-4 text-[#06b6d4]" />
            <span className="font-mono text-[10px] text-[#06b6d4] tracking-wider uppercase">
              TOPOLOGICAL KNOWLEDGE GRAPH
            </span>
          </div>
          <h3 className="font-headline font-semibold text-lg text-[#ffffff]">
            Concept Connections
          </h3>
          <p className="font-mono text-[11px] text-[#94a3b8] mt-1">
            Luminous relational mapping between distributed invariants, systems, and papers.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search concepts or theorems..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#000000] border border-[#23273a] rounded px-8 py-1.5 text-xs text-[#ffffff] focus-lumina"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterCategory(null)}
            className={`font-mono text-[10px] px-2 py-0.5 rounded transition-all ${
              filterCategory === null
                ? 'bg-[#06b6d4]/20 border border-[#06b6d4] text-[#06b6d4]'
                : 'bg-[#141622] border border-[#23273a] text-[#94a3b8]'
            }`}
          >
            All ({nodes.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`font-mono text-[10px] px-2 py-0.5 rounded transition-all ${
                filterCategory === cat
                  ? 'bg-[#06b6d4]/20 border border-[#06b6d4] text-[#06b6d4]'
                  : 'bg-[#141622] border border-[#23273a] text-[#94a3b8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Inspector Panel for Selected Node */}
        {selectedNode && (
          <div className="mt-auto p-4 rounded-lg bg-[#141622] border border-[#23273a] glow-indigo flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#818cf8] uppercase">
                {selectedNode.category}
              </span>
              <span className="font-mono text-[9px] text-[#06b6d4] px-1.5 py-0.2 rounded bg-[#000000] border border-[#23273a]">
                {selectedNode.connections.length} LINKS
              </span>
            </div>

            <h4 className="font-headline font-semibold text-sm text-[#ffffff]">
              {selectedNode.label}
            </h4>

            {associatedDoc && (
              <div className="text-[11px] text-[#94a3b8] line-clamp-3 leading-relaxed">
                {associatedDoc.rawText.slice(0, 160)}...
              </div>
            )}

            {/* Linked Nodes list */}
            <div>
              <span className="font-mono text-[9px] text-[#94a3b8] block mb-1">
                CONNECTED NODES:
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedNode.connections.map(connId => {
                  const target = nodes.find(n => n.id === connId);
                  return (
                    <button
                      key={connId}
                      onClick={() => setSelectedNodeId(connId)}
                      className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#000000] border border-[#23273a] hover:border-[#6366f1] text-[#c0c1ff] transition-colors"
                    >
                      {target?.label || connId}
                    </button>
                  );
                })}
              </div>
            </div>

            {associatedDoc && (
              <button
                onClick={() => onSelectDocument(associatedDoc.id)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#6366f1] hover:bg-[#818cf8] text-[#ffffff] text-xs font-medium shadow-[0_0_12px_rgba(99,102,241,0.35)] transition-all"
              >
                <span>Open Source Paper</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* SVG Canvas Area */}
      <div className="flex-1 relative overflow-hidden bg-[#000000] flex items-center justify-center min-h-[450px]">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#23273a 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Zoom controls */}
        <div className="absolute right-4 bottom-4 z-20 flex items-center gap-1 bg-[#0d0e15] border border-[#23273a] p-1 rounded-md">
          <button
            onClick={() => setZoom(z => Math.min(1.6, z + 0.15))}
            className="p-1.5 text-[#94a3b8] hover:text-[#ffffff] rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
            className="p-1.5 text-[#94a3b8] hover:text-[#ffffff] rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 text-[#94a3b8] hover:text-[#ffffff] rounded transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive SVG Network */}
        <svg
          className="w-full h-full max-w-5xl"
          viewBox="0 0 1150 720"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s ease-out' }}
        >
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Connections */}
          {filteredNodes.flatMap(node =>
            node.connections.map(targetId => {
              const target = nodes.find(n => n.id === targetId);
              if (!target) return null;
              const isHighlighted =
                selectedNodeId === node.id ||
                selectedNodeId === target.id ||
                hoveredNodeId === node.id ||
                hoveredNodeId === target.id;

              return (
                <line
                  key={`${node.id}-${target.id}`}
                  x1={node.x}
                  y1={node.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={isHighlighted ? '#818cf8' : '#1c2033'}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeDasharray={isHighlighted ? 'none' : '4 4'}
                  className="transition-all duration-300"
                />
              );
            })
          )}

          {/* Render Nodes */}
          {filteredNodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isConnected =
              selectedNode && selectedNode.connections.includes(node.id);

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={() => setSelectedNodeId(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer group"
              >
                {/* Glow ring if selected */}
                {(isSelected || isHovered) && (
                  <circle
                    r="24"
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="1.5"
                    strokeOpacity="0.4"
                    className="animate-pulse"
                  />
                )}

                {/* Node circle */}
                <circle
                  r={isSelected ? 14 : isConnected ? 11 : 9}
                  fill={isSelected ? '#6366f1' : isConnected ? '#06b6d4' : '#141622'}
                  stroke={isSelected ? '#c0c1ff' : isConnected ? '#4cd7f6' : '#23273a'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  filter={isSelected ? 'url(#glowEffect)' : undefined}
                  className="transition-all duration-200"
                />

                {/* Label text */}
                <text
                  y={isSelected ? 26 : 22}
                  textAnchor="middle"
                  className={`font-mono text-[11px] transition-colors pointer-events-none select-none ${
                    isSelected
                      ? 'fill-[#ffffff] font-bold'
                      : isConnected
                      ? 'fill-[#c0c1ff] font-medium'
                      : 'fill-[#94a3b8]'
                  }`}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
