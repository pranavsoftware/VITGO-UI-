import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  hoverable?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'medium',
  hoverable = false,
  onClick,
}) => {
  const baseClasses = 'vitgo-card';
  const variantClass = `vitgo-card--${variant}`;
  const paddingClass = `vitgo-card--padding-${padding}`;
  const hoverableClass = hoverable ? 'vitgo-card--hoverable' : '';
  const clickableClass = onClick ? 'vitgo-card--clickable' : '';

  const classes = [
    baseClasses,
    variantClass,
    paddingClass,
    hoverableClass,
    clickableClass,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;
