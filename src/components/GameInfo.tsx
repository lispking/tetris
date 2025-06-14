import React from 'react';
import styles from './GameInfo.module.css';

interface GameInfoProps {
  score?: number;
  level?: number;
  lines?: number;
  scoreFlash?: boolean;
}

const GameInfo: React.FC<GameInfoProps> = ({ 
  score = 0, 
  level = 1, 
  lines = 0, 
  scoreFlash = false 
}) => {
  return (
    <div className={styles.gameInfo}>
      <div className={styles.infoRow}>
        <div className={`${styles.infoItem} ${scoreFlash ? styles.scoreFlash : ''}`}>
          <div className={styles.infoLabel}>Score</div>
          <div className={styles.infoValue}>
            {typeof score === 'number' ? score.toLocaleString() : '0'}
          </div>
        </div>
        
        <div className={styles.infoDivider} aria-hidden="true"></div>
        
        <div className={styles.infoItem}>
          <div className={styles.infoLabel}>Level</div>
          <div className={styles.infoValue}>{level ?? 1}</div>
        </div>
        
        <div className={styles.infoDivider} aria-hidden="true"></div>
        
        <div className={styles.infoItem}>
          <div className={styles.infoLabel}>Lines</div>
          <div className={styles.infoValue}>{lines ?? 0}</div>
        </div>
      </div>
    </div>
  );
};

export default GameInfo;
