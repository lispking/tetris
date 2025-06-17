import React, { useState, useEffect, useRef } from 'react';
import styles from './GameTimer.module.css';

interface GameTimerProps {
  gameDuration: number;
  gameStarted: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  togglePause: () => void;
  onTimeUp: () => void;
}

const GameTimer: React.FC<GameTimerProps> = ({
  gameDuration,
  gameStarted,
  isGameOver,
  isPaused,
  togglePause,
  onTimeUp,
}) => {
  const [displayTime, setDisplayTime] = useState(gameDuration);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timeLeftRef = useRef(gameDuration);
  const prevGameStartedRef = useRef(false);

  // Update time left ref when gameDuration changes
  useEffect(() => {
    timeLeftRef.current = gameDuration;
    setDisplayTime(gameDuration);
  }, [gameDuration]);

  // Handle countdown timer and game state
  useEffect(() => {
    if (!gameStarted || isGameOver) {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    // If game just started or was paused
    if (gameStarted && !prevGameStartedRef.current) {
      startTimeRef.current = Date.now();
    }
    prevGameStartedRef.current = gameStarted;

    const updateTimer = () => {
      if (!gameStarted || isGameOver) return;

      const now = Date.now();
      const elapsed = Math.floor((now - (startTimeRef.current || now)) / 1000);
      const newTimeLeft = Math.max(0, gameDuration - elapsed);
      
      if (newTimeLeft !== timeLeftRef.current) {
        timeLeftRef.current = newTimeLeft;
        setDisplayTime(newTimeLeft);

        if (newTimeLeft <= 0) {
          console.log('Time is up!');
          onTimeUp();
          if (!isPaused) {
            togglePause();
          }
          return;
        }
      }
      
      animationRef.current = requestAnimationFrame(updateTimer);
    };

    animationRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStarted, isGameOver, gameDuration, isPaused, onTimeUp, togglePause]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add warning class when time is 30 seconds or less
  const isTimeRunningLow = displayTime <= 30 && displayTime > 0;

  return (
    <div className={styles.gameTimer}>
      <div className={`${styles.timeDisplay} ${isTimeRunningLow ? styles.timeWarning : ''}`}>
        {formatTime(displayTime)}
      </div>
    </div>
  );
};

export default GameTimer;
