import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function MetricGrid({ children, columns = 4, className = '', style }) {
  const gridClass = columns === 5 ? 'metric-grid metric-grid-5' : 'metric-grid';
  return (
    <div
      className={`${gridClass} ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        ...style
      }}
    >
      {children}
    </div>
  );
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = '#2563eb',
  iconBg = '#eff6ff',
  trend,
  trendType = 'positive', // 'positive', 'negative', 'neutral'
  sparklineData = [25, 40, 30, 56, 42, 65, 58, 76]
}) {
  return (
    <div className="metric-card" style={{ minHeight: '136px', padding: '16px 18px' }}>
      <div className="metric-top">
        <span>{title}</span>
        {Icon && (
          <span
            className="metric-icon"
            style={{
              background: iconBg,
              color: iconColor,
              width: '32px',
              height: '32px',
              borderRadius: '9px'
            }}
          >
            <Icon size={16} />
          </span>
        )}
      </div>

      <div className="metric-value" style={{ fontSize: '26px', margin: '6px 0 4px' }}>
        {value}
      </div>

      <div className="metric-bottom">
        {trend && (
          <span
            className={
              trendType === 'positive'
                ? 'green'
                : trendType === 'negative'
                ? 'orange'
                : ''
            }
          >
            {trendType === 'positive' ? (
              <ArrowUpRight size={12} />
            ) : trendType === 'negative' ? (
              <ArrowDownRight size={12} />
            ) : null}
            {trend}
          </span>
        )}
        {subtitle && <small>{subtitle}</small>}
      </div>

      {sparklineData && sparklineData.length > 0 && (
        <div className="sparkline">
          {sparklineData.map((val, i) => (
            <i key={i} style={{ height: `${val}%` }} />
          ))}
        </div>
      )}
    </div>
  );
}
