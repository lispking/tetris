import React from 'react';
import { useTetris } from '../hooks/useTetris';
import Board from './Board';
import GameInfo from './GameInfo';
import NextPiecePreview from './NextPiecePreview';
import Controls from './Controls';
import GameOver from './GameOver';
import StartScreen from './StartScreen';
import { placePiece } from '../utils/gameUtils';
import styles from './Game.module.css';

const Game: React.FC = () => {
  const {
    gameState,
    gameStarted,
    startGame,
  } = useTetris();

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

  // Handle game start
  const handleStart = () => {
    startGame();
  };

  // Handle game restart
  const handleRestart = () => {
    startGame();
  };

  return (
    <div className={styles.gameContainer}>
      {!gameStarted && <StartScreen onStart={handleStart} />}
      
      <div className={styles.gameHeader}>
        <h1>Tetris</h1>
        {gameStarted && gameState.isPaused && (
          <div className={styles.pausedOverlay}>
            <div className={styles.pausedText}>PAUSED</div>
          </div>
        )}
      </div>
      
      <div className={styles.gameContent}>
        <div className={styles.gameBoard}>
          <Board board={renderBoard} />
          {gameState.isGameOver && (
            <GameOver score={gameState.score} onRestart={handleRestart} />
          )}
        </div>
        
        <div className={styles.gameSidebar}>
          <GameInfo 
            score={gameState.score} 
            level={gameState.level} 
            lines={gameState.lines} 
          />
          <NextPiecePreview piece={gameState.nextPiece} />
          <Controls />
        </div>
      </div>
    </div>
  );
};

export default Game;
