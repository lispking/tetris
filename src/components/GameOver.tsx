import React from 'react';
import styles from './GameOver.module.css';

interface GameOverProps {
  score: number;
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, onRestart }) => {
  return (
    <div className={styles.gameOver}>
      <div className={styles.gameOverContent}>
        <h2>Game Over</h2>
        <p>Your score: {score}</p>
        <button onClick={onRestart} className={styles.restartButton}>
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOver;
