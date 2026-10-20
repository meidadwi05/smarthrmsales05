import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Lock,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldAlert,
  Wallet,
  Receipt
} from 'lucide-react';
import { formatRupiah } from '../utils/formatters.js';
import { Button } from './common/index.js';

export default function EditPayrollDrawer({
  isOpen,
  onClose,
  employeeData,
  onSave
}) {
  if (!isOpen || !employeeData) return null;

  const [form, setForm] = useState({
    basicSalary: 0,
    tunjanganJabatan: 0,
    tunjanganTransport: 0,
    tunjanganMakan: 0,
    overtime: 0,
    bonus: 0,
    insentif: 0,
    customEarnings: [],
    bpjsKesehatan: 0,
    bpjsKetenagakerjaan: 0,
    loanInstallment: 0,
    cashAdvance: 0,
    manualDeduction: 0,
    customDeductions: [],
    reason: ''
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (employeeData) {
      const e = employeeData.earnings || {};
      const d = employeeData.deductions || {};
      setForm({
        basicSalary: e.basicSalary || 0,
        tunjanganJabatan: e.tunjanganJabatan || 0,
        tunjanganTransport: e.tunjanganTransport || 0,
        tunjanganMakan: e.tunjanganMakan || 0,
        overtime: e.overtime || 0,
        bonus: e.bonusInsentif || 0,
        insentif: 0,
        customEarnings: [],
        bpjsKesehatan: d.bpjsKesehatan || 0,
        bpjsKetenagakerjaan: d.bpjsKetenagakerjaan || 0,
        loanInstallment: d.loanInstallment || 0,
        cashAdvance: d.cashAdvance || 0,
        manualDeduction: d.otherDeductions || 0,
        customDeductions: [],
        reason: ''
      });
      setError('');
    }
  }, [employeeData]);

  // Calculations
  const customEarningsTotal = form.customEarnings.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const totalEarnings =
    Number(form.basicSalary) +
    Number(form.tunjanganJabatan) +
    Number(form.tunjanganTransport) +
    Number(form.tunjanganMakan) +
    Number(form.overtime) +
    Number(form.bonus) +
    Number(form.insentif) +
    customEarningsTotal;

  const customDeductionsTotal = form.customDeductions.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const totalDeductions =
    Number(form.bpjsKesehatan) +
    Number(form.bpjsKetenagakerjaan) +
    Number(form.loanInstallment) +
    Number(form.cashAdvance) +
    Number(form.manualDeduction) +
    customDeductionsTotal;

  const netSalary = Math.max(0, totalEarnings - totalDeductions);

  const handleAddCustomEarning = () => {
    setForm((prev) => ({
      ...prev,
      customEarnings: [...prev.customEarnings, { id: Date.now(), name: 'Tunjangan Khusus', amount: 0 }]
    }));
  };

  const handleRemoveCustomEarning = (id) => {
    setForm((prev) => ({
      ...prev,
      customEarnings: prev.customEarnings.filter((c) => c.id !== id)
    }));
  };

  const handleAddCustomDeduction = () => {
    setForm((prev) => ({
      ...prev,
      customDeductions: [...prev.customDeductions, { id: Date.now(), name: 'Potongan Khusus', amount: 0 }]
    }));
  };

  const handleRemoveCustomDeduction = (id) => {
    setForm((prev) => ({
      ...prev,
      customDeductions: prev.customDeductions.filter((c) => c.id !== id)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.reason.trim()) {
      setError('Alasan perubahan wajib diisi untuk kepatuhan jejak audit.');
      return;
    }

    const updatedEarnings = {
      ...employeeData.earnings,
      basicSalary: Number(form.basicSalary),
      tunjanganJabatan: Number(form.tunjanganJabatan),
      tunjanganTransport: Number(form.tunjanganTransport),
      tunjanganMakan: Number(form.tunjanganMakan),
      overtime: Number(form.overtime),
      bonusInsentif: Number(form.bonus) + Number(form.insentif) + customEarningsTotal,
      total: totalEarnings
    };

    const updatedDeductions = {
      ...employeeData.deductions,
      bpjsKesehatan: Number(form.bpjsKesehatan),
      bpjsKetenagakerjaan: Number(form.bpjsKetenagakerjaan),
      loanInstallment: Number(form.loanInstallment),
      cashAdvance: Number(form.cashAdvance),
      otherDeductions: Number(form.manualDeduction) + customDeductionsTotal,
      total: totalDeductions
    };

    onSave({
      employeeId: employeeData.employeeId,
      earnings: updatedEarnings,
      deductions: updatedDeductions,
      netSalary,
      reason: form.reason.trim()
    });

    onClose();
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div
        className="drawer-container"
        style={{ width: '560px', maxWidth: '100vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="drawer-head">
          <div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#2563EB', letterSpacing: '0.05em' }}>
              PENYESUAIAN MANUAL KOMPONEN GAJI
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '2px 0 4px', color: 'var(--text-main)' }}>
              Edit Perhitungan Penggajian
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
              <b style={{ color: 'var(--text-main)' }}>{employeeData.name}</b>
              <span>•</span>
              <span className="font-mono">{employeeData.employeeCode}</span>
              <span>•</span>
              <span>{employeeData.position}</span>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} aria-label="Tutup Drawer">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <form onSubmit={handleSubmit} className="drawer-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#B91C1C', fontSize: '13px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION PENDAPATAN */}
          <div className="expanded-card">
            <div className="expanded-card-head" style={{ color: '#059669' }}>
              <span>PENDAPATAN (EARNINGS)</span>
              <span>STATUS KOMPONEN</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Gaji Pokok - Locked */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>Gaji Pokok</span>
                  <div className="font-mono font-bold" style={{ fontSize: '13px', marginTop: '2px' }}>
                    {formatRupiah(form.basicSalary)}
                  </div>
                </div>
                <span className="comp-badge-locked">
                  <Lock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                  Terkunci
                </span>
              </div>

              {/* Tunjangan Jabatan - Locked */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>Tunjangan Jabatan</span>
                  <div className="font-mono font-bold" style={{ fontSize: '13px', marginTop: '2px' }}>
                    {formatRupiah(form.tunjanganJabatan)}
                  </div>
                </div>
                <span className="comp-badge-locked">
                  <Lock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                  Terkunci
                </span>
              </div>

              {/* Transportasi - Locked */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>Transportasi</span>
                  <div className="font-mono font-bold" style={{ fontSize: '13px', marginTop: '2px' }}>
                    {formatRupiah(form.tunjanganTransport)}
                  </div>
                </div>
                <span className="comp-badge-locked">
                  <Lock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                  Terkunci
                </span>
              </div>

              {/* Lembur - Editable */}
              <div style={{ paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
                    Upah Lembur
                  </label>
                  <span className="comp-badge-editable">
                    <Edit3 size={10} style={{ display: 'inline', marginRight: '3px' }} />
                    Dapat diedit
                  </span>
                </div>
                <input
                  type="number"
                  className="smart-input font-mono"
                  min="0"
                  step="1000"
                  value={form.overtime}
                  onChange={(e) => setForm({ ...form, overtime: Number(e.target.value) || 0 })}
                />
              </div>

              {/* Bonus - Editable */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
                    Bonus Kinerja
                  </label>
                  <span className="comp-badge-editable">
                    <Edit3 size={10} style={{ display: 'inline', marginRight: '3px' }} />
                    Dapat diedit
                  </span>
                </div>
                <input
                  type="number"
                  className="smart-input font-mono"
                  min="0"
                  step="50000"
                  value={form.bonus}
                  onChange={(e) => setForm({ ...form, bonus: Number(e.target.value) || 0 })}
                />
              </div>

              {/* Insentif - Editable */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
                    Insentif Tambahan
                  </label>
                  <span className="comp-badge-editable">
                    <Edit3 size={10} style={{ display: 'inline', marginRight: '3px' }} />
                    Dapat diedit
                  </span>
                </div>
                <input
                  type="number"
                  className="smart-input font-mono"
                  min="0"
                  step="50000"
                  value={form.insentif}
                  onChange={(e) => setForm({ ...form, insentif: Number(e.target.value) || 0 })}
                />
              </div>

              {/* Custom Earnings */}
              {form.customEarnings.map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="smart-input"
                    placeholder="Nama Pendapatan"
                    value={item.name}
                    onChange={(e) => {
                      const updated = [...form.customEarnings];
                      updated[idx].name = e.target.value;
                      setForm({ ...form, customEarnings: updated });
                    }}
                  />
                  <input
                    type="number"
                    className="smart-input font-mono"
                    min="0"
                    placeholder="Nominal (Rp)"
                    value={item.amount || ''}
                    onChange={(e) => {
                      const updated = [...form.customEarnings];
                      updated[idx].amount = Number(e.target.value) || 0;
                      setForm({ ...form, customEarnings: updated });
                    }}
                  />
                  <button
                    type="button"
                    style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', width: '38px', height: '38px', borderRadius: '8px', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                    onClick={() => handleRemoveCustomEarning(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                icon={Plus}
                onClick={handleAddCustomEarning}
                style={{ justifySelf: 'start', marginTop: '4px' }}
              >
                + Tambah Pendapatan
              </Button>

              <div className="expanded-total-row" style={{ color: '#059669' }}>
                <span>TOTAL PENDAPATAN</span>
                <span className="font-mono">{formatRupiah(totalEarnings)}</span>
              </div>
            </div>
          </div>

          {/* SECTION POTONGAN */}
          <div className="expanded-card">
            <div className="expanded-card-head" style={{ color: '#E11D48' }}>
              <span>POTONGAN (DEDUCTIONS)</span>
              <span>STATUS KOMPONEN</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* BPJS Kesehatan & Ketenagakerjaan - Auto */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>BPJS Kesehatan & Ketenagakerjaan</span>
                  <div className="font-mono font-bold" style={{ fontSize: '13px', marginTop: '2px', color: '#E11D48' }}>
                    -{formatRupiah(Number(form.bpjsKesehatan) + Number(form.bpjsKetenagakerjaan))}
                  </div>
                </div>
                <span className="comp-badge-auto">Otomatis</span>
              </div>

              {/* Cicilan Pinjaman - Auto */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>Cicilan Pinjaman Karyawan</span>
                  <div className="font-mono font-bold" style={{ fontSize: '13px', marginTop: '2px', color: '#E11D48' }}>
                    -{formatRupiah(form.loanInstallment)}
                  </div>
                </div>
                <span className="comp-badge-auto">Otomatis</span>
              </div>

              {/* Kasbon - Auto */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>Kasbon Karyawan</span>
                  <div className="font-mono font-bold" style={{ fontSize: '13px', marginTop: '2px', color: '#E11D48' }}>
                    -{formatRupiah(form.cashAdvance)}
                  </div>
                </div>
                <span className="comp-badge-auto">Otomatis</span>
              </div>

              {/* Potongan Manual - Editable */}
              <div style={{ paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)' }}>
                    Potongan Manual / Penyesuaian
                  </label>
                  <span className="comp-badge-editable">
                    <Edit3 size={10} style={{ display: 'inline', marginRight: '3px' }} />
                    Dapat diedit
                  </span>
                </div>
                <input
                  type="number"
                  className="smart-input font-mono"
                  min="0"
                  step="5000"
                  value={form.manualDeduction}
                  onChange={(e) => setForm({ ...form, manualDeduction: Number(e.target.value) || 0 })}
                />
              </div>

              {/* Custom Deductions */}
              {form.customDeductions.map((item, idx) => (
                <div key={item.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="smart-input"
                    placeholder="Nama Potongan"
                    value={item.name}
                    onChange={(e) => {
                      const updated = [...form.customDeductions];
                      updated[idx].name = e.target.value;
                      setForm({ ...form, customDeductions: updated });
                    }}
                  />
                  <input
                    type="number"
                    className="smart-input font-mono"
                    min="0"
                    placeholder="Nominal (Rp)"
                    value={item.amount || ''}
                    onChange={(e) => {
                      const updated = [...form.customDeductions];
                      updated[idx].amount = Number(e.target.value) || 0;
                      setForm({ ...form, customDeductions: updated });
                    }}
                  />
                  <button
                    type="button"
                    style={{ background: '#FEE2E2', border: 'none', color: '#DC2626', width: '38px', height: '38px', borderRadius: '8px', cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0 }}
                    onClick={() => handleRemoveCustomDeduction(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                icon={Plus}
                onClick={handleAddCustomDeduction}
                style={{ justifySelf: 'start', marginTop: '4px' }}
              >
                + Tambah Potongan
              </Button>

              <div className="expanded-total-row" style={{ color: '#E11D48' }}>
                <span>TOTAL POTONGAN</span>
                <span className="font-mono">-{formatRupiah(totalDeductions)}</span>
              </div>
            </div>
          </div>

          {/* NET SALARY HIGHLIGHT */}
          <div className="expanded-net-box">
            <div>
              <span style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: '#1E40AF', textTransform: 'uppercase' }}>
                GAJI BERSIH (TAKE HOME PAY)
              </span>
              <div className="font-mono font-bold" style={{ fontSize: '24px', color: '#2563EB', marginTop: '4px' }}>
                {formatRupiah(netSalary)}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#475569', textAlign: 'right', maxWidth: '200px' }}>
              Dihitung otomatis: Total Pendapatan dikurangi Total Potongan.
            </div>
          </div>

          {/* ALASAN PERUBAHAN (AUDIT TRAIL) */}
          <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#B45309', fontWeight: '600', fontSize: '13px' }}>
              <ShieldAlert size={16} />
              <span>Alasan Perubahan (Wajib untuk Audit Trail) *</span>
            </div>
            <textarea
              className="smart-input"
              rows="3"
              required
              placeholder="Jelaskan alasan penyesuaian (contoh: Penyesuaian lembur sesuai form lembur fisik divisi operasional)..."
              value={form.reason}
              onChange={(e) => {
                setForm({ ...form, reason: e.target.value });
                if (error) setError('');
              }}
              style={{ resize: 'vertical' }}
            />
            <small style={{ display: 'block', fontSize: '11px', color: '#92400E', marginTop: '6px' }}>
              Setiap perubahan komponen manual akan dicatat dalam riwayat audit log beserta nama staf, waktu, dan alasan.
            </small>
          </div>

          {/* DRAWER FOOTER BUTTONS */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
            <Button variant="secondary" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              icon={CheckCircle2}
              onClick={handleSubmit}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
