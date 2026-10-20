import React from 'react';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  if (totalItems === 0) return null;

  // Generate page numbers
  const pages = [];
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="table-footer">
      <span>
        Menampilkan <b>{startItem}</b> sampai <b>{endItem}</b> dari <b>{totalItems}</b> data
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          type="button"
          className="secondary"
          disabled={currentPage === 1}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          style={{ padding: '6px 12px', fontSize: '11px' }}
        >
          Sebelumnya
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={p === currentPage ? 'primary compact' : 'secondary'}
            onClick={() => onPageChange(p)}
            style={{
              minWidth: '28px',
              height: '28px',
              padding: '0 6px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: p === currentPage ? '#2563eb' : '#ffffff',
              color: p === currentPage ? '#ffffff' : '#64748b',
              border: p === currentPage ? 'none' : '1px solid #e2e8f0'
            }}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          className="secondary"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          style={{ padding: '6px 12px', fontSize: '11px' }}
        >
          Selanjutnya
        </button>
      </div>
    </div>
  );
}
