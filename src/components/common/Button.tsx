import React from 'react';
import './Button.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
}) => {
  const baseClasses = 'vitgo-btn';
  const variantClass = `vitgo-btn--${variant}`;
  const sizeClass = `vitgo-btn--${size}`;
  const disabledClass = disabled || loading ? 'vitgo-btn--disabled' : '';
  const loadingClass = loading ? 'vitgo-btn--loading' : '';

  const classes = [
    baseClasses,
    variantClass,
    sizeClass,
    disabledClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <div className="vitgo-btn__spinner" />}
      <span className={loading ? 'vitgo-btn__text--hidden' : ''}>{children}</span>
    </button>
  );
};

export default Button;
