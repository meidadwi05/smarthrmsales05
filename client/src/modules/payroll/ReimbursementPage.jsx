import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  FileCheck2,
  X,
  Check,
  Calendar,
  Image,
  Tag,
  Receipt,
  Wallet,
  Clock
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

export default function ReimbursementPage({
  API,
  activeRole,
  userRole,
  initialTab = 'all',
  onNavigate
}) {
  const currentRole = userRole || activeRole || 'hrd';
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState(
    initialTab === 'approved' ? 'Disetujui' : 'Semua'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [form, setForm] = useState({
    employeeId: 'emp-1',
    category: 'Transportasi',
    title: '',
    amount: '',
    transactionDate: new Date().toISOString().slice(0, 10),
    description: '',
    receiptUrl: 'struk_transaksi.jpg'
  });

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/payroll/reimbursements`);
      const data = await res.json();
      setClaims(data.reimbursements || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [API]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;

    try {
      const res = await fetch(`${API}/api/payroll/reimbursements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowModal(false);
        setForm({
          employeeId: 'emp-1',
          category: 'Transportasi',
          title: '',
          amount: '',
          transactionDate: new Date().toISOString().slice(0, 10),
          description: '',
          receiptUrl: 'struk_transaksi.jpg'
        });
        fetchClaims();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${API}/api/payroll/reimbursements/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) fetchClaims();
    } catch (err) {
      alert(err.message);
    }
  };

  // Metrics
  const totalAmount = claims.reduce((s, c) => s + (c.amount || 0), 0);
  const pendingCount = claims.filter((c) => c.status.includes('Menunggu')).length;
  const approvedCount = claims.filter(
    (c) => c.status.includes('Disetujui') || c.status === 'Dibayar'
  ).length;

  // Filter & Pagination
  const filtered = claims.filter((claim) => {
    const matchSearch =
      claim.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      claim.title?.toLowerCase().includes(search.toLowerCase()) ||
      claim.department?.toLowerCase().includes(search.toLowerCase()) ||
      claim.category?.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      categoryFilter === 'Semua' || claim.category === categoryFilter;

    const matchStatus =
      statusFilter === 'Semua' ||
      (statusFilter === 'Menunggu' && claim.status.includes('Menunggu')) ||
      claim.status === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <section className="module-page">
      <PageHeader
        breadcrumb="Home / Penggantian Biaya"
        sectionLabel="PENGGAJIAN & KEUANGAN"
        title="Penggantian Biaya (Reimbursement)"
        subtitle="Pengajuan dan verifikasi klaim pengeluaran dinas operasional karyawan untuk dicairkan via payroll atau transfer resmi."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowModal(true)}
          >
            Ajukan Penggantian Biaya
          </Button>
        }
      />

      {/* 4 Summary Metric Cards */}
      <MetricGrid columns={4}>
        <StatCard
          label="Total Klaim Diajukan"
          value={formatRupiah(totalAmount)}
          icon={FileCheck2}
          subtext={`${claims.length} Klaim Terdata`}
          trend={`${claims.length} Klaim`}
          trendColor="blue"
        />
        <StatCard
          label="Menunggu Verifikasi"
          value={`${pendingCount} Klaim`}
          icon={Clock}
          subtext="Perlu Persetujuan Bertingkat"
          trend="Perlu Tindakan"
          trendColor="orange"
        />
        <StatCard
          label="Disetujui / Siap Cair"
          value={`${approvedCount} Klaim`}
          icon={CheckCircle2}
          subtext="Lolos Audit & Bukti Valid"
          trend="Terverifikasi"
          trendColor="green"
        />
        <StatCard
          label="Metode Pencairan"
          value="Payroll & Transfer"
          icon={Wallet}
          subtext="Masuk ke Slip Bulan Berjalan"
          trend="Otomatis"
          trendColor="gray"
        />
      </MetricGrid>

      {/* Main Table Card */}
      <section className="panel team-panel">
        <div className="panel-head">
          <div>
            <h2>Daftar Klaim Penggantian Biaya</h2>
            <p>Kelola klaim pengeluaran, periksa bukti nota transaksi, dan validasi persetujuan</p>
          </div>

          <div className="table-actions">
            <SearchInput
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari karyawan, judul pengeluaran..."
            />

            <FilterSelect
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'Semua', label: 'Semua Kategori' },
                { value: 'Transportasi', label: 'Transportasi' },
                { value: 'Makan', label: 'Makan & Jamuan' },
                { value: 'Perjalanan Dinas', label: 'Perjalanan Dinas' },
                { value: 'Penginapan', label: 'Penginapan' },
                { value: 'Operasional', label: 'Operasional' }
              ]}
            />

            <FilterSelect
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'Semua', label: 'Semua Status' },
                { value: 'Menunggu', label: 'Menunggu Persetujuan' },
                { value: 'Disetujui', label: 'Disetujui' },
                { value: 'Dibayar', label: 'Sudah Dibayar' },
                { value: 'Ditolak', label: 'Ditolak' }
              ]}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="payroll-table">
            <thead>
              <tr>
                <th>KARYAWAN</th>
                <th>KATEGORI</th>
                <th>JUDUL TRANSAKSI</th>
                <th>TANGGAL</th>
                <th>NOMINAL</th>
                <th>METODE PENCAIRAN</th>
                <th>BUKTI</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <EmptyState
                      icon={ClipboardList}
                      title="Tidak ada klaim biaya ditemukan"
                      description="Belum ada pengajuan reimbursement atau hasil filter tidak menemukan data yang cocok."
                      action={
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSearch('');
                            setCategoryFilter('Semua');
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
                paginated.map((claim) => (
                  <tr key={claim.id}>
                    <td>
                      <div>
                        <b style={{ color: 'var(--text-main)', fontSize: '14px' }}>
                          {claim.employeeName}
                        </b>
                        <small
                          style={{
                            display: 'block',
                            color: 'var(--text-muted)',
                            fontSize: '12px',
                            marginTop: '2px'
                          }}
                        >
                          {claim.department || 'Operasional'}
                        </small>
                      </div>
                    </td>
                    <td>
                      <TypeBadge label={claim.category} />
                    </td>
                    <td>
                      <div style={{ maxWidth: '220px' }}>
                        <b
                          style={{
                            color: 'var(--text-main)',
                            fontSize: '13px',
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={claim.title}
                        >
                          {claim.title}
                        </b>
                        <small
                          style={{
                            color: 'var(--text-muted)',
                            fontSize: '11px',
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={claim.description}
                        >
                          {claim.description || '-'}
                        </small>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {formatDateIndo(claim.transactionDate)}
                    </td>
                    <td>
                      <span
                        className="font-mono font-bold"
                        style={{ color: '#2563EB', fontSize: '13px' }}
                      >
                        {formatRupiah(claim.amount)}
                      </span>
                    </td>
                    <td>
                      <TypeBadge label={claim.payoutMethod || 'Penggajian'} />
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Image}
                        onClick={() => setSelectedReceipt(claim)}
                      >
                        Lampiran
                      </Button>
                    </td>
                    <td>
                      <StatusBadge status={claim.status} />
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
                        {claim.status.includes('Menunggu') ? (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              icon={Check}
                              onClick={() => handleAction(claim.id, 'approve')}
                            >
                              Setujui
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={X}
                              onClick={() => handleAction(claim.id, 'reject')}
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
                            {claim.status.includes('Disetujui') ||
                            claim.status === 'Dibayar'
                              ? 'Selesai'
                              : 'Ditolak'}
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

      {/* Modal: Ajukan Reimbursement */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Pengajuan Penggantian Biaya"
        subtitle="Isi formulir pengeluaran dinas dan lampirkan bukti nota/struk transaksi yang sah."
        badgeLabel="FORMULIR KLAIM BIAYA"
        maxWidth="560px"
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
              Kirim Pengajuan Biaya
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
                <option value="emp-11">Kartika Sari — Senior Sales</option>
              </select>
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
                Kategori Pengeluaran <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                className="smart-select"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="Transportasi">Transportasi (Bensin, Tol, Parkir)</option>
                <option value="Makan">Makan & Jamuan Klien</option>
                <option value="Perjalanan Dinas">Perjalanan Dinas Luar Kota</option>
                <option value="Penginapan">Penginapan & Hotel</option>
                <option value="Operasional">Operasional Kerja & Tools</option>
                <option value="Lainnya">Lainnya</option>
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
              Judul Pengeluaran <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              className="smart-input"
              required
              placeholder="Contoh: Tiket Kereta & Hotel Kunjungan Prospek Surabaya"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
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
                Tanggal Transaksi Sesuai Struk <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="date"
                className="smart-input"
                required
                value={form.transactionDate}
                onChange={(e) =>
                  setForm({ ...form, transactionDate: e.target.value })
                }
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
                Nominal Penggantian (Rp) <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="number"
                className="smart-input font-mono"
                required
                min="1000"
                placeholder="Contoh: 350000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
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
              Keterangan & Rincian Agenda Kerja
            </label>
            <textarea
              className="smart-input"
              rows="3"
              placeholder="Jelaskan agenda kerja yang berkaitan dengan pengeluaran dinas ini..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>
        </form>
      </FormModal>

      {/* Modal: Lihat Bukti Transaksi */}
      {selectedReceipt && (
        <FormModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          title={selectedReceipt.title}
          subtitle={`${selectedReceipt.employeeName} • ${formatRupiah(selectedReceipt.amount)}`}
          badgeLabel="BUKTI TRANSAKSI VALID"
          maxWidth="500px"
          footer={
            <Button
              variant="primary"
              onClick={() => setSelectedReceipt(null)}
            >
              Tutup Lampiran
            </Button>
          }
        >
          <div
            style={{
              background: '#F8FAFC',
              border: '1px dashed #CBD5E1',
              borderRadius: '12px',
              padding: '24px',
              fontFamily: 'monospace'
            }}
          >
            <div
              style={{
                textAlign: 'center',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '14px',
                marginBottom: '16px'
              }}
            >
              <b
                style={{
                  display: 'block',
                  fontSize: '15px',
                  color: 'var(--text-main)',
                  letterSpacing: '0.05em'
                }}
              >
                STRUK TRANSAKSI RESMI
              </b>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Tanggal: {formatDateIndo(selectedReceipt.transactionDate)}
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gap: '10px',
                fontSize: '13px',
                color: 'var(--text-main)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Kategori:</span>
                <b>{selectedReceipt.category}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Bayar:</span>
                <b className="font-mono text-blue font-bold" style={{ fontSize: '15px' }}>
                  {formatRupiah(selectedReceipt.amount)}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Keterangan:</span>
                <span style={{ textAlign: 'right', maxWidth: '240px' }}>
                  {selectedReceipt.description || 'Sesuai agenda penugasan kerja perusahaan'}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px dashed #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: '#10B981',
                fontSize: '12px',
                fontWeight: '600'
              }}
            >
              <CheckCircle2 size={18} />
              <span>DIVERIFIKASI RESMI SMART HRM</span>
            </div>
          </div>
        </FormModal>
      )}
    </section>
  );
}
