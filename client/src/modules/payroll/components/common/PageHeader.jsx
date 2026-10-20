import React from 'react';

export default function PageHeader({
  breadcrumbs = ['Home', 'Penggajian'],
  eyebrow = 'PENGGAJIAN & KEUANGAN',
  title,
  subtitle,
  actions
}) {
  return (
    <div className="welcome-row">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb}>
                <span>{crumb}</span>
                {idx < breadcrumbs.length - 1 && <span style={{ color: '#cbd5e1' }}>/</span>}
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="eyebrow blue">
          {eyebrow}
        </div>
        <h1>
          {title}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {actions && (
        <div className="welcome-actions">
          {actions}
        </div>
      )}
    </div>
  );
}
