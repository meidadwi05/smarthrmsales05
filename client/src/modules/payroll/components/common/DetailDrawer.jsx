import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Edit3,
  Check,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { formatRupiah } from '../../utils/formatters.js';
import Button from './Button.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function DetailDrawer({
  isOpen,
  onClose,
  item,
  periodId,
  API,
  onOpenPayslip,
  onSaveSuccess
}) {
  if (!isOpen || !item) return null;

  // Initial values extraction
  const initialData = useMemo(() => {
    const e = item.earnings || {};
    const d = item.deductions || {};
    return {
      basicSalary: Number(e.basicSalary) || 6000000,
      tunjanganJabatan: Number(e.tunjanganJabatan) || 750000,
      transportasi: Number(e.tunjanganTransport) || 500000,
      lembur: Number(e.overtime) || 624000,
      bonus: Number(e.bonus) || 0,
      insentif: Number(e.insentif) || 0,
      bpjsKesehatan: Number(d.bpjsKesehatan) || 150000,
      bpjsKetenagakerjaan: Number(d.bpjsKetenagakerjaan) || 90000,
      cicilanPinjaman: Number(d.loanInstallment) || 1000000,
      kasbon: Number(d.cashAdvance) || 500000,
      pajak: Number(d.tax || d.pph21) || 0,
      potonganLainnya: Number(d.otherDeductions) || 0
    };
  }, [item]);

  // Form State
  const [form, setForm] = useState(initialData);

  // Editing component state (which field is currently being edited with inline [Edit] button)
  const [editingKey, setEditingKey] = useState(null);
  const [tempValue, setTempValue] = useState('');

  // Unsaved changes tracking
  const hasChanges = useMemo(() => {
    return Object.keys(initialData).some((k) => initialData[k] !== form[k]);
  }, [initialData, form]);

  // Audit Trail History State
  const [auditHistory, setAuditHistory] = useState([
    {
      id: 'aud-1',
      timestamp: '29 Sep 2026 14:21',
      actor: 'Meida — HRD',
      field: 'Tunjangan Jabatan',
      before: 500000,
      after: 750000
    },
    {
      id: 'aud-2',
      timestamp: '29 Sep 2026 14:24',
      actor: 'Meida — HRD',
      field: 'Upah Lembur',
      before: 500000,
      after: 624000
    }
  ]);

  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    setForm(initialData);
    setEditingKey(null);
    setSaveSuccessMsg('');
  }, [initialData]);

  // Calculations
  const totalEarnings =
    Number(form.basicSalary) +
    Number(form.tunjanganJabatan) +
    Number(form.transportasi) +
    Number(form.lembur) +
    Number(form.bonus) +
    Number(form.insentif);

  const totalDeductions =
    Number(form.bpjsKesehatan) +
    Number(form.bpjsKetenagakerjaan) +
    Number(form.cicilanPinjaman) +
    Number(form.kasbon) +
    Number(form.pajak) +
    Number(form.potonganLainnya);

  const netSalary = Math.max(0, totalEarnings - totalDeductions);

  // Start editing a field
  const handleStartEdit = (key, currentVal) => {
    setEditingKey(key);
    setTempValue(String(currentVal));
  };

  // Save inline edit
  const handleApplyInlineEdit = (key) => {
    const num = Math.max(0, Number(tempValue) || 0);
    setForm((prev) => ({
      ...prev,
      [key]: num
    }));
    setEditingKey(null);
  };

  // Cancel inline edit
  const handleCancelInlineEdit = () => {
    setEditingKey(null);
    setTempValue('');
  };

  // Reset to original
  const handleResetAll = () => {
    setForm(initialData);
    setEditingKey(null);
  };

  // Save all changes & record to audit trail
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Create new audit records for modified fields
      const newAuditEntries = [];
      const fieldNames = {
        basicSalary: 'Gaji Pokok',
        tunjanganJabatan: 'Tunjangan Jabatan',
        transportasi: 'Transportasi',
        lembur: 'Upah Lembur',
        bonus: 'Bonus',
        insentif: 'Insentif',
        bpjsKesehatan: 'BPJS Kesehatan',
        bpjsKetenagakerjaan: 'BPJS Ketenagakerjaan',
        cicilanPinjaman: 'Cicilan Pinjaman',
        kasbon: 'Kasbon',
        pajak: 'Pajak PPh 21',
        potonganLainnya: 'Potongan Lainnya'
      };

      Object.keys(form).forEach((k) => {
        if (form[k] !== initialData[k]) {
          newAuditEntries.unshift({
            id: `aud-${Date.now()}-${k}`,
            timestamp: new Date().toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            actor: 'Meida — HRD',
            field: fieldNames[k] || k,
            before: initialData[k],
            after: form[k]
          });
        }
      });

      if (newAuditEntries.length > 0) {
        setAuditHistory((prev) => [...newAuditEntries, ...prev]);
      }

      // If API provided, sync to server
      if (API && periodId && item.employeeId) {
        await fetch(`${API}/api/payroll/process/item/${periodId}/${item.employeeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            earnings: {
              basicSalary: form.basicSalary,
              tunjanganJabatan: form.tunjanganJabatan,
              tunjanganTransport: form.transportasi,
              overtime: form.lembur,
              bonusInsentif: form.bonus + form.insentif,
              total: totalEarnings
            },
            deductions: {
              bpjsKesehatan: form.bpjsKesehatan,
              bpjsKetenagakerjaan: form.bpjsKetenagakerjaan,
              loanInstallment: form.cicilanPinjaman,
              cashAdvance: form.kasbon,
              tax: form.pajak,
              otherDeductions: form.potonganLainnya,
              total: totalDeductions
            },
            netSalary,
            employeeName: item.name,
            actorName: 'Meida — HRD',
            reason: 'Penyesuaian komponen gaji oleh HR'
          })
        });
      }

      if (onSaveSuccess) {
        onSaveSuccess({
          employeeId: item.employeeId,
          earnings: {
            basicSalary: form.basicSalary,
            tunjanganJabatan: form.tunjanganJabatan,
            tunjanganTransport: form.transportasi,
            overtime: form.lembur,
            bonus: form.bonus,
            insentif: form.insentif,
            total: totalEarnings
          },
          deductions: {
            bpjsKesehatan: form.bpjsKesehatan,
            bpjsKetenagakerjaan: form.bpjsKetenagakerjaan,
            loanInstallment: form.cicilanPinjaman,
            cashAdvance: form.kasbon,
            tax: form.pajak,
            otherDeductions: form.potonganLainnya,
            total: totalDeductions
          },
          netSalary
        });
      }

      setSaveSuccessMsg('Perubahan komponen berhasil disimpan!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error saving component changes:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="drawer-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'drawerFadeIn 0.2s ease-out'
      }}
    >
      <div
        className="drawer-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '520px',
          maxWidth: '100vw',
          height: '100vh',
          background: '#ffffff',
          borderLeft: '1px solid #e2e8f0',
          boxShadow: '-10px 0 35px rgba(15, 23, 42, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* ===================================================================== */}
        {/* DRAWER HEADER (STICKY)                                                */}
        {/* ===================================================================== */}
        <div
          className="drawer-head"
          style={{
            padding: '18px 24px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 800,
                color: '#0f172a'
              }}
            >
              Detail Penggajian
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
              Rincian komponen penghasilan, potongan, dan kalkulasi take home pay
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Drawer"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              border: 'none',
              background: '#f1f5f9',
              color: '#64748b',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ===================================================================== */}
        {/* DRAWER BODY (SCROLLABLE)                                              */}
        {/* ===================================================================== */}
        <div
          className="drawer-body"
          style={{
            padding: '20px 24px',
            overflowY: 'auto',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          {/* Card Info Karyawan */}
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 700,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                {item.name?.charAt(0) || 'K'}
              </div>
              <div>
                <b style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>
                  {item.name || 'Budi Santoso'}
                </b>
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontSize: '11px',
                    color: '#64748b',
                    background: '#e2e8f0',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginTop: '2px'
                  }}
                >
                  {item.employeeCode || item.code || 'EMP-00123'}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block' }}>
                {item.position || 'Supervisor Operasional'}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {item.department || item.division || 'Operasional'}
              </span>
            </div>
          </div>

          {/* Banner Status Notifikasi "Perubahan belum disimpan" */}
          {hasChanges && (
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} color="#d97706" />
                <span style={{ fontSize: '12px', color: '#b45309', fontWeight: 600 }}>
                  Perubahan belum disimpan
                </span>
              </div>
              <button
                type="button"
                onClick={handleResetAll}
                style={{
                  fontSize: '11px',
                  color: '#b45309',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Reset
              </button>
            </div>
          )}

          {saveSuccessMsg && (
            <div
              style={{
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#047857',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <CheckCircle2 size={16} color="#059669" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* ===================================================================== */}
          {/* SECTION PENDAPATAN                                                    */}
          {/* ===================================================================== */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 18px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '10px',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '12px'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#059669', letterSpacing: '0.04em' }}>
                PENDAPATAN
              </span>
              <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                KREDIT (+)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Komponen: Gaji Pokok */}
              <ComponentRow
                label="Gaji Pokok"
                fieldKey="basicSalary"
                value={form.basicSalary}
                editingKey={editingKey}
                tempValue={tempValue}
                onStartEdit={handleStartEdit}
                onApplyEdit={handleApplyInlineEdit}
                onCancelEdit={handleCancelInlineEdit}
                onChangeTempValue={setTempValue}
              />

              {/* Komponen: Tunjangan Jabatan */}
              <ComponentRow
                label="Tunjangan Jabatan"
                fieldKey="tunjanganJabatan"
                value={form.tunjanganJabatan}
                editingKey={editingKey}
                tempValue={tempValue}
                onStartEdit={handleStartEdit}
                onApplyEdit={handleApplyInlineEdit}
                onCancelEdit={handleCancelInlineEdit}
                onChangeTempValue={setTempValue}
              />

              {/* Komponen: Transportasi */}
              <ComponentRow
                label="Transportasi"
                fieldKey="transportasi"
                value={form.transportasi}
                editingKey={editingKey}
                tempValue={tempValue}
                onStartEdit={handleStartEdit}
                onApplyEdit={handleApplyInlineEdit}
                onCancelEdit={handleCancelInlineEdit}
                onChangeTempValue={setTempValue}
              />

              {/* Komponen: Lembur */}
              <ComponentRow
                label="Lembur"
                fieldKey="lembur"
                value={form.lembur}
                editingKey={editingKey}
                tempValue={tempValue}
                onStartEdit={handleStartEdit}
                onApplyEdit={handleApplyInlineEdit}
                onCancelEdit={handleCancelInlineEdit}
                onChangeTempValue={setTempValue}
              />

              {/* Komponen: Bonus (jika ada atau klik tambah) */}
              {(form.bonus > 0 || editingKey === 'bonus') && (
                <ComponentRow
                  label="Bonus"
                  fieldKey="bonus"
                  value={form.bonus}
                  editingKey={editingKey}
                  tempValue={tempValue}
                  onStartEdit={handleStartEdit}
                  onApplyEdit={handleApplyInlineEdit}
                  onCancelEdit={handleCancelInlineEdit}
                  onChangeTempValue={setTempValue}
                />
              )}

              {/* Total Pendapatan Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px dashed #e2e8f0',
                  marginTop: '4px'
                }}
              >
                <b style={{ fontSize: '13px', color: '#059669' }}>Total Pendapatan</b>
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 800,
                    fontSize: '14px',
                    color: '#059669'
                  }}
                >
                  {formatRupiah(totalEarnings)}
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* SECTION POTONGAN                                                      */}
          {/* ===================================================================== */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 18px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '10px',
                borderBottom: '1px solid #f1f5f9',
                marginBottom: '12px'
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#e11d48', letterSpacing: '0.04em' }}>
                POTONGAN
              </span>
              <span style={{ fontSize: '11px', color: '#e11d48', fontWeight: 600 }}>
                DEBIT (-)
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* BPJS Kesehatan */}
              <ComponentRow
                label="BPJS Kesehatan"
                fieldKey="bpjsKesehatan"
                value={form.bpjsKesehatan}
                isDeduction
                editingKey={editingKey}
                tempValue={tempValue}
                onStartEdit={handleStartEdit}
                onApplyEdit={handleApplyInlineEdit}
                onCancelEdit={handleCancelInlineEdit}
                onChangeTempValue={setTempValue}
              />

              {/* BPJS Ketenagakerjaan */}
              <ComponentRow
                label="BPJS Ketenagakerjaan"
                fieldKey="bpjsKetenagakerjaan"
                value={form.bpjsKetenagakerjaan}
                isDeduction
                editingKey={editingKey}
                tempValue={tempValue}
                onStartEdit={handleStartEdit}
                onApplyEdit={handleApplyInlineEdit}
                onCancelEdit={handleCancelInlineEdit}
                onChangeTempValue={setTempValue}
              />

              {/* Cicilan Pinjaman */}
              <ComponentRow
                label="Cicilan Pinjaman"
                fieldKey="cicilanPinjaman"
                value={form.cicilanPinjaman}
                isDeduction
                editingKey={editingKey}
                tempValue={tempValue}
                onStartEdit={handleStartEdit}
                onApplyEdit={handleApplyInlineEdit}
                onCancelEdit={handleCancelInlineEdit}
                onChangeTempValue={setTempValue}
              />

              {/* Kasbon */}
              <ComponentRow
                label="Kasbon"
                fieldKey="kasbon"
                value={form.kasbon}
                isDeduction
                editingKey={editingKey}
                tempValue={tempValue}
                onStartEdit={handleStartEdit}
                onApplyEdit={handleApplyInlineEdit}
                onCancelEdit={handleCancelInlineEdit}
                onChangeTempValue={setTempValue}
              />

              {/* Total Potongan Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '10px',
                  borderTop: '1px dashed #e2e8f0',
                  marginTop: '4px'
                }}
              >
                <b style={{ fontSize: '13px', color: '#e11d48' }}>Total Potongan</b>
                <span
                  style={{
                    fontFamily: '"JetBrains Mono", monospace',
                    fontWeight: 800,
                    fontSize: '14px',
                    color: '#e11d48'
                  }}
                >
                  -{formatRupiah(totalDeductions)}
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* SECTION GAJI BERSIH (TAKE HOME PAY) HIGHLIGHT                         */}
          {/* ===================================================================== */}
          <div
            style={{
              background: '#eff6ff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#1e40af',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                GAJI BERSIH (TAKE HOME PAY)
              </span>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#3b82f6' }}>
                Total pendapatan dikurangi total potongan
              </p>
            </div>

            <div
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '22px',
                fontWeight: 800,
                color: '#1e40af'
              }}
            >
              {formatRupiah(netSalary)}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* SECTION 22. AUDIT TRAIL / RIWAYAT PERUBAHAN                           */}
          {/* ===================================================================== */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 18px'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
              }}
            >
              <Clock size={16} color="#64748b" />
              <b style={{ fontSize: '13px', color: '#0f172a' }}>Riwayat Perubahan</b>
            </div>

            {/* Timeline Compact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {auditHistory.map((item, idx) => (
                <div
                  key={item.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    position: 'relative',
                    fontSize: '12px'
                  }}
                >
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#2563eb',
                      marginTop: '4px',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span style={{ fontSize: '11px' }}>{item.timestamp}</span>
                      <b style={{ color: '#0f172a', fontSize: '11px' }}>{item.actor}</b>
                    </div>
                    <div style={{ color: '#334155', marginTop: '2px', fontWeight: 600 }}>
                      Mengubah {item.field}
                    </div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', color: '#2563eb', fontSize: '11px', marginTop: '1px' }}>
                      {formatRupiah(item.before)} → {formatRupiah(item.after)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* DRAWER FOOTER (STICKY)                                                */}
        {/* ===================================================================== */}
        <div
          className="drawer-foot"
          style={{
            padding: '16px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexShrink: 0
          }}
        >
          {onOpenPayslip && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenPayslip(item);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileText size={15} />
              <span>Slip Gaji</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <Button variant="secondary" onClick={onClose}>
              Tutup
            </Button>
            <Button
              variant="primary"
              disabled={!hasChanges || saving}
              loading={saving}
              onClick={handleSaveChanges}
            >
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Row Komponen dengan Fitur Inline Edit
function ComponentRow({
  label,
  fieldKey,
  value,
  isDeduction = false,
  editingKey,
  tempValue,
  onStartEdit,
  onApplyEdit,
  onCancelEdit,
  onChangeTempValue
}) {
  const isEditing = editingKey === fieldKey;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px',
        padding: '4px 0'
      }}
    >
      <span style={{ color: '#475569', fontWeight: 500 }}>{label}</span>

      {isEditing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>Rp</span>
          <input
            type="number"
            autoFocus
            className="smart-input"
            value={tempValue}
            onChange={(e) => onChangeTempValue(e.target.value)}
            style={{ width: '120px', height: '30px', fontSize: '12px', padding: '4px 8px' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onApplyEdit(fieldKey);
              if (e.key === 'Escape') onCancelEdit();
            }}
          />
          <button
            type="button"
            onClick={onCancelEdit}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onApplyEdit(fieldKey)}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Simpan
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 600,
              color: isDeduction ? '#e11d48' : '#0f172a'
            }}
          >
            {isDeduction ? `-${formatRupiah(value)}` : formatRupiah(value)}
          </span>
          <button
            type="button"
            onClick={() => onStartEdit(fieldKey, value)}
            style={{
              border: 'none',
              background: 'none',
              color: '#2563eb',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            [Edit]
          </button>
        </div>
      )}
    </div>
  );
}
