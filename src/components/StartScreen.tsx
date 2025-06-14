import React, { useState, useCallback } from 'react';
import styles from './StartScreen.module.css';
import MultiplayerLobby from './MultiplayerLobby';

interface StartScreenProps {
  onStart: () => void;
  onMultiplayerStart: (roomId: string, username: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onMultiplayerStart }) => {
  const [showMultiplayer, setShowMultiplayer] = useState(false);

  const handleCreateRoom = useCallback((username: string) => {
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    onMultiplayerStart(newRoomId, username);
  }, [onMultiplayerStart]);

  const handleJoinRoom = useCallback((roomId: string, username: string) => {
    onMultiplayerStart(roomId, username);
  }, [onMultiplayerStart]);

  if (showMultiplayer) {
    return (
      <MultiplayerLobby 
        onCreateRoom={handleCreateRoom} 
        onJoinRoom={handleJoinRoom}
        onBack={() => setShowMultiplayer(false)} 
      />
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
