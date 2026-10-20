import React from 'react';

export default function Button({
  children,
  variant = 'primary', // 'primary', 'secondary', 'ghost', 'danger', 'icon'
  size = 'default',    // 'default', 'compact', 'sm'
  icon: Icon,
  iconRight: IconRight,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  title,
  style,
  className = ''
}) {
  let baseClass = '';
  let inlineStyle = { ...style };

  if (variant === 'primary') {
    baseClass = `primary ${size === 'compact' || size === 'default' ? 'compact' : ''}`;
    inlineStyle = {
      background: '#2563eb',
      color: '#ffffff',
      border: 'none',
      borderRadius: '9px',
      height: size === 'sm' ? '34px' : '40px',
      padding: size === 'sm' ? '0 12px' : '0 18px',
      fontWeight: 600,
      fontSize: size === 'sm' ? '12px' : '13px',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.22)',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      ...inlineStyle
    };
  } else if (variant === 'secondary') {
    baseClass = 'secondary';
    inlineStyle = {
      background: '#ffffff',
      border: '1px solid #e1e7f0',
      color: '#475569',
      borderRadius: '8px',
      height: size === 'sm' ? '32px' : '38px',
      padding: size === 'sm' ? '0 10px' : '0 14px',
      fontSize: '12px',
      fontWeight: 600,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.6 : 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '7px',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      ...inlineStyle
    };
  } else if (variant === 'ghost') {
    baseClass = 'text-action';
    inlineStyle = {
      background: 'transparent',
      border: 'none',
      color: '#2563eb',
      fontSize: '12px',
      fontWeight: 600,
      padding: '6px 10px',
      borderRadius: '6px',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.15s ease',
      ...inlineStyle
    };
  } else if (variant === 'danger') {
    baseClass = 'secondary';
    inlineStyle = {
      background: '#fff1f2',
      border: '1px solid #fecdd3',
      color: '#e11d48',
      borderRadius: '8px',
      height: size === 'sm' ? '32px' : '38px',
      padding: size === 'sm' ? '0 12px' : '0 14px',
      fontSize: '12px',
      fontWeight: 600,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '7px',
      ...inlineStyle
    };
  } else if (variant === 'icon') {
    baseClass = 'icon-button';
    inlineStyle = {
      padding: '7px',
      borderRadius: '8px',
      display: 'inline-grid',
      placeItems: 'center',
      color: '#64748b',
      background: 'transparent',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.15s ease',
      ...inlineStyle
    };
  }

  return (
    <button
      type={type}
      className={`${baseClass} ${className}`}
      style={inlineStyle}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      title={title}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} className={loading ? 'animate-spin' : ''} />}
      {children}
      {IconRight && <IconRight size={size === 'sm' ? 14 : 16} />}
    </button>
  );
}
