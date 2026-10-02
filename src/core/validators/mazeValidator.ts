import { MazeCell, MazeData } from '../generators/mazeGenerator';

export interface MazeValidationResult {
  isStartedAtEntrance: boolean;
  isReachedExit: boolean;
  wallCollisions: number;
  isValidSolve: boolean;
  message: string;
}

export interface CanvasPoint {
  x: number;
  y: number;
}

/**
 * Maps a canvas point (in CSS pixels relative to the container)
 * to the corresponding Maze grid column and row.
 */
export function mapCanvasPointToMazeCell(
  point: CanvasPoint,
  containerWidth: number,
  containerHeight: number,
  cols: number,
  rows: number
): { col: number; row: number; insideMaze: boolean } {
  const svgSize = Math.min(containerWidth, containerHeight);
  const svgOffsetX = (containerWidth - svgSize) / 2;
  const svgOffsetY = (containerHeight - svgSize) / 2;

  // Convert to SVG 500x500 coordinates
  const svgX = ((point.x - svgOffsetX) / svgSize) * 500;
  const svgY = ((point.y - svgOffsetY) / svgSize) * 500;

  const padding = 35;
  const mazeWidth = 500 - padding * 2;
  const mazeHeight = 500 - padding * 2;

  const cellSize = Math.min(mazeWidth / cols, mazeHeight / rows);
  const actualMazeW = cellSize * cols;
  const actualMazeH = cellSize * rows;
  const offsetX = (500 - actualMazeW) / 2;
  const offsetY = (500 - actualMazeH) / 2;

  const col = Math.floor((svgX - offsetX) / cellSize);
  const row = Math.floor((svgY - offsetY) / cellSize);

  const insideMaze = col >= 0 && col < cols && row >= 0 && row < rows;

  return { col, row, insideMaze };
}

/**
 * Checks if a transition between two adjacent cells crosses a closed wall in the maze.
 * Returns true if a closed wall is crossed (collision).
 */
export function checkWallCollision(
  c1: { col: number; row: number },
  c2: { col: number; row: number },
  grid: MazeCell[][],
  cols: number,
  rows: number
): boolean {
  // If either cell is out of bounds, check if it's the entrance or exit
  const isEntrance1 = c1.col === 0 && c1.row === 0;
  const isEntrance2 = c2.col === 0 && c2.row === 0;
  const isExit1 = c1.col === cols - 1 && c1.row === rows - 1;
  const isExit2 = c2.col === cols - 1 && c2.row === rows - 1;

  // Moving into entrance from outside top/left is permitted
  if (
    (!inBounds(c1, cols, rows) && isEntrance2) ||
    (!inBounds(c2, cols, rows) && isEntrance1)
  ) {
    return false;
  }

  // Moving out from exit to outside bottom/right is permitted
  if (
    (!inBounds(c1, cols, rows) && isExit2) ||
    (!inBounds(c2, cols, rows) && isExit1)
  ) {
    return false;
  }

  // If outside bounds elsewhere, treat as boundary collision
  if (!inBounds(c1, cols, rows) || !inBounds(c2, cols, rows)) {
    return true;
  }

  const cell1 = grid[c1.row][c1.col];

  // Moving Right
  if (c2.col === c1.col + 1 && c2.row === c1.row) {
    return cell1.right;
  }

  // Moving Left
  if (c2.col === c1.col - 1 && c2.row === c1.row) {
    return cell1.left;
  }

  // Moving Down
  if (c2.row === c1.row + 1 && c2.col === c1.col) {
    return cell1.bottom;
  }

  // Moving Up
  if (c2.row === c1.row - 1 && c2.col === c1.col) {
    return cell1.top;
  }

  // Diagonal movement or skipping cells:
  // If diagonal (e.g. (+1, +1)), check if both intermediate pathways are blocked
  if (Math.abs(c2.col - c1.col) === 1 && Math.abs(c2.row - c1.row) === 1) {
    const horizontalFirstBlocked =
      cell1.right || grid[c1.row][c2.col]?.bottom !== false;
    const verticalFirstBlocked =
      cell1.bottom || grid[c2.row][c1.col]?.right !== false;
    return horizontalFirstBlocked && verticalFirstBlocked;
  }

  // If cells are farther apart, it indicates a jump across walls
  return true;
}

function inBounds(cell: { col: number; row: number }, cols: number, rows: number): boolean {
  return cell.col >= 0 && cell.col < cols && cell.row >= 0 && cell.row < rows;
}

/**
 * Validates a sequence of canvas points drawn by the user.
 * Sub-samples between points to detect fine-grained wall crossings.
 */
export function validateMazeStroke(
  points: CanvasPoint[],
  mazeData: MazeData,
  containerWidth: number,
  containerHeight: number
): MazeValidationResult {
  if (points.length < 2) {
    return {
      isStartedAtEntrance: false,
      isReachedExit: false,
      wallCollisions: 0,
      isValidSolve: false,
      message: 'Draw a path from start to finish.',
    };
  }

  const { cols, rows, grid } = mazeData;

  // Check start point
  const startCell = mapCanvasPointToMazeCell(
    points[0],
    containerWidth,
    containerHeight,
    cols,
    rows
  );
  // Entrance is around (0, 0)
  const isStartedAtEntrance =
    (startCell.col <= 1 && startCell.row <= 1) ||
    (points[0].x / containerWidth < 0.35 && points[0].y / containerHeight < 0.35);

  // Check end point
  const lastPoint = points[points.length - 1];
  const endCell = mapCanvasPointToMazeCell(
    lastPoint,
    containerWidth,
    containerHeight,
    cols,
    rows
  );
  // Exit is around (cols - 1, rows - 1)
  const isReachedExit =
    (endCell.col >= cols - 2 && endCell.row >= rows - 2) ||
    (lastPoint.x / containerWidth > 0.72 && lastPoint.y / containerHeight > 0.72);

  // Trace dense intermediate points to catch all cell transitions
  let wallCollisions = 0;
  let lastEvaluatedCell = startCell;

  for (let i = 1; i < points.length; i++) {
    const p1 = points[i - 1];
    const p2 = points[i];

    const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const steps = Math.max(1, Math.ceil(dist / 4)); // sample every ~4px

    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const sampleX = p1.x + (p2.x - p1.x) * t;
      const sampleY = p1.y + (p2.y - p1.y) * t;

      const currentCell = mapCanvasPointToMazeCell(
        { x: sampleX, y: sampleY },
        containerWidth,
        containerHeight,
        cols,
        rows
      );

      if (
        currentCell.col !== lastEvaluatedCell.col ||
        currentCell.row !== lastEvaluatedCell.row
      ) {
        if (checkWallCollision(lastEvaluatedCell, currentCell, grid, cols, rows)) {
          wallCollisions++;
        }
        lastEvaluatedCell = currentCell;
      }
    }
  }

  const isValidSolve = isStartedAtEntrance && isReachedExit && wallCollisions === 0;

  let message = 'Keep drawing through open pathways!';
  if (wallCollisions > 0) {
    message = `⚠️ Wall crossed ${wallCollisions} time${wallCollisions === 1 ? '' : 's'}! Follow the open corridors.`;
  } else if (isValidSolve) {
    message = '🎉 Fantastic! Clean path found with zero wall collisions!';
  } else if (isStartedAtEntrance && !isReachedExit) {
    message = '✏️ Good start! Guide your line down to the exit!';
  }

  return {
    isStartedAtEntrance,
    isReachedExit,
    wallCollisions,
    isValidSolve,
    message,
  };
}

/**
 * Finds the shortest open corridor path (list of cells) between two cells in a maze grid using BFS.
 * Respects walls so the avatar never walks through closed barriers.
 * Returns null if no open pathway connects the two cells.
 */
export function findMazePathBetweenCells(
  start: { col: number; row: number },
  target: { col: number; row: number },
  grid: MazeCell[][],
  cols: number,
  rows: number
): { col: number; row: number }[] | null {
  if (
    start.col < 0 || start.col >= cols || start.row < 0 || start.row >= rows ||
    target.col < 0 || target.col >= cols || target.row < 0 || target.row >= rows
  ) {
    return null;
  }
  if (start.col === target.col && start.row === target.row) {
    return [start];
  }

  const queue: { col: number; row: number }[] = [start];
  const visited: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const parentMap: Map<string, { col: number; row: number }> = new Map();

  visited[start.row][start.col] = true;
  const key = (c: { col: number; row: number }) => `${c.col},${c.row}`;

  let found = false;

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.col === target.col && current.row === target.row) {
      found = true;
      break;
    }

    const cell = grid[current.row][current.col];
    // Check 4 directions: top, right, bottom, left
    const moves: { next: { col: number; row: number }; wall: boolean }[] = [
      { next: { col: current.col, row: current.row - 1 }, wall: cell.top },
      { next: { col: current.col + 1, row: current.row }, wall: cell.right },
      { next: { col: current.col, row: current.row + 1 }, wall: cell.bottom },
      { next: { col: current.col - 1, row: current.row }, wall: cell.left },
    ];

    for (const { next, wall } of moves) {
      if (!wall && inBounds(next, cols, rows) && !visited[next.row][next.col]) {
        visited[next.row][next.col] = true;
        parentMap.set(key(next), current);
        queue.push(next);
      }
    }
  }

  if (!found) return null;

  const path: { col: number; row: number }[] = [];
  let curr: { col: number; row: number } | undefined = target;
  while (curr) {
    path.unshift(curr);
    if (curr.col === start.col && curr.row === start.row) break;
    curr = parentMap.get(key(curr));
  }
  return path;
}
