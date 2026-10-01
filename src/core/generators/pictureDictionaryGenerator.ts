import { BookTheme } from '../../types/book';
import { getWordDefinition, WordDefinition } from '../data/wordDictionary';

export interface PictureDictionaryOptions {
  words: string[];
  theme: BookTheme;
  authorName?: string;
}

/**
 * Generates an SVG page for the back-matter "Explorer's Picture Dictionary & Glossary"
 * Designed for both Amazon KDP 300 DPI paperback printing and Kindle viewing.
 */
export function renderPictureDictionarySVG(options: PictureDictionaryOptions): string {
  const { words, theme, authorName = 'Kunta Publications' } = options;

  // Take unique words, up to 12 most prominent words per page
  const uniqueWords = Array.from(new Set(words.map((w) => w.toUpperCase()))).slice(0, 10);
  const definitions: WordDefinition[] = uniqueWords.map((w) => getWordDefinition(w, theme));

  // Standard Amazon KDP 8.5" x 11" Page Dimensions & 0.5" Safe Margin (36 pt)
  const width = 612;
  const height = 792;
  const margin = 36; // 0.5" KDP safe interior margin

  const bannerWidth = 500;
  const bannerHeight = 74;
  const bannerX = (width - bannerWidth) / 2;
  const bannerY = margin + 14;

  const startX = 52;
  const startY = 162;
  const cardWidth = (width - startX * 2 - 20) / 2; // 2 columns
  const cardHeight = 100;
  const rowGap = 12;

  let cardsSVG = '';

  definitions.forEach((def, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = startX + col * (cardWidth + 20);
    const y = startY + row * (cardHeight + rowGap);

    // Truncate definition slightly if very long to prevent card overflow
    const maxDefLen = 78;
    const shortDef = def.definition.length > maxDefLen
      ? def.definition.substring(0, maxDefLen - 3) + '...'
      : def.definition;

    cardsSVG += `
      <g class="dictionary-card" transform="translate(${x}, ${y})">
        <!-- Card Background -->
        <rect width="${cardWidth}" height="${cardHeight}" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5" />
        
        <!-- Left Icon Circle -->
        <circle cx="34" cy="${cardHeight / 2}" r="22" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
        <text x="34" y="${cardHeight / 2 + 7}" font-size="22" text-anchor="middle">${def.icon}</text>

        <!-- Word Title & Phonetic -->
        <text x="68" y="26" font-family="'Fredoka', 'Outfit', sans-serif" font-size="14" font-weight="900" fill="#0f172a">${def.word}</text>
        <text x="68" y="40" font-family="monospace" font-size="9.5" font-weight="600" fill="#6366f1">${def.phonetic}</text>

        <!-- Definition Text (wrapped in 2 lines) -->
        <text x="68" y="58" font-family="sans-serif" font-size="8.5" font-weight="500" fill="#334155" width="${cardWidth - 75}">
          ${escapeXML(shortDef)}
        </text>

        <!-- Fun Fact Pill -->
        <rect x="68" y="${cardHeight - 24}" width="${cardWidth - 78}" height="15" rx="4" fill="#fef3c7" />
        <text x="74" y="${cardHeight - 13}" font-family="sans-serif" font-size="7.5" font-weight="700" fill="#92400e">
          💡 ${escapeXML(def.funFact.length > 48 ? def.funFact.substring(0, 45) + '...' : def.funFact)}
        </text>
      </g>
    `;
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="#ffffff" />

      <!-- Ornate Outer Frame (Exact 0.5" / 36pt KDP Safe Margin) -->
      <rect x="${margin}" y="${margin}" width="${width - margin * 2}" height="${height - margin * 2}" rx="16" fill="none" stroke="#1e293b" stroke-width="2.5" />
      <rect x="${margin + 6}" y="${margin + 6}" width="${width - (margin + 6) * 2}" height="${height - (margin + 6) * 2}" rx="12" fill="none" stroke="#cbd5e1" stroke-width="1.5" />

      <!-- Header Ribbon Banner (Safely contained inside frame) -->
      <g transform="translate(0, 0)">
        <rect x="${bannerX}" y="${bannerY}" width="${bannerWidth}" height="${bannerHeight}" rx="14" fill="#0f172a" />
        <rect x="${bannerX + 4}" y="${bannerY + 4}" width="${bannerWidth - 8}" height="${bannerHeight - 8}" rx="10" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,3" />

        <text x="${width / 2}" y="${bannerY + 31}" font-family="system-ui, -apple-system, 'Fredoka', 'Comic Sans MS', sans-serif" font-size="16" font-weight="900" fill="#fbbf24" text-anchor="middle" letter-spacing="0.5">
          ★ EXPLORER'S PICTURE DICTIONARY ★
        </text>
        <text x="${width / 2}" y="${bannerY + 54}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#f1f5f9" text-anchor="middle">
          Official Vocabulary &amp; Learning Guide • ${escapeXML(authorName)}
        </text>
      </g>

      <!-- Subtitle Description -->
      <text x="${width / 2}" y="146" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#475569" text-anchor="middle">
        Learn the meanings, pronunciations, and fun explorer facts for the words in your puzzles!
      </text>

      <!-- Cards Grid -->
      ${cardsSVG}

      <!-- Bottom Footer -->
      <g transform="translate(0, ${height - margin - 36})">
        <line x1="${margin + 20}" y1="0" x2="${width - margin - 20}" y2="0" stroke="#e2e8f0" stroke-width="1.5" />
        <text x="${width / 2}" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">
          ★ Keep reading, exploring, and learning new words every single day! ★
        </text>
      </g>
    </svg>
  `;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
