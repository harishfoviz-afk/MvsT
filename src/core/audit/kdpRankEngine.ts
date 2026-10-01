import { BookProject } from '../../types/book';
import { generateKdpMarketing } from '../marketing/kdpMarketing';

export interface AuditItem {
  label: string;
  passed: boolean;
  detail: string;
}

export interface KdpAuditPillar {
  name: string;
  score: number; // 0 to 20
  maxScore: number;
  status: 'passed' | 'warning' | 'failed';
  summary: string;
  items: AuditItem[];
}

export interface KdpBookAuditResult {
  totalScore: number; // 0 to 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  badgeTitle: string;
  readinessVerdict: string;
  color: 'emerald' | 'blue' | 'amber' | 'rose';
  pillars: {
    uniqueness: KdpAuditPillar;
    kdpPrintCompliance: KdpAuditPillar;
    ageCalibration: KdpAuditPillar;
    gamificationValue: KdpAuditPillar;
    amazonSeoReadiness: KdpAuditPillar;
  };
  recommendations: string[];
}

/**
 * Audits a BookProject across 5 professional Amazon KDP publishing pillars
 * and produces a Bestseller Readiness Rank (0-100) with a letter grade.
 */
export function auditBookForAmazonKdp(project: BookProject): KdpBookAuditResult {
  const { config, pages, frontMatter, backMatter, cover } = project;
  const recommendations: string[] = [];

  // ==========================================
  // Pillar 1: Content Uniqueness & Anti-Duplication (20 pts)
  // ==========================================
  let uniquenessScore = 20;
  const uniquenessItems: AuditItem[] = [];

  // 1A. Check Dot-to-Dot Duplicates
  const dotPages = pages.filter((p) => p.type === 'dottodot');
  const dotNames = dotPages.map((p) => p.data?.name || '');
  const uniqueDotNames = new Set(dotNames);
  const dotDupes = dotNames.length - uniqueDotNames.size;
  if (dotDupes > 0) {
    uniquenessScore -= dotDupes * 5;
    uniquenessItems.push({
      label: 'Dot-to-Dot Silhouette Variety',
      passed: false,
      detail: `${dotDupes} duplicate dot-to-dot silhouette(s) detected.`,
    });
    recommendations.push('Regenerate repeated dot-to-dot silhouettes to ensure 100% unique activity content.');
  } else {
    uniquenessItems.push({
      label: 'Dot-to-Dot Silhouette Variety',
      passed: true,
      detail: `All ${dotPages.length} dot-to-dot pages feature unique silhouettes.`,
    });
  }

  // 1B. Check Coloring Scene Duplicates
  const coloringPages = pages.filter((p) => p.type === 'coloring');
  const coloringTitles = coloringPages.map((p) => p.data?.title || '');
  const uniqueColoringTitles = new Set(coloringTitles);
  const coloringDupes = coloringTitles.length - uniqueColoringTitles.size;
  if (coloringDupes > 0) {
    uniquenessScore -= coloringDupes * 5;
    uniquenessItems.push({
      label: 'Coloring Scene Variety',
      passed: false,
      detail: `${coloringDupes} duplicate coloring scene(s) detected.`,
    });
    recommendations.push('Regenerate coloring pages to avoid duplicate scene titles within the same book.');
  } else {
    uniquenessItems.push({
      label: 'Coloring Scene Variety',
      passed: true,
      detail: `All ${coloringPages.length} coloring pages feature unique illustrated scenes.`,
    });
  }

  // 1C. Check Activity Distribution Diversity
  const presentTypes = new Set(pages.map((p) => p.type));
  if (presentTypes.size >= 4) {
    uniquenessItems.push({
      label: 'Activity Type Variety',
      passed: true,
      detail: `Rich multi-activity mix (${presentTypes.size} different puzzle types: ${[...presentTypes].join(', ')}).`,
    });
  } else {
    uniquenessScore -= 4;
    uniquenessItems.push({
      label: 'Activity Type Variety',
      passed: false,
      detail: `Only ${presentTypes.size} puzzle types included. Adding more varieties increases buyer perceived value.`,
    });
    recommendations.push('Consider blending Mazes, Word Searches, Dot-to-Dot, and Sudoku for maximum variety.');
  }

  uniquenessScore = Math.max(0, Math.min(20, uniquenessScore));
  const uniquenessPillar: KdpAuditPillar = {
    name: 'Content Uniqueness & Variety',
    score: uniquenessScore,
    maxScore: 20,
    status: uniquenessScore >= 18 ? 'passed' : uniquenessScore >= 12 ? 'warning' : 'failed',
    summary: uniquenessScore >= 18 ? 'Zero duplicates. Excellent visual and thematic diversity.' : 'Some repeated or sparse content detected.',
    items: uniquenessItems,
  };

  // ==========================================
  // Pillar 2: Amazon KDP Print & Margin Specs (20 pts)
  // ==========================================
  let printScore = 20;
  const printItems: AuditItem[] = [];

  // 2A. Page Count >= 24 (Strict Amazon Paperback Minimum)
  if (config.pageCount >= 24) {
    printItems.push({
      label: 'Amazon Minimum Page Threshold',
      passed: true,
      detail: `${config.pageCount} pages satisfies Amazon KDP paperback minimum (24 pages).`,
    });
  } else {
    printScore -= 10;
    printItems.push({
      label: 'Amazon Minimum Page Threshold',
      passed: false,
      detail: `${config.pageCount} pages is below Amazon's strict 24-page minimum requirement!`,
    });
    recommendations.push('Increase total page count to at least 24 pages so Amazon KDP accepts the interior file.');
  }

  // 2B. Single-Sided Bleed Protection
  if (config.singleSided) {
    printItems.push({
      label: 'Marker Bleed-Through Prevention',
      passed: true,
      detail: 'Single-sided printing enabled with blank backing pages for 5-star customer reviews.',
    });
  } else {
    printScore -= 4;
    printItems.push({
      label: 'Marker Bleed-Through Prevention',
      passed: false,
      detail: 'Double-sided printing may cause marker bleed-through on kids coloring and puzzle pages.',
    });
    recommendations.push('Enable single-sided pages to prevent children markers from bleeding through.');
  }

  // 2C. Gutter & Margin Safety
  const allMarginsSafe = pages.every((p) => p.qc?.checks?.marginsSafe !== false);
  if (allMarginsSafe) {
    printItems.push({
      label: 'Gutter & Trim Safe Zones',
      passed: true,
      detail: 'All interior elements respect 0.375" outside and 0.5" binding gutter margins.',
    });
  } else {
    printScore -= 6;
    printItems.push({
      label: 'Gutter & Trim Safe Zones',
      passed: false,
      detail: 'Some pages risk encroaching into Amazon KDP binding gutter or trim margin.',
    });
    recommendations.push('Verify all puzzle margins stay within safe zones to avoid KDP Print Previewer rejection.');
  }

  printScore = Math.max(0, Math.min(20, printScore));
  const printPillar: KdpAuditPillar = {
    name: 'KDP Print & Gutter Compliance',
    score: printScore,
    maxScore: 20,
    status: printScore >= 18 ? 'passed' : printScore >= 12 ? 'warning' : 'failed',
    summary: printScore >= 18 ? '100% compliant with Amazon KDP print specs & safe margins.' : 'Review margins or page count before upload.',
    items: printItems,
  };

  // ==========================================
  // Pillar 3: Solvability & Age Calibration (20 pts)
  // ==========================================
  let solvabilityScore = 20;
  const solvabilityItems: AuditItem[] = [];

  // 3A. Solvability
  const allSolvable = pages.every((p) => p.qc?.checks?.solvable !== false);
  if (allSolvable) {
    solvabilityItems.push({
      label: 'Mathematical & BFS Solvability',
      passed: true,
      detail: 'All mazes, word searches, and sudokus have verified valid solutions.',
    });
  } else {
    solvabilityScore -= 10;
    solvabilityItems.push({
      label: 'Mathematical & BFS Solvability',
      passed: false,
      detail: 'One or more puzzles could not be mathematically solved.',
    });
    recommendations.push('Regenerate puzzles with failed solvability to prevent frustrated parent reviews.');
  }

  // 3B. Age Calibration
  const allAgeAppropriate = pages.every((p) => p.qc?.checks?.ageAppropriate !== false);
  if (allAgeAppropriate) {
    solvabilityItems.push({
      label: 'Age Calibration & Grid Density',
      passed: true,
      detail: `Puzzles precisely calibrated for Target Age ${config.ageGroup}.`,
    });
  } else {
    solvabilityScore -= 6;
    solvabilityItems.push({
      label: 'Age Calibration & Grid Density',
      passed: false,
      detail: `Grid density or word difficulty exceeds calibration for Ages ${config.ageGroup}.`,
    });
  }

  // 3C. Answer Key Verification
  if (backMatter.solutionsPage) {
    solvabilityItems.push({
      label: 'Complete Answer Key Included',
      passed: true,
      detail: 'Back matter includes full answer key with highlighted word searches and solved grids.',
    });
  } else {
    solvabilityScore -= 4;
    solvabilityItems.push({
      label: 'Complete Answer Key Included',
      passed: false,
      detail: 'Answer key is disabled. Books with complete solutions sell significantly better on Amazon.',
    });
    recommendations.push('Include the Answer Key in back matter so parents and kids can check answers.');
  }

  solvabilityScore = Math.max(0, Math.min(20, solvabilityScore));
  const solvabilityPillar: KdpAuditPillar = {
    name: 'Solvability & Age Calibration',
    score: solvabilityScore,
    maxScore: 20,
    status: solvabilityScore >= 18 ? 'passed' : solvabilityScore >= 12 ? 'warning' : 'failed',
    summary: solvabilityScore >= 18 ? '100% solvable, age-calibrated, with complete answer keys.' : 'Solvability or age calibration adjustments advised.',
    items: solvabilityItems,
  };

  // ==========================================
  // Pillar 4: Educational Value & Gamification (20 pts)
  // ==========================================
  let gamificationScore = 20;
  const gamificationItems: AuditItem[] = [];

  // 4A. Stamp Passport Page
  if (frontMatter.stampPassportPage) {
    gamificationItems.push({
      label: 'Interactive Adventure Stamp Passport',
      passed: true,
      detail: `Dynamic passport page included with ${pages.length} sequential tracking stamps.`,
    });
  } else {
    gamificationScore -= 5;
    gamificationItems.push({
      label: 'Interactive Adventure Stamp Passport',
      passed: false,
      detail: 'Stamp passport page is missing.',
    });
  }

  // 4B. Illustrated Picture Dictionary / Phonics
  if (backMatter.pictureDictionaryPage) {
    gamificationItems.push({
      label: 'Junior Explorer Picture Dictionary',
      passed: true,
      detail: 'Curated illustrated flashcards with definitions, syllables, and real rhyming families.',
    });
  } else {
    gamificationScore -= 5;
    gamificationItems.push({
      label: 'Junior Explorer Picture Dictionary',
      passed: false,
      detail: 'Picture dictionary page not enabled.',
    });
    recommendations.push('Add the Junior Explorer Picture Dictionary in back matter for high educational value.');
  }

  // 4C. Official Certificate of Achievement
  if (backMatter.congratulationsPage) {
    gamificationItems.push({
      label: 'Official Certificate of Achievement',
      passed: true,
      detail: 'Printable completion certificate rewards young explorers.',
    });
  } else {
    gamificationScore -= 5;
    gamificationItems.push({
      label: 'Official Certificate of Achievement',
      passed: false,
      detail: 'Certificate of achievement page omitted.',
    });
  }

  // 4D. Belongs To Personalization Page
  if (frontMatter.belongsToPage) {
    gamificationItems.push({
      label: 'Personalized "Belongs To" Front Page',
      passed: true,
      detail: 'Allows young readers to write their name inside their book.',
    });
  } else {
    gamificationScore -= 5;
    gamificationItems.push({
      label: 'Personalized "Belongs To" Front Page',
      passed: false,
      detail: '"This Book Belongs To" page omitted.',
    });
  }

  gamificationScore = Math.max(0, Math.min(20, gamificationScore));
  const gamificationPillar: KdpAuditPillar = {
    name: 'Gamification & Educational Depth',
    score: gamificationScore,
    maxScore: 20,
    status: gamificationScore >= 18 ? 'passed' : gamificationScore >= 12 ? 'warning' : 'failed',
    summary: gamificationScore >= 18 ? 'Full gamification suite: Passport, Certificate & Phonics Dictionary.' : 'Enable bonus gamification pages to maximize parent reviews.',
    items: gamificationItems,
  };

  // ==========================================
  // Pillar 5: Amazon A9 SEO & Commercial Readiness (20 pts)
  // ==========================================
  let seoScore = 20;
  const seoItems: AuditItem[] = [];

  const marketing = generateKdpMarketing(project);

  // 5A. 7 Backend Search Term Keyword Boxes
  const allKeywordBoxesValid = marketing.backendKeywords.length === 7 && marketing.backendKeywords.every((k) => k.length > 5 && k.length <= 50);
  if (allKeywordBoxesValid) {
    seoItems.push({
      label: '7 Amazon Backend Keyword Boxes',
      passed: true,
      detail: 'All 7 search term boxes filled with high-intent keywords within 50 char limits.',
    });
  } else {
    seoScore -= 6;
    seoItems.push({
      label: '7 Amazon Backend Keyword Boxes',
      passed: false,
      detail: 'Backend keyword boxes are incomplete or exceed Amazon character limits.',
    });
    recommendations.push('Generate all 7 Amazon backend keyword boxes in the Amazon SEO Suite.');
  }

  // 5B. HTML Book Description
  const hasHtmlDescription = marketing.htmlDescription.includes('<h2>') && marketing.htmlDescription.includes('<li>');
  if (hasHtmlDescription) {
    seoItems.push({
      label: 'Amazon-Compliant HTML Description',
      passed: true,
      detail: 'Formatted with headlines, bullet points, and high-converting sales copy.',
    });
  } else {
    seoScore -= 5;
    seoItems.push({
      label: 'Amazon-Compliant HTML Description',
      passed: false,
      detail: 'Description lacks formatted bullet lists or headline styling.',
    });
  }

  // 5C. Title & Subtitle Keyword Optimization
  const hasKeywordRichTitle = config.title.length >= 10 && config.subtitle.length >= 20;
  if (hasKeywordRichTitle) {
    seoItems.push({
      label: 'Keyword-Rich Title & Subtitle',
      passed: true,
      detail: 'Clear, compelling title with age bracket and puzzle variety in subtitle.',
    });
  } else {
    seoScore -= 5;
    seoItems.push({
      label: 'Keyword-Rich Title & Subtitle',
      passed: false,
      detail: 'Title or subtitle could be expanded with high-intent search terms.',
    });
  }

  // 5D. Publisher Imprint & Spine Formatting
  const hasImprint = !!cover.authorName && !!cover.spineText;
  if (hasImprint) {
    seoItems.push({
      label: 'Publisher Branding & Spine Text',
      passed: true,
      detail: `Branded under imprint "${cover.authorName}" with calibrated spine text.`,
    });
  } else {
    seoScore -= 4;
    seoItems.push({
      label: 'Publisher Branding & Spine Text',
      passed: false,
      detail: 'Missing author/imprint name or spine text.',
    });
  }

  seoScore = Math.max(0, Math.min(20, seoScore));
  const seoPillar: KdpAuditPillar = {
    name: 'Amazon SEO & Commercial Metadata',
    score: seoScore,
    maxScore: 20,
    status: seoScore >= 18 ? 'passed' : seoScore >= 12 ? 'warning' : 'failed',
    summary: seoScore >= 18 ? 'Optimized for Amazon A9 search ranking & high conversion.' : 'Optimize keyword boxes and sales description.',
    items: seoItems,
  };

  // Total Score (0 - 100)
  const totalScore = uniquenessScore + printScore + solvabilityScore + gamificationScore + seoScore;

  let grade: 'A+' | 'A' | 'B' | 'C' | 'F' = 'A+';
  let badgeTitle = '🏆 Amazon Bestseller Ready (Gold Standard)';
  let readinessVerdict = 'Ready for Instant Bestseller Publishing';
  let color: 'emerald' | 'blue' | 'amber' | 'rose' = 'emerald';

  if (totalScore >= 95) {
    grade = 'A+';
    badgeTitle = '🏆 Amazon Bestseller Ready (Gold Standard)';
    readinessVerdict = 'Ready for Instant Bestseller Publishing';
    color = 'emerald';
  } else if (totalScore >= 85) {
    grade = 'A';
    badgeTitle = '✨ Excellent Quality (KDP Approved)';
    readinessVerdict = 'High Quality - Safe to Publish';
    color = 'blue';
  } else if (totalScore >= 70) {
    grade = 'B';
    badgeTitle = '⚠️ Good - Minor Polish Recommended';
    readinessVerdict = 'Review Recommended Before Publishing';
    color = 'amber';
  } else if (totalScore >= 50) {
    grade = 'C';
    badgeTitle = '❗ Action Needed - Risk of 1-Star Reviews';
    readinessVerdict = 'Action Required - Low Review Risk';
    color = 'amber';
  } else {
    grade = 'F';
    badgeTitle = '⛔ High Rejection Risk on Amazon';
    readinessVerdict = 'Action Required - High KDP Rejection Risk';
    color = 'rose';
  }

  return {
    totalScore,
    grade,
    badgeTitle,
    readinessVerdict,
    color,
    pillars: {
      uniqueness: uniquenessPillar,
      kdpPrintCompliance: printPillar,
      ageCalibration: solvabilityPillar,
      gamificationValue: gamificationPillar,
      amazonSeoReadiness: seoPillar,
    },
    recommendations,
  };
}
