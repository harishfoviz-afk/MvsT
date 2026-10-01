import { AgeGroup, BookTheme } from '../../types/book';

export interface DotPoint {
  index: number;
  x: number;
  y: number;
}

export interface DotToDotData {
  name: string;
  theme: BookTheme;
  points: DotPoint[];
  originalPath: string;
  difficulty: 'easy' | 'medium' | 'hard';
  seed: number;
}

// Curated vector silhouettes defined as normalized polygons [x, y] in range 0-100
// Curated vector silhouettes defined as normalized polygons [x, y] in range 0-100
const SILHOUETTES: Record<string, { name: string; theme: BookTheme; polygon: [number, number][] }> = {
  // Space
  rocket: {
    name: 'Space Rocket',
    theme: 'space',
    polygon: [
      [50, 10], [58, 25], [62, 45], [62, 70], [78, 85], [70, 88], [60, 80],
      [55, 90], [50, 85], [45, 90], [40, 80], [30, 88], [22, 85], [38, 70],
      [38, 45], [42, 25]
    ]
  },
  star: {
    name: 'Twinkling Star',
    theme: 'space',
    polygon: [
      [50, 10], [61, 35], [88, 35], [66, 52], [75, 78], [50, 62], [25, 78],
      [34, 52], [12, 35], [39, 35]
    ]
  },
  saturn: {
    name: 'Ringed Saturn',
    theme: 'space',
    polygon: [
      [10, 45], [25, 38], [40, 32], [50, 25], [60, 32], [75, 38], [90, 45],
      [95, 52], [85, 58], [72, 64], [60, 72], [50, 75], [40, 72], [28, 64],
      [15, 58], [5, 52]
    ]
  },
  ufo: {
    name: 'Flying Saucer UFO',
    theme: 'space',
    polygon: [
      [35, 30], [50, 20], [65, 30], [80, 50], [90, 60], [70, 70], [50, 72],
      [30, 70], [10, 60], [20, 50]
    ]
  },
  moon: {
    name: 'Crescent Moon',
    theme: 'space',
    polygon: [
      [50, 15], [65, 25], [75, 45], [70, 70], [50, 85], [40, 88], [55, 75],
      [60, 55], [55, 35], [40, 22]
    ]
  },

  // Dinosaurs
  dinosaur: {
    name: 'Friendly Brontosaurus',
    theme: 'dinosaurs',
    polygon: [
      [20, 20], [25, 15], [32, 18], [30, 35], [38, 45], [52, 48], [70, 48],
      [88, 42], [92, 48], [80, 58], [68, 62], [68, 82], [60, 82], [60, 64],
      [48, 64], [48, 82], [40, 82], [40, 62], [30, 58], [22, 45], [20, 30]
    ]
  },
  trex: {
    name: 'Mighty T-Rex',
    theme: 'dinosaurs',
    polygon: [
      [30, 20], [55, 20], [60, 35], [50, 45], [65, 55], [75, 75], [70, 85],
      [58, 75], [50, 75], [45, 85], [38, 75], [30, 70], [15, 65], [10, 50], [20, 40]
    ]
  },
  stego: {
    name: 'Spiky Stegosaurus',
    theme: 'dinosaurs',
    polygon: [
      [15, 55], [25, 40], [35, 48], [45, 30], [55, 45], [65, 32], [75, 48],
      [85, 40], [90, 60], [82, 75], [70, 75], [65, 85], [55, 85], [50, 75],
      [38, 75], [32, 85], [22, 85], [18, 75]
    ]
  },

  // Underwater
  whale: {
    name: 'Ocean Whale',
    theme: 'underwater',
    polygon: [
      [15, 50], [20, 38], [35, 30], [55, 30], [72, 38], [82, 45], [92, 35],
      [90, 55], [95, 65], [82, 60], [70, 62], [55, 70], [40, 72], [25, 68],
      [15, 60]
    ]
  },
  sailboat: {
    name: 'Adventure Sailboat',
    theme: 'underwater',
    polygon: [
      [50, 15], [75, 55], [52, 55], [52, 60], [85, 60], [75, 82], [25, 82],
      [15, 60], [48, 60], [48, 25], [28, 55], [48, 55]
    ]
  },
  dolphin: {
    name: 'Playful Dolphin',
    theme: 'underwater',
    polygon: [
      [10, 50], [25, 35], [45, 25], [65, 30], [80, 45], [92, 40], [90, 55],
      [82, 65], [60, 68], [40, 72], [20, 65]
    ]
  },
  seaturtle: {
    name: 'Gentle Sea Turtle',
    theme: 'underwater',
    polygon: [
      [50, 15], [60, 25], [75, 35], [85, 50], [75, 70], [85, 85], [75, 85],
      [60, 78], [50, 82], [40, 78], [25, 85], [15, 85], [25, 70], [15, 50],
      [25, 35], [40, 25]
    ]
  },

  // Animals
  teddy: {
    name: 'Cuddly Teddy Bear',
    theme: 'animals',
    polygon: [
      [35, 25], [25, 18], [22, 28], [28, 35], [25, 48], [32, 58], [22, 68],
      [28, 82], [40, 80], [45, 84], [55, 84], [60, 80], [72, 82], [78, 68],
      [68, 58], [75, 48], [72, 35], [78, 28], [75, 18], [65, 25], [58, 22],
      [42, 22]
    ]
  },
  puppy: {
    name: 'Playful Puppy',
    theme: 'animals',
    polygon: [
      [35, 20], [25, 35], [35, 45], [30, 60], [20, 80], [35, 85], [45, 80],
      [55, 80], [65, 85], [80, 80], [70, 60], [65, 45], [75, 35], [65, 20], [50, 25]
    ]
  },
  rabbit: {
    name: 'Hop Bunny Rabbit',
    theme: 'animals',
    polygon: [
      [35, 10], [42, 30], [58, 30], [65, 10], [72, 32], [68, 50], [80, 70],
      [75, 85], [60, 82], [50, 85], [40, 82], [25, 85], [20, 70], [32, 50], [28, 32]
    ]
  },

  // Fantasy
  castle: {
    name: 'Magic Castle',
    theme: 'fantasy',
    polygon: [
      [20, 85], [20, 45], [15, 45], [25, 20], [35, 45], [30, 45], [30, 55],
      [40, 55], [40, 35], [35, 35], [50, 15], [65, 35], [60, 35], [60, 55],
      [70, 55], [70, 45], [65, 45], [75, 20], [85, 45], [80, 45], [80, 85],
      [58, 85], [58, 70], [50, 62], [42, 70], [42, 85]
    ]
  },
  crown: {
    name: 'Royal Crown',
    theme: 'fantasy',
    polygon: [
      [20, 75], [20, 35], [35, 55], [50, 25], [65, 55], [80, 35], [80, 75]
    ]
  },
  dragon: {
    name: 'Friendly Dragon',
    theme: 'fantasy',
    polygon: [
      [20, 25], [35, 20], [45, 35], [65, 20], [80, 35], [70, 55], [85, 70],
      [65, 80], [50, 75], [45, 85], [35, 75], [25, 65], [15, 45]
    ]
  },

  // Jungle
  butterfly: {
    name: 'Garden Butterfly',
    theme: 'jungle',
    polygon: [
      [50, 20], [56, 12], [58, 14], [52, 22], [72, 20], [88, 30], [90, 50],
      [75, 60], [82, 74], [72, 85], [56, 75], [52, 88], [48, 88], [44, 75],
      [28, 85], [18, 74], [25, 60], [10, 50], [12, 30], [28, 20], [48, 22],
      [42, 14], [44, 12]
    ]
  },
  lion: {
    name: 'Brave Lion Cub',
    theme: 'jungle',
    polygon: [
      [30, 20], [50, 15], [70, 20], [85, 35], [80, 60], [70, 80], [55, 85],
      [45, 85], [30, 80], [20, 60], [15, 35]
    ]
  },
  elephant: {
    name: 'Gentle Elephant',
    theme: 'jungle',
    polygon: [
      [20, 45], [35, 30], [55, 25], [75, 35], [85, 55], [80, 80], [68, 85],
      [62, 75], [50, 75], [45, 85], [35, 85], [35, 65], [20, 75], [15, 65]
    ]
  }
};

// Interpolate additional points along the polygon perimeter based on target count
function interpolatePolygon(poly: [number, number][], targetPoints: number): [number, number][] {
  const result: [number, number][] = [];
  const segments = poly.length;
  const pointsPerSegment = Math.max(1, Math.round(targetPoints / segments));

  for (let i = 0; i < segments; i++) {
    const p1 = poly[i];
    const p2 = poly[(i + 1) % segments];

    for (let k = 0; k < pointsPerSegment; k++) {
      const t = k / pointsPerSegment;
      const x = p1[0] + (p2[0] - p1[0]) * t;
      const y = p1[1] + (p2[1] - p1[1]) * t;
      result.push([Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
    }
  }

  // Trim or keep close to target
  return result;
}

export function generateDotToDot(
  ageGroup: AgeGroup,
  theme: BookTheme,
  seed: number = Date.now(),
  usedNames: string[] = []
): DotToDotData {
  const normalizedUsed = new Set(usedNames.map((n) => n.toLowerCase().trim()));

  // 1. First priority: matching theme silhouettes NOT already used in this book
  const availableThemeKeys = Object.keys(SILHOUETTES).filter(
    (k) => SILHOUETTES[k].theme === theme && !normalizedUsed.has(SILHOUETTES[k].name.toLowerCase().trim())
  );

  let key: string;
  if (availableThemeKeys.length > 0) {
    key = availableThemeKeys[Math.abs(seed) % availableThemeKeys.length];
  } else {
    // 2. Second priority: any unused silhouette across other themes to prevent duplicate in book
    const availableAnyKeys = Object.keys(SILHOUETTES).filter(
      (k) => !normalizedUsed.has(SILHOUETTES[k].name.toLowerCase().trim())
    );
    if (availableAnyKeys.length > 0) {
      key = availableAnyKeys[Math.abs(seed) % availableAnyKeys.length];
    } else {
      // 3. Fallback: cycle through theme silhouettes if all silhouettes in the library were exhausted
      const matchingKeys = Object.keys(SILHOUETTES).filter((k) => SILHOUETTES[k].theme === theme);
      key = matchingKeys.length > 0
        ? matchingKeys[Math.abs(seed) % matchingKeys.length]
        : Object.keys(SILHOUETTES)[Math.abs(seed) % Object.keys(SILHOUETTES).length];
    }
  }

  const template = SILHOUETTES[key];

  let targetDots = 15;
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';

  if (ageGroup === '4-6') {
    targetDots = 14 + (Math.abs(seed) % 4); // 14-18 dots
    difficulty = 'easy';
  } else if (ageGroup === '7-9') {
    targetDots = 28 + (Math.abs(seed) % 8); // 28-36 dots
    difficulty = 'medium';
  } else {
    targetDots = 45 + (Math.abs(seed) % 15); // 45-60 dots
    difficulty = 'hard';
  }

  const rawPoints = interpolatePolygon(template.polygon, targetDots);

  // Map 0-100 coordinate space to 500x500 SVG canvas with margins
  const canvasW = 500;
  const canvasH = 500;
  const pad = 60;
  const scaleX = (canvasW - pad * 2) / 100;
  const scaleY = (canvasH - pad * 2) / 100;

  const points: DotPoint[] = rawPoints.map((pt, i) => ({
    index: i + 1,
    x: Math.round(pad + pt[0] * scaleX),
    y: Math.round(pad + pt[1] * scaleY),
  }));

  // Create original SVG path
  const origPathStr = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ') + ' Z';

  return {
    name: template.name,
    theme,
    points,
    originalPath: origPathStr,
    difficulty,
    seed,
  };
}

export function renderDotToDotSVG(data: DotToDotData, showSolution: boolean = false): string {
  const { points, originalPath, name } = data;
  const width = 500;
  const height = 540;

  // Dots rendering
  let dotsSVG = '';
  const isSimple = points.length <= 20;
  const dotRadius = isSimple ? 4.5 : 3.5;
  const fontSize = isSimple ? 13 : 10.5;

  points.forEach((p, idx) => {
    const isStart = p.index === 1;

    // Offset number slightly so it doesn't overlap the dot
    const prev = points[(idx - 1 + points.length) % points.length];
    const next = points[(idx + 1) % points.length];
    
    // Normal direction away from curve
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    const labelDist = isSimple ? 14 : 11;
    const textX = p.x + nx * labelDist;
    const textY = p.y + ny * labelDist + 3.5;

    dotsSVG += `
      <g>
        <circle cx="${p.x}" cy="${p.y}" r="${dotRadius}" fill="${isStart ? '#ef4444' : '#0f172a'}" />
        ${isStart ? `<circle cx="${p.x}" cy="${p.y}" r="${dotRadius + 4}" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="2,2" />` : ''}
        <text x="${textX}" y="${textY}" font-family="'Outfit', sans-serif" font-weight="${isStart ? '800' : '600'}" 
              font-size="${fontSize}" fill="${isStart ? '#dc2626' : '#334155'}" text-anchor="middle">${p.index}</text>
      </g>
    `;
  });

  // Solution path (connecting the dots)
  let solutionLines = '';
  if (showSolution) {
    solutionLines = `
      <path d="${originalPath}" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
    `;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-full">
      <rect width="${width}" height="${height}" fill="#ffffff" />
      
      <!-- Faint guide silhouette for preschoolers or solutions -->
      ${showSolution ? '' : `<path d="${originalPath}" fill="none" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="4,4" />`}

      <!-- Solution outline -->
      ${solutionLines}

      <!-- Dots & Numbers -->
      ${dotsSVG}

      <!-- Bottom Hint / Name -->
      <text x="${width / 2}" y="${height - 15}" font-family="'Outfit', sans-serif" font-weight="600" font-size="12" fill="#94a3b8" text-anchor="middle">
        ${showSolution ? `Completed: ${name}` : 'Connect the dots from 1 to ' + points.length + ' to reveal the picture!'}
      </text>
    </svg>
  `;
}
