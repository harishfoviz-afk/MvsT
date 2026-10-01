import { BookProject, BookTheme } from '../../types/book';
import { calculateCoverDimensions } from '../assembly/kdpSpecs';
import { KUNTA_LOGO_BASE64 } from '../assets/publisherLogo';

export interface CoverThemeStyle {
  name: string;
  bgGradient: [string, string];
  cardBg: string;
  primaryTextColor: string;
  accentBadgeColor: string;
  heroGraphic: string; // SVG elements for front cover
}

export const COVER_THEMES: Record<BookTheme, CoverThemeStyle> = {
  space: {
    name: 'Cosmic Galaxy',
    bgGradient: ['#0f172a', '#1e1b4b'],
    cardBg: '#1e293b',
    primaryTextColor: '#f8fafc',
    accentBadgeColor: '#f59e0b',
    heroGraphic: `
      <!-- Space Hero Graphic -->
      <g transform="translate(180, 240) scale(1.6)">
        <circle cx="0" cy="0" r="55" fill="#3b82f6" opacity="0.15" />
        <ellipse cx="0" cy="0" rx="75" ry="18" fill="none" stroke="#60a5fa" stroke-width="3" transform="rotate(-20)" />
        <path d="M 0 -50 C 20 -15 25 25 25 45 L -25 45 C -25 25 -20 -15 0 -50 Z" fill="#ffffff" stroke="#1e293b" stroke-width="3" />
        <circle cx="0" cy="0" r="14" fill="#38bdf8" stroke="#1e293b" stroke-width="2.5" />
        <!-- Fins -->
        <polygon points="-25,25 -50,45 -25,45" fill="#ef4444" stroke="#1e293b" stroke-width="2" />
        <polygon points="25,25 50,45 25,45" fill="#ef4444" stroke="#1e293b" stroke-width="2" />
        <!-- Thruster -->
        <polygon points="-12,47 0,72 12,47" fill="#fbbf24" stroke="#f97316" stroke-width="2" />
      </g>
    `,
  },
  dinosaurs: {
    name: 'Dino Jurassic Kingdom',
    bgGradient: ['#064e3b', '#065f46'],
    cardBg: '#022c22',
    primaryTextColor: '#fef3c7',
    accentBadgeColor: '#f97316',
    heroGraphic: `
      <!-- Dino Hero Graphic -->
      <g transform="translate(180, 250) scale(1.5)">
        <ellipse cx="0" cy="15" rx="55" ry="38" fill="#10b981" stroke="#064e3b" stroke-width="3" />
        <path d="M -20 -30 Q 15 -45 35 -20 Q 30 10 -10 0 Z" fill="#10b981" stroke="#064e3b" stroke-width="3" />
        <circle cx="15" cy="-22" r="4" fill="#064e3b" />
        <!-- Spikes -->
        <polygon points="-30,-5 -20,-28 -10,-8" fill="#f59e0b" stroke="#064e3b" stroke-width="2" />
        <polygon points="-10,-8 0,-32 10,-8" fill="#f59e0b" stroke="#064e3b" stroke-width="2" />
        <polygon points="10,-8 20,-30 30,-5" fill="#f59e0b" stroke="#064e3b" stroke-width="2" />
        <!-- Legs -->
        <rect x="-35" y="45" width="18" height="25" rx="5" fill="#10b981" stroke="#064e3b" stroke-width="3" />
        <rect x="15" y="45" width="18" height="25" rx="5" fill="#10b981" stroke="#064e3b" stroke-width="3" />
      </g>
    `,
  },
  animals: {
    name: 'Safari & Farm Friends',
    bgGradient: ['#d97706', '#b45309'],
    cardBg: '#78350f',
    primaryTextColor: '#ffffff',
    accentBadgeColor: '#10b981',
    heroGraphic: `
      <!-- Animal Hero Graphic (Lion & Puppy) -->
      <g transform="translate(180, 240) scale(1.6)">
        <!-- Lion Mane -->
        <circle cx="0" cy="0" r="54" fill="#f59e0b" stroke="#b45309" stroke-width="3" />
        <!-- Face -->
        <circle cx="0" cy="5" r="38" fill="#fde68a" stroke="#b45309" stroke-width="2.5" />
        <!-- Ears -->
        <circle cx="-32" cy="-22" r="12" fill="#f59e0b" stroke="#b45309" stroke-width="2" />
        <circle cx="32" cy="-22" r="12" fill="#f59e0b" stroke="#b45309" stroke-width="2" />
        <!-- Eyes -->
        <circle cx="-14" cy="0" r="5" fill="#78350f" />
        <circle cx="14" cy="0" r="5" fill="#78350f" />
        <!-- Nose & Whiskers -->
        <polygon points="-6,10 6,10 0,16" fill="#78350f" />
        <line x1="-12" y1="16" x2="-35" y2="14" stroke="#78350f" stroke-width="1.5" />
        <line x1="12" y1="16" x2="35" y2="14" stroke="#78350f" stroke-width="1.5" />
      </g>
    `,
  },
  fantasy: {
    name: 'Magic & Fairy Castle',
    bgGradient: ['#701a75', '#831843'],
    cardBg: '#4c0519',
    primaryTextColor: '#fdf4ff',
    accentBadgeColor: '#fbbf24',
    heroGraphic: `
      <!-- Fantasy Hero Graphic (Unicorn & Star) -->
      <g transform="translate(180, 240) scale(1.5)">
        <polygon points="0,-65 8,-20 -8,-20" fill="#fbbf24" stroke="#d97706" stroke-width="2" />
        <ellipse cx="0" cy="10" rx="42" ry="34" fill="#ffffff" stroke="#701a75" stroke-width="3" />
        <!-- Mane -->
        <path d="M -20 -15 Q -45 5 -30 35" fill="none" stroke="#f472b6" stroke-width="6" stroke-linecap="round" />
        <path d="M -15 -5 Q -40 15 -25 45" fill="none" stroke="#a855f7" stroke-width="6" stroke-linecap="round" />
        <circle cx="14" cy="5" r="5" fill="#701a75" />
        <polygon points="35,-30 38,-20 48,-20 40,-12 43,-2 35,-8 27,-2 30,-12 22,-20 32,-20" fill="#fbbf24" />
      </g>
    `,
  },
  underwater: {
    name: 'Ocean Sea World',
    bgGradient: ['#0369a1', '#075985'],
    cardBg: '#082f49',
    primaryTextColor: '#f0f9ff',
    accentBadgeColor: '#f97316',
    heroGraphic: `
      <!-- Underwater Hero Graphic (Playful Dolphin & Fish) -->
      <g transform="translate(180, 240) scale(1.5)">
        <path d="M -50 15 C -20 -25 35 -25 60 5 C 75 25 50 40 25 30 C -15 25 -35 35 -50 15 Z" fill="#38bdf8" stroke="#0369a1" stroke-width="3" />
        <circle cx="35" cy="5" r="4" fill="#082f49" />
        <polygon points="58,5 78,-10 68,15 78,30 58,15" fill="#38bdf8" stroke="#0369a1" stroke-width="2" />
        <circle cx="-10" cy="-35" r="6" fill="none" stroke="#bae6fd" stroke-width="2" />
        <circle cx="15" cy="-45" r="9" fill="none" stroke="#bae6fd" stroke-width="2" />
      </g>
    `,
  },
  jungle: {
    name: 'Tropical Jungle Wilds',
    bgGradient: ['#15803d', '#166534'],
    cardBg: '#14532d',
    primaryTextColor: '#f0fdf4',
    accentBadgeColor: '#f59e0b',
    heroGraphic: `
      <!-- Jungle Hero Graphic (Monkey & Tropical Palm) -->
      <g transform="translate(180, 240) scale(1.5)">
        <circle cx="0" cy="0" r="42" fill="#78350f" stroke="#451a03" stroke-width="3" />
        <ellipse cx="0" cy="8" rx="28" ry="22" fill="#fed7aa" stroke="#451a03" stroke-width="2" />
        <circle cx="-38" cy="0" r="16" fill="#78350f" stroke="#451a03" stroke-width="2.5" />
        <circle cx="38" cy="0" r="16" fill="#78350f" stroke="#451a03" stroke-width="2.5" />
        <circle cx="-12" cy="4" r="4" fill="#451a03" />
        <circle cx="12" cy="4" r="4" fill="#451a03" />
        <path d="M -8 18 Q 0 25 8 18" fill="none" stroke="#451a03" stroke-width="2.5" stroke-linecap="round" />
      </g>
    `,
  },
};

/**
 * Generates full-wrap KDP cover SVG string (Back Cover + Spine + Front Cover + Bleed)
 */
export function generateCoverWrapSVG(project: BookProject): string {
  const actualInteriorPages = project.pages.length * (project.config.singleSided ? 2 : 1) + 6;
  const dims = calculateCoverDimensions(actualInteriorPages, 'white');
  const style = COVER_THEMES[project.cover.theme] || COVER_THEMES.animals;

  const totalW = dims.totalWidthPoints;
  const totalH = dims.totalHeightPoints;
  const spineW = dims.spineWidthPoints;
  const spineX = dims.spineOffsetPoints;
  const frontX = dims.frontCoverOffsetPoints;
  const backX = dims.backCoverOffsetPoints;
  const coverW = frontX - (spineX + spineW); // trimWidthPoints

  // Front Cover Details
  const title = project.cover.title;
  const subtitle = project.cover.subtitle;
  const author = project.cover.authorName;
  const ageGroup = project.config.ageGroup;
  const showLogo = project.cover.showPublisherLogo !== false;
  const logoPlacement = project.cover.logoPlacement || 'both';

  // If user uploaded a full-wrap cover, render it directly with optional publisher logo overlay
  if (project.cover.coverMode === 'uploaded-full' && project.cover.uploadedFullWrapUrl) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="100%" height="100%">
        <image href="${project.cover.uploadedFullWrapUrl}" x="0" y="0" width="${totalW}" height="${totalH}" preserveAspectRatio="none" />
        ${showLogo && (logoPlacement === 'both' || logoPlacement === 'back') ? `
          <!-- Official Kunta Publications Back Cover Badge Overlay -->
          <g id="kunta-back-logo" class="kunta-logo-badge" transform="translate(${backX + 45}, ${totalH - 120})">
            <rect x="0" y="0" width="${coverW - 230}" height="86" rx="8" fill="#0b192c" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.6" />
            <image href="${KUNTA_LOGO_BASE64}" x="10" y="8" width="${coverW - 250}" height="70" preserveAspectRatio="xMidYMid meet" />
          </g>
        ` : ''}
        ${showLogo && (logoPlacement === 'both' || logoPlacement === 'front') ? `
          <!-- Official Kunta Publications Front Cover Badge Overlay -->
          <g id="kunta-front-logo" class="kunta-logo-badge" transform="translate(${frontX + coverW / 2 - 90}, ${totalH - 65})">
            <rect x="0" y="0" width="180" height="48" rx="8" fill="#0b192c" fill-opacity="0.9" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.5" />
            <image href="${KUNTA_LOGO_BASE64}" x="8" y="5" width="164" height="38" preserveAspectRatio="xMidYMid meet" />
          </g>
        ` : ''}
        <!-- Visual guides -->
        <line x1="${spineX}" y1="0" x2="${spineX}" y2="${totalH}" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6" />
        <line x1="${spineX + spineW}" y1="0" x2="${spineX + spineW}" y2="${totalH}" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.6" />
      </svg>
    `;
  }

  // Features bullets for back cover
  const featuresSvg = project.cover.features
    .slice(0, 5)
    .map((feat, i) => {
      return `<text x="${backX + 45}" y="${180 + i * 32}" font-family="'Outfit', sans-serif" font-weight="600" font-size="13" fill="#ffffff">${feat}</text>`;
    })
    .join('');

  // Front cover content: If user uploaded front cover, show their artwork with optional publisher logo overlay!
  const frontCoverContent = (project.cover.coverMode === 'uploaded-front' && project.cover.uploadedFrontCoverUrl)
    ? `
      <g transform="translate(${frontX}, 0)">
        <image href="${project.cover.uploadedFrontCoverUrl}" x="0" y="0" width="${coverW}" height="${totalH}" preserveAspectRatio="xMidYMid slice" />
        ${showLogo && (logoPlacement === 'both' || logoPlacement === 'front') ? `
          <!-- Official Kunta Publications Front Cover Badge Overlay -->
          <g id="kunta-front-logo" class="kunta-logo-badge" transform="translate(${coverW / 2 - 90}, ${totalH - 65})">
            <rect x="0" y="0" width="180" height="48" rx="8" fill="#0b192c" fill-opacity="0.9" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.5" />
            <image href="${KUNTA_LOGO_BASE64}" x="8" y="5" width="164" height="38" preserveAspectRatio="xMidYMid meet" />
          </g>
        ` : ''}
      </g>
    `
    : `
      <!-- ==================== FRONT COVER ==================== -->
      <g transform="translate(${frontX}, 0)">
        <!-- Age Target Badge -->
        <g transform="translate(${coverW - 110}, 65)">
          <polygon points="0,0 85,0 85,38 0,38" rx="8" fill="${style.accentBadgeColor}" />
          <text x="42.5" y="24" font-family="'Fredoka', sans-serif" font-weight="700" font-size="16" fill="#ffffff" text-anchor="middle">
            AGES ${ageGroup}
          </text>
        </g>

        <!-- Fun Over-Title Ribbon -->
        <rect x="40" y="70" width="160" height="28" rx="14" fill="#ffffff" fill-opacity="0.2" />
        <text x="120" y="89" font-family="'Outfit', sans-serif" font-weight="800" font-size="12" fill="#fef08a" text-anchor="middle" letter-spacing="1.5">
          BIG ACTIVITY BOOK
        </text>

        <!-- Main Title Header -->
        <g transform="translate(${coverW / 2}, 150)">
          <text x="0" y="0" font-family="'Fredoka', sans-serif" font-weight="700" font-size="34" fill="#ffffff" text-anchor="middle">
            ${title.toUpperCase()}
          </text>
          <!-- Subtitle Box -->
          <rect x="-${coverW / 2 - 30}" y="20" width="${coverW - 60}" height="38" rx="19" fill="#ffffff" />
          <text x="0" y="44" font-family="'Outfit', sans-serif" font-weight="800" font-size="13" fill="#0f172a" text-anchor="middle">
            ${subtitle.toUpperCase()}
          </text>
        </g>

        <!-- Hero Illustration -->
        <g transform="translate(${coverW / 2 - 180}, 80)">
          ${style.heroGraphic}
        </g>

        <!-- Activity Badges (4 Colorful Pills) -->
        <g transform="translate(0, ${totalH - 240})">
          <rect x="35" y="0" width="${(coverW - 90) / 2}" height="36" rx="18" fill="#ec4899" />
          <text x="${35 + (coverW - 90) / 4}" y="23" font-family="'Outfit', sans-serif" font-weight="700" font-size="13" fill="#ffffff" text-anchor="middle">
            🌀 Fun Mazes
          </text>

          <rect x="${45 + (coverW - 90) / 2}" y="0" width="${(coverW - 90) / 2}" height="36" rx="18" fill="#3b82f6" />
          <text x="${45 + (coverW - 90) / 2 + (coverW - 90) / 4}" y="23" font-family="'Outfit', sans-serif" font-weight="700" font-size="13" fill="#ffffff" text-anchor="middle">
            🔍 Word Searches
          </text>

          <rect x="35" y="46" width="${(coverW - 90) / 2}" height="36" rx="18" fill="#10b981" />
          <text x="${35 + (coverW - 90) / 4}" y="69" font-family="'Outfit', sans-serif" font-weight="700" font-size="13" fill="#ffffff" text-anchor="middle">
            🔢 Dot-To-Dot
          </text>

          <rect x="${45 + (coverW - 90) / 2}" y="46" width="${(coverW - 90) / 2}" height="36" rx="18" fill="#f59e0b" />
          <text x="${45 + (coverW - 90) / 2 + (coverW - 90) / 4}" y="69" font-family="'Outfit', sans-serif" font-weight="700" font-size="13" fill="#ffffff" text-anchor="middle">
            🖍️ Coloring &amp; Sudoku
          </text>
        </g>

        <!-- Author Banner at Bottom -->
        <text x="${coverW / 2}" y="${totalH - 85}" font-family="'Outfit', sans-serif" font-weight="700" font-size="15" fill="#f8fafc" text-anchor="middle" letter-spacing="1">
          By ${author}
        </text>

        <!-- Official Kunta Publications Imprint Logo Tag -->
        ${showLogo && (logoPlacement === 'both' || logoPlacement === 'front') ? `
          <g id="kunta-front-logo" class="kunta-logo-badge" transform="translate(${coverW / 2 - 80}, ${totalH - 58})">
            <rect x="0" y="0" width="160" height="44" rx="8" fill="#0b192c" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.5" />
            <image href="${KUNTA_LOGO_BASE64}" x="6" y="4" width="148" height="36" preserveAspectRatio="xMidYMid meet" />
          </g>
        ` : ''}
      </g>
    `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="100%" height="100%">
      <defs>
        <linearGradient id="coverBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${style.bgGradient[0]}" />
          <stop offset="100%" stop-color="${style.bgGradient[1]}" />
        </linearGradient>
        <pattern id="coverStars" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1.5" fill="#ffffff" opacity="0.18" />
          <circle cx="5" cy="10" r="1" fill="#ffffff" opacity="0.12" />
          <circle cx="35" cy="30" r="1" fill="#ffffff" opacity="0.12" />
        </pattern>
      </defs>

      <!-- Base Wrap Background -->
      <rect width="${totalW}" height="${totalH}" fill="url(#coverBg)" />
      <rect width="${totalW}" height="${totalH}" fill="url(#coverStars)" />

      <!-- Bleed & Trim Safe Guidelines (Visual reference) -->
      <line x1="${spineX}" y1="0" x2="${spineX}" y2="${totalH}" stroke="#ffffff" stroke-width="1" stroke-dasharray="4,4" opacity="0.3" />
      <line x1="${spineX + spineW}" y1="0" x2="${spineX + spineW}" y2="${totalH}" stroke="#ffffff" stroke-width="1" stroke-dasharray="4,4" opacity="0.3" />

      <!-- ==================== BACK COVER ==================== -->
      <g>
        <!-- Card Frame -->
        <rect x="${backX + 25}" y="45" width="${coverW - 50}" height="${totalH - 90}" 
              rx="16" fill="#000000" fill-opacity="0.25" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.3" />

        <!-- Header -->
        <text x="${backX + coverW / 2}" y="100" font-family="'Fredoka', sans-serif" font-weight="700" font-size="24" fill="#fbbf24" text-anchor="middle">
          HOURS OF SCREEN-FREE FUN!
        </text>

        <!-- Blurb -->
        <foreignObject x="${backX + 45}" y="115" width="${coverW - 90}" height="70">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: 'Outfit', sans-serif; font-size: 13px; color: #e2e8f0; line-height: 1.4; text-align: center;">
            ${project.cover.backCoverBlurb}
          </div>
        </foreignObject>

        <!-- Bullet Features -->
        <g transform="translate(0, 30)">
          ${featuresSvg}
        </g>

        <!-- Benefits highlight box -->
        <rect x="${backX + 45}" y="${totalH - 260}" width="${coverW - 90}" height="75" rx="12" fill="#ffffff" fill-opacity="0.1" stroke="#38bdf8" stroke-width="1" />
        <text x="${backX + coverW / 2}" y="${totalH - 235}" font-family="'Outfit', sans-serif" font-weight="800" font-size="14" fill="#38bdf8" text-anchor="middle">
          ★ DEVELOPED WITH EDUCATORS ★
        </text>
        <text x="${backX + coverW / 2}" y="${totalH - 210}" font-family="'Outfit', sans-serif" font-weight="500" font-size="12" fill="#ffffff" text-anchor="middle">
          Promotes logical thinking, hand-eye coordination &amp; vocabulary
        </text>

        <!-- Official Kunta Publications Publisher Imprint Logo Badge -->
        ${showLogo && (logoPlacement === 'both' || logoPlacement === 'back') ? `
          <g id="kunta-back-logo" class="kunta-logo-badge" transform="translate(${backX + 45}, ${totalH - 120})">
            <rect x="0" y="0" width="${coverW - 230}" height="86" rx="8" fill="#0b192c" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.4" />
            <image href="${KUNTA_LOGO_BASE64}" x="10" y="8" width="${coverW - 250}" height="70" preserveAspectRatio="xMidYMid meet" />
          </g>
        ` : ''}

        <!-- KDP Barcode Safe Zone Placeholder -->
        <rect x="${backX + coverW - 170}" y="${totalH - 120}" width="144" height="86" fill="#ffffff" rx="4" stroke="#94a3b8" stroke-width="1" />
        <text x="${backX + coverW - 98}" y="${totalH - 75}" font-family="sans-serif" font-weight="bold" font-size="10" fill="#475569" text-anchor="middle">
          [ KDP Barcode Zone ]
        </text>
        <text x="${backX + coverW - 98}" y="${totalH - 58}" font-family="sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">
          Auto-placed by Amazon
        </text>
      </g>

      <!-- ==================== SPINE ==================== -->
      <g>
        <rect x="${spineX}" y="0" width="${spineW}" height="${totalH}" fill="#000000" fill-opacity="0.2" />
        ${
          spineW >= 24
            ? `
          <g transform="rotate(90 ${spineX + spineW / 2} ${totalH / 2})">
            <text x="${totalH / 2}" y="${-(spineX + spineW / 2) + 4}" font-family="'Outfit', sans-serif" font-weight="700" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="1">
              ${title} • ${author}
            </text>
          </g>
        `
            : ''
        }
      </g>

      <!-- Front Cover Layer -->
      ${frontCoverContent}
    </svg>
  `;
}

/**
 * Generates standalone Amazon KDP Front Cover SVG (8.5" x 11", 612 x 792 pt).
 * Calibrated to render crisp Kindle eBook cover JPEG with minimum 1000px height and 625px width.
 */
export function generateFrontCoverSVG(project: BookProject): string {
  const style = COVER_THEMES[project.cover.theme] || COVER_THEMES[project.config.theme] || COVER_THEMES.animals;
  const coverW = 612;
  const coverH = 792;
  const title = project.cover.title || project.config.title;
  const subtitle = project.cover.subtitle || project.config.subtitle;
  const author = project.cover.authorName || project.config.authorName;
  const ageGroup = project.config.ageGroup;
  const showLogo = project.cover.showPublisherLogo !== false;
  const logoPlacement = project.cover.logoPlacement || 'both';

  // If user uploaded a custom front cover image, embed it directly with optional publisher logo
  if (project.cover.coverMode === 'uploaded-front' && project.cover.uploadedFrontCoverUrl) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${coverW} ${coverH}" width="2550" height="3300">
        <image href="${project.cover.uploadedFrontCoverUrl}" x="0" y="0" width="${coverW}" height="${coverH}" preserveAspectRatio="xMidYMid slice" />
        ${showLogo && (logoPlacement === 'both' || logoPlacement === 'front') ? `
          <g id="kunta-front-logo" class="kunta-logo-badge" transform="translate(${coverW / 2 - 90}, ${coverH - 65})">
            <rect x="0" y="0" width="180" height="48" rx="8" fill="#0b192c" fill-opacity="0.9" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.5" />
            <image href="${KUNTA_LOGO_BASE64}" x="8" y="5" width="164" height="38" preserveAspectRatio="xMidYMid meet" />
          </g>
        ` : ''}
      </svg>
    `;
  }

  // If user uploaded a full wrap, extract the front half
  if (project.cover.coverMode === 'uploaded-full' && project.cover.uploadedFullWrapUrl) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${coverW} ${coverH}" width="2550" height="3300">
        <image href="${project.cover.uploadedFullWrapUrl}" x="-${coverW}" y="0" width="${coverW * 2.1}" height="${coverH}" preserveAspectRatio="xMaxYMid slice" />
        ${showLogo && (logoPlacement === 'both' || logoPlacement === 'front') ? `
          <g id="kunta-front-logo" class="kunta-logo-badge" transform="translate(${coverW / 2 - 90}, ${coverH - 65})">
            <rect x="0" y="0" width="180" height="48" rx="8" fill="#0b192c" fill-opacity="0.9" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.5" />
            <image href="${KUNTA_LOGO_BASE64}" x="8" y="5" width="164" height="38" preserveAspectRatio="xMidYMid meet" />
          </g>
        ` : ''}
      </svg>
    `;
  }

  // Built-in template front cover calibrated to match configuration
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${coverW} ${coverH}" width="2550" height="3300">
      <defs>
        <linearGradient id="frontCoverBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${style.bgGradient[0]}" />
          <stop offset="100%" stop-color="${style.bgGradient[1]}" />
        </linearGradient>
        <pattern id="frontCoverStars" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="20" cy="20" r="1.5" fill="#ffffff" opacity="0.18" />
          <circle cx="5" cy="10" r="1" fill="#ffffff" opacity="0.12" />
          <circle cx="35" cy="30" r="1" fill="#ffffff" opacity="0.12" />
        </pattern>
      </defs>

      <!-- Background -->
      <rect width="${coverW}" height="${coverH}" fill="url(#frontCoverBg)" />
      <rect width="${coverW}" height="${coverH}" fill="url(#frontCoverStars)" />

      <!-- Age Target Badge (Top Right) -->
      <g transform="translate(${coverW - 120}, 45)">
        <polygon points="0,0 95,0 95,36 0,36" rx="8" fill="${style.accentBadgeColor}" />
        <text x="47.5" y="23" font-family="'Fredoka', sans-serif" font-weight="700" font-size="15" fill="#ffffff" text-anchor="middle">
          AGES ${ageGroup}
        </text>
      </g>

      <!-- Fun Over-Title Ribbon (Top Left) -->
      <rect x="35" y="48" width="170" height="28" rx="14" fill="#ffffff" fill-opacity="0.2" />
      <text x="120" y="67" font-family="'Outfit', sans-serif" font-weight="800" font-size="12" fill="#fef08a" text-anchor="middle" letter-spacing="1.5">
        BIG ACTIVITY BOOK
      </text>

      <!-- Main Title Header -->
      <g transform="translate(${coverW / 2}, 140)">
        <text x="0" y="0" font-family="'Fredoka', sans-serif" font-weight="700" font-size="36" fill="#ffffff" text-anchor="middle">
          ${title.toUpperCase()}
        </text>
        <!-- Subtitle Box -->
        <rect x="-${coverW / 2 - 35}" y="18" width="${coverW - 70}" height="38" rx="19" fill="#ffffff" />
        <text x="0" y="42" font-family="'Outfit', sans-serif" font-weight="800" font-size="13" fill="#0f172a" text-anchor="middle">
          ${subtitle.toUpperCase()}
        </text>
      </g>

      <!-- Hero Illustration -->
      <g transform="translate(${coverW / 2 - 180}, 75)">
        ${style.heroGraphic}
      </g>

      <!-- Activity Badges (4 Colorful Pills) -->
      <g transform="translate(0, ${coverH - 235})">
        <rect x="35" y="0" width="${(coverW - 90) / 2}" height="36" rx="18" fill="#ec4899" />
        <text x="${35 + (coverW - 90) / 4}" y="23" font-family="'Outfit', sans-serif" font-weight="700" font-size="13" fill="#ffffff" text-anchor="middle">
          🌀 Fun Mazes
        </text>

        <rect x="${45 + (coverW - 90) / 2}" y="0" width="${(coverW - 90) / 2}" height="36" rx="18" fill="#3b82f6" />
        <text x="${45 + (coverW - 90) / 2 + (coverW - 90) / 4}" y="23" font-family="'Outfit', sans-serif" font-weight="700" font-size="13" fill="#ffffff" text-anchor="middle">
          🔍 Word Searches
        </text>

        <rect x="35" y="46" width="${(coverW - 90) / 2}" height="36" rx="18" fill="#10b981" />
        <text x="${35 + (coverW - 90) / 4}" y="69" font-family="'Outfit', sans-serif" font-weight="700" font-size="13" fill="#ffffff" text-anchor="middle">
          🔢 Dot-To-Dot
        </text>

        <rect x="${45 + (coverW - 90) / 2}" y="46" width="${(coverW - 90) / 2}" height="36" rx="18" fill="#f59e0b" />
        <text x="${45 + (coverW - 90) / 2 + (coverW - 90) / 4}" y="69" font-family="'Outfit', sans-serif" font-weight="700" font-size="13" fill="#ffffff" text-anchor="middle">
          🖍️ Coloring &amp; Sudoku
        </text>
      </g>

      <!-- Author Banner -->
      <text x="${coverW / 2}" y="${coverH - 85}" font-family="'Outfit', sans-serif" font-weight="700" font-size="16" fill="#f8fafc" text-anchor="middle" letter-spacing="1">
        By ${author}
      </text>

      <!-- Official Kunta Publications Imprint Logo Tag -->
      ${showLogo && (logoPlacement === 'both' || logoPlacement === 'front') ? `
        <g id="kunta-front-logo" class="kunta-logo-badge" transform="translate(${coverW / 2 - 80}, ${coverH - 58})">
          <rect x="0" y="0" width="160" height="44" rx="8" fill="#0b192c" fill-opacity="0.85" stroke="#ffffff" stroke-width="1.5" stroke-opacity="0.5" />
          <image href="${KUNTA_LOGO_BASE64}" x="6" y="4" width="148" height="36" preserveAspectRatio="xMidYMid meet" />
        </g>
      ` : ''}
    </svg>
  `;
}

export interface AiPromptPackage {
  frontCoverGemini: string;
  frontCoverChatGpt: string;
  fullWrapGemini: string;
  fullWrapChatGpt: string;
  fullBookSummaryPrompt: string;
  midjourneyFrontCover: string;
  midjourneyFullWrap: string;
  ideogramPrompt: string;
  dallePrompt: string;
  chatGptDesignBrief: string;
  styleKeywords: string[];
  colorPaletteDescription: string;
}

export interface BookSummaryData {
  title: string;
  subtitle: string;
  author: string;
  ageGroup: string;
  theme: string;
  totalInteriorPages: number;
  activityCount: number;
  activityBreakdown: Record<string, number>;
  spineWidthInches: number;
  spineWidthMm: number;
  coverDimensionsInches: { width: number; height: number };
  coverDimensions300Dpi: { width: number; height: number };
  bleedInches: number;
  barcodeArea: string;
  backCoverBlurb: string;
  featureBullets: string[];
}

export function generateBookSummaryForAi(project: BookProject): { data: BookSummaryData; textSummary: string } {
  const actualInteriorPages = project.pages.length * (project.config.singleSided ? 2 : 1) + 6;
  const dims = calculateCoverDimensions(actualInteriorPages, 'white');

  const breakdown: Record<string, number> = {};
  for (const p of project.pages) {
    breakdown[p.type] = (breakdown[p.type] || 0) + 1;
  }

  const spineMm = Math.round(dims.spineWidthInches * 25.4 * 100) / 100;
  const width300Dpi = Math.round(dims.totalWidthInches * 300);
  const height300Dpi = Math.round(dims.totalHeightInches * 300);

  const data: BookSummaryData = {
    title: project.config.title,
    subtitle: project.config.subtitle,
    author: project.config.authorName,
    ageGroup: `Ages ${project.config.ageGroup}`,
    theme: project.config.theme,
    totalInteriorPages: actualInteriorPages,
    activityCount: project.pages.length,
    activityBreakdown: breakdown,
    spineWidthInches: dims.spineWidthInches,
    spineWidthMm: spineMm,
    coverDimensionsInches: {
      width: Math.round(dims.totalWidthInches * 1000) / 1000,
      height: Math.round(dims.totalHeightInches * 1000) / 1000,
    },
    coverDimensions300Dpi: {
      width: width300Dpi,
      height: height300Dpi,
    },
    bleedInches: 0.125,
    barcodeArea: '2.0" wide x 1.2" high (600 x 360 px at 300 DPI), located 0.8" from bottom and 0.8" from right edge of back cover.',
    backCoverBlurb: project.cover.backCoverBlurb,
    featureBullets: project.cover.features,
  };

  const textSummary = `
================================================================================
⚠️ CRITICAL WARNING FOR AI IMAGE GENERATION (Midjourney / DALL-E / Ideogram):
DO NOT paste these technical dimension specs directly into an image generator!
Image models will mistakenly paint dimension numbers (like "17.31", "5193 px",
"0.06"), measurement arrows, crop marks, and barcode boxes onto your artwork!
Instead, use the clean, borderless "AI Image Prompts" generated below.
================================================================================

1. BOOK IDENTITY:
• Title: ${data.title}
• Subtitle: ${data.subtitle}
• Target Audience: Children ${data.ageGroup}
• Main Theme: ${data.theme.toUpperCase()} (Friendly, fun, educational, non-scary)
• Publisher: Kunta Publications

2. INTERIOR CONTENTS BREAKDOWN:
• Total Physical Interior Pages: ${data.totalInteriorPages} pages (8.5" x 11" format)
• Total Unique Activities: ${data.activityCount} puzzles
${Object.entries(data.activityBreakdown).map(([k, v]) => `  - ${k.toUpperCase()}: ${v} pages`).join('\n')}
• Special Print Feature: Single-sided activity pages with anti-bleed backing pages
• Includes Full Answer Key & Completion Certificate

3. EXACT AMAZON KDP COVER SPECIFICATIONS (DIRECT AI ARTWORK & KDP SETUP):
• Trim Size: 8.5" x 11.0" (US Letter)
• Total Page Count: ${data.totalInteriorPages}
• Calculated Spine Width: ${data.spineWidthInches}" (${data.spineWidthMm} mm)
• Total Full-Wrap Canvas Size (Inches): ${data.coverDimensionsInches.width}" W x ${data.coverDimensionsInches.height}" H (includes 0.125" bleed)
• Total Full-Wrap Canvas Size (300 DPI Pixels): ${data.coverDimensions300Dpi.width} px W x ${data.coverDimensions300Dpi.height} px H
• Back Cover Barcode Safe Zone: Keep lower right 2.0" x 1.2" clear for Amazon's barcode.

4. OFFICIAL BOOK COVER COPYWRITING (DIRECT PUBLISHING READY):
• Front Cover Badges: "AGES ${project.config.ageGroup}", "BIG ACTIVITY BOOK", "Mazes • Word Searches • Dot-To-Dot • Coloring"
• Publisher Imprint: "Kunta Publications"
• Back Cover Blurb:
"${data.backCoverBlurb}"
• Back Cover Key Features:
${data.featureBullets.map((f) => `  ${f}`).join('\n')}

================================================================================
`.trim();

  return { data, textSummary };
}

export function generateAiCoverPrompts(project: BookProject): AiPromptPackage {
  const { title, subtitle, ageGroup, theme } = project.config;
  const author = project.config.authorName || 'Kunta Publications';
  const actualInteriorPages = project.pages.length * (project.config.singleSided ? 2 : 1) + 6;
  const dims = calculateCoverDimensions(actualInteriorPages, 'white');

  const themeKeywordsMap: Record<BookTheme, { motifs: string; colors: string; vibe: string }> = {
    space: {
      motifs: 'cute cartoon astronaut puppy in spacesuit, cheerful smiling rocket ship, colorful orbiting planets, twinkling golden stars, friendly cute alien, cosmic nebula',
      colors: 'deep midnight blue background, vibrant neon turquoise, glowing amber orange, bright golden yellow',
      vibe: 'exciting cosmic adventure, magical exploration, Disney Pixar 3D animated style, clean high-contrast composition',
    },
    dinosaurs: {
      motifs: 'cute smiling baby T-Rex wearing cap, friendly baby Triceratops, gentle green Brontosaurus, cartoon volcano erupting in distance, lush jungle ferns and palm leaves',
      colors: 'lush tropical emerald green, sunny golden yellow, warm amber orange, bright sky blue',
      vibe: 'prehistoric playful kingdom, whimsical prehistoric adventure, 3D Pixar character design, bright friendly atmosphere',
    },
    animals: {
      motifs: 'happy playful lion cub, cute puppy dog, cuddly baby panda, cheerful giraffe peek-a-boo, tropical flowers and butterflies',
      colors: 'sunny golden yellow, warm sky blue, cheerful grass green, vivid coral red',
      vibe: 'heartwarming friendly animals, lovable character art, 3D animated movie style, inviting children book illustration',
    },
    fantasy: {
      motifs: 'sparkling magical baby unicorn with rainbow mane, cute smiling fairy castle towers, floating stars, pastel rainbows and fluffy clouds',
      colors: 'dreamy violet purple, candy pink, soft turquoise cyan, glittering gold',
      vibe: 'magical fairytale enchantment, whimsical fantasy, clean 3D storybook lighting, joyful wonder',
    },
    underwater: {
      motifs: 'playful baby dolphin jumping, cheerful sea turtle, colorful clownfish, glowing sea anemones, floating bubbles and treasure chest',
      colors: 'deep ocean sapphire blue, tropical aqua cyan, bright coral orange, sunny yellow',
      vibe: 'vibrant undersea wonderland, cute aquatic friends, 3D animated cinematic lighting, clear friendly composition',
    },
    jungle: {
      motifs: 'cheerful baby monkey swinging on tropical vine, colorful toucan bird, friendly baby jaguar, giant monstera leaves and bananas',
      colors: 'lush rainforest emerald green, bright sunshine yellow, rich cocoa brown, tropical orchid purple',
      vibe: 'thrilling jungle expedition, cute wild creatures, vibrant 3D Pixar character art, joyful screen-free fun',
    },
  };

  const tk = themeKeywordsMap[theme] || themeKeywordsMap.animals;

  // 1. Google Gemini (Imagen 3) - Front Cover (Kindle eBook / KDP Front)
  const frontCoverGemini = `A professional, high-resolution children's activity book front cover illustration for "${title}", created for kids ages ${ageGroup} and published by "${author}".
The scene features ${tk.motifs}.
Art style: 3D Disney Pixar animated style, cheerful and friendly character expressions, smooth vector-like digital textures, volumetric cinematic lighting, and a vibrant color palette of ${tk.colors}.
Composition: Vertical portrait 8.5:11 aspect ratio (optimal for Kindle eBook cover and Amazon KDP front cover). The cute characters are centered in the middle and lower portion of the frame, leaving clean open space in the upper third for the book title.
Quality: Award-winning children's storybook cover art, 8k resolution, edge-to-edge full-bleed borderless artwork.
Negative constraints: NO white borders, NO frames, NO ruler markings, NO measurement numbers, NO barcode placeholder, NO watermark, NO crop marks.`.trim();

  // 2. ChatGPT (DALL-E 3) - Front Cover (Kindle eBook / KDP Front)
  const frontCoverChatGpt = `Create a high-resolution, full-bleed, borderless front cover illustration for a children's activity book titled "${title}" (Subtitle: "${subtitle}"), published by "${author}" for kids ages ${ageGroup}.

VISUAL SCENE & ARTISTIC STYLE:
- Art Style: 3D Disney-Pixar character animation style with soft rounded shapes, charming friendly faces, and clean volumetric lighting.
- Color Palette: High-contrast, rich ${tk.colors} designed to stand out on Amazon search results.
- Characters & Setting: ${tk.motifs} in an inviting ${theme} world.
- Format & Framing: Vertical portrait orientation (8.5:11 ratio). Center the joyful characters in the lower two-thirds, reserving a clean, uncluttered open sky at the top for title typography.

STRICT CONSTRAINTS:
- 100% borderless, full-bleed artwork extending edge-to-edge.
- Absolutely NO white borders, NO frame margins, NO measurement text, NO dimension numbers (do NOT write "8.5x11" or "300 DPI"), NO crop marks, NO barcodes.`.trim();

  // 3. Google Gemini (Imagen 3) - Paperback Full-Wrap Panoramic (Back + Spine + Front)
  const fullWrapGemini = `A wide seamless panoramic children's activity book full-wrap paperback cover spread (Back Cover + Spine + Front Cover) in 17:11 aspect ratio for "${title}" published by "${author}".
Synchronized art style: Exactly matching the front cover with 3D Disney Pixar animated style, volumetric lighting, and rich ${tk.colors}.
Spread Layout:
- RIGHT HALF (Front Cover): Hero scene featuring ${tk.motifs} with an open sky above for title placement.
- CENTER (Spine): Continuous smooth background gradient harmonizing the front and back.
- LEFT HALF (Back Cover): Matching continuous ${theme} scenic landscape with softer details, leaving clean open negative space for back cover text and barcode.
Quality: Continuous edge-to-edge full-bleed panoramic artwork.
Negative constraints: NO white borders, NO frames, NO rulers, NO dimension numbers, NO barcode placeholder boxes, NO crop marks.`.trim();

  // 4. ChatGPT (DALL-E 3) - Paperback Full-Wrap Panoramic (Back + Spine + Front)
  const fullWrapChatGpt = `Create a wide, panoramic, borderless full-wrap paperback cover illustration (Back Cover + Spine + Front Cover) for the children's activity book "${title}" published by "${author}".

SYNCHRONIZED ART STYLE (MATCHING FRONT COVER):
- Art Style: 3D Disney-Pixar character animation style with cute friendly characters, volumetric lighting, and rich ${tk.colors}.
- Panoramic 17:11 Composition:
  • RIGHT SIDE (Front Cover): Hero characters featuring ${tk.motifs} with clean open sky at the top for title "${title}".
  • CENTER (Spine): Seamless natural color transition connecting front and back.
  • LEFT SIDE (Back Cover): Matching scenic ${theme} landscape with softer background elements and ample clean open space for back cover story blurb and barcode.

STRICT CONSTRAINTS:
- Completely seamless, edge-to-edge continuous panoramic art.
- Do NOT draw measurement text, numbers, or dimensions (do NOT write "17.31", "11.25", "300 DPI", "0.06", or "inches").
- Do NOT draw rulers, guidelines, crop marks, or barcode placeholder boxes.`.trim();

  // 5. Full Book Summary Prompt for AI Assistants (ChatGPT / Gemini / Claude)
  const fullBookSummaryPrompt = `I am publishing an Amazon KDP children's activity book under the publisher imprint "${author}".
Here is my exact book specification:
- Title: "${title}"
- Subtitle: "${subtitle}"
- Target Age: Ages ${ageGroup}
- Theme: ${theme.toUpperCase()} (${tk.vibe})
- Format: 8.5" x 11" Trim Size, ${actualInteriorPages} total interior pages.
- Calculated Spine Width: ${dims.spineWidthInches} inches (${Math.round(dims.spineWidthInches * 25.4 * 10) / 10} mm).
- Full-Wrap Dimensions: ${Math.round(dims.totalWidthInches * 100) / 100}" x 11.25" with bleed (${Math.round(dims.totalWidthInches * 300)} x 3375 px at 300 DPI).
- Visual Motifs: ${tk.motifs}
- Color Palette: ${tk.colors}

Please generate:
1. Two synchronized AI prompts (one for the Kindle eBook Front Cover, and one for the Paperback Full-Wrap Spread) ensuring identical characters, art style, and color grading.
2. High-converting Amazon A+ Content & product description hooks for parents.
3. Engaging Back Cover blurb and 5 bullet points highlighting screen-free fun, single-sided printing, and problem-solving puzzles.`.trim();

  // Midjourney v6 Front Cover (Strictly Borderless, Zero Dimension Text)
  const midjourneyFrontCover = `/imagine prompt: Kids activity book front cover illustration for ages ${ageGroup}, featuring ${tk.motifs}. 3D Disney Pixar animated style, clean smooth textures, vibrant volumetric lighting, rich ${tk.colors}. Clean open sky at the top third of canvas for book title text. Joyful, welcoming, educational, borderless full-bleed edge-to-edge illustration, 8k resolution, award-winning children's book cover art --ar 8.5:11 --v 6.1 --stylize 250 --no borders, frames, margins, white border, rulers, dimensions, measurements, text, numbers, arrows, barcode, crop marks, guides, labels, speech bubbles, cut lines, outline border`;

  // Midjourney v6 Full-Wrap Panoramic Cover (Back + Spine + Front - Strictly Borderless)
  const midjourneyFullWrap = `/imagine prompt: Seamless panoramic children's book full-wrap cover background illustration, borderless edge-to-edge full bleed artwork. On the right half (front cover): ${tk.motifs} in vibrant scene with open sky above. On the left half (back cover): soft matching background landscape with gentle blurred foliage and clean open negative space. Style: Disney Pixar 3D animated lighting, vibrant ${tk.colors}, completely seamless panoramic art, continuous background scenery --ar 17:11 --v 6.1 --stylize 250 --no borders, frames, margins, white border, rulers, dimensions, measurements, text, numbers, arrows, barcode, crop marks, guides, labels, speech bubbles, cut lines, outline, diagrams, safe zone box`;

  // Ideogram 2.0 (With Clean Title & Publisher, Zero Technical Junk)
  const ideogramPrompt = `Children's activity book cover, edge-to-edge full-bleed illustration. Title reading "${title.toUpperCase()}" in large chunky 3D playful cartoon bubble typography at the top. Subtitle below reading "${subtitle}". Small clean text at bottom reading "${author}". Center illustration of ${tk.motifs}. Bright vibrant ${tk.colors}, 3D digital illustration, joyful kid-friendly commercial publishing quality, ages ${ageGroup} badge in corner. STRICT NEGATIVE INSTRUCTIONS: Completely borderless edge-to-edge art. NO white borders, NO frame outlines, NO crop marks, NO dimension text, NO ruler markings, NO measurement arrows, NO barcode placeholder box, NO speech bubbles, NO instructional labels.`;

  // DALL-E 3 / ChatGPT Prompt (With Explicit Negative Constraints)
  const dallePrompt = frontCoverChatGpt;

  // ChatGPT / Claude Comprehensive Design Brief
  const chatGptDesignBrief = fullBookSummaryPrompt;

  return {
    frontCoverGemini,
    frontCoverChatGpt,
    fullWrapGemini,
    fullWrapChatGpt,
    fullBookSummaryPrompt,
    midjourneyFrontCover,
    midjourneyFullWrap,
    ideogramPrompt,
    dallePrompt,
    chatGptDesignBrief,
    styleKeywords: ['3D Pixar Animated Style', 'Vibrant Volumetric Lighting', 'Cute Friendly Characters', 'High-Contrast Amazon CTR Palette', 'Clean Negative Space for Title'],
    colorPaletteDescription: tk.colors,
  };
}

