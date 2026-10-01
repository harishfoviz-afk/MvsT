import { AgeGroup, BookTheme } from '../../types/book';
import { createRNG } from './mazeGenerator';

export interface SudokuData {
  size: number; // 4, 6, or 9
  boxWidth: number;
  boxHeight: number;
  puzzleGrid: (number | null)[][];
  solutionGrid: number[][];
  theme: BookTheme;
  difficulty: 'easy' | 'medium' | 'hard';
  seed: number;
}

export function generateSudoku(ageGroup: AgeGroup, theme: BookTheme, seed: number = Date.now()): SudokuData {
  const rng = createRNG(seed);

  let size = 4;
  let boxWidth = 2;
  let boxHeight = 2;
  let cluesToKeep = 10; // Out of 16
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';

  if (ageGroup === '4-6') {
    size = 4;
    boxWidth = 2;
    boxHeight = 2;
    cluesToKeep = 9 + Math.floor(rng() * 2); // 9-10 clues out of 16 (super friendly!)
    difficulty = 'easy';
  } else if (ageGroup === '7-9') {
    size = 6;
    boxWidth = 3;
    boxHeight = 2;
    cluesToKeep = 20 + Math.floor(rng() * 4); // 20-23 clues out of 36
    difficulty = 'medium';
  } else {
    size = 9;
    boxWidth = 3;
    boxHeight = 3;
    cluesToKeep = 34 + Math.floor(rng() * 4); // 34-37 clues out of 81
    difficulty = 'hard';
  }

  // Generate full valid board
  const solution = generateValidBoard(size, boxWidth, boxHeight, rng);

  // Deep copy to create puzzle grid
  const puzzle: (number | null)[][] = solution.map((row) => [...row]);

  // Remove cells until target clues reached
  const totalCells = size * size;
  const cellsToRemove = totalCells - cluesToKeep;

  const positions: { r: number; c: number }[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      positions.push({ r, c });
    }
  }

  // Shuffle positions
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [positions[i], positions[j]] = [positions[j], positions[i]];
  }

  for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
    const { r, c } = positions[i];
    puzzle[r][c] = null;
  }

  return {
    size,
    boxWidth,
    boxHeight,
    puzzleGrid: puzzle,
    solutionGrid: solution,
    theme,
    difficulty,
    seed,
  };
}

function isValid(board: number[][], r: number, c: number, num: number, size: number, bw: number, bh: number): boolean {
  for (let i = 0; i < size; i++) {
    if (board[r][i] === num) return false;
    if (board[i][c] === num) return false;
  }

  const startRow = Math.floor(r / bh) * bh;
  const startCol = Math.floor(c / bw) * bw;

  for (let i = 0; i < bh; i++) {
    for (let j = 0; j < bw; j++) {
      if (board[startRow + i][startCol + j] === num) return false;
    }
  }

  return true;
}

function generateValidBoard(size: number, bw: number, bh: number, rng: () => number): number[][] {
  const board: number[][] = Array.from({ length: size }, () => Array(size).fill(0));

  function solve(r: number, c: number): boolean {
    if (r === size) return true;
    const nextR = c === size - 1 ? r + 1 : r;
    const nextC = c === size - 1 ? 0 : c + 1;

    // Numbers 1 to size shuffled
    const nums = Array.from({ length: size }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }

    for (const num of nums) {
      if (isValid(board, r, c, num, size, bw, bh)) {
        board[r][c] = num;
        if (solve(nextR, nextC)) return true;
        board[r][c] = 0;
      }
    }

    return false;
  }

  solve(0, 0);
  return board;
}

export function renderSudokuSVG(data: SudokuData, showSolution: boolean = false): string {
  const { size, boxWidth, boxHeight, puzzleGrid, solutionGrid } = data;

  const width = 500;
  const height = 540;
  const boardSize = 380;
  const cellSize = boardSize / size;
  const offsetX = (width - boardSize) / 2;
  const offsetY = 50;

  const gridToRender = showSolution ? solutionGrid : puzzleGrid;

  let cellsSVG = '';
  const fontSize = Math.min(28, Math.max(16, cellSize * 0.5));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const cx = offsetX + c * cellSize;
      const cy = offsetY + r * cellSize;
      const val = gridToRender[r][c];
      const isOriginal = puzzleGrid[r][c] !== null;

      // Cell border
      cellsSVG += `
        <rect x="${cx}" y="${cy}" width="${cellSize}" height="${cellSize}" 
              fill="${isOriginal && !showSolution ? '#f8fafc' : '#ffffff'}" stroke="#cbd5e1" stroke-width="1" />
      `;

      if (val !== null) {
        cellsSVG += `
          <text x="${cx + cellSize / 2}" y="${cy + cellSize / 2 + fontSize * 0.35}" 
                font-family="'Outfit', sans-serif" font-weight="${isOriginal ? '800' : '600'}" 
                font-size="${fontSize}" fill="${!isOriginal && showSolution ? '#3b82f6' : '#0f172a'}" text-anchor="middle">
            ${val}
          </text>
        `;
      }
    }
  }

  // Major Box Outlines
  let boxBorders = '';
  const boxRows = size / boxHeight;
  const boxCols = size / boxWidth;

  for (let br = 0; br <= boxRows; br++) {
    const y = offsetY + br * boxHeight * cellSize;
    boxBorders += `<line x1="${offsetX}" y1="${y}" x2="${offsetX + boardSize}" y2="${y}" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />`;
  }
  for (let bc = 0; bc <= boxCols; bc++) {
    const x = offsetX + bc * boxWidth * cellSize;
    boxBorders += `<line x1="${x}" y1="${offsetY}" x2="${x}" y2="${offsetY + boardSize}" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />`;
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-full">
      <rect width="${width}" height="${height}" fill="#ffffff" />
      
      <!-- Sudoku Instructions -->
      <text x="${width / 2}" y="${30}" font-family="'Outfit', sans-serif" font-weight="700" font-size="14" fill="#64748b" text-anchor="middle">
        ${size === 4 ? 'Fill each row, column, and 2x2 box with numbers 1 to 4!' : size === 6 ? 'Fill each row, column, and 2x3 box with numbers 1 to 6!' : 'Fill each row, column, and 3x3 box with numbers 1 to 9!'}
      </text>

      <!-- Cells -->
      ${cellsSVG}

      <!-- Thick Box Borders -->
      ${boxBorders}

      <!-- Footer Info -->
      <text x="${width / 2}" y="${height - 25}" font-family="'Outfit', sans-serif" font-weight="600" font-size="12" fill="#94a3b8" text-anchor="middle">
        ${showSolution ? 'Sudoku Solution' : `Grid: ${size}x${size} • Brain Teaser Puzzle`}
      </text>
    </svg>
  `;
}
