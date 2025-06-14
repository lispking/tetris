import React from 'react';
import styles from './GameInfo.module.css';

interface GameInfoProps {
  score: number;
  level: number;
  lines: number;
}

const GameInfo: React.FC<GameInfoProps> = ({ score, level, lines }) => {
  return (
    <div className={styles.gameInfo}>
      <div className={styles.infoBox}>
        <div className={styles.infoLabel}>Score</div>
        <div className={styles.infoValue}>{score}</div>
      </div>
      <div className={styles.infoBox}>
        <div className={styles.infoLabel}>Level</div>
        <div className={styles.infoValue}>{level}</div>
      </div>
      <div className={styles.infoBox}>
        <div className={styles.infoLabel}>Lines</div>
        <div className={styles.infoValue}>{lines}</div>
      </div>
    </div>
  );
};

export default GameInfo;
