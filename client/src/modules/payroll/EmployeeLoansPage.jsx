import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  Eye,
  FileText,
  AlertTriangle,
  X,
  Check,
  RefreshCw
} from 'lucide-react';
import { formatRupiah, formatDateIndo } from './utils/formatters.js';
import {
  PageHeader,
  Button,
  StatusBadge,
  TypeBadge,
  StatCard,
  MetricGrid,
  SearchInput,
  Pagination,
  EmptyState,
  FormModal
} from './components/common/index.js';

export default function EmployeeLoansPage({ API, initialTab = 'active', userRole, onNavigate }) {
  const [activeTab, setActiveTab] = useState(initialTab === 'requests' ? 'pengajuan' : 'aktif');
  const [loans, setLoans] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({
    totalActiveAmount: 85500000,
    activeLoanCount: 37,
    pendingApprovalCount: 8,
    monthlyInstallmentTotal: 12500000
  });

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLoanSchedule, setSelectedLoanSchedule] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form Pengajuan
  const [applyForm, setApplyForm] = useState({
    employeeId: 'emp-1',
    amount: 5000000,
    tenorMonths: 5,
    purpose: '',
    attachmentUrl: ''
  });

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/payroll/loans`);
      const data = await res.json();
      setLoans(data.loans || []);
      setRequests(data.requests || []);
      if (data.stats) setStats(data.stats);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [API]);

  // Simulasi Cicilan Otomatis
  const simulatedInstallment = Math.round(
    (Number(applyForm.amount) || 0) / (Number(applyForm.tenorMonths) || 1)
  );
  const simulatedTakeHomePay = 7250000;
  const maxSafeDeduction = Math.round(simulatedTakeHomePay * 0.35);
  const isOverSafeLimit = simulatedInstallment > maxSafeDeduction;

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyForm.purpose.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/payroll/loan-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applyForm)
      });
      if (res.ok) {
        setShowApplyModal(false);
        setApplyForm({
          employeeId: 'emp-1',
          amount: 5000000,
          tenorMonths: 5,
          purpose: '',
          attachmentUrl: ''
        });
        fetchLoans();
        alert('Pengajuan pinjaman berhasil dikirim dan menunggu persetujuan atasan serta HRD.');
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal mengajukan pinjaman');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      const res = await fetch(`${API}/api/payroll/loan-requests/${requestId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchLoans();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredLoans = loans.filter((l) =>
    (l.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.employeeCode || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.department || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredRequests = requests.filter((r) =>
    (r.employeeName || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.department || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader
        breadcrumbs={['Home', 'Pinjaman Karyawan']}
        eyebrow="PENGGAJIAN & KEUANGAN"
        title="Pinjaman Karyawan"
        subtitle="Pengelolaan pinjaman resmi kepegawaian, verifikasi pengajuan, dan penjadwalan cicilan otomatis."
        actions={
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={loading}
              onClick={fetchLoans}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowApplyModal(true)}
            >
              Ajukan Pinjaman Baru
            </Button>
          </>
        }
      />

      {/* 4 Stats Cards matching Data Karyawan */}
      <MetricGrid columns={4} style={{ marginBottom: '22px' }}>
        <StatCard
          title="Total Pinjaman Aktif"
          value={formatRupiah(stats.totalActiveAmount || 85500000)}
          subtitle="Akumulasi baki debet berjalan"
          icon={CreditCard}
          iconColor="#2563eb"
          iconBg="#eff6ff"
          trend="Lancar"
          trendType="positive"
        />
        <StatCard
          title="Jumlah Pinjaman Aktif"
          value={`${stats.activeLoanCount || 37} Pinjaman`}
          subtitle="Potongan terjadwal per bulan"
          icon={CheckCircle2}
          iconColor="#059669"
          iconBg="#ecfdf5"
          trend="Aktif"
          trendType="positive"
        />
        <StatCard
          title="Menunggu Persetujuan"
          value={`${requests.filter((r) => r.status === 'Menunggu Persetujuan').length} Pengajuan`}
          subtitle="Perlu tinjauan HR & Finance"
          icon={Clock}
          iconColor="#d97706"
          iconBg="#fffbeb"
          trend="Antrean"
          trendType="neutral"
        />
        <StatCard
          title="Cicilan Bulan Ini"
          value={formatRupiah(stats.monthlyInstallmentTotal || 12500000)}
          subtitle="Total potongan gaji berjalan"
          icon={Wallet}
          iconColor="#2563eb"
          iconBg="#eff6ff"
          trend="September 2026"
          trendType="positive"
        />
      </MetricGrid>

      {/* Main Panel matching Data Karyawan */}
      <section className="panel team-panel">
        <div className="panel-head">
          <div>
            <h2>Daftar Fasilitas Pinjaman Karyawan</h2>
            <p>Kelola data pinjaman berjalan, status cicilan, dan persetujuan pengajuan</p>
          </div>

          <div className="table-actions">
            {/* Tab switch pills */}
            <div
              style={{
                display: 'inline-flex',
                background: '#f1f5f9',
                borderRadius: '8px',
                padding: '3px',
                gap: '2px'
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('aktif')}
                style={{
                  border: 'none',
                  background: activeTab === 'aktif' ? '#ffffff' : 'transparent',
                  color: activeTab === 'aktif' ? '#2563eb' : '#64748b',
                  fontWeight: activeTab === 'aktif' ? 700 : 500,
                  fontSize: '11px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'aktif' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Pinjaman Aktif</span>
                <span
                  style={{
                    background: activeTab === 'aktif' ? '#eff6ff' : '#e2e8f0',
                    color: activeTab === 'aktif' ? '#2563eb' : '#64748b',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 700
                  }}
                >
                  {loans.filter((l) => l.status === 'Aktif').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('pengajuan')}
                style={{
                  border: 'none',
                  background: activeTab === 'pengajuan' ? '#ffffff' : 'transparent',
                  color: activeTab === 'pengajuan' ? '#d97706' : '#64748b',
                  fontWeight: activeTab === 'pengajuan' ? 700 : 500,
                  fontSize: '11px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'pengajuan' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Pengajuan</span>
                <span
                  style={{
                    background: activeTab === 'pengajuan' ? '#fffbeb' : '#e2e8f0',
                    color: activeTab === 'pengajuan' ? '#d97706' : '#64748b',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 700
                  }}
                >
                  {requests.length}
                </span>
              </button>
            </div>

            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari karyawan, ID..."
              width="200px"
            />
          </div>
        </div>

        {/* Tab 1: Pinjaman Aktif */}
        {activeTab === 'aktif' && (
          <div className="table-wrap">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>NAMA KARYAWAN</th>
                  <th>DEPARTEMEN</th>
                  <th>JUMLAH AWAL</th>
                  <th>TERBAYAR</th>
                  <th>SISA PINJAMAN</th>
                  <th>CICILAN / BULAN</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right', width: '140px' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#8a97a9' }}>
                      Memuat data pinjaman aktif...
                    </td>
                  </tr>
                ) : filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px' }}>
                      <EmptyState
                        icon={CreditCard}
                        title="Tidak Ada Pinjaman Aktif"
                        description="Belum ada data pinjaman karyawan aktif yang tercatat."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((loan) => (
                    <tr key={loan.id}>
                      <td>
                        <div>
                          <b style={{ color: 'var(--text-heading, #0f172a)', fontSize: '13px', display: 'block' }}>
                            {loan.employeeName}
                          </b>
                          <span className="emp-id-badge" style={{ marginTop: '2px' }}>
                            {loan.employeeCode}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{loan.department}</span>
                      </td>
                      <td className="time-cell" style={{ fontWeight: 600 }}>
                        {formatRupiah(loan.principalAmount)}
                      </td>
                      <td className="time-cell" style={{ color: '#059669', fontWeight: 600 }}>
                        {formatRupiah(loan.paidAmount)}
                      </td>
                      <td className="time-cell" style={{ color: '#e11d48', fontWeight: 700 }}>
                        {formatRupiah(loan.remainingAmount)}
                      </td>
                      <td className="time-cell" style={{ color: '#2563eb', fontWeight: 600 }}>
                        {formatRupiah(loan.monthlyInstallment)}
                      </td>
                      <td>
                        <StatusBadge status={loan.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Calendar}
                          onClick={() => setSelectedLoanSchedule(loan)}
                          title="Lihat rincian jadwal cicilan"
                        >
                          Jadwal Cicilan
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Pengajuan Menunggu */}
        {activeTab === 'pengajuan' && (
          <div className="table-wrap">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>KARYAWAN</th>
                  <th>NOMINAL PINJAMAN</th>
                  <th>TENOR</th>
                  <th>ESTIMASI CICILAN</th>
                  <th>KEPERLUAN</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right', width: '180px' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#8a97a9' }}>
                      Memuat data pengajuan pinjaman...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                      <EmptyState
                        icon={Clock}
                        title="Tidak Ada Pengajuan Menunggu"
                        description="Semua pengajuan pinjaman telah ditinjau dan diverifikasi."
                      />
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <div>
                          <b style={{ color: '#0f172a', fontSize: '13px', display: 'block' }}>
                            {req.employeeName}
                          </b>
                          <small style={{ color: '#64748b' }}>{req.department}</small>
                        </div>
                      </td>
                      <td className="time-cell" style={{ fontWeight: 700, color: '#0f172a' }}>
                        {formatRupiah(req.amount)}
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                          {req.tenorMonths} Bulan
                        </span>
                      </td>
                      <td className="time-cell" style={{ color: '#2563eb', fontWeight: 600 }}>
                        {formatRupiah(req.monthlyInstallment)} / bln
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: '#475569' }}>{req.purpose}</span>
                      </td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {req.status === 'Menunggu Persetujuan' ? (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={X}
                              onClick={() => handleAction(req.id, 'reject')}
                            >
                              Tolak
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              icon={Check}
                              onClick={() => handleAction(req.id, 'approve')}
                            >
                              Setujui
                            </Button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Selesai Ditinjau</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="table-footer">
          <span>
            Menampilkan <b>{activeTab === 'aktif' ? filteredLoans.length : filteredRequests.length}</b> data
          </span>
        </div>
      </section>

      {/* Modal: Form Pengajuan Pinjaman */}
      <FormModal
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        title="Pengajuan Pinjaman Karyawan"
        subtitle="Simulasi otomatis kalkulasi cicilan dan perbandingan terhadap batas take-home pay"
        onSubmit={handleApplySubmit}
        submitLabel="Kirim Pengajuan"
        loading={saving}
        maxWidth="560px"
      >
        <div style={{ display: 'grid', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Pilih Karyawan Pemohon <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <select
              className="smart-select"
              style={{ width: '100%', height: '42px' }}
              value={applyForm.employeeId}
              onChange={(e) => setApplyForm({ ...applyForm, employeeId: e.target.value })}
            >
              <option value="emp-1">Budi Santoso — Supervisor Operasional</option>
              <option value="emp-2">Andi Prasetyo — Lead Software Engineer</option>
              <option value="emp-3">Cindy Putri — Account Executive</option>
              <option value="emp-6">Fajar Andi — Frontend Developer</option>
              <option value="emp-12">Lukman Hakim — Teknisi Lapangan</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Jumlah Pinjaman (Rp) <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input
                type="number"
                required
                min="500000"
                step="500000"
                className="smart-input"
                value={applyForm.amount}
                onChange={(e) => setApplyForm({ ...applyForm, amount: Number(e.target.value) })}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Tenor Cicilan <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <select
                className="smart-select"
                style={{ width: '100%', height: '42px' }}
                value={applyForm.tenorMonths}
                onChange={(e) => setApplyForm({ ...applyForm, tenorMonths: Number(e.target.value) })}
              >
                <option value={3}>3 Bulan</option>
                <option value={5}>5 Bulan</option>
                <option value={6}>6 Bulan</option>
                <option value={10}>10 Bulan</option>
                <option value={12}>12 Bulan (Maksimal)</option>
              </select>
            </div>
          </div>

          {/* Affordability Calculator Box */}
          <div
            style={{
              background: isOverSafeLimit ? '#fff1f2' : '#f0fdf4',
              border: `1px solid ${isOverSafeLimit ? '#fecdd3' : '#bbf7d0'}`,
              borderRadius: '10px',
              padding: '14px',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#475569' }}>Estimasi Cicilan per Bulan:</span>
              <b style={{ fontFamily: '"JetBrains Mono", monospace', color: isOverSafeLimit ? '#e11d48' : '#059669' }}>
                {formatRupiah(simulatedInstallment)}
              </b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ color: '#475569' }}>Batas Aman Potongan (35% Gaji):</span>
              <span style={{ fontFamily: '"JetBrains Mono", monospace', color: '#64748b' }}>
                {formatRupiah(maxSafeDeduction)}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: isOverSafeLimit ? '#e11d48' : '#059669', fontWeight: 600, marginTop: '4px' }}>
              {isOverSafeLimit
                ? '⚠️ Cicilan melebihi batas rekomendasi 35% take-home pay!'
                : '✓ Kemampuan bayar aman sesuai aturan sistem'}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Keperluan Pinjaman <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <textarea
              required
              rows="3"
              className="smart-input"
              style={{ height: 'auto', padding: '10px 12px' }}
              placeholder="Contoh: Renovasi rumah mendesak atau keperluan pendidikan anak"
              value={applyForm.purpose}
              onChange={(e) => setApplyForm({ ...applyForm, purpose: e.target.value })}
            />
          </div>
        </div>
      </FormModal>

      {/* Modal: Jadwal Cicilan Pinjaman */}
      <FormModal
        isOpen={Boolean(selectedLoanSchedule)}
        onClose={() => setSelectedLoanSchedule(null)}
        title={`Jadwal Angsuran: ${selectedLoanSchedule?.employeeName || 'Karyawan'}`}
        subtitle={`Total pinjaman ${formatRupiah(selectedLoanSchedule?.principalAmount || 0)} • Tenor ${selectedLoanSchedule?.tenorMonths || 5} Bulan`}
        maxWidth="560px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px' }}>
            <span>Cicilan per Bulan:</span>
            <b style={{ color: '#2563eb' }}>{formatRupiah(selectedLoanSchedule?.monthlyInstallment || 0)}</b>
          </div>

          <div className="table-wrap" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table className="payroll-table">
              <thead>
                <tr>
                  <th style={{ padding: '10px 14px' }}>ANGSURAN KE</th>
                  <th style={{ padding: '10px 14px' }}>PERIODE POTONG</th>
                  <th style={{ padding: '10px 14px' }}>NOMINAL</th>
                  <th style={{ padding: '10px 14px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: selectedLoanSchedule?.tenorMonths || 5 }).map((_, i) => {
                  const isPaid = i < (selectedLoanSchedule?.paidMonths || 3);
                  return (
                    <tr key={i} style={{ height: '48px' }}>
                      <td style={{ padding: '10px 14px' }}>Bulan ke-{i + 1}</td>
                      <td style={{ padding: '10px 14px' }} className="time-cell">
                        {['Juli 2026', 'Agustus 2026', 'September 2026', 'Oktober 2026', 'November 2026'][i] || `Bulan +${i}`}
                      </td>
                      <td style={{ padding: '10px 14px' }} className="time-cell">
                        {formatRupiah(selectedLoanSchedule?.monthlyInstallment || 1000000)}
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <StatusBadge status={isPaid ? 'Sudah Dibayar' : 'Menunggu'} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </FormModal>
    </>
  );
}
