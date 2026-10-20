import TambahKaryawanPage from "./pages/Karyawan/TambahKaryawanPage.jsx";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    MapPin,
    ClipboardList,
    ChartNoAxesCombined,
    Settings,
    LogOut,
    Building2,
    Bell,
    ArrowUpRight,
    ShieldCheck,
    BriefcaseBusiness,
    FileText,
    Wallet,
    Clock3,
    Menu,
    Search,
    ChevronDown,
    Plus,
    MoreHorizontal,
    ArrowRight,
    CheckCircle2,
    CalendarDays,
    Download,
    Command,
    PanelLeftClose,
    RefreshCw,
    AlertCircle,
    UserRound,
    CircleHelp,
    X,
    Pencil,
    Trash2,
    Eye,
    Upload,
    ChevronRight,
    Check,
    Filter,
    Sun,
    Moon,
    Sparkles,
    FileSpreadsheet,
    ShoppingCart,
    CreditCard,
    Receipt,
} from "lucide-react";
import * as XLSX from "xlsx";
import {
    PayrollDashboard,
    PayrollPeriodsPage,
    PayrollHistoryPage,
    PayrollProcessPage,
    SalaryStructurePage,
    SalaryComponentsPage,
    PayrollRulesPage,
    EmployeeLoansPage,
    CashAdvancePage,
    ReimbursementPage,
    EmployeeFinancePortal,
    PayrollReportsPage,
    PayrollAdjustmentsPage,
    PayrollAuditLogPage,
} from "./modules/payroll/index.js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase =
    supabaseUrl && supabaseKey
        ? createClient(supabaseUrl, supabaseKey)
        : null;

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function fetchWithAuth(url, options = {}) {
    if (!supabase) {
        throw new Error("Konfigurasi Supabase belum tersedia.");
    }

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (!session) {
        throw new Error("Sesi berakhir. Silakan login kembali.");
    }

    const headers = new Headers(options.headers);
    headers.set("Authorization", `Bearer ${session.access_token}`);

    return fetch(url, {
        ...options,
        headers,
    });
}
const nav = [
    {
        title: "",
        items: [
            { name: "Dashboard", icon: LayoutDashboard },
            {
                name: "Kelola Karyawan", icon: Users,
                children: [
                    { name: "Divisi" }, { name: "Jabatan" },
                    { name: "Bagian" }, { name: "Data Karyawan" },
                ],
            },
            {
                name: "Kehadiran", icon: CalendarCheck,
                children: [{ name: "Data Kehadiran" }, { name: "Rekap Kehadiran" }],
            },
            { name: "Request Absen", icon: MapPin },
            {
                name: "Cuti", icon: CalendarDays,
                children: [{ name: "Pengajuan Cuti" }, { name: "Riwayat Cuti" }],
            },
            {
                name: "Izin", icon: FileText,
                children: [{ name: "Pengajuan Izin" }, { name: "Riwayat Izin" }],
            },
            {
                name: "Lembur", icon: Clock3,
                children: [{ name: "Pengajuan Lembur" }, { name: "Riwayat Lembur" }],
            },
            {
                name: "Penggajian", icon: Wallet,
                children: [
                    { name: "Dashboard Penggajian" },
                    { name: "Periode Penggajian" },
                    { name: "Proses Penggajian" },
                    { name: "Persetujuan Penggajian" },
                    { name: "Riwayat Penggajian" },
                    { name: "Struktur Gaji" },
                    { name: "Komponen Gaji" },
                    { name: "Aturan Penggajian" },
                    { name: "Slip Gaji" },
                    { name: "Pengajuan Kasbon" },
                    { name: "Kasbon Aktif" },
                    { name: "Riwayat Kasbon" },
                    { name: "Laporan Penggajian" },
                    { name: "Laporan Gaji" },
                    { name: "Laporan Pinjaman" },
                    { name: "Laporan Kasbon" },
                    { name: "Laporan Biaya Penggajian" },
                    { name: "Penyesuaian Gaji" },
                    { name: "Audit Log Penggajian" },
                    { name: "Keuangan Saya" },
                ],
            },
            {
                name: "Jadwal Shift", icon: CalendarDays,
                children: [{ name: "Data Shift" }, { name: "Penjadwalan Shift" }],
            },
            { name: "Pinjaman", icon: CreditCard },
            { name: "Reimbursement", icon: Receipt },
            { name: "Kontrak Kerja", icon: BriefcaseBusiness },
            { name: "Paklaring", icon: FileText },
            { name: "Surat Peringatan", icon: AlertCircle },
            { name: "Surat Pengunduran Diri", icon: FileText },
            { name: "Surat Keterangan Bekerja", icon: FileText },
            { name: "Surat Penawaran Kerja", icon: FileText },
            { name: "PO", icon: ShoppingCart },
            { name: "KPI", icon: ChartNoAxesCombined },
            { name: "Pengaturan Akun", icon: Settings },
        ],
    },
];

const moduleInfo = {
    "Data Kehadiran": { subtitle: "Pantau data kehadiran dan aktivitas check-in karyawan.", icon: FileText },
    "Rekap Kehadiran": { subtitle: "Ringkasan kehadiran karyawan per periode.", icon: FileText },
    "Cuti": { subtitle: "Kelola pengajuan dan riwayat cuti karyawan.", icon: FileText },
    "Pengajuan Cuti": { subtitle: "Tinjau pengajuan cuti karyawan.", icon: FileText },
    "Riwayat Cuti": { subtitle: "Lihat riwayat pengajuan cuti karyawan.", icon: FileText },
    "Izin": { subtitle: "Kelola pengajuan dan riwayat izin karyawan.", icon: FileText },
    "Pengajuan Izin": { subtitle: "Tinjau pengajuan izin karyawan.", icon: FileText },
    "Riwayat Izin": { subtitle: "Lihat riwayat pengajuan izin karyawan.", icon: FileText },
    "Pengajuan Lembur": { subtitle: "Tinjau pengajuan lembur karyawan.", icon: FileText },
    "Riwayat Lembur": { subtitle: "Lihat riwayat lembur karyawan.", icon: FileText },
    "Data Shift": { subtitle: "Kelola master jadwal dan jam kerja shift.", icon: FileText },
    "Penjadwalan Shift": { subtitle: "Atur pembagian shift kerja karyawan.", icon: FileText },
    "Pinjaman": { subtitle: "Kelola pengajuan, pinjaman aktif, dan riwayat pinjaman karyawan.", icon: CreditCard },
    "Paklaring": { subtitle: "Kelola surat pengalaman kerja karyawan.", icon: FileText },
    "Surat Peringatan": { subtitle: "Kelola penerbitan dan riwayat surat peringatan.", icon: AlertCircle },
    "Surat Pengunduran Diri": { subtitle: "Kelola dokumen pengunduran diri karyawan.", icon: FileText },
    "Surat Keterangan Bekerja": { subtitle: "Kelola penerbitan surat keterangan bekerja.", icon: FileText },
    "Surat Penawaran Kerja": { subtitle: "Kelola surat penawaran kerja kepada calon karyawan.", icon: FileText },
    "PO": { subtitle: "Kelola dokumen PO perusahaan.", icon: ShoppingCart },
    "KPI": { subtitle: "Susun target, evaluasi, dan histori performa.", icon: ChartNoAxesCombined },

    "Kelola Karyawan": {
        subtitle: "Kelola informasi dan data karyawan perusahaan.",
        icon: Users,
        columns: ["Nama", "Email", "Role"],
    },
    "Data Karyawan": {
        subtitle: "Kelola data master dan administrasi karyawan perusahaan.",
        icon: Users,
    },
    Divisi: {
        subtitle: "Kelola daftar divisi organisasi perusahaan.",
        icon: Building2,
    },
    Jabatan: {
        subtitle: "Kelola daftar jabatan dan level posisi karyawan.",
        icon: BriefcaseBusiness,
    },
    Bagian: {
        subtitle: "Kelola daftar bagian / sub-departemen operasional.",
        icon: ClipboardList,
    },
    Kehadiran: {
        subtitle: "Pantau kehadiran dan aktivitas check-in karyawan.",
        icon: CalendarCheck,
    },
    "Request Absen": {
        subtitle: "Kelola permintaan koreksi atau perubahan absensi.",
        icon: MapPin,
    },
    "Cuti & Izin": {
        subtitle: "Kelola pengajuan cuti dan izin karyawan.",
        icon: FileText,
    },
    Lembur: {
        subtitle: "Pantau pengajuan dan persetujuan lembur.",
        icon: Clock3,
    },
    "Jadwal Shift": {
        subtitle: "Atur dan pantau jadwal kerja karyawan.",
        icon: CalendarDays,
    },
    "Kontrak Kerja": {
        subtitle: "Kelola kontrak kerja dan masa berlaku karyawan.",
        icon: BriefcaseBusiness,
    },
    Penggajian: {
        subtitle: "Kelola informasi dan proses penggajian.",
        icon: Wallet,
    },
    Reimbursement: {
        subtitle: "Pantau pengajuan penggantian biaya karyawan.",
        icon: ClipboardList,
    },
    "KPI Performance": {
        subtitle: "Susun target, evaluasi, dan histori performa.",
        icon: ChartNoAxesCombined,
    },
    "Approval Center": {
        subtitle: "Tinjau pengajuan sesuai alur persetujuan.",
        icon: ShieldCheck,
    },
    Laporan: {
        subtitle: "Ringkasan dan laporan aktivitas perusahaan.",
        icon: ChartNoAxesCombined,
    },
    "Pengaturan Akun": {
        subtitle: "Kelola profil dan preferensi akun.",
        icon: Settings,
    },
    "Dashboard Penggajian": {
        subtitle: "Pusat ringkasan dan statistik penggajian perusahaan.",
        icon: Wallet,
    },
    "Periode Penggajian": {
        subtitle: "Kelola siklus dan jadwal periode penggajian karyawan.",
        icon: Wallet,
    },
    "Proses Penggajian": {
        subtitle: "Alur 6 tahap pemrosesan data, kalkulasi, verifikasi, hingga slip gaji.",
        icon: Wallet,
    },
    "Persetujuan Penggajian": {
        subtitle: "Persetujuan berjenjang dari HR, Manager, Finance, hingga Direktur.",
        icon: ShieldCheck,
    },
    "Riwayat Penggajian": {
        subtitle: "Arsip dan riwayat seluruh periode penggajian yang telah ditutup.",
        icon: Wallet,
    },
    "Struktur Gaji": {
        subtitle: "Pengaturan kelompok struktur gaji karyawan berdasarkan divisi dan kategori kerja.",
        icon: Building2,
    },
    "Komponen Gaji": {
        subtitle: "Master data komponen pendapatan dan potongan beserta rumus perhitungan.",
        icon: ClipboardList,
    },
    "Aturan Penggajian": {
        subtitle: "Kebijakan dan batasan operasional pinjaman, kasbon, dan potongan gaji.",
        icon: ShieldCheck,
    },
    "Pinjaman Karyawan": {
        subtitle: "Kelola pinjaman jangka menengah karyawan dan simulasi cicilan bulanan.",
        icon: CreditCard,
    },
    "Pengajuan Pinjaman": {
        subtitle: "Daftar pengajuan pinjaman karyawan yang menunggu verifikasi dan persetujuan.",
        icon: CreditCard,
    },
    "Pinjaman Aktif": {
        subtitle: "Daftar pinjaman berjalan yang sedang dipotong cicilannya pada payroll.",
        icon: CreditCard,
    },
    "Riwayat Pinjaman": {
        subtitle: "Arsip pinjaman yang telah lunas atau ditolak.",
        icon: CreditCard,
    },
    Kasbon: {
        subtitle: "Pinjaman jangka pendek darurat yang dipotong pada satu periode gaji.",
        icon: Receipt,
    },
    "Pengajuan Kasbon": {
        subtitle: "Formulir dan daftar pengajuan kasbon karyawan.",
        icon: Receipt,
    },
    "Kasbon Aktif": {
        subtitle: "Daftar kasbon berjalan yang siap dipotong pada payroll bulan ini.",
        icon: Receipt,
    },
    "Riwayat Kasbon": {
        subtitle: "Catatan riwayat pelunasan kasbon karyawan.",
        icon: Receipt,
    },
    "Penggantian Biaya": {
        subtitle: "Klaim reimbursement operasional, transportasi, dinas, dan medis.",
        icon: ClipboardList,
    },
    "Pengajuan Biaya": {
        subtitle: "Daftar pengajuan reimbursement baru dari karyawan.",
        icon: ClipboardList,
    },
    "Persetujuan Biaya": {
        subtitle: "Tinjauan dan persetujuan klaim biaya operasional karyawan.",
        icon: ShieldCheck,
    },
    "Riwayat Biaya": {
        subtitle: "Arsip riwayat pembayaran klaim reimbursement.",
        icon: ClipboardList,
    },
    "Slip Gaji": {
        subtitle: "Penerbitan, pratinjau cetak A4, dan publikasi slip gaji digital karyawan.",
        icon: FileText,
    },
    "Laporan Keuangan": {
        subtitle: "Laporan analitik penggajian, gaji, pinjaman, dan ekspor data ke Excel.",
        icon: FileSpreadsheet,
    },
    "Laporan Penggajian": {
        subtitle: "Laporan rekapitulasi penggajian per periode dan departemen.",
        icon: FileSpreadsheet,
    },
    "Laporan Gaji": {
        subtitle: "Laporan rincian komponen gaji pokok, tunjangan, dan lembur per karyawan.",
        icon: FileSpreadsheet,
    },
    "Laporan Pinjaman": {
        subtitle: "Laporan outstanding dan status kolektibilitas pinjaman karyawan.",
        icon: FileSpreadsheet,
    },
    "Laporan Kasbon": {
        subtitle: "Laporan pemotongan kasbon jangka pendek karyawan.",
        icon: FileSpreadsheet,
    },
    "Laporan Biaya Penggajian": {
        subtitle: "Laporan total beban biaya operasional penggajian bagi perusahaan.",
        icon: FileSpreadsheet,
    },
    "Penyesuaian Gaji": {
        subtitle: "Penyesuaian koreksi penggajian tanpa merusak integritas data lama.",
        icon: ShieldCheck,
    },
    "Audit Log Penggajian": {
        subtitle: "Jejak audit forensik lengkap untuk setiap perubahan data finansial.",
        icon: ChartNoAxesCombined,
    },
    "Keuangan Saya": {
        subtitle: "Portal mandiri karyawan untuk melihat slip gaji, pinjaman, dan reimbursement.",
        icon: UserRound,
    },
};

const demoRows = [
    {
        name: "Nadia Putri",
        dept: "People & Culture",
        status: "Hadir",
        time: "08:42",
        initial: "NP",
        color: "lavender",
    },
    {
        name: "Rizky Pratama",
        dept: "Engineering",
        status: "Terlambat",
        time: "09:12",
        initial: "RP",
        color: "mint",
    },
    {
        name: "Aditya Saputra",
        dept: "Finance",
        status: "Hadir",
        time: "08:51",
        initial: "AS",
        color: "peach",
    },
    {
        name: "Salsa Maharani",
        dept: "Marketing",
        status: "Izin",
        time: "—",
        initial: "SM",
        color: "blue",
    },
];

function getInitial(name = "") {
    return name.trim().charAt(0).toUpperCase() || "U";
}

function formatRole(role = "") {
    return role
        .replaceAll("_", " ")
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function EmptyState({ title, description }) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <ClipboardList size={24} />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

/* ==========================================================================
   CRUD: DIVISI (DASHBOARD-UNIFIED STYLE)
   ========================================================================== */
function DivisiPage({ API }) {
    const [divisions, setDivisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [currentDiv, setCurrentDiv] = useState({ id: "", name: "" });
    const [deleteModal, setDeleteModal] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchDivisions = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetchWithAuth(`${API}/api/divisions`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal memuat data divisi");
            setDivisions(data.divisions || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDivisions();
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return divisions;
        return divisions.filter((d) => d.name && d.name.toLowerCase().includes(q));
    }, [divisions, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filtered.slice(start, start + perPage);
    }, [filtered, currentPage, perPage]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!currentDiv.name.trim()) return;
        setSaving(true);
        try {
            if (showModal === "add") {
                const res = await fetchWithAuth(`${API}/api/divisions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: currentDiv.name.trim() }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Gagal menambah divisi");
            } else if (showModal === "edit") {
                const res = await fetchWithAuth(`${API}/api/divisions/${currentDiv.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: currentDiv.name.trim() }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Gagal memperbarui divisi");
            }
            setShowModal(false);
            fetchDivisions();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        setSaving(true);
        try {
            const res = await fetchWithAuth(`${API}/api/divisions/${deleteModal.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal menghapus divisi");
            setDeleteModal(null);
            fetchDivisions();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="welcome-row">
                <div>
                    <div className="eyebrow blue">
                        PEOPLE OPERATIONS <span>•</span> KELOLA KARYAWAN
                    </div>
                    <h1>
                        Data Divisi <span>✦</span>
                    </h1>
                    <p>Kelola daftar divisi organisasi dan departemen perusahaan.</p>
                </div>

                <div className="welcome-actions">
                    <button className="secondary" onClick={fetchDivisions} disabled={loading}>
                        <RefreshCw size={14} className={loading ? "spin" : ""} />
                        Refresh
                    </button>
                    <button
                        className="primary compact"
                        onClick={() => {
                            setCurrentDiv({ id: "", name: "" });
                            setShowModal("add");
                        }}
                    >
                        <Plus size={15} />
                        Tambah Divisi
                    </button>
                </div>
            </div>

            <section className="panel team-panel">
                <div className="panel-head">
                    <div>
                        <h2>Daftar Divisi</h2>
                        <p>Total {divisions.length} divisi terdaftar dalam sistem</p>
                    </div>

                    <div className="table-actions">
                        <div className="searchbox" style={{ padding: "6px 12px", minWidth: "200px" }}>
                            <Search size={14} />
                            <input
                                placeholder="Cari divisi..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                style={{
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                    fontSize: "11px",
                                    color: "inherit",
                                    width: "100%",
                                }}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    style={{
                                        border: 0,
                                        background: "none",
                                        cursor: "pointer",
                                        color: "#9aa6b6",
                                        padding: 0,
                                    }}
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        <select
                            className="secondary"
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            style={{ padding: "7px 11px", fontSize: "11px", cursor: "pointer" }}
                        >
                            <option value={10}>10 Baris</option>
                            <option value={25}>25 Baris</option>
                            <option value={50}>50 Baris</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div style={{ padding: "12px 20px", color: "#e11d48", fontSize: "11px" }}>
                        <AlertCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                        {error}
                    </div>
                )}

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: "70px" }}>NO</th>
                                <th>NAMA DIVISI</th>
                                <th style={{ textAlign: "right", width: "120px" }}>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "#8a97a9" }}>
                                        Memuat data divisi...
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "#8a97a9" }}>
                                        {search ? "Tidak ada divisi yang cocok dengan pencarian." : "Belum ada data divisi."}
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="time-cell">{(currentPage - 1) * perPage + index + 1}</td>
                                        <td>
                                            <div className="employee-cell">
                                                <div
                                                    className="avatar"
                                                    style={{ width: "30px", height: "30px", fontSize: "11px" }}
                                                >
                                                    {item.name.charAt(0).toUpperCase()}
                                                </div>
                                                <b style={{ color: "#35445b" }}>{item.name}</b>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                                                <button
                                                    className="icon-button"
                                                    title="Edit"
                                                    onClick={() => {
                                                        setCurrentDiv(item);
                                                        setShowModal("edit");
                                                    }}
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    className="icon-button"
                                                    title="Hapus"
                                                    style={{ color: "#e11d48" }}
                                                    onClick={() => setDeleteModal(item)}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <span>
                        Menampilkan <b>{filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1}</b> sampai{" "}
                        <b>{Math.min(currentPage * perPage, filtered.length)}</b> dari <b>{filtered.length}</b> data
                    </span>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <button
                            className="secondary"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            style={{ padding: "5px 11px", fontSize: "11px" }}
                        >
                            Sebelumnya
                        </button>
                        <span style={{ fontSize: "11px", color: "#64748b", padding: "0 6px" }}>
                            Halaman <b>{currentPage}</b> dari <b>{totalPages}</b>
                        </span>
                        <button
                            className="secondary"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            style={{ padding: "5px 11px", fontSize: "11px" }}
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            </section>

            {/* Modal Tambah / Edit */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="panel-head" style={{ borderBottom: "1px solid #f0f3f7", padding: "18px 22px" }}>
                            <div>
                                <h2>{showModal === "add" ? "Tambah Divisi" : "Edit Divisi"}</h2>
                                <p>Masukkan nama divisi organisasi perusahaan</p>
                            </div>
                            <button className="icon-button" onClick={() => setShowModal(false)}>
                                <X size={17} />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body" style={{ padding: "20px 22px" }}>
                                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                    Nama Divisi
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Divisi Keuangan"
                                        value={currentDiv.name}
                                        onChange={(e) => setCurrentDiv({ ...currentDiv, name: e.target.value })}
                                        style={{ marginTop: "6px" }}
                                        autoFocus
                                    />
                                </label>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "10px",
                                    padding: "14px 22px",
                                    borderTop: "1px solid #f0f3f7",
                                    background: "#fafbfd",
                                    borderRadius: "0 0 14px 14px",
                                }}
                            >
                                <button type="button" className="secondary" onClick={() => setShowModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="primary compact" disabled={saving}>
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {deleteModal && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="panel-head" style={{ borderBottom: "1px solid #f0f3f7", padding: "18px 22px" }}>
                            <div>
                                <h2>Hapus Divisi</h2>
                                <p>Konfirmasi penghapusan data divisi</p>
                            </div>
                            <button className="icon-button" onClick={() => setDeleteModal(null)}>
                                <X size={17} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: "20px 22px" }}>
                            <p style={{ margin: 0, color: "#475569", fontSize: "12px", lineHeight: "1.6" }}>
                                Apakah Anda yakin ingin menghapus divisi <b>{deleteModal.name}</b>? Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "10px",
                                padding: "14px 22px",
                                borderTop: "1px solid #f0f3f7",
                                background: "#fafbfd",
                                borderRadius: "0 0 14px 14px",
                            }}
                        >
                            <button type="button" className="secondary" onClick={() => setDeleteModal(null)}>
                                Batal
                            </button>
                            <button
                                type="button"
                                className="secondary"
                                onClick={handleDelete}
                                disabled={saving}
                                style={{ color: "#e11d48", borderColor: "#fecdd3", background: "#fff1f2" }}
                            >
                                {saving ? "Menghapus..." : "Hapus Divisi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* ==========================================================================
   CRUD: JABATAN (DASHBOARD-UNIFIED STYLE)
   ========================================================================== */
function JabatanPage({ API }) {
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [currentPos, setCurrentPos] = useState({ id: "", name: "" });
    const [deleteModal, setDeleteModal] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchPositions = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetchWithAuth(`${API}/api/positions`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal memuat data jabatan");
            setPositions(data.positions || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPositions();
    }, []);

    const filtered = useMemo(() => {
        6
        const q = search.toLowerCase().trim();
        if (!q) return positions;
        return positions.filter((p) => p.name && p.name.toLowerCase().includes(q));
    }, [positions, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filtered.slice(start, start + perPage);
    }, [filtered, currentPage, perPage]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!currentPos.name.trim()) return;
        setSaving(true);
        try {
            if (showModal === "add") {
                const res = await fetchWithAuth(`${API}/api/positions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: currentPos.name.trim() }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Gagal menambah jabatan");
            } else if (showModal === "edit") {
                const res = await fetchWithAuth(`${API}/api/positions/${currentPos.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: currentPos.name.trim() }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Gagal memperbarui jabatan");
            }
            setShowModal(false);
            fetchPositions();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        setSaving(true);
        try {
            const res = await fetchWithAuth(`${API}/api/positions/${deleteModal.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal menghapus jabatan");
            setDeleteModal(null);
            fetchPositions();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="welcome-row">
                <div>
                    <div className="eyebrow blue">
                        PEOPLE OPERATIONS <span>•</span> KELOLA KARYAWAN
                    </div>
                    <h1>
                        Data Jabatan <span>✦</span>
                    </h1>
                    <p>Kelola level posisi, jabatan, dan struktur kepangkatan karyawan.</p>
                </div>

                <div className="welcome-actions">
                    <button className="secondary" onClick={fetchPositions} disabled={loading}>
                        <RefreshCw size={14} className={loading ? "spin" : ""} />
                        Refresh
                    </button>
                    <button
                        className="primary compact"
                        onClick={() => {
                            setCurrentPos({ id: "", name: "" });
                            setShowModal("add");
                        }}
                    >
                        <Plus size={15} />
                        Tambah Jabatan
                    </button>
                </div>
            </div>

            <section className="panel team-panel">
                <div className="panel-head">
                    <div>
                        <h2>Daftar Jabatan</h2>
                        <p>Total {positions.length} jabatan aktif terdaftar</p>
                    </div>

                    <div className="table-actions">
                        <div className="searchbox" style={{ padding: "6px 12px", minWidth: "200px" }}>
                            <Search size={14} />
                            <input
                                placeholder="Cari jabatan..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                style={{
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                    fontSize: "11px",
                                    color: "inherit",
                                    width: "100%",
                                }}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    style={{
                                        border: 0,
                                        background: "none",
                                        cursor: "pointer",
                                        color: "#9aa6b6",
                                        padding: 0,
                                    }}
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        <select
                            className="secondary"
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            style={{ padding: "7px 11px", fontSize: "11px", cursor: "pointer" }}
                        >
                            <option value={10}>10 Baris</option>
                            <option value={25}>25 Baris</option>
                            <option value={50}>50 Baris</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div style={{ padding: "12px 20px", color: "#e11d48", fontSize: "11px" }}>
                        <AlertCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                        {error}
                    </div>
                )}

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: "70px" }}>NO</th>
                                <th>NAMA JABATAN</th>
                                <th style={{ textAlign: "right", width: "120px" }}>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "#8a97a9" }}>
                                        Memuat data jabatan...
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "#8a97a9" }}>
                                        {search ? "Tidak ada jabatan yang cocok dengan pencarian." : "Belum ada data jabatan."}
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="time-cell">{(currentPage - 1) * perPage + index + 1}</td>
                                        <td>
                                            <div className="employee-cell">
                                                <div
                                                    className="avatar"
                                                    style={{ width: "30px", height: "30px", fontSize: "11px" }}
                                                >
                                                    {item.name.charAt(0).toUpperCase()}
                                                </div>
                                                <b style={{ color: "#35445b" }}>{item.name}</b>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                                                <button
                                                    className="icon-button"
                                                    title="Edit"
                                                    onClick={() => {
                                                        setCurrentPos(item);
                                                        setShowModal("edit");
                                                    }}
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    className="icon-button"
                                                    title="Hapus"
                                                    style={{ color: "#e11d48" }}
                                                    onClick={() => setDeleteModal(item)}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <span className="tf-info">
                        Menampilkan{" "}
                        <strong>{filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1}</strong>
                        {" "}–{" "}
                        <strong>{Math.min(currentPage * perPage, filtered.length)}</strong>
                        {" "}dari{" "}
                        <strong>{filtered.length}</strong> data
                    </span>
                    <div className="pagination-group">
                        <button
                            className="btn-page"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        >
                            ‹ Sebelumnya
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === "…" ? (
                                    <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        className={`btn-page${currentPage === p ? " active" : ""}`}
                                        onClick={() => setCurrentPage(p)}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                        <button
                            className="btn-page"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        >
                            Selanjutnya ›
                        </button>
                    </div>
                </div>
            </section>

            {/* Modal Tambah / Edit */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="panel-head" style={{ borderBottom: "1px solid #f0f3f7", padding: "18px 22px" }}>
                            <div>
                                <h2>{showModal === "add" ? "Tambah Jabatan" : "Edit Jabatan"}</h2>
                                <p>Masukkan nama level jabatan atau posisi pekerjaan</p>
                            </div>
                            <button className="icon-button" onClick={() => setShowModal(false)}>
                                <X size={17} />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body" style={{ padding: "20px 22px" }}>
                                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                    Nama Jabatan
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Senior Software Engineer"
                                        value={currentPos.name}
                                        onChange={(e) => setCurrentPos({ ...currentPos, name: e.target.value })}
                                        style={{ marginTop: "6px" }}
                                        autoFocus
                                    />
                                </label>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "10px",
                                    padding: "14px 22px",
                                    borderTop: "1px solid #f0f3f7",
                                    background: "#fafbfd",
                                    borderRadius: "0 0 14px 14px",
                                }}
                            >
                                <button type="button" className="secondary" onClick={() => setShowModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="primary compact" disabled={saving}>
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {deleteModal && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="panel-head" style={{ borderBottom: "1px solid #f0f3f7", padding: "18px 22px" }}>
                            <div>
                                <h2>Hapus Jabatan</h2>
                                <p>Konfirmasi penghapusan data jabatan</p>
                            </div>
                            <button className="icon-button" onClick={() => setDeleteModal(null)}>
                                <X size={17} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: "20px 22px" }}>
                            <p style={{ margin: 0, color: "#475569", fontSize: "12px", lineHeight: "1.6" }}>
                                Apakah Anda yakin ingin menghapus jabatan <b>{deleteModal.name}</b>? Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "10px",
                                padding: "14px 22px",
                                borderTop: "1px solid #f0f3f7",
                                background: "#fafbfd",
                                borderRadius: "0 0 14px 14px",
                            }}
                        >
                            <button type="button" className="secondary" onClick={() => setDeleteModal(null)}>
                                Batal
                            </button>
                            <button
                                type="button"
                                className="secondary"
                                onClick={handleDelete}
                                disabled={saving}
                                style={{ color: "#e11d48", borderColor: "#fecdd3", background: "#fff1f2" }}
                            >
                                {saving ? "Menghapus..." : "Hapus Jabatan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* ==========================================================================
   CRUD: BAGIAN (DASHBOARD-UNIFIED STYLE)
   ========================================================================== */
function BagianPage({ API }) {
    const [departments, setDepartments] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [currentDept, setCurrentDept] = useState({ id: "", name: "", divisi_id: "" });
    const [deleteModal, setDeleteModal] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchDepartments = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetchWithAuth(`${API}/api/departments`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal memuat data bagian");
            setDepartments(data.departments || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments();
        (async () => {
            try {
                const res = await fetchWithAuth(`${API}/api/divisions`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Gagal memuat divisi");
                setDivisions(data.divisions || []);
            } catch (err) {
                setError(err.message);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim();
        if (!q) return departments;
        return departments.filter((d) => d.name && d.name.toLowerCase().includes(q));
    }, [departments, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filtered.slice(start, start + perPage);
    }, [filtered, currentPage, perPage]);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!currentDept.name.trim() || !currentDept.divisi_id) {
            alert("Nama Bagian dan Divisi wajib dipilih.");
            return;
        }
        setSaving(true);
        try {
            if (showModal === "add") {
                const res = await fetchWithAuth(`${API}/api/departments`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: currentDept.name.trim(), divisi_id: currentDept.divisi_id }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Gagal menambah bagian");
            } else if (showModal === "edit") {
                const res = await fetchWithAuth(`${API}/api/departments/${currentDept.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: currentDept.name.trim(), divisi_id: currentDept.divisi_id }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Gagal memperbarui bagian");
            }
            setShowModal(false);
            fetchDepartments();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        setSaving(true);
        try {
            const res = await fetchWithAuth(`${API}/api/departments/${deleteModal.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal menghapus bagian");
            setDeleteModal(null);
            fetchDepartments();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <div className="welcome-row">
                <div>
                    <div className="eyebrow blue">
                        PEOPLE OPERATIONS <span>•</span> KELOLA KARYAWAN
                    </div>
                    <h1>
                        Data Bagian <span>✦</span>
                    </h1>
                    <p>Kelola unit kerja, sub-departemen, dan bagian operasional tim.</p>
                </div>

                <div className="welcome-actions">
                    <button className="secondary" onClick={fetchDepartments} disabled={loading}>
                        <RefreshCw size={14} className={loading ? "spin" : ""} />
                        Refresh
                    </button>
                    <button
                        className="primary compact"
                        onClick={() => {
                            setCurrentDept({ id: "", name: "", divisi_id: "" });
                            setShowModal("add");
                        }}
                    >
                        <Plus size={15} />
                        Tambah Bagian
                    </button>
                </div>
            </div>

            <section className="panel team-panel">
                <div className="panel-head">
                    <div>
                        <h2>Daftar Bagian</h2>
                        <p>Total {departments.length} bagian operasional terdaftar</p>
                    </div>

                    <div className="table-actions">
                        <div className="searchbox" style={{ padding: "6px 12px", minWidth: "200px" }}>
                            <Search size={14} />
                            <input
                                placeholder="Cari bagian..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                style={{
                                    border: "none",
                                    outline: "none",
                                    background: "transparent",
                                    fontSize: "11px",
                                    color: "inherit",
                                    width: "100%",
                                }}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    style={{
                                        border: 0,
                                        background: "none",
                                        cursor: "pointer",
                                        color: "#9aa6b6",
                                        padding: 0,
                                    }}
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        <select
                            className="secondary"
                            value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            style={{ padding: "7px 11px", fontSize: "11px", cursor: "pointer" }}
                        >
                            <option value={10}>10 Baris</option>
                            <option value={25}>25 Baris</option>
                            <option value={50}>50 Baris</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div style={{ padding: "12px 20px", color: "#e11d48", fontSize: "11px" }}>
                        <AlertCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                        {error}
                    </div>
                )}

                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: "70px" }}>NO</th>
                                <th>NAMA BAGIAN</th>
                                <th style={{ textAlign: "right", width: "120px" }}>AKSI</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "#8a97a9" }}>
                                        Memuat data bagian...
                                    </td>
                                </tr>
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={3} style={{ textAlign: "center", padding: "32px", color: "#8a97a9" }}>
                                        {search ? "Tidak ada bagian yang cocok dengan pencarian." : "Belum ada data bagian."}
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((item, index) => (
                                    <tr key={item.id}>
                                        <td className="time-cell">{(currentPage - 1) * perPage + index + 1}</td>
                                        <td>
                                            <div className="employee-cell">
                                                <div
                                                    className="avatar"
                                                    style={{ width: "30px", height: "30px", fontSize: "11px" }}
                                                >
                                                    {item.name.charAt(0).toUpperCase()}
                                                </div>
                                                <b style={{ color: "#35445b" }}>{item.name}</b>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: "right" }}>
                                            <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                                                <button
                                                    className="icon-button"
                                                    title="Edit"
                                                    onClick={() => {
                                                        setCurrentDept({ ...item, divisi_id: item.divisi_id || item.division_id || "" });
                                                        setShowModal("edit");
                                                    }}
                                                >
                                                    <Pencil size={15} />
                                                </button>
                                                <button
                                                    className="icon-button"
                                                    title="Hapus"
                                                    style={{ color: "#e11d48" }}
                                                    onClick={() => setDeleteModal(item)}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="table-footer">
                    <span className="tf-info">
                        Menampilkan{" "}
                        <strong>{filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1}</strong>
                        {" "}–{" "}
                        <strong>{Math.min(currentPage * perPage, filtered.length)}</strong>
                        {" "}dari{" "}
                        <strong>{filtered.length}</strong> data
                    </span>
                    <div className="pagination-group">
                        <button
                            className="btn-page"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        >
                            ‹ Sebelumnya
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                            .reduce((acc, p, idx, arr) => {
                                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === "…" ? (
                                    <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        className={`btn-page${currentPage === p ? " active" : ""}`}
                                        onClick={() => setCurrentPage(p)}
                                    >
                                        {p}
                                    </button>
                                )
                            )}
                        <button
                            className="btn-page"
                            disabled={currentPage >= totalPages}
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        >
                            Selanjutnya ›
                        </button>
                    </div>
                </div>
            </section>

            {/* Modal Tambah / Edit */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="panel-head" style={{ borderBottom: "1px solid #f0f3f7", padding: "18px 22px" }}>
                            <div>
                                <h2>{showModal === "add" ? "Tambah Bagian" : "Edit Bagian"}</h2>
                                <p>Masukkan nama unit kerja atau bagian operasional</p>
                            </div>
                            <button className="icon-button" onClick={() => setShowModal(false)}>
                                <X size={17} />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body" style={{ padding: "20px 22px" }}>
                                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", display: "block", marginBottom: "14px" }}>
                                    Divisi
                                    <div style={{ position: "relative", width: "100%", marginTop: "6px" }}>
                                        <select
                                            required
                                            value={currentDept.divisi_id || ""}
                                            onChange={(e) => setCurrentDept({ ...currentDept, divisi_id: e.target.value })}
                                            style={{
                                                width: "100%",
                                                appearance: "none",
                                                WebkitAppearance: "none",
                                                paddingRight: "46px",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <option value="">Pilih Divisi</option>
                                            {divisions.map((div) => (
                                                <option key={div.id} value={div.id}>{div.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown
                                            size={17}
                                            aria-hidden="true"
                                            style={{
                                                position: "absolute",
                                                right: "18px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                color: "#334155",
                                                pointerEvents: "none",
                                            }}
                                        />
                                    </div>
                                </label>
                                <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                    Nama Bagian
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: IT Support"
                                        value={currentDept.name}
                                        onChange={(e) => setCurrentDept({ ...currentDept, name: e.target.value })}
                                        style={{ marginTop: "6px" }}
                                        autoFocus
                                    />
                                </label>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "10px",
                                    padding: "14px 22px",
                                    borderTop: "1px solid #f0f3f7",
                                    background: "#fafbfd",
                                    borderRadius: "0 0 14px 14px",
                                }}
                            >
                                <button type="button" className="secondary" onClick={() => setShowModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="primary compact" disabled={saving}>
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Konfirmasi Hapus */}
            {deleteModal && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="panel-head" style={{ borderBottom: "1px solid #f0f3f7", padding: "18px 22px" }}>
                            <div>
                                <h2>Hapus Bagian</h2>
                                <p>Konfirmasi penghapusan data bagian</p>
                            </div>
                            <button className="icon-button" onClick={() => setDeleteModal(null)}>
                                <X size={17} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: "20px 22px" }}>
                            <p style={{ margin: 0, color: "#475569", fontSize: "12px", lineHeight: "1.6" }}>
                                Apakah Anda yakin ingin menghapus bagian <b>{deleteModal.name}</b>? Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "10px",
                                padding: "14px 22px",
                                borderTop: "1px solid #f0f3f7",
                                background: "#fafbfd",
                                borderRadius: "0 0 14px 14px",
                            }}
                        >
                            <button type="button" className="secondary" onClick={() => setDeleteModal(null)}>
                                Batal
                            </button>
                            <button
                                type="button"
                                className="secondary"
                                onClick={handleDelete}
                                disabled={saving}
                                style={{ color: "#e11d48", borderColor: "#fecdd3", background: "#fff1f2" }}
                            >
                                {saving ? "Menghapus..." : "Hapus Bagian"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/* ==========================================================================
   CRUD: DATA KARYAWAN (DASHBOARD-UNIFIED STYLE)
   ========================================================================== */
function DataKaryawanPage({ API }) {
    const [employees, setEmployees] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [positions, setPositions] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("Semua");
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [showModal, setShowModal] = useState(false);
    const [currentEmp, setCurrentEmp] = useState({
        id: "",
        employee_code: "",
        name: "",
        photo: "",
        division: "",
        position: "",
        department: "",
        join_date: "",
        category: "Full Time",
        contract_start: "",
        contract_end: "",
        work_status: "Aktif",
        account_status: "Aktif",
        contract_reminder: "Kontrak aktif",
    });
    const [detailModal, setDetailModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);
    const [batchDeleteModal, setBatchDeleteModal] = useState(false);
    const [batchContractModal, setBatchContractModal] = useState(false);
    const [newContractDate, setNewContractDate] = useState("");
    const [uploadModal, setUploadModal] = useState(false);
    const [uploadText, setUploadText] = useState("");
    const [uploadFileName, setUploadFileName] = useState("");
    const [uploadParsed, setUploadParsed] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchAllData = async () => {
        setLoading(true);
        setError("");
        try {
            const [empRes, divRes, posRes, deptRes] = await Promise.all([
                fetchWithAuth(`${API}/api/employees`),
                fetchWithAuth(`${API}/api/divisions`),
                fetchWithAuth(`${API}/api/positions`),
                fetchWithAuth(`${API}/api/departments`),
            ]);

            const empData = await empRes.json();
            const divData = await divRes.json();
            const posData = await posRes.json();
            const deptData = await deptRes.json();

            setEmployees(empData.employees || []);
            setDivisions(divData.divisions || []);
            setPositions(posData.positions || []);
            setDepartments(deptData.departments || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const totalActive = useMemo(() => employees.filter((e) => e.work_status === "Aktif").length, [employees]);
    const totalInactive = useMemo(() => employees.filter((e) => e.work_status === "Tidak Aktif").length, [employees]);

    const filtered = useMemo(() => {
        let list = [...employees];
        if (statusFilter !== "Semua") {
            list = list.filter((e) => e.work_status === statusFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase().trim();
            list = list.filter(
                (e) =>
                    (e.name && e.name.toLowerCase().includes(q)) ||
                    (e.employee_code && e.employee_code.toLowerCase().includes(q)) ||
                    (e.division && e.division.toLowerCase().includes(q)) ||
                    (e.position && e.position.toLowerCase().includes(q))
            );
        }
        return list;
    }, [employees, statusFilter, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * perPage;
        return filtered.slice(start, start + perPage);
    }, [filtered, currentPage, perPage]);

    const isAllSelected = paginated.length > 0 && paginated.every((e) => selectedIds.has(String(e.id)));

    const toggleSelectAll = () => {
        const next = new Set(selectedIds);
        if (isAllSelected) {
            paginated.forEach((e) => next.delete(String(e.id)));
        } else {
            paginated.forEach((e) => next.add(String(e.id)));
        }
        setSelectedIds(next);
    };

    const toggleSelectRow = (id) => {
        const next = new Set(selectedIds);
        const strId = String(id);
        if (next.has(strId)) {
            next.delete(strId);
        } else {
            next.add(strId);
        }
        setSelectedIds(next);
    };

    const handleBatchStatus = async (status) => {
        if (!selectedIds.size) return alert("Pilih minimal satu karyawan");
        setSaving(true);
        try {
            const res = await fetchWithAuth(`${API}/api/employees/batch-status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedIds), status }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal mengubah status");
            setSelectedIds(new Set());
            fetchAllData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleBatchDelete = async () => {
        if (!selectedIds.size) return;
        setSaving(true);
        try {
            const res = await fetchWithAuth(`${API}/api/employees/batch-delete`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: Array.from(selectedIds) }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal menghapus karyawan");
            setSelectedIds(new Set());
            setBatchDeleteModal(false);
            fetchAllData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleBatchContractSubmit = async (e) => {
        e.preventDefault();
        if (!newContractDate) return alert("Pilih tanggal kontrak baru");
        setSaving(true);
        try {
            for (const id of Array.from(selectedIds)) {
                await fetchWithAuth(`${API}/api/employees/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contract_end: newContractDate,
                        contract_reminder: `Kontrak diperbarui s/d ${newContractDate}`,
                    }),
                });
            }
            setSelectedIds(new Set());
            setBatchContractModal(false);
            fetchAllData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!currentEmp.name.trim()) return alert("Nama karyawan wajib diisi");
        setSaving(true);
        try {
            if (showModal === "add") {
                const res = await fetchWithAuth(`${API}/api/employees`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(currentEmp),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Gagal menambah karyawan");
            } else if (showModal === "edit") {
                const res = await fetchWithAuth(`${API}/api/employees/${currentEmp.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(currentEmp),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Gagal memperbarui karyawan");
            }
            setShowModal(false);
            fetchAllData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteSingle = async () => {
        if (!deleteModal) return;
        setSaving(true);
        try {
            const res = await fetchWithAuth(`${API}/api/employees/${deleteModal.id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal menghapus karyawan");
            setDeleteModal(null);
            fetchAllData();
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const downloadCSV = () => {
        const headers = [
            "ID Karyawan",
            "Nama Lengkap",
            "Divisi",
            "Jabatan",
            "Bagian",
            "Kategori",
            "Tanggal Masuk",
            "Mulai Kontrak",
            "Selesai Kontrak",
            "Status Kerja",
            "Status Akun",
            "Pengingat Kontrak",
        ];

        const rows = filtered.map((e) => [
            `"${e.employee_code || ""}"`,
            `"${e.name || ""}"`,
            `"${e.division || ""}"`,
            `"${e.position || ""}"`,
            `"${e.department || ""}"`,
            `"${e.category || ""}"`,
            `"${e.join_date || ""}"`,
            `"${e.contract_start || ""}"`,
            `"${e.contract_end || ""}"`,
            `"${e.work_status || ""}"`,
            `"${e.account_status || ""}"`,
            `"${e.contract_reminder || ""}"`,
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Data_Karyawan_SMART_HRM_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const downloadExcelTemplate = () => {
        // Headers sesuai panduan modal
        const headers = [
            "Username",
            "Nama Lengkap",
            "Email",
            "Role",
            "Tanggal Bergabung",
            "Jenis Kelamin",
            "Pendidikan",
            "Agama",
            "Divisi",
            "Jabatan",
            "Bagian",
            "Lokasi Kerja",
            "Kategori Karyawan",
            "Mulai Tanggal",
            "Selesai Tanggal",
            "Status Marital",
            "Nomor KTP",
            "Nomor KK",
            "NPWP",
            "KPJ",
            "JKN",
            "SIM",
            "STNK",
            "Hubungan",
        ];

        const sampleRows = [
            [
                "ahmad.fauzi",
                "Ahmad Fauzi",
                "ahmad.fauzi@company.com",
                "Karyawan",
                "01/06/2024",
                "L",
                "S1",
                "Islam",
                divisions[0]?.name || "IT",
                positions[0]?.name || "Staff",
                departments[0]?.name || "IT Support",
                "Kantor Pusat",
                "PKWT",
                "01/06/2024",
                "31/12/2026",
                "TK/0",
                "3201234567890001",
                "3201234567890002",
                "09.123.456.7-123.000",
                "12345678901",
                "0001234567890",
                "123456789012",
                "B 1234 ABC",
                "Orang Tua (Ayah)",
            ],
            [
                "dewi.anggraeni",
                "Dewi Anggraeni",
                "dewi.anggraeni@company.com",
                "HRD",
                "15/07/2024",
                "P",
                "S1",
                "Islam",
                divisions[1]?.name || divisions[0]?.name || "HRD",
                positions[1]?.name || positions[0]?.name || "Staff",
                departments[1]?.name || departments[0]?.name || "Recruitment",
                "Kantor Pusat",
                "PKWTT",
                "15/07/2024",
                "31/12/2027",
                "K/1",
                "3201234567890003",
                "3201234567890004",
                "09.123.456.7-123.001",
                "12345678902",
                "0001234567891",
                "",
                "",
                "Suami",
            ],
        ];

        const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleRows]);

        // Auto widths
        ws["!cols"] = [
            { wch: 18 }, // Username
            { wch: 22 }, // Nama Lengkap
            { wch: 28 }, // Email
            { wch: 14 }, // Role
            { wch: 18 }, // Tanggal Bergabung
            { wch: 14 }, // Jenis Kelamin
            { wch: 14 }, // Pendidikan
            { wch: 14 }, // Agama
            { wch: 16 }, // Divisi
            { wch: 16 }, // Jabatan
            { wch: 18 }, // Bagian
            { wch: 18 }, // Lokasi Kerja
            { wch: 18 }, // Kategori Karyawan
            { wch: 16 }, // Mulai Tanggal
            { wch: 16 }, // Selesai Tanggal
            { wch: 15 }, // Status Marital
            { wch: 20 }, // Nomor KTP
            { wch: 20 }, // Nomor KK
            { wch: 22 }, // NPWP
            { wch: 16 }, // KPJ
            { wch: 18 }, // JKN
            { wch: 18 }, // SIM
            { wch: 14 }, // STNK
            { wch: 20 }, // Hubungan
        ];

        // Sheet Panduan Pengisian
        const petunjukData = [
            ["PANDUAN PENGISIAN TEMPLATE DATA KARYAWAN SMART HRM"],
            [""],
            ["Nama Kolom", "Aturan & Format Pengisian"],
            ["Username", "3–20 karakter tanpa spasi, hanya huruf, angka, titik (.) atau underscore (_), dan tidak boleh diawali simbol."],
            ["Password", 'Password otomatis dari sistem: "1234"'],
            ["Email", "Format nama@domain.com tanpa spasi dan domain valid."],
            ["Role", 'Pilihan valid: "Karyawan", "Atasan", "HRD", "Direktur", atau "Finance"'],
            ["Tanggal", "Format DD/MM/YYYY. Contoh: 25/05/2025."],
            ["Jenis Kelamin", 'Pilihan valid: "L" (Laki-laki) atau "P" (Perempuan).'],
            ["Pendidikan", 'Pilihan valid: "SD", "SMP", "SMA", "SMK", "MA", "D1", "D2", "D3", "D4", "S1", "S2", atau "S3"'],
            ["Agama", 'Pilihan valid: "Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu", atau "Atheis"'],
            ["Divisi, Jabatan, Bagian, Lokasi Kerja", "Harus sudah terdaftar di sistem SMART HRM serta penulisannya sama persis."],
            ["Kategori Karyawan", 'Pilihan valid: "Magang", "PKWT", "PKWTT", "KHL", "Harian", atau "Borongan"'],
            ["Status Marital", 'Pilihan valid: "TK/0", "TK/1", "TK/2", "TK/3", "K/0", "K/1", "K/2", atau "K/3"'],
            ["Nomor KTP, KK, NPWP, KPJ, JKN, SIM, STNK", "Sesuai format resmi identitas."],
            ["Hubungan", 'Pilihan valid: "Orang Tua (Ayah)", "Orang Tua (Ibu)", "Suami", "Istri", "Saudara Kandung", "Saudara Sepupu", "Teman", atau "Lainnya"'],
        ];
        const wsPetunjuk = XLSX.utils.aoa_to_sheet(petunjukData);
        wsPetunjuk["!cols"] = [{ wch: 32 }, { wch: 95 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Data Karyawan");
        XLSX.utils.book_append_sheet(wb, wsPetunjuk, "Petunjuk Pengisian");

        XLSX.writeFile(wb, "Template_Data_Karyawan_SMART_HRM.xlsx");
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadText.trim() && (!uploadParsed || !uploadParsed.length)) {
            return alert("Pilih dokumen Excel, CSV, atau JSON karyawan terlebih dahulu");
        }
        setSaving(true);
        try {
            let parsed = [];
            const formatDate = (val) => {
                if (!val) return "";
                if (typeof val === "string" && val.includes("/")) {
                    const parts = val.split("/");
                    if (parts.length === 3) {
                        return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
                    }
                }
                return String(val);
            };

            if (uploadParsed && Array.isArray(uploadParsed) && uploadParsed.length > 0) {
                parsed = uploadParsed.map((row, idx) => {
                    const empName = row["Nama Lengkap"] || row["Nama"] || row["name"] || "";
                    const empCode = row["Username"] || row["ID Karyawan"] || row["employee_code"] || "";
                    const startDate = formatDate(row["Mulai Tanggal"] || row["Tanggal Bergabung"] || row["contract_start"]);
                    const endDate = formatDate(row["Selesai Tanggal"] || row["contract_end"]) || "2026-12-31";
                    const joinDate = formatDate(row["Tanggal Bergabung"] || row["join_date"]) || startDate || new Date().toISOString().slice(0, 10);

                    return {
                        employee_code: empCode || `K00${employees.length + idx + 1}`,
                        name: empName,
                        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                        division: row["Divisi"] || row["division"] || "IT",
                        position: row["Jabatan"] || row["position"] || "Staff",
                        department: row["Bagian"] || row["department"] || "IT Support",
                        category: row["Kategori Karyawan"] || row["Kategori"] || row["category"] || "Full Time",
                        join_date: joinDate,
                        contract_start: startDate || new Date().toISOString().slice(0, 10),
                        contract_end: endDate,
                        work_status: "Aktif",
                        account_status: "Aktif",
                        contract_reminder: "Kontrak aktif",
                    };
                }).filter((item) => item.name && item.name.trim());
            } else {
                try {
                    const rawJson = JSON.parse(uploadText);
                    if (Array.isArray(rawJson)) {
                        parsed = rawJson.map((row, idx) => ({
                            employee_code: row.employee_code || row.Username || `K00${employees.length + idx + 1}`,
                            name: row.name || row["Nama Lengkap"] || "",
                            photo: row.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                            division: row.division || row.Divisi || "IT",
                            position: row.position || row.Jabatan || "Staff",
                            department: row.department || row.Bagian || "IT Support",
                            category: row.category || row["Kategori Karyawan"] || "Full Time",
                            contract_start: row.contract_start || new Date().toISOString().slice(0, 10),
                            contract_end: row.contract_end || "2026-12-31",
                            work_status: row.work_status || "Aktif",
                            account_status: row.account_status || "Aktif",
                            contract_reminder: "Kontrak aktif",
                        })).filter((item) => item.name && item.name.trim());
                    }
                } catch {
                    const lines = uploadText.split("\n").filter((l) => l.trim());
                    if (lines.length > 1) {
                        for (let i = 1; i < lines.length; i++) {
                            const cols = lines[i].split(",").map((c) => c.replace(/^"|"$/g, "").trim());
                            if (cols[1]) {
                                parsed.push({
                                    employee_code: cols[0] || `K00${employees.length + i}`,
                                    name: cols[1],
                                    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                                    division: cols[2] || "IT",
                                    position: cols[3] || "Staff",
                                    department: cols[4] || "IT Support",
                                    category: cols[5] || "Full Time",
                                    contract_start: cols[7] || new Date().toISOString().slice(0, 10),
                                    contract_end: cols[8] || "2026-12-31",
                                    work_status: cols[9] || "Aktif",
                                    account_status: cols[10] || "Aktif",
                                    contract_reminder: "Kontrak aktif",
                                });
                            }
                        }
                    }
                }
            }

            if (!Array.isArray(parsed) || !parsed.length) {
                throw new Error("Format data tidak valid atau belum ada nama karyawan di file");
            }

            for (const item of parsed) {
                await fetchWithAuth(`${API}/api/employees`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(item),
                });
            }

            setUploadModal(false);
            setUploadText("");
            setUploadFileName("");
            setUploadParsed(null);
            fetchAllData();
            alert(`Berhasil mengunggah ${parsed.length} data karyawan!`);
        } catch (err) {
            alert(err.message || "Gagal mengunggah data");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {showModal !== "add" && (
                <>
                    <div className="welcome-row">
                        <div>
                            <div className="eyebrow blue">
                                PEOPLE OPERATIONS <span>•</span> DIREKTORI KARYAWAN
                            </div>
                            <h1>
                                Data Karyawan
                            </h1>
                            <p>Pusat administrasi profil, status kepegawaian, masa kontrak, dan aksi massal.</p>
                        </div>

                        <div className="welcome-actions">
                            <button className="secondary" onClick={() => setUploadModal(true)}>
                                <Upload size={14} />
                                Unggah Data
                            </button>
                            <button className="secondary" onClick={downloadCSV}>
                                <Download size={14} />
                                Export CSV
                            </button>
                            <button
                                className="primary compact"
                                onClick={() => {
                                    setCurrentEmp({
                                        id: "",
                                        employee_code: `K00${employees.length + 1}`,
                                        name: "",
                                        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
                                        division: divisions[0]?.name || "IT",
                                        position: positions[0]?.name || "Staff",
                                        department: departments[0]?.name || "IT Support",
                                        join_date: new Date().toISOString().slice(0, 10),
                                        category: "Full Time",
                                        contract_start: new Date().toISOString().slice(0, 10),
                                        contract_end: "2026-12-31",
                                        work_status: "Aktif",
                                        account_status: "Aktif",
                                        contract_reminder: "Kontrak aktif",
                                    });
                                    setShowModal("add");
                                }}
                            >
                                <Plus size={15} />
                                Tambah Karyawan
                            </button>
                        </div>
                    </div>

                    {/* Dashboard-Consistent Metric Cards */}
                    <div className="metric-grid metric-grid-5">
                        <div className="metric-card">
                            <div className="metric-top">
                                <span>Total Karyawan</span>
                                <span className="metric-icon">
                                    <Users size={18} />
                                </span>
                            </div>
                            <div className="metric-value">{employees.length}</div>
                            <div className="metric-bottom">
                                <span className="green">
                                    <ArrowUpRight size={13} /> +8.2%
                                </span>
                                <small>terdaftar di sistem</small>
                            </div>
                            <div className="sparkline">
                                {[25, 40, 30, 56, 42, 65, 58, 76].map((value, i) => (
                                    <i key={i} style={{ height: `${value}%` }} />
                                ))}
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-top">
                                <span>Karyawan Aktif</span>
                                <span className="metric-icon" style={{ background: "#e8f8f1", color: "#24966e" }}>
                                    <CheckCircle2 size={18} />
                                </span>
                            </div>
                            <div className="metric-value">{totalActive}</div>
                            <div className="metric-bottom">
                                <span className="green">
                                    <ArrowUpRight size={13} />
                                    {employees.length ? Math.round((totalActive / employees.length) * 100) : 0}%
                                </span>
                                <small>status kerja aktif</small>
                            </div>
                            <div className="sparkline">
                                {[55, 45, 63, 57, 70, 62, 82, 76].map((value, i) => (
                                    <i key={i} style={{ height: `${value}%` }} />
                                ))}
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-top">
                                <span>Karyawan Tidak Aktif</span>
                                <span className="metric-icon" style={{ background: "#fff0e4", color: "#bf7b42" }}>
                                    <Clock3 size={18} />
                                </span>
                            </div>
                            <div className="metric-value">{totalInactive}</div>
                            <div className="metric-bottom">
                                <span className="orange">
                                    {employees.length ? Math.round((totalInactive / employees.length) * 100) : 0}%
                                </span>
                                <small>non aktif / purna tugas</small>
                            </div>
                            <div className="sparkline">
                                {[25, 48, 38, 65, 45, 72, 60, 55].map((value, i) => (
                                    <i key={i} style={{ height: `${value}%` }} />
                                ))}
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-top">
                                <span>Jumlah Divisi</span>
                                <span className="metric-icon" style={{ background: "#f5f0ff", color: "#7c3aed" }}>
                                    <Building2 size={18} />
                                </span>
                            </div>
                            <div className="metric-value">{divisions.length}</div>
                            <div className="metric-bottom">
                                <small>divisi terdaftar</small>
                            </div>
                            <div className="sparkline">
                                {[30, 35, 42, 38, 57, 53, 70, 82].map((value, i) => (
                                    <i key={i} style={{ height: `${value}%` }} />
                                ))}
                            </div>
                        </div>

                        <div className="metric-card">
                            <div className="metric-top">
                                <span>Jumlah Jabatan</span>
                                <span className="metric-icon" style={{ background: "#fff0fb", color: "#be185d" }}>
                                    <BriefcaseBusiness size={18} />
                                </span>
                            </div>
                            <div className="metric-value">{positions.length}</div>
                            <div className="metric-bottom">
                                <small>{departments.length} bagian operasional</small>
                            </div>
                            <div className="sparkline">
                                {[20, 28, 35, 30, 45, 52, 61, 70].map((value, i) => (
                                    <i key={i} style={{ height: `${value}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Panel matching Dashboard team-panel */}
                    <section className="panel team-panel">
                        <div className="panel-head">
                            <div>
                                <h2>Daftar Karyawan</h2>
                                <p>Seluruh karyawan terdaftar dengan status kerja dan kontrak</p>
                            </div>

                            <div className="table-actions">
                                <select
                                    className="secondary"
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    style={{ padding: "7px 11px", fontSize: "11px", cursor: "pointer" }}
                                >
                                    <option value="Semua">Semua Status</option>
                                    <option value="Aktif">Aktif</option>
                                    <option value="Tidak Aktif">Tidak Aktif</option>
                                </select>

                                <select
                                    className="secondary"
                                    value={perPage}
                                    onChange={(e) => {
                                        setPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    style={{ padding: "7px 11px", fontSize: "11px", cursor: "pointer" }}
                                >
                                    <option value={10}>10 Baris</option>
                                    <option value={25}>25 Baris</option>
                                    <option value={50}>50 Baris</option>
                                </select>

                                <div className="searchbox" style={{ padding: "6px 12px", minWidth: "220px" }}>
                                    <Search size={14} />
                                    <input
                                        placeholder="Cari nama, ID, divisi..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                        style={{
                                            border: "none",
                                            outline: "none",
                                            background: "transparent",
                                            fontSize: "11px",
                                            color: "inherit",
                                            width: "100%",
                                        }}
                                    />
                                    {search && (
                                        <button
                                            type="button"
                                            onClick={() => setSearch("")}
                                            style={{
                                                border: 0,
                                                background: "none",
                                                cursor: "pointer",
                                                color: "#9aa6b6",
                                                padding: 0,
                                            }}
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bulk Action Bar on Selection */}
                        {selectedIds.size > 0 && (
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "10px 20px",
                                    background: "#f0f5ff",
                                    borderTop: "1px solid #e1ebff",
                                    borderBottom: "1px solid #e1ebff",
                                    gap: "10px",
                                    flexWrap: "wrap",
                                }}
                            >
                                <span style={{ fontSize: "11px", fontWeight: 700, color: "#2465d7" }}>
                                    <CheckCircle2
                                        size={14}
                                        style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }}
                                    />
                                    {selectedIds.size} karyawan dipilih
                                </span>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    <button
                                        className="secondary"
                                        onClick={() => handleBatchStatus("Aktif")}
                                        style={{ fontSize: "11px", padding: "6px 10px" }}
                                    >
                                        <Check size={13} /> Aktifkan
                                    </button>
                                    <button
                                        className="secondary"
                                        onClick={() => handleBatchStatus("Tidak Aktif")}
                                        style={{ fontSize: "11px", padding: "6px 10px" }}
                                    >
                                        Non Aktifkan
                                    </button>
                                    <button
                                        className="secondary"
                                        onClick={() => setBatchContractModal(true)}
                                        style={{ fontSize: "11px", padding: "6px 10px" }}
                                    >
                                        <CalendarDays size={13} /> Perbarui Kontrak
                                    </button>
                                    <button
                                        className="secondary"
                                        onClick={() => setBatchDeleteModal(true)}
                                        style={{
                                            fontSize: "11px",
                                            padding: "6px 10px",
                                            color: "#e11d48",
                                            borderColor: "#fecdd3",
                                            background: "#fff1f2",
                                        }}
                                    >
                                        <Trash2 size={13} /> Hapus Terpilih
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div style={{ padding: "12px 20px", color: "#e11d48", fontSize: "11px" }}>
                                <AlertCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                                {error}
                            </div>
                        )}

                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "36px", textAlign: "left", paddingLeft: "16px", paddingRight: "8px" }}>
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                onChange={toggleSelectAll}
                                                aria-label="Pilih semua"
                                            />
                                        </th>
                                        <th style={{ width: "45px" }}>NO</th>
                                        <th style={{ minWidth: "88px" }}>ID</th>
                                        <th>NAMA KARYAWAN</th>
                                        <th>DIVISI</th>
                                        <th>JABATAN</th>
                                        <th>BAGIAN</th>
                                        <th>BERGABUNG TANGGAL</th>
                                        <th>MULAI TANGGAL</th>
                                        <th>SELESAI TANGGAL</th>
                                        <th>STATUS KERJA</th>
                                        <th>PENGINGAT</th>
                                        <th style={{ textAlign: "right", width: "120px" }}>AKSI</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={13} style={{ textAlign: "center", padding: "32px", color: "#8a97a9" }}>
                                                Memuat data karyawan...
                                            </td>
                                        </tr>
                                    ) : paginated.length === 0 ? (
                                        <tr>
                                            <td colSpan={13} style={{ textAlign: "center", padding: "32px", color: "#8a97a9" }}>
                                                {search || statusFilter !== "Semua"
                                                    ? "Tidak ada karyawan yang cocok dengan filter."
                                                    : "Belum ada data karyawan."}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginated.map((emp, index) => {
                                            const isChecked = selectedIds.has(String(emp.id));
                                            return (
                                                <tr
                                                    key={emp.id}
                                                    style={{ background: isChecked ? "#f5f9ff" : undefined }}
                                                >
                                                    <td style={{ paddingLeft: "16px", paddingRight: "8px" }}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => toggleSelectRow(emp.id)}
                                                        />
                                                    </td>
                                                    <td className="time-cell">
                                                        {(currentPage - 1) * perPage + index + 1}
                                                    </td>
                                                    <td>
                                                        <span className="emp-id-badge">
                                                            {emp.employee_code || "—"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="employee-cell">
                                                            <img
                                                                src={
                                                                    emp.photo ||
                                                                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                                                                }
                                                                alt={emp.name}
                                                                style={{
                                                                    width: "32px",
                                                                    height: "32px",
                                                                    borderRadius: "50%",
                                                                    objectFit: "cover",
                                                                }}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src =
                                                                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";
                                                                }}
                                                            />
                                                            <b style={{ color: "var(--text-heading, #1e293b)" }}>{emp.name}</b>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontWeight: 600, color: "var(--text-heading, #35445b)", fontSize: "11px" }}>
                                                            {emp.division || "—"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ color: "var(--text-secondary, #64748b)", fontSize: "11px" }}>
                                                            {emp.position || "—"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="type-tag">{emp.department || "—"}</span>
                                                    </td>
                                                    <td>
                                                        <span className="time-cell">{emp.join_date || "—"}</span>
                                                    </td>
                                                    <td>
                                                        <span className="time-cell">{emp.contract_start || "—"}</span>
                                                    </td>
                                                    <td>
                                                        <span className="time-cell">{emp.contract_end || "—"}</span>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`status ${emp.work_status === "Aktif" ? "present" : "inactive"
                                                                }`}
                                                        >
                                                            {emp.work_status || "Aktif"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {emp.contract_reminder && emp.contract_reminder !== "—" ? (
                                                            <span className="status reminder">
                                                                {emp.contract_reminder}
                                                            </span>
                                                        ) : (
                                                            <span style={{ color: "#c3ccd7" }}>—</span>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end" }}>
                                                            <button
                                                                className="icon-button"
                                                                title="Lihat Detail"
                                                                onClick={() => setDetailModal(emp)}
                                                            >
                                                                <Eye size={15} />
                                                            </button>
                                                            <button
                                                                className="icon-button"
                                                                title="Edit Data"
                                                                onClick={() => {
                                                                    setCurrentEmp(emp);
                                                                    setShowModal("edit");
                                                                }}
                                                            >
                                                                <Pencil size={15} />
                                                            </button>
                                                            <button
                                                                className="icon-button"
                                                                title="Hapus"
                                                                style={{ color: "#e11d48" }}
                                                                onClick={() => setDeleteModal(emp)}
                                                            >
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="table-footer">
                            <span className="tf-info">
                                Menampilkan{" "}
                                <strong>{filtered.length === 0 ? 0 : (currentPage - 1) * perPage + 1}</strong>
                                {" "}–{" "}
                                <strong>{Math.min(currentPage * perPage, filtered.length)}</strong>
                                {" "}dari{" "}
                                <strong>{filtered.length}</strong> data
                                {selectedIds.size > 0 && <span className="tf-selected"> · {selectedIds.size} dipilih</span>}
                            </span>
                            <div className="pagination-group">
                                <button
                                    className="btn-page"
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                >
                                    ‹ Sebelumnya
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .reduce((acc, p, idx, arr) => {
                                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                                        acc.push(p);
                                        return acc;
                                    }, [])
                                    .map((p, i) =>
                                        p === "…" ? (
                                            <span key={`ellipsis-${i}`} className="page-ellipsis">…</span>
                                        ) : (
                                            <button
                                                key={p}
                                                className={`btn-page${currentPage === p ? " active" : ""}`}
                                                onClick={() => setCurrentPage(p)}
                                            >
                                                {p}
                                            </button>
                                        )
                                    )}
                                <button
                                    className="btn-page"
                                    disabled={currentPage >= totalPages}
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                >
                                    Selanjutnya ›
                                </button>
                            </div>
                        </div>
                    </section>

                </>
            )}

            {showModal === "add" && (
                <TambahKaryawanPage
                    API={API}
                    initialData={currentEmp}
                    divisions={divisions}
                    positions={positions}
                    departments={departments}
                    fetchWithAuth={fetchWithAuth}
                    onCancel={() => setShowModal(false)}
                    onSaved={() => { setShowModal(false); fetchAllData(); }}
                />
            )}
            {/* Modal Edit Karyawan tetap seperti sebelumnya */}
            {showModal === "edit" && (
                <div
                    className={showModal === "add" ? "employee-create-page" : "modal-overlay"}
                    onClick={showModal === "edit" ? () => setShowModal(false) : undefined}
                    style={showModal === "add" ? { position: "static", display: "block", background: "transparent", padding: "0", width: "100%", height: "auto", overflow: "visible" } : undefined}
                >
                    {showModal === "add" && (
                        <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18, fontSize: 12, color: "#64748b" }}>
                            <button type="button" onClick={() => setShowModal(false)} style={{ border: 0, background: "none", padding: 0, color: "#2563eb", cursor: "pointer", fontWeight: 600 }}>
                                Data Karyawan
                            </button>
                            <ChevronRight size={14} />
                            <span style={{ color: "#1e293b", fontWeight: 700 }}>Tambah Karyawan</span>
                        </nav>
                    )}
                    <div
                        className="modal-dialog"
                        style={showModal === "add" ? { maxWidth: "100%", width: "100%", margin: 0, position: "relative", transform: "none", borderRadius: 14, boxShadow: "0 8px 30px rgba(30,50,85,.07)" } : { maxWidth: "600px" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="panel-head" style={{ borderBottom: "1px solid #f0f3f7", padding: "18px 22px" }}>
                            <div>
                                <h2>{showModal === "add" ? "Tambah Karyawan" : "Edit Karyawan"}</h2>
                                <p>{showModal === "add" ? "Isi data karyawan pada halaman ini." : "Informasi profil, penempatan divisi, dan durasi kontrak"}</p>
                            </div>
                            <button className="icon-button" onClick={() => setShowModal(false)}>
                                <X size={17} />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body" style={{ padding: "20px 22px" }}>
                                <div className="form-row-2">
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                        ID Karyawan
                                        <input
                                            type="text"
                                            required
                                            value={currentEmp.employee_code}
                                            onChange={(e) =>
                                                setCurrentEmp({ ...currentEmp, employee_code: e.target.value })
                                            }
                                            placeholder="Contoh: K001"
                                            style={{ marginTop: "6px" }}
                                        />
                                    </label>
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                        Nama Lengkap
                                        <input
                                            type="text"
                                            required
                                            value={currentEmp.name}
                                            onChange={(e) => setCurrentEmp({ ...currentEmp, name: e.target.value })}
                                            placeholder="Nama lengkap karyawan"
                                            style={{ marginTop: "6px" }}
                                            autoFocus
                                        />
                                    </label>
                                </div>

                                <div className="form-row-2">
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                        URL Foto Profil
                                        <input
                                            type="text"
                                            value={currentEmp.photo}
                                            onChange={(e) => setCurrentEmp({ ...currentEmp, photo: e.target.value })}
                                            placeholder="https://..."
                                            style={{ marginTop: "6px" }}
                                        />
                                    </label>
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                        Kategori Kerja
                                        <select
                                            value={currentEmp.category}
                                            onChange={(e) =>
                                                setCurrentEmp({ ...currentEmp, category: e.target.value })
                                            }
                                            style={{ marginTop: "6px" }}
                                        >
                                            <option value="Full Time">Full Time</option>
                                            <option value="Part Time">Part Time</option>
                                            <option value="Internship">Internship</option>
                                            <option value="Kontrak">Kontrak</option>
                                        </select>
                                    </label>
                                </div>

                                <div className="form-row-2">
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                        Divisi
                                        <select
                                            value={currentEmp.division}
                                            onChange={(e) =>
                                                setCurrentEmp({ ...currentEmp, division: e.target.value })
                                            }
                                            style={{ marginTop: "6px" }}
                                        >
                                            {divisions.length > 0 ? (
                                                divisions.map((d) => (
                                                    <option key={d.id} value={d.name}>
                                                        {d.name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="IT">IT</option>
                                            )}
                                        </select>
                                    </label>
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                        Jabatan
                                        <select
                                            value={currentEmp.position}
                                            onChange={(e) =>
                                                setCurrentEmp({ ...currentEmp, position: e.target.value })
                                            }
                                            style={{ marginTop: "6px" }}
                                        >
                                            {positions.length > 0 ? (
                                                positions.map((p) => (
                                                    <option key={p.id} value={p.name}>
                                                        {p.name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="Staff">Staff</option>
                                            )}
                                        </select>
                                    </label>
                                </div>

                                <div className="form-row-2">
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                        Bagian
                                        <select
                                            value={currentEmp.department}
                                            onChange={(e) =>
                                                setCurrentEmp({ ...currentEmp, department: e.target.value })
                                            }
                                            style={{ marginTop: "6px" }}
                                        >
                                            {departments.length > 0 ? (
                                                departments.map((d) => (
                                                    <option key={d.id} value={d.name}>
                                                        {d.name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="IT Support">IT Support</option>
                                            )}
                                        </select>
                                    </label>
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                        Tanggal Bergabung
                                        <input
                                            type="date"
                                            value={currentEmp.join_date}
                                            onChange={(e) =>
                                                setCurrentEmp({ ...currentEmp, join_date: e.target.value })
                                            }
                                            style={{ marginTop: "6px" }}
                                        />
                                    </label>
                                </div>

                                <div className="form-row-2">
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                        Mulai Tanggal
                                        <input
                                            type="date"
                                            value={currentEmp.contract_start}
                                            onChange={(e) =>
                                                setCurrentEmp({ ...currentEmp, contract_start: e.target.value })
                                            }
                                            style={{ marginTop: "6px" }}
                                        />
                                    </label>
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                        Selesai Tanggal
                                        <input
                                            type="date"
                                            value={currentEmp.contract_end}
                                            onChange={(e) =>
                                                setCurrentEmp({ ...currentEmp, contract_end: e.target.value })
                                            }
                                            style={{ marginTop: "6px" }}
                                        />
                                    </label>
                                </div>

                                <div className="form-row-2">
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                        Pengingat Kontrak
                                        <input
                                            type="text"
                                            value={currentEmp.contract_reminder}
                                            onChange={(e) =>
                                                setCurrentEmp({ ...currentEmp, contract_reminder: e.target.value })
                                            }
                                            placeholder="Contoh: Kontrak habis dalam 60 hari"
                                            style={{ marginTop: "6px" }}
                                        />
                                    </label>
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                        Status Kerja
                                        <select
                                            value={currentEmp.work_status}
                                            onChange={(e) =>
                                                setCurrentEmp({ ...currentEmp, work_status: e.target.value })
                                            }
                                            style={{ marginTop: "6px" }}
                                        >
                                            <option value="Aktif">Aktif</option>
                                            <option value="Tidak Aktif">Tidak Aktif</option>
                                        </select>
                                    </label>
                                </div>

                                <div className="form-row-2">
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "#64748b" }}>
                                        Status Akun
                                        <select
                                            value={currentEmp.account_status}
                                            onChange={(e) =>
                                                setCurrentEmp({ ...currentEmp, account_status: e.target.value })
                                            }
                                            style={{ marginTop: "6px" }}
                                        >
                                            <option value="Aktif">Aktif</option>
                                            <option value="Tidak Aktif">Tidak Aktif</option>
                                        </select>
                                    </label>
                                </div>
                            </div>
                            <div className="modal-action-footer">
                                <button type="button" className="secondary" onClick={() => setShowModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="primary compact" disabled={saving}>
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detail Karyawan */}
            {detailModal && (
                <div className="modal-overlay" onClick={() => setDetailModal(null)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="panel-head" style={{ borderBottom: "1px solid #f0f3f7", padding: "18px 22px" }}>
                            <div>
                                <h2>Detail Karyawan</h2>
                                <p>Informasi profil dan penempatan kerja</p>
                            </div>
                            <button className="icon-button" onClick={() => setDetailModal(null)}>
                                <X size={17} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: "20px 22px" }}>
                            <div className="detail-view-card">
                                <div className="detail-profile-hero">
                                    <img
                                        src={
                                            detailModal.photo ||
                                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                                        }
                                        alt={detailModal.name}
                                        className="detail-avatar-large"
                                    />
                                    <div>
                                        <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "#1e304b" }}>
                                            {detailModal.name}
                                        </h3>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                            <span style={{ fontWeight: 700, color: "#2465d7", fontSize: "11px" }}>
                                                {detailModal.employee_code}
                                            </span>
                                            <span
                                                className={`status ${detailModal.work_status === "Aktif" ? "present" : "leave"
                                                    }`}
                                            >
                                                {detailModal.work_status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span>Divisi</span>
                                        <b>{detailModal.division || "—"}</b>
                                    </div>
                                    <div className="detail-item">
                                        <span>Jabatan</span>
                                        <b>{detailModal.position || "—"}</b>
                                    </div>
                                    <div className="detail-item">
                                        <span>Bagian</span>
                                        <b>{detailModal.department || "—"}</b>
                                    </div>
                                    <div className="detail-item">
                                        <span>Kategori Kerja</span>
                                        <b>{detailModal.category || "Full Time"}</b>
                                    </div>
                                    <div className="detail-item">
                                        <span>Tanggal Bergabung</span>
                                        <b>{detailModal.join_date || "—"}</b>
                                    </div>
                                    <div className="detail-item">
                                        <span>Mulai Tanggal</span>
                                        <b>{detailModal.contract_start || "—"}</b>
                                    </div>
                                    <div className="detail-item">
                                        <span>Selesai Tanggal</span>
                                        <b>{detailModal.contract_end || "—"}</b>
                                    </div>
                                    <div className="detail-item">
                                        <span>Status Akun</span>
                                        <b>{detailModal.account_status || "—"}</b>
                                    </div>
                                    <div className="detail-item">
                                        <span>Pengingat</span>
                                        <b>{detailModal.contract_reminder || "—"}</b>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-action-footer">
                            <button
                                type="button"
                                className="secondary"
                                onClick={() => {
                                    setCurrentEmp(detailModal);
                                    setDetailModal(null);
                                    setShowModal("edit");
                                }}
                            >
                                <Pencil size={13} /> Edit Data
                            </button>
                            <button type="button" className="primary compact" onClick={() => setDetailModal(null)}>
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Hapus Single */}
            {deleteModal && (
                <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="panel-head" style={{ borderBottom: "1px solid #f0f3f7", padding: "18px 22px" }}>
                            <div>
                                <h2>Hapus Karyawan</h2>
                                <p>Konfirmasi penghapusan data karyawan</p>
                            </div>
                            <button className="icon-button" onClick={() => setDeleteModal(null)}>
                                <X size={17} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: "20px 22px" }}>
                            <p style={{ margin: 0, color: "#475569", fontSize: "12px", lineHeight: "1.6" }}>
                                Apakah Anda yakin ingin menghapus <b>{deleteModal.name}</b> ({deleteModal.employee_code})? Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                        <div className="modal-action-footer">
                            <button type="button" className="secondary" onClick={() => setDeleteModal(null)}>
                                Batal
                            </button>
                            <button
                                type="button"
                                className="secondary"
                                onClick={handleDeleteSingle}
                                disabled={saving}
                                style={{ color: "#e11d48", borderColor: "#fecdd3", background: "#fff1f2" }}
                            >
                                {saving ? "Menyimpan..." : "Hapus Karyawan"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Batch Delete */}
            {batchDeleteModal && (
                <div className="modal-overlay" onClick={() => setBatchDeleteModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="panel-head">
                            <div>
                                <h2>Hapus Massal</h2>
                                <p>Konfirmasi penghapusan {selectedIds.size} karyawan terpilih</p>
                            </div>
                            <button className="icon-button" onClick={() => setBatchDeleteModal(false)}>
                                <X size={17} />
                            </button>
                        </div>
                        <div className="modal-body" style={{ padding: "20px 22px" }}>
                            <p style={{ margin: 0, color: "var(--text-modal-subtitle, #475569)", fontSize: "12px", lineHeight: "1.6" }}>
                                Apakah Anda yakin ingin menghapus <b>{selectedIds.size}</b> data karyawan yang dipilih?
                            </p>
                        </div>
                        <div className="modal-action-footer">
                            <button
                                type="button"
                                className="secondary"
                                onClick={() => setBatchDeleteModal(false)}
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                className="secondary"
                                onClick={handleBatchDelete}
                                disabled={saving}
                                style={{ color: "#e11d48", borderColor: "#fecdd3", background: "#fff1f2" }}
                            >
                                {saving ? "Menyimpan..." : `Hapus ${selectedIds.size} Karyawan`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Batch Contract Update */}
            {batchContractModal && (
                <div className="modal-overlay" onClick={() => setBatchContractModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="panel-head">
                            <div>
                                <h2>Perbarui Kontrak ({selectedIds.size} Karyawan)</h2>
                                <p>Tentukan batas akhir kontrak baru untuk karyawan terpilih</p>
                            </div>
                            <button className="icon-button" onClick={() => setBatchContractModal(false)}>
                                <X size={17} />
                            </button>
                        </div>
                        <form onSubmit={handleBatchContractSubmit}>
                            <div className="modal-body" style={{ padding: "20px 22px" }}>
                                <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-modal-subtitle, #64748b)" }}>
                                    Tanggal Akhir Kontrak Baru
                                    <input
                                        type="date"
                                        required
                                        value={newContractDate}
                                        onChange={(e) => setNewContractDate(e.target.value)}
                                        style={{ marginTop: "6px" }}
                                        autoFocus
                                    />
                                </label>
                            </div>
                            <div className="modal-action-footer">
                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => setBatchContractModal(false)}
                                >
                                    Batal
                                </button>
                                <button type="submit" className="primary compact" disabled={saving}>
                                    {saving ? "Menyimpan..." : "Perbarui Kontrak"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Upload Data */}
            {uploadModal && (
                <div className="modal-overlay" onClick={() => setUploadModal(false)}>
                    <div className="modal-dialog" style={{ maxWidth: "580px" }} onClick={(e) => e.stopPropagation()}>
                        <div className="panel-head">
                            <div>
                                <h2>Unggah Data Baru Karyawan</h2>
                                <p>Impor data massal melalui format Excel (.xlsx, .xls), CSV, atau JSON</p>
                            </div>
                            <button className="icon-button" onClick={() => setUploadModal(false)}>
                                <X size={17} />
                            </button>
                        </div>
                        <form onSubmit={handleUploadSubmit}>
                            <div className="modal-body" style={{ padding: "20px 22px", maxHeight: "70vh", overflowY: "auto" }}>
                                {/* File Upload */}
                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-modal-subtitle, #64748b)", display: "block", marginBottom: "6px" }}>
                                        Unggah dokumen Excel / CSV
                                    </label>
                                    <div className="upload-file-box">
                                        <label className="upload-file-btn">
                                            Pilih File
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls,.csv,.json"
                                                style={{ display: "none" }}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (!file) return;
                                                    setUploadFileName(file.name);
                                                    if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => {
                                                            try {
                                                                const data = new Uint8Array(ev.target.result);
                                                                const wb = XLSX.read(data, { type: "array" });
                                                                const sheetName = wb.SheetNames[0];
                                                                const sheet = wb.Sheets[sheetName];
                                                                const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
                                                                setUploadParsed(json);
                                                                setUploadText(JSON.stringify(json));
                                                            } catch (err) {
                                                                alert("Gagal membaca file Excel: " + err.message);
                                                            }
                                                        };
                                                        reader.readAsArrayBuffer(file);
                                                    } else {
                                                        const reader = new FileReader();
                                                        reader.onload = (ev) => {
                                                            setUploadParsed(null);
                                                            setUploadText(ev.target.result);
                                                        };
                                                        reader.readAsText(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                        <span className="upload-file-name">
                                            {uploadFileName || "Tidak ada file yang dipilih"}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={downloadExcelTemplate}
                                        className="download-template-link"
                                        title="Unduh template data karyawan dalam format Excel (.xlsx)"
                                    >
                                        <FileSpreadsheet size={15} />
                                        Download Template disini (.xlsx)
                                    </button>
                                </div>

                                {/* Panduan Pengisian */}
                                <div className="upload-guide-box">
                                    <p className="upload-guide-title">
                                        Panduan pengisian data karyawan di excel
                                    </p>
                                    <ul className="upload-guide-list">
                                        <li>Kolom <b>Username</b> harus diisi dengan 3–20 karakter tanpa spasi, hanya huruf, angka, titik (.) atau underscore (_), dan tidak boleh diawali dengan simbol.</li>
                                        <li>Password akun karyawan yang baru ditambahkan akan menggunakan password otomatis dari sistem: <b>"1234"</b>.</li>
                                        <li>Kolom <b>Email</b> harus diisi dengan format nama@domain.com tanpa spasi dan menggunakan domain yang valid.</li>
                                        <li>Kolom <b>Role</b> hanya dapat diisi dengan salah satu pilihan berikut: "Karyawan", "Atasan", "HRD", "Direktur", atau "Finance".</li>
                                        <li>Pengisian <b>Tanggal</b> harus berformat <b>DD/MM/YYYY</b>. Contoh: 25/05/2025.</li>
                                        <li>Kolom <b>Jenis Kelamin</b> hanya dapat diisi dengan "L" (Laki-laki) atau "P" (Perempuan).</li>
                                        <li>Kolom <b>Pendidikan</b> hanya dapat diisi dengan salah satu pilihan berikut: "SD", "SMP", "SMA", "SMK", "MA", "D1", "D2", "D3", "D4", "S1", "S2", atau "S3".</li>
                                        <li>Kolom <b>Agama</b> hanya dapat diisi dengan salah satu dari pilihan berikut: "Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu", atau "Atheis". Pengisian di luar opsi ini akan dianggap tidak valid.</li>
                                        <li>Sebelum mengisi kolom <b>Divisi</b>, <b>Jabatan</b>, <b>Bagian</b>, dan <b>Lokasi Kerja</b>, pastikan bahwa data tersebut sudah terdaftar dalam aplikasi yang digunakan serta penulisannya harus sama persis antara data yang tersedia di sistem dengan data yang diisi di Excel.</li>
                                        <li>Kolom <b>Kategori Karyawan</b> hanya dapat diisi dengan salah satu pilihan berikut: "Magang", "PKWT", "PKWTT", "KHL", "Harian", atau "Borongan".</li>
                                        <li>Kolom <b>Status Marital</b> hanya dapat diisi dengan salah satu pilihan berikut: "TK/0", "TK/1", "TK/2", "TK/3", "K/0", "K/1", "K/2", atau "K/3".</li>
                                        <li>Kolom <b>Nomor KTP</b>, <b>KK</b>, <b>NPWP</b>, <b>KPJ</b>, <b>JKN</b>, <b>SIM</b>, dan <b>STNK</b> harus diisi sesuai format resmi yang berlaku.</li>
                                        <li>Kolom <b>Hubungan</b> hanya dapat diisi dengan salah satu pilihan berikut: "Orang Tua (Ayah)", "Orang Tua (Ibu)", "Suami", "Istri", "Saudara Kandung", "Saudara Sepupu", "Teman", atau "Lainnya".</li>
                                    </ul>
                                </div>

                                {/* Hidden textarea used by handleUploadSubmit */}
                                <textarea
                                    rows={0}
                                    style={{ height: 0, opacity: 0, position: "absolute", pointerEvents: "none" }}
                                    value={uploadText}
                                    readOnly
                                />
                            </div>
                            <div className="modal-action-footer">
                                <button
                                    type="button"
                                    className="secondary"
                                    onClick={() => setUploadModal(false)}
                                >
                                    Batal
                                </button>
                                <button type="submit" className="primary compact" disabled={saving}>
                                    {saving ? "Mengunggah..." : "Upload"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

function ModulePage({
    active,
    profile,
    employees,
    employeeLoading,
    employeeError,
    onRefreshEmployees,
    onNavigate,
    payrollRole = "admin",
    setPayrollRole,
}) {
    const info = moduleInfo[active] || {
        subtitle: "Kelola informasi pada modul ini.",
        icon: ClipboardList,
    };

    // --- MODUL PENGGAJIAN & KEUANGAN KARYAWAN ---
    if (active === "Dashboard Penggajian") {
        return (
            <PayrollDashboard
                API={API}
                onNavigate={onNavigate}
                currentRole={payrollRole}
                onRoleChange={setPayrollRole}
            />
        );
    }

    if (active === "Periode Penggajian") {
        return (
            <PayrollPeriodsPage
                API={API}
                onNavigate={onNavigate}
                userRole={payrollRole}
            />
        );
    }

    if (active === "Riwayat Penggajian") {
        return (
            <PayrollHistoryPage
                API={API}
                onNavigate={onNavigate}
                userRole={payrollRole}
            />
        );
    }

    if (active === "Proses Penggajian" || active === "Penggajian") {
        return (
            <PayrollProcessPage
                API={API}
                initialStep={1}
                periodId="prd-2026-09"
                userRole={payrollRole}
                onNavigate={onNavigate}
            />
        );
    }

    if (active === "Persetujuan Penggajian") {
        return (
            <PayrollProcessPage
                API={API}
                initialStep={4}
                periodId="prd-2026-09"
                userRole={payrollRole}
                onNavigate={onNavigate}
            />
        );
    }

    if (active === "Struktur Gaji") {
        return <SalaryStructurePage API={API} userRole={payrollRole} />;
    }

    if (active === "Komponen Gaji") {
        return <SalaryComponentsPage API={API} userRole={payrollRole} />;
    }

    if (active === "Aturan Penggajian") {
        return <PayrollRulesPage API={API} userRole={payrollRole} />;
    }

    if (active === "Pinjaman" || active === "Pinjaman Karyawan" || active === "Pinjaman Aktif") {
        return (
            <EmployeeLoansPage
                API={API}
                initialTab="active"
                userRole={payrollRole}
                onNavigate={onNavigate}
            />
        );
    }

    if (active === "Pengajuan Pinjaman") {
        return (
            <EmployeeLoansPage
                API={API}
                initialTab="requests"
                userRole={payrollRole}
                onNavigate={onNavigate}
            />
        );
    }

    if (active === "Riwayat Pinjaman") {
        return (
            <EmployeeLoansPage
                API={API}
                initialTab="history"
                userRole={payrollRole}
                onNavigate={onNavigate}
            />
        );
    }

    if (active === "Kasbon" || active === "Kasbon Aktif") {
        return (
            <CashAdvancePage
                API={API}
                initialTab="active"
                userRole={payrollRole}
                onNavigate={onNavigate}
            />
        );
    }

    if (active === "Pengajuan Kasbon") {
        return (
            <CashAdvancePage
                API={API}
                initialTab="requests"
                userRole={payrollRole}
                onNavigate={onNavigate}
            />
        );
    }

    if (active === "Riwayat Kasbon") {
        return (
            <CashAdvancePage
                API={API}
                initialTab="history"
                userRole={payrollRole}
                onNavigate={onNavigate}
            />
        );
    }

    if (active === "Penggantian Biaya" || active === "Reimbursement" || active === "Pengajuan Biaya" || active === "Pengajuan") {
        return (
            <ReimbursementPage
                API={API}
                initialTab="requests"
                userRole={payrollRole}
                onNavigate={onNavigate}
            />
        );
    }

    if (active === "Persetujuan Biaya" || active === "Persetujuan") {
        return (
            <ReimbursementPage
                API={API}
                initialTab="approved"
                userRole={payrollRole}
                onNavigate={onNavigate}
            />
        );
    }

    if (active === "Riwayat Biaya" || active === "Riwayat") {
        return (
            <ReimbursementPage
                API={API}
                initialTab="history"
                userRole={payrollRole}
                onNavigate={onNavigate}
            />
        );
    }

    if (active === "Slip Gaji") {
        return (
            <EmployeeFinancePortal
                API={API}
                defaultTab="payslips"
                employeeId="emp-1"
                onNavigate={onNavigate}
            />
        );
    }

    if (active === "Keuangan Saya") {
        return (
            <EmployeeFinancePortal
                API={API}
                defaultTab="overview"
                employeeId="emp-1"
                onNavigate={onNavigate}
            />
        );
    }

    if (active === "Laporan Keuangan" || active === "Laporan Penggajian") {
        return <PayrollReportsPage API={API} reportType="payroll" />;
    }

    if (active === "Laporan Gaji") {
        return <PayrollReportsPage API={API} reportType="salary" />;
    }

    if (active === "Laporan Pinjaman") {
        return <PayrollReportsPage API={API} reportType="loans" />;
    }

    if (active === "Laporan Kasbon") {
        return <PayrollReportsPage API={API} reportType="cash_advance" />;
    }

    if (active === "Laporan Biaya Penggajian") {
        return <PayrollReportsPage API={API} reportType="cost" />;
    }

    if (active === "Penyesuaian Gaji") {
        return <PayrollAdjustmentsPage API={API} userRole={payrollRole} />;
    }

    if (active === "Audit Log Penggajian") {
        return <PayrollAuditLogPage API={API} userRole={payrollRole} />;
    }

    // --- MODUL WORKSPACE EXISTING ---
    if (active === "Divisi") {
        return <DivisiPage API={API} />;
    }

    if (active === "Jabatan") {
        return <JabatanPage API={API} />;
    }

    if (active === "Bagian") {
        return <BagianPage API={API} />;
    }

    if (active === "Data Karyawan" || active === "Kelola Karyawan") {
        return <DataKaryawanPage API={API} />;
    }

    if (active === "Pengaturan Akun") {
        return (
            <section className="module-page">
                <div className="module-heading">
                    <div>
                        <div className="eyebrow blue">PREFERENSI</div>
                        <h1>Pengaturan Akun</h1>
                        <p>{info.subtitle}</p>
                    </div>
                </div>

                <section className="panel module-panel account-panel">
                    <div className="account-avatar">
                        <UserRound size={28} />
                    </div>
                    <h2>{profile?.full_name || "Pengguna"}</h2>
                    <p>{profile?.email || "Email tidak tersedia"}</p>

                    <div className="account-detail">
                        <span>Role akun</span>
                        <b>{formatRole(profile?.role || "employee")}</b>
                    </div>

                    <div className="account-detail">
                        <span>ID profil</span>
                        <b>{profile?.id || "—"}</b>
                    </div>
                </section>
            </section>
        );
    }

    if (active === "KPI" || active === "KPI Performance") {
        return (
            <section className="module-page">
                <div className="module-heading">
                    <div>
                        <div className="eyebrow blue">GROWTH & INSIGHT</div>
                        <h1>KPI</h1>
                        <p>{info.subtitle}</p>
                    </div>
                </div>

                <div className="metric-grid module-metrics">
                    <div className="metric-card">
                        <div className="metric-top">
                            <span>Periode penilaian</span>
                            <span className="metric-icon">
                                <CalendarDays size={18} />
                            </span>
                        </div>
                        <div className="metric-value">2026</div>
                        <div className="metric-bottom">
                            <small>Periode perlu dikonfigurasi</small>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-top">
                            <span>Histori evaluasi</span>
                            <span className="metric-icon">
                                <ChartNoAxesCombined size={18} />
                            </span>
                        </div>
                        <div className="metric-value">—</div>
                        <div className="metric-bottom">
                            <small>Menunggu data KPI</small>
                        </div>
                    </div>
                </div>

                <section className="panel module-panel">
                    <div className="panel-head">
                        <div>
                            <h2>Penilaian Performance</h2>
                            <p>
                                Area untuk target KPI, hasil evaluasi, dan histori penilaian.
                            </p>
                        </div>
                    </div>

                    <EmptyState
                        title="Belum ada data KPI"
                        description="Hubungkan modul ini dengan tabel KPI dan endpoint penilaian agar data aktual dapat ditampilkan."
                    />
                </section>
            </section>
        );
    }

    if (active === "Approval Center") {
        return (
            <section className="module-page">
                <div className="module-heading">
                    <div>
                        <div className="eyebrow blue">GROWTH & INSIGHT</div>
                        <h1>Approval Center</h1>
                        <p>{info.subtitle}</p>
                    </div>
                </div>

                <section className="panel module-panel">
                    <div className="panel-head">
                        <div>
                            <h2>Alur Persetujuan</h2>
                            <p>Ringkasan hierarki persetujuan yang direncanakan.</p>
                        </div>
                    </div>

                    <div className="approval-flow">
                        <div className="approval-flow-step">
                            <span>01</span>
                            <b>Karyawan</b>
                            <small>Mengajukan permintaan</small>
                        </div>
                        <ArrowRight size={18} />
                        <div className="approval-flow-step">
                            <span>02</span>
                            <b>Atasan</b>
                            <small>Meninjau pengajuan</small>
                        </div>
                        <ArrowRight size={18} />
                        <div className="approval-flow-step">
                            <span>03</span>
                            <b>HRD</b>
                            <small>Memproses hasil akhir</small>
                        </div>
                    </div>

                    <div className="approval-flow">
                        <div className="approval-flow-step">
                            <span>01</span>
                            <b>Atasan</b>
                            <small>Mengajukan permintaan</small>
                        </div>
                        <ArrowRight size={18} />
                        <div className="approval-flow-step">
                            <span>02</span>
                            <b>Direktur</b>
                            <small>Memberikan persetujuan</small>
                        </div>
                        <ArrowRight size={18} />
                        <div className="approval-flow-step">
                            <span>03</span>
                            <b>HRD</b>
                            <small>Memproses hasil akhir</small>
                        </div>
                    </div>

                    <EmptyState
                        title="Belum ada pengajuan aktual"
                        description="Daftar pengajuan dan tombol persetujuan perlu dihubungkan ke tabel request dan endpoint backend."
                    />
                </section>
            </section>
        );
    }

    return (
        <section className="module-page">
            <div className="module-heading">
                <div>
                    <div className="eyebrow blue">SMART HRM / WORKSPACE</div>
                    <h1>{active}</h1>
                    <p>{info.subtitle}</p>
                </div>
            </div>

            <section className="panel module-panel">
                <div className="panel-head">
                    <div>
                        <h2>{active}</h2>
                        <p>Area kerja untuk modul {active.toLowerCase()}.</p>
                    </div>
                    <span className="type-tag">Modul</span>
                </div>

                <EmptyState
                    title={`Halaman ${active}`}
                    description="Halaman ini sudah terhubung ke navigasi. Untuk menampilkan data aktual, sambungkan ke tabel Supabase dan endpoint backend modul ini."
                />
            </section>
        </section>
    );
}

function SmartHrmLogo({ size = 30, className = "" }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 42 41"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`smart-hrm-logo ${className}`}
        >
            <path
                d="M14 4H38V14H24L14 25L4 15L14 4Z"
                fill="white"
            />
            <path
                d="M28 37H4V27H18L28 16L38 26L28 37Z"
                fill="white"
            />
        </svg>
    );
}

export default function App() {
    const [mode, setMode] = useState("login");
    const [role, setRole] = useState("manager");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [active, setActive] = useState("Dashboard");
    const [busy, setBusy] = useState(false);
    const [notice, setNotice] = useState("");
    const [collapsed, setCollapsed] = useState(false);
    const [openMenus, setOpenMenus] = useState({});
    const [payrollRole, setPayrollRole] = useState("admin");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem("smart-hrm-theme");
        if (saved === "dark" || saved === "light") return saved;
        return "dark"; // Default to premium dark glassmorphism
    });

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("smart-hrm-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    };

    const [employees, setEmployees] = useState([]);
    const [employeeLoading, setEmployeeLoading] = useState(false);
    const [employeeError, setEmployeeError] = useState("");

    const [demo, setDemo] = useState({
        company_name: "",
        industry: "",
        pic_name: "",
        phone: "",
        email: "",
        message: "",
    });

    useEffect(() => {
        if (!supabase) return;

        supabase.auth.getSession().then(({ data }) => {
            if (data.session) {
                setSession(data.session);
                loadProfile(data.session);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);

            if (!nextSession) {
                setProfile(null);
                setEmployees([]);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function loadProfile(currentSession) {
        try {
            const response = await fetch(`${API}/api/me`, {
                headers: {
                    Authorization: `Bearer ${currentSession.access_token}`,
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Gagal memuat profil.");
            }

            setProfile(result.profile || null);
        } catch (error) {
            setNotice(
                `Login berhasil, tetapi profil belum dapat dimuat: ${error.message}`
            );
        }
    }

    async function login(event) {
        event.preventDefault();

        if (!supabase) {
            setNotice(
                "Konfigurasi Supabase belum tersedia. Periksa file .env."
            );
            return;
        }

        setBusy(true);
        setNotice("");

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            setSession(data.session);
            await loadProfile(data.session);
            setActive("Dashboard");
        } catch (error) {
            setNotice(error.message || "Login gagal.");
        } finally {
            setBusy(false);
        }
    }

    async function submitDemo(event) {
        event.preventDefault();
        setBusy(true);
        setNotice("");

        try {
            const response = await fetch(`${API}/api/demo-requests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(demo),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Permintaan demo gagal dikirim.");
            }

            setNotice(
                "Terima kasih! Tim kami akan menghubungi Anda untuk menjadwalkan demo."
            );
        } catch (error) {
            setNotice(error.message);
        } finally {
            setBusy(false);
        }
    }

    async function logout() {
        if (supabase) {
            await supabase.auth.signOut();
        }

        setSession(null);
        setProfile(null);
        setEmployees([]);
        setActive("Dashboard");
    }

    async function loadEmployees() {
        if (!supabase) {
            setEmployeeError("Konfigurasi Supabase belum tersedia.");
            return;
        }

        setEmployeeLoading(true);
        setEmployeeError("");

        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, full_name, email, role")
                .order("full_name", { ascending: true });

            if (error) throw error;

            setEmployees(data || []);
        } catch (error) {
            setEmployeeError(error.message || "Gagal memuat data karyawan.");
        } finally {
            setEmployeeLoading(false);
        }
    }

    useEffect(() => {
        if (session && active === "Kelola Karyawan") {
            loadEmployees();
        }
    }, [session, active]);

    const greeting = profile?.full_name || email;

    if (mode === "register") {
        return (
            <main className="prospect">
                <section className="prospect-card">
                    <div className="brand">
                        <span className="brand-symbol">
                            <Building2 size={20} />
                        </span>
                        SMART HRM
                    </div>

                    <span className="eyebrow">SMARTER PEOPLE OPERATIONS</span>
                    <h1>
                        Let's make work
                        <br />
                        <span>work better.</span>
                    </h1>

                    <p>
                        Jadwalkan sesi demo bersama tim PT Proven Force Indonesia.
                        Ceritakan kebutuhan perusahaan Anda, kami akan menghubungi PIC.
                    </p>

                    <form onSubmit={submitDemo} className="form-grid">
                        {[
                            ["company_name", "Nama perusahaan", "text"],
                            ["industry", "Industri", "text"],
                            ["pic_name", "Nama PIC", "text"],
                            ["phone", "Nomor yang bisa dihubungi", "tel"],
                            ["email", "Email perusahaan", "email"],
                        ].map(([key, label, type]) => (
                            <label key={key}>
                                {label}
                                <input
                                    required
                                    type={type}
                                    value={demo[key]}
                                    onChange={(event) =>
                                        setDemo({ ...demo, [key]: event.target.value })
                                    }
                                    placeholder={label}
                                />
                            </label>
                        ))}

                        <label className="wide">
                            Pesan / kebutuhan perusahaan
                            <textarea
                                required
                                rows="4"
                                value={demo.message}
                                onChange={(event) =>
                                    setDemo({ ...demo, message: event.target.value })
                                }
                                placeholder="Ceritakan kebutuhan tim Anda…"
                            />
                        </label>

                        <button className="primary wide" disabled={busy}>
                            {busy ? "Mengirim…" : "Kirim permintaan demo"}
                            <ArrowRight size={17} />
                        </button>
                    </form>

                    {notice && <p className="notice">{notice}</p>}

                    <button
                        className="link"
                        onClick={() => {
                            setMode("login");
                            setNotice("");
                        }}
                    >
                        ← Kembali ke login
                    </button>

                    <div className="legal">
                        Dengan mengirim formulir, Anda menyetujui untuk dihubungi tim kami.
                    </div>
                </section>

                <aside className="prospect-aside">
                    <div className="aside-top">
                        <div className="brand light">
                            <span className="brand-symbol">
                                <Building2 size={20} />
                            </span>
                            SMART HRM
                        </div>
                        <span className="status-dot">● Product demo</span>
                    </div>

                    <div className="prospect-message">
                        <span className="eyebrow">ONE CONNECTED WORKSPACE</span>
                        <h2>
                            People first.
                            <br />
                            Performance
                            <br />
                            <em>forward.</em>
                        </h2>
                        <p>
                            Lebih dari administrasi. Bangun pengalaman kerja yang rapi,
                            transparan, dan terhubung.
                        </p>
                    </div>

                    <div className="feature-stack">
                        <div>
                            <span>01</span>
                            <b>People operations</b>
                            <small>Data karyawan terpusat</small>
                        </div>
                        <div>
                            <span>02</span>
                            <b>Approval workflows</b>
                            <small>Alur persetujuan terstruktur</small>
                        </div>
                        <div>
                            <span>03</span>
                            <b>Performance insights</b>
                            <small>Tujuan dan progres terukur</small>
                        </div>
                    </div>

                    <div className="aside-footer">
                        PT PROVEN FORCE INDONESIA <span>© 2026</span>
                    </div>
                </aside>
            </main>
        );
    }

    if (!session) {
        return (
            <main className={`login-shell ${theme}-mode`}>
                <section className="login-card">
                    <div className="login-card-header">
                        <div className="brand">
                            <span className="brand-symbol">
                                <Building2 size={20} />
                            </span>
                            SMART HRM
                        </div>
                    </div>

                    <div className="login-intro">
                        <span className="eyebrow">WELCOME BACK</span>
                        <h1>Good to see you.</h1>
                        <p>Masuk untuk melanjutkan ke workspace perusahaan.</p>
                    </div>

                    <div className="role-switch">
                        <button
                            className={role === "manager" ? "chosen" : ""}
                            onClick={() => setRole("manager")}
                        >
                            <BriefcaseBusiness size={16} />
                            Manajemen
                        </button>
                        <button
                            className={role === "employee" ? "chosen" : ""}
                            onClick={() => setRole("employee")}
                        >
                            <Users size={16} />
                            Karyawan
                        </button>
                    </div>

                    <form onSubmit={login}>
                        <label>
                            Email address
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="nama@perusahaan.com"
                            />
                        </label>

                        <label>
                            Password
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Masukkan password"
                            />
                        </label>

                        <div className="remember">
                            <label>
                                <input type="checkbox" />
                                Ingat saya
                            </label>
                            <button
                                type="button"
                                className="link"
                                onClick={() =>
                                    setNotice(
                                        "Gunakan fitur reset password Supabase atau hubungi administrator perusahaan."
                                    )
                                }
                            >
                                Lupa password?
                            </button>
                        </div>

                        <button className="primary" disabled={busy}>
                            {busy ? "Memproses…" : "Masuk ke workspace"}
                            <ArrowRight size={17} />
                        </button>
                    </form>

                    {notice && <p className="notice">{notice}</p>}

                    <div className="login-foot">
                        <div className="secure">
                            <ShieldCheck size={14} />
                            Secure company access
                        </div>
                        <div>
                            Perusahaan ingin mencoba?{" "}
                            <button
                                className="link"
                                onClick={() => {
                                    setMode("register");
                                    setNotice("");
                                }}
                            >
                                Minta demo
                            </button>
                        </div>
                    </div>
                </section>

                <section className="login-visual">
                    <div className="visual-top">
                        <div className="brand light">
                            <span className="brand-symbol">
                                <Building2 size={20} />
                            </span>
                            SMART HRM
                        </div>
                        <span className="visual-tag">
                            PEOPLE • PROCESS • PERFORMANCE
                        </span>
                    </div>

                    <div className="visual-copy">
                        <span className="eyebrow">THE WORKPLACE, IN SYNC</span>
                        <h2>
                            Make room for
                            <br />
                            <em>great work.</em>
                        </h2>
                        <p>
                            One connected space for people, performance, and everything
                            in between.
                        </p>
                        <div className="visual-pills">
                            <span>
                                <CheckCircle2 size={14} /> People-first
                            </span>
                            <span>
                                <CheckCircle2 size={14} /> Insight-led
                            </span>
                            <span>
                                <CheckCircle2 size={14} /> Connected
                            </span>
                        </div>
                    </div>

                    <div className="visual-bottom">
                        <span>PT PROVEN FORCE INDONESIA</span>
                        <span>SMART HRM / 01</span>
                    </div>

                    <div className="visual-art">
                        <div className="art-window">
                            <div className="art-head">
                                <i />
                                <i />
                                <i />
                            </div>
                            <div className="art-lines">
                                <b />
                                <b />
                                <b />
                            </div>
                            <div className="art-chart">
                                <span />
                                <span />
                                <span />
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>
                        </div>
                        <div className="art-badge">
                            <CheckCircle2 size={17} />
                            All systems connected
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <div className={`app ${theme}-mode`}>
            <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
                <div className="side-brand">
                    <SmartHrmLogo size={collapsed ? 34 : 28} />
                    {!collapsed && <b>Smart HRM</b>}
                </div>

                {!collapsed && (
                    <div className="org-switch">
                        <div className="org-icon">PF</div>
                        <div>
                            <b>Proven Force</b>
                            <small>Enterprise workspace</small>
                        </div>
                        <ChevronDown size={15} />
                    </div>
                )}

                <nav>
                    {nav.map((group) => (
                        <div className="nav-group" key={group.title}>
                            {!collapsed && group.title && (
                                <div className="nav-title">{group.title}</div>
                            )}

                            {group.items.map((item) => {
                                const name = item.name;
                                const Icon = item.icon;
                                const hasChildren = item.children && item.children.length > 0;
                                const isOpen = !!openMenus[name];
                                const isChildActive = hasChildren && item.children.some((c) => c.name === active);
                                const isParentActive = active === name || isChildActive;

                                if (hasChildren && !collapsed) {
                                    return (
                                        <div className="nav-item-accordion" key={name}>
                                            <button
                                                type="button"
                                                className={`nav-parent-btn ${isParentActive ? "active" : ""}`}
                                                onClick={() => {
                                                    setOpenMenus((prev) => ({
                                                        ...prev,
                                                        [name]: !prev[name],
                                                    }));
                                                }}
                                            >
                                                <Icon size={17} />
                                                <span>{name}</span>
                                                <ChevronDown
                                                    size={14}
                                                    className={`nav-chevron ${isOpen ? "open" : ""}`}
                                                />
                                            </button>

                                            {isOpen && (
                                                <div className="nav-sublist">
                                                    {item.children.map((child) => (
                                                        <button
                                                            key={child.name}
                                                            type="button"
                                                            className={`nav-subitem ${active === child.name ? "active" : ""}`}
                                                            onClick={() => setActive(child.name)}
                                                        >
                                                            <span>{child.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }

                                return (
                                    <button
                                        title={collapsed ? name : undefined}
                                        key={name}
                                        className={active === name ? "nav-active" : ""}
                                        onClick={() => {
                                            if (hasChildren) {
                                                setOpenMenus((prev) => ({ ...prev, [name]: true }));
                                                setActive(item.children[0].name);
                                            } else {
                                                setActive(name);
                                            }
                                        }}
                                    >
                                        <Icon size={17} />
                                        {!collapsed && (
                                            <>
                                                <span>{name}</span>
                                                {name === "Approval Center" && (
                                                    <i className="nav-count">4</i>
                                                )}
                                            </>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    {!collapsed && (
                        <div className="help-card">
                            <div className="help-icon">✦</div>
                            <b>Butuh bantuan?</b>
                            <p>Tim support kami siap membantu.</p>
                            <button onClick={() => setMode("register")}>
                                Hubungi support <ArrowUpRight size={14} />
                            </button>
                        </div>
                    )}

                    <button className="profile-row" onClick={logout}>
                        <div className="avatar">{getInitial(greeting)}</div>
                        {!collapsed && (
                            <>
                                <div className="profile-text">
                                    <b>{greeting}</b>
                                    <small>{formatRole(profile?.role || role)}</small>
                                </div>
                                <LogOut size={16} />
                            </>
                        )}
                    </button>
                </div>
            </aside>

            <main className="workspace">
                <div className="ambient-background" aria-hidden="true">
                    <div className="ambient-orb ambient-orb-1" />
                    <div className="ambient-orb ambient-orb-2" />
                    <div className="ambient-orb ambient-orb-3" />
                </div>

                <header>
                    <div className="head-left">
                        <button
                            type="button"
                            className="sidebar-toggle-btn"
                            onClick={() => setCollapsed(!collapsed)}
                            title={collapsed ? "Buka menu" : "Tutup menu"}
                            aria-label="Toggle menu"
                        >
                            {collapsed ? (
                                <ArrowRight size={22} className="toggle-icon-arrow" strokeWidth={2.6} />
                            ) : (
                                <span className="toggle-icon-hamburger">
                                    <span />
                                    <span />
                                    <span />
                                </span>
                            )}
                        </button>

                        <div className="header-company-badge">
                            <Building2 size={20} className="company-badge-icon" />
                            <span className="company-badge-name">
                                {profile?.company_name || "PT Yupi Indo"}
                            </span>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button
                            className="searchbox"
                            onClick={() => setActive("Kelola Karyawan")}
                        >
                            <Search size={16} />
                            <span>Search anything...</span>
                            <kbd>⌘ K</kbd>
                        </button>

                        <div className="header-role-simulator" title="Simulasi Hak Akses Penggajian & Keuangan (Section 2)">
                            <ShieldCheck size={14} className="role-sim-icon" />
                            <span className="role-sim-label">Peran:</span>
                            <select
                                value={payrollRole}
                                onChange={(e) => setPayrollRole(e.target.value)}
                                className="role-sim-select"
                            >
                                <option value="admin">Administrator (Penuh)</option>
                                <option value="hr">HR / HRD</option>
                                <option value="finance">Finance</option>
                                <option value="manager">Manager / Atasan</option>
                                <option value="karyawan">Karyawan (Pribadi)</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            className="icon-button theme-toggle-btn"
                            onClick={toggleTheme}
                            title={theme === "dark" ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
                            aria-label="Toggle theme"
                        >
                            {theme === "dark" ? (
                                <Sun size={17} className="theme-toggle-icon sun" />
                            ) : (
                                <Moon size={17} className="theme-toggle-icon moon" />
                            )}
                        </button>

                        <button
                            className="icon-button notification"
                            onClick={() => setActive("Approval Center")}
                            title="Lihat approval"
                        >
                            <Bell size={18} />
                            <i />
                        </button>

                        <div className="head-divider" />

                        <div className="header-user-wrapper">
                            <button
                                type="button"
                                className={`header-user ${showUserMenu ? "open" : ""}`}
                                onClick={() => setShowUserMenu((prev) => !prev)}
                                aria-label="Menu profil"
                            >
                                <div className="avatar">{getInitial(greeting)}</div>
                                <div>
                                    <b>{greeting}</b>
                                    <small>{formatRole(profile?.role || role)}</small>
                                </div>
                                <ChevronDown size={14} />
                            </button>

                            {showUserMenu && (
                                <>
                                    <div
                                        className="dropdown-backdrop"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div className="user-dropdown-menu">
                                        <div className="user-dropdown-header">
                                            <div className="avatar">{getInitial(greeting)}</div>
                                            <div>
                                                <b>{greeting}</b>
                                                <small>{profile?.email || email || formatRole(profile?.role || role)}</small>
                                            </div>
                                        </div>
                                        <div className="user-dropdown-divider" />
                                        <button
                                            type="button"
                                            className="user-dropdown-item"
                                            onClick={toggleTheme}
                                        >
                                            {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                                            <span>Mode: {theme === "dark" ? "Gelap (Dark)" : "Terang (Light)"}</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="user-dropdown-item"
                                            onClick={() => {
                                                setActive("Pengaturan Akun");
                                                setShowUserMenu(false);
                                            }}
                                        >
                                            <Settings size={15} />
                                            <span>Pengaturan Akun</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="user-dropdown-item danger"
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                logout();
                                            }}
                                        >
                                            <LogOut size={15} />
                                            <span>Keluar (Log Out)</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                <div className="content">
                    <div className="content-breadcrumb">
                        <span className="cb-home">Home</span>
                        <span className="cb-sep">/</span>
                        <span className="cb-current">{active}</span>
                    </div>

                    {active === "Dashboard" ? (
                        <>
                            <div className="welcome-row">
                                <div>
                                    <h1 className="welcome-greeting-title">
                                        <span className="welcome-tag">Selamat Siang,</span> {greeting.split("@")[0] || "Super Admin"}
                                    </h1>
                                    <p className="welcome-subtitle">
                                        Selamat Beraktivitas. {new Date().toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>

                                <div className="welcome-actions">
                                    <button className="secondary">
                                        <CalendarDays size={16} />
                                        This month
                                        <ChevronDown size={14} />
                                    </button>

                                    <button
                                        className="primary compact"
                                        onClick={() => setActive("Kelola Karyawan")}
                                    >
                                        <Plus size={16} />
                                        Add employee
                                    </button>
                                </div>
                            </div>

                            <div className="announcement">
                                <div className="announce-icon">
                                    <Command size={17} />
                                </div>
                                <div>
                                    <b>Your workspace is ready to go</b>
                                    <p>
                                        Explore your HR tools, set up approval flows, and bring
                                        your team together.
                                    </p>
                                </div>
                                <button onClick={() => setActive("Pengaturan Akun")}>
                                    Explore workspace <ArrowRight size={15} />
                                </button>
                                <button
                                    className="dismiss"
                                    aria-label="Dismiss"
                                    onClick={(event) =>
                                        event.currentTarget.parentElement.remove()
                                    }
                                >
                                    ×
                                </button>
                            </div>

                            <div className="section-title">
                                <div>
                                    <h2>Today at a glance</h2>
                                    <p>Key metrics across your organization</p>
                                </div>
                                <button
                                    className="text-action"
                                    onClick={() => setActive("Laporan")}
                                >
                                    View reports <ArrowUpRight size={15} />
                                </button>
                            </div>

                            <div className="metric-grid">
                                {[
                                    {
                                        label: "Total employees",
                                        value: "128",
                                        change: "+8.2%",
                                        note: "vs. last month",
                                        icon: Users,
                                        trend: [25, 40, 30, 56, 42, 65, 58, 76],
                                    },
                                    {
                                        label: "Present today",
                                        value: "114",
                                        change: "89.1%",
                                        note: "of total employees",
                                        icon: CalendarCheck,
                                        trend: [55, 45, 63, 57, 70, 62, 82, 76],
                                    },
                                    {
                                        label: "Pending approvals",
                                        value: "08",
                                        change: "4 urgent",
                                        note: "need your attention",
                                        icon: ClipboardList,
                                        trend: [25, 48, 38, 65, 45, 72, 60, 55],
                                    },
                                    {
                                        label: "KPI completion",
                                        value: "76%",
                                        change: "+12.4%",
                                        note: "this quarter",
                                        icon: ChartNoAxesCombined,
                                        trend: [30, 35, 42, 38, 57, 53, 70, 82],
                                    },
                                ].map((metric, index) => {
                                    const MetricIcon = metric.icon;

                                    return (
                                        <div className="metric-card" key={metric.label}>
                                            <div className="metric-top">
                                                <span>{metric.label}</span>
                                                <span className="metric-icon">
                                                    <MetricIcon size={18} />
                                                </span>
                                            </div>

                                            <div className="metric-value">{metric.value}</div>

                                            <div className="metric-bottom">
                                                <span className={index === 2 ? "orange" : "green"}>
                                                    {index !== 2 && <ArrowUpRight size={13} />}
                                                    {metric.change}
                                                </span>
                                                <small>{metric.note}</small>
                                            </div>

                                            <div className="sparkline">
                                                {metric.trend.map((value, trendIndex) => (
                                                    <i
                                                        key={trendIndex}
                                                        style={{ height: `${value}%` }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="main-grid">
                                <section className="panel attendance-panel">
                                    <div className="panel-head">
                                        <div>
                                            <h2>Attendance overview</h2>
                                            <p>Daily team check-in activity</p>
                                        </div>
                                        <button className="more-button">
                                            <MoreHorizontal size={19} />
                                        </button>
                                    </div>

                                    <div className="attendance-summary">
                                        <div>
                                            <span className="summary-dot green-dot" />
                                            Present <b>114</b>
                                        </div>
                                        <div>
                                            <span className="summary-dot orange-dot" />
                                            Late <b>07</b>
                                        </div>
                                        <div>
                                            <span className="summary-dot gray-dot" />
                                            Absent <b>07</b>
                                        </div>
                                    </div>

                                    <div className="attendance-chart">
                                        <div className="chart-y">
                                            <span>150</span>
                                            <span>100</span>
                                            <span>50</span>
                                            <span>0</span>
                                        </div>

                                        <div className="chart-area">
                                            <div className="chart-gridlines">
                                                <i />
                                                <i />
                                                <i />
                                                <i />
                                            </div>

                                            <div className="bars">
                                                {[58, 72, 65, 85, 76, 93, 68, 88, 80, 97, 75, 86].map(
                                                    (height, index) => (
                                                        <div className="bar-group" key={index}>
                                                            <i style={{ height: `${height}%` }} />
                                                            <i
                                                                style={{
                                                                    height: `${(100 - height) * 0.25}%`,
                                                                }}
                                                            />
                                                            <i
                                                                style={{
                                                                    height: `${(100 - height) * 0.15}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    )
                                                )}
                                            </div>

                                            <div className="chart-x">
                                                {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00"].map(
                                                    (time) => (
                                                        <span key={time}>{time}</span>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="panel-foot">
                                        <span>
                                            <i className="live-dot" /> Sample dashboard data
                                        </span>
                                        <button onClick={() => setActive("Kehadiran")}>
                                            View attendance <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </section>

                                <section className="panel approvals-panel">
                                    <div className="panel-head">
                                        <div>
                                            <h2>Approval center</h2>
                                            <p>Requests waiting for your review</p>
                                        </div>
                                        <span className="count-badge">04</span>
                                    </div>

                                    <div className="approval-list">
                                        {[
                                            {
                                                title: "Leave request",
                                                person: "Nadia Putri",
                                                detail: "2 days · Sep 24–25",
                                                initial: "NP",
                                                color: "lavender",
                                                tag: "Leave",
                                            },
                                            {
                                                title: "Purchase request",
                                                person: "Rizky Pratama",
                                                detail: "Office equipment",
                                                initial: "RP",
                                                color: "mint",
                                                tag: "Purchase",
                                            },
                                            {
                                                title: "Overtime request",
                                                person: "Aditya Saputra",
                                                detail: "3 hours · Today",
                                                initial: "AS",
                                                color: "peach",
                                                tag: "Overtime",
                                            },
                                        ].map((item) => (
                                            <div className="approval-item" key={item.title}>
                                                <div className={`mini-avatar ${item.color}`}>
                                                    {item.initial}
                                                </div>
                                                <div className="approval-info">
                                                    <b>{item.title}</b>
                                                    <span>
                                                        {item.person} <i>·</i> {item.detail}
                                                    </span>
                                                </div>
                                                <span className="type-tag">{item.tag}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button
                                        className="panel-link"
                                        onClick={() => setActive("Approval Center")}
                                    >
                                        Review all requests <ArrowRight size={15} />
                                    </button>
                                </section>
                            </div>

                            <section className="panel team-panel">
                                <div className="panel-head">
                                    <div>
                                        <h2>Team attendance</h2>
                                        <p>Who's in and how the day is starting</p>
                                    </div>

                                    <div className="table-actions">
                                        <button className="secondary">
                                            <CalendarDays size={15} /> Today
                                            <ChevronDown size={13} />
                                        </button>
                                        <button className="secondary">
                                            <Download size={15} /> Export
                                        </button>
                                        <button className="more-button">
                                            <MoreHorizontal size={19} />
                                        </button>
                                    </div>
                                </div>

                                <div className="table-wrap">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>EMPLOYEE</th>
                                                <th>DEPARTMENT</th>
                                                <th>CHECK-IN</th>
                                                <th>STATUS</th>
                                                <th />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {demoRows.map((row) => (
                                                <tr key={row.name}>
                                                    <td>
                                                        <div className="employee-cell">
                                                            <div className={`mini-avatar ${row.color}`}>
                                                                {row.initial}
                                                            </div>
                                                            <b>{row.name}</b>
                                                        </div>
                                                    </td>
                                                    <td>{row.dept}</td>
                                                    <td className="time-cell">{row.time}</td>
                                                    <td>
                                                        <span
                                                            className={`status ${row.status === "Hadir"
                                                                ? "present"
                                                                : row.status === "Terlambat"
                                                                    ? "late"
                                                                    : "leave"
                                                                }`}
                                                        >
                                                            {row.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <button className="more-button">
                                                            <MoreHorizontal size={17} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="table-footer">
                                    <span>
                                        Showing <b>4</b> sample rows
                                    </span>
                                    <button
                                        className="text-action"
                                        onClick={() => setActive("Kehadiran")}
                                    >
                                        View attendance <ArrowRight size={14} />
                                    </button>
                                </div>
                            </section>

                            <div className="bottom-note">
                                <span>
                                    SMART HRM <i>•</i> Built for better work
                                </span>
                                <span>
                                    <i className="live-dot" /> Workspace aktif
                                </span>
                            </div>
                        </>
                    ) : (
                        <ModulePage
                            active={active}
                            profile={profile}
                            employees={employees}
                            employeeLoading={employeeLoading}
                            employeeError={employeeError}
                            onRefreshEmployees={loadEmployees}
                            onNavigate={setActive}
                            payrollRole={payrollRole}
                            setPayrollRole={setPayrollRole}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}