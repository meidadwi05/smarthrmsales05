import React, { useState, useEffect } from 'react';
import { ShieldCheck, Save, CheckCircle2, Sliders, HelpCircle, RefreshCw } from 'lucide-react';
import {
  PageHeader,
  Button
} from './components/common/index.js';

export default function PayrollRulesPage({ API }) {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchRules = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/payroll/rules`);
      const data = await r.json();
      setRules(data.rules || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [API]);

  const handleChange = (key, val) => {
    setRules((prev) =>
      prev.map((r) => (r.key === key ? { ...r, value: val } : r))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/payroll/rules`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menyimpan aturan penggajian');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        breadcrumbs={['Home', 'Aturan Penggajian']}
        eyebrow="PENGGAJIAN & KEUANGAN"
        title="Aturan Penggajian & Pinjaman"
        subtitle="Konfigurasi batasan plafon pinjaman, masa kerja minimum, batasan cicilan gaji, dan parameter operasional."
        actions={
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={loading}
              onClick={fetchRules}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              icon={saved ? CheckCircle2 : Save}
              loading={saving}
              onClick={handleSave}
            >
              {saved ? 'Tersimpan!' : 'Simpan Pengaturan'}
            </Button>
          </>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
        {/* Loan Policy Rules */}
        <section className="panel team-panel" style={{ margin: 0 }}>
          <div className="panel-head" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <h2>Kebijakan Pinjaman Karyawan</h2>
              <p>Batasan kelayakan dan plafon pinjaman dana perusahaan</p>
            </div>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>
                Masa Kerja Minimal Pengajuan
              </label>
              <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                Syarat lama masa kerja sebelum karyawan berhak mengajukan pinjaman resmi
              </span>
              <input
                type="text"
                className="smart-input"
                value={rules.find((r) => r.key === 'loan_min_tenure')?.value || '6 bulan'}
                onChange={(e) => handleChange('loan_min_tenure', e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>
                Maksimal Plafon Pinjaman
              </label>
              <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                Kelipatan pengali terhadap gaji pokok bulanan karyawan
              </span>
              <input
                type="text"
                className="smart-input"
                value={rules.find((r) => r.key === 'loan_max_multiplier')?.value || '3 × Gaji Pokok'}
                onChange={(e) => handleChange('loan_max_multiplier', e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>
                Maksimal Tenor Cicilan
              </label>
              <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                Batas maksimal jangka waktu angsuran pengembalian dana
              </span>
              <input
                type="text"
                className="smart-input"
                value={rules.find((r) => r.key === 'loan_max_tenor')?.value || '12 bulan'}
                onChange={(e) => handleChange('loan_max_tenor', e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>
                Batas Maksimal Potongan Cicilan per Bulan
              </label>
              <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                Persentase maksimal take-home pay agar keuangan karyawan tetap sehat
              </span>
              <input
                type="text"
                className="smart-input"
                value={rules.find((r) => r.key === 'loan_max_deduction_pct')?.value || '35%'}
                onChange={(e) => handleChange('loan_max_deduction_pct', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Operational & Overtime Rules */}
        <section className="panel team-panel" style={{ margin: 0 }}>
          <div className="panel-head" style={{ borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <h2>Kebijakan Operasional Penggajian</h2>
              <p>Jadwal tutup buku, pembagi upah lembur Depnaker, dan tanggal transfer</p>
            </div>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>
                Hari Tutup Data Kehadiran (Cut-Off)
              </label>
              <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                Batas akhir penarikan log absensi dan pengajuan lembur bulanan
              </span>
              <input
                type="text"
                className="smart-input"
                value={rules.find((r) => r.key === 'payroll_cutoff_day')?.value || 'Tanggal 25'}
                onChange={(e) => handleChange('payroll_cutoff_day', e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>
                Hari Pembayaran Gaji (Pay Day)
              </label>
              <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                Jadwal pelaksanaan transfer bank serentak kepada seluruh karyawan
              </span>
              <input
                type="text"
                className="smart-input"
                value={rules.find((r) => r.key === 'payroll_payment_day')?.value || 'Tanggal 30'}
                onChange={(e) => handleChange('payroll_payment_day', e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>
                Faktor Pembagi Upah Lembur per Jam
              </label>
              <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                Peraturan Kementerian Ketenagakerjaan RI (1/173 × Gaji Pokok)
              </span>
              <input
                type="text"
                className="smart-input"
                value={rules.find((r) => r.key === 'overtime_base_divisor')?.value || '173 jam'}
                onChange={(e) => handleChange('overtime_base_divisor', e.target.value)}
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
