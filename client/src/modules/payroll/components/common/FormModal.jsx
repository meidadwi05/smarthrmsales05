import React from 'react';
import { X } from 'lucide-react';
import Button from './Button.jsx';

export default function FormModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel = 'Simpan',
  cancelLabel = 'Batal',
  loading = false,
  maxWidth = '520px'
}) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (onSubmit) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="panel-head" style={{ borderBottom: '1px solid #f0f3f7', padding: '18px 22px' }}>
          <div>
            <h2 style={{ font: '700 17px Manrope, sans-serif', margin: 0, color: 'var(--text-heading, #0f172a)' }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            title="Tutup"
            style={{ padding: '6px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
          >
            <X size={17} />
          </button>
        </div>

        {onSubmit ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="modal-body" style={{ padding: '20px 24px', flex: 1 }}>
              {children}
            </div>

            <div className="modal-footer" style={{ padding: '14px 22px' }}>
              <Button variant="secondary" onClick={onClose} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button variant="primary" type="submit" loading={loading}>
                {submitLabel}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="modal-body" style={{ padding: '20px 24px', flex: 1 }}>
              {children}
            </div>
            <div className="modal-footer" style={{ padding: '14px 22px' }}>
              <Button variant="secondary" onClick={onClose}>
                {cancelLabel}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
