import React from 'react';
import styles from './StartScreen.module.css';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className={styles.startScreen}>
      <div className={styles.startScreenContent}>
        <h1>Tetris</h1>
        <p>Classic Tetris game built with React</p>
        <button onClick={onStart} className={styles.startButton}>
          Start Game
        </button>
        <div className={styles.instructions}>
          <h3>How to Play</h3>
          <ul>
            <li>Use <strong>← →</strong> to move the piece</li>
            <li>Press <strong>↑</strong> to rotate</li>
            <li>Press <strong>↓</strong> to soft drop</li>
            <li>Press <strong>Space</strong> to hard drop</li>
            <li>Press <strong>P</strong> to pause/resume</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
