import React, { useState, useEffect, useCallback } from 'react';
import { useTetris } from '../hooks/useTetris';
import { useAnalytics } from '../contexts/AnalyticsContext';
import Board from './Board';
import GameInfo from './GameInfo';
import NextPiecePreview from './NextPiecePreview';
import Controls from './Controls';
import GameOver from './GameOver';
import StartScreen from './StartScreen';
import ConfirmationDialog from './ConfirmationDialog';
import { placePiece } from '../utils/gameUtils';
import styles from './Game.module.css';


interface GameProps {
  onGoHome?: () => void;
}

const Game: React.FC<GameProps> = ({ onGoHome }) => {
  // Game state
  const [clearedLines, setClearedLines] = useState<number[]>([]);
  const [scoreFlash, setScoreFlash] = useState(false);
  const [prevScore, setPrevScore] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Track previous level for level up detection
  const [prevLevel, setPrevLevel] = useState(0);

  const { trackEvent, events } = useAnalytics();

  const {
    gameState,
    gameStarted,
    isGameOver,
    level,
    linesCleared,
    score,
    togglePause,
    startGame: startTetrisGame,
    resetGame: resetTetrisGame,
    move,
    rotate,
  } = useTetris();

  // Start the game when the component mounts
  useEffect(() => {
    if (!gameStarted) {
      startTetrisGame();
    }
  }, [gameStarted, startTetrisGame]);

  // Track game over
  useEffect(() => {
    if (isGameOver && gameStarted) {
      trackEvent(events.GAME_OVER, {
        score,
        level,
        lines_cleared: linesCleared,
      });
    }
  }, [isGameOver, gameStarted, score, level, linesCleared, trackEvent, events]);

  // Track score changes
  useEffect(() => {
    if (gameStarted && score > prevScore) {
      const scoreIncrease = score - prevScore;
      trackEvent(events.SCORE_UPDATE, {
        score,
        score_increase: scoreIncrease,
        level,
      });
      setPrevScore(score);
    }
  }, [score, prevScore, gameStarted, level, trackEvent, events]);

  // Track level up
  useEffect(() => {
    if (level > prevLevel) {
      trackEvent(events.LEVEL_UP, {
        new_level: level,
        lines_cleared: linesCleared,
      });
      setPrevLevel(level);
    }
  }, [level, prevLevel, linesCleared, trackEvent, events]);

  // Track row clears
  useEffect(() => {
    if (clearedLines.length > 0) {
      trackEvent(events.ROW_CLEAR, {
        row_count: clearedLines.length,
        rows: clearedLines,
        level,
        score,
      });
    }
  }, [clearedLines, level, score, trackEvent, events]);

  // Handle game start - single player
  const handleStartGame = useCallback(() => {
    startTetrisGame();
    trackEvent(events.GAME_START, {
      level: gameState.level,
      mode: 'singleplayer',
      playerName: 'Player'
    });
  }, [startTetrisGame, trackEvent, events, gameState.level]);

  // Handle score animation when it changes
  useEffect(() => {
    if (gameStarted && gameState.score > prevScore) {
      // Only flash if the score increased (not on game start)
      const scoreIncrease = gameState.score - prevScore;

      // More pronounced flash for bigger score increases
      const flashDuration = Math.min(800, 300 + (scoreIncrease / 100) * 50);

      setScoreFlash(true);
      const timer = setTimeout(() => {
        setScoreFlash(false);
      }, flashDuration);

      setPrevScore(gameState.score);
      return () => clearTimeout(timer);
    }
  }, [gameState.score, prevScore, gameStarted]);

  // Create a board with the current piece in its position
  const renderBoard = React.useMemo(() => {
    if (!gameStarted || !gameState.currentPiece) {
      return gameState.board;
    }

    return placePiece(
      gameState.board,
      gameState.currentPiece,
      gameState.position
    );
  }, [gameState.board, gameState.currentPiece, gameState.position, gameStarted]);

  // Check for cleared lines and trigger animation
  useEffect(() => {
    if (gameState.linesCleared > 0) {
      // Find which lines were cleared by checking for complete rows
      const newClearedLines: number[] = [];

      // Check each row from bottom to top
      for (let y = 0; y < gameState.board.length; y++) {
        if (gameState.board[y].every(cell => cell.type)) {
          newClearedLines.push(y);
        }
      }

      if (newClearedLines.length > 0) {
        setClearedLines(newClearedLines);
        // Clear the animation after it completes
        const timer = setTimeout(() => setClearedLines([]), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.linesCleared, gameState.board]);



  // Handle new game after game over - using the analytics-enhanced handler
  const handleNewGameClick = useCallback(() => {
    setClearedLines([]);
    setScoreFlash(false);
    resetTetrisGame();
    trackEvent(events.NEW_GAME);
  }, [resetTetrisGame, trackEvent, events]);

  // const handleGoHomeClick = useCallback(() => {
  //   // Only show confirmation if the game is in progress and not already over
  //   if (gameStarted && !isGameOver) {
  //     // Pause the game first
  //     if (!gameState.isPaused) {
  //       togglePause();
  //     }
  //     setShowConfirmDialog(true);
  //   } else {
  //     // If game is over or not started, go home directly
  //     resetTetrisGame();
  //     onGoHome?.();
  //   }
  // }, [gameStarted, isGameOver, gameState.isPaused, togglePause, resetTetrisGame, onGoHome]);

  const handleConfirmGoHome = useCallback(() => {
    setShowConfirmDialog(false);
    resetTetrisGame();
    onGoHome?.();
  }, [resetTetrisGame, onGoHome]);

  const handleCancelGoHome = useCallback(() => {
    setShowConfirmDialog(false);
    // Resume the game if it was running before showing the dialog
    if (gameState.isPaused) {
      togglePause();
    }
  }, [gameState.isPaused, togglePause]);

  return (
    <div className={styles.gameContainer}>
      {!gameStarted ? (
        <StartScreen
          onStart={handleStartGame}
        />
      ) : (
        <>
          <ConfirmationDialog
            isOpen={showConfirmDialog}
            title="Leave Game"
            message={<span>Return to home? <br />Current progress will be lost.</span>}
            confirmText="Leave"
            cancelText="Cancel"
            onConfirm={handleConfirmGoHome}
            onCancel={handleCancelGoHome}
            confirmButtonVariant="danger"
          />
          {/* <div className={styles.gameHeader}>
            <h1 className={`${styles.titleWrapper} ${scoreFlash ? styles.scoreFlash : ''}`}>
              <span className={styles.tetrisIcon} aria-hidden="true">
                <span className={styles.tetrisBlock}></span>
                <span className={styles.tetrisBlock}></span>
                <span className={styles.tetrisBlock}></span>
                <span className={styles.tetrisBlock}></span>
              </span>
              <span className={styles.titleText}>
                <span className={styles.titleGlow}>TETRIS</span>
                <span className={styles.titleShadow} aria-hidden="true">TETRIS</span>
              </span>
              <button
                onClick={handleGoHomeClick}
                className={styles.homeButton}
                aria-label="Back to Home"
                title="Back to Home"
              >
                🏠
              </button>
            </h1>
          </div> */}
          <div className={styles.gameContent}>
            <div className={styles.gameSidebar}>
              <GameInfo
                score={score}
                level={level}
                lines={gameState.lines}
                scoreFlash={scoreFlash}
              />
              <NextPiecePreview piece={gameState.nextPiece} />
              <Controls
                onPause={togglePause}
                onNewGame={handleNewGameClick}
                isPaused={gameState.isPaused}
                onMoveLeft={() => move('left')}
                onMoveRight={() => move('right')}
                onRotate={rotate}
                onHardDrop={() => move('drop')}
                onSoftDrop={() => move('down')}
              />
            </div>

            <div className={styles.gameBoard}>
              <Board
                board={renderBoard}
                clearedLines={clearedLines}
              />
              {isGameOver && (
                <GameOver score={score} level={level} lines={gameState.lines} onNewGame={handleNewGameClick} />
              )}
              {gameState.isPaused && (
                <div className={styles.pausedOverlay}>
                  <div className={styles.pausedText}>
                    <span>PAUSED</span>
                    <div className={styles.pausedHint}>Press P to continue</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Game;
