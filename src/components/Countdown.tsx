import React, { useState, useEffect } from 'react';
import styles from './Countdown.module.css';

interface CountdownProps {
  onCountdownEnd: () => void;
  onCountdownStart?: () => void;
  countFrom?: number;
}

const Countdown: React.FC<CountdownProps> = ({
  onCountdownEnd,
  onCountdownStart,
  countFrom = 3
}) => {
  const [count, setCount] = useState<number | string>(countFrom);
  const [isCounting, setIsCounting] = useState(true);

  useEffect(() => {
    if (onCountdownStart) {
      onCountdownStart();
    }

    if (!isCounting) return;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (typeof prev === 'number') {
          if (prev > 1) {
            return prev - 1;
          } else if (prev === 1) {
            return 'GO!';
          } else {
            clearInterval(timer);
            setIsCounting(false);
            onCountdownEnd();
            return '';
          }
        } else if (prev === 'GO!') {
          clearInterval(timer);
          setTimeout(() => {
            setIsCounting(false);
            onCountdownEnd();
          }, 500);
          return '';
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCounting, onCountdownEnd, onCountdownStart]);

  if (!isCounting) return null;

  return (
    <div className={`${styles.countdownOverlay} ${count === 'GO!' ? styles.goAnimation : ''}`}>
      <div className={`${styles.countdownNumber} ${count === 'GO!' ? styles.goText : ''}`}>
        {count}
      </div>
    </div>
  );
};

export default Countdown;
