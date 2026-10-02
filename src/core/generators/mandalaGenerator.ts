import { AgeGroup } from '../../types/book';

export interface MandalaData {
  title: string;
  theme: string;
  symmetry: number;
  complexity: 'easy' | 'medium' | 'hard';
  seed: number;
  svgContent: string;
}

export interface MandalaTemplate {
  id: string;
  title: string;
  emoji: string;
  description: string;
  symmetry: number;
}

export const MANDALA_TEMPLATES: MandalaTemplate[] = [
  {
    id: 'lotus',
    title: 'Sacred Lotus Blossom',
    emoji: '🌸',
    description: 'Calming radial lotus petals with soothing concentric rings',
    symmetry: 8,
  },
  {
    id: 'sunburst',
    title: 'Cosmic Sunburst',
    emoji: '☀️',
    description: 'Radiant geometric solar rays and sacred geometric wheels',
    symmetry: 12,
  },
  {
    id: 'galaxy_star',
    title: 'Galactic Star Wheel',
    emoji: '🌟',
    description: 'Kaleidoscope cosmic star points radiating through outer space',
    symmetry: 8,
  },
  {
    id: 'sea_turtle',
    title: 'Sacred Ocean Ring',
    emoji: '🐢',
    description: 'Hypnotic marine ripples and symmetrical oceanic shell rings',
    symmetry: 6,
  },
  {
    id: 'crystal',
    title: 'Crystal Snowflake',
    emoji: '💎',
    description: 'Precision crystal prisms and sparkling geometrical facets',
    symmetry: 6,
  },
  {
    id: 'flower_of_life',
    title: 'Flower of Life',
    emoji: '☸️',
    description: 'Ancient overlapping sacred circles forming harmonious rosettes',
    symmetry: 6,
  },
  {
    id: 'zen_vortex',
    title: 'Zen Spiral Vortex',
    emoji: '🌀',
    description: 'Deep meditative swirling vortex petals for peaceful relaxation',
    symmetry: 10,
  },
  {
    id: 'butterfly',
    title: 'Kaleidoscope Wings',
    emoji: '🦋',
    description: 'Symmetrical butterfly wings repeating in a hypnotic circle',
    symmetry: 8,
  },
];

/**
 * Generates an authentic geometric SVG Mandala tailored for kids coloring.
 */
export function generateMandalaSVG(
  templateIndex: number,
  ageGroup: AgeGroup = '4-6',
  width: number = 500,
  height: number = 500
): string {
  const tmpl = MANDALA_TEMPLATES[templateIndex % MANDALA_TEMPLATES.length];
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.44;

  const isYoung = ageGroup === '4-6';
  const symmetry = isYoung ? Math.min(6, tmpl.symmetry) : tmpl.symmetry;
  const strokeWidth = isYoung ? 3.5 : 2.2;
  const strokeColor = '#1e293b';

  let paths = '';

  // 1. Concentric Guide Circles
  const ringsCount = isYoung ? 4 : 6;
  for (let i = 1; i <= ringsCount; i++) {
    const r = (radius / ringsCount) * i;
    paths += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
    
    // Add inner ring bead accents
    if (!isYoung && i % 2 === 1) {
      const beadCount = symmetry * 2;
      for (let b = 0; b < beadCount; b++) {
        const angle = (b * 2 * Math.PI) / beadCount;
        const bx = cx + r * Math.cos(angle);
        const by = cy + r * Math.sin(angle);
        paths += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="3" fill="none" stroke="${strokeColor}" stroke-width="1.8" />`;
      }
    }
  }

  // 2. Radial Symmetry Petals (Layer 1 - Center Core)
  const coreRadius = radius * 0.35;
  for (let s = 0; s < symmetry; s++) {
    const a1 = (s * 2 * Math.PI) / symmetry;
    const a2 = ((s + 1) * 2 * Math.PI) / symmetry;
    const midAngle = (a1 + a2) / 2;

    const x1 = cx + (coreRadius * 0.4) * Math.cos(a1);
    const y1 = cy + (coreRadius * 0.4) * Math.sin(a1);
    const x2 = cx + (coreRadius * 0.4) * Math.cos(a2);
    const y2 = cy + (coreRadius * 0.4) * Math.sin(a2);

    const tipX = cx + coreRadius * Math.cos(midAngle);
    const tipY = cy + coreRadius * Math.sin(midAngle);

    paths += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${tipX.toFixed(1)} ${tipY.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" />`;
  }

  // 3. Radial Symmetry Petals (Layer 2 - Mid Ring)
  const midRadiusInner = radius * 0.35;
  const midRadiusOuter = radius * 0.7;
  for (let s = 0; s < symmetry; s++) {
    const a1 = (s * 2 * Math.PI) / symmetry;
    const a2 = ((s + 1) * 2 * Math.PI) / symmetry;
    const midAngle = (a1 + a2) / 2;

    const x1 = cx + midRadiusInner * Math.cos(a1);
    const y1 = cy + midRadiusInner * Math.sin(a1);
    const x2 = cx + midRadiusInner * Math.cos(a2);
    const y2 = cy + midRadiusInner * Math.sin(a2);

    const tipX = cx + midRadiusOuter * Math.cos(midAngle);
    const tipY = cy + midRadiusOuter * Math.sin(midAngle);

    paths += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${cx + midRadiusInner * 1.2 * Math.cos(a1)} ${cy + midRadiusInner * 1.2 * Math.sin(a1)}, ${tipX} ${tipY}, ${tipX.toFixed(1)} ${tipY.toFixed(1)} C ${tipX} ${tipY}, ${cx + midRadiusInner * 1.2 * Math.cos(a2)} ${cy + midRadiusInner * 1.2 * Math.sin(a2)}, ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" />`;

    // Diamond accent inside petal
    if (!isYoung) {
      const dX = cx + (midRadiusOuter * 0.8) * Math.cos(midAngle);
      const dY = cy + (midRadiusOuter * 0.8) * Math.sin(midAngle);
      paths += `<circle cx="${dX.toFixed(1)}" cy="${dY.toFixed(1)}" r="4" fill="none" stroke="${strokeColor}" stroke-width="1.8" />`;
    }
  }

  // 4. Outer Crown Petals (Layer 3 - Outer Edge)
  const outerRadiusInner = radius * 0.7;
  const outerRadiusOuter = radius * 0.98;
  const outerSymmetry = symmetry * (isYoung ? 1 : 2);

  for (let s = 0; s < outerSymmetry; s++) {
    const a1 = (s * 2 * Math.PI) / outerSymmetry;
    const a2 = ((s + 1) * 2 * Math.PI) / outerSymmetry;
    const midAngle = (a1 + a2) / 2;

    const x1 = cx + outerRadiusInner * Math.cos(a1);
    const y1 = cy + outerRadiusInner * Math.sin(a1);
    const x2 = cx + outerRadiusInner * Math.cos(a2);
    const y2 = cy + outerRadiusInner * Math.sin(a2);

    const tipX = cx + outerRadiusOuter * Math.cos(midAngle);
    const tipY = cy + outerRadiusOuter * Math.sin(midAngle);

    paths += `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${tipX.toFixed(1)} ${tipY.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round" />`;
  }

  // 5. Center Flower Eye
  paths += `<circle cx="${cx}" cy="${cy}" r="${(radius * 0.12).toFixed(1)}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" />`;
  paths += `<circle cx="${cx}" cy="${cy}" r="${(radius * 0.05).toFixed(1)}" fill="${strokeColor}" />`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-full select-none">
      <rect width="${width}" height="${height}" fill="#ffffff" rx="24" />
      <g>
        ${paths}
      </g>
    </svg>
  `;
}

/**
 * Generates Mandala activity page data
 */
export function generateMandalaData(
  templateIndex: number,
  ageGroup: AgeGroup = '4-6',
  seed: number = Date.now()
): MandalaData {
  const tmpl = MANDALA_TEMPLATES[templateIndex % MANDALA_TEMPLATES.length];
  const svgContent = generateMandalaSVG(templateIndex, ageGroup);

  return {
    title: tmpl.title,
    theme: tmpl.id,
    symmetry: tmpl.symmetry,
    complexity: ageGroup === '4-6' ? 'easy' : ageGroup === '7-9' ? 'medium' : 'hard',
    seed,
    svgContent,
  };
}
