import React, { useState, useEffect } from 'react';
import {
  Calendar,
  History,
  Eye,
  FileSpreadsheet,
  Download,
  Wallet,
  Users,
  CheckCircle2,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { formatRupiah, formatDateIndo } from './utils/formatters.js';
import {
  PageHeader,
  Button,
  SearchInput,
  FilterSelect,
  StatusBadge,
  TypeBadge,
  StatCard,
  MetricGrid,
  Pagination,
  EmptyState
} from './components/common/index.js';

export default function PayrollHistoryPage({ API, onNavigate, onSelectPeriod }) {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/payroll/periods`);
      const data = await res.json();
      setPeriods(data.periods || []);
    } catch (err) {
      console.error('Error fetching payroll history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, [API]);

  const filteredPeriods = periods.filter((p) => {
    const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPaid = periods.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalEmployeesPaid = periods.length > 0 ? (periods[0].paidEmployees || periods[0].totalEmployees || 21) : 0;
  const avgNet = totalEmployeesPaid > 0 ? Math.round(totalPaid / (periods.length * totalEmployeesPaid || 1)) : 0;

  const totalPages = Math.max(1, Math.ceil(filteredPeriods.length / perPage));
  const paginatedPeriods = filteredPeriods.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <>
      <PageHeader
        breadcrumbs={['Home', 'Riwayat Penggajian']}
        eyebrow="PENGGAJIAN & KEUANGAN"
        title="Riwayat Penggajian"
        subtitle="Riwayat proses penggajian perusahaan berdasarkan periode dan status realisasi pembayaran."
        actions={
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={loading}
              onClick={fetchPeriods}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              icon={Download}
              onClick={() => alert('Mengekspor riwayat penggajian tahunan ke format CSV...')}
            >
              Ekspor CSV
            </Button>
          </>
        }
      />

      {/* 4 Summary Cards matching Data Karyawan */}
      <MetricGrid columns={4} style={{ marginBottom: '22px' }}>
        <StatCard
          title="Total Periode"
          value={`${periods.length} Periode`}
          subtitle="Tercatat dalam sistem"
          icon={Calendar}
          iconColor="#2563eb"
          iconBg="#eff6ff"
          trend="+100%"
          trendType="positive"
        />
        <StatCard
          title="Total Dibayarkan"
          value={formatRupiah(totalPaid || 2450000000)}
          subtitle="Akumulasi realisasi gaji"
          icon={Wallet}
          iconColor="#059669"
          iconBg="#ecfdf5"
          trend="+8.5%"
          trendType="positive"
        />
        <StatCard
          title="Karyawan Dibayar"
          value={`${totalEmployeesPaid || 128} Orang`}
          subtitle="Penerima gaji aktif"
          icon={Users}
          iconColor="#2563eb"
          iconBg="#eff6ff"
          trend="100% Selesai"
          trendType="positive"
        />
        <StatCard
          title="Rata-rata Gaji Bersih"
          value={formatRupiah(avgNet || 7250000)}
          subtitle="Per karyawan per bulan"
          icon={CheckCircle2}
          iconColor="#059669"
          iconBg="#ecfdf5"
          trend="Stabil"
          trendType="positive"
        />
      </MetricGrid>

      {/* Main Panel matching Data Karyawan */}
      <section className="panel team-panel">
        <div className="panel-head">
          <div>
            <h2>Daftar Riwayat Periode Penggajian</h2>
            <p>Arsip histori penggajian resmi perusahaan beserta tanggal pembayaran dan rekonsiliasi</p>
          </div>

          <div className="table-actions">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Cari riwayat periode..."
              width="220px"
            />

            <FilterSelect
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
              options={[
                'Semua',
                'Sudah Dibayar',
                'Slip Dipublikasikan',
                'Disetujui',
                'Ditutup',
                'Perhitungan'
              ]}
            />

            <FilterSelect
              value={perPage}
              onChange={(val) => {
                setPerPage(Number(val));
                setCurrentPage(1);
              }}
              options={[
                { value: 10, label: '10 Baris' },
                { value: 25, label: '25 Baris' },
                { value: 50, label: '50 Baris' }
              ]}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="payroll-table">
            <thead>
              <tr>
                <th style={{ width: '220px' }}>NAMA PERIODE</th>
                <th style={{ width: '100px' }}>JENIS</th>
                <th>PERIODE KERJA</th>
                <th>TANGGAL PEMBAYARAN</th>
                <th>KARYAWAN</th>
                <th>TOTAL DIBAYARKAN</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right', width: '120px' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#8a97a9' }}>
                    Memuat data riwayat penggajian...
                  </td>
                </tr>
              ) : paginatedPeriods.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                    <EmptyState
                      icon={History}
                      title="Tidak Ada Riwayat Penggajian"
                      description={
                        search || statusFilter !== 'Semua'
                          ? 'Tidak ada histori periode penggajian yang cocok dengan pencarian.'
                          : 'Belum ada riwayat penggajian yang tersimpan.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginatedPeriods.map((period) => (
                  <tr key={period.id}>
                    <td>
                      <div>
                        <b style={{ fontSize: '13px', color: 'var(--text-heading, #0f172a)', display: 'block' }}>
                          {period.name}
                        </b>
                        <small style={{ fontSize: '11px', color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>
                          {period.id?.toUpperCase()}
                        </small>
                      </div>
                    </td>
                    <td>
                      <TypeBadge type={period.payrollType || 'Bulanan'} />
                    </td>
                    <td className="time-cell">
                      {formatDateIndo(period.startDate)} — {formatDateIndo(period.endDate)}
                    </td>
                    <td className="time-cell">
                      {formatDateIndo(period.paymentDate)}
                    </td>
                    <td>
                      <b style={{ color: 'var(--text-primary, #0f172a)' }}>
                        {period.paidEmployees || period.totalEmployees || 0}
                      </b>
                      <small style={{ color: '#94a3b8' }}>
                        {' '}/ {period.totalEmployees || 0} org
                      </small>
                    </td>
                    <td>
                      <b style={{ fontFamily: '"JetBrains Mono", monospace', color: 'var(--text-primary, #0f172a)' }}>
                        {formatRupiah(period.totalAmount || 0)}
                      </b>
                    </td>
                    <td>
                      <StatusBadge status={period.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Eye}
                          onClick={() => {
                            if (onSelectPeriod) onSelectPeriod(period.id);
                            if (onNavigate) onNavigate('Proses Penggajian');
                          }}
                          title="Lihat rincian riwayat penggajian"
                        >
                          Lihat
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredPeriods.length}
          pageSize={perPage}
          onPageChange={setCurrentPage}
        />
      </section>
    </>
  );
}
