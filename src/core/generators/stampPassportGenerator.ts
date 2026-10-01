import { BookTheme } from '../../types/book';

export interface StampBadge {
  id: number;
  label: string;
  icon: string;
  color: string;
}

const BADGE_TEMPLATES: Array<{ label: string; icon: string; color: string }> = [
  { label: 'Maze Runner', icon: '🌀', color: '#3b82f6' },
  { label: 'Word Hunter', icon: '🔍', color: '#10b981' },
  { label: 'Dot Explorer', icon: '✏️', color: '#f59e0b' },
  { label: 'Color Artist', icon: '🎨', color: '#ec4899' },
  { label: 'Logic Star', icon: '🧠', color: '#8b5cf6' },
  { label: 'Cosmic Hero', icon: '🚀', color: '#06b6d4' },
  { label: 'Dino Tracker', icon: '🦖', color: '#14b8a6' },
  { label: 'Safari Scout', icon: '🦁', color: '#f97316' },
  { label: 'Super Spark', icon: '⚡', color: '#eab308' },
  { label: 'Deep Diver', icon: '🐬', color: '#0284c7' },
  { label: 'Castle Knight', icon: '🏰', color: '#6366f1' },
  { label: 'Bullseye Pro', icon: '🎯', color: '#ef4444' },
  { label: 'Master Mind', icon: '💎', color: '#a855f7' },
  { label: 'Star Voyager', icon: '⭐', color: '#eab308' },
  { label: 'Puzzle Ace', icon: '🧩', color: '#10b981' },
  { label: 'Crown Victor', icon: '👑', color: '#f59e0b' },
  { label: 'Secret Agent', icon: '🕵️', color: '#64748b' },
  { label: 'Magic Wonder', icon: '🪄', color: '#d946ef' },
  { label: 'Compass Guide', icon: '🧭', color: '#059669' },
  { label: 'Grand Champion', icon: '🏆', color: '#eab308' },
];

export function getStampBadges(totalCount: number): StampBadge[] {
  const badges: StampBadge[] = [];
  for (let i = 0; i < totalCount; i++) {
    const template = BADGE_TEMPLATES[i % BADGE_TEMPLATES.length];
    badges.push({
      id: i + 1,
      label: i === totalCount - 1 ? 'Grand Champ!' : template.label,
      icon: i === totalCount - 1 ? '🏆' : template.icon,
      color: template.color,
    });
  }
  return badges;
}

/**
 * Generates an SVG string for the dynamic Stamp Passport page
 */
export function renderStampPassportSVG(
  totalChallenges: number,
  completedIds: number[] = [],
  authorName: string = 'Kunta Publications',
  _theme: BookTheme = 'animals'
): string {
  const badges = getStampBadges(totalChallenges);
  const completedSet = new Set(completedIds);

  // Standard Amazon KDP 8.5" x 11" Page Dimensions & 0.5" Safe Margin (36 pt)
  const width = 612;
  const height = 792;
  const margin = 36; // 0.5" KDP safe interior margin

  // Compute grid columns and rows based on total challenges
  let cols = 4;
  if (totalChallenges <= 6) cols = 3;
  else if (totalChallenges <= 8) cols = 4;
  else if (totalChallenges <= 12) cols = 4;
  else if (totalChallenges <= 20) cols = 4;
  else if (totalChallenges <= 30) cols = 5;
  else cols = 6;

  const rows = Math.ceil(totalChallenges / cols);

  // Header ribbon banner dimensions
  const bannerWidth = 500;
  const bannerHeight = 74;
  const bannerX = (width - bannerWidth) / 2;
  const bannerY = margin + 14;

  const footerY = height - margin - 42;
  const startX = 52;
  const startY = 184;
  const gridWidth = width - startX * 2;
  const availableHeight = footerY - startY - 14;

  const cellW = gridWidth / cols;
  const cellH = Math.min(112, availableHeight / rows);
  const radius = Math.min(36, Math.min(cellW, cellH) * 0.38);

  const labelFontSize = Math.min(9, Math.max(7.5, cellH * 0.09));
  const subFontSize = Math.min(7.5, Math.max(6.5, cellH * 0.075));
  const titleFontSize = totalChallenges >= 100 ? 14 : totalChallenges >= 20 ? 15 : 15.5;

  let stampsSVG = '';

  badges.forEach((badge, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cx = startX + col * cellW + cellW / 2;
    const cy = startY + row * cellH + cellH / 2 - 4;
    const isCompleted = completedSet.has(badge.id);

    if (isCompleted) {
      // Completed, vibrant ink-stamped badge
      stampsSVG += `
        <g class="stamp-badge-completed" data-id="${badge.id}" style="cursor: pointer;">
          <!-- Drop Shadow / Glow Aura -->
          <circle cx="${cx}" cy="${cy}" r="${radius + 5}" fill="${badge.color}" opacity="0.25" />
          
          <!-- Outer border -->
          <circle cx="${cx}" cy="${cy}" r="${radius}" fill="#ffffff" stroke="${badge.color}" stroke-width="3.5" />
          
          <!-- Inner stamp dashed ring with background tint -->
          <circle cx="${cx}" cy="${cy}" r="${radius - 4}" fill="${badge.color}1c" stroke="${badge.color}" stroke-width="1.8" stroke-dasharray="4,2.5" />
          
          <!-- Full-color vibrant Icon -->
          <text x="${cx}" y="${cy - 4}" font-size="${radius * 0.72}" text-anchor="middle" dominant-baseline="middle">${badge.icon}</text>
          
          <!-- Official Verified Green Stamp Seal in Top-Right -->
          <g transform="translate(${cx + radius * 0.65}, ${cy - radius * 0.65})">
            <circle cx="0" cy="0" r="10.5" fill="#10b981" stroke="#ffffff" stroke-width="2" />
            <text x="0" y="3.5" font-family="sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle">✓</text>
          </g>

          <!-- Solved Pill -->
          <rect x="${cx - 22}" y="${cy + radius - 14}" width="44" height="15" rx="7.5" fill="#10b981" stroke="#ffffff" stroke-width="1.5" />
          <text x="${cx}" y="${cy + radius - 6.5}" font-family="sans-serif" font-size="8.5" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">#${badge.id} ✓</text>
          
          <!-- Label below -->
          <text x="${cx}" y="${cy + radius + 11}" font-family="sans-serif" font-size="${labelFontSize}" font-weight="800" fill="#0f172a" text-anchor="middle">${badge.label}</text>
          
          <!-- COMPLETED tag -->
          <text x="${cx}" y="${cy + radius + 20}" font-family="sans-serif" font-size="${subFontSize}" font-weight="900" fill="#10b981" letter-spacing="0.5" text-anchor="middle">★ COMPLETED ★</text>
        </g>
      `;
    } else {
      // Incomplete / Pending stamp
      stampsSVG += `
        <g class="stamp-badge-pending" data-id="${badge.id}" style="cursor: pointer;">
          <!-- Outer circle outline -->
          <circle cx="${cx}" cy="${cy}" r="${radius}" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
          <!-- Inner dashed stamp border -->
          <circle cx="${cx}" cy="${cy}" r="${radius - 5}" fill="none" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4,3" />
          <!-- Greyed icon -->
          <text x="${cx}" y="${cy - 4}" font-size="${radius * 0.65}" text-anchor="middle" dominant-baseline="middle" opacity="0.3">${badge.icon}</text>
          <!-- Badge # -->
          <rect x="${cx - 16}" y="${cy + radius - 14}" width="32" height="15" rx="7.5" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="1" />
          <text x="${cx}" y="${cy + radius - 6.5}" font-family="sans-serif" font-size="9" font-weight="bold" fill="#64748b" text-anchor="middle" dominant-baseline="middle">#${badge.id}</text>
          <!-- Label below -->
          <text x="${cx}" y="${cy + radius + 11}" font-family="sans-serif" font-size="${labelFontSize}" font-weight="500" fill="#94a3b8" text-anchor="middle">${badge.label}</text>
        </g>
      `;
    }
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
      <!-- Background -->
      <rect width="${width}" height="${height}" fill="#ffffff" />

      <!-- Ornate Outer Frame (Exact 0.5" / 36pt KDP Safe Margin) -->
      <rect x="${margin}" y="${margin}" width="${width - margin * 2}" height="${height - margin * 2}" rx="16" fill="none" stroke="#1e293b" stroke-width="2.5" />
      <rect x="${margin + 6}" y="${margin + 6}" width="${width - (margin + 6) * 2}" height="${height - (margin + 6) * 2}" rx="12" fill="none" stroke="#cbd5e1" stroke-width="1.5" />

      <!-- Top Header Ribbon Banner (Safely contained inside frame with 55px text clearance) -->
      <g transform="translate(0, 0)">
        <rect x="${bannerX}" y="${bannerY}" width="${bannerWidth}" height="${bannerHeight}" rx="14" fill="#0f172a" />
        <rect x="${bannerX + 4}" y="${bannerY + 4}" width="${bannerWidth - 8}" height="${bannerHeight - 8}" rx="10" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,3" />

        <text x="${width / 2}" y="${bannerY + 31}" font-family="system-ui, -apple-system, 'Fredoka', 'Comic Sans MS', sans-serif" font-size="${titleFontSize}" font-weight="900" fill="#fbbf24" text-anchor="middle" letter-spacing="0.5">
          ★ MY ${totalChallenges}-CHALLENGE ADVENTURE PASSPORT ★
        </text>
        <text x="${width / 2}" y="${bannerY + 54}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="600" fill="#f1f5f9" text-anchor="middle">
          Official Brain Quest Badge Tracker • ${authorName}
        </text>
      </g>

      <!-- Subtitle Instructions -->
      <text x="${width / 2}" y="148" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#475569" text-anchor="middle">
        Solve each puzzle, then color in or stamp your matching badge below! Complete all ${totalChallenges} to win!
      </text>

      <!-- Progress summary if in interactive mode -->
      ${
        completedIds.length === totalChallenges && totalChallenges > 0
          ? `
          <rect x="${width / 2 - 160}" y="158" width="320" height="22" rx="11" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" />
          <text x="${width / 2}" y="173" font-family="system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="900" fill="#b45309" text-anchor="middle">
            🎉 ALL ${totalChallenges} CHALLENGES COMPLETED! GRAND CHAMPION! 🏆
          </text>
        `
          : completedIds.length > 0
          ? `
          <rect x="${width / 2 - 145}" y="158" width="290" height="22" rx="11" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5" />
          <text x="${width / 2}" y="173" font-family="system-ui, -apple-system, sans-serif" font-size="10.5" font-weight="bold" fill="#047857" text-anchor="middle">
            🏆 ${completedIds.length} of ${totalChallenges} Challenges Solved (${Math.round((completedIds.length / totalChallenges) * 100)}%)
          </text>
        `
          : ''
      }

      <!-- Grid of Stamp Badges -->
      ${stampsSVG}

      <!-- Bottom Official Stamp Footer -->
      <g transform="translate(0, ${footerY})">
        <line x1="${margin + 20}" y1="0" x2="${width - margin - 20}" y2="0" stroke="#e2e8f0" stroke-width="1.5" />
        <text x="${width / 2}" y="18" font-family="system-ui, -apple-system, sans-serif" font-size="9.5" font-weight="bold" fill="#64748b" text-anchor="middle" letter-spacing="1.5">
          ★ OFFICIAL KUNTA PUBLICATIONS EXPLORER CERTIFICATION ★
        </text>
        <text x="${width / 2}" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="8.5" fill="#94a3b8" text-anchor="middle">
          Keep this passport safe! Present to parents or teachers upon completing all ${totalChallenges} challenges.
        </text>
      </g>
    </svg>
  `;
}
