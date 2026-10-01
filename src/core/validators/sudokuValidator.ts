/**
 * Kids Sudoku Mathematical Validator & Solver Engine
 * 
 * Provides real-time deterministic validation of Sudoku puzzle rules:
 * - Row uniqueness
 * - Column uniqueness
 * - Sub-box uniqueness (2x2 for 4x4, 3x2 for 6x6, 3x3 for 9x9)
 * - Conflict detection and visual aid
 * - Hint generation for kids without frustration
 * - Fallback SVG parsing
 */

export interface SudokuValidationResult {
  isComplete: boolean;
  isCorrect: boolean;
  conflicts: Set<string>; // set of "r,c" keys
  remainingEmpty: number;
  totalCells: number;
}

export interface SudokuHint {
  row: number;
  col: number;
  value: number;
}

/**
 * Returns the default sub-box dimensions for standard Sudoku sizes
 */
export function getBoxDimensions(size: number): { boxWidth: number; boxHeight: number } {
  if (size === 4) return { boxWidth: 2, boxHeight: 2 };
  if (size === 6) return { boxWidth: 3, boxHeight: 2 };
  if (size === 9) return { boxWidth: 3, boxHeight: 3 };
  // Default fallback
  const root = Math.floor(Math.sqrt(size));
  return { boxWidth: root, boxHeight: Math.ceil(size / root) };
}

/**
 * Validates whether placing a number at (row, col) violates any current row, col, or box constraints.
 */
export function validateSudokuCell(
  grid: (number | null)[][],
  row: number,
  col: number,
  val: number,
  size: number,
  boxWidth: number,
  boxHeight: number
): { isValid: boolean; conflictRow: boolean; conflictCol: boolean; conflictBox: boolean } {
  let conflictRow = false;
  let conflictCol = false;
  let conflictBox = false;

  // Check row
  for (let c = 0; c < size; c++) {
    if (c !== col && grid[row][c] === val) {
      conflictRow = true;
      break;
    }
  }

  // Check column
  for (let r = 0; r < size; r++) {
    if (r !== row && grid[r][col] === val) {
      conflictCol = true;
      break;
    }
  }

  // Check box
  const startRow = Math.floor(row / boxHeight) * boxHeight;
  const startCol = Math.floor(col / boxWidth) * boxWidth;

  for (let r = 0; r < boxHeight; r++) {
    for (let c = 0; c < boxWidth; c++) {
      const curR = startRow + r;
      const curC = startCol + c;
      if ((curR !== row || curC !== col) && grid[curR]?.[curC] === val) {
        conflictBox = true;
        break;
      }
    }
    if (conflictBox) break;
  }

  return {
    isValid: !conflictRow && !conflictCol && !conflictBox,
    conflictRow,
    conflictCol,
    conflictBox,
  };
}

/**
 * Scans the entire grid and returns a Set of "r,c" cell keys that are in conflict with another cell.
 */
export function getSudokuConflicts(
  grid: (number | null)[][],
  size: number,
  boxWidth: number,
  boxHeight: number
): Set<string> {
  const conflicts = new Set<string>();

  // Check rows
  for (let r = 0; r < size; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < size; c++) {
      const val = grid[r]?.[c];
      if (val !== null && val !== undefined) {
        const list = seen.get(val) || [];
        list.push(c);
        seen.set(val, list);
      }
    }
    for (const [, cols] of seen.entries()) {
      if (cols.length > 1) {
        for (const c of cols) {
          conflicts.add(`${r},${c}`);
        }
      }
    }
  }

  // Check columns
  for (let c = 0; c < size; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < size; r++) {
      const val = grid[r]?.[c];
      if (val !== null && val !== undefined) {
        const list = seen.get(val) || [];
        list.push(r);
        seen.set(val, list);
      }
    }
    for (const [, rows] of seen.entries()) {
      if (rows.length > 1) {
        for (const r of rows) {
          conflicts.add(`${r},${c}`);
        }
      }
    }
  }

  // Check boxes
  const boxRows = Math.floor(size / boxHeight);
  const boxCols = Math.floor(size / boxWidth);

  for (let br = 0; br < boxRows; br++) {
    for (let bc = 0; bc < boxCols; bc++) {
      const startR = br * boxHeight;
      const startC = bc * boxWidth;
      const seen = new Map<number, Array<{ r: number; c: number }>>();

      for (let r = 0; r < boxHeight; r++) {
        for (let c = 0; c < boxWidth; c++) {
          const curR = startR + r;
          const curC = startC + c;
          const val = grid[curR]?.[curC];
          if (val !== null && val !== undefined) {
            const list = seen.get(val) || [];
            list.push({ r: curR, c: curC });
            seen.set(val, list);
          }
        }
      }

      for (const [, cells] of seen.entries()) {
        if (cells.length > 1) {
          for (const cell of cells) {
            conflicts.add(`${cell.r},${cell.c}`);
          }
        }
      }
    }
  }

  return conflicts;
}

/**
 * Checks whether the puzzle is completely filled and mathematically valid.
 */
export function checkSudokuSolved(
  grid: (number | null)[][],
  solutionGrid?: number[][],
  size: number = grid.length,
  boxWidth?: number,
  boxHeight?: number
): SudokuValidationResult {
  const bw = boxWidth || getBoxDimensions(size).boxWidth;
  const bh = boxHeight || getBoxDimensions(size).boxHeight;
  const totalCells = size * size;
  let remainingEmpty = 0;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const val = grid[r]?.[c];
      if (val === null || val === undefined) {
        remainingEmpty++;
      }
    }
  }

  const conflicts = getSudokuConflicts(grid, size, bw, bh);
  const isComplete = remainingEmpty === 0;

  // If a solution grid is provided, verify match or mathematical validity
  let isCorrect = false;
  if (isComplete && conflicts.size === 0) {
    if (solutionGrid && solutionGrid.length === size) {
      isCorrect = true;
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (grid[r][c] !== solutionGrid[r][c]) {
            isCorrect = false;
            break;
          }
        }
        if (!isCorrect) break;
      }
    } else {
      isCorrect = true;
    }
  }

  return {
    isComplete,
    isCorrect,
    conflicts,
    remainingEmpty,
    totalCells,
  };
}

/**
 * Supplies the next logical hint for a child:
 * Finds an empty or incorrectly filled cell and returns the correct number.
 */
export function getSudokuHint(
  grid: (number | null)[][],
  solutionGrid: number[][]
): SudokuHint | null {
  const size = grid.length;
  if (!solutionGrid || solutionGrid.length !== size) return null;

  // First priority: fix an incorrect cell
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const current = grid[r][c];
      if (current !== null && current !== solutionGrid[r][c]) {
        return { row: r, col: c, value: solutionGrid[r][c] };
      }
    }
  }

  // Second priority: fill an empty cell
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) {
        return { row: r, col: c, value: solutionGrid[r][c] };
      }
    }
  }

  return null;
}

/**
 * Fallback parser to reconstruct Sudoku puzzle and solution grids from rendered SVG strings
 * if raw puzzleData was somehow omitted.
 */
export function parseSudokuFromSvg(
  svgContent: string,
  solutionSvgContent?: string
): {
  size: number;
  boxWidth: number;
  boxHeight: number;
  puzzleGrid: (number | null)[][];
  solutionGrid?: number[][];
} | null {
  if (!svgContent) return null;

  // Detect grid size from instruction or footer
  let size = 4;
  if (svgContent.includes('1 to 6') || svgContent.includes('6x6')) {
    size = 6;
  } else if (svgContent.includes('1 to 9') || svgContent.includes('9x9')) {
    size = 9;
  }

  const { boxWidth, boxHeight } = getBoxDimensions(size);
  const boardSize = 380;
  const cellSize = boardSize / size;
  const offsetX = (500 - boardSize) / 2;
  const offsetY = 50;

  const parseGridFromSvg = (svg: string): (number | null)[][] => {
    const grid: (number | null)[][] = Array.from({ length: size }, () =>
      Array(size).fill(null)
    );

    // Regex to match numbers placed in cells
    const textRegex = /<text\s+x="([^"]+)"\s+y="([^"]+)"[^>]*>\s*([1-9])\s*<\/text>/g;
    let match: RegExpExecArray | null;

    while ((match = textRegex.exec(svg)) !== null) {
      const x = parseFloat(match[1]);
      const y = parseFloat(match[2]);
      const val = parseInt(match[3], 10);

      // Map SVG center coordinate back to (row, col)
      const c = Math.floor((x - offsetX) / cellSize);
      const r = Math.floor((y - offsetY) / cellSize);

      if (r >= 0 && r < size && c >= 0 && c < size) {
        grid[r][c] = val;
      }
    }

    return grid;
  };

  const puzzleGrid = parseGridFromSvg(svgContent);
  let solutionGrid: number[][] | undefined = undefined;

  if (solutionSvgContent) {
    const parsedSolution = parseGridFromSvg(solutionSvgContent);
    const valid = parsedSolution.every((row) => row.every((val) => val !== null));
    if (valid) {
      solutionGrid = parsedSolution as number[][];
    }
  }

  return {
    size,
    boxWidth,
    boxHeight,
    puzzleGrid,
    solutionGrid,
  };
}
