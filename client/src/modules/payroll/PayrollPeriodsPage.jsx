import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Plus,
  ArrowRight,
  Eye,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  Users,
  Building2,
  AlertCircle
} from 'lucide-react';
import { formatRupiah, formatDateIndo } from './utils/formatters.js';
import {
  PageHeader,
  Button,
  SearchInput,
  FilterSelect,
  StatusBadge,
  TypeBadge,
  Pagination,
  EmptyState
} from './components/common/index.js';
import PayrollProcessPage from './PayrollProcessPage.jsx';
import CreatePeriodModal from './components/CreatePeriodModal.jsx';

// Data Roster Karyawan Standar untuk Wizard Seleksi
const INITIAL_ROSTER = [
  { id: 'emp-109', code: 'EMP-00109', name: 'Joko Widodo', division: 'Operasional', position: 'Staff Gudang', category: 'Kontrak', status: 'Aktif' },
  { id: 'emp-113', code: 'EMP-00113', name: 'Nugroho Pratama', division: 'Operasional', position: 'Staff Logistik', category: 'Kontrak', status: 'Aktif' },
  { id: 'emp-121', code: 'EMP-00121', name: 'Andi Prasetyo', division: 'IT', position: 'Software Engineer', category: 'Tetap', status: 'Aktif' },
  { id: 'emp-123', code: 'EMP-00123', name: 'Budi Santoso', division: 'Operasional', position: 'Supervisor Operasional', category: 'Tetap', status: 'Aktif' },
  { id: 'emp-104', code: 'EMP-00104', name: 'Dewi Lestari', division: 'Keuangan & Akuntansi', position: 'Finance Manager', category: 'Tetap', status: 'Aktif' },
  { id: 'emp-105', code: 'EMP-00105', name: 'Eko Prasetya', division: 'SDM & HRD', position: 'HR Operations', category: 'Tetap', status: 'Aktif' },
  { id: 'emp-106', code: 'EMP-00106', name: 'Fajar Nugraha', division: 'Operasional', position: 'Logistics Lead', category: 'Tetap', status: 'Aktif' },
  { id: 'emp-107', code: 'EMP-00107', name: 'Cindy Putri', division: 'Pemasaran', position: 'Account Executive', category: 'Tetap', status: 'Aktif' },
  { id: 'emp-108', code: 'EMP-00108', name: 'Hadi Gunawan', division: 'IT', position: 'DevOps Engineer', category: 'Kontrak', status: 'Aktif' },
  { id: 'emp-110', code: 'EMP-00110', name: 'Indah Kusuma', division: 'Keuangan & Akuntansi', position: 'Tax Specialist', category: 'Kontrak', status: 'Aktif' },
  { id: 'emp-111', code: 'EMP-00111', name: 'Kurnia Mega', division: 'Operasional', position: 'Operator Mesin', category: 'Harian', status: 'Aktif' },
  { id: 'emp-112', code: 'EMP-00112', name: 'Lukman Hakim', division: 'Operasional', position: 'Staff Lapangan', category: 'Harian', status: 'Aktif' },
  { id: 'emp-114', code: 'EMP-00114', name: 'Maya Safira', division: 'Pemasaran', position: 'Event Coordinator', category: 'Mingguan', status: 'Aktif' },
  { id: 'emp-115', code: 'EMP-00115', name: 'Nurul Huda', division: 'SDM & HRD', position: 'HR Intern', category: 'Probation', status: 'Aktif' },
  { id: 'emp-116', code: 'EMP-00116', name: 'Panji Gumilang', division: 'Operasional', position: 'Driver Operasional', category: 'Tetap', status: 'Aktif' },
  { id: 'emp-117', code: 'EMP-00117', name: 'Qori Amalia', division: 'Keuangan & Akuntansi', position: 'Cashier Head', category: 'Tetap', status: 'Aktif' },
  { id: 'emp-118', code: 'EMP-00118', name: 'Rian Pratama', division: 'IT', position: 'QA Engineer', category: 'Kontrak', status: 'Aktif' },
  { id: 'emp-119', code: 'EMP-00119', name: 'Siti Rahma', division: 'SDM & HRD', position: 'Payroll Officer', category: 'Tetap', status: 'Aktif' },
  { id: 'emp-120', code: 'EMP-00120', name: 'Gita Permata', division: 'Pemasaran', position: 'Graphic Designer', category: 'Kontrak', status: 'Aktif' }
];

// Jumlah master statistik kategori perusahaan
const CATEGORY_STATS = {
  Tetap: 86,
  Kontrak: 38,
  Harian: 12,
  Mingguan: 8,
  Probation: 4
};

export default function PayrollPeriodsPage({ API, onNavigate, userRole }) {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Navigasi ke Halaman Penuh Proses/Perhitungan Periode Tertentu
  const [selectedPeriodForProcess, setSelectedPeriodForProcess] = useState(null);

  // State Modal Wizard "Buat Periode Penggajian"
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  // Field Bagian A: Informasi Periode
  const [formInfo, setFormInfo] = useState({
    name: 'Penggajian Oktober 2026',
    payrollType: 'Bulanan',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    cutoffDate: '2026-10-25',
    paymentDate: '2026-10-31'
  });

  // Field Bagian B: Pilih Karyawan
  const [selectionMethod, setSelectionMethod] = useState('category'); // 'category' | 'division' | 'department' | 'manual'
  const [selectedCategories, setSelectedCategories] = useState({
    Tetap: true,
    Kontrak: true,
    Harian: false,
    Mingguan: false,
    Probation: false
  });

  // Field Bagian C: Roster Karyawan Terpilih
  const [employeeRoster, setEmployeeRoster] = useState(INITIAL_ROSTER);
  const [rosterSearch, setRosterSearch] = useState('');
  const [excludedEmployeeIds, setExcludedEmployeeIds] = useState(new Set());

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/payroll/periods`);
      const data = await res.json();
      setPeriods(data.periods || []);
    } catch (err) {
      console.error('Error fetching periods:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
    // Tarik daftar karyawan dari backend jika tersedia
    fetch(`${API}/api/payroll/employees`)
      .then((r) => r.json())
      .then((data) => {
        if (data.employees && data.employees.length > 0) {
          const mapped = data.employees.map((e) => ({
            id: e.id,
            code: e.code || `EMP-${e.id}`,
            name: e.name,
            division: e.division || e.department || 'Operasional',
            position: e.position || 'Staff',
            category: e.status || 'Tetap',
            status: 'Aktif'
          }));
          setEmployeeRoster(mapped);
        }
      })
      .catch(() => {});
  }, [API]);

  // Kalkulasi total jumlah karyawan yang akan diproses
  const totalCategoryHeadcount = useMemo(() => {
    let count = 0;
    Object.keys(selectedCategories).forEach((cat) => {
      if (selectedCategories[cat]) {
        count += CATEGORY_STATS[cat] || 0;
      }
    });
    return count;
  }, [selectedCategories]);

  // Daftar karyawan yang tampil di Bagian C berdasarkan kategori aktif
  const eligibleRoster = useMemo(() => {
    return employeeRoster.filter((emp) => {
      return selectedCategories[emp.category] ?? true;
    });
  }, [employeeRoster, selectedCategories]);

  // Karyawan terpilih di modal setelah memperhitungkan search & manual exclude
  const filteredRoster = useMemo(() => {
    return eligibleRoster.filter((emp) => {
      const q = rosterSearch.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.code.toLowerCase().includes(q) ||
        emp.division.toLowerCase().includes(q) ||
        emp.position.toLowerCase().includes(q)
      );
    });
  }, [eligibleRoster, rosterSearch]);

  const activeEmployeesCount = Math.max(0, totalCategoryHeadcount - excludedEmployeeIds.size);

  const handleToggleCategory = (catKey) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [catKey]: !prev[catKey]
    }));
  };

  const handleToggleExcludeEmployee = (empId) => {
    setExcludedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) {
        next.delete(empId);
      } else {
        next.add(empId);
      }
      return next;
    });
  };

  const [toastMessage, setToastMessage] = useState('');

  const handleSaveDraft = async (payload) => {
    setSavingDraft(true);
    try {
      const res = await fetch(`${API}/api/payroll/periods`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setShowWizardModal(false);
        await fetchPeriods();
        setToastMessage('Periode Penggajian berhasil dibuat sebagai Draft.');
        setTimeout(() => setToastMessage(''), 3500);
      } else {
        alert(data.error || 'Gagal menyimpan periode penggajian');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan: ' + err.message);
    } finally {
      setSavingDraft(false);
    }
  };

  const filteredPeriods = periods.filter((p) => {
    const matchSearch =
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.id || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Semua' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPeriods.length / perPage));
  const paginatedPeriods = filteredPeriods.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Helper Aksi Tombol pada Tabel
  const renderActionButton = (period) => {
    const status = period.status || '';

    if (status === 'Draft') {
      return (
        <Button
          variant="primary"
          size="sm"
          iconRight={ArrowRight}
          onClick={() => setSelectedPeriodForProcess(period)}
          title="Lanjutkan penyusunan dan kalkulasi draft penggajian"
        >
          Lanjutkan →
        </Button>
      );
    }

    if (status === 'Ditutup' || status === 'Slip Dipublikasikan') {
      return (
        <Button
          variant="secondary"
          size="sm"
          icon={Eye}
          onClick={() => setSelectedPeriodForProcess(period)}
          title="Lihat rincian arsip penggajian"
        >
          Lihat
        </Button>
      );
    }

    return (
      <Button
        variant="primary"
        size="sm"
        iconRight={ArrowRight}
        onClick={() => setSelectedPeriodForProcess(period)}
        title="Buka tahapan proses penggajian"
      >
        Proses →
      </Button>
    );
  };

  // Jika user memilih periode untuk melihat detail/perhitungan -> Buka Halaman Penuh
  if (selectedPeriodForProcess) {
    return (
      <PayrollProcessPage
        API={API}
        periodId={selectedPeriodForProcess.id}
        periodData={selectedPeriodForProcess}
        onBack={() => {
          setSelectedPeriodForProcess(null);
          fetchPeriods();
        }}
        onNavigate={onNavigate}
        activeRole={userRole}
      />
    );
  }

  return (
    <>
      <PageHeader
        breadcrumbs={['Home', 'Periode Penggajian']}
        eyebrow="PENGGAJIAN & KEUANGAN"
        title="Periode Penggajian"
        subtitle="Daftar jadwal penggajian berkala, status cut-off data, dan jadwal pembayaran."
        actions={
          <>
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={loading}
              onClick={fetchPeriods}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setShowWizardModal(true)}
            >
              + Buat Periode Penggajian
            </Button>
          </>
        }
      />

      {/* Main Single Card matching Data Karyawan & Data Divisi */}
      <section className="panel team-panel">
        <div className="panel-head">
          <div>
            <h2>Periode Penggajian</h2>
            <p>Kelola jadwal dan status proses penggajian perusahaan</p>
          </div>

          <div className="table-actions">
            <SearchInput
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Cari nama atau ID periode..."
              width="240px"
            />

            <FilterSelect
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
              options={[
                'Semua',
                'Draft',
                'Perhitungan',
                'Menunggu Pemeriksaan',
                'Menunggu Persetujuan',
                'Disetujui',
                'Menunggu Pembayaran',
                'Dibayar',
                'Slip Dipublikasikan',
                'Ditutup'
              ]}
            />

            <FilterSelect
              value={perPage}
              onChange={(val) => {
                setPerPage(Number(val));
                setCurrentPage(1);
              }}
              options={[
                { value: 10, label: '10 Baris' },
                { value: 25, label: '25 Baris' },
                { value: 50, label: '50 Baris' }
              ]}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="payroll-table">
            <thead>
              <tr>
                <th style={{ width: '220px' }}>NAMA PERIODE</th>
                <th style={{ width: '100px' }}>JENIS</th>
                <th>PERIODE KERJA</th>
                <th>TUTUP DATA</th>
                <th>PEMBAYARAN</th>
                <th>KARYAWAN</th>
                <th>TOTAL GAJI</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right', width: '130px' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#8a97a9' }}>
                    Memuat data periode penggajian...
                  </td>
                </tr>
              ) : paginatedPeriods.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '32px' }}>
                    <EmptyState
                      icon={Calendar}
                      title="Tidak Ada Periode Penggajian"
                      description={
                        search || statusFilter !== 'Semua'
                          ? 'Tidak ada periode yang cocok dengan kriteria pencarian Anda.'
                          : 'Belum ada periode penggajian yang dibuat. Klik tombol di atas untuk membuat jadwal baru.'
                      }
                      action={
                        !search && statusFilter === 'Semua' ? (
                          <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowWizardModal(true)}>
                            Buat Periode Penggajian
                          </Button>
                        ) : null
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginatedPeriods.map((period) => (
                  <tr key={period.id}>
                    <td>
                      <div>
                        <b style={{ fontSize: '13px', color: 'var(--text-heading, #0f172a)', display: 'block' }}>
                          {period.name}
                        </b>
                        <small style={{ fontSize: '11px', color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace' }}>
                          {period.id?.toUpperCase()}
                        </small>
                      </div>
                    </td>
                    <td>
                      <TypeBadge type={period.payrollType || 'Bulanan'} />
                    </td>
                    <td className="time-cell">
                      {formatDateIndo(period.startDate)} – {formatDateIndo(period.endDate)}
                    </td>
                    <td className="time-cell">
                      {formatDateIndo(period.cutoffDate)}
                    </td>
                    <td className="time-cell">
                      {formatDateIndo(period.paymentDate)}
                    </td>
                    <td>
                      <b style={{ color: 'var(--text-primary, #0f172a)' }}>
                        {period.status === 'Draft'
                          ? period.totalEmployees || 86
                          : period.paidEmployees || period.totalEmployees || 86}
                      </b>
                      <small style={{ color: '#94a3b8' }}>
                        {' '}/ {period.totalEmployees || 86} org
                      </small>
                    </td>
                    <td>
                      <b style={{ fontFamily: '"JetBrains Mono", monospace', color: 'var(--text-primary, #0f172a)' }}>
                        {period.status === 'Draft' ? 'Rp 0' : formatRupiah(period.totalAmount || 0)}
                      </b>
                    </td>
                    <td>
                      <StatusBadge status={period.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {renderActionButton(period)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredPeriods.length}
          pageSize={perPage}
          onPageChange={setCurrentPage}
        />
      </section>

      {/* ========================================================================= */}
      {/* MODAL: BUAT PERIODE PENGGAJIAN (ENTERPRISE SaaS COMPACT & MODERN)         */}
      {/* ========================================================================= */}
      <CreatePeriodModal
        isOpen={showWizardModal}
        onClose={() => setShowWizardModal(false)}
        onSaveDraft={handleSaveDraft}
        saving={savingDraft}
        allEmployees={employeeRoster}
      />

      {/* ========================================================================= */}
      {/* TOAST NOTIFIKASI SUKSES (SLIDE-IN SLEEK BANNER)                           */}
      {/* ========================================================================= */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 10000,
            background: '#ffffff',
            border: '1px solid #bfdbfe',
            borderLeft: '4px solid #2563eb',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
            borderRadius: '10px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'modalFadeIn 0.2s ease-out'
          }}
        >
          <CheckCircle2 size={20} color="#2563eb" style={{ flexShrink: 0 }} />
          <div>
            <b style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Sukses</b>
            <span style={{ fontSize: '12px', color: '#475569' }}>{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}
