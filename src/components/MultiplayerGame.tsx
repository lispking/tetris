import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTetris } from '../hooks/useTetris';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useMyId, useStateTogetherWithPerUserValues } from 'react-together';
import Board from './Board';
import GameInfo from './GameInfo';
import GameOver from './GameOver';
import NextPiecePreview from './NextPiecePreview';
import Controls from './Controls';
import Countdown from './Countdown';
import GameTimer from './GameTimer';
import MultiplayerGameOver from './MultiplayerGameOver';
import { placePiece } from '../utils/gameUtils';
import styles from './Game.module.css';

interface PlayerStats {
  id: string;
  name: string;
  score: number;
  level: number;
  lines: number;
  isGameOver: boolean;
  isPaused: boolean;
}

interface MultiplayerGameProps {
  roomId: string;
  isHost: boolean;
  playerName: string;
  onLeave: () => void;
  gameDuration: number; // in seconds
}

const MultiplayerGame: React.FC<MultiplayerGameProps> = ({
  roomId,
  isHost,
  playerName,
  onLeave,
  gameDuration,
}) => {
  const [copySuccess, setCopySuccess] = React.useState(false);
  const [clearedLines, setClearedLines] = useState<number[]>([]);
  const [scoreFlash, setScoreFlash] = useState(false);
  const [prevScore, setPrevScore] = useState(0);
  const [showCountdown, setShowCountdown] = useState(true);
  const [allPlayersGameOver, setAllPlayersGameOver] = useState(false);

  const handleTimeUp = useCallback(() => {
    setGameOver(true);
  }, []);
  const { trackEvent, events } = useAnalytics();
  const myId = useMyId();
  const gameStartedRef = useRef(false);
  const isPausedRef = useRef(true);

  // Get the tetris game state
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
    setGameOver,
    move,
    rotate,
    isPaused
  } = useTetris();

  // Get and manage player stats in shared state with per-user values
  const [, setPlayerStats, playerStatsByUser] = useStateTogetherWithPerUserValues<Record<string, PlayerStats>>(
    'playerStats',
    {}
  );

  // Update player stats with shared state
  useEffect(() => {
    if (!gameStarted) return;
    if (!myId) return;

    setPlayerStats(prev => ({
      ...prev,
      [myId]: {
        id: myId,
        name: playerName,
        score: score,
        level: level,
        lines: gameState.lines,
        isGameOver: isGameOver,
        isPaused: isPausedRef.current || isPaused
      }
    }));
  }, [playerName, score, level, gameState.lines, gameStarted, isGameOver, isPaused, setPlayerStats, myId]);

  // Track game start
  useEffect(() => {
    if (gameStarted) {
      trackEvent(events.GAME_START, {
        mode: 'multiplayer',
        roomId,
        playerName,
        isHost,
        level: 1,
        duration: gameDuration
      });
    }
  }, [gameStarted, roomId, playerName, isHost, trackEvent, events, gameDuration]);

  // Track game over and check if all players are done
  useEffect(() => {
    if (isGameOver && gameStarted) {
      trackEvent(events.GAME_OVER, {
        score,
        level,
        lines_cleared: linesCleared,
        mode: 'multiplayer',
        roomId
      });

      // Check if all players are game over
      const allOver = Object.values(playerStatsByUser).every(user => {
        const stats = Object.values(user)[0];
        return stats?.isGameOver;
      });

      if (allOver) {
        setAllPlayersGameOver(true);
      }
    }
  }, [isGameOver, gameStarted, score, level, linesCleared, roomId, trackEvent, events, playerStatsByUser]);

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
    if (!gameStartedRef.current) {
      gameStartedRef.current = true;
      // Don't start the game immediately, wait for countdown
      isPausedRef.current = true;
    }
  }, []);

  const handleCountdownEnd = useCallback(() => {
    isPausedRef.current = false;
    if (!gameStarted) {
      startGame();
    } else if (isPaused) {
      togglePause();
    }
  }, [gameStarted, isPaused, startGame, togglePause]);

  const handleCountdownStart = useCallback(() => {
    isPausedRef.current = true;
  }, []);

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
    setAllPlayersGameOver(false);
    resetGame();
    trackEvent(events.NEW_GAME, { mode: 'multiplayer', roomId });
    startGame();
  }, [resetGame, startGame, trackEvent, events, roomId]);

  return (
    <div className={`${styles.gameContainer} ${styles.multiplayer}`}>
      {showCountdown && (
        <Countdown
          onCountdownStart={handleCountdownStart}
          onCountdownEnd={() => {
            setShowCountdown(false);
            handleCountdownEnd();
          }}
          countFrom={3}
        />
      )}

      {/* Player Stats Header */}
      <div className={styles.gameHeader}>
        <div className={styles.gameTitle}>
          <h1 className={`${styles.titleWrapper} ${scoreFlash ? styles.scoreFlash : ''}`}>
            <span className={styles.tetrisIcon} aria-hidden="true">
              <span className={styles.tetrisBlock}></span>
              <span className={styles.tetrisBlock}></span>
              <span className={styles.tetrisBlock}></span>
              <span className={styles.tetrisBlock}></span>
            </span>
            <span className={styles.titleText}>
              <span className={styles.titleGlow}>TETRIS BATTLE</span>
              <span className={styles.titleShadow} aria-hidden="true">TETRIS BATTLE</span>
            </span>
          </h1>
        </div>

        <div className={styles.playerStatsHeader}>
          {Object.entries(playerStatsByUser)
            .sort(([aId], [bId]) => {
              // Put current user first, then sort others by their ID
              if (aId === myId) return -1;
              if (bId === myId) return 1;
              return aId.localeCompare(bId);
            })
            .map(([userId, users]) => {
              const isYou = userId === myId;
              const user = users[userId];
              if (!user) {
                return null;
              }

              return (
                <div key={userId} className={`${styles.playerStatCard} ${isYou ? styles.yourCard : styles.opponentCard} ${user.isGameOver ? styles.gameOver : ''
                  } ${user.isPaused ? styles.paused : ''}`}>
                  <div className={`${styles.playerNameTag} ${isYou ? styles.yourNameTag : ''}`}>
                    {isYou ? `${user.name} (YOU)` : user.name}
                    {user.isGameOver && <span className={styles.statusBadge}>GAME OVER</span>}
                    {user.isPaused && !user.isGameOver && <span className={styles.statusBadge}>PAUSED</span>}
                  </div>
                  <GameInfo
                    score={user.score}
                    level={user.level}
                    lines={user.lines}
                    scoreFlash={isYou && score > prevScore}
                    compact={true}
                    timeLeft={
                      <GameTimer 
                        gameDuration={gameDuration}
                        gameStarted={gameStarted}
                        isGameOver={isGameOver}
                        isPaused={isPaused}
                        togglePause={togglePause}
                        onTimeUp={handleTimeUp}
                      />
                    }
                  />
                </div>
              );
            })}

          <div className={styles.gameControls}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(roomId);
                setCopySuccess(true);
                setTimeout(() => setCopySuccess(false), 2000);
              }}
              className={styles.headerButton}
              title="Copy Room ID"
            >
              {copySuccess ? '✓ Copied!' : '📋'}
            </button>
          </div>
        </div>
      </div>

      <div className={styles.gameContent}>
        <div className={`${styles.gameBoard} ${isGameOver ? styles.gameOverActive : ''}`}>
          {/* Game board content */}
          <Board
            board={renderBoard}
            clearedLines={clearedLines}
          />
          {isGameOver && (
            <GameOver 
              score={score}
              level={level}
              lines={gameState.lines}
              isMultiplayer={true}
            />
          )}
          {allPlayersGameOver && (
            <MultiplayerGameOver
              playerResults={Object.entries(playerStatsByUser).map(([id, users]) => ({
                id,
                name: users[id]?.name || 'Unknown',
                score: users[id]?.score || 0,
                isYou: id === myId,
              }))}
              onBackToLobby={onLeave}
            />
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
            showNewGame={false}
          />
        </div>
      </div>
    </div>
  );
};

export default MultiplayerGame;
