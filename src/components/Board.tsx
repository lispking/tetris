import React, { useState, useEffect } from 'react';
import type { Board as BoardType, Cell as CellType } from '../types/tetris';
import Cell from './Cell';
import { BOARD_WIDTH, CELL_SIZE } from '../utils/constants';

interface BoardProps {
  board: BoardType;
  preview?: boolean;
  clearedLines?: number[];
}

const Board: React.FC<BoardProps> = ({ board, preview = false, clearedLines = [] }) => {
  const [animatingLines, setAnimatingLines] = useState<number[]>([]);
  
  // For the preview, only show the top 4 rows
  const displayBoard = preview ? board.slice(0, 4) : board;
  
  // Handle line clearing animation
  useEffect(() => {
    if (clearedLines && clearedLines.length > 0) {
      setAnimatingLines(clearedLines);
      
      // Clear the animation after it completes
      const timer = setTimeout(() => {
        setAnimatingLines([]);
      }, 800); // Match this with the CSS animation duration
      
      return () => clearTimeout(timer);
    }
  }, [clearedLines]);
  
  // Check if a cell is in a line that's being cleared
  const isCellInClearingLine = (y: number): boolean => {
    if (preview) return false; // No animations in preview
    return animatingLines.includes(y);
  };
  
  return (
    <div 
      className="board"
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${displayBoard.length}, ${CELL_SIZE}px)`,
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
        gap: '1px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        border: '2px solid #333',
        borderRadius: '4px',
        padding: '4px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
      }}
    >
      {displayBoard.map((row, y) =>
        row.map((cell: CellType, x: number) => (
          <Cell 
            key={`${y}-${x}`} 
            cell={cell} 
            size={CELL_SIZE} 
            isClearing={isCellInClearingLine(y)}
          />
        ))
      )}
    </div>
  );
};

export default Board;
