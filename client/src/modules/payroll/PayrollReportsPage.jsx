import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Building2,
  Users,
  Wallet,
  TrendingUp,
  Receipt
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatRupiah } from './utils/formatters.js';
import {
  PageHeader,
  Button,
  FilterSelect,
  StatCard,
  MetricGrid,
  EmptyState
} from './components/common/index.js';

export default function PayrollReportsPage({ API }) {
  const [reportType, setReportType] = useState('Laporan Penggajian');
  const [department, setDepartment] = useState('Semua');
  const [period, setPeriod] = useState('September 2026');
  const [records, setRecords] = useState([]);
  const [totals, setTotals] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API}/api/payroll/reports?period=${period}&department=${department}`
      );
      const data = await res.json();
      setRecords(data.records || []);
      setTotals(data.totals || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [API, period, department]);

  const handleExportExcel = () => {
    if (!records.length) {
      alert('Tidak ada data untuk diekspor');
      return;
    }

    const excelData = records.map((r, i) => ({
      No: i + 1,
      'Kode Karyawan': r.employeeCode,
      'Nama Karyawan': r.name,
      Departemen: r.department,
      Jabatan: r.position,
      'Status Karyawan': r.status,
      'Gaji Pokok': r.earnings?.basicSalary || 0,
      'Tunjangan Jabatan': r.earnings?.tunjanganJabatan || 0,
      'Tunjangan Transport': r.earnings?.tunjanganTransport || 0,
      Lembur: r.earnings?.overtime || 0,
      'Total Pendapatan Bruto': r.earnings?.total || 0,
      'BPJS Kesehatan': r.deductions?.bpjsKesehatan || 0,
      'BPJS Ketenagakerjaan': r.deductions?.bpjsKetenagakerjaan || 0,
      'Cicilan Pinjaman': r.deductions?.loanInstallment || 0,
      Kasbon: r.deductions?.cashAdvance || 0,
      'Total Potongan': r.deductions?.total || 0,
      'Gaji Bersih (Take Home Pay)': r.netSalary || 0,
      'Rekening Bank': `${r.bankName || 'BCA'} - ${r.accountNumberMasked}`
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Payroll');
    XLSX.writeFile(
      workbook,
      `SMART_HRM_${reportType.replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.xlsx`
    );
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const reportTypeList = [
    { value: 'Laporan Penggajian', label: 'Laporan Penggajian Keseluruhan' },
    { value: 'Laporan Gaji Karyawan', label: 'Laporan Gaji Karyawan' },
    { value: 'Laporan Tunjangan', label: 'Laporan Tunjangan & Fasilitas' },
    { value: 'Laporan Lembur', label: 'Laporan Rekapitulasi Lembur' },
    { value: 'Laporan Potongan', label: 'Laporan Potongan & PPh21' },
    { value: 'Laporan Pinjaman', label: 'Laporan Cicilan Pinjaman' },
    { value: 'Laporan Kasbon', label: 'Laporan Pemotongan Kasbon' },
    { value: 'Laporan Penggantian Biaya', label: 'Laporan Penggantian Biaya' },
    { value: 'Laporan Biaya Penggajian', label: 'Laporan Total Anggaran Penggajian' }
  ];

  return (
    <section className="module-page">
      <div className="no-print">
        <PageHeader
          breadcrumb="Home / Laporan Penggajian"
          sectionLabel="PENGGAJIAN & KEUANGAN"
          title="Laporan Penggajian & Keuangan"
          subtitle="Unduh rekapitulasi data payroll, biaya lembur, tunjangan, dan potongan dalam format Excel resmi atau cetak langsung dokumen laporan."
          actions={
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="secondary"
                icon={Printer}
                onClick={handlePrintPDF}
              >
                Cetak PDF
              </Button>
              <Button
                variant="primary"
                icon={FileSpreadsheet}
                onClick={handleExportExcel}
              >
                Ekspor Excel (.xlsx)
              </Button>
            </div>
          }
        />

        {/* 4 Summary Aggregate Metric Cards */}
        <MetricGrid columns={4}>
          <StatCard
            label="Total Karyawan Terdaftar"
            value={`${records.length} Karyawan`}
            icon={Users}
            subtext="Tercakup dalam laporan"
            trend="100% Data"
            trendColor="blue"
          />
          <StatCard
            label="Total Pendapatan Bruto"
            value={formatRupiah(totals.gross || 0)}
            icon={TrendingUp}
            subtext="Gaji pokok + lembur + tunjangan"
            trend="+2.9% MTM"
            trendColor="green"
          />
          <StatCard
            label="Total Potongan"
            value={`-${formatRupiah(totals.deductions || 0)}`}
            icon={Receipt}
            subtext="BPJS, pinjaman, kasbon & pph21"
            trend="Terverifikasi"
            trendColor="orange"
          />
          <StatCard
            label="Pengeluaran Gaji Bersih"
            value={formatRupiah(totals.net || 0)}
            icon={Wallet}
            subtext="Take home pay seluruh karyawan"
            trend="Siap Bayar"
            trendColor="green"
          />
        </MetricGrid>
      </div>

      {/* Main Report Table Card */}
      <section className="panel team-panel">
        <div className="panel-head no-print">
          <div>
            <h2>Rekapitulasi Gaji Karyawan</h2>
            <p>Filter berdasarkan jenis laporan, periode bulan, dan departemen operasional</p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ minWidth: '220px' }}>
              <FilterSelect
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                options={reportTypeList}
              />
            </div>

            <div style={{ minWidth: '160px' }}>
              <FilterSelect
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                options={[
                  { value: 'September 2026', label: 'September 2026' },
                  { value: 'Agustus 2026', label: 'Agustus 2026' },
                  { value: 'Juli 2026', label: 'Juli 2026' }
                ]}
              />
            </div>

            <div style={{ minWidth: '180px' }}>
              <FilterSelect
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                options={[
                  { value: 'Semua', label: 'Semua Departemen' },
                  { value: 'IT Support', label: 'IT & Engineering' },
                  { value: 'Operasional', label: 'Operasional & Logistik' },
                  { value: 'Divisi Keuangan', label: 'Finance & Akuntansi' },
                  { value: 'Sales', label: 'Sales & Marketing' },
                  { value: 'Divisi SDM', label: 'People & HRD' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Printable Document Title (only in print) */}
        <div
          className="print-only"
          style={{
            display: 'none',
            padding: '20px 0',
            textAlign: 'center',
            borderBottom: '2px solid #0F172A',
            marginBottom: '20px'
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 6px 0' }}>
            SMART HRM — {reportType.toUpperCase()}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
            Periode: {period} | Departemen: {department}
          </p>
        </div>

        <div className="table-wrap">
          <table className="payroll-table">
            <thead>
              <tr>
                <th style={{ width: '48px', textAlign: 'center' }}>NO</th>
                <th>KARYAWAN</th>
                <th>DEPARTEMEN</th>
                <th style={{ textAlign: 'right' }}>GAJI POKOK</th>
                <th style={{ textAlign: 'right' }}>TUNJANGAN</th>
                <th style={{ textAlign: 'right' }}>LEMBUR</th>
                <th style={{ textAlign: 'right' }}>TOTAL BRUTO</th>
                <th style={{ textAlign: 'right' }}>POTONGAN</th>
                <th style={{ textAlign: 'right' }}>GAJI BERSIH</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <EmptyState
                      icon={FileSpreadsheet}
                      title="Tidak ada data laporan ditemukan"
                      description="Silakan periksa filter periode atau departemen yang dipilih."
                    />
                  </td>
                </tr>
              ) : (
                records.map((row, idx) => {
                  const totalTunjangan =
                    (row.earnings?.tunjanganJabatan || 0) +
                    (row.earnings?.tunjanganTransport || 0) +
                    (row.earnings?.tunjanganMakan || 0);

                  return (
                    <tr key={row.employeeId}>
                      <td
                        className="font-mono"
                        style={{
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          fontSize: '12px'
                        }}
                      >
                        {idx + 1}
                      </td>
                      <td>
                        <div>
                          <b style={{ color: 'var(--text-main)', fontSize: '14px' }}>
                            {row.name}
                          </b>
                          <small
                            className="font-mono"
                            style={{
                              display: 'block',
                              color: 'var(--text-muted)',
                              fontSize: '11px',
                              marginTop: '2px'
                            }}
                          >
                            {row.employeeCode}
                          </small>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {row.department}
                      </td>
                      <td
                        className="font-mono"
                        style={{ textAlign: 'right', fontSize: '13px' }}
                      >
                        {formatRupiah(row.earnings?.basicSalary)}
                      </td>
                      <td
                        className="font-mono"
                        style={{ textAlign: 'right', fontSize: '13px' }}
                      >
                        {formatRupiah(totalTunjangan)}
                      </td>
                      <td
                        className="font-mono"
                        style={{ textAlign: 'right', fontSize: '13px' }}
                      >
                        {formatRupiah(row.earnings?.overtime)}
                      </td>
                      <td
                        className="font-mono font-semibold"
                        style={{
                          textAlign: 'right',
                          color: '#2563EB',
                          fontSize: '13px'
                        }}
                      >
                        {formatRupiah(row.earnings?.total)}
                      </td>
                      <td
                        className="font-mono"
                        style={{
                          textAlign: 'right',
                          color: '#E11D48',
                          fontSize: '13px'
                        }}
                      >
                        -{formatRupiah(row.deductions?.total)}
                      </td>
                      <td
                        className="font-mono font-bold"
                        style={{
                          textAlign: 'right',
                          color: '#059669',
                          fontSize: '13px'
                        }}
                      >
                        {formatRupiah(row.netSalary)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {records.length > 0 && (
              <tfoot>
                <tr
                  style={{
                    background: '#F8FAFC',
                    borderTop: '2px solid #CBD5E1',
                    fontWeight: '700'
                  }}
                >
                  <td
                    colSpan="3"
                    style={{
                      padding: '16px 20px',
                      color: 'var(--text-main)',
                      fontSize: '13px',
                      letterSpacing: '0.02em'
                    }}
                  >
                    TOTAL KESELURUHAN ({records.length} KARYAWAN)
                  </td>
                  <td
                    className="font-mono"
                    style={{
                      textAlign: 'right',
                      padding: '16px',
                      fontSize: '13px',
                      color: 'var(--text-main)'
                    }}
                  >
                    {formatRupiah(
                      records.reduce(
                        (s, r) => s + (r.earnings?.basicSalary || 0),
                        0
                      )
                    )}
                  </td>
                  <td
                    className="font-mono"
                    style={{
                      textAlign: 'right',
                      padding: '16px',
                      fontSize: '13px',
                      color: 'var(--text-main)'
                    }}
                  >
                    {formatRupiah(
                      records.reduce(
                        (s, r) =>
                          s +
                          ((r.earnings?.tunjanganJabatan || 0) +
                            (r.earnings?.tunjanganTransport || 0) +
                            (r.earnings?.tunjanganMakan || 0)),
                        0
                      )
                    )}
                  </td>
                  <td
                    className="font-mono"
                    style={{
                      textAlign: 'right',
                      padding: '16px',
                      fontSize: '13px',
                      color: 'var(--text-main)'
                    }}
                  >
                    {formatRupiah(totals.overtime || 0)}
                  </td>
                  <td
                    className="font-mono font-bold"
                    style={{
                      textAlign: 'right',
                      padding: '16px',
                      color: '#2563EB',
                      fontSize: '13px'
                    }}
                  >
                    {formatRupiah(totals.gross || 0)}
                  </td>
                  <td
                    className="font-mono font-bold"
                    style={{
                      textAlign: 'right',
                      padding: '16px',
                      color: '#E11D48',
                      fontSize: '13px'
                    }}
                  >
                    -{formatRupiah(totals.deductions || 0)}
                  </td>
                  <td
                    className="font-mono font-bold"
                    style={{
                      textAlign: 'right',
                      padding: '16px',
                      color: '#059669',
                      fontSize: '14px'
                    }}
                  >
                    {formatRupiah(totals.net || 0)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </section>
  );
}
