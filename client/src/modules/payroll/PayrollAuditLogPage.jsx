import React, { useState, useEffect } from 'react';
import {
  History,
  ShieldCheck,
  Search,
  Filter,
  Clock,
  UserCheck,
  Activity
} from 'lucide-react';
import {
  PageHeader,
  Button,
  SearchInput,
  TypeBadge,
  Pagination,
  EmptyState
} from './components/common/index.js';

export default function PayrollAuditLogPage({ API }) {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetch(`${API}/api/payroll/audit-logs`)
      .then((r) => r.json())
      .then((data) => setLogs(data.logs || []))
      .catch((e) => console.error(e));
  }, [API]);

  const filtered = logs.filter(
    (l) =>
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.actorName?.toLowerCase().includes(search.toLowerCase()) ||
      l.employeeName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <section className="module-page">
      <PageHeader
        breadcrumb="Home / Audit Log Penggajian"
        sectionLabel="PENGGAJIAN & KEUANGAN"
        title="Audit Log Penggajian"
        subtitle="Catatan kronologis seluruh perubahan data penggajian, koreksi komponen, persetujuan, dan transaksi pembayaran resmi perusahaan."
      />

      <section className="panel team-panel">
        <div className="panel-head">
          <div>
            <h2>Rekam Jejak Aktivitas Payroll</h2>
            <p>Audit trail permanen untuk kepatuhan tata kelola keuangan</p>
          </div>

          <div className="table-actions">
            <SearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari aktivitas, user, karyawan..."
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="payroll-table">
            <thead>
              <tr>
                <th>WAKTU & TANGGAL</th>
                <th>PELAKU (USER)</th>
                <th>ROLE</th>
                <th>KARYAWAN / TARGET</th>
                <th>AKTIVITAS</th>
                <th>NILAI AWAL</th>
                <th>NILAI AKHIR</th>
                <th>ALASAN RESMI</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <EmptyState
                      icon={Activity}
                      title="Tidak ada log aktivitas ditemukan"
                      description="Belum ada catatan aktivitas audit yang sesuai dengan kata kunci pencarian."
                    />
                  </td>
                </tr>
              ) : (
                paginated.map((log) => (
                  <tr key={log.id}>
                    <td
                      className="font-mono"
                      style={{ color: 'var(--text-muted)', fontSize: '12px' }}
                    >
                      {log.timestamp}
                    </td>
                    <td>
                      <b style={{ color: 'var(--text-main)', fontSize: '13px' }}>
                        {log.actorName}
                      </b>
                    </td>
                    <td>
                      <TypeBadge label={log.actorRole} />
                    </td>
                    <td style={{ color: 'var(--text-main)', fontSize: '13px' }}>
                      {log.employeeName}
                    </td>
                    <td>
                      <b style={{ color: '#2563EB', fontSize: '13px' }}>
                        {log.action}
                      </b>
                    </td>
                    <td
                      className="font-mono"
                      style={{ color: 'var(--text-muted)', fontSize: '12px' }}
                    >
                      {log.beforeValue}
                    </td>
                    <td
                      className="font-mono font-semibold"
                      style={{ color: '#059669', fontSize: '12px' }}
                    >
                      {log.afterValue}
                    </td>
                    <td
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '12px',
                        maxWidth: '220px'
                      }}
                    >
                      {log.reason}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </section>
    </section>
  );
}
