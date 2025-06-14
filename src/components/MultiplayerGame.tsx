import React, { useState, useEffect, useCallback } from 'react';
import { useTetris } from '../hooks/useTetris';
import { useAnalytics } from '../contexts/AnalyticsContext';
import Board from './Board';
import GameInfo from './GameInfo';
import NextPiecePreview from './NextPiecePreview';
import Controls from './Controls';
import GameOver from './GameOver';
import { placePiece } from '../utils/gameUtils';
import styles from './Game.module.css';

interface MultiplayerGameProps {
  roomId: string;
  isHost: boolean;
  playerName: string;
  onLeave: () => void;
}

const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  roomId,
  isHost,
  playerName,
  onLeave
}) => {
  const [clearedLines, setClearedLines] = useState<number[]>([]);
  const [scoreFlash, setScoreFlash] = useState(false);
  const [prevScore, setPrevScore] = useState(0);
  const { trackEvent, events } = useAnalytics();

  const {
    gameState,
    gameStarted,
    isGameOver,
    level,
    linesCleared,
    score,
    togglePause,
    startGame,
    resetGame,
    move,
    rotate,
  } = useTetris();

  // Track game start
  useEffect(() => {
    if (gameStarted) {
      trackEvent(events.GAME_START, {
        mode: 'multiplayer',
        roomId,
        playerName,
        isHost,
        level: 1
      });
    }
  }, [gameStarted, roomId, playerName, isHost, trackEvent, events]);

  // Track game over
  useEffect(() => {
    if (isGameOver && gameStarted) {
      trackEvent(events.GAME_OVER, {
        score,
        level,
        lines_cleared: linesCleared,
        mode: 'multiplayer',
        roomId
      });
    }
  }, [isGameOver, gameStarted, score, level, linesCleared, roomId, trackEvent, events]);

  // Track score changes
  useEffect(() => {
    if (gameStarted && score > prevScore) {
      const scoreIncrease = score - prevScore;
      trackEvent(events.SCORE_UPDATE, {
        score,
        score_increase: scoreIncrease,
        level,
        mode: 'multiplayer'
      });
      setPrevScore(score);
    }
  }, [score, prevScore, gameStarted, level, trackEvent, events]);

  // Start the game when component mounts
  useEffect(() => {
    startGame();
  }, [startGame]);

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
      const newClearedLines: number[] = [];
      for (let y = 0; y < gameState.board.length; y++) {
        if (gameState.board[y].every(cell => cell.type)) {
          newClearedLines.push(y);
        }
      }
      
      if (newClearedLines.length > 0) {
        setClearedLines(newClearedLines);
        const timer = setTimeout(() => setClearedLines([]), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.linesCleared, gameState.board]);

  const handleNewGame = useCallback(() => {
    setClearedLines([]);
    setScoreFlash(false);
    resetGame();
    trackEvent(events.NEW_GAME, { mode: 'multiplayer', roomId });
    startGame();
  }, [resetGame, startGame, trackEvent, events, roomId]);

  return (
    <div className={styles.gameContainer}>
      <div className={styles.multiplayerInfo}>
        <div className={styles.multiplayerHeader}>
          <span className={styles.playerName}>Player: {playerName} </span>
          <span className={styles.roomId}>Room: {roomId}</span>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(roomId);
              // Show copied notification
            }}
            className={styles.copyButton}
            title="Copy Room ID"
          >
            📋
          </button>
          <button 
            onClick={onLeave}
            className={styles.leaveButton}
            title="Leave Game"
          >
            Leave
          </button>
        </div>
      </div>
      
      <div className={styles.gameHeader}>
        <h1 className={`${styles.titleWrapper} ${scoreFlash ? styles.scoreFlash : ''}`}>
          <span className={styles.tetrisIcon} aria-hidden="true">
            <span className={styles.tetrisBlock}></span>
            <span className={styles.tetrisBlock}></span>
            <span className={styles.tetrisBlock}></span>
            <span className={styles.tetrisBlock}></span>
          </span>
          <span className={styles.titleText}>
            <span className={styles.titleGlow}>TETRIS MULTIPLAYER</span>
            <span className={styles.titleShadow} aria-hidden="true">TETRIS MULTIPLAYER</span>
          </span>
        </h1>
      </div>

      <div className={styles.gameContent}>
        <div className={styles.gameBoard}>
          <Board 
            board={renderBoard} 
            clearedLines={clearedLines}
          />
          {isGameOver && (
            <GameOver score={score} onNewGame={handleNewGame} />
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
            onNewGame={handleNewGame}
            isPaused={gameState.isPaused}
            onMoveLeft={() => move('left')}
            onMoveRight={() => move('right')}
            onRotate={rotate}
            onHardDrop={() => move('drop')}
            onSoftDrop={() => move('down')}
          />
        </div>
      </div>
    </div>
  );
};

export default MultiplayerGame;
