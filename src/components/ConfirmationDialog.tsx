import React from 'react';
import styles from './ConfirmationDialog.module.css';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: React.ReactNode;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmButtonVariant?: 'danger' | 'primary' | 'secondary';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmButtonVariant = 'danger'
}) => {
  if (!isOpen) return null;

  const getButtonVariantClass = () => {
    switch (confirmButtonVariant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'danger':
      default:
        return styles.dangerButton;
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttons}>
          <button
            onClick={onCancel}
            className={`${styles.button} ${styles.cancelButton}`}
            aria-label="Cancel"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${styles.button} ${getButtonVariantClass()}`}
            aria-label="Confirm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
