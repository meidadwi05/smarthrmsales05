import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Users,
  CreditCard,
  Receipt,
  FileCheck2,
  Calendar,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  ChevronRight,
  Plus,
  FileSpreadsheet,
  Building2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { formatRupiah } from './utils/formatters.js';
import {
  PageHeader,
  Button,
  FilterSelect,
  StatCard,
  MetricGrid,
  StatusBadge,
  TypeBadge
} from './components/common/index.js';

export default function PayrollDashboard({
  API,
  onNavigate,
  activeRole,
  currentRole,
  onSwitchRole,
  onRoleChange
}) {
  const role = currentRole || activeRole || 'hrd';
  const handleRoleChange = onRoleChange || onSwitchRole;

  const [selectedPeriod, setSelectedPeriod] = useState('prd-2026-09');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/payroll/dashboard?period=${selectedPeriod}`)
      .then((r) => r.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching payroll dashboard:', err);
        setLoading(false);
      });
  }, [API, selectedPeriod]);

  const stats = data?.stats || {
    totalPayroll: 745000000,
    paidEmployees: 128,
    totalEmployees: 135,
    totalActiveLoans: 85500000,
    totalCashAdvances: 12500000,
    totalReimbursements: 8500000
  };

  const monthlyTrends = data?.monthlyTrends || [
    { month: 'Apr 2026', total: 685000000, employees: 120 },
    { month: 'Mei 2026', total: 698000000, employees: 122 },
    { month: 'Jun 2026', total: 705000000, employees: 124 },
    { month: 'Jul 2026', total: 712000000, employees: 125 },
    { month: 'Agu 2026', total: 724000000, employees: 126 },
    { month: 'Sep 2026', total: 745000000, employees: 128 }
  ];

  const maxTrend = Math.max(...monthlyTrends.map((t) => t.total), 800000000);

  const stages = data?.stages || [
    { name: 'Data Kehadiran', done: true, at: '25 Sep 18:00' },
    { name: 'Perhitungan', done: true, at: '26 Sep 10:30' },
    { name: 'Pemeriksaan', done: true, at: '26 Sep 15:45' },
    { name: 'Persetujuan', done: false, current: true },
    { name: 'Pembayaran', done: false },
    { name: 'Publikasi Slip Gaji', done: false }
  ];

  const attentionItems = data?.attentionItems || [
    {
      id: 'att-1',
      type: 'warning',
      text: '7 karyawan belum memiliki rekening bank terdaftar',
      action: 'Periksa',
      target: 'Proses Penggajian'
    },
    {
      id: 'att-2',
      type: 'warning',
      text: '3 data penggajian perlu diperiksa (lembur melebihi 20 jam)',
      action: 'Perbaiki',
      target: 'Proses Penggajian'
    },
    {
      id: 'att-3',
      type: 'info',
      text: '5 pinjaman jatuh tempo dan dipotong pada periode bulan ini',
      action: 'Lihat',
      target: 'Pinjaman Karyawan'
    },
    {
      id: 'att-4',
      type: 'alert',
      text: '2 pengajuan pinjaman baru menunggu persetujuan HR & Finance',
      action: 'Tinjau',
      target: 'Pinjaman Karyawan'
    }
  ];

  return (
    <section className="module-page">
      <PageHeader
        breadcrumb="Home / Dashboard Penggajian"
        sectionLabel="PENGGAJIAN & KEUANGAN"
        title="Dashboard Penggajian"
        subtitle="Ringkasan real-time biaya kepegawaian, pemantauan alur proses penggajian, saldo pinjaman aktif, dan kasbon perusahaan."
        actions={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}
          >
            {/* Role Tester Switcher */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#F1F5F9',
                padding: '4px 10px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0'
              }}
            >
              <UserCheck size={14} color="#2563EB" />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--text-muted)'
                }}
              >
                Role:
              </span>
              <select
                value={role}
                onChange={(e) => handleRoleChange && handleRoleChange(e.target.value)}
                className="smart-select"
                style={{
                  height: '32px',
                  fontSize: '12px',
                  padding: '2px 24px 2px 8px',
                  border: 'none',
                  background: 'transparent'
                }}
              >
                <option value="hrd">HR / HRD (Full)</option>
                <option value="finance">Finance (Audit & Bayar)</option>
                <option value="manager">Manager (Approval)</option>
                <option value="employee">Karyawan (Portal)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {/* Period Filter */}
            <div style={{ minWidth: '150px' }}>
              <FilterSelect
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                options={[
                  { value: 'prd-2026-09', label: 'September 2026' },
                  { value: 'prd-2026-08', label: 'Agustus 2026' },
                  { value: 'prd-2026-07', label: 'Juli 2026' }
                ]}
              />
            </div>

            <Button
              variant="primary"
              icon={Wallet}
              onClick={() => onNavigate && onNavigate('Proses Penggajian')}
            >
              Proses Penggajian
            </Button>
          </div>
        }
      />

      {/* 5 KPI Metric Cards */}
      <MetricGrid columns={5}>
        <StatCard
          label="Total Penggajian"
          value={formatRupiah(stats.totalPayroll)}
          icon={Wallet}
          subtext="vs bulan Agustus"
          trend="+2.9%"
          trendColor="green"
        />
        <StatCard
          label="Karyawan Dibayar"
          value={`${stats.paidEmployees}/${stats.totalEmployees}`}
          icon={Users}
          subtext="karyawan terverifikasi"
          trend="94.8%"
          trendColor="green"
        />
        <StatCard
          label="Pinjaman Aktif"
          value={formatRupiah(stats.totalActiveLoans)}
          icon={CreditCard}
          subtext="sedang berjalan"
          trend="37 Pinjaman"
          trendColor="orange"
        />
        <StatCard
          label="Kasbon Bulan Ini"
          value={formatRupiah(stats.totalCashAdvances)}
          icon={Receipt}
          subtext="periode berjalan"
          trend="Potong Gaji"
          trendColor="blue"
        />
        <StatCard
          label="Penggantian Biaya"
          value={formatRupiah(stats.totalReimbursements)}
          icon={FileCheck2}
          subtext="disetujui Finance"
          trend="14 Klaim"
          trendColor="green"
        />
      </MetricGrid>

      {/* Main Grid: Chart & Status Tracker */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}
      >
        {/* Left: Monthly Trend Chart Panel */}
        <section className="panel team-panel">
          <div className="panel-head">
            <div>
              <h2>Tren Biaya Penggajian</h2>
              <p>Histori alokasi anggaran gaji dan headcount 6 bulan terakhir</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              icon={ArrowRight}
              onClick={() => onNavigate && onNavigate('Laporan Penggajian')}
            >
              Laporan Lengkap
            </Button>
          </div>

          <div
            style={{
              padding: '24px 20px 10px',
              minHeight: '230px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            {monthlyTrends.map((trend, idx) => {
              const heightPct = Math.round((trend.total / maxTrend) * 100);
              const isCurrent = idx === monthlyTrends.length - 1;
              return (
                <div
                  key={trend.month}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      color: isCurrent ? '#2563EB' : 'var(--text-muted)',
                      fontWeight: isCurrent ? '700' : '500'
                    }}
                  >
                    {(trend.total / 1000000).toFixed(0)}jt
                  </div>

                  <div
                    style={{
                      width: '100%',
                      maxWidth: '48px',
                      height: '140px',
                      background: '#F1F5F9',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'flex-end',
                      overflow: 'hidden',
                      padding: '2px'
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: `${heightPct}%`,
                        background: isCurrent
                          ? 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)'
                          : '#CBD5E1',
                        borderRadius: '6px',
                        transition: 'height 0.4s ease'
                      }}
                    />
                  </div>

                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: isCurrent ? '700' : '500',
                      color: isCurrent ? '#2563EB' : 'var(--text-main)'
                    }}
                  >
                    {trend.month}
                  </span>
                  <small
                    style={{
                      fontSize: '10px',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {trend.employees} org
                  </small>
                </div>
              );
            })}
          </div>

          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '12px',
              background: '#F8FAFC',
              borderRadius: '0 0 16px 16px'
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Rata-rata Bulanan: </span>
              <b style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>
                Rp 713.166.667
              </b>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Pertumbuhan: </span>
              <b style={{ color: '#059669' }}>+6.6% (8 Karyawan Baru)</b>
            </div>
          </div>
        </section>

        {/* Right: Payroll Workflow Status Progress */}
        <section className="panel team-panel">
          <div className="panel-head">
            <div>
              <h2>Status Penggajian September 2026</h2>
              <p>Tahapan alur proses penggajian bulan berjalan</p>
            </div>
            <TypeBadge label="Periode Aktif" />
          </div>

          <div
            style={{
              padding: '20px',
              display: 'grid',
              gap: '14px'
            }}
          >
            {stages.map((stg, i) => {
              const isDone = stg.done;
              const isCurrent = stg.current;
              return (
                <div
                  key={stg.name}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    background: isCurrent ? '#EFF6FF' : 'transparent',
                    border: isCurrent ? '1px solid #BFDBFE' : '1px solid transparent'
                  }}
                >
                  <div style={{ marginTop: '2px' }}>
                    {isDone ? (
                      <CheckCircle2 size={18} color="#10B981" />
                    ) : isCurrent ? (
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#2563EB',
                          color: '#FFF',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {i + 1}
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#E2E8F0',
                          color: '#64748B',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {i + 1}
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '2px'
                      }}
                    >
                      <b
                        style={{
                          fontSize: '13px',
                          color: isCurrent ? '#1D4ED8' : 'var(--text-main)'
                        }}
                      >
                        {stg.name}
                      </b>
                      {isDone && (
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)'
                          }}
                        >
                          {stg.at || 'Selesai'}
                        </span>
                      )}
                      {isCurrent && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: '#2563EB',
                            background: '#DBEAFE',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          Sedang Berjalan
                        </span>
                      )}
                    </div>
                    <small
                      style={{
                        display: 'block',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        lineHeight: '1.4'
                      }}
                    >
                      {i === 0 && 'Data absensi 1-25 September & lembur telah disinkronkan.'}
                      {i === 1 && 'Perhitungan gaji pokok, tunjangan, dan potongan otomatis rampung.'}
                      {i === 2 && 'Validasi kelengkapan rekening & batas potongan selesai dicek.'}
                      {i === 3 && 'Alur persetujuan bertingkat HR, Finance, dan Direktur.'}
                      {i === 4 && 'Disposisi transfer bank batch (BCA, Mandiri, BRI, BNI).'}
                      {i === 5 && 'Slip resmi diterbitkan dan notifikasi dikirim ke karyawan.'}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ padding: '16px 20px', borderTop: '1px solid #E2E8F0' }}>
            <Button
              variant="primary"
              icon={ArrowRight}
              fullWidth
              onClick={() => onNavigate && onNavigate('Proses Penggajian')}
            >
              Buka Tahapan Proses Penggajian
            </Button>
          </div>
        </section>
      </div>

      {/* Attention / Perlu Perhatian Section */}
      <section className="panel team-panel" style={{ marginBottom: '24px' }}>
        <div className="panel-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#FEF3C7',
                color: '#D97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2>Perlu Perhatian ({attentionItems.length})</h2>
              <p>Tindakan yang perlu diselesaikan sebelum finalisasi pembayaran penggajian</p>
            </div>
          </div>
        </div>

        <div
          style={{
            padding: '16px 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '12px'
          }}
        >
          {attentionItems.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '10px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    color: item.type === 'alert' ? '#EF4444' : '#F59E0B',
                    fontSize: '18px'
                  }}
                >
                  •
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-main)',
                    fontWeight: '500'
                  }}
                >
                  {item.text}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={ChevronRight}
                onClick={() =>
                  onNavigate && onNavigate(item.target || 'Proses Penggajian')
                }
              >
                {item.action || 'Tinjau'}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}
      >
        <div
          className="panel"
          style={{
            padding: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'all 0.2s ease'
          }}
          onClick={() => onNavigate && onNavigate('Periode Penggajian')}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Calendar size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <b style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)' }}>
              Periode Penggajian
            </b>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Jadwal cut-off & pembayaran
            </span>
          </div>
          <ArrowRight size={16} color="var(--text-muted)" />
        </div>

        <div
          className="panel"
          style={{
            padding: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'all 0.2s ease'
          }}
          onClick={() => onNavigate && onNavigate('Struktur Gaji')}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#F0FDF4',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Building2 size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <b style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)' }}>
              Struktur & Komponen
            </b>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Formula pendapatan & BPJS
            </span>
          </div>
          <ArrowRight size={16} color="var(--text-muted)" />
        </div>

        <div
          className="panel"
          style={{
            padding: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'all 0.2s ease'
          }}
          onClick={() => onNavigate && onNavigate('Pinjaman Karyawan')}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#FFF7ED',
              color: '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CreditCard size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <b style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)' }}>
              Pinjaman & Kasbon
            </b>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Persetujuan & cicilan otomatis
            </span>
          </div>
          <ArrowRight size={16} color="var(--text-muted)" />
        </div>

        <div
          className="panel"
          style={{
            padding: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'all 0.2s ease'
          }}
          onClick={() => onNavigate && onNavigate('Laporan Penggajian')}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: '#FAF5FF',
              color: '#9333EA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FileSpreadsheet size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <b style={{ display: 'block', fontSize: '13px', color: 'var(--text-main)' }}>
              Laporan & Ekspor Excel
            </b>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Rekapitulasi siap cetak
            </span>
          </div>
          <ArrowRight size={16} color="var(--text-muted)" />
        </div>
      </div>
    </section>
  );
}
