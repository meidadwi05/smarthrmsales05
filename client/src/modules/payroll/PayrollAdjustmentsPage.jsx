import React, { useState, useEffect } from 'react';
import {
  Plus,
  ShieldAlert,
  CheckCircle2,
  History,
  X,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react';
import { formatRupiah, formatDateIndo } from './utils/formatters.js';
import {
  PageHeader,
  Button,
  SearchInput,
  FilterSelect,
  StatusBadge,
  TypeBadge,
  FormModal,
  EmptyState
} from './components/common/index.js';

export default function PayrollAdjustmentsPage({ API }) {
  const [adjustments, setAdjustments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Semua');

  const [form, setForm] = useState({
    employeeId: 'emp-1',
    targetPeriod: 'September 2026',
    referencePeriod: 'Agustus 2026',
    type: 'Pendapatan',
    amount: 500000,
    reason: ''
  });

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/api/payroll/adjustments`);
      const data = await res.json();
      setAdjustments(data.adjustments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdjustments();
  }, [API]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.reason.trim()) return;

    try {
      const res = await fetch(`${API}/api/payroll/adjustments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowModal(false);
        setForm({
          employeeId: 'emp-1',
          targetPeriod: 'September 2026',
          referencePeriod: 'Agustus 2026',
          type: 'Pendapatan',
          amount: 500000,
          reason: ''
        });
        fetchAdjustments();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filtered = adjustments.filter((adj) => {
    const matchSearch =
      adj.employeeName?.toLowerCase().includes(search.toLowerCase()) ||
      adj.reason?.toLowerCase().includes(search.toLowerCase()) ||
      adj.targetPeriod?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'Semua' || adj.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <section className="module-page">
      <PageHeader
        breadcrumb="Home / Penyesuaian Penggajian"
        sectionLabel="PENGGAJIAN & KEUANGAN"
        title="Penyesuaian Penggajian (Payroll Adjustment)"
        subtitle="Prinsip kepatuhan audit: Payroll yang sudah ditutup tidak boleh diubah secara diam-diam. Segala koreksi dialokasikan melalui penyesuaian periode berjalan."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowModal(true)}
          >
            Tambah Penyesuaian
          </Button>
        }
      />

      {/* Compliance Immutability Notice Banner */}
      <div
        className="panel"
        style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          marginBottom: '24px',
          borderRadius: '12px'
        }}
      >
        <ShieldAlert size={24} color="#2563EB" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '13px' }}>
          <b style={{ color: '#1E40AF', display: 'block', marginBottom: '2px' }}>
            Aturan Kepatuhan Payroll: Data Final Tidak Boleh Diubah Langsung (Immutability)
          </b>
          <p style={{ margin: 0, color: '#3B82F6', lineHeight: '1.4' }}>
            Payroll yang berstatus <i>Disetujui</i>, <i>Sudah Dibayar</i>, atau <i>Ditutup</i> terkunci secara permanen.
            Koreksi seperti kelebihan/kekurangan jam lembur bulan lalu dialokasikan secara transparan pada periode berjalan.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <section className="panel team-panel">
        <div className="panel-head">
          <div>
            <h2>Riwayat Penyesuaian Gaji</h2>
            <p>Daftar penambahan atau pengurangan kompensasi karyawan</p>
          </div>

          <div className="table-actions">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari karyawan, alasan..."
            />

            <FilterSelect
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'Semua', label: 'Semua Jenis' },
                { value: 'Pendapatan', label: 'Penambahan (+)' },
                { value: 'Potongan', label: 'Pemotongan (-)' }
              ]}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="payroll-table">
            <thead>
              <tr>
                <th>KARYAWAN</th>
                <th>PERIODE TARGET</th>
                <th>PERIODE RUJUKAN</th>
                <th>JENIS PENYESUAIAN</th>
                <th>NOMINAL KOREKSI</th>
                <th>ALASAN RESMI KOREKSI</th>
                <th>DIBUAT OLEH</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8">
                    <EmptyState
                      icon={AlertCircle}
                      title="Tidak ada penyesuaian gaji ditemukan"
                      description="Belum ada transaksi penyesuaian atau pencarian tidak sesuai."
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((adj) => (
                  <tr key={adj.id}>
                    <td>
                      <b style={{ color: 'var(--text-main)', fontSize: '14px' }}>
                        {adj.employeeName}
                      </b>
                    </td>
                    <td>
                      <TypeBadge label={adj.targetPeriod} />
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                      {adj.referencePeriod}
                    </td>
                    <td>
                      <TypeBadge
                        label={
                          adj.type === 'Pendapatan'
                            ? '+ Penambah (+)'
                            : '- Pengurang (-)'
                        }
                        variant={adj.type === 'Pendapatan' ? 'green' : 'danger'}
                      />
                    </td>
                    <td>
                      <span
                        className="font-mono font-bold"
                        style={{
                          color: adj.type === 'Pendapatan' ? '#059669' : '#E11D48',
                          fontSize: '13px'
                        }}
                      >
                        {adj.type === 'Pendapatan' ? '+' : '-'}
                        {formatRupiah(adj.amount)}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-main)', maxWidth: '240px' }}>
                      <span title={adj.reason}>{adj.reason}</span>
                    </td>
                    <td>
                      <small style={{ color: 'var(--text-muted)' }}>
                        {adj.createdBy}
                      </small>
                    </td>
                    <td>
                      <StatusBadge status={adj.status || 'Disetujui'} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Penyesuaian Penggajian */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tambah Penyesuaian Penggajian"
        subtitle="Koreksi kompensasi untuk periode penggajian berjalan tanpa mengubah arsip historis yang telah ditutup."
        badgeLabel="FORMULIR PENYESUAIAN RESMI"
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
              Simpan Penyesuaian Gaji
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
              Karyawan Penerima Penyesuaian <span style={{ color: '#EF4444' }}>*</span>
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
              <option value="emp-5">Eko Prasetyo — DevOps Engineer</option>
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
                Jenis Penyesuaian <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                className="smart-select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="Pendapatan">Penambahan Pendapatan (+)</option>
                <option value="Potongan">Pemotongan Tambahan (-)</option>
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
                Nominal Penyesuaian (Rp) <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <input
                type="number"
                className="smart-input font-mono"
                required
                min="1000"
                placeholder="Contoh: 500000"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
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
                Periode Target Aplikasi <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <select
                className="smart-select"
                value={form.targetPeriod}
                onChange={(e) =>
                  setForm({ ...form, targetPeriod: e.target.value })
                }
              >
                <option value="September 2026">Penggajian September 2026</option>
                <option value="Oktober 2026">Penggajian Oktober 2026</option>
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
                Periode Rujukan Historis
              </label>
              <input
                type="text"
                className="smart-input"
                placeholder="Contoh: Lembur Agustus 2026"
                value={form.referencePeriod}
                onChange={(e) =>
                  setForm({ ...form, referencePeriod: e.target.value })
                }
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
              Alasan Resmi Penyesuaian <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <textarea
              className="smart-input"
              rows="3"
              required
              placeholder="Jelaskan dasar perhitungan koreksi, nomor tiket lembur, atau verifikasi atasan..."
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>
        </form>
      </FormModal>
    </section>
  );
}
