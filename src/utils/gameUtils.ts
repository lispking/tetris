import type { Board, Position, Tetromino } from '../types/tetris';
import { BOARD_HEIGHT, BOARD_WIDTH, TETROMINO_PROPERTIES } from './constants';

// Create an empty board
export const createBoard = (): Board => {
  return Array(BOARD_HEIGHT).fill(null).map(() => 
    Array(BOARD_WIDTH).fill(null).map(() => ({
      type: null,
      color: 'transparent'
    }))
  );
};

// Get a random tetromino
export const getRandomTetromino = (): Tetromino => {
  const tetrominoTypes = Object.keys(TETROMINO_PROPERTIES) as Array<keyof typeof TETROMINO_PROPERTIES>;
  const type = tetrominoTypes[Math.floor(Math.random() * tetrominoTypes.length)];
  const { shape, color } = TETROMINO_PROPERTIES[type];
  return {
    shape: JSON.parse(JSON.stringify(shape)), // Deep copy
    color,
  };
};

// Check if the current piece can be placed at the given position
export const canPlacePiece = (
  board: Board,
  piece: Tetromino,
  position: Position
): boolean => {
  const { shape } = piece;
  
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const boardX = position.x + x;
        const boardY = position.y + y;
        
        // Check if out of bounds
        if (
          boardX < 0 || 
          boardX >= BOARD_WIDTH || 
          boardY >= BOARD_HEIGHT
        ) {
          return false;
        }
        
        // Check if collides with existing pieces
        if (boardY >= 0 && board[boardY][boardX].type !== null) {
          return false;
        }
      }
    }
  }
  
  return true;
};

// Place the current piece on the board
export const placePiece = (
  board: Board,
  piece: Tetromino,
  position: Position
): Board => {
  const newBoard = JSON.parse(JSON.stringify(board));
  const { shape, color } = piece;
  
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x] !== 0) {
        const boardX = position.x + x;
        const boardY = position.y + y;
        
        if (boardY >= 0) {
          newBoard[boardY][boardX] = { type: 'piece', color };
        }
      }
    }
  }
  
  return newBoard;
};

// Rotate a piece 90 degrees clockwise
export const rotatePiece = (piece: Tetromino): Tetromino => {
  const { shape } = piece;
  const N = shape.length;
  const newShape = Array(N).fill(0).map(() => Array(N).fill(0));
  
  // Standard rotation for all pieces
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      newShape[x][N - 1 - y] = shape[y][x];
    }
  }
  
  // For the 'O' piece, no rotation is needed
  if (piece.color === '#F0F000') { // Yellow color for 'O' piece
    return { ...piece };
  }
  
  // For all other pieces, return the rotated shape
  return { ...piece, shape: newShape };
};

// Clear completed lines and return new board and number of lines cleared
export const clearLines = (board: Board): { newBoard: Board; linesCleared: number } => {
  const newBoard = createBoard();
  let linesCleared = 0;
  let newRow = BOARD_HEIGHT - 1;
  
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    const row = board[y];
    const isRowComplete = row.every(cell => cell.type !== null);
    
    if (!isRowComplete) {
      newBoard[newRow] = [...row];
      newRow--;
    } else {
      linesCleared++;
    }
  }
  
  return { newBoard, linesCleared };
};
