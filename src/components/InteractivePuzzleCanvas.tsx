import React, { useRef, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ActivityType, AgeGroup } from '../types/book';
import {
  RotateCcw,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Volume2,
  X,
  Info,
  BookOpen,
  Eraser,
  Lightbulb,
  PenTool,
  Hash,
  Clock,
  Pause,
  Play,
  Star,
  Zap,
} from 'lucide-react';
import { getWordDefinition, WordDefinition } from '../core/data/wordDictionary';
import {
  getBoxDimensions,
  getSudokuConflicts,
  checkSudokuSolved,
  getSudokuHint,
  parseSudokuFromSvg,
} from '../core/validators/sudokuValidator';
import { validateMazeStroke, CanvasPoint } from '../core/validators/mazeValidator';
import { formatSeconds, calculateStars } from '../core/storage/kidsProfileStorage';

interface InteractivePuzzleCanvasProps {
  svgContent: string;
  solutionSvgContent?: string;
  puzzleType: ActivityType;
  puzzleData?: any;
  challengeNumber?: number;
  ageGroup?: AgeGroup;
  bestTimeSeconds?: number;
  isSolved: boolean;
  onSolve: (elapsedSeconds?: number, conflictsCount?: number) => void;
}

const BRUSH_COLORS = [
  { name: 'Sky Blue', hex: '#2563eb' },
  { name: 'Emerald', hex: '#16a34a' },
  { name: 'Tiger Orange', hex: '#ea580c' },
  { name: 'Berry Purple', hex: '#9333ea' },
  { name: 'Ruby Red', hex: '#dc2626' },
  { name: 'Gold', hex: '#ca8a04' },
];

export const InteractivePuzzleCanvas: React.FC<InteractivePuzzleCanvasProps> = ({
  svgContent,
  solutionSvgContent,
  puzzleType,
  puzzleData,
  challengeNumber,
  ageGroup,
  bestTimeSeconds,
  isSolved,
  onSolve,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Live Stopwatch Timer & Pause State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [selectedWordDef, setSelectedWordDef] = useState<WordDefinition | null>(null);
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set());
  const [mazeFeedback, setMazeFeedback] = useState<string | null>(null);
  const [wordSearchFeedback, setWordSearchFeedback] = useState<string | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const drawnStrokeRef = useRef<CanvasPoint[]>([]);

  useEffect(() => {
    setTimerSeconds(0);
    setIsTimerPaused(false);
  }, [svgContent, challengeNumber]);

  useEffect(() => {
    if (isSolved || isTimerPaused || Boolean(selectedWordDef)) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = window.setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isSolved, isTimerPaused, Boolean(selectedWordDef), svgContent, challengeNumber]);

  const currentStars = React.useMemo(() => {
    return calculateStars(puzzleType, ageGroup || '4-6', timerSeconds);
  }, [puzzleType, ageGroup, timerSeconds]);

  const [activeColor, setActiveColor] = useState(BRUSH_COLORS[0].hex);
  const [lineWidth, setLineWidth] = useState(6);
  const [showSolution, setShowSolution] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Play subtle sound pop when entering a number
  const playNumberPop = (num: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = 320 + num * 60;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // Audio unsupported
    }
  };

  // Play synthetic Web Audio victory fanfare
  const playVictoryFanfare = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.32);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.32);
      });
    } catch {
      // Audio unsupported
    }
  };

  // Sudoku state & specs
  const [sudokuMode, setSudokuMode] = useState<'interactive' | 'crayon'>('interactive');
  const [userSudokuGrid, setUserSudokuGrid] = useState<(number | null)[][]>([]);
  const [selectedSudokuCell, setSelectedSudokuCell] = useState<{ r: number; c: number } | null>(null);
  const [sudokuBanner, setSudokuBanner] = useState<string | null>(null);
  const [sparkleCell, setSparkleCell] = useState<{ r: number; c: number } | null>(null);

  const sudokuSpecs = React.useMemo(() => {
    if (puzzleType !== 'sudoku') return null;

    if (puzzleData?.puzzleGrid && Array.isArray(puzzleData.puzzleGrid)) {
      const size = puzzleData.size || puzzleData.puzzleGrid.length;
      const { boxWidth, boxHeight } = getBoxDimensions(size);
      return {
        size,
        boxWidth: puzzleData.boxWidth || boxWidth,
        boxHeight: puzzleData.boxHeight || boxHeight,
        puzzleGrid: puzzleData.puzzleGrid as (number | null)[][],
        solutionGrid: puzzleData.solutionGrid as number[][] | undefined,
      };
    }

    // Fallback to SVG parsing
    return parseSudokuFromSvg(svgContent, solutionSvgContent);
  }, [puzzleType, puzzleData, svgContent, solutionSvgContent]);

  // Sync grid when puzzle changes
  useEffect(() => {
    if (sudokuSpecs) {
      setUserSudokuGrid(sudokuSpecs.puzzleGrid.map((row) => [...row]));
      setSelectedSudokuCell(null);
      setSudokuBanner(null);
    }
  }, [sudokuSpecs]);

  const isOriginalClue = (r: number, c: number) => {
    if (!sudokuSpecs?.puzzleGrid) return false;
    return sudokuSpecs.puzzleGrid[r]?.[c] !== null && sudokuSpecs.puzzleGrid[r]?.[c] !== undefined;
  };

  const sudokuConflicts = React.useMemo(() => {
    if (!sudokuSpecs || userSudokuGrid.length === 0) return new Set<string>();
    return getSudokuConflicts(
      userSudokuGrid,
      sudokuSpecs.size,
      sudokuSpecs.boxWidth,
      sudokuSpecs.boxHeight
    );
  }, [userSudokuGrid, sudokuSpecs]);

  const numberUsageCounts = React.useMemo(() => {
    if (!sudokuSpecs) return {};
    const counts: Record<number, number> = {};
    for (let num = 1; num <= sudokuSpecs.size; num++) {
      counts[num] = 0;
    }
    for (let r = 0; r < sudokuSpecs.size; r++) {
      for (let c = 0; c < sudokuSpecs.size; c++) {
        const val = userSudokuGrid[r]?.[c];
        if (val && counts[val] !== undefined) {
          counts[val]++;
        }
      }
    }
    return counts;
  }, [userSudokuGrid, sudokuSpecs]);

  const handleSetSudokuNumber = (num: number) => {
    if (!selectedSudokuCell || !sudokuSpecs) return;
    const { r, c } = selectedSudokuCell;
    if (isOriginalClue(r, c)) return;

    playNumberPop(num);

    const newGrid = userSudokuGrid.map((row, rIdx) =>
      row.map((val, cIdx) => (rIdx === r && cIdx === c ? num : val))
    );
    setUserSudokuGrid(newGrid);

    const validation = checkSudokuSolved(
      newGrid,
      sudokuSpecs.solutionGrid,
      sudokuSpecs.size,
      sudokuSpecs.boxWidth,
      sudokuSpecs.boxHeight
    );

    if (validation.isComplete) {
      if (validation.isCorrect) {
        setSudokuBanner('🎉 BRILLIANT! You solved the Sudoku correctly!');
        playVictoryFanfare();
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
        onSolve(timerSeconds, sudokuConflicts.size);
      } else {
        setSudokuBanner('⚠️ Keep going! Some numbers conflict in their row, column, or box.');
      }
    } else {
      if (validation.conflicts.size > 0) {
        setSudokuBanner('⚠️ That number already appears in this row, column, or box!');
      } else {
        setSudokuBanner(null);
      }
    }
  };

  const handleEraseSudokuCell = () => {
    if (!selectedSudokuCell || !sudokuSpecs) return;
    const { r, c } = selectedSudokuCell;
    if (isOriginalClue(r, c)) return;

    const newGrid = userSudokuGrid.map((row, rIdx) =>
      row.map((val, cIdx) => (rIdx === r && cIdx === c ? null : val))
    );
    setUserSudokuGrid(newGrid);
    setSudokuBanner(null);
  };

  const handleSudokuHint = () => {
    if (!sudokuSpecs?.solutionGrid) return;
    const hint = getSudokuHint(userSudokuGrid, sudokuSpecs.solutionGrid);
    if (hint) {
      const newGrid = userSudokuGrid.map((row, rIdx) =>
        row.map((val, cIdx) => (rIdx === hint.row && cIdx === hint.col ? hint.value : val))
      );
      setUserSudokuGrid(newGrid);
      setSelectedSudokuCell({ r: hint.row, c: hint.col });
      setSparkleCell({ r: hint.row, c: hint.col });
      setTimeout(() => setSparkleCell(null), 1600);

      playNumberPop(hint.value);

      const validation = checkSudokuSolved(
        newGrid,
        sudokuSpecs.solutionGrid,
        sudokuSpecs.size,
        sudokuSpecs.boxWidth,
        sudokuSpecs.boxHeight
      );
      if (validation.isComplete && validation.isCorrect) {
        setSudokuBanner('🎉 PUZZLE SOLVED WITH HINT! Challenge Stamp Claimed!');
        playVictoryFanfare();
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
        onSolve(timerSeconds, sudokuConflicts.size);
      }
    }
  };

  const handleResetSudoku = () => {
    if (!sudokuSpecs) return;
    setUserSudokuGrid(sudokuSpecs.puzzleGrid.map((row) => [...row]));
    setSelectedSudokuCell(null);
    setSudokuBanner(null);
  };

  // Keyboard navigation and number entry
  useEffect(() => {
    if (puzzleType !== 'sudoku' || sudokuMode !== 'interactive' || !sudokuSpecs) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= sudokuSpecs.size) {
        handleSetSudokuNumber(num);
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleEraseSudokuCell();
        return;
      }

      if (selectedSudokuCell) {
        let { r, c } = selectedSudokuCell;
        if (e.key === 'ArrowUp') {
          r = Math.max(0, r - 1);
          setSelectedSudokuCell({ r, c });
          e.preventDefault();
        } else if (e.key === 'ArrowDown') {
          r = Math.min(sudokuSpecs.size - 1, r + 1);
          setSelectedSudokuCell({ r, c });
          e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
          c = Math.max(0, c - 1);
          setSelectedSudokuCell({ r, c });
          e.preventDefault();
        } else if (e.key === 'ArrowRight') {
          c = Math.min(sudokuSpecs.size - 1, c + 1);
          setSelectedSudokuCell({ r, c });
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [puzzleType, sudokuMode, sudokuSpecs, selectedSudokuCell, userSudokuGrid]);

  // Read word, definition, and example sentence aloud for early readers
  const speakWord = (def: WordDefinition) => {
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const text = `${def.word}. ${def.definition} In a sentence: ${def.exampleSentence}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.88;
        utterance.pitch = 1.05;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // speech unsupported
    }
  };

  // Drawing state refs for ultra-smooth 60fps tracking
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const startNearEntranceRef = useRef(false);

  // Synchronize Canvas resolution to container dimensions
  useEffect(() => {
    const updateCanvasSize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Only resize if actual dimensions changed to prevent clearing drawing
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Clear the drawing trail
  const handleClearTrail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    startNearEntranceRef.current = false;
    drawnStrokeRef.current = [];
    setMazeFeedback(null);
    setWordSearchFeedback(null);
  };

  // Clear trail and found words if puzzle SVG changes (e.g. user moves to another page)
  useEffect(() => {
    handleClearTrail();
    setShowSolution(false);
    setFoundWords(new Set());
    setMazeFeedback(null);
    setWordSearchFeedback(null);
  }, [svgContent]);

  // Extract target words with fallback to SVG parsing if puzzleData was not attached
  const targetWords: string[] = React.useMemo(() => {
    if (puzzleData?.words && Array.isArray(puzzleData.words) && puzzleData.words.length > 0) {
      return puzzleData.words;
    }
    if (puzzleType === 'wordsearch' && svgContent) {
      const matches = Array.from(svgContent.matchAll(/>([A-Z]{3,15})<\/text>/g));
      const words = matches
        .map((m) => m[1])
        .filter((w) => w !== 'FIND' && w !== 'THESE' && w !== 'WORDS' && w !== 'START' && w !== 'FINISH');
      return Array.from(new Set(words));
    }
    return [];
  }, [puzzleData, puzzleType, svgContent]);

  // Toggle finding a word in word search and show its learning card
  const handleToggleWord = (word: string) => {
    // If already solved, simply open the learning card for study/exploration
    if (isSolved) {
      const def = getWordDefinition(word, puzzleData?.theme);
      setSelectedWordDef(def);
      return;
    }

    const next = new Set(foundWords);
    if (next.has(word)) {
      next.delete(word);
    } else {
      next.add(word);
    }
    setFoundWords(next);

    // Look up child-friendly definition and open the Word Explorer card
    const def = getWordDefinition(word, puzzleData?.theme);
    setSelectedWordDef(def);
  };

  const handleMarkAllFound = () => {
    const all = new Set(targetWords);
    setFoundWords(all);
    onSolve(timerSeconds, 0);
  };

  // Unified Pointer Down (Works for BOTH Mouse Cursor & Touch Screen)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Capture pointer so mouse dragging outside canvas doesn't break line
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawingRef.current = true;
    lastPointRef.current = { x, y };
    drawnStrokeRef.current = [{ x, y }];
    setHasDrawn(true);

    if (puzzleType === 'maze' && !isSolved) {
      setMazeFeedback(null);
    }

    // If maze, check if start is near top-left entrance (x < 35%, y < 35%)
    if (puzzleType === 'maze' && x / rect.width < 0.35 && y / rect.height < 0.35) {
      startNearEntranceRef.current = true;
    }

    // Draw initial dot
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = activeColor;
      ctx.fillStyle = activeColor;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.arc(x, y, lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Unified Pointer Move (Works for BOTH Mouse Drag & Touch Drag)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    lastPointRef.current = { x, y };
    drawnStrokeRef.current.push({ x, y });
  };

  // Unified Pointer Up & Cancel
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;

    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      // If Maze puzzle: run validation on the full drawn stroke against grid walls!
      if (puzzleType === 'maze' && puzzleData?.grid && !isSolved) {
        const rect = canvas.getBoundingClientRect();
        const validation = validateMazeStroke(
          drawnStrokeRef.current,
          puzzleData,
          rect.width,
          rect.height
        );

        if (validation.isValidSolve) {
          setMazeFeedback('🎉 BRILLIANT! You navigated the maze without crossing any walls!');
          playVictoryFanfare();
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
          onSolve(timerSeconds, 0);
        } else if (validation.wallCollisions > 0) {
          setMazeFeedback(
            `⚠️ Wall crossed ${validation.wallCollisions} time${
              validation.wallCollisions === 1 ? '' : 's'
            }! Follow the open corridors to reach the finish.`
          );
        } else if (validation.isStartedAtEntrance && !validation.isReachedExit) {
          setMazeFeedback('✏️ Good path! Keep following the open hallways to reach the exit.');
        }
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center space-y-2">
      {/* Interactive Tool Palette Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl">
        {/* Sudoku Mode Switcher (Tap Numbers vs Crayon Doodle) */}
        {puzzleType === 'sudoku' ? (
          <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setSudokuMode('interactive')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                sudokuMode === 'interactive'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Tap &amp; Solve</span>
            </button>
            <button
              type="button"
              onClick={() => setSudokuMode('crayon')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                sudokuMode === 'crayon'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Crayon</span>
            </button>
          </div>
        ) : null}

        {/* Crayon Tools (Colors & Width) - Shown when not in Sudoku interactive mode */}
        {(puzzleType !== 'sudoku' || sudokuMode === 'crayon') && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Colors */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase mr-1">Crayon:</span>
              {BRUSH_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setActiveColor(c.hex)}
                  className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                    activeColor === c.hex
                      ? 'ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-xs'
                      : 'hover:scale-105 opacity-85 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>

            {/* Trail Thickness */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLineWidth(4)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  lineWidth === 4 ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Thin
              </button>
              <button
                type="button"
                onClick={() => setLineWidth(7)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  lineWidth === 7 ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setLineWidth(11)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                  lineWidth === 11 ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Thick
              </button>
            </div>
          </div>
        )}

        {/* Interactive Mode Helper Indicator */}
        {puzzleType === 'sudoku' && sudokuMode === 'interactive' && (
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-500">
            <span>✨ Mathematical Auto-Validation Active</span>
          </div>
        )}

        {/* Action Buttons: Clear & Reveal */}
        <div className="flex items-center gap-1.5 ml-auto">
          {hasDrawn && (puzzleType !== 'sudoku' || sudokuMode === 'crayon') && (
            <button
              type="button"
              onClick={handleClearTrail}
              className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              title="Clear your drawn path"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          {solutionSvgContent && (
            <button
              type="button"
              onClick={() => setShowSolution(!showSolution)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                showSolution
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle solution guide path"
            >
              {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showSolution ? 'Hide Guide' : 'Guide'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ⏱️ Explorer Live Timer & 3-Star Target Bar 🌟 */}
      <div className="w-full flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-sm border border-indigo-900/50">
        {/* Left: Stopwatch Timer & Pause/Resume */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10 font-mono font-black text-sm tracking-wider text-amber-300 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{formatSeconds(timerSeconds)}</span>
          </div>

          {!isSolved && (
            <button
              type="button"
              onClick={() => setIsTimerPaused(!isTimerPaused)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              title={isTimerPaused ? 'Resume Timer' : 'Pause Timer'}
            >
              {isTimerPaused ? (
                <>
                  <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-3 h-3 text-amber-300 fill-amber-300" />
                  <span>Pause</span>
                </>
              )}
            </button>
          )}

          {isSolved && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              ✓ Solved!
            </span>
          )}
        </div>

        {/* Right: Live 3-Star Rating Target & Personal Best */}
        <div className="flex items-center gap-3">
          {bestTimeSeconds !== undefined && bestTimeSeconds > 0 && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-xl">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Best: {formatSeconds(bestTimeSeconds)}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10">
            <span className="text-[10px] font-bold text-slate-300 uppercase mr-0.5">Rating:</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 transition-all ${
                  i < (isSolved ? calculateStars(puzzleType, ageGroup || '4-6', timerSeconds) : currentStars)
                    ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow'
                    : 'text-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dynamic Path/Solving Validation Feedback Banners */}
      {mazeFeedback && (
        <div
          className={`w-full text-center text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs animate-in fade-in flex items-center justify-center gap-1.5 ${
            mazeFeedback.includes('⚠️')
              ? 'bg-amber-100 text-amber-950 border border-amber-300'
              : 'bg-emerald-100 text-emerald-950 border border-emerald-300'
          }`}
        >
          <span>{mazeFeedback}</span>
        </div>
      )}

      {wordSearchFeedback && (
        <div className="w-full text-center text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-100 text-amber-950 border border-amber-300 shadow-xs animate-in fade-in flex items-center justify-center gap-1.5">
          <span>{wordSearchFeedback}</span>
        </div>
      )}

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[500/520] max-h-[460px] bg-white border-2 border-slate-200 rounded-2xl shadow-inner flex items-center justify-center overflow-hidden touch-none select-none"
      >
        {/* Pause Screen Overlay */}
        {isTimerPaused && !isSolved && (
          <div className="absolute inset-0 z-30 bg-slate-900/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center space-y-3 animate-in fade-in">
            <div className="text-4xl animate-bounce">⏸️</div>
            <h3 className="text-lg font-black text-white">Puzzle Challenge Paused</h3>
            <p className="text-xs text-slate-300 max-w-xs">
              Take a breather or drink some water! Your timer is safely on hold.
            </p>
            <button
              type="button"
              onClick={() => setIsTimerPaused(false)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-600 hover:to-amber-600 text-white font-black text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Resume Puzzle!</span>
            </button>
          </div>
        )}

        {/* Sudoku Interactive Tap-to-Solve Board */}
        {puzzleType === 'sudoku' && sudokuMode === 'interactive' && sudokuSpecs ? (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 select-none">
            {/* Header Instructions */}
            <div className="text-center mb-2 px-2">
              <span className="text-xs sm:text-sm font-black text-slate-700">
                {sudokuSpecs.size === 4
                  ? 'Fill each row, column, and 2x2 box with numbers 1 to 4!'
                  : sudokuSpecs.size === 6
                  ? 'Fill each row, column, and 2x3 box with numbers 1 to 6!'
                  : 'Fill each row, column, and 3x3 box with numbers 1 to 9!'}
              </span>
            </div>

            {/* Interactive Grid Table */}
            <div
              className="border-3 border-slate-900 rounded-2xl overflow-hidden bg-white shadow-md grid transition-all"
              style={{
                width: 'min(92%, 350px)',
                aspectRatio: '1 / 1',
                gridTemplateColumns: `repeat(${sudokuSpecs.size}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${sudokuSpecs.size}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: sudokuSpecs.size }).map((_, r) =>
                Array.from({ length: sudokuSpecs.size }).map((_, c) => {
                  const isOriginal = isOriginalClue(r, c);
                  const isSelected = selectedSudokuCell?.r === r && selectedSudokuCell?.c === c;
                  const isConflicted = sudokuConflicts.has(`${r},${c}`);
                  const isSparkle = sparkleCell?.r === r && sparkleCell?.c === c;

                  // Guide lights (same row, col, or box)
                  const isSameRow = selectedSudokuCell?.r === r;
                  const isSameCol = selectedSudokuCell?.c === c;
                  const isSameBox =
                    selectedSudokuCell &&
                    Math.floor(r / sudokuSpecs.boxHeight) === Math.floor(selectedSudokuCell.r / sudokuSpecs.boxHeight) &&
                    Math.floor(c / sudokuSpecs.boxWidth) === Math.floor(selectedSudokuCell.c / sudokuSpecs.boxWidth);
                  const isGuideLight = !isSelected && (isSameRow || isSameCol || isSameBox);

                  // Value to display
                  const val = showSolution && sudokuSpecs.solutionGrid
                    ? sudokuSpecs.solutionGrid[r][c]
                    : userSudokuGrid[r]?.[c];

                  // Same number matching highlight
                  const selectedVal = selectedSudokuCell
                    ? (showSolution && sudokuSpecs.solutionGrid
                        ? sudokuSpecs.solutionGrid[selectedSudokuCell.r][selectedSudokuCell.c]
                        : userSudokuGrid[selectedSudokuCell.r]?.[selectedSudokuCell.c])
                    : null;
                  const isMatchingNumber = !isSelected && selectedVal !== null && selectedVal !== undefined && val === selectedVal;

                  // Box borders (sub-grid boundary)
                  const borderRight = (c + 1) % sudokuSpecs.boxWidth === 0 && c !== sudokuSpecs.size - 1
                    ? 'border-r-3 border-r-slate-900'
                    : 'border-r border-r-slate-200';
                  const borderBottom = (r + 1) % sudokuSpecs.boxHeight === 0 && r !== sudokuSpecs.size - 1
                    ? 'border-b-3 border-b-slate-900'
                    : 'border-b border-b-slate-200';

                  // Font size based on size
                  const fontSize = sudokuSpecs.size === 4 
                    ? 'text-2xl sm:text-3xl' 
                    : sudokuSpecs.size === 6 
                    ? 'text-xl sm:text-2xl' 
                    : 'text-base sm:text-lg';

                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => setSelectedSudokuCell({ r, c })}
                      className={`relative flex items-center justify-center font-black transition-all cursor-pointer select-none ${borderRight} ${borderBottom} ${fontSize} ${
                        isConflicted
                          ? 'bg-red-100 text-red-600 ring-2 ring-inset ring-red-400 animate-pulse'
                          : isSelected
                          ? 'bg-amber-200 text-slate-900 ring-3 ring-inset ring-amber-500 z-10 shadow-inner'
                          : isMatchingNumber
                          ? 'bg-amber-100 text-slate-900'
                          : isGuideLight
                          ? 'bg-sky-50 text-slate-800'
                          : isOriginal
                          ? 'bg-slate-50 text-slate-900'
                          : val !== null && val !== undefined
                          ? 'bg-white text-blue-600'
                          : 'bg-white text-transparent hover:bg-amber-50/50'
                      }`}
                      title={isOriginal ? 'Original clue (fixed)' : `Box (${r + 1}, ${c + 1})`}
                    >
                      <span>{val ?? ''}</span>
                      {isSparkle && (
                        <span className="absolute inset-0 flex items-center justify-center pointer-events-none animate-ping text-amber-400">
                          ✨
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Validation Feedback Banner */}
            {sudokuBanner && (
              <div
                className={`mt-2 text-center text-xs font-bold px-3 py-1 rounded-full animate-in fade-in shadow-xs ${
                  sudokuBanner.includes('⚠️')
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                {sudokuBanner}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Underlying SVG Layer */}
            <div
              className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none p-1.5"
              dangerouslySetInnerHTML={{
                __html: showSolution && solutionSvgContent ? solutionSvgContent : svgContent,
              }}
            />

            {/* Interactive Mouse & Touch Drawing Canvas Layer */}
            <canvas
              ref={canvasRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute inset-0 w-full h-full cursor-crosshair z-10 touch-none"
              style={{ touchAction: 'none' }}
            />

            {/* Helper Tip when no line has been drawn yet */}
            {!hasDrawn && !isSolved && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none z-20 bg-black/70 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-1.5 animate-pulse">
                <span>✏️ Click &amp; drag with your mouse or touch to draw your path!</span>
              </div>
            )}
          </>
        )}

        {/* Solved Stamp Watermark overlay */}
        {isSolved && (
          <div className="absolute bottom-3 right-3 pointer-events-none z-20 bg-emerald-500/90 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-1.5 border-2 border-white animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4" />
            <span>CHALLENGE SOLVED! ✓</span>
          </div>
        )}
      </div>

      {/* Interactive Sudoku Number Keypad & Controls */}
      {puzzleType === 'sudoku' && sudokuMode === 'interactive' && sudokuSpecs && (
        <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center space-y-2.5 mt-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
            <span>
              {selectedSudokuCell
                ? isOriginalClue(selectedSudokuCell.r, selectedSudokuCell.c)
                  ? '🔒 Fixed Original Clue (Tap an empty box to place a number)'
                  : 'Tap a number below to place in selected box:'
                : 'Tap any box on the board to select it:'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              (or use keyboard 1–{sudokuSpecs.size} &amp; Backspace)
            </span>
          </div>

          {/* Large Kid-Friendly Number Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: sudokuSpecs.size }, (_, i) => i + 1).map((num) => {
              const count = numberUsageCounts[num] || 0;
              const isAllPlaced = count >= sudokuSpecs.size;
              const remaining = Math.max(0, sudokuSpecs.size - count);

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleSetSudokuNumber(num)}
                  disabled={selectedSudokuCell ? isOriginalClue(selectedSudokuCell.r, selectedSudokuCell.c) : false}
                  className={`flex flex-col items-center justify-center w-12 h-13 sm:w-14 sm:h-15 rounded-2xl font-black transition-all cursor-pointer shadow-sm border-2 ${
                    isAllPlaced
                      ? 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                      : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-400 active:scale-95 hover:scale-105 shadow-xs'
                  } disabled:opacity-40 disabled:pointer-events-none`}
                >
                  <span className="text-xl sm:text-2xl leading-none">{num}</span>
                  <span className="text-[9px] font-bold text-slate-500 mt-0.5 leading-none">
                    {isAllPlaced ? '✓ Done' : `${remaining} left`}
                  </span>
                </button>
              );
            })}

            {/* Erase Button */}
            <button
              type="button"
              onClick={handleEraseSudokuCell}
              disabled={!selectedSudokuCell || isOriginalClue(selectedSudokuCell.r, selectedSudokuCell.c)}
              className="flex flex-col items-center justify-center w-12 h-13 sm:w-14 sm:h-15 rounded-2xl bg-rose-50 border-2 border-rose-200 hover:bg-rose-100 text-rose-600 font-black text-xs transition-all cursor-pointer active:scale-95 shadow-xs disabled:opacity-40 disabled:pointer-events-none"
              title="Clear selected box"
            >
              <Eraser className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-bold leading-none">Erase</span>
            </button>

            {/* Hint Button */}
            <button
              type="button"
              onClick={handleSudokuHint}
              className="flex flex-col items-center justify-center w-12 h-13 sm:w-14 sm:h-15 rounded-2xl bg-amber-50 border-2 border-amber-200 hover:bg-amber-100 text-amber-700 font-black text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Get a helpful hint"
            >
              <Lightbulb className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-bold leading-none">Hint</span>
            </button>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetSudoku}
              className="flex flex-col items-center justify-center w-12 h-13 sm:w-14 sm:h-15 rounded-2xl bg-slate-100 border-2 border-slate-300 hover:bg-slate-200 text-slate-600 font-black text-xs transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Reset all entered numbers"
            >
              <RotateCcw className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-bold leading-none">Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Word Search Word Checklist */}
      {puzzleType === 'wordsearch' && targetWords.length > 0 && (
        <div className="w-full bg-amber-50/90 border border-amber-200 rounded-2xl p-3 text-center space-y-2 mt-2 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
            <span>
              Tap Words When Found ({isSolved ? targetWords.length : foundWords.size} of {targetWords.length}):
            </span>
            <div className="flex items-center gap-2">
              {!isSolved && foundWords.size < targetWords.length && (
                <button
                  type="button"
                  onClick={handleMarkAllFound}
                  className="px-2.5 py-0.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-900 text-[10px] font-extrabold transition-all cursor-pointer shadow-2xs"
                >
                  ✓ Mark All Found
                </button>
              )}
              {(isSolved || foundWords.size === targetWords.length) && (
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> All Words Found!
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {targetWords.map((w: string) => {
              const isFound = isSolved || foundWords.has(w);
              const def = getWordDefinition(w, puzzleData?.theme);
              return (
                <div key={w} className="inline-flex items-center group">
                  <button
                    type="button"
                    onClick={() => handleToggleWord(w)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isFound
                        ? 'bg-emerald-500 text-white line-through decoration-white scale-105 shadow-md'
                        : 'bg-white text-slate-800 border border-amber-300 hover:bg-amber-100 hover:scale-105'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                        isFound ? 'bg-white text-emerald-600 border-white font-black' : 'border-slate-400'
                      }`}
                    >
                      {isFound ? '✓' : ''}
                    </span>
                    <span>{w}</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedWordDef(def);
                    }}
                    className="ml-0.5 p-1 rounded-full text-slate-400 hover:text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                    title={`Learn what ${w} means!`}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Prominent Claim Stamp Action Button with Strict Verification */}
      {(() => {
        const isWordSearchFullySolved =
          puzzleType === 'wordsearch' && targetWords.length > 0 && foundWords.size === targetWords.length;
        const isSudokuFullySolved =
          puzzleType === 'sudoku' && sudokuMode === 'interactive' && sudokuSpecs
            ? checkSudokuSolved(
                userSudokuGrid,
                sudokuSpecs.solutionGrid,
                sudokuSpecs.size,
                sudokuSpecs.boxWidth,
                sudokuSpecs.boxHeight
              ).isComplete &&
              checkSudokuSolved(
                userSudokuGrid,
                sudokuSpecs.solutionGrid,
                sudokuSpecs.size,
                sudokuSpecs.boxWidth,
                sudokuSpecs.boxHeight
              ).isCorrect
            : false;
        const isMazeFullySolved = puzzleType === 'maze' && Boolean(mazeFeedback?.includes('BRILLIANT'));

        const handleClaimStampClick = () => {
          if (isSolved) {
            onSolve(timerSeconds, 0);
            return;
          }

          if (puzzleType === 'wordsearch' && targetWords.length > 0) {
            if (!isWordSearchFullySolved && !showSolution) {
              setWordSearchFeedback(
                `🔍 ${targetWords.length - foundWords.size} of ${
                  targetWords.length
                } words remaining! Find each word in the grid and tap its card above, or click "✓ Mark All Found".`
              );
              setTimeout(() => setWordSearchFeedback(null), 4500);
              return;
            }
            playVictoryFanfare();
            confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
            onSolve(timerSeconds, 0);
            return;
          }

          if (puzzleType === 'sudoku' && sudokuMode === 'interactive' && sudokuSpecs) {
            if (!isSudokuFullySolved && !showSolution) {
              setSudokuBanner('⚠️ Complete all numbers with zero conflicts to claim the Stamp!');
              setTimeout(() => setSudokuBanner(null), 4000);
              return;
            }
            playVictoryFanfare();
            confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
            onSolve(timerSeconds, sudokuConflicts.size);
            return;
          }

          if (puzzleType === 'maze') {
            if (!isMazeFullySolved && !showSolution) {
              setMazeFeedback(
                '💡 Follow the open corridors from Start to Finish without crossing walls, or click "Show Answer" to reveal the path!'
              );
              setTimeout(() => setMazeFeedback(null), 4500);
              return;
            }
            playVictoryFanfare();
            confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
            onSolve(timerSeconds, 0);
            return;
          }

          // Dot-to-dot & coloring: motor/creative pages
          playVictoryFanfare();
          confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
          onSolve(timerSeconds, 0);
        };

        const isReadyToClaim =
          isSolved ||
          showSolution ||
          (puzzleType === 'wordsearch' && isWordSearchFullySolved) ||
          (puzzleType === 'sudoku' && isSudokuFullySolved) ||
          (puzzleType === 'maze' && isMazeFullySolved) ||
          puzzleType === 'dottodot' ||
          puzzleType === 'coloring';

        return (
          <div className="w-full pt-2">
            <button
              type="button"
              onClick={handleClaimStampClick}
              className={`w-full py-3 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                isSolved
                  ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400 hover:bg-emerald-200 hover:scale-[1.01]'
                  : !isReadyToClaim
                  ? 'bg-slate-100 text-slate-700 border-2 border-slate-300 hover:bg-slate-200 hover:border-slate-400'
                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white hover:scale-[1.01] shadow-md ring-2 ring-emerald-400/30 animate-pulse'
              }`}
            >
              {isSolved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    STAMP #{challengeNumber || ''} UNLOCKED &amp; STAMPED IN PASSPORT! (Click to View Stamp Celebration) 🌟
                  </span>
                </>
              ) : puzzleType === 'wordsearch' ? (
                isWordSearchFullySolved || showSolution ? (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                    <span>🎉 ALL {targetWords.length} WORDS FOUND! CLICK TO CLAIM STAMP #{challengeNumber || ''}! 🌟</span>
                  </>
                ) : (
                  <>
                    <span>
                      🔍 {targetWords.length - foundWords.size} Word{targetWords.length - foundWords.size === 1 ? '' : 's'} Remaining — Find All to Claim Stamp #{challengeNumber || ''}
                    </span>
                  </>
                )
              ) : puzzleType === 'sudoku' && sudokuMode === 'interactive' ? (
                isSudokuFullySolved || showSolution ? (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                    <span>🎉 SUDOKU COMPLETED! CLICK TO CLAIM STAMP #{challengeNumber || ''}! 🌟</span>
                  </>
                ) : (
                  <>
                    <span>🧩 Fill All Boxes Correctly (0 Conflicts) to Claim Stamp #{challengeNumber || ''}</span>
                  </>
                )
              ) : puzzleType === 'maze' ? (
                isMazeFullySolved || showSolution ? (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                    <span>🎉 MAZE SOLVED! CLICK TO CLAIM STAMP #{challengeNumber || ''}! 🌟</span>
                  </>
                ) : (
                  <>
                    <span>✏️ Trace Open Path from Start to Finish to Claim Stamp #{challengeNumber || ''}</span>
                  </>
                )
              ) : puzzleType === 'dottodot' ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                  <span>✓ CONNECTED ALL DOTS? CLICK TO CLAIM STAMP #{challengeNumber || ''}! 🌟</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                  <span>🎨 FINISHED COLORING? CLICK TO CLAIM STAMP #{challengeNumber || ''}! 🌟</span>
                </>
              )}
            </button>
          </div>
        );
      })()}

      {/* 📖 JUNIOR EXPLORER PHONICS & VOCABULARY FLASHCARD MODAL 📖 */}
      {selectedWordDef && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-4 border-amber-400 relative flex flex-col items-center text-center space-y-3.5 animate-in zoom-in-95 duration-200">
            {/* Top Category Header & Close Button */}
            <div className="w-full flex items-center justify-between">
              <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
                <span>{selectedWordDef.icon}</span>
                <span>{selectedWordDef.category}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setSelectedWordDef(null);
                }}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Giant Word Title & Phonics Subtitle */}
            <div className="space-y-1.5 pt-1">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {selectedWordDef.word}
              </h2>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-xs font-bold border border-indigo-200">
                  {selectedWordDef.phonetic}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold">
                  {selectedWordDef.syllables}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-semibold">
                  {selectedWordDef.partOfSpeech}
                </span>
              </div>
            </div>

            {/* 1. What It Means (Definition) */}
            <div className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-left shadow-2xs">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                📖 What It Means:
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-semibold">
                {selectedWordDef.definition}
              </p>
            </div>

            {/* 2. Word in Action (Example Sentence) */}
            <div className="w-full bg-blue-50/80 border border-blue-200 p-3 rounded-2xl text-left shadow-2xs">
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-700 mb-1 flex items-center gap-1">
                <span>💬 Word in Action (Example):</span>
              </div>
              <p className="text-xs sm:text-sm text-blue-950 italic font-medium leading-relaxed">
                "{selectedWordDef.exampleSentence}"
              </p>
            </div>

            {/* 3. Phonics & Word Family (Rhymes With) */}
            {selectedWordDef.rhymesWith && selectedWordDef.rhymesWith.length > 0 && (
              <div className="w-full bg-emerald-50/80 border border-emerald-200 p-2.5 sm:p-3 rounded-2xl text-left shadow-2xs">
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800 mb-1.5 flex items-center gap-1">
                  <span>🎵 Rhymes With (Word Family):</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedWordDef.rhymesWith.map((rhyme) => (
                    <span
                      key={rhyme}
                      className="px-2.5 py-0.5 rounded-lg bg-white border border-emerald-300 text-emerald-900 font-extrabold text-xs shadow-2xs tracking-wide"
                    >
                      {rhyme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Explorer Fun Fact */}
            <div className="w-full bg-amber-50/80 border border-amber-200 p-2.5 sm:p-3 rounded-2xl text-left shadow-2xs">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <span>💡 Explorer Fun Fact:</span>
              </div>
              <p className="text-[11px] sm:text-xs text-amber-950 mt-0.5 leading-snug font-medium">
                {selectedWordDef.funFact}
              </p>
            </div>

            {/* All Words Found Celebration Banner inside Modal */}
            {targetWords.length > 0 && foundWords.size === targetWords.length && !isSolved && (
              <div className="w-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 text-white rounded-2xl p-2.5 sm:p-3 text-center shadow-md animate-in zoom-in-95">
                <div className="text-xs font-black uppercase tracking-wider text-amber-200 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
                  <span>ALL {targetWords.length} WORDS FOUND! PUZZLE COMPLETE!</span>
                </div>
                <div className="text-[11px] font-bold text-white/90 mt-0.5">
                  You discovered every secret word! Claim your passport stamp below!
                </div>
              </div>
            )}

            {/* Bottom Actions: Read Aloud & Dismiss / Claim Stamp */}
            <div className="w-full grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => speakWord(selectedWordDef)}
                className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-indigo-200 hover:scale-102"
              >
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <span>Read to Me 🔊</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  const isAllFound = targetWords.length > 0 && foundWords.size === targetWords.length;
                  setSelectedWordDef(null);
                  if (isAllFound && !isSolved) {
                    onSolve(timerSeconds, 0);
                  }
                }}
                className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-md hover:scale-102 ${
                  targetWords.length > 0 && foundWords.size === targetWords.length && !isSolved
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white ring-2 ring-amber-300 animate-pulse'
                    : 'bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-600 hover:to-emerald-600 text-white'
                }`}
              >
                {targetWords.length > 0 && foundWords.size === targetWords.length && !isSolved ? (
                  <span>Claim Stamp #{challengeNumber || ''}! 🌟</span>
                ) : (
                  <span>Awesome! 👍</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
