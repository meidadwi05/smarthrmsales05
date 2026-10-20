import React, { useState, useEffect } from 'react';
import { Plus, Calculator, Check, X, ShieldAlert, Sparkles, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { formatRupiah } from './utils/formatters.js';
import {
  PageHeader,
  Button,
  StatusBadge,
  TypeBadge,
  FormModal,
  SearchInput,
  Pagination,
  EmptyState
} from './components/common/index.js';

export default function SalaryComponentsPage({ API }) {
  const [components, setComponents] = useState([]);
  const [activeTab, setActiveTab] = useState('Pendapatan');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    code: '',
    type: 'Pendapatan',
    method: 'Nominal Tetap',
    defaultAmount: '',
    formula: ''
  });

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/payroll/components`);
      const data = await res.json();
      setComponents(data.components || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, [API]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code) return;

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/payroll/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowModal(false);
        setForm({
          name: '',
          code: '',
          type: activeTab,
          method: 'Nominal Tetap',
          defaultAmount: '',
          formula: ''
        });
        fetchComponents();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menyimpan komponen gaji');
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredComponents = components
    .filter((c) => activeTab === 'Semua' || c.type === activeTab)
    .filter(
      (c) =>
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.code || '').toLowerCase().includes(search.toLowerCase())
    );

  return (
    <>
      <PageHeader
        breadcrumbs={['Home', 'Komponen Gaji']}
        eyebrow="PENGGAJIAN & KEUANGAN"
        title="Komponen Gaji"
        subtitle="Daftar seluruh item pendapatan (allowances) dan potongan (deductions) serta formula perhitungannya."
        actions={
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={loading}
              onClick={fetchComponents}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setForm({ ...form, type: activeTab === 'Semua' ? 'Pendapatan' : activeTab });
                setShowModal(true);
              }}
            >
              Tambah Komponen
            </Button>
          </>
        }
      />

      <section className="panel team-panel">
        <div className="panel-head">
          <div>
            <h2>Daftar Komponen Gaji</h2>
            <p>Master komponen tunjangan, upah, potongan jaminan, dan pinjaman</p>
          </div>

          <div className="table-actions">
            {/* Tab Pill Buttons */}
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
                onClick={() => setActiveTab('Pendapatan')}
                style={{
                  border: 'none',
                  background: activeTab === 'Pendapatan' ? '#ffffff' : 'transparent',
                  color: activeTab === 'Pendapatan' ? '#059669' : '#64748b',
                  fontWeight: activeTab === 'Pendapatan' ? 700 : 500,
                  fontSize: '11px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'Pendapatan' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Pendapatan</span>
                <span
                  style={{
                    background: activeTab === 'Pendapatan' ? '#ecfdf5' : '#e2e8f0',
                    color: activeTab === 'Pendapatan' ? '#059669' : '#64748b',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 700
                  }}
                >
                  {components.filter((c) => c.type === 'Pendapatan').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('Potongan')}
                style={{
                  border: 'none',
                  background: activeTab === 'Potongan' ? '#ffffff' : 'transparent',
                  color: activeTab === 'Potongan' ? '#e11d48' : '#64748b',
                  fontWeight: activeTab === 'Potongan' ? 700 : 500,
                  fontSize: '11px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: activeTab === 'Potongan' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Potongan</span>
                <span
                  style={{
                    background: activeTab === 'Potongan' ? '#fff1f2' : '#e2e8f0',
                    color: activeTab === 'Potongan' ? '#e11d48' : '#64748b',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 700
                  }}
                >
                  {components.filter((c) => c.type === 'Potongan').length}
                </span>
              </button>
            </div>

            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Cari komponen..."
              width="200px"
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="payroll-table">
            <thead>
              <tr>
                <th>NAMA KOMPONEN</th>
                <th>KODE</th>
                <th>JENIS</th>
                <th>METODE</th>
                <th>NILAI</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right', width: '100px' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: '#8a97a9' }}>
                    Memuat data komponen gaji...
                  </td>
                </tr>
              ) : filteredComponents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                    <EmptyState
                      icon={Calculator}
                      title="Tidak Ada Komponen Gaji"
                      description={`Belum ada komponen gaji jenis ${activeTab} yang sesuai dengan filter.`}
                    />
                  </td>
                </tr>
              ) : (
                filteredComponents.map((comp) => (
                  <tr key={comp.id}>
                    <td>
                      <div>
                        <b style={{ color: 'var(--text-heading, #0f172a)', fontSize: '13px', display: 'block' }}>
                          {comp.name}
                        </b>
                        {comp.formula && (
                          <small style={{ fontSize: '11px', color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>
                            {comp.formula}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="emp-id-badge">{comp.code}</span>
                    </td>
                    <td>
                      <TypeBadge type={comp.type} />
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                        {comp.method}
                      </span>
                    </td>
                    <td>
                      <b style={{ fontFamily: '"JetBrains Mono", monospace', color: comp.type === 'Pendapatan' ? '#059669' : '#e11d48' }}>
                        {comp.defaultAmount ? formatRupiah(comp.defaultAmount) : 'Sesuai Formula'}
                      </b>
                    </td>
                    <td>
                      <StatusBadge status={comp.isTaxable !== false ? 'Aktif' : 'Bukan Objek'} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <Button
                          variant="icon"
                          title="Edit Komponen"
                          onClick={() => {
                            setForm({
                              name: comp.name,
                              code: comp.code,
                              type: comp.type,
                              method: comp.method,
                              defaultAmount: comp.defaultAmount || '',
                              formula: comp.formula || ''
                            });
                            setShowModal(true);
                          }}
                        >
                          <Pencil size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <span>Menampilkan <b>{filteredComponents.length}</b> komponen {activeTab.toLowerCase()}</span>
        </div>
      </section>

      {/* Modal Tambah / Edit Komponen Gaji */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`Tambah Komponen ${form.type}`}
        subtitle="Tentukan parameter perhitungan dan rumus kalkulasi otomatis"
        onSubmit={handleSave}
        submitLabel="Simpan Komponen"
        loading={saving}
      >
        <div style={{ display: 'grid', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Jenis Komponen <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <select
                className="smart-select"
                style={{ width: '100%', height: '42px' }}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                <option value="Pendapatan">Pendapatan (Penambah)</option>
                <option value="Potongan">Potongan (Pengurang)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Kode Komponen <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <input
                type="text"
                required
                className="smart-input"
                placeholder="Contoh: TJ-05"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Nama Komponen Gaji <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <input
              type="text"
              required
              className="smart-input"
              placeholder="Contoh: Tunjangan Kehadiran Penuh"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Metode Perhitungan <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <select
                className="smart-select"
                style={{ width: '100%', height: '42px' }}
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
              >
                <option value="Nominal Tetap">Nominal Tetap (Fixed Amount)</option>
                <option value="Per Hari">Per Hari (Harian Hadir)</option>
                <option value="Per Jam">Per Jam (Jam Kerja/Lembur)</option>
                <option value="Persentase">Persentase (%) dari Gaji Pokok</option>
                <option value="Rumus">Rumus Kustom</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Nilai Standar (Rp)
              </label>
              <input
                type="number"
                className="smart-input"
                placeholder="0"
                value={form.defaultAmount}
                onChange={(e) => setForm({ ...form, defaultAmount: e.target.value })}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', margin: 0 }}>
                Rumus / Ekspresi Perhitungan
              </label>
              <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> Bantuan Rumus
              </span>
            </div>
            <input
              type="text"
              className="smart-input"
              placeholder="Contoh: Rp 50.000 × Jumlah Hari Hadir"
              value={form.formula}
              onChange={(e) => setForm({ ...form, formula: e.target.value })}
            />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setForm({ ...form, formula: 'Rp 50.000 × Jumlah Hari Hadir' })}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#475569', cursor: 'pointer' }}
              >
                + Rp 50.000 × Hari Hadir
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, formula: 'Jam Lembur × (Gaji Pokok / 173) × 1.5' })}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#475569', cursor: 'pointer' }}
              >
                + Lembur 1/173
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, formula: '1% × Gaji Pokok' })}
                style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', color: '#475569', cursor: 'pointer' }}
              >
                + BPJS 1%
              </button>
            </div>
          </div>
        </div>
      </FormModal>
    </>
  );
}
