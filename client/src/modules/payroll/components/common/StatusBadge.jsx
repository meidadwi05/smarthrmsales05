import React from 'react';

export default function StatusBadge({ status, style }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let badgeClass = 'status';
  let customStyle = { ...style };

  if (
    normalized.includes('disetujui') ||
    normalized.includes('sudah dibayar') ||
    normalized.includes('slip dipublikasikan') ||
    normalized.includes('selesai') ||
    normalized.includes('lunas') ||
    normalized === 'aktif' ||
    normalized === 'hadir' ||
    normalized === 'disetujui hr & finance'
  ) {
    badgeClass = 'status present';
  } else if (
    normalized.includes('menunggu') ||
    normalized.includes('pemeriksaan') ||
    normalized.includes('review') ||
    normalized.includes('pending')
  ) {
    badgeClass = 'status late';
  } else if (
    normalized.includes('perhitungan') ||
    normalized.includes('proses') ||
    normalized.includes('berjalan')
  ) {
    badgeClass = 'status leave';
  } else if (
    normalized.includes('ditolak') ||
    normalized.includes('tidak aktif') ||
    normalized.includes('batal')
  ) {
    badgeClass = 'status inactive';
  } else if (
    normalized.includes('draft') ||
    normalized.includes('ditutup') ||
    normalized.includes('arsip')
  ) {
    badgeClass = 'status draft';
  }

  return (
    <span className={badgeClass} style={customStyle}>
      {status}
    </span>
  );
}
