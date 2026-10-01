import { ActivityPage, AgeGroup, QCResult } from '../../types/book';

export function runPageQualityCheck(
  page: Omit<ActivityPage, 'qc'>,
  ageGroup: AgeGroup,
  existingPages: Omit<ActivityPage, 'qc'>[] = []
): QCResult {
  const messages: string[] = [];
  let solvable = true;
  let hasDuplicates = false;
  let ageAppropriate = true;
  let marginsSafe = true;

  // 1. Solvability Verification
  if (page.type === 'maze') {
    const { solutionPath, cols, rows } = page.data;
    if (!solutionPath || solutionPath.length === 0) {
      solvable = false;
      messages.push('CRITICAL: Maze has no valid path from start to finish.');
    } else {
      const minSteps = Math.floor((cols + rows) * 0.8);
      if (solutionPath.length < minSteps) {
        messages.push(`Path too short (${solutionPath.length} steps). Maze may be too trivial.`);
      }
    }
  } else if (page.type === 'wordsearch') {
    const { words, placedWords } = page.data;
    if (placedWords.length < words.length) {
      solvable = false;
      messages.push(`Missing words: Only ${placedWords.length} of ${words.length} placed on the grid.`);
    }
    // Check for duplicate words in the same puzzle
    const uniqueWords = new Set(words);
    if (uniqueWords.size !== words.length) {
      hasDuplicates = true;
      messages.push('Duplicate words detected in the word search list.');
    }
  } else if (page.type === 'dottodot') {
    const { points } = page.data;
    if (!points || points.length < 10) {
      solvable = false;
      messages.push('Dot-to-dot has insufficient points (< 10).');
    }
  } else if (page.type === 'sudoku') {
    const { solutionGrid, puzzleGrid } = page.data;
    if (!solutionGrid || !puzzleGrid) {
      solvable = false;
      messages.push('Sudoku grid is incomplete or invalid.');
    }
  }

  // 2. Repetition & Duplicate Checking across book
  for (const other of existingPages) {
    if (other.id === page.id || other.pageNumber === page.pageNumber) continue;

    if (page.type === 'wordsearch' && other.type === 'wordsearch') {
      const setA = new Set(page.data.words);
      const setB = new Set(other.data.words);
      const intersection = [...setA].filter((w) => setB.has(w));
      if (intersection.length >= 3) {
        hasDuplicates = true;
        messages.push(`Significant word overlap (${intersection.length} shared words) with Page ${other.pageNumber}.`);
      }
    } else if (page.type === 'maze' && other.type === 'maze') {
      if (page.data.seed === other.data.seed) {
        hasDuplicates = true;
        messages.push(`Duplicate maze seed detected with Page ${other.pageNumber}.`);
      }
    } else if (page.type === 'dottodot' && other.type === 'dottodot') {
      if (page.data.name === other.data.name) {
        hasDuplicates = true;
        messages.push(`Duplicate dot-to-dot silhouette (${page.data.name}) already used on Page ${other.pageNumber}.`);
      }
    } else if (page.type === 'coloring' && other.type === 'coloring') {
      if (page.data.title === other.data.title) {
        hasDuplicates = true;
        messages.push(`Duplicate coloring scene (${page.data.title}) already used on Page ${other.pageNumber}.`);
      }
    } else if (page.type === 'sudoku' && other.type === 'sudoku') {
      if (page.data.seed === other.data.seed) {
        hasDuplicates = true;
        messages.push(`Duplicate sudoku puzzle seed detected with Page ${other.pageNumber}.`);
      }
    }
  }

  // 3. Age Appropriateness Verification
  if (ageGroup === '4-6') {
    if (page.type === 'wordsearch' && page.data.gridSize > 9) {
      ageAppropriate = false;
      messages.push('Grid size is too dense for ages 4-6 (max 8x8 recommended).');
    }
    if (page.type === 'maze' && page.data.cols > 12) {
      ageAppropriate = false;
      messages.push('Maze grid too complex for preschoolers (max 12x12).');
    }
  } else if (ageGroup === '10+') {
    if (page.type === 'maze' && page.data.cols < 20) {
      ageAppropriate = false;
      messages.push('Maze may be too simple for older kids (ages 10+).');
    }
  }

  // Calculate score (0-100)
  let score = 100;
  if (!solvable) score -= 50;
  if (hasDuplicates) score -= 25;
  if (!ageAppropriate) score -= 20;
  if (!marginsSafe) score -= 15;
  if (messages.length > 0 && score === 100) score = 90;

  const passed = solvable && !hasDuplicates && ageAppropriate && marginsSafe;

  if (passed && messages.length === 0) {
    messages.push('All QC checks passed: Solvable, unique, safe margins, and age-calibrated.');
  }

  return {
    passed,
    score: Math.max(0, score),
    checks: {
      solvable,
      hasDuplicates,
      ageAppropriate,
      marginsSafe,
    },
    messages,
  };
}
