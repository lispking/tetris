import React from 'react';
import styles from './Controls.module.css';

const Controls: React.FC = () => {
  return (
    <div className={styles.controls}>
      <h3>Controls</h3>
      <div className={styles.controlList}>
        <div className={styles.controlItem}>
          <span className={styles.key}>← →</span>
          <span>Move Left/Right</span>
        </div>
        <div className={styles.controlItem}>
          <span className={styles.key}>↑</span>
          <span>Rotate</span>
        </div>
        <div className={styles.controlItem}>
          <span className={styles.key}>↓</span>
          <span>Soft Drop</span>
        </div>
        <div className={styles.controlItem}>
          <span className={styles.key}>Space</span>
          <span>Hard Drop</span>
        </div>
        <div className={styles.controlItem}>
          <span className={styles.key}>P</span>
          <span>Pause/Resume</span>
        </div>
      </div>
    </div>
  );
};

export default Controls;
