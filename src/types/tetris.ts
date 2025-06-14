// Define the shape of a single cell
export interface Cell {
  type: string | null;
  color: string;
}

// Define the shape of the game board
export type Board = Cell[][];

// Define the shape of a Tetromino
export interface Tetromino {
  shape: number[][];
  color: string;
}

// Define the position of the current piece
export interface Position {
  x: number;
  y: number;
}

// Define the game state
export interface GameState {
  board: Board;
  currentPiece: Tetromino | null;
  nextPiece: Tetromino | null;
  position: Position;
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  isPaused: boolean;
}
