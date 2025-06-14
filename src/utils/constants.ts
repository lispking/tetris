// Board dimensions
export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

// Cell size in pixels
export const CELL_SIZE = 30;

// Game speed (lower is faster)
export const INITIAL_SPEED = 1000; // ms

// Points system
export const POINTS = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2,
};

// Number of lines needed to level up
export const LINES_PER_LEVEL = 10;

// Tetromino types and their properties
export const TETROMINO_PROPERTIES = {
  I: { 
    color: '#4FD2D2', 
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ] 
  },
  J: { 
    color: '#5E81F5', 
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ] 
  },
  L: { 
    color: '#FF9F43', 
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ] 
  },
  O: { 
    color: '#F7DC6F', 
    shape: [
      [1, 1],
      [1, 1],
    ] 
  },
  S: { 
    color: '#6DD230', 
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ] 
  },
  T: { 
    color: '#A55EEA', 
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ] 
  },
  Z: { 
    color: '#FF6B6B', 
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ] 
  },
};

// Tetromino shapes (legacy, will be removed)
export const SHAPES = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

// List of all tetromino types
export const TETROMINO_TYPES = Object.keys(SHAPES);
