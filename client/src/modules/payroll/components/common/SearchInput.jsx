import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Cari...',
  width = '240px',
  onClear
}) {
  return (
    <div
      className="searchbox"
      style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        height: '38px',
        padding: '0 12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        minWidth: width,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
      }}
    >
      <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: '12px',
          color: 'var(--text-primary, #0f172a)',
          width: '100%'
        }}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange('');
            if (onClear) onClear();
          }}
          style={{
            border: 0,
            background: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            padding: 0,
            display: 'grid',
            placeItems: 'center'
          }}
          title="Hapus pencarian"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}
