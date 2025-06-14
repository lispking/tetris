import React, { useEffect, useState } from 'react';
import type { Cell as CellType } from '../types/tetris';
import styles from './Cell.module.css';

interface CellProps {
  cell: CellType;
  size?: number;
  isClearing?: boolean;
}

const Cell: React.FC<CellProps> = ({ cell, size = 30, isClearing = false }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationDelay, setAnimationDelay] = useState(0);

  useEffect(() => {
    if (isClearing && cell.type) {
      // Stagger the animation based on the cell's position
      const delay = Math.random() * 0.3; // Random delay up to 300ms
      setAnimationDelay(delay);
      setIsAnimating(true);
      
      // Reset animation after it completes
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 300 + delay * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isClearing, cell.type]);

  // Don't render empty cells in the final board
  if (!cell.type) {
    return (
      <div
        className={styles.cell}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      />
    );
  }

  return (
    <div
      className={`${styles.cell} ${isAnimating ? styles.clearing : ''}`}
      style={{
        '--size': `${size}px`,
        '--color': cell.color,
        '--delay': `${animationDelay}s`,
      } as React.CSSProperties}
    >
      <div className={styles.innerCell} />
      <div className={styles.highlight} />
    </div>
  );
};

export default Cell;
