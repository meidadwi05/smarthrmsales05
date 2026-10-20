import React from 'react';

export default function FilterSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Semua',
  className = '',
  style
}) {
  return (
    <select
      className={`smart-select ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={style}
    >
      {options.map((opt) => {
        if (typeof opt === 'string') {
          return (
            <option key={opt} value={opt}>
              {opt}
            </option>
          );
        }
        return (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        );
      })}
    </select>
  );
}
