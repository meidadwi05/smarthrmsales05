import React from 'react';
import { X, Calculator, HelpCircle, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatRupiah } from '../utils/formatters.js';

export default function PayrollCalculationDetailModal({ item, onClose, onOpenPayslip }) {
  if (!item) return null;

  const basic = item.earnings?.basicSalary || 6000000;
  const overtimeHours = item.attendance?.overtimeHours || 12;
  const hourlyRate = Math.round(basic / 173);
  const overtimeRaw = Math.round(overtimeHours * hourlyRate * 1.5);
  const overtimeRounded = item.earnings?.overtime || 500000;

  return (
    <div className="modal-backdrop-custom" onClick={onClose}>
      <div className="modal-container-custom modal-calc-detail" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-custom">
          <div>
            <div className="modal-badge-eyebrow">RINCIAN PERHITUNGAN TRANSPARAN</div>
            <h2>Detail Sumber Angka: {item.name}</h2>
            <p>Formula, parameter kehadiran, dan sumber data dari setiap komponen gaji</p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body-custom">
          {/* Employee Mini Card */}
          <div className="calc-employee-card">
            <div className="calc-emp-avatar">{item.name?.charAt(0) || 'K'}</div>
            <div className="calc-emp-info">
              <b>{item.name}</b>
              <span>{item.employeeCode} • {item.position} • {item.department}</span>
            </div>
            <div className="calc-emp-net">
              <small>Gaji Bersih Akhir</small>
              <h3>{formatRupiah(item.netSalary)}</h3>
            </div>
          </div>

          {/* Section: Pendapatan & Sumber Formula */}
          <div className="calc-section">
            <h4 className="calc-section-title text-blue">
              <Calculator size={15} />
              <span>Sumber & Formula Pendapatan ({formatRupiah(item.earnings?.total)})</span>
            </h4>

            <div className="calc-table">
              <div className="calc-row">
                <div className="calc-col-name">
                  <b>Gaji Pokok</b>
                  <small>Gaji bulanan kontrak kerja</small>
                </div>
                <div className="calc-col-formula">
                  <code>Gaji Pokok Terdaftar Master Karyawan</code>
                </div>
                <div className="calc-col-amount">
                  <b>{formatRupiah(basic)}</b>
                </div>
              </div>

              <div className="calc-row">
                <div className="calc-col-name">
                  <b>Tunjangan Jabatan</b>
                  <small>Level posisi: {item.position}</small>
                </div>
                <div className="calc-col-formula">
                  <code>Nominal Tetap Berdasarkan Grade Jabatan</code>
                </div>
                <div className="calc-col-amount">
                  <b>{formatRupiah(item.earnings?.tunjanganJabatan || 750000)}</b>
                </div>
              </div>

              <div className="calc-row">
                <div className="calc-col-name">
                  <b>Tunjangan Transportasi</b>
                  <small>Kehadiran aktual: {item.attendance?.presentDays || 21} hari</small>
                </div>
                <div className="calc-col-formula">
                  <code>{item.attendance?.presentDays || 21} hari × Rp 25.000 / hari (Maks Rp 500.000)</code>
                </div>
                <div className="calc-col-amount">
                  <b>{formatRupiah(item.earnings?.tunjanganTransport || 500000)}</b>
                </div>
              </div>

              <div className="calc-row highlight-calc">
                <div className="calc-col-name">
                  <b>Upah Lembur Resmi</b>
                  <small>Standard Depnaker RI (1/173 upah)</small>
                </div>
                <div className="calc-col-formula">
                  <div className="formula-box">
                    <span>Upah per jam = {formatRupiah(basic)} / 173 = <strong>{formatRupiah(hourlyRate)}/jam</strong></span>
                    <span>Lembur: {overtimeHours} jam × {formatRupiah(hourlyRate)} × 1.5 = <strong>{formatRupiah(overtimeRaw)}</strong></span>
                    <span className="text-emerald">Pembulatan Kebijakan: <strong>{formatRupiah(overtimeRounded)}</strong></span>
                  </div>
                </div>
                <div className="calc-col-amount">
                  <b>{formatRupiah(overtimeRounded)}</b>
                </div>
              </div>

              {item.earnings?.bonusInsentif > 0 && (
                <div className="calc-row">
                  <div className="calc-col-name">
                    <b>Bonus & Insentif</b>
                    <small>Capaian KPI divisi marketing & sales</small>
                  </div>
                  <div className="calc-col-formula">
                    <code>Target KPI Terpenuhi 100%</code>
                  </div>
                  <div className="calc-col-amount">
                    <b>{formatRupiah(item.earnings?.bonusInsentif)}</b>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section: Potongan & Sumber Formula */}
          <div className="calc-section">
            <h4 className="calc-section-title text-rose">
              <Calculator size={15} />
              <span>Sumber & Formula Potongan ({formatRupiah(item.deductions?.total)})</span>
            </h4>

            <div className="calc-table">
              <div className="calc-row">
                <div className="calc-col-name">
                  <b>BPJS Kesehatan</b>
                  <small>Iuran pekerja 1%</small>
                </div>
                <div className="calc-col-formula">
                  <code>1% × {formatRupiah(basic)} (Maksimal batas upah Rp 12.000.000)</code>
                </div>
                <div className="calc-col-amount text-rose">
                  <b>-{formatRupiah(item.deductions?.bpjsKesehatan || 60000)}</b>
                </div>
              </div>

              <div className="calc-row">
                <div className="calc-col-name">
                  <b>BPJS Ketenagakerjaan</b>
                  <small>JHT 2% + JP 1% (Total 3%)</small>
                </div>
                <div className="calc-col-formula">
                  <code>3% × {formatRupiah(basic)}</code>
                </div>
                <div className="calc-col-amount text-rose">
                  <b>-{formatRupiah(item.deductions?.bpjsKetenagakerjaan || 180000)}</b>
                </div>
              </div>

              {item.deductions?.loanInstallment > 0 && (
                <div className="calc-row highlight-calc">
                  <div className="calc-col-name">
                    <b>Cicilan Pinjaman Karyawan</b>
                    <small>Pinjaman Aktif Kode #LN-1</small>
                  </div>
                  <div className="calc-col-formula">
                    <code>Jadwal Cicilan Bulan September 2026 (Otomatis Masuk Potongan)</code>
                  </div>
                  <div className="calc-col-amount text-rose">
                    <b>-{formatRupiah(item.deductions?.loanInstallment)}</b>
                  </div>
                </div>
              )}

              {item.deductions?.cashAdvance > 0 && (
                <div className="calc-row">
                  <div className="calc-col-name">
                    <b>Kasbon Periode September</b>
                    <small>Pinjaman jangka pendek</small>
                  </div>
                  <div className="calc-col-formula">
                    <code>Dipotong Langsung pada Penggajian September 2026</code>
                  </div>
                  <div className="calc-col-amount text-rose">
                    <b>-{formatRupiah(item.deductions?.cashAdvance)}</b>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer-custom">
          <button className="btn-secondary" onClick={onClose}>
            Tutup
          </button>
          {onOpenPayslip && (
            <button className="btn-primary" onClick={() => { onClose(); onOpenPayslip(item); }}>
              <FileText size={15} />
              <span>Buka Slip Gaji Lengkap</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
