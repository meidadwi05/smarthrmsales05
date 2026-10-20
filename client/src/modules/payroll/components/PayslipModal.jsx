import React, { useRef } from 'react';
import {
  X,
  Printer,
  Download,
  Share2,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  CreditCard,
  Clock,
  UserCheck
} from 'lucide-react';
import { formatRupiah, terbilang } from '../utils/formatters.js';
import { Button } from './common/index.js';

export default function PayslipModal({ data, onClose }) {
  const printRef = useRef(null);

  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  const earnings = data.earnings || {
    basicSalary: 6000000,
    tunjanganJabatan: 750000,
    tunjanganTransport: 500000,
    overtime: 624000,
    bonusInsentif: 0,
    total: 7874000
  };

  const deductions = data.deductions || {
    bpjsKesehatan: 120000,
    bpjsKetenagakerjaan: 120000,
    loanInstallment: 1000000,
    cashAdvance: 500000,
    pph21: 0,
    total: 1740000
  };

  const netSalary = data.netSalary || Math.max(0, earnings.total - deductions.total);
  const terbilangText = data.terbilangText || terbilang(netSalary);
  const maskedAccount = data.accountNumberMasked || (data.accountNumber ? `**** **** ${String(data.accountNumber).slice(-4)}` : '**** **** 1234');

  return (
    <div className="modal-backdrop-custom payslip-modal-backdrop" onClick={onClose}>
      <div
        className="modal-container-custom payslip-modal-container"
        style={{ maxWidth: '820px', width: '92vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Header Bar (No Print) */}
        <div className="payslip-modal-topbar no-print" style={{ padding: '14px 24px', background: '#0F172A', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '14px 14px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600' }}>
            <ShieldCheck size={18} color="#10B981" />
            <span>Pratinjau Dokumen Resmi Slip Gaji Karyawan</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint}>
              Cetak Dokumen
            </Button>
            <Button variant="primary" size="sm" icon={Download} onClick={handleDownload}>
              Unduh PDF
            </Button>
            <button className="btn-close-modal" onClick={onClose} aria-label="Tutup">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Payslip Sheet */}
        <div className="payslip-paper" ref={printRef} style={{ background: '#FFF', color: '#0F172A', padding: '36px 40px', borderRadius: '0 0 14px 14px', fontFamily: "'DM Sans', sans-serif" }}>
          {/* Header Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '20px', borderBottom: '2px solid #0F172A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: '#2563EB', color: '#FFF', display: 'grid', placeItems: 'center' }}>
                <Building2 size={26} />
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', color: '#0F172A' }}>
                  PT YUPI INDO
                </h2>
                <p style={{ margin: '2px 0', fontSize: '12px', color: '#475569' }}>
                  Kawasan Industri Terpadu Blok A5 No. 12, Jakarta Barat 11840
                </p>
                <small style={{ fontSize: '11px', color: '#64748B' }}>
                  Telepon: (021) 5830-9988 &nbsp;|&nbsp; Email: payroll@yupi-indo.com
                </small>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '6px', marginBottom: '6px', letterSpacing: '0.05em' }}>
                SLIP GAJI RESMI
              </div>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                Periode: <b>{data.periodName || 'Oktober 2026'}</b>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Tanggal Pembayaran: <b>{data.paymentDate || '31 Oktober 2026'}</b>
              </div>
            </div>
          </div>

          {/* Data Karyawan */}
          <div style={{ padding: '18px 0', borderBottom: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', letterSpacing: '0.05em', marginBottom: '12px', textTransform: 'uppercase' }}>
              DATA KARYAWAN
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '12px' }}>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Nama Lengkap</span>
                <b style={{ color: '#0F172A', fontSize: '14px' }}>{data.name || 'Budi Santoso'}</b>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>ID Karyawan</span>
                <b className="font-mono" style={{ color: '#0F172A', fontSize: '13px' }}>{data.employeeCode || 'EMP-00123'}</b>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Jabatan</span>
                <b style={{ color: '#0F172A' }}>{data.position || 'Supervisor Operasional'}</b>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Divisi</span>
                <b style={{ color: '#0F172A' }}>{data.department || 'Operasional'}</b>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Status Karyawan</span>
                <b style={{ color: '#0F172A' }}>{data.status || 'Karyawan Tetap'}</b>
              </div>
              <div>
                <span style={{ color: '#64748B', display: 'block' }}>Periode Kerja</span>
                <b style={{ color: '#0F172A' }}>01 Oktober 2026 – 31 Oktober 2026</b>
              </div>
            </div>
          </div>

          {/* Breakdown 2 Kolom: Pendapatan & Potongan */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', padding: '20px 0', borderBottom: '1px solid #E2E8F0' }}>
            {/* PENDAPATAN */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '2px solid #059669', fontSize: '11px', fontWeight: '700', color: '#059669', letterSpacing: '0.05em' }}>
                <span>PENDAPATAN</span>
                <span>JUMLAH</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Gaji Pokok</span>
                  <span className="font-mono">{formatRupiah(earnings.basicSalary)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tunjangan Jabatan</span>
                  <span className="font-mono">{formatRupiah(earnings.tunjanganJabatan)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Transportasi</span>
                  <span className="font-mono">{formatRupiah(earnings.tunjanganTransport)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Lembur</span>
                  <span className="font-mono">{formatRupiah(earnings.overtime)}</span>
                </div>
                {earnings.bonusInsentif > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Bonus & Insentif</span>
                    <span className="font-mono">{formatRupiah(earnings.bonusInsentif)}</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #CBD5E1', fontWeight: '700', fontSize: '13px', color: '#059669' }}>
                <span>TOTAL PENDAPATAN</span>
                <span className="font-mono">{formatRupiah(earnings.total)}</span>
              </div>
            </div>

            {/* POTONGAN */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '2px solid #E11D48', fontSize: '11px', fontWeight: '700', color: '#E11D48', letterSpacing: '0.05em' }}>
                <span>POTONGAN</span>
                <span>JUMLAH</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>BPJS Kesehatan</span>
                  <span className="font-mono">-{formatRupiah(deductions.bpjsKesehatan)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>BPJS Ketenagakerjaan</span>
                  <span className="font-mono">-{formatRupiah(deductions.bpjsKetenagakerjaan)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Cicilan Pinjaman</span>
                  <span className="font-mono">-{formatRupiah(deductions.loanInstallment)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Kasbon Karyawan</span>
                  <span className="font-mono">-{formatRupiah(deductions.cashAdvance)}</span>
                </div>
                {deductions.pph21 > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Pajak Penghasilan (PPh 21)</span>
                    <span className="font-mono">-{formatRupiah(deductions.pph21)}</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #CBD5E1', fontWeight: '700', fontSize: '13px', color: '#E11D48' }}>
                <span>TOTAL POTONGAN</span>
                <span className="font-mono">-{formatRupiah(deductions.total)}</span>
              </div>
            </div>
          </div>

          {/* Gaji Bersih Box */}
          <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '10px', padding: '16px 20px', margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#1E40AF', letterSpacing: '0.05em' }}>
                GAJI BERSIH (TAKE HOME PAY)
              </span>
              <div className="font-mono font-bold" style={{ fontSize: '26px', color: '#2563EB', marginTop: '2px' }}>
                {formatRupiah(netSalary)}
              </div>
            </div>
            <div style={{ maxWidth: '380px', textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#64748B', display: 'block', fontWeight: '600' }}>TERBILANG:</span>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', fontStyle: 'italic', color: '#1E293B', fontWeight: '500' }}>
                "{terbilangText}"
              </p>
            </div>
          </div>

          {/* Informasi Pembayaran & Rekening */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#EFF6FF', borderRadius: '8px', border: '1px solid #BFDBFE', fontSize: '12px', marginBottom: '20px' }}>
            <div>
              <span style={{ color: '#1E40AF', fontWeight: '600' }}>INFORMASI PEMBAYARAN:</span>
              <span style={{ marginLeft: '8px', color: '#3B82F6' }}>Metode: Transfer Bank</span>
            </div>
            <div>
              <span style={{ color: '#475569' }}>Bank: <b>{data.bankName || 'BCA'}</b> &nbsp;|&nbsp; Rekening: <b className="font-mono">{maskedAccount}</b> &nbsp;|&nbsp; a.n. <b>{data.name || 'Budi Santoso'}</b></span>
            </div>
          </div>

          {/* Footer & Pengesahan */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '10px', fontSize: '11px', color: '#64748B' }}>
            <div style={{ maxWidth: '380px' }}>
              <p style={{ margin: 0, lineHeight: '1.4' }}>
                <b>Catatan:</b><br />
                Slip gaji ini dibuat secara elektronik oleh Smart HRM.<br />
                Dokumen ini merupakan bukti pembayaran penghasilan resmi karyawan.
              </p>
            </div>

            <div style={{ textAlign: 'center', minWidth: '180px' }}>
              <span style={{ display: 'block', marginBottom: '40px', fontSize: '11px' }}>
                Jakarta, {data.paymentDate || '31 Oktober 2026'}<br />
                <b>PT Yupi Indo — HR & Finance</b>
              </span>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: '700', fontSize: '11px' }}>
                <CheckCircle2 size={15} />
                <span>TERVERIFIKASI SISTEM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
