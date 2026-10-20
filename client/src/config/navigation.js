
import {
    LayoutDashboard,
    Users,
    CalendarCheck,
    MapPin,
    CalendarDays,
    FileText,
    Clock3,
    Wallet,
    CreditCard,
    Receipt,
    BriefcaseBusiness,
    AlertCircle,
    ShoppingCart,
    ChartNoAxesCombined,
    Settings,
    ShieldCheck,
    FolderOpen,
} from "lucide-react";

const submenu = (...names) => names.map((name) => ({ name }));

const menus = {
    dashboard: {
        name: "Dashboard",
        icon: LayoutDashboard,
    },

    employees: {
        name: "Kelola Karyawan",
        icon: Users,
        children: submenu(
            "Divisi",
            "Jabatan",
            "Bagian",
            "Data Karyawan"
        ),
    },

    attendance: {
        name: "Kehadiran",
        icon: CalendarCheck,
    },

    attendanceRequest: {
        name: "Request Absen",
        icon: MapPin,
    },

    leave: {
        name: "Cuti",
        icon: CalendarDays,
        children: submenu("Pengajuan Cuti", "Riwayat Cuti"),
    },

    permission: {
        name: "Izin",
        icon: FileText,
        children: submenu("Pengajuan Izin", "Riwayat Izin"),
    },

    overtime: {
        name: "Lembur",
        icon: Clock3,
        children: submenu("Pengajuan Lembur", "Riwayat Lembur"),
    },

    payroll: {
        name: "Penggajian",
        icon: Wallet,
        children: submenu(
            "Dashboard Penggajian",
            "Periode Penggajian",
            "Proses Penggajian",
            "Persetujuan Penggajian",
            "Riwayat Penggajian",
            "Struktur Gaji",
            "Komponen Gaji",
            "Aturan Penggajian",
            "Slip Gaji",
            "Pengajuan Kasbon",
            "Kasbon Aktif",
            "Riwayat Kasbon",
            "Laporan Penggajian",
            "Laporan Gaji",
            "Laporan Pinjaman",
            "Laporan Kasbon",
            "Laporan Biaya Penggajian",
            "Penyesuaian Gaji",
            "Audit Log Penggajian"
        ),
    },

    payslip: {
        name: "Slip Gaji",
        icon: FileText,
    },

    shift: {
        name: "Jadwal Shift",
        icon: CalendarDays,
        children: submenu(
            "Shift",
            "Grup",
            "Atur Shift",
            "Rekap Jadwal"
        ),
    },

    loan: {
        name: "Pinjaman",
        icon: CreditCard,
    },

    reimbursement: {
        name: "Reimbursement",
        icon: Receipt,
    },

    contract: {
        name: "Kontrak Kerja",
        icon: BriefcaseBusiness,
    },

    employmentCertificate: {
        name: "Paklaring",
        icon: FileText,
    },

    warningLetter: {
        name: "Surat Peringatan",
        icon: AlertCircle,
    },

    resignation: {
        name: "Surat Pengunduran Diri",
        icon: FileText,
    },

    workCertificate: {
        name: "Surat Keterangan Bekerja",
        icon: FileText,
    },

    offerLetter: {
        name: "Surat Penawaran Kerja",
        icon: FileText,
    },

    purchaseOrder: {
        name: "PO",
        icon: ShoppingCart,
    },

    kpi: {
        name: "KPI",
        icon: ChartNoAxesCombined,
    },

    account: {
        name: "Pengaturan Akun",
        icon: Settings,
    },

    documents: {
        name: "Dokumen Saya",
        icon: FolderOpen,
        children: submenu(
            "Kontrak Kerja",
            "Paklaring",
            "Surat Peringatan",
            "Surat Pengunduran Diri",
            "Surat Keterangan Bekerja",
            "Surat Penawaran Kerja"
        ),
    },

    approvals: {
        name: "Approval Center",
        icon: ShieldCheck,
    },
};

const personalMenuKeys = [
    "dashboard",
    "attendance",
    "attendanceRequest",
    "leave",
    "permission",
    "overtime",
    "payslip",
    "shift",
    "loan",
    "reimbursement",
    "kpi",
    "documents",
    "account",
];

const hrdMenuKeys = [
    "dashboard",
    "employees",
    "attendance",
    "attendanceRequest",
    "leave",
    "permission",
    "overtime",
    "payroll",
    "shift",
    "loan",
    "reimbursement",
    "contract",
    "employmentCertificate",
    "warningLetter",
    "resignation",
    "workCertificate",
    "offerLetter",
    "purchaseOrder",
    "kpi",
    "account",
];

function buildGroup(title, keys) {
    return {
        title,
        items: keys.map((key) => ({
            ...menus[key],
            ...(menus[key].children
                ? {
                    children: menus[key].children.map(
                        (child) => ({ ...child })
                    ),
                }
                : {}),
        })),
    };
}

function personalGroups() {
    return [buildGroup("MENU SAYA", personalMenuKeys)];
}

export function getNavigation(role) {
    switch (role) {
        case "employee":
            return personalGroups();

        case "manager":
            return [
                ...personalGroups(),
                buildGroup("PERSETUJUAN TIM", ["approvals"]),
            ];

        case "hrd":
            return [
                buildGroup("", hrdMenuKeys),
            ];

        case "director":
            return [
                ...personalGroups(),
                buildGroup("PERSETUJUAN DIREKTUR", ["approvals"]),
            ];

        case "finance":
            return [
                ...personalGroups(),
                {
                    title: "KEUANGAN",
                    items: [
                        {
                            name: "Penggajian",
                            icon: Wallet,
                            children: submenu(
                                "Dashboard Penggajian",
                                "Persetujuan Penggajian",
                                "Riwayat Penggajian",
                                "Laporan Penggajian",
                                "Laporan Pinjaman",
                                "Laporan Kasbon",
                                "Laporan Biaya Penggajian",
                                "Audit Log Penggajian"
                            ),
                        },
                    ],
                },
            ];

        default:
            return [];
    }
}

export default getNavigation;
