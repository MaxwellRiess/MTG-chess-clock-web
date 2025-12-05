import React, { useState, useEffect, useRef } from 'react';
import {
  Swords,
  Sun,
  Moon,
  Play,
  Pause,
  RotateCcw,
  Settings,
  ChevronRight,
  ShieldAlert,
  Repeat,
  ArrowRightLeft
} from 'lucide-react';

const PHASES = [
  { id: 'start', name: 'Upkeep', icon: Repeat, nextPhase: 'Pre-Combat Main' },
  { id: 'main1', name: 'Pre-Combat Main', icon: Sun, nextPhase: 'Combat' },
  { id: 'combat', name: 'Combat', icon: Swords, nextPhase: 'Post-Combat Main' },
  { id: 'main2', name: 'Post-Combat Main', icon: Moon, nextPhase: 'Pass Turn' },
];

const STARTING_TIME_MINUTES = 25;
const STARTING_LIFE = 20;

export default function App() {
  // Game State
  const [p1Time, setP1Time] = useState(STARTING_TIME_MINUTES * 60);
  const [p2Time, setP2Time] = useState(STARTING_TIME_MINUTES * 60);
  const [p1Life, setP1Life] = useState(STARTING_LIFE);
  const [p2Life, setP2Life] = useState(STARTING_LIFE);

  // Logic State
  const [isActive, setIsActive] = useState(false);
  const [activePlayer, setActivePlayer] = useState(1); // Who has priority (clock running)
  const [turnPlayer, setTurnPlayer] = useState(1); // Whose actual turn it is
  const [currentPhaseIdx, setCurrentPhaseIdx] = useState(0);
  const [turnCount, setTurnCount] = useState(1); // Track turn number
  const [startingPlayer] = useState(1); // Track who started the game for turn cycling
  const [pendingPhaseAdvance, setPendingPhaseAdvance] = useState(false); // Track if phase button was clicked

  // Settings
  const [isTabletopMode, setIsTabletopMode] = useState(true); // Flips P2 UI
  const [showSettings, setShowSettings] = useState(false);
  const [initialTime, setInitialTime] = useState(STARTING_TIME_MINUTES);

  const timerRef = useRef(null);

  // Timer Logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        if (activePlayer === 1) {
          setP1Time((t) => Math.max(0, t - 1));
        } else {
          setP2Time((t) => Math.max(0, t - 1));
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, activePlayer]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const togglePause = (e) => {
    e.stopPropagation();
    setIsActive(!isActive);
  };

  const resetGame = () => {
    setIsActive(false);
    setP1Time(initialTime * 60);
    setP2Time(initialTime * 60);
    setP1Life(STARTING_LIFE);
    setP2Life(STARTING_LIFE);
    setTurnPlayer(1);
    setActivePlayer(1);
    setCurrentPhaseIdx(0);
    setTurnCount(1);
    setShowSettings(false);
  };

  // Switch Priority (The Clock Tap)
  // Pass Priority - Now handles phase advancement when appropriate
  const passPriority = () => {
    const newActivePlayer = activePlayer === 1 ? 2 : 1;

    // Only advance phase if:
    // 1. We're in pending phase advance mode (phase button was clicked)
    // 2. Priority is being passed back to the turn player
    if (pendingPhaseAdvance && newActivePlayer === turnPlayer && activePlayer !== turnPlayer) {
      // Advance to next phase
      if (currentPhaseIdx < PHASES.length - 1) {
        setCurrentPhaseIdx(currentPhaseIdx + 1);
        setActivePlayer(turnPlayer);
      } else {
        // End of turn, pass turn to opponent
        const nextTurnPlayer = turnPlayer === 1 ? 2 : 1;
        setTurnPlayer(nextTurnPlayer);
        setActivePlayer(nextTurnPlayer);
        setCurrentPhaseIdx(0);

        // Increment turn counter only when turn comes back to starting player (full cycle)
        if (nextTurnPlayer === startingPlayer) {
          setTurnCount(tc => tc + 1);
        }
      }
      // Clear the pending flag
      setPendingPhaseAdvance(false);
    } else {
      // Normal priority pass - just switch active player
      setActivePlayer(newActivePlayer);
    }

    if (!isActive) setIsActive(true);
  };

  // Advance Phase - Sets pending flag and passes priority to opponent first
  const nextPhase = (e) => {
    e.stopPropagation();

    // Set flag to indicate we want to advance phase
    setPendingPhaseAdvance(true);

    // Pass priority to opponent (they get a chance to respond)
    const opponent = turnPlayer === 1 ? 2 : 1;
    setActivePlayer(opponent);

    // Ensure timer is running
    if (!isActive) setIsActive(true);
  };

  // Components
  const LifeCounter = ({ life, setLife, rotate }) => (
    <div className={`flex items-center space-x-2 bg-black/30 rounded-full px-3 py-1 ${rotate ? 'rotate-180' : ''}`} onClick={(e) => e.stopPropagation()}>
      <button
        className="w-8 h-8 flex items-center justify-center bg-red-900/50 rounded-full text-white font-bold hover:bg-red-700 active:scale-95"
        onClick={() => setLife(l => l - 1)}
      >-</button>
      <span className="text-xl font-bold w-8 text-center text-white">{life}</span>
      <button
        className="w-8 h-8 flex items-center justify-center bg-green-900/50 rounded-full text-white font-bold hover:bg-green-700 active:scale-95"
        onClick={() => setLife(l => l + 1)}
      >+</button>
    </div>
  );

  const PhaseIndicator = () => (
    <div className="flex justify-center items-center space-x-1 px-2 py-1 bg-gray-900 rounded-lg border border-gray-700">
      {PHASES.map((phase, idx) => {
        const Icon = phase.icon;
        const isCurrent = idx === currentPhaseIdx;
        return (
          <div
            key={phase.id}
            className={`
              flex flex-col items-center justify-center w-8 h-8 rounded 
              ${isCurrent
                ? (turnPlayer === 1 ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white')
                : 'text-gray-600'}
            `}
            title={phase.name}
          >
            <Icon size={14} />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans select-none">

      {/* --- Settings Overlay --- */}
      {showSettings && (
        <div className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-6 space-y-6">
          <h2 className="text-2xl font-bold text-white">Settings</h2>

          <div className="space-y-2 text-center">
            <label className="block text-gray-400">Time per Player (Minutes)</label>
            <div className="flex items-center space-x-4 justify-center">
              <button onClick={() => setInitialTime(t => Math.max(5, t - 5))} className="p-3 bg-gray-800 rounded-lg">-5</button>
              <span className="text-3xl font-mono w-16 text-center">{initialTime}</span>
              <button onClick={() => setInitialTime(t => t + 5)} className="p-3 bg-gray-800 rounded-lg">+5</button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="tabletop"
              checked={isTabletopMode}
              onChange={(e) => setIsTabletopMode(e.target.checked)}
              className="w-6 h-6 rounded bg-gray-700 border-gray-600"
            />
            <label htmlFor="tabletop" className="text-xl">Tabletop Mode (Flip P2)</label>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              onClick={() => setShowSettings(false)}
              className="px-6 py-3 bg-gray-700 rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-bold flex items-center space-x-2"
            >
              <RotateCcw size={18} />
              <span>Reset Game</span>
            </button>
          </div>
        </div>
      )}

      {/* --- Player 2 Area (Top) --- */}
      <div
        onClick={() => {
          if (activePlayer === 2) passPriority();
        }}
        className={`
          relative flex-1 flex flex-col items-center justify-center transition-all duration-300
          ${activePlayer === 2 ? 'bg-gray-800 shadow-[inset_0_0_50px_rgba(234,88,12,0.2)]' : 'bg-gray-900 opacity-60'}
          ${isTabletopMode ? 'rotate-180' : ''}
          cursor-pointer
        `}
      >
        <div className="absolute top-4 left-4">
          <LifeCounter life={p2Life} setLife={setP2Life} rotate={isTabletopMode} />
        </div>

        <div className={`text-7xl md:text-9xl font-mono font-bold tracking-tighter tabular-nums ${activePlayer === 2 ? 'text-orange-500' : 'text-gray-500'}`}>
          {formatTime(p2Time)}
        </div>

        {/* Turn Indicator (Smaller, less prominent than Priority) */}
        {turnPlayer === 2 && activePlayer !== 2 && (
          <div className="mt-2 px-3 py-0.5 bg-orange-900/30 text-orange-600 rounded text-xs font-semibold uppercase tracking-wider border border-orange-800/50">
            Your Turn
          </div>
        )}

        {/* Priority Indicator (Most Prominent) */}
        {activePlayer === 2 && (
          <div className="mt-4 px-4 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm font-bold uppercase tracking-widest animate-pulse border border-orange-500/50">
            Priority
          </div>
        )}

        {/* Stack Interaction Indicator */}
        {activePlayer === 2 && turnPlayer === 1 && (
          <div className="absolute bottom-4 flex items-center space-x-2 text-red-400 font-bold bg-red-900/30 px-3 py-1 rounded">
            <ShieldAlert size={16} />
            <span>Responding</span>
          </div>
        )}

        {/* Phase Button - Player 2's Turn */}
        {turnPlayer === 2 && (
          <button
            onClick={nextPhase}
            className="
              absolute top-6 right-6
              flex items-center space-x-2 px-6 py-4 rounded-lg text-lg font-bold transition-all
              bg-orange-600 text-white border-2 border-orange-400 hover:bg-orange-500 active:scale-95 shadow-lg
              rotate-180
            "
          >
            <span>Move to: {PHASES[currentPhaseIdx].nextPhase}</span>
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* --- Central Control Strip --- */}
      <div className="h-16 bg-black flex items-center justify-between px-4 border-y border-gray-800 z-10">

        {/* Pause / Settings */}
        <div className="flex space-x-2">
          <button onClick={togglePause} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full">
            {isActive ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full">
            <Settings size={20} />
          </button>
        </div>

        {/* Phase Tracker & Current Phase Name */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-1">
          <PhaseIndicator />
          <div className="text-gray-400 text-sm font-semibold">
            {PHASES[currentPhaseIdx].name}
          </div>
        </div>

        {/* Turn Counter */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-gray-900 rounded border border-gray-700">
          <div className="text-gray-400 text-xs uppercase tracking-wider">Turn</div>
          <div className="text-white text-lg font-bold">{turnCount}</div>
        </div>

      </div>

      {/* --- Player 1 Area (Bottom) --- */}
      <div
        onClick={() => {
          if (activePlayer === 1) passPriority();
        }}
        className={`
          relative flex-1 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer
          ${activePlayer === 1 ? 'bg-gray-800 shadow-[inset_0_0_50px_rgba(37,99,235,0.2)]' : 'bg-gray-900 opacity-60'}
        `}
      >
        <div className="absolute top-4 right-4">
          <LifeCounter life={p1Life} setLife={setP1Life} rotate={false} />
        </div>

        {/* Stack Interaction Indicator */}
        {activePlayer === 1 && turnPlayer === 2 && (
          <div className="absolute top-20 flex items-center space-x-2 text-red-400 font-bold bg-red-900/30 px-3 py-1 rounded">
            <ShieldAlert size={16} />
            <span>Responding</span>
          </div>
        )}

        {/* Priority Indicator (Most Prominent) */}
        {activePlayer === 1 && (
          <div className="mb-4 px-4 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-bold uppercase tracking-widest animate-pulse border border-blue-500/50">
            Priority
          </div>
        )}

        <div className={`text-7xl md:text-9xl font-mono font-bold tracking-tighter tabular-nums ${activePlayer === 1 ? 'text-blue-500' : 'text-gray-500'}`}>
          {formatTime(p1Time)}
        </div>

        {/* Turn Indicator (Smaller, less prominent than Priority) */}
        {turnPlayer === 1 && activePlayer !== 1 && (
          <div className="mt-2 px-3 py-0.5 bg-blue-900/30 text-blue-600 rounded text-xs font-semibold uppercase tracking-wider border border-blue-800/50">
            Your Turn
          </div>
        )}

        {/* Phase Button - Player 1's Turn */}
        {turnPlayer === 1 && (
          <button
            onClick={nextPhase}
            className="
              absolute bottom-6 right-6
              flex items-center space-x-2 px-6 py-4 rounded-lg text-lg font-bold transition-all
              bg-blue-600 text-white border-2 border-blue-400 hover:bg-blue-500 active:scale-95 shadow-lg
            "
          >
            <span>Move to: {PHASES[currentPhaseIdx].nextPhase}</span>
            <ChevronRight size={20} />
          </button>
        )}

        <div className="absolute bottom-6 text-gray-500 text-xs uppercase tracking-widest">
          Tap Clock to Pass Priority
        </div>
      </div>

    </div>
  );
}