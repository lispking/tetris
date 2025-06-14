import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, Position } from '../types/tetris';
import { BOARD_WIDTH, INITIAL_SPEED, LINES_PER_LEVEL, POINTS } from '../utils/constants';
import { createBoard, getRandomTetromino, canPlacePiece, placePiece, rotatePiece, clearLines } from '../utils/gameUtils';

const INITIAL_POSITION: Position = { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 };
const INITIAL_GAME_STATE: GameState = {
  board: createBoard(),
  currentPiece: null,
  nextPiece: null,
  position: { ...INITIAL_POSITION },
  score: 0,
  level: 1,
  lines: 0,
  linesCleared: 0,
  isGameOver: false,
  isPaused: false,
};

export const useTetris = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    ...INITIAL_GAME_STATE,
    currentPiece: getRandomTetromino(),
    nextPiece: getRandomTetromino(),
  }));
  const [dropTime, setDropTime] = useState<number | null>(INITIAL_SPEED);
  const [gameStarted, setGameStarted] = useState(false);
  
  // Reset the game to initial state
  const resetGame = useCallback(() => {
    const initialPiece = getRandomTetromino();
    const nextPiece = getRandomTetromino();
    
    setGameState({
      ...INITIAL_GAME_STATE,
      currentPiece: initialPiece,
      nextPiece: nextPiece,
    });
    setDropTime(INITIAL_SPEED);
    setGameStarted(false);
  }, []);

  // Start a new game
  const startGame = useCallback(() => {
    const initialPiece = getRandomTetromino();
    const nextPiece = getRandomTetromino();
    
    setGameState({
      ...INITIAL_GAME_STATE,
      currentPiece: initialPiece,
      nextPiece: nextPiece,
    });
    setDropTime(INITIAL_SPEED);
    setGameStarted(true);
  }, []);

  // Pause/Resume the game
  const togglePause = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }));
  }, []);

  // Move the current piece
  const move = useCallback((direction: 'left' | 'right' | 'down' | 'drop') => {
    if (gameState.isPaused || gameState.isGameOver) return;

    setGameState(prev => {
      const { position, currentPiece } = prev;
      if (!currentPiece) return prev;

      const newPosition = { ...position };
      
      switch (direction) {
        case 'left':
          newPosition.x--;
          break;
        case 'right':
          newPosition.x++;
          break;
        case 'down':
          newPosition.y++;
          break;
        case 'drop':
          // Hard drop - move piece to the bottom
          while (canPlacePiece(prev.board, currentPiece, newPosition)) {
            newPosition.y++;
          }
          newPosition.y--; // Move back one step
          break;
      }

      if (canPlacePiece(prev.board, currentPiece, newPosition)) {
        return {
          ...prev,
          position: newPosition,
          score: direction === 'drop' ? prev.score + POINTS.HARD_DROP : prev.score,
        };
      } else if (direction === 'down' || direction === 'drop') {
        // Piece can't move down anymore, lock it in place
        const newBoard = placePiece(prev.board, currentPiece, position);
        const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
        
        // Calculate score
        let score = prev.score;
        if (linesCleared > 0) {
          const linePoints = [0, POINTS.SINGLE, POINTS.DOUBLE, POINTS.TRIPLE, POINTS.TETRIS];
          score += linePoints[linesCleared] * prev.level;
        }
        
        // Check for level up
        const newLines = prev.lines + linesCleared;
        const newLevel = Math.floor(newLines / LINES_PER_LEVEL) + 1;
        
        // Get the next piece (should never be null here)
        if (!prev.nextPiece) {
          console.error('No next piece available');
          return prev;
        }
        
        const newCurrentPiece = prev.nextPiece;
        const newNextPiece = getRandomTetromino();
        
        // Check if game over
        const isGameOver = !canPlacePiece(
          clearedBoard,
          newCurrentPiece,
          INITIAL_POSITION
        );
        
        return {
          ...prev,
          board: clearedBoard,
          currentPiece: newCurrentPiece,
          nextPiece: newNextPiece,
          position: { ...INITIAL_POSITION },
          score,
          level: newLevel,
          lines: newLines,
          linesCleared, // Track the number of lines cleared in this move
          isGameOver,
        };
      }
      
      return prev;
    });
  }, [gameState.isPaused, gameState.isGameOver, gameState.board]);

  // Rotate the current piece with wall kicks
  const rotate = useCallback(() => {
    if (gameState.isPaused || gameState.isGameOver || !gameState.currentPiece) return;

    setGameState(prev => {
      const rotatedPiece = rotatePiece(prev.currentPiece!);
      
      // Try to rotate in place first
      if (canPlacePiece(prev.board, rotatedPiece, prev.position)) {
        return {
          ...prev,
          currentPiece: rotatedPiece,
        };
      }
      
      // If rotation fails, try wall kicks (1 and 2 units to the left/right)
      const kickOffsets = [
        { x: 1, y: 0 },  // 1 right
        { x: -1, y: 0 }, // 1 left
        { x: 2, y: 0 },  // 2 right
        { x: -2, y: 0 }, // 2 left
        { x: 1, y: -1 }, // 1 right, 1 up
        { x: -1, y: -1 },// 1 left, 1 up
      ];
      
      for (const offset of kickOffsets) {
        const newPosition = {
          x: prev.position.x + offset.x,
          y: prev.position.y + offset.y,
        };
        
        if (canPlacePiece(prev.board, rotatedPiece, newPosition)) {
          return {
            ...prev,
            currentPiece: rotatedPiece,
            position: newPosition,
          };
        }
      }
      
      // If all kicks fail, try moving down (useful for T-spins)
      const downPosition = {
        x: prev.position.x,
        y: prev.position.y + 1,
      };
      
      if (canPlacePiece(prev.board, rotatedPiece, downPosition)) {
        return {
          ...prev,
          currentPiece: rotatedPiece,
          position: downPosition,
        };
      }
      
      return prev; // Can't rotate
    });
  }, [gameState.isPaused, gameState.isGameOver]);

  // Track movement state
  const isMoving = useRef(false);
  const lastAutoDropTime = useRef<number>(0);

  // Handle keyboard controls with direct state updates
  useEffect(() => {
    if (!gameStarted) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle pause key regardless of game state
      if (e.key.toLowerCase() === 'p') {
        togglePause();
        e.preventDefault();
        return;
      }
      
      // Don't process other keys if game is over or paused
      if (gameState.isGameOver || gameState.isPaused) return;
      
      // Prevent default for all movement keys to avoid any browser defaults
      if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp', ' '].includes(e.key)) {
        e.preventDefault();
      }
      
      // Skip if already processing a move
      if (isMoving.current) return;
      
      isMoving.current = true;
      
      switch (e.key) {
        case 'ArrowLeft':
          setGameState(prev => {
            if (!prev.currentPiece) return prev;
            const newPos = { ...prev.position, x: prev.position.x - 1 };
            return canPlacePiece(prev.board, prev.currentPiece, newPos)
              ? { ...prev, position: newPos }
              : prev;
          });
          break;
          
        case 'ArrowRight':
          setGameState(prev => {
            if (!prev.currentPiece) return prev;
            const newPos = { ...prev.position, x: prev.position.x + 1 };
            return canPlacePiece(prev.board, prev.currentPiece, newPos)
              ? { ...prev, position: newPos }
              : prev;
          });
          break;
          
        case 'ArrowDown':
          setGameState(prev => {
            if (!prev.currentPiece) return prev;
            const newPos = { ...prev.position, y: prev.position.y + 1 };
            if (canPlacePiece(prev.board, prev.currentPiece, newPos)) {
              return { ...prev, position: newPos };
            }
            return prev;
          });
          break;
          
        case 'ArrowUp':
          rotate();
          break;
          
        case ' ':
          // Hard drop
          setGameState(prev => {
            if (!prev.currentPiece) return prev;
            let newY = prev.position.y;
            while (canPlacePiece(prev.board, prev.currentPiece!, { ...prev.position, y: newY + 1 })) {
              newY++;
            }
            return {
              ...prev,
              position: { ...prev.position, y: newY },
              score: prev.score + POINTS.HARD_DROP,
            };
          });
          break;
          
        // P key is now handled at the beginning of the handler
      }
      
      // Reset movement lock after a short delay
      setTimeout(() => {
        isMoving.current = false;
      }, 50);
    };
    
    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, gameState.isGameOver, gameState.isPaused, rotate, togglePause]);

  // Auto-drop the piece
  useEffect(() => {
    if (!gameStarted || gameState.isPaused || gameState.isGameOver) return;
    
    const speed = Math.max(INITIAL_SPEED - (gameState.level - 1) * 100, 100);
    setDropTime(speed);
    
    let animationFrameId: number;
    const dropPiece = (timestamp: number) => {
      if (!lastAutoDropTime.current || timestamp - lastAutoDropTime.current >= speed) {
        move('down');
        lastAutoDropTime.current = timestamp;
      }
      
      if (gameStarted && !gameState.isPaused && !gameState.isGameOver) {
        animationFrameId = requestAnimationFrame(dropPiece);
      }
    };
    
    animationFrameId = requestAnimationFrame(dropPiece);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gameStarted, gameState.isPaused, gameState.isGameOver, gameState.level, move]);
  
  // Handle pause state changes
  useEffect(() => {
    if (gameState.isPaused) {
      setDropTime(null);
    } else if (!gameState.isGameOver) {
      const speed = Math.max(INITIAL_SPEED - (gameState.level - 1) * 100, 100);
      setDropTime(speed);
    }
  }, [gameState.isPaused, gameState.isGameOver, gameState.level]);

  // Destructure commonly used properties for easier access
  const { level, linesCleared, score, isGameOver, isPaused } = gameState;

  return {
    gameState,
    dropTime,
    setDropTime, // Expose setDropTime
    gameStarted,
    startGame,
    togglePause,
    move,
    rotate,
    resetGame,
    // Expose these for analytics
    level,
    linesCleared,
    score,
    isGameOver,
    isPaused,
  };
};
