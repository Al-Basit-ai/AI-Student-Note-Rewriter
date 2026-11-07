import React, { useState, useEffect } from 'react';
import { ViewMode } from '../types';
import { 
  Terminal, 
  Layers, 
  BrainCircuit, 
  Network, 
  Volume2, 
  VolumeX, 
  Clock, 
  Download, 
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { focusAudio } from '../utils/audioEngine';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  activeRevision: string;
  diffStats?: { additions: number; deletions: number };
  onExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  activeRevision,
  diffStats = { additions: 38, deletions: 64 },
  onExport,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => (s > 0 ? s - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const toggleAudio = () => {
    const active = focusAudio.toggle();
    setIsPlayingAudio(active);
  };

  const toggleTimer = () => {
    if (!isTimerRunning && timerSeconds === 0) {
      setTimerSeconds(25 * 60);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-14 bg-[#000000] border-b border-[#23273a] px-4 lg:px-6 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & System Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#141622] border border-[#23273a] flex items-center justify-center text-[#6366f1] shadow-[0_0_12px_rgba(99,102,241,0.25)]">
            <Terminal className="w-4 h-4 text-[#818cf8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline font-semibold text-sm tracking-tight text-[#ffffff]">
                OBSIDIAN LUMINA
              </span>
              <span className="font-mono text-[10px] text-[#94a3b8] tracking-wider px-1.5 py-0.5 rounded bg-[#141622] border border-[#23273a]">
                AMOLED//v3.8
              </span>
            </div>
          </div>
        </div>

        {/* Live Sync Pip */}
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#23273a]/60">
          <div className="relative flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-ping opacity-60 absolute" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] relative shadow-[0_0_8px_#10b981]" />
          </div>
          <span className="font-mono text-[11px] text-[#94a3b8]">SYNCED</span>
        </div>
      </div>

      {/* Center View Selector */}
      <nav className="flex items-center bg-[#0d0e15] border border-[#23273a] p-1 rounded-md">
        <button
          onClick={() => onViewChange('studio')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-all ${
            currentView === 'studio'
              ? 'bg-[#141622] text-[#ffffff] border border-[#6366f1]/50 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
              : 'text-[#94a3b8] hover:text-[#f1f5f9] border border-transparent'
          }`}
          title="3-Pane Research & Synthesis Studio"
        >
          <Layers className="w-3.5 h-3.5 text-[#818cf8]" />
          <span className="hidden md:inline">Split Studio</span>
        </button>

        <button
          onClick={() => onViewChange('flashcards')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-all ${
            currentView === 'flashcards'
              ? 'bg-[#141622] text-[#ffffff] border border-[#a855f7]/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
              : 'text-[#94a3b8] hover:text-[#f1f5f9] border border-transparent'
          }`}
          title="Active Recall & Spaced Repetition"
        >
          <BrainCircuit className="w-3.5 h-3.5 text-[#c084fc]" />
          <span className="hidden md:inline">Flashcards</span>
        </button>

        <button
          onClick={() => onViewChange('graph')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-all ${
            currentView === 'graph'
              ? 'bg-[#141622] text-[#ffffff] border border-[#06b6d4]/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
              : 'text-[#94a3b8] hover:text-[#f1f5f9] border border-transparent'
          }`}
          title="Concept Connections Graph"
        >
          <Network className="w-3.5 h-3.5 text-[#06b6d4]" />
          <span className="hidden md:inline">Concept Map</span>
        </button>

        <button
          onClick={() => onViewChange('focus')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded transition-all ${
            currentView === 'focus'
              ? 'bg-[#141622] text-[#ffffff] border border-[#10b981]/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
              : 'text-[#94a3b8] hover:text-[#f1f5f9] border border-transparent'
          }`}
          title="Distraction-Free Zen Workspace"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
          <span className="hidden md:inline">Zen Focus</span>
        </button>
      </nav>

      {/* Right Controls & Indicators */}
      <div className="flex items-center gap-2.5">
        {/* Revision Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-[#0d0e15] border border-[#23273a]">
          <span className="font-mono text-[11px] font-semibold text-[#06b6d4] tracking-wide">
            {activeRevision}
          </span>
          <span className="font-mono text-[10px] text-[#94a3b8]">
            <span className="text-[#10b981]">+{diffStats.additions}</span> /{' '}
            <span className="text-[#f87171]">-{diffStats.deletions}</span>
          </span>
        </div>

        {/* Focus Timer */}
        <button
          onClick={toggleTimer}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono rounded border transition-colors ${
            isTimerRunning
              ? 'bg-[#141622] border-[#818cf8] text-[#c0c1ff] shadow-[0_0_10px_rgba(99,102,241,0.2)]'
              : 'bg-[#0d0e15] border-[#23273a] text-[#94a3b8] hover:text-[#ffffff]'
          }`}
          title="Deep Focus Pomodoro Timer (Click to start/pause)"
        >
          <Clock className="w-3.5 h-3.5 text-[#818cf8]" />
          <span>{formatTimer(timerSeconds)}</span>
        </button>

        {/* Binaural Ambient Audio Toggle */}
        <button
          onClick={toggleAudio}
          className={`p-1.5 rounded border transition-all ${
            isPlayingAudio
              ? 'bg-[#141622] border-[#a855f7] text-[#ddb7ff] shadow-[0_0_12px_rgba(168,85,247,0.3)]'
              : 'bg-[#0d0e15] border-[#23273a] text-[#94a3b8] hover:text-[#ffffff]'
          }`}
          title={isPlayingAudio ? 'Mute Focus Brown Noise' : 'Play Focus Brown Noise'}
        >
          {isPlayingAudio ? <Volume2 className="w-4 h-4 text-[#c084fc]" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="hidden sm:flex p-1.5 rounded bg-[#0d0e15] border border-[#23273a] text-[#94a3b8] hover:text-[#ffffff] transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Export snapshot */}
        <button
          onClick={onExport}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[#141622] border border-[#23273a] hover:border-[#6366f1] text-[#f1f5f9] hover:text-[#ffffff] rounded transition-all"
          title="Export Markdown Document"
        >
          <Download className="w-3.5 h-3.5 text-[#818cf8]" />
          <span className="hidden lg:inline">Export</span>
        </button>
      </div>
    </header>
  );
};
