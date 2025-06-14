import React, { useState, useCallback, useEffect } from 'react';
import styles from './StartScreen.module.css';
import MultiplayerLobby from './MultiplayerLobby';

interface StartScreenProps {
  onStart: () => void;
  onMultiplayerStart: (roomId: string, isHost: boolean, playerName: string) => void;
  initialRoomId?: string;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart, onMultiplayerStart, initialRoomId = '' }) => {
  const [showMultiplayer, setShowMultiplayer] = useState(!!initialRoomId);
  const [username, setUsername] = useState('Player');
  
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
  
  // Load saved username if available
  useEffect(() => {
    const loadUsername = async () => {
      try {
        const savedName = localStorage.getItem('tetris-player-name');
        if (savedName) {
          setUsername(savedName);
        }
      } catch (error) {
        console.error('Error loading username:', error);
      }
    };
    
    loadUsername();
  }, []);

  const handleStartGame = useCallback((roomId: string, isHost: boolean) => {
    onMultiplayerStart(roomId, isHost, username);
  }, [onMultiplayerStart, username]);

  if (showMultiplayer) {
    return (
      <div className={styles.multiplayerContainer}>
        <MultiplayerLobby 
          onStartGame={handleStartGame}
          onBack={() => {
            // Reset multiplayer state when going back
            setShowMultiplayer(false);
          }} 
          initialRoomId={initialRoomId}
        />
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
