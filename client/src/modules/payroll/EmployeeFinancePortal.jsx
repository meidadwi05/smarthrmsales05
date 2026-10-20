import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CreditCard,
  Receipt,
  FileCheck2,
  FileText,
  Calendar,
  Download,
  Eye,
  Bell,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { formatRupiah, formatDateIndo } from './utils/formatters.js';
import PayslipModal from './components/PayslipModal.jsx';
import {
  PageHeader,
  Button,
  FilterSelect,
  StatusBadge,
  TypeBadge,
  StatCard,
  MetricGrid
} from './components/common/index.js';

export default function EmployeeFinancePortal({
  API,
  employeeId = 'emp-1',
  onNavigate
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/payroll/my-finance/${employeeId}`)
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching employee finance:', err);
        setLoading(false);
      });
  }, [API, employeeId]);

  const cards = data?.cards || {
    lastNetSalary: 7250000,
    remainingLoan: 2000000,
    nextInstallment: 1000000,
    pendingReimbursement: 150000
  };

  const history = data?.history || [
    {
      period: 'September 2026',
      netSalary: 7250000,
      basicSalary: 6000000,
      status: 'Sudah Dibayar',
      paymentDate: '30 September 2026',
      slipId: 'SLIP-2026-09-EMP00123'
    },
    {
      period: 'Agustus 2026',
      netSalary: 7100000,
      basicSalary: 6000000,
      status: 'Sudah Dibayar',
      paymentDate: '31 Agustus 2026',
      slipId: 'SLIP-2026-08-EMP00123'
    },
    {
      period: 'Juli 2026',
      netSalary: 7200000,
      basicSalary: 6000000,
      status: 'Sudah Dibayar',
      paymentDate: '31 Juli 2026',
      slipId: 'SLIP-2026-07-EMP00123'
    },
    {
      period: 'Juni 2026',
      netSalary: 6950000,
      basicSalary: 6000000,
      status: 'Sudah Dibayar',
      paymentDate: '30 Juni 2026',
      slipId: 'SLIP-2026-06-EMP00123'
    },
    {
      period: 'Mei 2026',
      netSalary: 7300000,
      basicSalary: 6000000,
      status: 'Sudah Dibayar',
      paymentDate: '31 Mei 2026',
      slipId: 'SLIP-2026-05-EMP00123'
    }
  ];

  const notifications = data?.notifications || [
    {
      id: 'n-1',
      title: 'Slip Gaji Tersedia',
      message: 'Slip gaji September 2026 telah diterbitkan dan dapat diunduh.',
      time: '2 jam yang lalu'
    },
    {
      id: 'n-2',
      title: 'Pembayaran Gaji Diproses',
      message: 'Pembayaran gaji September 2026 telah ditransfer ke rekening BCA Anda.',
      time: '1 hari yang lalu'
    }
  ];

  const empName = data?.employee?.name || 'Budi Santoso';
  const firstName = empName.split(' ')[0] || 'Budi';

  return (
    <section className="module-page">
      <PageHeader
        breadcrumb="Home / Keuangan Saya"
        sectionLabel="PORTAL KEUANGAN PRIBADI KARYAWAN"
        title={`Selamat pagi, ${firstName} 👋`}
        subtitle="Kelola slip gaji bulanan, riwayat take-home pay, saldo pinjaman aktif, kasbon, dan verifikasi reimbursement Anda secara transparan."
        actions={
          <Button
            variant="primary"
            icon={FileText}
            onClick={() => setSelectedPayslip(data?.latestPayslip || {})}
          >
            Lihat Slip Gaji Terbaru
          </Button>
        }
      />

      {/* 4 Financial Status Cards */}
      <MetricGrid columns={4}>
        <StatCard
          label="Gaji Bersih Terakhir"
          value={formatRupiah(cards.lastNetSalary)}
          icon={Wallet}
          subtext="sudah ditransfer ke rekening"
          trend="September 2026"
          trendColor="green"
        />
        <StatCard
          label="Pinjaman Tersisa"
          value={formatRupiah(cards.remainingLoan)}
          icon={CreditCard}
          subtext="dari total 5 bulan tenor"
          trend="Sisa 2 Bulan"
          trendColor="orange"
        />
        <StatCard
          label="Cicilan Berikutnya"
          value={formatRupiah(cards.nextInstallment)}
          icon={Clock}
          subtext="otomatis potong gaji"
          trend="Oktober 2026"
          trendColor="blue"
        />
        <StatCard
          label="Reimbursement Menunggu"
          value={formatRupiah(cards.pendingReimbursement)}
          icon={FileCheck2}
          subtext="klaim operasional dinas"
          trend="Verifikasi"
          trendColor="orange"
        />
      </MetricGrid>

      {/* Quick Action Shortcuts Bar */}
      <div
        className="panel"
        style={{
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap'
        }}
      >
        <span
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--text-main)'
          }}
        >
          Aksi Cepat Finansial:
        </span>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            icon={FileText}
            onClick={() => setSelectedPayslip(data?.latestPayslip || {})}
          >
            Lihat Slip Gaji
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={CreditCard}
            onClick={() => onNavigate && onNavigate('Pinjaman Karyawan')}
          >
            Ajukan Pinjaman
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={Receipt}
            onClick={() => onNavigate && onNavigate('Kasbon')}
          >
            Ajukan Kasbon
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={FileCheck2}
            onClick={() => onNavigate && onNavigate('Penggantian Biaya')}
          >
            Ajukan Reimbursement
          </Button>
        </div>
      </div>

      {/* Main Grid: Salary History & Notifications */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px'
        }}
      >
        {/* Left: Riwayat Gaji Saya */}
        <section className="panel team-panel">
          <div className="panel-head">
            <div>
              <h2>Riwayat Gaji Saya</h2>
              <p>Histori pembayaran gaji bulanan dan arsip dokumen slip resmi</p>
            </div>

            <div style={{ minWidth: '120px' }}>
              <FilterSelect
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                options={[
                  { value: '2026', label: 'Tahun 2026' },
                  { value: '2025', label: 'Tahun 2025' }
                ]}
              />
            </div>
          </div>

          <div
            style={{
              padding: '16px 20px',
              display: 'grid',
              gap: '12px'
            }}
          >
            {history.map((hist) => (
              <div
                key={hist.period}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  gap: '14px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      background: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Calendar size={18} />
                  </div>
                  <div>
                    <b style={{ color: 'var(--text-main)', fontSize: '13px' }}>
                      {hist.period}
                    </b>
                    <small
                      style={{
                        display: 'block',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        marginTop: '2px'
                      }}
                    >
                      Dibayar: {hist.paymentDate}
                    </small>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      color: 'var(--text-muted)'
                    }}
                  >
                    Gaji Bersih
                  </span>
                  <b
                    className="font-mono"
                    style={{ color: '#059669', fontSize: '14px' }}
                  >
                    {formatRupiah(hist.netSalary)}
                  </b>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Eye}
                    onClick={() =>
                      setSelectedPayslip(
                        data?.latestPayslip || {
                          name: empName,
                          employeeCode: 'EMP-00123',
                          netSalary: hist.netSalary
                        }
                      )
                    }
                  >
                    Rincian
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Download}
                    onClick={() => {
                      setSelectedPayslip(data?.latestPayslip || {});
                      setTimeout(() => window.print(), 300);
                    }}
                  >
                    Slip
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Right: Notifikasi Otomatis */}
        <section className="panel team-panel">
          <div className="panel-head">
            <div>
              <h2>Notifikasi Finansial</h2>
              <p>Pemberitahuan resmi terkait payroll dan persetujuan klaim</p>
            </div>
            <Bell size={18} color="var(--text-muted)" />
          </div>

          <div
            style={{
              padding: '16px 20px',
              display: 'grid',
              gap: '12px'
            }}
          >
            {notifications.map((notif) => (
              <div
                key={notif.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#2563EB',
                    marginTop: '6px',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1 }}>
                  <b style={{ color: 'var(--text-main)', fontSize: '13px' }}>
                    {notif.title}
                  </b>
                  <p
                    style={{
                      margin: '2px 0 4px',
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      lineHeight: '1.4'
                    }}
                  >
                    {notif.message}
                  </p>
                  <small style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    {notif.time}
                  </small>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid #E2E8F0',
              background: '#F8FAFC',
              borderRadius: '0 0 16px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}
          >
            <CheckCircle2 size={14} color="#10B981" />
            <span>Rekening bank terdaftar: BCA ****1234 (Budi Santoso)</span>
          </div>
        </section>
      </div>

      {/* Slip Gaji Modal */}
      {selectedPayslip && (
        <PayslipModal
          data={selectedPayslip}
          onClose={() => setSelectedPayslip(null)}
        />
      )}
    </section>
  );
}
