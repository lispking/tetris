import React from 'react';
import type { Tetromino } from '../types/tetris';
import Board from './Board';
import { createBoard } from '../utils/gameUtils';
import { BOARD_HEIGHT, BOARD_WIDTH } from '../utils/constants';
import styles from './NextPiecePreview.module.css';

interface NextPiecePreviewProps {
  piece: Tetromino | null;
}

const NextPiecePreview: React.FC<NextPiecePreviewProps> = ({ piece }) => {
  // Create a small board for the preview
  const previewBoard = React.useMemo(() => {
    const board = createBoard();
    
    if (piece) {
      // Center the piece in the preview
      const startX = Math.floor((BOARD_WIDTH - piece.shape[0].length) / 2);
      const startY = 0; // Start from the top
      
      // Place the piece on the board
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x] !== 0) {
            const boardY = startY + y;
            const boardX = startX + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              board[boardY][boardX] = { type: 'preview', color: piece.color };
            }
          }
        }
      }
    }
    
    return board;
  }, [piece]);

  return (
    <div className={styles.nextPiece}>
      <h3>Next Piece</h3>
      <div className={styles.previewContainer}>
        <Board board={previewBoard} preview={true} />
      </div>
    </div>
  );
};

export default NextPiecePreview;
