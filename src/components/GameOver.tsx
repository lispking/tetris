import React from 'react';
import styles from './GameOver.module.css';

interface GameOverProps {
  score: number;
  level?: number;
  lines?: number;
  onNewGame?: () => void;
  showNewGame?: boolean;
  isMultiplayer?: boolean;
}

const GameOver: React.FC<GameOverProps> = ({
  score,
  level,
  lines,
  onNewGame,
  showNewGame = true,
  isMultiplayer = false
}) => {
  return (
    <div className={`${styles.gameOver} ${isMultiplayer ? styles.multiplayerGameOver : ''}`}>
      <div className={styles.gameOverContent}>
        <h2>Game Over</h2>
        <div className={styles.stats}>
          <p data-label="Score">{typeof score === 'number' ? score.toLocaleString() : '0'}</p>
          <p data-label="Level">{level}</p>
          <p data-label="Lines">{lines}</p>
        </div>
        <div className={styles.buttonGroup}>
          {!isMultiplayer && showNewGame && (
            <button onClick={onNewGame} className={styles.restartButton}>
              New Game
            </button>
          )}
        </div>
      </div>
    </div>
  )
};

export default GameOver;
