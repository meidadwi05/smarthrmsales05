import React from 'react';

export default function TypeBadge({ type, variant, style }) {
  if (!type) return null;

  let bg = '#eff6ff';
  let color = '#2563eb';
  let border = '1px solid #bfdbfe';

  const t = String(type).toLowerCase();
  if (t === 'potongan' || t.includes('deduction')) {
    bg = '#fff1f2';
    color = '#e11d48';
    border = '1px solid #fecdd3';
  } else if (t === 'pendapatan' || t.includes('earning')) {
    bg = '#ecfdf5';
    color = '#059669';
    border = '1px solid #a7f3d0';
  } else if (t === 'harian' || t === 'mingguan') {
    bg = '#fffbeb';
    color = '#d97706';
    border = '1px solid #fde68a';
  }

  return (
    <span
      className="type-tag"
      style={{
        background: bg,
        color: color,
        border: border,
        borderRadius: '7px',
        padding: '3px 8px',
        fontSize: '11px',
        fontWeight: 600,
        display: 'inline-block',
        whiteSpace: 'nowrap',
        ...style
      }}
    >
      {type}
    </span>
  );
}
