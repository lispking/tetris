import React from 'react';
import styles from './GameOver.module.css';

interface GameOverProps {
  score: number;
  onNewGame: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ score, onNewGame }) => {
  return (
    <div className={styles.gameOver}>
      <div className={styles.gameOverContent}>
        <h2>Game Over</h2>
        <p>Your score: {score}</p>
        <button onClick={onNewGame} className={styles.restartButton}>
          New Game
        </button>
      </div>
    </div>
  );
};

export default GameOver;
