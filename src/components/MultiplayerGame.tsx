import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTetris } from '../hooks/useTetris';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useMyId, useStateTogetherWithPerUserValues } from 'react-together';
import { useAccount } from 'wagmi';
import Board from './Board';
import MultiplayerGameInfo from './MultiplayerGameInfo';
import GameOver from './GameOver';
import NextPiecePreview from './NextPiecePreview';
import Controls from './Controls';
import Countdown from './Countdown';
import GameTimer from './GameTimer';
import MultiplayerGameOver from './MultiplayerGameOver';
import { placePiece } from '../utils/gameUtils';
import { saveMultiplayerResults, type PlayerResult } from '../services/leaderboardService';
import styles from './MultiplayerGame.module.css';

interface PlayerStats {
  id: string;
  walletAddress: string;
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
  const [gameResultsSaved, setGameResultsSaved] = useState(false);
  const [savingResults, setSavingResults] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const navigate = useNavigate();
  
  const handleLeaveRoom = useCallback(() => {
    onLeave();
    navigate('/singleplayer');
  }, [navigate, onLeave]);

  const handleTimeUp = useCallback(() => {
    setGameOver(true);
  }, []);
  const { trackEvent, events } = useAnalytics();
  const { address: walletAddress } = useAccount();
  const gameStartedRef = useRef(false);
  const isPausedRef = useRef(true);
  const myId = useMyId();

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
    if (!gameStarted || !myId || !walletAddress) return;

    setPlayerStats(prev => ({
      ...prev,
      [myId]: {
        id: myId,
        walletAddress,
        name: playerName,
        score: score,
        level: level,
        lines: gameState.lines,
        isGameOver: isGameOver,
        isPaused: isPausedRef.current || isPaused
      }
    }));
  }, [myId, playerName, score, level, gameState.lines, gameStarted, isGameOver, isPaused, setPlayerStats, walletAddress]);

  // Track game start
  useEffect(() => {
    if (gameStarted) {
      trackEvent(events.GAME_START, {
        mode: 'multiplayer',
        roomId,
        myId,
        walletAddress,
        playerName,
        isHost,
        level: 1,
        duration: gameDuration
      });
    }
  }, [gameStarted, roomId, myId, walletAddress, playerName, isHost, trackEvent, events, gameDuration]);

  // Track game over and check if all players are done
  useEffect(() => {
    if (isGameOver && gameStarted) {
      trackEvent(events.GAME_OVER, {
        score,
        level,
        lines_cleared: linesCleared,
        mode: 'multiplayer',
        roomId,
        myId,
        walletAddress,
        playerName,
        isHost,
        duration: gameDuration
      });

      // Check if all players are game over
      const allOver = Object.values(playerStatsByUser).every(userData => {
        // Get the first user in the userData object
        const user = Object.values(userData)[0];
        return user?.isGameOver;
      });

      if (allOver && !allPlayersGameOver) {
        setAllPlayersGameOver(true);
        saveGameResults();
      }
    }
  }, [isGameOver, gameStarted, score, level, linesCleared, roomId, myId, walletAddress, playerName, isHost, trackEvent, events, playerStatsByUser, allPlayersGameOver]);
  
  // Save game results to the leaderboard
  const saveGameResults = useCallback(async () => {
    if (gameResultsSaved || savingResults || !allPlayersGameOver) return;
    
    try {
      setSavingResults(true);
      setSaveError(null);
      
      // Prepare player results with proper typing
      const playerResults: PlayerResult[] = [];
      
      Object.entries(playerStatsByUser).forEach(([userId, users]) => {
        const user = users[userId];
        if (!user) return;
        
        playerResults.push({
          id: userId,
          name: user.name || 'Anonymous',
          walletAddress: user.walletAddress,
          score: user.score || 0,
          level: user.level || 1,
          lines: user.lines || 0,
          isYou: userId === myId
        });
      });
      
      if (playerResults.length === 0) return;
      
      // Save to leaderboard
      const result = await saveMultiplayerResults(playerResults, roomId);
      
      if (result.success) {
        setGameResultsSaved(true);
        trackEvent(events.LEADERBOARD_UPDATE, {
          roomId,
          playerCount: playerResults.length,
          topScore: Math.max(...playerResults.map(p => p.score))
        });
      } else {
        setSaveError('Failed to save game results to leaderboard');
        trackEvent(events.LEADERBOARD_SAVE_ERROR, { roomId });
      }
    } catch (error) {
      console.error('Error saving game results:', error);
      setSaveError('An error occurred while saving results');
      trackEvent(events.LEADERBOARD_SAVE_ERROR, { 
        roomId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setSavingResults(false);
    }
  }, [allPlayersGameOver, gameResultsSaved, savingResults, playerStatsByUser, walletAddress, roomId, myId, trackEvent, events]);

  // Track score changes
  useEffect(() => {
    if (gameStarted && score > prevScore) {
      const scoreIncrease = score - prevScore;
      trackEvent(events.SCORE_UPDATE, {
        walletAddress,
        myId,
        roomId,
        playerName,
        score,
        score_increase: scoreIncrease,
        level,
        mode: 'multiplayer'
      });
      setPrevScore(score);
    }
  }, [score, prevScore, gameStarted, level, walletAddress, myId, roomId, playerName, trackEvent, events]);

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
    <>
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
      
      <div className={styles.gameTitleContainer}>
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

      <div className={`${styles.gameContainer} ${styles.multiplayer}`}>
        {/* Left Sidebar - Controls */}
        <div className={styles.controlsSidebar}>
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

        {/* Main Game Area */}
        <div className={styles.mainContent}>
          <div className={styles.gameContent}>
            <div className={`${styles.gameBoard} ${isGameOver ? styles.gameOverActive : ''}`}>
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
                  playerResults={Object.entries(playerStatsByUser).map(([userId, users]) => {
                    const user = users[userId];
                    if (!user) return null;
                    
                    return {
                      id: userId,
                      name: user.name || 'Anonymous',
                      walletAddress: user.walletAddress,
                      score: user.score || 0,
                      level: user.level || 1,
                      lines: user.lines || 0,
                      isYou: walletAddress ? userId === walletAddress : false
                    };
                  }).filter(Boolean) as PlayerResult[]}
                  roomId={roomId}
                  onBackToLobby={handleLeaveRoom}
                  saveError={saveError}
                  savingResults={savingResults}
                  onRetrySave={saveGameResults}
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
          </div>
        </div>

        {/* Right Sidebar - Player Stats */}
        <div className={styles.sidebar}>
          <div className={styles.statsHeader}>
            <div className={styles.roomIdContainer}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(roomId);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000);
                }}
                className={styles.roomIdButton}
                title="Copy Room ID"
              >
                {copySuccess ? '✓ Copied!' : '📋 Room ID'}: {roomId}
              </button>
            </div>
            <div className={styles.playerCount}>
              Players: {Object.keys(playerStatsByUser).length}
            </div>
          </div>
          <div className={styles.playerStatsHeader}>
            {Object.entries(playerStatsByUser)
              // Sort by score in descending order
              .sort(([, a], [, b]) => {
                const scoreA = a[Object.keys(a)[0]]?.score || 0;
                const scoreB = b[Object.keys(b)[0]]?.score || 0;
                return scoreB - scoreA;
              })
              // Take only top 3 players
              .slice(0, 3)
              .map(([userId, users], index) => {
                const isYou = walletAddress ? userId === walletAddress : false;
                const user = users[userId];
                if (!user) return null;

                return (
                  <div key={userId} className={`${styles.playerStatCard} ${isYou ? styles.yourCard : styles.opponentCard} ${user.isGameOver ? styles.gameOver : ''} ${user.isPaused ? styles.paused : ''} ${index === 0 ? styles.topPlayer : ''}`}>
                    <div className={styles.rankBadge}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </div>
                    <div className={`${styles.playerNameTag} ${isYou ? styles.yourNameTag : ''}`}>
                      {isYou ? `${user.name} (YOU)` : user.name}
                      {user.isGameOver && <span className={styles.statusBadge}>GAME OVER</span>}
                      {user.isPaused && !user.isGameOver && <span className={styles.statusBadge}>PAUSED</span>}
                    </div>
                    <MultiplayerGameInfo
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
          </div>
        </div>
      </div>
    </>
  );
};

export default MultiplayerGame;
