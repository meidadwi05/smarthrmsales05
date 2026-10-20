import React, { useState, useMemo } from 'react';
import {
  X,
  Check,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  Building2,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Layers,
  CheckSquare,
  Square
} from 'lucide-react';
import { Button } from './common/index.js';

// Master data statistik karyawan perusahaan
export const CATEGORY_STATS = {
  Tetap: 86,
  Kontrak: 38,
  Harian: 12,
  Mingguan: 8,
  Probation: 4
};

export const DIVISION_STATS = {
  'IT': 42,
  'Keuangan & Akuntansi': 18,
  'Operasional': 38,
  'Pemasaran': 20,
  'SDM & HRD': 6
};

// Roster karyawan contoh sesuai spesifikasi
export const DEFAULT_MODAL_ROSTER = [
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

export default function CreatePeriodModal({
  isOpen,
  onClose,
  onSaveDraft,
  saving = false,
  allEmployees = DEFAULT_MODAL_ROSTER
}) {
  if (!isOpen) return null;

  // Field Bagian 1: Informasi Periode
  const [formInfo, setFormInfo] = useState({
    name: 'Penggajian Oktober 2026',
    payrollType: 'Bulanan',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    cutoffDate: '2026-10-25',
    paymentDate: '2026-10-31'
  });

  // State Bagian 2: Karyawan yang Diproses
  // Mode: 'category' | 'division' | 'manual'
  const [selectionMode, setSelectionMode] = useState('category');

  // Kategori selection state (Default: Tetap & Kontrak = 86 + 38 = 124)
  const [selectedCategories, setSelectedCategories] = useState({
    Tetap: true,
    Kontrak: true,
    Harian: false,
    Mingguan: false,
    Probation: false
  });

  // Divisi selection state (Default: semua divisi)
  const [selectedDivisions, setSelectedDivisions] = useState({
    'IT': true,
    'Keuangan & Akuntansi': true,
    'Operasional': true,
    'Pemasaran': true,
    'SDM & HRD': true
  });

  // Manual selection set of employee IDs (used when mode === 'manual')
  const [manualSelectedIds, setManualSelectedIds] = useState(() => {
    // Default manual: Tetap and Kontrak
    return new Set(
      allEmployees
        .filter((e) => e.category === 'Tetap' || e.category === 'Kontrak')
        .map((e) => e.id)
    );
  });

  // Excluded employee IDs (unchecking in Karyawan Terpilih)
  const [excludedIds, setExcludedIds] = useState(new Set());

  // Manually Added Employees (Override via [+ Tambah Karyawan])
  const [overrideAddedEmployees, setOverrideAddedEmployees] = useState([]);
  const [showAddPicker, setShowAddPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');

  // Table filter states in Karyawan Terpilih
  const [rosterSearch, setRosterSearch] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('Semua Divisi');
  const [manualStatusFilter, setManualStatusFilter] = useState('Semua Status');

  // Validation Error Message
  const [validationError, setValidationError] = useState('');

  // Perhitungan Base Headcount berdasarkan Selection Mode
  const baseHeadcount = useMemo(() => {
    if (selectionMode === 'category') {
      let count = 0;
      Object.keys(selectedCategories).forEach((cat) => {
        if (selectedCategories[cat]) count += CATEGORY_STATS[cat] || 0;
      });
      return count;
    } else if (selectionMode === 'division') {
      let count = 0;
      Object.keys(selectedDivisions).forEach((div) => {
        if (selectedDivisions[div]) count += DIVISION_STATS[div] || 0;
      });
      return count;
    } else {
      // Manual selection
      return manualSelectedIds.size;
    }
  }, [selectionMode, selectedCategories, selectedDivisions, manualSelectedIds]);

  // Tambahkan override karyawan manual yang tidak ada di base
  const totalBaseWithOverride = baseHeadcount + overrideAddedEmployees.length;

  // Realtime Active Employees Count
  const activeCount = Math.max(0, totalBaseWithOverride - excludedIds.size);
  const excludedCount = excludedIds.size;

  // Daftar Karyawan Terpilih yang Ditampilkan dalam Tabel
  const currentRosterList = useMemo(() => {
    let list = [];

    if (selectionMode === 'category') {
      list = allEmployees.filter((emp) => Boolean(selectedCategories[emp.category]));
    } else if (selectionMode === 'division') {
      list = allEmployees.filter((emp) => {
        const divKey = Object.keys(selectedDivisions).find(
          (k) => emp.division?.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(emp.division?.toLowerCase())
        );
        return divKey ? selectedDivisions[divKey] : false;
      });
    } else {
      // Manual mode
      list = allEmployees.filter((emp) => manualSelectedIds.has(emp.id));
    }

    // Gabungkan dengan override added employees jika belum ada
    overrideAddedEmployees.forEach((overrideEmp) => {
      if (!list.some((e) => e.id === overrideEmp.id)) {
        list.push(overrideEmp);
      }
    });

    return list;
  }, [selectionMode, selectedCategories, selectedDivisions, manualSelectedIds, allEmployees, overrideAddedEmployees]);

  // Filter Karyawan Terpilih di dalam Tabel (Search & Divisi Filter)
  const filteredRoster = useMemo(() => {
    return currentRosterList.filter((emp) => {
      const q = rosterSearch.toLowerCase();
      const matchSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.code.toLowerCase().includes(q) ||
        emp.division.toLowerCase().includes(q) ||
        emp.position.toLowerCase().includes(q);

      const matchDiv =
        divisionFilter === 'Semua Divisi' ||
        emp.division?.toLowerCase().includes(divisionFilter.toLowerCase());

      const matchStatus =
        manualStatusFilter === 'Semua Status' ||
        emp.status === manualStatusFilter;

      return matchSearch && matchDiv && matchStatus;
    });
  }, [currentRosterList, rosterSearch, divisionFilter, manualStatusFilter]);

  // Toggle Category Card
  const handleToggleCategory = (cat) => {
    setSelectedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat]
    }));
    setValidationError('');
  };

  // Toggle Division Card
  const handleToggleDivision = (div) => {
    setSelectedDivisions((prev) => ({
      ...prev,
      [div]: !prev[div]
    }));
    setValidationError('');
  };

  // Select / Deselect All Divisions
  const handleToggleAllDivisions = (selectAll) => {
    const next = {};
    Object.keys(DIVISION_STATS).forEach((k) => {
      next[k] = selectAll;
    });
    setSelectedDivisions(next);
    setValidationError('');
  };

  // Toggle Exclude / Include Karyawan di Tabel Terpilih
  const handleToggleExclude = (empId) => {
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) {
        next.delete(empId);
      } else {
        next.add(empId);
      }
      return next;
    });
  };

  // Toggle Manual Selection Checkbox
  const handleToggleManual = (empId) => {
    setManualSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(empId)) {
        next.delete(empId);
      } else {
        next.add(empId);
      }
      return next;
    });
    setValidationError('');
  };

  // Select / Deselect All Visible in Table
  const handleMasterCheckboxToggle = () => {
    const allVisibleIncluded = filteredRoster.every((e) => !excludedIds.has(e.id));
    setExcludedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleIncluded) {
        // Exclude all currently visible
        filteredRoster.forEach((e) => next.add(e.id));
      } else {
        // Include all currently visible
        filteredRoster.forEach((e) => next.delete(e.id));
      }
      return next;
    });
  };

  // Add Employee via Picker
  const handleAddEmployeeFromPicker = (emp) => {
    if (!overrideAddedEmployees.some((e) => e.id === emp.id)) {
      setOverrideAddedEmployees((prev) => [...prev, emp]);
      // Pastikan tidak excluded
      setExcludedIds((prev) => {
        const next = new Set(prev);
        next.delete(emp.id);
        return next;
      });
      // Juga tandai di manual jika dalam mode manual
      setManualSelectedIds((prev) => new Set(prev).add(emp.id));
    }
    setShowAddPicker(false);
  };

  // Available employees for picker
  const pickerAvailableEmployees = useMemo(() => {
    const currentIds = new Set(currentRosterList.map((e) => e.id));
    return allEmployees.filter((e) => {
      const isAlreadyIn = currentIds.has(e.id);
      const matchSearch =
        !pickerSearch ||
        e.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        e.code.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        e.division.toLowerCase().includes(pickerSearch.toLowerCase());
      return !isAlreadyIn && matchSearch;
    });
  }, [allEmployees, currentRosterList, pickerSearch]);

  // Validasi & Submit Draft
  const handleSubmitDraft = (e) => {
    e.preventDefault();

    // 1. Validasi Nama Periode
    if (!formInfo.name.trim()) {
      setValidationError('Nama periode penggajian wajib diisi.');
      return;
    }

    // 2. Validasi Tanggal
    if (!formInfo.startDate || !formInfo.endDate) {
      setValidationError('Periode kerja (tanggal mulai dan selesai) wajib ditentukan.');
      return;
    }

    if (!formInfo.cutoffDate) {
      setValidationError('Tanggal Tutup Data wajib ditentukan.');
      return;
    }

    if (!formInfo.paymentDate) {
      setValidationError('Tanggal pembayaran tidak boleh kosong.');
      return;
    }

    // Tanggal Tutup Data tidak boleh melewati tanggal akhir periode kerja
    if (new Date(formInfo.cutoffDate) > new Date(formInfo.endDate)) {
      setValidationError('Tanggal Tutup Data tidak boleh melewati tanggal akhir periode kerja.');
      return;
    }

    // 3. Validasi Minimal 1 Karyawan
    if (activeCount < 1) {
      setValidationError('Minimal pilih 1 karyawan untuk membuat periode penggajian.');
      return;
    }

    setValidationError('');

    const payload = {
      name: formInfo.name.trim(),
      payrollType: formInfo.payrollType,
      startDate: formInfo.startDate,
      endDate: formInfo.endDate,
      cutoffDate: formInfo.cutoffDate,
      paymentDate: formInfo.paymentDate,
      totalEmployees: activeCount,
      totalEligible: activeCount,
      totalAmount: 0,
      status: 'Draft',
      selectionMode,
      employeeCategories: Object.keys(selectedCategories).filter((c) => selectedCategories[c]),
      selectedEmployeeIds: currentRosterList
        .filter((e) => !excludedIds.has(e.id))
        .map((e) => e.id)
    };

    onSaveDraft(payload);
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px'
      }}
    >
      <div
        className="modal-dialog-large"
        style={{
          width: '920px',
          maxWidth: '92vw',
          maxHeight: '85vh',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px #e2e8f0',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* 4. HEADER MODAL (STICKY / FIXED)                                          */}
        {/* ========================================================================= */}
        <div
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
            <h3
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.01em'
              }}
            >
              Buat Periode Penggajian
            </h3>
            <p
              style={{
                margin: '3px 0 0',
                fontSize: '13px',
                color: '#64748b'
              }}
            >
              Tentukan periode, jenis penggajian, dan karyawan yang akan diproses.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Modal"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: 'none',
              background: '#f1f5f9',
              color: '#64748b',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* BODY MODAL SCROLLABLE                                                     */}
        {/* ========================================================================= */}
        <form
          onSubmit={handleSubmitDraft}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '22px 24px',
              overflowY: 'auto',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Banner Validasi Jika Ada Error */}
            {validationError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#b91c1c',
                  fontSize: '13px',
                  fontWeight: 500
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{validationError}</span>
              </div>
            )}

            {/* ===================================================================== */}
            {/* 5. SECTION INFORMASI PERIODE                                          */}
            {/* ===================================================================== */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '18px 20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
              }}
            >
              <div style={{ marginBottom: '14px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#2563eb',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase'
                  }}
                >
                  INFORMASI PERIODE
                </span>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Tentukan jadwal dan jenis penggajian.
                </p>
              </div>

              {/* Grid 2 Kolom Informasi Periode */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: '14px 16px'
                }}
              >
                {/* Nama Periode */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '6px'
                    }}
                  >
                    Nama Periode <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="smart-input"
                    placeholder="Contoh: Penggajian Oktober 2026"
                    value={formInfo.name}
                    onChange={(e) => {
                      setFormInfo({ ...formInfo, name: e.target.value });
                      setValidationError('');
                    }}
                    style={{ height: '42px', fontSize: '13px' }}
                  />
                </div>

                {/* Jenis Penggajian */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: '6px'
                    }}
                  >
                    Jenis Penggajian <span style={{ color: '#e11d48' }}>*</span>
                  </label>
                  <select
                    className="smart-select"
                    value={formInfo.payrollType}
                    onChange={(e) => {
                      setFormInfo({ ...formInfo, payrollType: e.target.value });
                      setValidationError('');
                    }}
                    style={{ height: '42px', width: '100%', fontSize: '13px' }}
                  >
                    <option value="Bulanan">Bulanan</option>
                    <option value="Mingguan">Mingguan</option>
                    <option value="Harian">Harian</option>
                  </select>
                </div>

                {/* KONDISIONAL TANGGAL BERDASARKAN JENIS PENGGAJIAN */}
                {formInfo.payrollType === 'Bulanan' && (
                  <>
                    {/* Periode Kerja (Start & End) */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '6px'
                        }}
                      >
                        Periode Kerja <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr auto 1fr',
                          alignItems: 'center',
                          gap: '10px'
                        }}
                      >
                        <input
                          type="date"
                          required
                          className="smart-input"
                          value={formInfo.startDate}
                          onChange={(e) => {
                            setFormInfo({ ...formInfo, startDate: e.target.value });
                            setValidationError('');
                          }}
                          style={{ height: '42px', fontSize: '13px' }}
                        />
                        <span style={{ color: '#94a3b8', fontWeight: 600 }}>—</span>
                        <input
                          type="date"
                          required
                          className="smart-input"
                          value={formInfo.endDate}
                          onChange={(e) => {
                            setFormInfo({ ...formInfo, endDate: e.target.value });
                            setValidationError('');
                          }}
                          style={{ height: '42px', fontSize: '13px' }}
                        />
                      </div>
                    </div>

                    {/* Tanggal Tutup Data */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '6px'
                        }}
                      >
                        Tanggal Tutup Data <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="smart-input"
                        value={formInfo.cutoffDate}
                        onChange={(e) => {
                          setFormInfo({ ...formInfo, cutoffDate: e.target.value });
                          setValidationError('');
                        }}
                        style={{ height: '42px', fontSize: '13px' }}
                      />
                      <small
                        style={{
                          fontSize: '11px',
                          color: '#64748b',
                          marginTop: '5px',
                          display: 'block'
                        }}
                      >
                        Batas terakhir penarikan data absensi, lembur, dan transaksi payroll.
                      </small>
                    </div>

                    {/* Tanggal Pembayaran */}
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '6px'
                        }}
                      >
                        Tanggal Pembayaran <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="smart-input"
                        value={formInfo.paymentDate}
                        onChange={(e) => {
                          setFormInfo({ ...formInfo, paymentDate: e.target.value });
                          setValidationError('');
                        }}
                        style={{ height: '42px', fontSize: '13px' }}
                      />
                      <small
                        style={{
                          fontSize: '11px',
                          color: '#64748b',
                          marginTop: '5px',
                          display: 'block'
                        }}
                      >
                        Jadwal pembayaran gaji kepada karyawan.
                      </small>
                    </div>
                  </>
                )}

                {formInfo.payrollType === 'Mingguan' && (
                  <>
                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '6px'
                        }}
                      >
                        Tanggal Mulai <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="smart-input"
                        value={formInfo.startDate}
                        onChange={(e) => setFormInfo({ ...formInfo, startDate: e.target.value })}
                        style={{ height: '42px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '6px'
                        }}
                      >
                        Tanggal Akhir <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="smart-input"
                        value={formInfo.endDate}
                        onChange={(e) => setFormInfo({ ...formInfo, endDate: e.target.value })}
                        style={{ height: '42px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '6px'
                        }}
                      >
                        Tanggal Tutup Data <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="smart-input"
                        value={formInfo.cutoffDate}
                        onChange={(e) => setFormInfo({ ...formInfo, cutoffDate: e.target.value })}
                        style={{ height: '42px', fontSize: '13px' }}
                      />
                      <small style={{ fontSize: '11px', color: '#64748b', marginTop: '5px', display: 'block' }}>
                        Batas terakhir penarikan data absensi dan lembur.
                      </small>
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '6px'
                        }}
                      >
                        Tanggal Pembayaran <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="smart-input"
                        value={formInfo.paymentDate}
                        onChange={(e) => setFormInfo({ ...formInfo, paymentDate: e.target.value })}
                        style={{ height: '42px', fontSize: '13px' }}
                      />
                      <small style={{ fontSize: '11px', color: '#64748b', marginTop: '5px', display: 'block' }}>
                        Jadwal pembayaran gaji mingguan.
                      </small>
                    </div>
                  </>
                )}

                {formInfo.payrollType === 'Harian' && (
                  <>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '6px'
                        }}
                      >
                        Tanggal Penggajian <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="smart-input"
                        value={formInfo.startDate}
                        onChange={(e) => {
                          setFormInfo({
                            ...formInfo,
                            startDate: e.target.value,
                            endDate: e.target.value
                          });
                        }}
                        style={{ height: '42px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '6px'
                        }}
                      >
                        Tanggal Tutup Data <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="smart-input"
                        value={formInfo.cutoffDate}
                        onChange={(e) => setFormInfo({ ...formInfo, cutoffDate: e.target.value })}
                        style={{ height: '42px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#334155',
                          marginBottom: '6px'
                        }}
                      >
                        Tanggal Pembayaran <span style={{ color: '#e11d48' }}>*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="smart-input"
                        value={formInfo.paymentDate}
                        onChange={(e) => setFormInfo({ ...formInfo, paymentDate: e.target.value })}
                        style={{ height: '42px', fontSize: '13px' }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ===================================================================== */}
            {/* 6. SECTION KARYAWAN YANG DIPROSES                                     */}
            {/* ===================================================================== */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '18px 20px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)'
              }}
            >
              <div style={{ marginBottom: '14px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    color: '#2563eb',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase'
                  }}
                >
                  KARYAWAN YANG DIPROSES
                </span>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Tentukan karyawan yang akan dimasukkan ke dalam periode penggajian ini.
                </p>
              </div>

              {/* SEGMENTED CONTROL (Bukan radio button yang tersebar) */}
              <div
                style={{
                  display: 'flex',
                  background: '#f1f5f9',
                  padding: '4px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  gap: '4px'
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectionMode('category');
                    setValidationError('');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: selectionMode === 'category' ? 700 : 500,
                    color: selectionMode === 'category' ? '#2563eb' : '#64748b',
                    background: selectionMode === 'category' ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: selectionMode === 'category' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Berdasarkan Kategori
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectionMode('division');
                    setValidationError('');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: selectionMode === 'division' ? 700 : 500,
                    color: selectionMode === 'division' ? '#2563eb' : '#64748b',
                    background: selectionMode === 'division' ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: selectionMode === 'division' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Berdasarkan Divisi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectionMode('manual');
                    setValidationError('');
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: selectionMode === 'manual' ? 700 : 500,
                    color: selectionMode === 'manual' ? '#2563eb' : '#64748b',
                    background: selectionMode === 'manual' ? '#ffffff' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: selectionMode === 'manual' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Pilih Manual
                </button>
              </div>

              {/* 7. MODE BERDASARKAN KATEGORI */}
              {selectionMode === 'category' && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '10px'
                  }}
                >
                  {Object.keys(CATEGORY_STATS).map((cat) => {
                    const isSelected = Boolean(selectedCategories[cat]);
                    const count = CATEGORY_STATS[cat];

                    return (
                      <div
                        key={cat}
                        onClick={() => handleToggleCategory(cat)}
                        style={{
                          background: isSelected ? '#eff6ff' : '#ffffff',
                          border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              color: isSelected ? '#1e40af' : '#1e293b'
                            }}
                          >
                            Karyawan {cat}
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              color: isSelected ? '#2563eb' : '#64748b'
                            }}
                          >
                            {count} karyawan
                          </span>
                        </div>

                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '4px',
                            display: 'grid',
                            placeItems: 'center',
                            background: isSelected ? '#2563eb' : '#ffffff',
                            border: isSelected ? 'none' : '1.5px solid #cbd5e1',
                            color: '#ffffff',
                            flexShrink: 0
                          }}
                        >
                          {isSelected && <Check size={12} strokeWidth={3} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 8. MODE BERDASARKAN DIVISI */}
              {selectionMode === 'division' && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px'
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                      Pilih Divisi
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleAllDivisions(true)}
                        style={{
                          fontSize: '11px',
                          color: '#2563eb',
                          background: 'none',
                          border: 'none',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Pilih Semua Divisi
                      </button>
                      <span style={{ color: '#cbd5e1' }}>•</span>
                      <button
                        type="button"
                        onClick={() => handleToggleAllDivisions(false)}
                        style={{
                          fontSize: '11px',
                          color: '#64748b',
                          background: 'none',
                          border: 'none',
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        Batal Pilih Semua
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: '10px'
                    }}
                  >
                    {Object.keys(DIVISION_STATS).map((div) => {
                      const isSelected = Boolean(selectedDivisions[div]);
                      const count = DIVISION_STATS[div];

                      return (
                        <div
                          key={div}
                          onClick={() => handleToggleDivision(div)}
                          style={{
                            background: isSelected ? '#eff6ff' : '#ffffff',
                            border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '8px',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                color: isSelected ? '#1e40af' : '#1e293b'
                              }}
                            >
                              {div}
                            </div>
                            <span
                              style={{
                                fontSize: '11px',
                                color: isSelected ? '#2563eb' : '#64748b'
                              }}
                            >
                              {count} karyawan
                            </span>
                          </div>

                          <div
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              display: 'grid',
                              placeItems: 'center',
                              background: isSelected ? '#2563eb' : '#ffffff',
                              border: isSelected ? 'none' : '1.5px solid #cbd5e1',
                              color: '#ffffff',
                              flexShrink: 0
                            }}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 9. MODE PILIH MANUAL (Langsung Employee Selector) */}
              {selectionMode === 'manual' && (
                <div style={{ marginBottom: '4px' }}>
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                      marginBottom: '10px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <input
                        type="text"
                        className="smart-input"
                        placeholder="Cari nama atau ID karyawan..."
                        value={rosterSearch}
                        onChange={(e) => setRosterSearch(e.target.value)}
                        style={{ height: '36px', fontSize: '12px' }}
                      />
                    </div>
                    <select
                      className="smart-select"
                      value={divisionFilter}
                      onChange={(e) => setDivisionFilter(e.target.value)}
                      style={{ height: '36px', fontSize: '12px', minWidth: '130px' }}
                    >
                      <option value="Semua Divisi">Semua Divisi</option>
                      <option value="IT">IT</option>
                      <option value="Keuangan & Akuntansi">Keuangan</option>
                      <option value="Operasional">Operasional</option>
                      <option value="Pemasaran">Pemasaran</option>
                      <option value="SDM & HRD">SDM & HRD</option>
                    </select>
                    <select
                      className="smart-select"
                      value={manualStatusFilter}
                      onChange={(e) => setManualStatusFilter(e.target.value)}
                      style={{ height: '36px', fontSize: '12px', minWidth: '120px' }}
                    >
                      <option value="Semua Status">Semua Status</option>
                      <option value="Aktif">Aktif</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* 10. RINGKASAN KARYAWAN (SUMMARY BAR)                                  */}
              {/* ===================================================================== */}
              <div
                style={{
                  marginTop: '14px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} color="#2563eb" />
                  <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: 700 }}>
                    {activeCount} karyawan akan diproses
                  </span>
                </div>

                {excludedCount > 0 && (
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#b91c1c',
                      background: '#fee2e2',
                      border: '1px solid #fecaca',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontWeight: 600
                    }}
                  >
                    {excludedCount} dikecualikan
                  </span>
                )}
              </div>

              {/* ===================================================================== */}
              {/* 11 & 12. SECTION KARYAWAN TERPILIH & TOMBOL TAMBAH KARYAWAN           */}
              {/* ===================================================================== */}
              <div style={{ marginTop: '18px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      KARYAWAN TERPILIH
                    </h4>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#64748b' }}>
                      Daftar karyawan yang akan diproses dalam periode ini.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectionMode !== 'manual' && (
                      <>
                        <div style={{ width: '180px' }}>
                          <input
                            type="text"
                            className="smart-input"
                            placeholder="Cari nama atau ID..."
                            value={rosterSearch}
                            onChange={(e) => setRosterSearch(e.target.value)}
                            style={{ height: '32px', fontSize: '12px' }}
                          />
                        </div>

                        <select
                          className="smart-select"
                          value={divisionFilter}
                          onChange={(e) => setDivisionFilter(e.target.value)}
                          style={{ height: '32px', fontSize: '11px', width: '130px' }}
                        >
                          <option value="Semua Divisi">Semua Divisi</option>
                          <option value="IT">IT</option>
                          <option value="Keuangan & Akuntansi">Keuangan</option>
                          <option value="Operasional">Operasional</option>
                          <option value="Pemasaran">Pemasaran</option>
                          <option value="SDM & HRD">SDM & HRD</option>
                        </select>
                      </>
                    )}

                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                      onClick={() => setShowAddPicker(true)}
                      style={{ height: '32px', fontSize: '12px' }}
                    >
                      + Tambah Karyawan
                    </Button>
                  </div>
                </div>

                {/* Popover / Mini Picker Penambahan Karyawan Override */}
                {showAddPicker && (
                  <div
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderRadius: '10px',
                      padding: '12px',
                      marginBottom: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}
                    >
                      <b style={{ fontSize: '12px', color: '#0f172a' }}>
                        Pilih Karyawan Tambahan (Override)
                      </b>
                      <button
                        type="button"
                        onClick={() => setShowAddPicker(false)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <input
                      type="text"
                      className="smart-input"
                      placeholder="Cari karyawan untuk ditambahkan..."
                      value={pickerSearch}
                      onChange={(e) => setPickerSearch(e.target.value)}
                      style={{ height: '32px', fontSize: '12px', marginBottom: '8px' }}
                    />

                    <div style={{ maxHeight: '130px', overflowY: 'auto' }}>
                      {pickerAvailableEmployees.length === 0 ? (
                        <div style={{ fontSize: '11px', color: '#94a3b8', padding: '8px', textAlign: 'center' }}>
                          Tidak ada karyawan tambahan yang dapat dipilih.
                        </div>
                      ) : (
                        pickerAvailableEmployees.map((emp) => (
                          <div
                            key={emp.id}
                            onClick={() => handleAddEmployeeFromPicker(emp)}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '12px',
                              borderBottom: '1px solid #f1f5f9'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = '#e2e8f0')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <div>
                              <b style={{ color: '#0f172a' }}>{emp.name}</b>
                              <span style={{ color: '#64748b', marginLeft: '6px' }}>({emp.code})</span>
                              <span style={{ color: '#94a3b8', marginLeft: '6px' }}>• {emp.division}</span>
                            </div>
                            <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '11px' }}>
                              + Tambah
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Table Compact Karyawan Terpilih */}
                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    maxHeight: '210px',
                    overflowY: 'auto'
                  }}
                >
                  <table className="payroll-table" style={{ margin: 0 }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                      <tr>
                        <th style={{ width: '40px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={
                              filteredRoster.length > 0 &&
                              filteredRoster.every((r) =>
                                selectionMode === 'manual'
                                  ? manualSelectedIds.has(r.id)
                                  : !excludedIds.has(r.id)
                              )
                            }
                            onChange={
                              selectionMode === 'manual'
                                ? () => {
                                    const allChecked = filteredRoster.every((r) => manualSelectedIds.has(r.id));
                                    setManualSelectedIds((prev) => {
                                      const next = new Set(prev);
                                      if (allChecked) {
                                        filteredRoster.forEach((r) => next.delete(r.id));
                                      } else {
                                        filteredRoster.forEach((r) => next.add(r.id));
                                      }
                                      return next;
                                    });
                                  }
                                : handleMasterCheckboxToggle
                            }
                            style={{ cursor: 'pointer' }}
                            title="Centang semua / Hilangkan semua"
                          />
                        </th>
                        <th style={{ width: '100px' }}>ID</th>
                        <th>NAMA KARYAWAN</th>
                        <th>DIVISI</th>
                        <th>JABATAN</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRoster.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            style={{
                              textAlign: 'center',
                              padding: '24px',
                              color: '#94a3b8',
                              fontSize: '12px'
                            }}
                          >
                            Tidak ada karyawan yang cocok dengan kriteria pemilihan saat ini.
                          </td>
                        </tr>
                      ) : (
                        filteredRoster.map((emp) => {
                          const isChecked =
                            selectionMode === 'manual'
                              ? manualSelectedIds.has(emp.id)
                              : !excludedIds.has(emp.id);

                          return (
                            <tr
                              key={emp.id}
                              style={{
                                background: isChecked ? '#ffffff' : '#f8fafc',
                                opacity: isChecked ? 1 : 0.55,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <td style={{ textAlign: 'center' }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (selectionMode === 'manual') {
                                      handleToggleManual(emp.id);
                                    } else {
                                      handleToggleExclude(emp.id);
                                    }
                                  }}
                                  style={{ cursor: 'pointer' }}
                                />
                              </td>
                              <td>
                                <span
                                  style={{
                                    fontFamily: '"JetBrains Mono", monospace',
                                    fontSize: '11px',
                                    color: '#64748b'
                                  }}
                                >
                                  {emp.code}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <b style={{ fontSize: '12px', color: '#0f172a' }}>
                                    {emp.name}
                                  </b>
                                  {!isChecked && (
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        background: '#fee2e2',
                                        color: '#b91c1c',
                                        padding: '1px 5px',
                                        borderRadius: '4px'
                                      }}
                                    >
                                      Dikecualikan
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ fontSize: '12px', color: '#475569' }}>
                                {emp.division}
                              </td>
                              <td style={{ fontSize: '12px', color: '#475569' }}>
                                {emp.position}
                              </td>
                              <td>
                                <span
                                  className="status present"
                                  style={{ fontSize: '10px', padding: '2px 6px' }}
                                >
                                  {emp.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 13. FOOTER MODAL (STICKY / FIXED)                                         */}
          {/* ========================================================================= */}
          <div
            style={{
              padding: '16px 24px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: activeCount > 0 ? '#1e40af' : '#94a3b8'
                }}
              >
                {activeCount} karyawan akan diproses
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={saving}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                disabled={activeCount < 1 || saving}
              >
                Simpan sebagai Draft
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
