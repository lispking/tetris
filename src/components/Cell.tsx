import React from 'react';
import type { Cell as CellType } from '../types/tetris';

interface CellProps {
  cell: CellType;
  size?: number;
}

const Cell: React.FC<CellProps> = ({ cell, size = 30 }) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: cell.color || 'transparent',
        border: cell.type ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.05)',
        boxSizing: 'border-box',
        transition: 'all 0.2s ease',
      }}
    />
  );
};

export default Cell;
