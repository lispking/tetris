import React from 'react';
import styles from './GameOver.module.css';

interface GameOverProps {
  score: number;
  onNewGame: () => void;
  showNewGame?: boolean;
}

const GameOver: React.FC<GameOverProps> = ({ score, onNewGame, showNewGame = true }) => {
  return (
    <div className={styles.gameOver}>
      <div className={styles.gameOverContent}>
        <h2>Game Over</h2>
        <p>Your score: {score}</p>
        {showNewGame && <button onClick={onNewGame} className={styles.restartButton}>
          New Game
        </button>}
      </div>
    </div>
  );
};

export default GameOver;
