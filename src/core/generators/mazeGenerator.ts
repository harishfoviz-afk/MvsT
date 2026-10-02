import { AgeGroup, BookTheme } from '../../types/book';

export interface MazeCell {
  x: number;
  y: number;
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
  visited: boolean;
}

export interface MazeData {
  cols: number;
  rows: number;
  grid: MazeCell[][];
  start: { x: number; y: number };
  end: { x: number; y: number };
  solutionPath: { x: number; y: number }[];
  theme: BookTheme;
  difficulty: 'easy' | 'medium' | 'hard';
  seed: number;
}

// Simple seeded pseudo-random number generator (Mulberry32)
export function createRNG(seed: number) {
  let s = Math.floor(seed) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const THEME_ICONS: Record<BookTheme, { start: string; end: string; startLabel: string; endLabel: string }> = {
  animals: { start: '🐶', end: '🦴', startLabel: 'Puppy', endLabel: 'Treat' },
  space: { start: '🚀', end: '🪐', startLabel: 'Rocket', endLabel: 'Planet' },
  dinosaurs: { start: '🦖', end: '🌿', startLabel: 'T-Rex', endLabel: 'Leaves' },
  fantasy: { start: '🦄', end: '🏰', startLabel: 'Unicorn', endLabel: 'Castle' },
  underwater: { start: '🐠', end: '🪸', startLabel: 'Fish', endLabel: 'Coral' },
  jungle: { start: '🐒', end: '🍌', startLabel: 'Monkey', endLabel: 'Banana' },
};

export function generateMaze(ageGroup: AgeGroup, theme: BookTheme, seed: number = Date.now()): MazeData {
  const rng = createRNG(seed);

  let cols = 10;
  let rows = 10;
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';

  if (ageGroup === '4-6') {
    cols = 8 + Math.floor(rng() * 3); // 8-10
    rows = 8 + Math.floor(rng() * 3);
    difficulty = 'easy';
  } else if (ageGroup === '7-9') {
    cols = 15 + Math.floor(rng() * 5); // 15-19
    rows = 15 + Math.floor(rng() * 5);
    difficulty = 'medium';
  } else {
    cols = 24 + Math.floor(rng() * 7); // 24-30
    rows = 24 + Math.floor(rng() * 7);
    difficulty = 'hard';
  }

  // Initialize grid
  const grid: MazeCell[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: MazeCell[] = [];
    for (let x = 0; x < cols; x++) {
      row.push({
        x,
        y,
        top: true,
        right: true,
        bottom: true,
        left: true,
        visited: false,
      });
    }
    grid.push(row);
  }

  // Recursive backtracker algorithm
  const stack: MazeCell[] = [];
  const startCell = grid[0][0];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors: { cell: MazeCell; dir: 'top' | 'right' | 'bottom' | 'left' }[] = [];

    // Check 4 directions
    if (current.y > 0 && !grid[current.y - 1][current.x].visited) {
      neighbors.push({ cell: grid[current.y - 1][current.x], dir: 'top' });
    }
    if (current.x < cols - 1 && !grid[current.y][current.x + 1].visited) {
      neighbors.push({ cell: grid[current.y][current.x + 1], dir: 'right' });
    }
    if (current.y < rows - 1 && !grid[current.y + 1][current.x].visited) {
      neighbors.push({ cell: grid[current.y + 1][current.x], dir: 'bottom' });
    }
    if (current.x > 0 && !grid[current.y][current.x - 1].visited) {
      neighbors.push({ cell: grid[current.y][current.x - 1], dir: 'left' });
    }

    if (neighbors.length > 0) {
      // Pick random neighbor
      const nextIdx = Math.floor(rng() * neighbors.length);
      const { cell: nextCell, dir } = neighbors[nextIdx];

      // Remove walls
      if (dir === 'top') {
        current.top = false;
        nextCell.bottom = false;
      } else if (dir === 'right') {
        current.right = false;
        nextCell.left = false;
      } else if (dir === 'bottom') {
        current.bottom = false;
        nextCell.top = false;
      } else if (dir === 'left') {
        current.left = false;
        nextCell.right = false;
      }

      nextCell.visited = true;
      stack.push(nextCell);
    } else {
      stack.pop();
    }
  }

  // For 4-6 year olds: Braid the maze slightly (remove ~15% of dead ends) to make it easier & less frustrating
  if (ageGroup === '4-6') {
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        const cell = grid[y][x];
        const wallCount = (cell.top ? 1 : 0) + (cell.right ? 1 : 0) + (cell.bottom ? 1 : 0) + (cell.left ? 1 : 0);
        if (wallCount === 3 && rng() > 0.6) {
          // It's a dead end, knock down one wall
          if (cell.top && y > 0) {
            cell.top = false;
            grid[y - 1][x].bottom = false;
          } else if (cell.right && x < cols - 1) {
            cell.right = false;
            grid[y][x + 1].left = false;
          }
        }
      }
    }
  }

  // Open start and end borders
  grid[0][0].top = false;
  grid[rows - 1][cols - 1].bottom = false;

  const start = { x: 0, y: 0 };
  const end = { x: cols - 1, y: rows - 1 };

  // Solve maze using Breadth-First Search (BFS)
  const solutionPath = solveMazeBFS(grid, cols, rows, start, end);

  return {
    cols,
    rows,
    grid,
    start,
    end,
    solutionPath,
    theme,
    difficulty,
    seed,
  };
}

/**
 * Generates mobile-optimized digital paths for interactive touch screens.
 * Corridors are 35-60px wide so kids can clearly see turns and tap along the road!
 */
export function generateDigitalPath(
  ageGroup: AgeGroup,
  theme: BookTheme,
  seed: number = Date.now()
): MazeData {
  const rng = createRNG(seed);

  let cols = 8;
  let rows = 8;
  let difficulty: 'easy' | 'medium' | 'hard' = 'easy';

  if (ageGroup === '4-6') {
    cols = 6;
    rows = 6;
    difficulty = 'easy';
  } else if (ageGroup === '7-9') {
    cols = 8;
    rows = 8;
    difficulty = 'medium';
  } else {
    // Maan (10+): 10x10 gives rich winding paths with 35-40px wide corridors!
    cols = 10;
    rows = 10;
    difficulty = 'hard';
  }

  // Initialize grid
  const grid: MazeCell[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: MazeCell[] = [];
    for (let x = 0; x < cols; x++) {
      row.push({
        x,
        y,
        top: true,
        right: true,
        bottom: true,
        left: true,
        visited: false,
      });
    }
    grid.push(row);
  }

  // Recursive backtracker algorithm
  const stack: MazeCell[] = [];
  const startCell = grid[0][0];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors: { cell: MazeCell; dir: 'top' | 'right' | 'bottom' | 'left' }[] = [];

    if (current.y > 0 && !grid[current.y - 1][current.x].visited) {
      neighbors.push({ cell: grid[current.y - 1][current.x], dir: 'top' });
    }
    if (current.x < cols - 1 && !grid[current.y][current.x + 1].visited) {
      neighbors.push({ cell: grid[current.y][current.x + 1], dir: 'right' });
    }
    if (current.y < rows - 1 && !grid[current.y + 1][current.x].visited) {
      neighbors.push({ cell: grid[current.y + 1][current.x], dir: 'bottom' });
    }
    if (current.x > 0 && !grid[current.y][current.x - 1].visited) {
      neighbors.push({ cell: grid[current.y][current.x - 1], dir: 'left' });
    }

    if (neighbors.length > 0) {
      const nextIdx = Math.floor(rng() * neighbors.length);
      const { cell: nextCell, dir } = neighbors[nextIdx];

      if (dir === 'top') {
        current.top = false;
        nextCell.bottom = false;
      } else if (dir === 'right') {
        current.right = false;
        nextCell.left = false;
      } else if (dir === 'bottom') {
        current.bottom = false;
        nextCell.top = false;
      } else if (dir === 'left') {
        current.left = false;
        nextCell.right = false;
      }

      nextCell.visited = true;
      stack.push(nextCell);
    } else {
      stack.pop();
    }
  }

  // Braid slightly to open extra open passages for smooth, enjoyable driving
  for (let y = 1; y < rows - 1; y++) {
    for (let x = 1; x < cols - 1; x++) {
      const cell = grid[y][x];
      const wallCount = (cell.top ? 1 : 0) + (cell.right ? 1 : 0) + (cell.bottom ? 1 : 0) + (cell.left ? 1 : 0);
      if (wallCount >= 3 && rng() > 0.4) {
        if (cell.top && y > 0) {
          cell.top = false;
          grid[y - 1][x].bottom = false;
        } else if (cell.right && x < cols - 1) {
          cell.right = false;
          grid[y][x + 1].left = false;
        }
      }
    }
  }

  // Open start and end borders
  grid[0][0].top = false;
  grid[rows - 1][cols - 1].bottom = false;

  const start = { x: 0, y: 0 };
  const end = { x: cols - 1, y: rows - 1 };

  const solutionPath = solveMazeBFS(grid, cols, rows, start, end);

  return {
    cols,
    rows,
    grid,
    start,
    end,
    solutionPath,
    theme,
    difficulty,
    seed,
  };
}

export function solveMazeBFS(
  grid: MazeCell[][],
  cols: number,
  rows: number,
  start: { x: number; y: number },
  end: { x: number; y: number }
): { x: number; y: number }[] {
  const queue: { x: number; y: number }[] = [start];
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parent: Map<string, { x: number; y: number } | null> = new Map();

  const key = (x: number, y: number) => `${x},${y}`;
  visited[start.y][start.x] = true;
  parent.set(key(start.x, start.y), null);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    if (curr.x === end.x && curr.y === end.y) {
      break;
    }

    const cell = grid[curr.y][curr.x];

    // Check open passages
    const neighbors: { x: number; y: number }[] = [];
    if (!cell.top && curr.y > 0) neighbors.push({ x: curr.x, y: curr.y - 1 });
    if (!cell.right && curr.x < cols - 1) neighbors.push({ x: curr.x + 1, y: curr.y });
    if (!cell.bottom && curr.y < rows - 1) neighbors.push({ x: curr.x, y: curr.y + 1 });
    if (!cell.left && curr.x > 0) neighbors.push({ x: curr.x - 1, y: curr.y });

    for (const nb of neighbors) {
      if (!visited[nb.y][nb.x]) {
        visited[nb.y][nb.x] = true;
        parent.set(key(nb.x, nb.y), curr);
        queue.push(nb);
      }
    }
  }

  // Reconstruct path
  const path: { x: number; y: number }[] = [];
  let currKey: string | null = key(end.x, end.y);

  if (!parent.has(currKey)) {
    // Solvability check failed
    return [];
  }

  let step: { x: number; y: number } | null = end;
  while (step) {
    path.unshift(step);
    step = parent.get(key(step.x, step.y)) || null;
  }

  return path;
}

export function renderMazeSVG(data: MazeData, showSolution: boolean = false): string {
  const { cols, rows, grid, solutionPath, theme } = data;
  const icons = THEME_ICONS[theme] || THEME_ICONS.animals;

  const width = 500;
  const height = 500;
  const padding = 35;
  const mazeWidth = width - padding * 2;
  const mazeHeight = height - padding * 2;

  const cellSize = Math.min(mazeWidth / cols, mazeHeight / rows);
  const actualMazeW = cellSize * cols;
  const actualMazeH = cellSize * rows;
  const offsetX = (width - actualMazeW) / 2;
  const offsetY = (height - actualMazeH) / 2;

  const wallStroke = cols <= 12 ? 4 : cols <= 20 ? 2.5 : 1.8;

  let wallPaths = '';

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = grid[y][x];
      const cx = offsetX + x * cellSize;
      const cy = offsetY + y * cellSize;

      if (cell.top && !(x === 0 && y === 0)) {
        wallPaths += `<line x1="${cx}" y1="${cy}" x2="${cx + cellSize}" y2="${cy}" stroke="#1e293b" stroke-width="${wallStroke}" stroke-linecap="round" />`;
      }
      if (cell.left) {
        wallPaths += `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy + cellSize}" stroke="#1e293b" stroke-width="${wallStroke}" stroke-linecap="round" />`;
      }
      if (cell.right && x === cols - 1) {
        wallPaths += `<line x1="${cx + cellSize}" y1="${cy}" x2="${cx + cellSize}" y2="${cy + cellSize}" stroke="#1e293b" stroke-width="${wallStroke}" stroke-linecap="round" />`;
      }
      if (cell.bottom && !(x === cols - 1 && y === rows - 1)) {
        wallPaths += `<line x1="${cx}" y1="${cy + cellSize}" x2="${cx + cellSize}" y2="${cy + cellSize}" stroke="#1e293b" stroke-width="${wallStroke}" stroke-linecap="round" />`;
      }
    }
  }

  // Solution path rendering
  let solutionSVG = '';
  if (showSolution && solutionPath.length > 0) {
    const points = solutionPath
      .map((p) => `${offsetX + p.x * cellSize + cellSize / 2},${offsetY + p.y * cellSize + cellSize / 2}`)
      .join(' ');

    const solStroke = Math.max(3, cellSize * 0.35);
    solutionSVG = `
      <polyline points="${points}" fill="none" stroke="#ef4444" stroke-width="${solStroke}" stroke-linecap="round" stroke-linejoin="round" opacity="0.85" stroke-dasharray="2,1" />
    `;
  }

  // Icons at Start and End
  const startX = offsetX + cellSize / 2;
  const startY = offsetY - 12;
  const endX = offsetX + (cols - 1) * cellSize + cellSize / 2;
  const endY = offsetY + rows * cellSize + 22;

  const iconFontSize = Math.min(28, Math.max(18, cellSize * 0.9));

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" class="w-full h-full">
      <rect width="${width}" height="${height}" fill="#ffffff" />
      
      <!-- Start & End Markers -->
      <g text-anchor="middle" dominant-baseline="middle">
        <text x="${startX}" y="${startY}" font-size="${iconFontSize}">${icons.start}</text>
        <text x="${startX}" y="${startY - iconFontSize - 2}" font-size="10" font-family="sans-serif" font-weight="bold" fill="#3b82f6">START</text>
        
        <text x="${endX}" y="${endY}" font-size="${iconFontSize}">${icons.end}</text>
        <text x="${endX}" y="${endY + iconFontSize - 4}" font-size="10" font-family="sans-serif" font-weight="bold" fill="#10b981">FINISH</text>
      </g>

      <!-- Maze Walls -->
      <g>
        ${wallPaths}
      </g>

      <!-- Solution -->
      ${solutionSVG}
    </svg>
  `;
}
