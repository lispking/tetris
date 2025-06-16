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
  const [timeLeft, setTimeLeft] = useState(gameDuration);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize timer when gameDuration changes
  useEffect(() => {
    setTimeLeft(gameDuration);
  }, [gameDuration]);

  // Handle countdown timer
  useEffect(() => {
    console.log('Timer effect - gameStarted:', gameStarted, 'isGameOver:', isGameOver, 'timeLeft:', timeLeft);
    
    if (gameStarted && !isGameOver && timeLeft > 0) {
      console.log('Starting countdown timer with timeLeft:', timeLeft);
      
      // Clear any existing interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Start new interval
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            console.log('Time is up!');
            clearInterval(timerRef.current as NodeJS.Timeout);
            onTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      console.log('Cleaning up timer');
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameStarted, isGameOver, timeLeft, onTimeUp]);

  // Handle game over when time is up
  useEffect(() => {
    if (timeLeft === 0 && !isGameOver && !isPaused) {
      togglePause();
    }
  }, [timeLeft, isGameOver, isPaused, togglePause]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Add warning class when time is 30 seconds or less
  const isTimeRunningLow = timeLeft <= 30 && timeLeft > 0;

  return (
    <div className={styles.gameTimer}>
      <div className={`${styles.timeDisplay} ${isTimeRunningLow ? styles.timeWarning : ''}`}>
        {formatTime(timeLeft)}
      </div>
    </div>
  );
};

export default GameTimer;
