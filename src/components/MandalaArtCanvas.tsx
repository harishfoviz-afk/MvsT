import React, { useRef, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Brush,
  Palette,
  Sun,
  Star,
  Eye,
  Eraser,
  Zap,
} from 'lucide-react';

interface MandalaArtCanvasProps {
  svgTemplate?: string;
  title: string;
  ageGroup?: string;
  isSolved: boolean;
  onSolve: (elapsedSeconds?: number) => void;
}

const MANDALA_COLORS = [
  { name: 'Neon Pink', hex: '#ec4899' },
  { name: 'Electric Purple', hex: '#8b5cf6' },
  { name: 'Sky Blue', hex: '#0284c7' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Sunburst Gold', hex: '#f59e0b' },
  { name: 'Tiger Orange', hex: '#ea580c' },
  { name: 'Ruby Red', hex: '#ef4444' },
  { name: 'Deep Indigo', hex: '#312e81' },
  { name: 'Turquoise', hex: '#06b6d4' },
];

export const MandalaArtCanvas: React.FC<MandalaArtCanvasProps> = ({
  svgTemplate,
  title,
  ageGroup,
  isSolved,
  onSolve,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeColor, setActiveColor] = useState(MANDALA_COLORS[0].hex);
  const [isRainbow, setIsRainbow] = useState(false);
  const [lineWidth, setLineWidth] = useState(6);
  const [symmetry, setSymmetry] = useState<number>(8); // 6, 8, 12
  const [hasDrawn, setHasDrawn] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const rainbowHueRef = useRef(0);

  // Live timer
  useEffect(() => {
    if (isSolved) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSolved]);

  // Canvas resize and scaling
  useEffect(() => {
    const updateSize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

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

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
  };

  // Helper to draw radial symmetry lines around center
  const drawRadialSymmetrySegment = (
    ctx: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    cx: number,
    cy: number,
    color: string,
    width: number
  ) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;

    // Vector relative to center
    const dx0 = x0 - cx;
    const dy0 = y0 - cy;
    const dx1 = x1 - cx;
    const dy1 = y1 - cy;

    for (let i = 0; i < symmetry; i++) {
      const angle = (i * 2 * Math.PI) / symmetry;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);

      // Rotated direct
      const rx0 = cx + dx0 * cos - dy0 * sin;
      const ry0 = cy + dx0 * sin + dy0 * cos;
      const rx1 = cx + dx1 * cos - dy1 * sin;
      const ry1 = cy + dx1 * sin + dy1 * cos;

      ctx.beginPath();
      ctx.moveTo(rx0, ry0);
      ctx.lineTo(rx1, ry1);
      ctx.stroke();

      // Mirrored axis
      const mx0 = cx - (dx0 * cos - dy0 * sin);
      const my0 = cy + (dx0 * sin + dy0 * cos);
      const mx1 = cx - (dx1 * cos - dy1 * sin);
      const my1 = cy + (dx1 * sin + dy1 * cos);

      ctx.beginPath();
      ctx.moveTo(mx0, my0);
      ctx.lineTo(mx1, my1);
      ctx.stroke();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

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
    setHasDrawn(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      let strokeColor = activeColor;
      if (isRainbow) {
        rainbowHueRef.current = (rainbowHueRef.current + 4) % 360;
        strokeColor = `hsl(${rainbowHueRef.current}, 90%, 55%)`;
      }

      drawRadialSymmetrySegment(
        ctx,
        lastPointRef.current.x,
        lastPointRef.current.y,
        x,
        y,
        cx,
        cy,
        strokeColor,
        lineWidth
      );
    }

    lastPointRef.current = { x, y };
  };

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
    }
  };

  const handleClaimMandala = () => {
    confetti({ particleCount: 110, spread: 85, origin: { y: 0.6 } });
    onSolve(timerSeconds);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-3 select-none">
      {/* 1. Mandala Studio Tools Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs">
        {/* Colors Swatches */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-black text-slate-500 uppercase mr-1">Palettes:</span>

          {/* Rainbow Mode */}
          <button
            type="button"
            onClick={() => setIsRainbow(!isRainbow)}
            className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              isRainbow
                ? 'bg-gradient-to-r from-pink-500 via-amber-400 to-indigo-500 text-white shadow-sm ring-2 ring-indigo-400'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rainbow</span>
          </button>

          {MANDALA_COLORS.map((c) => (
            <button
              key={c.hex}
              type="button"
              onClick={() => {
                setIsRainbow(false);
                setActiveColor(c.hex);
              }}
              className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                !isRainbow && activeColor === c.hex
                  ? 'ring-2 ring-offset-2 ring-slate-800 scale-110 shadow-xs'
                  : 'hover:scale-105 opacity-85 hover:opacity-100'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            />
          ))}
        </div>

        {/* Radial Symmetry Mode & Thickness */}
        <div className="flex items-center gap-2">
          {/* Symmetry Options */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-xl text-xs font-bold">
            <span className="text-[10px] font-bold text-slate-600 px-1.5">Symmetry:</span>
            {[6, 8, 12].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSymmetry(s)}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  symmetry === s
                    ? 'bg-indigo-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Thickness */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setLineWidth(4)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                lineWidth === 4 ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Fine
            </button>
            <button
              type="button"
              onClick={() => setLineWidth(8)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                lineWidth === 8 ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Medium
            </button>
            <button
              type="button"
              onClick={() => setLineWidth(14)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                lineWidth === 14 ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              Bold
            </button>
          </div>

          {/* Clear Button */}
          {hasDrawn && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
              title="Clear Mandala Drawing"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Interactive Radial Symmetry Canvas Stage */}
      <div
        ref={containerRef}
        className="relative w-full aspect-[500/500] max-h-[460px] bg-white border-2 border-slate-200 rounded-3xl shadow-inner flex items-center justify-center overflow-hidden touch-none select-none"
      >
        {/* Underlying Geometric Mandala Outline SVG */}
        {svgTemplate && (
          <div
            className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none p-2 opacity-85"
            dangerouslySetInnerHTML={{ __html: svgTemplate }}
          />
        )}

        {/* Kaleidoscope Real-Time Symmetry Drawing Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 w-full h-full cursor-crosshair z-10 touch-none"
          style={{ touchAction: 'none' }}
        />

        {/* Helper Tip */}
        {!hasDrawn && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-none z-20 bg-indigo-950/80 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-1.5 animate-pulse border border-indigo-400/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Touch or draw anywhere to create {symmetry}-fold kaleidoscope symmetry!</span>
          </div>
        )}

        {/* Solved Stamp */}
        {isSolved && (
          <div className="absolute bottom-3 right-3 pointer-events-none z-20 bg-emerald-500/90 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-1.5 border-2 border-white animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4" />
            <span>MANDALA ART COMPLETED! ✓</span>
          </div>
        )}
      </div>

      {/* 3. Claim Mandala Stamp Action Button */}
      <div className="w-full pt-1">
        <button
          type="button"
          onClick={handleClaimMandala}
          className={`w-full py-3 px-4 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
            isSolved
              ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400'
              : 'bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white hover:scale-101 shadow-md'
          }`}
        >
          {isSolved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>MANDALA ART MASTER STAMP CLAIMED! 🌟</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>✨ FINISHED MANDALA! CLICK TO CLAIM STAMP &amp; 3 STARS! 🌟</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
