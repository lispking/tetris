import React from 'react';
import type { Board as BoardType } from '../types/tetris';
import Cell from './Cell';
import { BOARD_WIDTH, CELL_SIZE } from '../utils/constants';

interface BoardProps {
  board: BoardType;
  preview?: boolean;
}

const Board: React.FC<BoardProps> = ({ board, preview = false }) => {
  // For the preview, only show the top 4 rows
  const displayBoard = preview ? board.slice(0, 4) : board;
  
  return (
    <div 
      style={{
        display: 'grid',
        gridTemplateRows: `repeat(${displayBoard.length}, ${CELL_SIZE}px)`,
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
        gap: '1px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        border: '2px solid #333',
        borderRadius: '4px',
        padding: '4px',
      }}
    >
      {displayBoard.map((row, y) =>
        row.map((cell, x) => (
          <Cell key={`${y}-${x}`} cell={cell} size={CELL_SIZE} />
        ))
      )}
    </div>
  );
};

export default Board;
