import React, { useState, useEffect } from 'react';
import styles from './StartScreen.module.css';
import MultiplayerLobby from './MultiplayerLobby';
import ProtectedRoute from './ProtectedRoute';

interface StartScreenProps {
  onStart: () => void;
  initialRoomId?: string;
  isMultiplayer?: boolean;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, initialRoomId = '', isMultiplayer = false }) => {
  const [showMultiplayer, setShowMultiplayer] = useState(!!initialRoomId || isMultiplayer);

  // Auto-connect to the room if initialRoomId is provided
  useEffect(() => {
    if (initialRoomId && !showMultiplayer) {
      // Use a small timeout to ensure the component is fully mounted
      const timer = setTimeout(() => {
        setShowMultiplayer(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [initialRoomId, showMultiplayer]);

  if (showMultiplayer || isMultiplayer) {
    return (
      <div className={styles.multiplayerContainer}>
        <ProtectedRoute>
          <MultiplayerLobby
            initialRoomId={initialRoomId}
            onBack={() => setShowMultiplayer(false)}
          />
        </ProtectedRoute>
      </div>
    );
  }

  return (
    <div className={styles.startScreen}>
      <div className={styles.startScreenContent}>
        <h1>Tetris</h1>
        <p>Classic Tetris game built with React</p>
        <div className={styles.buttonGroup}>
          <button onClick={onStart} className={styles.startButton}>
            Single Player
          </button>
          <button
            onClick={() => setShowMultiplayer(true)}
            className={`${styles.startButton} ${styles.multiplayerButton}`}
          >
            Multiplayer
          </button>
        </div>
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
