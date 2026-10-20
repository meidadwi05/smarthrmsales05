import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Inbox,
  title = 'Tidak ada data',
  description = 'Belum ada data yang dapat ditampilkan.',
  action
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(37, 99, 235, 0.08)',
          color: '#2563eb',
          display: 'grid',
          placeItems: 'center',
          marginBottom: '16px'
        }}
      >
        <Icon size={26} strokeWidth={1.8} />
      </div>
      <h3
        style={{
          font: '700 16px Manrope, sans-serif',
          color: 'var(--text-heading, #091224)',
          margin: '0 0 6px 0'
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: '13px',
          color: 'var(--text-secondary, #64748b)',
          margin: 0,
          maxWidth: '380px',
          lineHeight: 1.5
        }}
      >
        {description}
      </p>
      {action && <div style={{ marginTop: '16px' }}>{action}</div>}
    </div>
  );
}
