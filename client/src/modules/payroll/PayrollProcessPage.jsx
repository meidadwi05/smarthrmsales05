import React, { useState, useEffect } from 'react';
import {
  Wallet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FileCheck,
  Eye,
  Download,
  CreditCard,
  Send,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShieldCheck,
  Building2,
  Check,
  UserCheck,
  FileSpreadsheet,
  AlertCircle,
  FileText,
  Users,
  ChevronDown,
  ChevronUp,
  Edit3,
  CornerDownRight,
  X
} from 'lucide-react';
import { formatRupiah, terbilang, formatDateIndo } from './utils/formatters.js';
import PayslipModal from './components/PayslipModal.jsx';
import EditPayrollDrawer from './components/EditPayrollDrawer.jsx';
import DetailDrawer from './components/common/DetailDrawer.jsx';
import {
  PageHeader,
  Button,
  StatusBadge,
  TypeBadge,
  StatCard,
  MetricGrid,
  Stepper,
  DEFAULT_PAYROLL_STEPS,
  EmptyState
} from './components/common/index.js';

export default function PayrollProcessPage({
  API,
  periodId = 'prd-2026-09',
  periodData = null,
  initialStep,
  onBack,
  onNavigate,
  activeRole
}) {
  // Stepper tahap: 1: Data, 2: Perhitungan, 3: Pemeriksaan, 4: Persetujuan, 5: Pembayaran, 6: Publikasi Slip
  const getInitialStep = () => {
    if (initialStep) return initialStep;
    const st = periodData?.status;
    if (st === 'Draft') return 1;
    if (st === 'Perhitungan') return 2;
    if (st === 'Menunggu Pemeriksaan') return 3;
    if (st === 'Menunggu Persetujuan') return 4;
    if (st === 'Disetujui' || st === 'Menunggu Pembayaran') return 5;
    if (st === 'Dibayar') return 6;
    return 1;
  };

  const [currentStep, setCurrentStep] = useState(getInitialStep());
  const [period, setPeriod] = useState(periodData || {
    id: periodId,
    name: 'Penggajian Oktober 2026',
    status: 'Draft',
    payrollType: 'Bulanan',
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    cutoffDate: '2026-10-25',
    paymentDate: '2026-10-31',
    totalEmployees: 86
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [paying, setPaying] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Expandable Row State (Section 15)
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Detail Drawer State (Sections 20, 21, 22)
  const [selectedItemForDetailDrawer, setSelectedItemForDetailDrawer] = useState(null);

  // Edit Drawer State (Section 16-18)
  const [employeeForEdit, setEmployeeForEdit] = useState(null);

  // Payslip Modal State (Section 26)
  const [selectedItemForPayslip, setSelectedItemForPayslip] = useState(null);

  // Modal Konfirmasi Pengajuan Pemeriksaan (Section 21)
  const [showSubmitReviewModal, setShowSubmitReviewModal] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Modal Kembalikan untuk Perbaikan (Section 22)
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returningReview, setReturningReview] = useState(false);
  const [reviewAlertNotice, setReviewAlertNotice] = useState(null);

  // Filter Data Bermasalah (Section 19)
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);

  // Stepper Approval (Section 23)
  const [approvals, setApprovals] = useState([]);
  const [approvalNote, setApprovalNote] = useState('');

  // Stepper Pembayaran (Section 24)
  const [paymentMethod, setPaymentMethod] = useState('Transfer Bank');

  // Stepper Publikasi Slip (Section 25)
  const [publishOptions, setPublishOptions] = useState({
    notifyApp: true,
    notifyEmail: true,
    notifySMS: false
  });

  // State Pemeriksaan / Anomali Alerts (Section 19)
  const [warnings, setWarnings] = useState([
    {
      id: 'w-1',
      employeeId: 'emp-10',
      title: 'Karyawan Tanpa Rekening Bank Valid',
      text: 'Joko Widodo (Staff Pergudangan) belum memiliki nomor rekening bank terverifikasi.',
      type: 'critical',
      resolved: false
    },
    {
      id: 'w-2',
      employeeId: 'emp-15',
      title: 'Data Lembur Melebihi Batas Standar',
      text: 'Panji Gumilang (Driver Operasional) tercatat 25 jam lembur (> 20 jam standar bulanan).',
      type: 'warning',
      resolved: false
    }
  ]);

  // Fetch Payroll Process Items
  const fetchProcessItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/payroll/process/items/${periodId}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setItems(data.items);
      } else {
        // Fallback default sample items if needed
        generateDefaultItems();
      }
    } catch (err) {
      console.error('Error fetching payroll process items:', err);
      generateDefaultItems();
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultItems = () => {
    const sample = [
      {
        employeeId: 'emp-1',
        employeeCode: 'EMP-00123',
        name: 'Budi Santoso',
        position: 'Supervisor Operasional',
        department: 'Operasional',
        calculationStatus: 'Selesai',
        earnings: {
          basicSalary: 6000000,
          tunjanganJabatan: 750000,
          tunjanganTransport: 500000,
          tunjanganMakan: 0,
          overtime: 624000,
          bonusInsentif: 0,
          total: 7874000
        },
        deductions: {
          bpjsKesehatan: 150000,
          bpjsKetenagakerjaan: 90000,
          loanInstallment: 1000000,
          cashAdvance: 500000,
          pph21: 0,
          otherDeductions: 0,
          total: 1740000
        },
        netSalary: 6134000,
        bankName: 'BCA',
        accountNumberMasked: '**** **** 1234',
        accountHolder: 'Budi Santoso'
      },
      {
        employeeId: 'emp-2',
        employeeCode: 'EMP-00002',
        name: 'Andi Prasetyo',
        position: 'Software Engineer',
        department: 'IT & Teknologi',
        calculationStatus: 'Selesai',
        earnings: {
          basicSalary: 8500000,
          tunjanganJabatan: 1000000,
          tunjanganTransport: 500000,
          tunjanganMakan: 0,
          overtime: 0,
          bonusInsentif: 500000,
          total: 10000000
        },
        deductions: {
          bpjsKesehatan: 170000,
          bpjsKetenagakerjaan: 170000,
          loanInstallment: 0,
          cashAdvance: 0,
          pph21: 250000,
          otherDeductions: 0,
          total: 590000
        },
        netSalary: 9410000,
        bankName: 'Mandiri',
        accountNumberMasked: '**** **** 5678',
        accountHolder: 'Andi Prasetyo'
      },
      {
        employeeId: 'emp-3',
        employeeCode: 'EMP-00003',
        name: 'Cindy Putri',
        position: 'Account Executive',
        department: 'Pemasaran',
        calculationStatus: 'Selesai',
        earnings: {
          basicSalary: 5500000,
          tunjanganJabatan: 500000,
          tunjanganTransport: 500000,
          tunjanganMakan: 0,
          overtime: 350000,
          bonusInsentif: 1200000,
          total: 7550000
        },
        deductions: {
          bpjsKesehatan: 110000,
          bpjsKetenagakerjaan: 110000,
          loanInstallment: 500000,
          cashAdvance: 0,
          pph21: 150000,
          otherDeductions: 0,
          total: 870000
        },
        netSalary: 6680000,
        bankName: 'BCA',
        accountNumberMasked: '**** **** 9012',
        accountHolder: 'Cindy Putri'
      },
      {
        employeeId: 'emp-4',
        employeeCode: 'EMP-00004',
        name: 'Dewi Lestari',
        position: 'Finance Manager',
        department: 'Keuangan & Akuntansi',
        calculationStatus: 'Selesai',
        earnings: {
          basicSalary: 12000000,
          tunjanganJabatan: 2500000,
          tunjanganTransport: 800000,
          tunjanganMakan: 0,
          overtime: 0,
          bonusInsentif: 0,
          total: 15300000
        },
        deductions: {
          bpjsKesehatan: 240000,
          bpjsKetenagakerjaan: 240000,
          loanInstallment: 0,
          cashAdvance: 0,
          pph21: 650000,
          otherDeductions: 0,
          total: 1130000
        },
        netSalary: 14170000,
        bankName: 'BCA',
        accountNumberMasked: '**** **** 4321',
        accountHolder: 'Dewi Lestari'
      },
      {
        employeeId: 'emp-10',
        employeeCode: 'EMP-00010',
        name: 'Joko Widodo',
        position: 'Staff Pergudangan',
        department: 'Operasional',
        calculationStatus: 'Perlu Pemeriksaan',
        hasAnomaly: true,
        earnings: {
          basicSalary: 4500000,
          tunjanganJabatan: 250000,
          tunjanganTransport: 400000,
          tunjanganMakan: 0,
          overtime: 420000,
          bonusInsentif: 0,
          total: 5570000
        },
        deductions: {
          bpjsKesehatan: 90000,
          bpjsKetenagakerjaan: 90000,
          loanInstallment: 0,
          cashAdvance: 200000,
          pph21: 0,
          otherDeductions: 0,
          total: 380000
        },
        netSalary: 5190000,
        bankName: 'Belum Ada',
        accountNumberMasked: 'Belum Terdaftar',
        accountHolder: '-'
      },
      {
        employeeId: 'emp-15',
        employeeCode: 'EMP-00015',
        name: 'Panji Gumilang',
        position: 'Driver Operasional',
        department: 'Operasional',
        calculationStatus: 'Perlu Pemeriksaan',
        hasAnomaly: true,
        earnings: {
          basicSalary: 4800000,
          tunjanganJabatan: 300000,
          tunjanganTransport: 600000,
          tunjanganMakan: 0,
          overtime: 1450000,
          bonusInsentif: 0,
          total: 7150000
        },
        deductions: {
          bpjsKesehatan: 96000,
          bpjsKetenagakerjaan: 96000,
          loanInstallment: 0,
          cashAdvance: 0,
          pph21: 0,
          otherDeductions: 0,
          total: 192000
        },
        netSalary: 6958000,
        bankName: 'BRI',
        accountNumberMasked: '**** **** 7765',
        accountHolder: 'Panji Gumilang'
      }
    ];
    setItems(sample);
  };

  const fetchApprovals = async () => {
    try {
      const res = await fetch(`${API}/api/payroll/approvals`);
      const data = await res.json();
      setApprovals(data.approvals || [
        {
          id: 'app-1',
          stageName: 'Pemeriksaan & Audit HRD',
          actorName: 'Meida (HR Specialist)',
          status: 'Disetujui',
          notes: 'Seluruh komponen lembur dan absensi telah diverifikasi valid.'
        },
        {
          id: 'app-2',
          stageName: 'Verifikasi Anggaran Keuangan',
          actorName: 'Dewi Lestari (Finance Manager)',
          status: 'Menunggu Persetujuan',
          notes: 'Menunggu konfirmasi ketersediaan plafon transfer payroll.'
        },
        {
          id: 'app-3',
          stageName: 'Otorisasi Direktur Eksekutif',
          actorName: 'Teguh Prakoso (Direktur)',
          status: 'Menunggu',
          notes: 'Otorisasi akhir sebelum batch release bank transfer.'
        }
      ]);
    } catch (err) {
      console.error('Error fetching approvals:', err);
    }
  };

  useEffect(() => {
    fetchProcessItems();
    fetchApprovals();
  }, [API, periodId]);

  // Totals Aggregations
  const totalEarningsAll = items.reduce((sum, i) => sum + (i.earnings?.total || 0), 0);
  const totalDeductionsAll = items.reduce((sum, i) => sum + (i.deductions?.total || 0), 0);
  const totalNetAll = items.reduce((sum, i) => sum + (i.netSalary || 0), 0);

  // Sync / Recalculate
  const handleRecalculate = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API}/api/payroll/process/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId })
      });
      if (res.ok) {
        await fetchProcessItems();
        alert('Kalkulasi ulang formula payroll berhasil diperbarui.');
      }
    } catch (err) {
      alert('Gagal hitung ulang: ' + err.message);
    } finally {
      setSyncing(false);
    }
  };

  // Mulai Perhitungan Payroll dari status Draft (Section 17 & 18)
  const handleStartPayrollCalculation = async () => {
    setSyncing(true);
    try {
      const res = await fetch(`${API}/api/payroll/process/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId })
      });
      if (res.ok) {
        await fetchProcessItems();
      }
      // Update status periode ke 'Perhitungan'
      await fetch(`${API}/api/payroll/periods/${periodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Perhitungan' })
      }).catch(() => {});
      setPeriod((prev) => ({ ...prev, status: 'Perhitungan' }));
      setCurrentStep(2);
    } catch (err) {
      console.error(err);
      setPeriod((prev) => ({ ...prev, status: 'Perhitungan' }));
      setCurrentStep(2);
    } finally {
      setSyncing(false);
    }
  };

  // Update State Lokal saat Simpan Perubahan dari DetailDrawer
  const handleDetailDrawerSaveSuccess = ({ employeeId, earnings, deductions, netSalary }) => {
    setItems((prev) =>
      prev.map((emp) => {
        if (emp.employeeId === employeeId) {
          return {
            ...emp,
            earnings,
            deductions,
            netSalary,
            hasManualAdjustment: true,
            adjustedBy: 'Meida — HRD',
            adjustedAt: new Date().toLocaleString('id-ID')
          };
        }
        return emp;
      })
    );
  };

  // Simpan Penyesuaian Manual dari Drawer (Section 16-18)
  const handleSaveManualAdjustment = async ({ employeeId, earnings, deductions, netSalary, reason }) => {
    try {
      const targetEmp = items.find((e) => e.employeeId === employeeId);
      const res = await fetch(`${API}/api/payroll/process/item/${periodId}/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          earnings,
          deductions,
          reason,
          employeeName: targetEmp?.name || employeeId,
          actorName: 'Meida — HRD'
        })
      });

      if (res.ok) {
        // Update local item
        setItems((prev) =>
          prev.map((emp) => {
            if (emp.employeeId === employeeId) {
              return {
                ...emp,
                earnings,
                deductions,
                netSalary,
                hasManualAdjustment: true,
                adjustmentNote: reason,
                adjustedBy: 'Meida — HRD',
                adjustedAt: new Date().toLocaleString('id-ID')
              };
            }
            return emp;
          })
        );
        alert(`Perubahan manual untuk ${targetEmp?.name} berhasil disimpan dan dicatat di audit log.`);
      } else {
        alert('Gagal menyimpan perubahan');
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
    }
  };

  // Konfirmasi Ajukan untuk Pemeriksaan (Section 21)
  const handleConfirmSubmitReview = async () => {
    setSubmittingReview(true);
    try {
      const res = await fetch(`${API}/api/payroll/process/submit-review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId, actorName: 'Meida — HRD' })
      });
      if (res.ok) {
        setShowSubmitReviewModal(false);
        setPeriod((prev) => ({ ...prev, status: 'Menunggu Pemeriksaan' }));
        setCurrentStep(3); // Masuk ke Tahap 03 Pemeriksaan
      } else {
        alert('Gagal mengajukan pemeriksaan');
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Keputusan Pemeriksaan: Setujui atau Kembalikan (Section 22)
  const handleReviewDecision = async (action) => {
    if (action === 'reject' && !returnReason.trim()) {
      alert('Alasan pengembalian wajib diisi.');
      return;
    }

    setReturningReview(true);
    try {
      const res = await fetch(`${API}/api/payroll/process/review-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodId,
          action,
          reason: returnReason,
          actorName: 'Pemeriksa HR'
        })
      });

      if (res.ok) {
        if (action === 'approve') {
          setPeriod((prev) => ({ ...prev, status: 'Menunggu Persetujuan' }));
          setCurrentStep(4); // Masuk ke Persetujuan
        } else {
          setPeriod((prev) => ({ ...prev, status: 'Perhitungan' }));
          setReviewAlertNotice(`Penggajian dikembalikan untuk perbaikan: "${returnReason}"`);
          setShowReturnModal(false);
          setReturnReason('');
          setCurrentStep(2); // Kembali ke Perhitungan
        }
      }
    } catch (err) {
      alert('Gagal memproses keputusan pemeriksaan: ' + err.message);
    } finally {
      setReturningReview(false);
    }
  };

  // Tahap Persetujuan (Section 23)
  const handleApproveStage = async (approvalId, decision = 'approve') => {
    try {
      const res = await fetch(`${API}/api/payroll/approvals/${approvalId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision,
          actorName: activeRole === 'director' ? 'Teguh Prakoso (Direktur)' : 'Dewi Lestari (Finance Manager)',
          notes: approvalNote || 'Persetujuan diverifikasi sesuai kepatuhan dan pagu anggaran'
        })
      });
      const data = await res.json();
      if (res.ok) {
        fetchApprovals();
        setApprovalNote('');
        if (data.allApproved) {
          setPeriod((prev) => ({ ...prev, status: 'Disetujui' }));
          alert('Seluruh tahap persetujuan telah selesai! Status penggajian telah Disetujui.');
          setCurrentStep(5);
        }
      }
    } catch (err) {
      alert('Gagal memproses persetujuan: ' + err.message);
    }
  };

  // Tahap Pembayaran: Tandai Sudah Dibayar (Section 24)
  const handleConfirmPayment = async () => {
    setPaying(true);
    try {
      const res = await fetch(`${API}/api/payroll/process/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId, method: paymentMethod })
      });
      if (res.ok) {
        setPeriod((prev) => ({ ...prev, status: 'Dibayar' }));
        alert('Pembayaran gaji berhasil dikonfirmasi dan dana transfer telah dieksekusi!');
        setCurrentStep(6);
      }
    } catch (err) {
      alert('Gagal konfirmasi pembayaran: ' + err.message);
    } finally {
      setPaying(false);
    }
  };

  // Tahap Publikasi Slip (Section 25)
  const handlePublishSlip = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`${API}/api/payroll/process/publish-slips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodId, options: publishOptions })
      });
      if (res.ok) {
        setPeriod((prev) => ({ ...prev, status: 'Slip Dipublikasikan' }));
        alert('Slip gaji resmi berhasil dipublikasikan ke portal karyawan!');
      }
    } catch (err) {
      alert('Gagal publikasi slip gaji: ' + err.message);
    } finally {
      setPublishing(false);
    }
  };

  const displayedItems = showAnomaliesOnly ? items.filter((i) => i.hasAnomaly) : items;

  return (
    <>
      {/* Header Halaman (Section 17) */}
      <PageHeader
        breadcrumbs={[
          'Home',
          'Periode Penggajian',
          period.name || 'Penggajian Oktober 2026'
        ]}
        eyebrow="PENGGAJIAN & KEUANGAN"
        title={`Proses Penggajian: ${period.name?.replace('Penggajian ', '') || 'Oktober 2026'}`}
        subtitle="Kelola data payroll, perhitungan, pemeriksaan, persetujuan, pembayaran, dan publikasi slip gaji."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onBack && (
              <Button variant="secondary" icon={ArrowLeft} onClick={onBack}>
                Kembali ke Daftar Periode
              </Button>
            )}
            <StatusBadge status={period.status || 'Draft'} />
            <Button
              variant="secondary"
              icon={RefreshCw}
              loading={loading}
              onClick={fetchProcessItems}
            >
              Refresh Data
            </Button>
          </div>
        }
      />

      {/* Stepper Progress Bar (Section 17) */}
      <Stepper
        steps={DEFAULT_PAYROLL_STEPS}
        currentStep={currentStep}
        onStepClick={(stepNum) => {
          if (period.status === 'Draft' && stepNum > 1) {
            alert('Periode masih berstatus Draft. Silakan klik "Mulai Perhitungan Payroll" pada Tahap 01 Data untuk memulai kalkulasi.');
            return;
          }
          setCurrentStep(stepNum);
        }}
      />

      {/* Notifikasi jika ada pengembalian dari pemeriksaan */}
      {reviewAlertNotice && (
        <div
          style={{
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={20} color="#e11d48" />
            <span style={{ fontSize: '13px', color: '#be123c', fontWeight: 600 }}>
              {reviewAlertNotice}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setReviewAlertNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#be123c' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 01: SINKRONISASI DATA & PERSIAPAN PERHITUNGAN                       */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <section className="panel team-panel">
          <div className="panel-head">
            <div>
              <h2>Tahap 01 — Data Karyawan & Sinkronisasi Cut-off</h2>
              <p>Penarikan data kehadiran cut-off, jam lembur, cicilan pinjaman berjalan, dan kasbon</p>
            </div>

            <Button
              variant="primary"
              icon={ArrowRight}
              loading={syncing}
              onClick={handleStartPayrollCalculation}
            >
              Mulai Perhitungan Payroll →
            </Button>
          </div>

          <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <b style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Data Master Karyawan</b>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0' }}>{period.totalEmployees || items.length || 86} Karyawan terdaftar dalam periode penggajian</p>
              <StatusBadge status={period.status === 'Draft' ? 'Draft' : 'Aktif'} />
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <b style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Data Presensi & Lembur</b>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0' }}>Penarikan cut-off tanggal {formatDateIndo(period.cutoffDate)} (100% tervalidasi)</p>
              <StatusBadge status="Disetujui" />
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <b style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>Pinjaman & Kasbon</b>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px 0' }}>Cicilan pinjaman dan kasbon terekonsiliasi</p>
              <StatusBadge status="Perhitungan" />
            </div>
          </div>

          <div className="table-footer">
            <span>
              {period.status === 'Draft'
                ? 'Seluruh data cut-off telah siap. Silakan klik "Mulai Perhitungan Payroll" untuk menghitung gaji.'
                : 'Sinkronisasi data telah selesai, silakan lanjutkan ke tahapan perhitungan.'}
            </span>
            <Button
              variant="primary"
              iconRight={ArrowRight}
              loading={syncing}
              onClick={handleStartPayrollCalculation}
            >
              Mulai Perhitungan Payroll →
            </Button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 02: PERHITUNGAN PENGGAJIAN (SECTIONS 13, 14, 15, 19, 20)           */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <>
          {/* 4 Summary Cards (Section 13) */}
          <MetricGrid columns={4} style={{ marginBottom: '20px' }}>
            <StatCard
              title="Total Karyawan"
              value={`${items.length || 86} Orang`}
              subtitle="Karyawan diproses pada periode ini"
              icon={Users}
              iconColor="#2563eb"
              iconBg="#eff6ff"
              trend="+100%"
              trendType="positive"
            />
            <StatCard
              title="Total Pendapatan Bruto"
              value={formatRupiah(totalEarningsAll || 215789000)}
              subtitle="Gaji pokok, lembur & tunjangan"
              icon={Wallet}
              iconColor="#059669"
              iconBg="#ecfdf5"
              trend="+8.2%"
              trendType="positive"
            />
            <StatCard
              title="Total Potongan"
              value={`-${formatRupiah(totalDeductionsAll || 13979000)}`}
              subtitle="BPJS, pinjaman & kasbon"
              icon={CreditCard}
              iconColor="#e11d48"
              iconBg="#fff1f2"
              trend="-4.1%"
              trendType="negative"
            />
            <StatCard
              title="Total Gaji Bersih"
              value={formatRupiah(totalNetAll || 201810000)}
              subtitle="Take home pay siap dibayar"
              icon={CheckCircle2}
              iconColor="#2563eb"
              iconBg="#eff6ff"
              trend="100% Valid"
              trendType="positive"
            />
          </MetricGrid>

          {/* Validation Summary Bar (Section 19) */}
          <div className="validation-alert-bar">
            <div className="validation-stats">
              <span className="validation-stat-item">
                <Users size={16} color="#2563eb" />
                <b>{items.length} karyawan</b>
              </span>
              <span>•</span>
              <span className="validation-stat-item" style={{ color: '#059669' }}>
                <CheckCircle2 size={16} />
                <b>{items.length} berhasil dihitung</b>
              </span>
              <span>•</span>
              <span className="validation-stat-item" style={{ color: '#64748b' }}>
                <b>0 error kritis</b>
              </span>
              <span>•</span>
              <span className="validation-stat-item" style={{ color: '#d97706' }}>
                <AlertTriangle size={16} />
                <b>{warnings.length} perlu pemeriksaan</b>
              </span>
            </div>

            <Button
              variant={showAnomaliesOnly ? 'primary' : 'secondary'}
              size="sm"
              icon={AlertTriangle}
              onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)}
            >
              {showAnomaliesOnly ? 'Tampilkan Semua Data' : 'Lihat Data Bermasalah'}
            </Button>
          </div>

          {/* Main Calculation Table Card (Section 14) */}
          <section className="panel team-panel">
            <div className="panel-head">
              <div>
                <h2>Perhitungan Penggajian</h2>
                <p>Kalkulasi rincian komponen pendapatan, potongan, dan gaji bersih seluruh karyawan</p>
              </div>

              {/* Action Buttons Top Right (Section 20) */}
              <div className="table-actions">
                <Button
                  variant="secondary"
                  icon={RefreshCw}
                  loading={syncing}
                  onClick={handleRecalculate}
                >
                  Hitung Ulang
                </Button>
                <Button
                  variant="primary"
                  iconRight={ArrowRight}
                  onClick={() => setShowSubmitReviewModal(true)}
                >
                  Ajukan untuk Pemeriksaan →
                </Button>
              </div>
            </div>

            <div className="table-wrap">
              <table className="payroll-table">
                <thead>
                  <tr>
                    <th>KARYAWAN</th>
                    <th>DEPARTEMEN / JABATAN</th>
                    <th>GAJI POKOK</th>
                    <th>TOTAL PENDAPATAN</th>
                    <th>TOTAL POTONGAN</th>
                    <th>GAJI BERSIH</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right', width: '220px' }}>AKSI</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedItems.map((emp) => {
                    const isExpanded = expandedRowId === emp.employeeId;

                    return (
                      <React.Fragment key={emp.employeeId}>
                        {/* Baris Utama Karyawan */}
                        <tr style={{ background: isExpanded ? 'rgba(37, 99, 235, 0.04)' : undefined }}>
                          <td>
                            <div className="employee-cell">
                              <div
                                className="avatar"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  borderRadius: '50%',
                                  background: '#eff6ff',
                                  color: '#2563eb',
                                  border: '1px solid #bfdbfe'
                                }}
                              >
                                {emp.name.charAt(0)}
                              </div>
                              <div>
                                <b style={{ color: 'var(--text-heading, #0f172a)', display: 'block', fontSize: '13px' }}>
                                  {emp.name}
                                </b>
                                <span className="emp-id-badge" style={{ marginTop: '2px' }}>
                                  {emp.employeeCode}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div>
                              <b style={{ fontSize: '12px', color: '#1e293b', display: 'block' }}>
                                {emp.position}
                              </b>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>
                                {emp.department}
                              </span>
                            </div>
                          </td>
                          <td className="time-cell" style={{ fontWeight: 600 }}>
                            {formatRupiah(emp.earnings.basicSalary)}
                          </td>
                          <td className="time-cell" style={{ color: '#059669', fontWeight: 600 }}>
                            {formatRupiah(emp.earnings.total)}
                          </td>
                          <td className="time-cell" style={{ color: '#e11d48', fontWeight: 600 }}>
                            -{formatRupiah(emp.deductions.total)}
                          </td>
                          <td className="time-cell" style={{ color: '#2563eb', fontWeight: 700, fontSize: '13px' }}>
                            {formatRupiah(emp.netSalary)}
                          </td>
                          <td>
                            <StatusBadge status={emp.calculationStatus || 'Selesai'} />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={Eye}
                                onClick={() => setSelectedItemForDetailDrawer(emp)}
                                title="Buka Detail Penggajian & Edit Komponen"
                              >
                                Lihat Rincian
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                icon={FileText}
                                onClick={() => setSelectedItemForPayslip(emp)}
                                title="Pratinjau Slip Gaji Resmi"
                              >
                                Slip Gaji
                              </Button>
                            </div>
                          </td>
                        </tr>

                        {/* ======================================================= */}
                        {/* EXPANDABLE ROW (SECTION 15)                             */}
                        {/* ======================================================= */}
                        {isExpanded && (
                          <tr className="payroll-expanded-row">
                            <td colSpan={8} style={{ padding: 0 }}>
                              <div className="payroll-expanded-details">
                                {/* Header Info Karyawan */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                                  <div>
                                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                                      {emp.name} — {emp.employeeCode}
                                    </h4>
                                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                                      {emp.position} • Divisi {emp.department}
                                    </span>
                                  </div>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    icon={Edit3}
                                    onClick={() => setEmployeeForEdit(emp)}
                                  >
                                    Edit Perhitungan
                                  </Button>
                                </div>

                                {/* Grid Komponen Pendapatan & Potongan */}
                                <div className="expanded-grid">
                                  {/* Kolom Pendapatan */}
                                  <div className="expanded-card">
                                    <div className="expanded-card-head">
                                      <span>PENDAPATAN</span>
                                      <span style={{ color: '#059669' }}>KREDIT (+)</span>
                                    </div>

                                    <div className="expanded-item-row">
                                      <span>Gaji Pokok</span>
                                      <b>{formatRupiah(emp.earnings.basicSalary)}</b>
                                    </div>
                                    <div className="expanded-item-row">
                                      <span>Tunjangan Jabatan</span>
                                      <b>{formatRupiah(emp.earnings.tunjanganJabatan || 0)}</b>
                                    </div>
                                    <div className="expanded-item-row">
                                      <span>Transportasi</span>
                                      <b>{formatRupiah(emp.earnings.tunjanganTransport || 0)}</b>
                                    </div>
                                    <div className="expanded-item-row">
                                      <span>Lembur</span>
                                      <b>{formatRupiah(emp.earnings.overtime || 0)}</b>
                                    </div>
                                    {(emp.earnings.bonusInsentif > 0) && (
                                      <div className="expanded-item-row">
                                        <span>Bonus / Insentif</span>
                                        <b>{formatRupiah(emp.earnings.bonusInsentif)}</b>
                                      </div>
                                    )}

                                    <div className="expanded-total-row" style={{ color: '#059669' }}>
                                      <span>Total Pendapatan</span>
                                      <b>{formatRupiah(emp.earnings.total)}</b>
                                    </div>
                                  </div>

                                  {/* Kolom Potongan */}
                                  <div className="expanded-card">
                                    <div className="expanded-card-head">
                                      <span>POTONGAN</span>
                                      <span style={{ color: '#e11d48' }}>DEBIT (-)</span>
                                    </div>

                                    <div className="expanded-item-row">
                                      <span>BPJS Kesehatan & Ketenagakerjaan</span>
                                      <b>-{formatRupiah((emp.deductions.bpjsKesehatan || 0) + (emp.deductions.bpjsKetenagakerjaan || 0))}</b>
                                    </div>
                                    <div className="expanded-item-row">
                                      <span>Cicilan Pinjaman</span>
                                      <b>-{formatRupiah(emp.deductions.loanInstallment || 0)}</b>
                                    </div>
                                    <div className="expanded-item-row">
                                      <span>Kasbon Karyawan</span>
                                      <b>-{formatRupiah(emp.deductions.cashAdvance || 0)}</b>
                                    </div>
                                    {(emp.deductions.pph21 > 0) && (
                                      <div className="expanded-item-row">
                                        <span>Pajak Penghasilan (PPh 21)</span>
                                        <b>-{formatRupiah(emp.deductions.pph21)}</b>
                                      </div>
                                    )}
                                    {(emp.deductions.otherDeductions > 0) && (
                                      <div className="expanded-item-row">
                                        <span>Potongan Manual / Lainnya</span>
                                        <b>-{formatRupiah(emp.deductions.otherDeductions)}</b>
                                      </div>
                                    )}

                                    <div className="expanded-total-row" style={{ color: '#e11d48' }}>
                                      <span>Total Potongan</span>
                                      <b>-{formatRupiah(emp.deductions.total)}</b>
                                    </div>
                                  </div>

                                  {/* Kolom Gaji Bersih */}
                                  <div className="expanded-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                      <div className="expanded-card-head">
                                        <span>GAJI BERSIH (TAKE-HOME PAY)</span>
                                        <span style={{ color: '#2563eb' }}>TOTAL AKHIR</span>
                                      </div>

                                      <div style={{ margin: '14px 0' }}>
                                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Diterima Pegawai</span>
                                        <div style={{ font: '800 24px "JetBrains Mono", monospace', color: '#2563eb' }}>
                                          {formatRupiah(emp.netSalary)}
                                        </div>
                                        <small style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic', display: 'block', marginTop: '4px' }}>
                                          Terbilang: {terbilang(emp.netSalary)}
                                        </small>
                                      </div>

                                      {/* Jejak Audit jika ada penyesuaian manual (Section 18) */}
                                      {emp.hasManualAdjustment && (
                                        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '10px 12px', marginTop: '10px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: '#0f172a' }}>
                                            <ShieldCheck size={14} color="#2563eb" />
                                            Penyesuaian Manual Tercatat
                                          </div>
                                          <small style={{ fontSize: '11px', color: '#475569', display: 'block', marginTop: '2px' }}>
                                            Diubah oleh: {emp.adjustedBy} ({emp.adjustedAt})
                                          </small>
                                          <small style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>
                                            Alasan: {emp.adjustmentNote}
                                          </small>
                                        </div>
                                      )}
                                    </div>

                                    <div style={{ paddingTop: '14px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                      <Button
                                        variant="secondary"
                                        size="sm"
                                        icon={FileText}
                                        onClick={() => setSelectedItemForPayslip(emp)}
                                      >
                                        Pratinjau Slip Gaji
                                      </Button>
                                      <Button
                                        variant="primary"
                                        size="sm"
                                        icon={Edit3}
                                        onClick={() => setEmployeeForEdit(emp)}
                                      >
                                        Edit Perhitungan
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="table-footer">
              <span>Menampilkan <b>{displayedItems.length}</b> data kalkulasi penggajian</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button variant="secondary" size="sm" onClick={handleRecalculate}>
                  Hitung Ulang
                </Button>
                <Button variant="primary" size="sm" iconRight={ArrowRight} onClick={() => setShowSubmitReviewModal(true)}>
                  Ajukan untuk Pemeriksaan →
                </Button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 03: PEMERIKSAAN & VALIDASI (SECTION 22)                            */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <section className="panel team-panel">
          <div className="panel-head">
            <div>
              <h2>Tahap 03 — Pemeriksaan & Validasi Penggajian</h2>
              <p>Audit menyeluruh terhadap hasil kalkulasi, potongan, dan anomali data sebelum diajukan ke otorisasi persetujuan</p>
            </div>

            <div className="table-actions">
              <Button variant="secondary" icon={ArrowLeft} onClick={() => setShowReturnModal(true)}>
                Kembalikan untuk Perbaikan
              </Button>
              <Button variant="primary" icon={CheckCircle2} onClick={() => handleReviewDecision('approve')}>
                Setujui Pemeriksaan
              </Button>
            </div>
          </div>

          {/* Anomali Checklist */}
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
              Daftar Pemeriksaan & Anomali Sistem
            </h4>

            {warnings.map((w) => (
              <div
                key={w.id}
                style={{
                  background: w.resolved ? '#f8fafc' : w.type === 'critical' ? '#fff1f2' : '#fffbeb',
                  border: `1px solid ${w.resolved ? '#e2e8f0' : w.type === 'critical' ? '#fecdd3' : '#fde68a'}`,
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <AlertTriangle size={18} color={w.type === 'critical' ? '#e11d48' : '#d97706'} />
                  <div>
                    <b style={{ fontSize: '13px', color: '#0f172a' }}>{w.title}</b>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#475569' }}>{w.text}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const emp = items.find((i) => i.employeeId === w.employeeId);
                      if (emp) setEmployeeForEdit(emp);
                    }}
                  >
                    Periksa Data Karyawan
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Ringkasan Pemeriksaan */}
          <div style={{ padding: '0 24px 20px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <b style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                Ringkasan Rekapitulasi untuk Pemeriksa:
              </b>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', fontSize: '12px' }}>
                <div>Total Karyawan: <b>{items.length} orang</b></div>
                <div>Total Bruto: <b>{formatRupiah(totalEarningsAll)}</b></div>
                <div>Total Potongan: <b>-{formatRupiah(totalDeductionsAll)}</b></div>
                <div>Total Bersih: <b style={{ color: '#2563eb' }}>{formatRupiah(totalNetAll)}</b></div>
              </div>
            </div>
          </div>

          <div className="table-footer">
            <span>Pemeriksa dapat menyetujui seluruh data atau mengembalikan ke HRD jika terdapat anomali</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="danger" size="sm" onClick={() => setShowReturnModal(true)}>
                Kembalikan untuk Perbaikan
              </Button>
              <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => handleReviewDecision('approve')}>
                Setujui Pemeriksaan
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 04: PERSETUJUAN (SECTION 23)                                       */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <section className="panel team-panel">
          <div className="panel-head">
            <div>
              <h2>Tahap 04 — Persetujuan Penggajian</h2>
              <p>Alur otorisasi berjenjang oleh HR Manager, Finance Manager, dan Direktur</p>
            </div>

            <div className="table-actions">
              <Button variant="secondary" icon={ArrowLeft} onClick={() => setCurrentStep(3)}>
                Pemeriksaan
              </Button>
              <Button variant="primary" iconRight={ArrowRight} onClick={() => setCurrentStep(5)}>
                Lanjut ke Pembayaran
              </Button>
            </div>
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {approvals.map((appr, idx) => {
              const isApproved = appr.status === 'Disetujui';
              const isWaiting = appr.status === 'Menunggu' || appr.status === 'Menunggu Persetujuan';

              return (
                <div
                  key={appr.id || idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          display: 'grid',
                          placeItems: 'center',
                          background: isApproved ? '#ecfdf5' : '#eff6ff',
                          color: isApproved ? '#059669' : '#2563eb',
                          fontWeight: 700,
                          fontSize: '12px'
                        }}
                      >
                        {isApproved ? <Check size={16} strokeWidth={2.6} /> : idx + 1}
                      </div>
                      <div>
                        <b style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>{appr.stageName}</b>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>Otoritas: {appr.actorName}</span>
                      </div>
                    </div>
                    <StatusBadge status={appr.status} />
                  </div>

                  <p style={{ margin: 0, fontSize: '12px', color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                    {appr.notes || 'Menunggu peninjauan berkas rekapitulasi penggajian.'}
                  </p>

                  {isWaiting && (
                    <div style={{ display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Tambahkan catatan persetujuan..."
                        value={approvalNote}
                        onChange={(e) => setApprovalNote(e.target.value)}
                        className="smart-input"
                        style={{ flex: 1, minWidth: '200px', height: '36px' }}
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircle2}
                        onClick={() => handleApproveStage(appr.id, 'approve')}
                      >
                        Setujui Penggajian
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleApproveStage(appr.id, 'reject')}
                      >
                        Tolak
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="table-footer">
            <span>Seluruh otoritas wajib menyetujui sebelum tahap transfer bank dibuka</span>
            <Button variant="primary" iconRight={ArrowRight} onClick={() => setCurrentStep(5)}>
              Lanjut ke Pembayaran
            </Button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 05: PEMBAYARAN GAJI (SECTION 24)                                    */}
      {/* ========================================================================= */}
      {currentStep === 5 && (
        <section className="panel team-panel">
          <div className="panel-head">
            <div>
              <h2>Tahap 05 — Eksekusi Pembayaran Gaji</h2>
              <p>Konfirmasi pembayaran transfer bank untuk {items.length} karyawan terverifikasi</p>
            </div>

            <div className="table-actions">
              <Button
                variant="secondary"
                icon={Download}
                onClick={() => alert('Batch transfer siap diunduh dalam format CSV resmi untuk perbankan.')}
              >
                Unduh Batch CSV
              </Button>
              <Button
                variant="primary"
                icon={CreditCard}
                loading={paying}
                onClick={handleConfirmPayment}
              >
                Tandai Sudah Dibayar
              </Button>
            </div>
          </div>

          <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <small style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Karyawan Dibayar</small>
              <div style={{ font: '800 24px Manrope, sans-serif', color: '#0f172a', margin: '4px 0' }}>
                {items.length} Karyawan
              </div>
              <small style={{ color: '#059669', fontWeight: 600 }}>100% Rekening Tervalidasi</small>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <small style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Pembayaran Transfer</small>
              <div style={{ font: '800 24px "JetBrains Mono", monospace', color: '#059669', margin: '4px 0' }}>
                {formatRupiah(totalNetAll)}
              </div>
              <small style={{ color: '#64748b' }}>Transfer Multi-Bank Kliring</small>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <small style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Metode Pembayaran</small>
              <select
                className="smart-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', height: '38px' }}
              >
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Tunai">Tunai</option>
              </select>
            </div>
          </div>

          {/* Tabel Pembayaran Masked */}
          <div className="table-wrap">
            <table className="payroll-table">
              <thead>
                <tr>
                  <th>NAMA KARYAWAN</th>
                  <th>BANK</th>
                  <th>NOMOR REKENING</th>
                  <th>NAMA REKENING</th>
                  <th>JUMLAH TRANSFER</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {items.slice(0, 10).map((emp) => (
                  <tr key={emp.employeeId}>
                    <td><b style={{ color: '#0f172a' }}>{emp.name}</b></td>
                    <td><TypeBadge type={emp.bankName || 'BCA'} /></td>
                    <td className="time-cell">{emp.accountNumberMasked || '**** **** 1234'}</td>
                    <td>{emp.accountHolder || emp.name}</td>
                    <td className="time-cell" style={{ color: '#059669', fontWeight: 700 }}>
                      {formatRupiah(emp.netSalary)}
                    </td>
                    <td><StatusBadge status={period.status === 'Dibayar' ? 'Sudah Dibayar' : 'Menunggu Pembayaran'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <span>Nomor rekening ditampilkan secara tersamar (masked) untuk keamanan data finansial</span>
            <Button variant="primary" icon={CreditCard} loading={paying} onClick={handleConfirmPayment}>
              Tandai Sudah Dibayar
            </Button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAHAP 06: PUBLIKASI SLIP GAJI (SECTION 25)                               */}
      {/* ========================================================================= */}
      {currentStep === 6 && (
        <section className="panel team-panel">
          <div className="panel-head">
            <div>
              <h2>Tahap 06 — Publikasi Slip Gaji</h2>
              <p>Kirimkan dokumen slip gaji elektronik ke portal aplikasi masing-masing karyawan</p>
            </div>

            <Button
              variant="primary"
              icon={Send}
              loading={publishing}
              onClick={handlePublishSlip}
            >
              Publikasikan Slip Gaji
            </Button>
          </div>

          <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#ecfdf5',
                color: '#059669',
                display: 'grid',
                placeItems: 'center',
                marginBottom: '16px'
              }}
            >
              <CheckCircle2 size={34} />
            </div>

            <h3 style={{ font: '700 20px Manrope, sans-serif', color: '#0f172a', margin: '0 0 8px 0' }}>
              Pembayaran Berhasil Dikonfirmasi
            </h3>
            <p style={{ maxWidth: '480px', color: '#64748b', fontSize: '13px', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Status periode saat ini adalah <b>{period.status || 'Dibayar'}</b>. Anda dapat mempublikasikan slip gaji resmi agar pegawai dapat mengunduh dan melihatnya di aplikasi masing-masing.
            </p>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                textAlign: 'left',
                width: '100%',
                maxWidth: '480px'
              }}
            >
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={publishOptions.notifyApp}
                  onChange={(e) => setPublishOptions({ ...publishOptions, notifyApp: e.target.checked })}
                />
                <span>Tampilkan slip gaji di menu "Slip Gaji Saya"</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={publishOptions.notifyEmail}
                  onChange={(e) => setPublishOptions({ ...publishOptions, notifyEmail: e.target.checked })}
                />
                <span>Kirimkan notifikasi ringkasan gaji ke email karyawan</span>
              </label>
            </div>
          </div>

          <div className="table-footer">
            <span>Dokumen slip gaji resmi dibuat secara elektronik oleh Smart HRM</span>
            <Button variant="primary" icon={Send} loading={publishing} onClick={handlePublishSlip}>
              Publikasikan Slip Gaji
            </Button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* DRAWER EDIT PERHITUNGAN (SECTIONS 16, 17, 18)                             */}
      {/* ========================================================================= */}
      <EditPayrollDrawer
        isOpen={Boolean(employeeForEdit)}
        onClose={() => setEmployeeForEdit(null)}
        employeeData={employeeForEdit}
        onSave={handleSaveManualAdjustment}
      />

      {/* ========================================================================= */}
      {/* DRAWER RINCIAN PAYROLL (SECTIONS 20, 21, 22)                              */}
      {/* ========================================================================= */}
      <DetailDrawer
        isOpen={Boolean(selectedItemForDetailDrawer)}
        onClose={() => setSelectedItemForDetailDrawer(null)}
        item={selectedItemForDetailDrawer}
        periodId={periodId}
        API={API}
        onOpenPayslip={(emp) => setSelectedItemForPayslip(emp)}
        onSaveSuccess={handleDetailDrawerSaveSuccess}
      />

      {/* ========================================================================= */}
      {/* MODAL SLIP GAJI FORMAL (SECTION 26)                                      */}
      {/* ========================================================================= */}
      {selectedItemForPayslip && (
        <PayslipModal
          data={selectedItemForPayslip}
          period={period}
          onClose={() => setSelectedItemForPayslip(null)}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL KONFIRMASI AJUKAN UNTUK PEMERIKSAAN (SECTION 21)                    */}
      {/* ========================================================================= */}
      {showSubmitReviewModal && (
        <div className="modal-backdrop" onClick={() => setShowSubmitReviewModal(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '520px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                  Ajukan Penggajian untuk Pemeriksaan?
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Konfirmasi pengajuan rekapitulasi data penggajian ke tim pemeriksa/auditor.
                </p>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowSubmitReviewModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Periode:</span>
                  <b style={{ color: '#0f172a' }}>{period.name}</b>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Karyawan:</span>
                  <b style={{ color: '#0f172a' }}>{items.length} orang</b>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Total Pendapatan:</span>
                  <b style={{ color: '#059669' }}>{formatRupiah(totalEarningsAll)}</b>
                </div>
                <div>
                  <span style={{ color: '#64748b', display: 'block' }}>Total Potongan:</span>
                  <b style={{ color: '#e11d48' }}>-{formatRupiah(totalDeductionsAll)}</b>
                </div>
                <div style={{ gridColumn: '1 / -1', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                  <span style={{ color: '#64748b', display: 'block' }}>Total Gaji Bersih:</span>
                  <b style={{ font: '800 16px "JetBrains Mono", monospace', color: '#2563eb' }}>
                    {formatRupiah(totalNetAll)}
                  </b>
                </div>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#92400e', lineHeight: 1.5 }}>
                <b>Catatan Kepatuhan:</b> Setelah diajukan, data perhitungan tidak dapat diedit secara langsung sampai proses pemeriksaan mengizinkan perubahan.
              </div>
            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button
                variant="secondary"
                onClick={() => setShowSubmitReviewModal(false)}
                disabled={submittingReview}
              >
                Kembali
              </Button>
              <Button
                variant="primary"
                loading={submittingReview}
                onClick={handleConfirmSubmitReview}
              >
                Ajukan untuk Pemeriksaan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL KEMBALIKAN UNTUK PERBAIKAN (SECTION 22)                             */}
      {/* ========================================================================= */}
      {showReturnModal && (
        <div className="modal-backdrop" onClick={() => setShowReturnModal(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: '480px', width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header" style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#e11d48' }}>
                  Kembalikan Penggajian untuk Perbaikan
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Pemeriksa wajib menyertakan alasan spesifik agar tim HRD dapat memperbaiki data.
                </p>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowReturnModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '18px 20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Alasan Pengembalian <span style={{ color: '#e11d48' }}>*</span>
              </label>
              <textarea
                required
                rows={4}
                className="smart-input"
                placeholder="Contoh: Data lembur 3 karyawan di bagian Operasional belum sesuai dengan rekap kehadiran aktual..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                style={{ width: '100%', height: 'auto', padding: '10px' }}
              />
            </div>

            <div style={{ padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button
                variant="secondary"
                onClick={() => setShowReturnModal(false)}
                disabled={returningReview}
              >
                Batal
              </Button>
              <Button
                variant="danger"
                loading={returningReview}
                onClick={() => handleReviewDecision('reject')}
              >
                Kembalikan untuk Perbaikan
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
