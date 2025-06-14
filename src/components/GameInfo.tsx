import React from 'react';
import styles from './GameInfo.module.css';

interface GameInfoProps {
  score?: number;
  level?: number;
  lines?: number;
  scoreFlash?: boolean;
  compact?: boolean;
}

const GameInfo: React.FC<GameInfoProps> = ({ 
  score = 0, 
  level = 1, 
  lines = 0, 
  scoreFlash = false,
  compact = false
}) => {
  // Custom SVG icons for a cleaner look
  const ScoreIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"></path>
    </svg>
  );

  const LevelIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );

  const LinesIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );

  return (
    <div className={`${styles.gameInfo} ${compact ? styles.compact : ''}`}>
      <div className={styles.infoRow}>
        <div className={`${styles.infoItem} ${scoreFlash ? styles.scoreFlash : ''}`}>
          {!compact && <div className={styles.infoLabel}>Score</div>}
          <div className={`${styles.infoValue} ${compact ? styles.compactValue : ''}`}>
            {compact && <span className={styles.icon}><ScoreIcon /></span>}
            {typeof score === 'number' ? score.toLocaleString() : '0'}
          </div>
        </div>
        
        {!compact && <div className={styles.infoDivider} aria-hidden="true"></div>}
        
        <div className={styles.infoItem}>
          {!compact && <div className={styles.infoLabel}>Level</div>}
          <div className={`${styles.infoValue} ${compact ? styles.compactValue : ''}`}>
            {compact && <span className={styles.icon}><LevelIcon /></span>}
            {level ?? 1}
          </div>
        </div>
        
        {!compact && <div className={styles.infoDivider} aria-hidden="true"></div>}
        
        <div className={styles.infoItem}>
          {!compact && <div className={styles.infoLabel}>Lines</div>}
          <div className={`${styles.infoValue} ${compact ? styles.compactValue : ''}`}>
            {compact && <span className={styles.icon}><LinesIcon /></span>}
            {lines ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInfo;
