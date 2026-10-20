import React, { useState, useEffect } from 'react';
import { Building2, Plus, Users, Layers, ArrowRight, RefreshCw } from 'lucide-react';
import {
  PageHeader,
  Button,
  TypeBadge,
  FormModal,
  EmptyState
} from './components/common/index.js';

export default function SalaryStructurePage({ API, onNavigate }) {
  const [structures, setStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'Bulanan',
    description: ''
  });

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/payroll/structures`);
      const data = await res.json();
      setStructures(data.structures || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, [API]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`${API}/api/payroll/structures`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ name: '', type: 'Bulanan', description: '' });
        fetchStructures();
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menyimpan struktur gaji');
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        breadcrumbs={['Home', 'Struktur Gaji']}
        eyebrow="PENGGAJIAN & KEUANGAN"
        title="Struktur Gaji"
        subtitle="Kelola struktur dan komponen penghasilan karyawan berdasarkan divisi, jabatan, dan skema kerja."
        actions={
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={loading}
              onClick={fetchStructures}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowModal(true)}
            >
              Tambah Struktur Gaji
            </Button>
          </>
        }
      />

      {loading ? (
        <section className="panel team-panel" style={{ padding: '40px', textAlign: 'center', color: '#8a97a9' }}>
          Memuat data struktur gaji...
        </section>
      ) : structures.length === 0 ? (
        <section className="panel team-panel">
          <EmptyState
            icon={Building2}
            title="Belum Ada Struktur Gaji"
            description="Tambahkan paket skema penggajian untuk mengelompokkan komponen penghasilan pegawai."
            action={
              <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowModal(true)}>
                Tambah Struktur Baru
              </Button>
            }
          />
        </section>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {structures.map((str) => (
            <div
              key={str.id}
              className="panel"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: '#2563eb',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    <Building2 size={20} />
                  </div>
                  <TypeBadge type={str.type || 'Bulanan'} />
                </div>

                <h3 style={{ font: '700 16px Manrope, sans-serif', color: 'var(--text-heading, #0f172a)', margin: '0 0 6px 0' }}>
                  {str.name}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', margin: '0 0 16px 0', lineHeight: 1.5, minHeight: '40px' }}>
                  {str.description || 'Skema komponen penghasilan resmi terdaftar.'}
                </p>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569'
                    }}
                  >
                    <Layers size={13} style={{ color: '#2563eb' }} />
                    <span>{str.componentCount || 8} Komponen</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569'
                    }}
                  >
                    <Users size={13} style={{ color: '#059669' }} />
                    <span>{str.employeeCount || 20} Karyawan</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-glass-subtle, #f1f5f9)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="ghost"
                  iconRight={ArrowRight}
                  onClick={() => onNavigate && onNavigate('Komponen Gaji')}
                >
                  Lihat Komponen Gaji
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah Struktur Gaji */}
      <FormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Tambah Struktur Gaji"
        subtitle="Buat kelompok skema penggajian untuk jabatan atau unit kerja tertentu"
        onSubmit={handleSave}
        submitLabel="Simpan Struktur Gaji"
        loading={saving}
      >
        <div style={{ display: 'grid', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Nama Struktur Gaji <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <input
              type="text"
              required
              className="smart-input"
              placeholder="Contoh: Struktur Gaji Tim IT & Engineer"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Jenis Penggajian <span style={{ color: '#e11d48' }}>*</span>
            </label>
            <select
              className="smart-select"
              style={{ width: '100%', height: '42px' }}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="Bulanan">Bulanan</option>
              <option value="Harian">Harian</option>
              <option value="Mingguan">Mingguan</option>
              <option value="Kustom">Kustom</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
              Deskripsi & Lingkup Penerapan
            </label>
            <textarea
              rows="3"
              className="smart-input"
              style={{ height: 'auto', padding: '10px 12px' }}
              placeholder="Jelaskan kriteria karyawan yang menggunakan struktur gaji ini..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>
      </FormModal>
    </>
  );
}
