import React from 'react';
import { Card } from '../common';
import './StatsCard.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger';
  loading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'primary',
  loading = false
}) => {
  if (loading) {
    return (
      <Card className="vitgo-stats-card vitgo-stats-card--loading" hoverable>
        <div className="vitgo-stats-skeleton"></div>
      </Card>
    );
  }

  return (
    <Card className={`vitgo-stats-card vitgo-stats-card--${color}`} hoverable>
      <div className="vitgo-stats-content">
        <div className="vitgo-stats-header">
          <div className="vitgo-stats-info">
            <h3 className="vitgo-stats-title">{title}</h3>
            <div className="vitgo-stats-value">{value}</div>
            {subtitle && <p className="vitgo-stats-subtitle">{subtitle}</p>}
          </div>
          {icon && (
            <div className="vitgo-stats-icon">
              {icon}
            </div>
          )}
        </div>
        
        {trend && (
          <div className="vitgo-stats-trend">
            <span className={`vitgo-stats-trend-value vitgo-stats-trend--${trend.isPositive ? 'positive' : 'negative'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            {trend.label && (
              <span className="vitgo-stats-trend-label">{trend.label}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
