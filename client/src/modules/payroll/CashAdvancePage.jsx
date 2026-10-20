import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Wallet,
  Check,
  X,
  CreditCard
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
  EmptyState,
  FormModal
} from './components/common/index.js';

export default function CashAdvancePage({
  API,
  activeRole,
  userRole,
  initialTab = 'all',
  onNavigate
}) {
  const currentRole = userRole || activeRole || 'hrd';
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [form, setForm] = useState({
    employeeId: 'emp-1',
    amount: 500000,
    purpose: '',
    deductionPeriod: 'September 2026'
  });

  const fetchAdvances = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/payroll/cash-advances`);
      const data = await res.json();
      setAdvances(data.cashAdvances || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvances();
  }, [API]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.purpose.trim()) return;

    try {
      const res = await fetch(`${API}/api/payroll/cash-advances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowModal(false);
        setForm({
          employeeId: 'emp-1',
          amount: 500000,
          purpose: '',
          deductionPeriod: 'September 2026'
        });
        fetchAdvances();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${API}/api/payroll/cash-advances/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) fetchAdvances();
    } catch (err) {
      alert(err.message);
    }
  };

  // Metrics
  const totalNominal = advances.reduce((s, a) => s + (a.amount || 0), 0);
  const pendingCount = advances.filter((a) => a.status === 'Menunggu Persetujuan').length;
  const approvedCount = advances.filter((a) => a.status === 'Disetujui').length;
  const settledCount = advances.filter((a) => a.status === 'Lunas').length;

  // Filter & Pagination
  const filtered = advances.filter((adv) => {
    const matchSearch =
      adv.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      adv.purpose?.toLowerCase().includes(search.toLowerCase()) ||
      adv.department?.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === 'Semua' || adv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <section className="module-page">
      <PageHeader
        breadcrumb="Home / Kasbon Karyawan"
        sectionLabel="PENGGAJIAN & KEUANGAN"
        title="Kasbon Karyawan"
        subtitle="Fasilitas dana talangan jangka pendek mendesak yang langsung dipotong penuh pada periode penggajian berjalan."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowModal(true)}
          >
            Ajukan Kasbon Baru
          </Button>
        }
      />

      {/* 4 Summary Statistic Cards */}
      <MetricGrid columns={4}>
        <StatCard
          label="Total Kasbon Diajukan"
          value={formatRupiah(totalNominal)}
          icon={Receipt}
          subtext={`${advances.length} Transaksi Terdata`}
          trend={`${advances.length} Pengajuan`}
          trendColor="blue"
        />
        <StatCard
          label="Menunggu Persetujuan"
          value={`${pendingCount} Pengajuan`}
          icon={Clock}
          subtext="Perlu Verifikasi HR & Finance"
          trend="Perlu Tindakan"
          trendColor="orange"
        />
        <StatCard
          label="Disetujui Payroll"
          value={`${approvedCount} Pengajuan`}
          icon={CheckCircle2}
          subtext="Siap Dipotong pada Periode"
          trend="Terjadwal"
          trendColor="green"
        />
        <StatCard
          label="Selesai / Lunas"
          value={`${settledCount} Pengajuan`}
          icon={Wallet}
          subtext="Telah Dipotong & Tercatat"
          trend="Lunas"
          trendColor="gray"
        />
      </MetricGrid>

      {/* Main Table Card */}
      <section className="panel team-panel">
        <div className="panel-head">
          <div>
            <h2>Daftar Kasbon Karyawan</h2>
            <p>Kelola permohonan, status persetujuan, dan jadwal pemotongan kasbon</p>
          </div>

          <div className="table-actions">
            <SearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nama karyawan, keperluan..."
            />

            <FilterSelect
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'Semua', label: 'Semua Status' },
                { value: 'Menunggu Persetujuan', label: 'Menunggu Persetujuan' },
                { value: 'Disetujui', label: 'Disetujui' },
                { value: 'Lunas', label: 'Lunas' },
                { value: 'Ditolak', label: 'Ditolak' }
              ]}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="payroll-table">
            <thead>
              <tr>
                <th>NAMA KARYAWAN</th>
                <th>JUMLAH KASBON</th>
                <th>KEPERLUAN</th>
                <th>TANGGAL PENGAJUAN</th>
                <th>PERIODE PEMOTONGAN</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <EmptyState
                      icon={Receipt}
                      title="Tidak ada data kasbon ditemukan"
                      description="Belum ada pengajuan kasbon atau kata kunci pencarian Anda tidak cocok."
                      action={
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSearch('');
                            setStatusFilter('Semua');
                          }}
                        >
                          Reset Filter
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginated.map((adv) => (
                  <tr key={adv.id}>
                    <td>
                      <div>
                        <b style={{ color: 'var(--text-main)', fontSize: '14px' }}>
                          {adv.employeeName}
                        </b>
                        <small
                          style={{
                            display: 'block',
                            color: 'var(--text-muted)',
                            fontSize: '12px',
                            marginTop: '2px'
                          }}
                        >
                          {adv.department || 'Operasional'}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span
                        className="font-mono font-bold"
                        style={{ color: '#E11D48', fontSize: '13px' }}
                      >
                        {formatRupiah(adv.amount)}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-main)', maxWidth: '240px' }}>
                      <span title={adv.purpose}>{adv.purpose}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {formatDateIndo(adv.requestDate)}
                    </td>
                    <td>
                      <TypeBadge label={adv.deductionPeriod || 'September 2026'} />
                    </td>
                    <td>
                      <StatusBadge status={adv.status} />
                    </td>
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        {adv.status === 'Menunggu Persetujuan' ? (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              icon={Check}
                              onClick={() => handleAction(adv.id, 'approve')}
                            >
                              Setujui
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={X}
                              onClick={() => handleAction(adv.id, 'reject')}
                            >
                              Tolak
                            </Button>
                          </>
                        ) : (
                          <span
                            style={{
                              color: 'var(--text-muted)',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                          >
                            {adv.status === 'Disetujui'
                              ? 'Siap Potong'
                              : adv.status === 'Lunas'
                              ? 'Selesai'
                              : 'Tolak'}
                          </span>
                        )}
                      </div>
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

      {/* Modal: Ajukan Kasbon */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Pengajuan Kasbon Karyawan"
        subtitle="Pinjaman jangka pendek darurat yang dipotong penuh pada periode penggajian tertentu."
        badgeLabel="FORMULIR KASBON CEPAT"
        maxWidth="540px"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle2}
              onClick={handleSubmit}
            >
              Kirim Pengajuan Kasbon
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-main)',
                marginBottom: '6px'
              }}
            >
              Karyawan Pemohon <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <select
              className="smart-select"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              required
            >
              <option value="emp-1">Budi Santoso — Supervisor Operasional</option>
              <option value="emp-2">Andi Prasetyo — Lead Software Engineer</option>
              <option value="emp-3">Cindy Putri — Account Executive</option>
              <option value="emp-16">Panji Gumilang — Driver Operasional</option>
              <option value="emp-4">Dewi Lestari — Senior Accountant</option>
            </select>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px'
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  marginBottom: '6px'
                }}
              >
                Nominal Kasbon (Rp) <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="number"
                className="smart-input font-mono"
                required
                min="100000"
                step="50000"
                placeholder="Contoh: 500000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  marginBottom: '6px'
                }}
              >
                Periode Pemotongan Gaji <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                className="smart-select"
                value={form.deductionPeriod}
                onChange={(e) =>
                  setForm({ ...form, deductionPeriod: e.target.value })
                }
              >
                <option value="September 2026">Penggajian September 2026</option>
                <option value="Oktober 2026">Penggajian Oktober 2026</option>
                <option value="November 2026">Penggajian November 2026</option>
              </select>
            </div>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-main)',
                marginBottom: '6px'
              }}
            >
              Keperluan Mendesak <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              className="smart-input"
              rows="3"
              required
              placeholder="Sebutkan alasan atau keperluan penarikan kasbon..."
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              style={{ resize: 'vertical' }}
            />
            <small
              style={{
                display: 'block',
                color: 'var(--text-muted)',
                fontSize: '11px',
                marginTop: '4px'
              }}
            >
              Maksimal plafon kasbon adalah 50% dari gaji pokok bulanan karyawan.
            </small>
          </div>
        </form>
      </FormModal>
    </section>
  );
}
