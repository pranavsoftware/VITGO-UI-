import React from 'react';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  size = 'medium',
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const sizeClass = `vitgo-modal--${size}`;

  return (
    <div className="vitgo-modal-overlay" onClick={handleOverlayClick}>
      <div className={`vitgo-modal ${sizeClass}`}>
        {(title || showCloseButton) && (
          <div className="vitgo-modal-header">
            {title && <h3 className="vitgo-modal-title">{title}</h3>}
            {showCloseButton && (
              <button className="vitgo-modal-close" onClick={onClose}>
                ×
              </button>
            )}
          </div>
        )}
        <div className="vitgo-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
