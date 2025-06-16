import React from 'react';
import styles from './MultiplayerGameInfo.module.css';

interface MultiplayerGameInfoProps {
  score?: number;
  level?: number;
  lines?: number;
  scoreFlash?: boolean;
  compact?: boolean;
  timeLeft?: React.ReactNode;
  isPaused?: boolean;
  className?: string;
}

const MultiplayerGameInfo: React.FC<MultiplayerGameInfoProps> = (props) => {
  const {
    score = 0, 
    level = 1, 
    lines = 0, 
    scoreFlash = false,
    compact = false,
    timeLeft = '1:00',
    isPaused = false,
    className = ''
  } = props;

  // Custom SVG icon components with TypeScript props
  interface IconProps {
    style?: React.CSSProperties;
    className?: string;
  }

  const ScoreIcon: React.FC<IconProps> = ({ style, className = '' }) => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={style}
      className={className}
    >
      <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"></path>
    </svg>
  );

  const LevelIcon: React.FC<IconProps> = ({ style, className = '' }) => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={style}
      className={className}
    >
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );

  const LinesIcon: React.FC<IconProps> = ({ style, className = '' }) => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={style}
      className={className}
    >
      <line x1="12" y1="19" x2="12" y2="5"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );

  const TimeIcon: React.FC<IconProps> = ({ style, className = '' }) => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={style}
      className={className}
    >
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );
  
  const PauseIcon: React.FC<IconProps> = ({ style, className = '' }) => (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={style}
      className={className}
    >
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    </svg>
  );

  return (
    <div className={`${styles.gameInfo} ${compact ? styles.compact : ''} ${className}`}>
      {/* Score Row - Full Width */}
      <div className={`${styles.infoRow} ${styles.scoreRow}`}>
        <div className={`${styles.infoItem} ${scoreFlash ? styles.scoreFlash : ''}`}>
          <div className={styles.infoLabel}>
            <ScoreIcon style={{ marginRight: '6px' }} /> Score：
            <span className={`${styles.infoValue} ${styles.scoreValue}`}>
              {typeof score === 'number' ? score.toLocaleString() : '0'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Stats Row - Level, Lines, Time */}
      <div className={`${styles.infoRow} ${styles.statsRow}`}>
        <div className={`${styles.infoItem} ${isPaused ? styles.paused : ''}`}>
          <div className={styles.infoLabel}>
            <LevelIcon style={{ marginRight: '6px' }} /> Level
          </div>
          <div className={styles.infoValue}>
            {level ?? 1}
          </div>
        </div>
        
        <div className={styles.infoDivider} aria-hidden="true"></div>
        
        <div className={styles.infoItem}>
          <div className={styles.infoLabel}>
            <LinesIcon style={{ marginRight: '6px' }} /> Lines
          </div>
          <div className={styles.infoValue}>
            {lines ?? 0}
          </div>
        </div>
        
        <div className={styles.infoDivider} aria-hidden="true"></div>
        
        <div className={`${styles.infoItem} ${isPaused ? styles.paused : ''}`}>
          <div className={styles.infoLabel}>
            <TimeIcon style={{ marginRight: '6px' }} /> Time
          </div>
          <div className={styles.infoValue}>
            <span className={styles.timeDisplay}>
              {timeLeft || '--:--'}
            </span>
            {isPaused && <span className={styles.pauseIndicator}><PauseIcon /></span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerGameInfo;
