import React, { useCallback, useState } from 'react';
import styles from './Controls.module.css';

interface ControlsProps {
  onPause?: () => void;
  onNewGame?: () => void;
  isPaused?: boolean;
  showNewGame?: boolean;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onRotate?: () => void;
  onHardDrop?: () => void;
  onSoftDrop?: (active: boolean) => void;
}

const Controls: React.FC<ControlsProps> = ({ 
  onPause, 
  onNewGame, 
  isPaused = false,
  showNewGame = true,
  onMoveLeft,
  onMoveRight,
  onRotate,
  onHardDrop,
  onSoftDrop
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleNewGameClick = useCallback(() => {
    // Pause the game first
    if (!isPaused) {
      onPause?.();
    }
    setShowConfirmDialog(true);
  }, [isPaused, onPause]);

  const handleConfirmNewGame = useCallback(() => {
    setShowConfirmDialog(false);
    onNewGame?.();
  }, [onNewGame]);

  const handleCancelNewGame = useCallback(() => {
    setShowConfirmDialog(false);
    // Resume the game if it was running before showing the dialog
    if (isPaused) {
      onPause?.(); // Toggle pause state to resume
    }
  }, [isPaused, onPause]);
  // Handle touch events with passive listeners for better performance
  const handleTouchStart = useCallback((e: React.TouchEvent, handler?: () => void) => {
    e.preventDefault();
    handler?.();
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent, handler?: () => void) => {
    e.preventDefault();
    handler?.();
  }, []);

  return (
    <div className={styles.controls}>
      {/* Keyboard hints */}
      <div className={styles.keyboardHints}>
        <div className={styles.hintItem}>
          <span className={styles.key}>P</span>
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </div>
        <div className={styles.hintItem}>
          <span className={styles.key}>Space</span>
          <span>Hard Drop</span>
        </div>
      </div>
      <div className={styles.controller}>
        {/* Left side - D-pad */}
        <div className={styles.dPadContainer}>
          <div className={styles.dPad}>
            <div className={styles.dpadMiddle}>
              {onMoveLeft && (
                <button 
                  className={`${styles.controlButton} ${styles.dpadButton} ${styles.dpadLeft}`}
                  onTouchStart={(e) => handleTouchStart(e, onMoveLeft)}
                  onMouseDown={onMoveLeft}
                  onTouchEnd={(e) => handleTouchEnd(e, () => onSoftDrop?.(false))}
                  onMouseUp={() => onSoftDrop?.(false)}
                  onMouseLeave={() => onSoftDrop?.(false)}
                  aria-label="Move Left"
                >
                  <span className={styles.buttonIcon} style={{fontSize: '24px'}}>◀</span>
                </button>
              )}
              <div className={styles.dpadSpacer}></div>
              {onMoveRight && (
                <button 
                  className={`${styles.controlButton} ${styles.dpadButton} ${styles.dpadRight}`}
                  onTouchStart={(e) => handleTouchStart(e, onMoveRight)}
                  onMouseDown={onMoveRight}
                  onTouchEnd={(e) => handleTouchEnd(e, () => onSoftDrop?.(false))}
                  onMouseUp={() => onSoftDrop?.(false)}
                  onMouseLeave={() => onSoftDrop?.(false)}
                  aria-label="Move Right"
                >
                  <span className={styles.buttonIcon} style={{fontSize: '24px'}}>▶</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className={styles.actionButtons}>
          <div className={styles.actionRow}>
            {onPause && (
              <button 
                onClick={onPause} 
                className={`${styles.controlButton} ${styles.actionButton} ${styles.actionStart}`}
                aria-label={isPaused ? 'Resume' : 'Pause'}
              >
                <span className={styles.buttonIcon}>{isPaused ? '▶' : '❚❚'}</span>
              </button>
            )}
            {onNewGame && showNewGame && (
              <>
                <button 
                  onClick={handleNewGameClick} 
                  className={`${styles.controlButton} ${styles.actionButton} ${styles.actionSelect}`}
                  aria-label="New Game"
                >
                  <span className={styles.buttonIcon}>SELECT</span>
                </button>
                {showConfirmDialog && (
                  <div className={styles.confirmDialogOverlay}>
                    <div className={styles.confirmDialog}>
                      <p>New game?<br/>Current progress will be lost.</p>
                      <div className={styles.dialogButtons}>
                        <button 
                          onClick={handleConfirmNewGame}
                          className={`${styles.dialogButton} ${styles.confirmButton}`}
                        >
                          New Game
                        </button>
                        <button 
                          onClick={handleCancelNewGame}
                          className={`${styles.dialogButton} ${styles.cancelButton}`}
                        >
                          Keep Playing
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className={styles.actionRow}>
            {onHardDrop && (
              <button 
                className={`${styles.controlButton} ${styles.actionButton} ${styles.actionA}`}
                onTouchStart={(e) => handleTouchStart(e, onHardDrop)}
                onMouseDown={onHardDrop}
                aria-label="Hard Drop"
              >
                <span className={styles.buttonIcon}>A</span>
              </button>
            )}
            {onRotate && (
              <button 
                className={`${styles.controlButton} ${styles.actionButton} ${styles.actionB}`}
                onTouchStart={(e) => handleTouchStart(e, onRotate)}
                onMouseDown={onRotate}
                aria-label="Rotate"
              >
                <span className={styles.buttonIcon}>B</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
