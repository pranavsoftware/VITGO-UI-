import React from 'react';
import './Input.css';

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = '',
  size = 'medium',
  icon,
  iconPosition = 'left',
}) => {
  const baseClasses = 'vitgo-input';
  const sizeClass = `vitgo-input--${size}`;
  const errorClass = error ? 'vitgo-input--error' : '';
  const disabledClass = disabled ? 'vitgo-input--disabled' : '';
  const iconClass = icon ? `vitgo-input--with-icon vitgo-input--icon-${iconPosition}` : '';

  const inputClasses = [
    baseClasses,
    sizeClass,
    errorClass,
    disabledClass,
    iconClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="vitgo-input-wrapper">
      {label && (
        <label className="vitgo-input-label">
          {label}
          {required && <span className="vitgo-input-required">*</span>}
        </label>
      )}
      <div className="vitgo-input-container">
        {icon && iconPosition === 'left' && (
          <div className="vitgo-input-icon vitgo-input-icon--left">{icon}</div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={inputClasses}
        />
        {icon && iconPosition === 'right' && (
          <div className="vitgo-input-icon vitgo-input-icon--right">{icon}</div>
        )}
      </div>
      {error && <div className="vitgo-input-error">{error}</div>}
    </div>
  );
};

export default Input;
