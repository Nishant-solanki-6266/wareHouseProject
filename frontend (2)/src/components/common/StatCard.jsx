import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendType = 'neutral', // 'up' | 'down' | 'neutral'
  accent = 'navy', // 'navy' | 'gold' | 'warning' | 'cyan' | 'success'
  onClick
}) => {
  return (
    <div
      className={`stat-card accent-${accent} ${onClick ? 'card-clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-card-top">
        <span className="stat-card-title">{title}</span>
        {Icon && (
          <div className="stat-card-icon">
            <Icon size={20} />
          </div>
        )}
      </div>

      <div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-meta">
          {trend && (
            <span className={`stat-card-trend ${trendType}`}>
              {trendType === 'up' && <ArrowUpRight size={14} />}
              {trendType === 'down' && <ArrowDownRight size={14} />}
              {trendType === 'neutral' && <Minus size={14} />}
              {trend}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>
    </div>
  );
};
