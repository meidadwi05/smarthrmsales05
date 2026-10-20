/**
 * SMART HRM - Modul Penggajian & Keuangan Karyawan
 * State Store & Engine Perhitungan Penggajian Terpadu
 */

// Format Rupiah Helper
export function formatRupiah(amount) {
  const num = Number(amount) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

// Terbilang Bahasa Indonesia
export function terbilang(n) {
  n = Math.floor(Math.abs(Number(n) || 0));
  if (n === 0) return 'Nol Rupiah';
  const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];

  function convert(x) {
    if (x < 12) return satuan[x];
    if (x < 20) return convert(x - 10) + ' Belas';
    if (x < 100) return convert(Math.floor(x / 10)) + ' Puluh' + (x % 10 !== 0 ? ' ' + satuan[x % 10] : '');
    if (x < 200) return 'Seratus' + (x - 100 !== 0 ? ' ' + convert(x - 100) : '');
    if (x < 1000) return convert(Math.floor(x / 100)) + ' Ratus' + (x % 100 !== 0 ? ' ' + convert(x % 100) : '');
    if (x < 2000) return 'Seribu' + (x - 1000 !== 0 ? ' ' + convert(x - 1000) : '');
    if (x < 1000000) return convert(Math.floor(x / 1000)) + ' Ribu' + (x % 1000 !== 0 ? ' ' + convert(x % 1000) : '');
    if (x < 1000000000) return convert(Math.floor(x / 1000000)) + ' Juta' + (x % 1000000 !== 0 ? ' ' + convert(x % 1000000) : '');
    if (x < 1000000000000) return convert(Math.floor(x / 1000000000)) + ' Miliar' + (x % 1000000000 !== 0 ? ' ' + convert(x % 1000000000) : '');
    return convert(Math.floor(x / 1000000000000)) + ' Triliun' + (x % 1000000000000 !== 0 ? ' ' + convert(x % 1000000000000) : '');
  }

  return convert(n).trim() + ' Rupiah';
}

// 20+ Realistis Karyawan Tersebar di HR, Finance, IT, Operasional, Sales
export let payrollEmployees = [
  {
    id: 'emp-1',
    code: 'EMP-00123',
    name: 'Budi Santoso',
    role: 'employee',
    department: 'Operasional',
    division: 'Operasional',
    position: 'Supervisor Operasional',
    status: 'Tetap',
    joinDate: '2020-04-15',
    bankName: 'BCA',
    accountNumber: '8830129482',
    accountHolder: 'Budi Santoso',
    basicSalary: 6000000,
    structureId: 'str-1',
    workDays: 22,
    presentDays: 21,
    leaveDays: 1,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 12
  },
  {
    id: 'emp-2',
    code: 'EMP-00101',
    name: 'Andi Prasetyo',
    role: 'employee',
    department: 'IT Support',
    division: 'IT',
    position: 'Lead Software Engineer',
    status: 'Tetap',
    joinDate: '2019-03-10',
    bankName: 'Mandiri',
    accountNumber: '1370019284721',
    accountHolder: 'Andi Prasetyo',
    basicSalary: 11000000,
    structureId: 'str-1',
    workDays: 22,
    presentDays: 22,
    leaveDays: 0,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 8
  },
  {
    id: 'emp-3',
    code: 'EMP-00102',
    name: 'Cindy Putri',
    role: 'employee',
    department: 'Marketing',
    division: 'Marketing',
    position: 'Account Executive',
    status: 'Kontrak',
    joinDate: '2023-06-01',
    bankName: 'BCA',
    accountNumber: '5271829401',
    accountHolder: 'Cindy Putri',
    basicSalary: 5200000,
    structureId: 'str-2',
    workDays: 22,
    presentDays: 20,
    leaveDays: 2,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 4
  },
  {
    id: 'emp-4',
    code: 'EMP-00103',
    name: 'Dewi Lestari',
    role: 'employee',
    department: 'Divisi Keuangan',
    division: 'Finance',
    position: 'Senior Accountant',
    status: 'Tetap',
    joinDate: '2021-01-10',
    bankName: 'BRI',
    accountNumber: '020601002948501',
    accountHolder: 'Dewi Lestari',
    basicSalary: 7500000,
    structureId: 'str-1',
    workDays: 22,
    presentDays: 22,
    leaveDays: 0,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 6
  },
  {
    id: 'emp-5',
    code: 'EMP-00104',
    name: 'Eko Prasetyo',
    role: 'employee',
    department: 'System Analyst',
    division: 'IT',
    position: 'DevOps Engineer',
    status: 'Tetap',
    joinDate: '2020-11-05',
    bankName: 'BNI',
    accountNumber: '0982341234',
    accountHolder: 'Eko Prasetyo',
    basicSalary: 9500000,
    structureId: 'str-1',
    workDays: 22,
    presentDays: 21,
    leaveDays: 1,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 15
  },
  {
    id: 'emp-6',
    code: 'EMP-00105',
    name: 'Fajar Andi',
    role: 'employee',
    department: 'IT Support',
    division: 'IT',
    position: 'Frontend Developer',
    status: 'Tetap',
    joinDate: '2020-05-01',
    bankName: 'BCA',
    accountNumber: '6820194821',
    accountHolder: 'Fajar Andi',
    basicSalary: 7200000,
    structureId: 'str-1',
    workDays: 22,
    presentDays: 22,
    leaveDays: 0,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 5
  },
  {
    id: 'emp-7',
    code: 'EMP-00106',
    name: 'Gita Savitri',
    role: 'employee',
    department: 'Divisi SDM',
    division: 'HRD',
    position: 'HR Specialist & Recruitment',
    status: 'Tetap',
    joinDate: '2021-08-15',
    bankName: 'CIMB Niaga',
    accountNumber: '702918472900',
    accountHolder: 'Gita Savitri',
    basicSalary: 6800000,
    structureId: 'str-1',
    workDays: 22,
    presentDays: 21,
    leaveDays: 0,
    sickDays: 1,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 2
  },
  {
    id: 'emp-8',
    code: 'EMP-00107',
    name: 'Hadi Kurniawan',
    role: 'manager',
    department: 'Operasional',
    division: 'Operasional',
    position: 'Operations Manager',
    status: 'Tetap',
    joinDate: '2018-02-12',
    bankName: 'BCA',
    accountNumber: '8910294819',
    accountHolder: 'Hadi Kurniawan',
    basicSalary: 14500000,
    structureId: 'str-4',
    workDays: 22,
    presentDays: 22,
    leaveDays: 0,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 0
  },
  {
    id: 'emp-9',
    code: 'EMP-00108',
    name: 'Indah Permata',
    role: 'employee',
    department: 'Divisi Keuangan',
    division: 'Finance',
    position: 'Finance Staff',
    status: 'Tetap',
    joinDate: '2022-03-20',
    bankName: 'Mandiri',
    accountNumber: '1420018472910',
    accountHolder: 'Indah Permata',
    basicSalary: 5800000,
    structureId: 'str-1',
    workDays: 22,
    presentDays: 22,
    leaveDays: 0,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 4
  },
  {
    id: 'emp-10',
    code: 'EMP-00109',
    name: 'Joko Widodo',
    role: 'employee',
    department: 'Operasional',
    division: 'Operasional',
    position: 'Staff Pergudangan',
    status: 'Harian Lepas',
    joinDate: '2023-01-15',
    bankName: '', // sengaja dikosongkan untuk demo validasi pemeriksaan
    accountNumber: '',
    accountHolder: '',
    basicSalary: 3300000, // Rp 150.000 x 22 hari
    dailyRate: 150000,
    structureId: 'str-3',
    workDays: 22,
    presentDays: 22,
    leaveDays: 0,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 8
  },
  {
    id: 'emp-11',
    code: 'EMP-00110',
    name: 'Kartika Sari',
    role: 'employee',
    department: 'Sales',
    division: 'Marketing',
    position: 'Senior Sales Representative',
    status: 'Tetap',
    joinDate: '2021-09-01',
    bankName: 'BCA',
    accountNumber: '6829104820',
    accountHolder: 'Kartika Sari',
    basicSalary: 5500000,
    structureId: 'str-2',
    workDays: 22,
    presentDays: 21,
    leaveDays: 1,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 10
  },
  {
    id: 'emp-12',
    code: 'EMP-00111',
    name: 'Lukman Hakim',
    role: 'employee',
    department: 'Operasional',
    division: 'Operasional',
    position: 'Teknisi Lapangan',
    status: 'Kontrak',
    joinDate: '2022-07-15',
    bankName: 'BRI',
    accountNumber: '020601928471928',
    accountHolder: 'Lukman Hakim',
    basicSalary: 4800000,
    structureId: 'str-1',
    workDays: 22,
    presentDays: 20,
    leaveDays: 0,
    sickDays: 2,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 18
  },
  {
    id: 'emp-13',
    code: 'EMP-00112',
    name: 'Mega Utami',
    role: 'employee',
    department: 'Divisi SDM',
    division: 'HRD',
    position: 'Staff Payroll & Personalia',
    status: 'Tetap',
    joinDate: '2021-12-01',
    bankName: 'BCA',
    accountNumber: '8839201948',
    accountHolder: 'Mega Utami',
    basicSalary: 6200000,
    structureId: 'str-1',
    workDays: 22,
    presentDays: 22,
    leaveDays: 0,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 3
  },
  {
    id: 'emp-14',
    code: 'EMP-00113',
    name: 'Nugroho Pratama',
    role: 'employee',
    department: 'Operasional',
    division: 'Operasional',
    position: 'Staf Logistik',
    status: 'Harian Lepas',
    joinDate: '2023-04-10',
    bankName: 'Mandiri',
    accountNumber: '1370029482910',
    accountHolder: 'Nugroho Pratama',
    basicSalary: 3150000, // Rp 150.000 x 21 hari
    dailyRate: 150000,
    structureId: 'str-3',
    workDays: 22,
    presentDays: 21,
    leaveDays: 0,
    sickDays: 1,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 10
  },
  {
    id: 'emp-15',
    code: 'EMP-00114',
    name: 'Olivia Tan',
    role: 'employee',
    department: 'Sales',
    division: 'Marketing',
    position: 'Digital Marketer & PR',
    status: 'Tetap',
    joinDate: '2022-05-18',
    bankName: 'BCA',
    accountNumber: '7029184711',
    accountHolder: 'Olivia Tan',
    basicSalary: 6500000,
    structureId: 'str-2',
    workDays: 22,
    presentDays: 22,
    leaveDays: 0,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 2
  },
  {
    id: 'emp-16',
    code: 'EMP-00115',
    name: 'Panji Gumilang',
    role: 'employee',
    department: 'Operasional',
    division: 'Operasional',
    position: 'Driver Operasional',
    status: 'Kontrak',
    joinDate: '2021-06-01',
    bankName: 'BRI',
    accountNumber: '020601839281729',
    accountHolder: 'Panji Gumilang',
    basicSalary: 4500000,
    structureId: 'str-1',
    workDays: 22,
    presentDays: 22,
    leaveDays: 0,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 25 // anomaly lembur tinggi untuk demo pemeriksaan
  },
  {
    id: 'emp-17',
    code: 'EMP-00116',
    name: 'Qori Alawiyah',
    role: 'employee',
    department: 'IT Support',
    division: 'IT',
    position: 'QA Engineer',
    status: 'Tetap',
    joinDate: '2022-09-01',
    bankName: 'BCA',
    accountNumber: '8920194829',
    accountHolder: 'Qori Alawiyah',
    basicSalary: 6900000,
    structureId: 'str-1',
    workDays: 22,
    presentDays: 22,
    leaveDays: 0,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 6
  },
  {
    id: 'emp-18',
    code: 'EMP-00117',
    name: 'Rian Hidayat',
    role: 'employee',
    department: 'Sales',
    division: 'Marketing',
    position: 'Account Manager B2B',
    status: 'Tetap',
    joinDate: '2020-08-10',
    bankName: 'Mandiri',
    accountNumber: '1420029482719',
    accountHolder: 'Rian Hidayat',
    basicSalary: 8500000,
    structureId: 'str-2',
    workDays: 22,
    presentDays: 21,
    leaveDays: 1,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 5
  },
  {
    id: 'emp-19',
    code: 'EMP-00118',
    name: 'Siti Rahmawati',
    role: 'hrd',
    department: 'Divisi SDM',
    division: 'HRD',
    position: 'HR Manager & People Ops',
    status: 'Tetap',
    joinDate: '2019-01-05',
    bankName: 'BCA',
    accountNumber: '5270192847',
    accountHolder: 'Siti Rahmawati',
    basicSalary: 13500000,
    structureId: 'str-4',
    workDays: 22,
    presentDays: 22,
    leaveDays: 0,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 0
  },
  {
    id: 'emp-20',
    code: 'EMP-00119',
    name: 'Teguh Prakoso',
    role: 'director',
    department: 'Manajemen Eksekutif',
    division: 'Direksi',
    position: 'Direktur Operasional',
    status: 'Tetap',
    joinDate: '2017-05-01',
    bankName: 'BCA Prioritas',
    accountNumber: '0019284729',
    accountHolder: 'Teguh Prakoso',
    basicSalary: 28000000,
    structureId: 'str-4',
    workDays: 22,
    presentDays: 22,
    leaveDays: 0,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 0
  },
  {
    id: 'emp-21',
    code: 'EMP-00120',
    name: 'Utami Wulandari',
    role: 'employee',
    department: 'Divisi Keuangan',
    division: 'Finance',
    position: 'Finance & Tax Specialist',
    status: 'Tetap',
    joinDate: '2021-04-01',
    bankName: 'BCA',
    accountNumber: '8839182940',
    accountHolder: 'Utami Wulandari',
    basicSalary: 7800000,
    structureId: 'str-1',
    workDays: 22,
    presentDays: 22,
    leaveDays: 0,
    sickDays: 0,
    permitDays: 0,
    absentDays: 0,
    overtimeHours: 4
  }
];

// Struktur Gaji
export let salaryStructures = [
  {
    id: 'str-1',
    name: 'Struktur Gaji Staff Kantor',
    type: 'Bulanan',
    componentCount: 8,
    employeeCount: 65,
    description: 'Struktur gaji standar untuk staf kantor, staf IT, finance, dan operasional dengan gaji bulanan.',
    components: ['GP-01', 'TJ-01', 'TJ-02', 'TJ-03', 'LB-01', 'PT-01', 'PT-02', 'PT-03']
  },
  {
    id: 'str-2',
    name: 'Struktur Gaji Sales & Marketing',
    type: 'Bulanan',
    componentCount: 10,
    employeeCount: 20,
    description: 'Struktur gaji bulanan disertai bonus penjualan, insentif kuartal, dan komisi target.',
    components: ['GP-01', 'TJ-01', 'TJ-02', 'TJ-03', 'LB-01', 'BN-01', 'IN-01', 'PT-01', 'PT-02', 'PT-03']
  },
  {
    id: 'str-3',
    name: 'Struktur Gaji Pekerja Harian',
    type: 'Harian',
    componentCount: 4,
    employeeCount: 30,
    description: 'Perhitungan upah berbasis kehadiran harian x tarif harian dengan tunjangan transport & uang makan.',
    components: ['UP-01', 'TJ-02', 'LB-01', 'PT-01']
  },
  {
    id: 'str-4',
    name: 'Struktur Gaji Manajerial & Eksekutif',
    type: 'Bulanan',
    componentCount: 9,
    employeeCount: 13,
    description: 'Paket eksekutif komprehensif mencakup tunjangan representasi, komunikasi, dan tunjangan kinerja.',
    components: ['GP-01', 'TJ-01', 'TJ-02', 'TJ-04', 'BN-01', 'PT-01', 'PT-02', 'PT-03']
  }
];

// Komponen Gaji (Pendapatan & Potongan)
export let salaryComponents = [
  // Pendapatan
  {
    id: 'GP-01',
    code: 'GP-01',
    name: 'Gaji Pokok',
    type: 'Pendapatan',
    method: 'Nominal Tetap',
    defaultAmount: 6000000,
    rate: 0,
    formula: 'Gaji pokok bulanan yang disepakati dalam kontrak',
    isTaxable: true
  },
  {
    id: 'UP-01',
    code: 'UP-01',
    name: 'Upah Harian',
    type: 'Pendapatan',
    method: 'Per Hari',
    defaultAmount: 150000,
    rate: 0,
    formula: 'Rp 150.000 × Jumlah Hari Hadir',
    isTaxable: true
  },
  {
    id: 'TJ-01',
    code: 'TJ-01',
    name: 'Tunjangan Jabatan',
    type: 'Pendapatan',
    method: 'Nominal Tetap',
    defaultAmount: 750000,
    rate: 0,
    formula: 'Tunjangan struktural per level jabatan',
    isTaxable: true
  },
  {
    id: 'TJ-02',
    code: 'TJ-02',
    name: 'Tunjangan Transportasi',
    type: 'Pendapatan',
    method: 'Per Hari',
    defaultAmount: 500000,
    rate: 0,
    formula: 'Rp 25.000 × Hari Hadir (Maksimal Rp 500.000/bln)',
    isTaxable: false
  },
  {
    id: 'TJ-03',
    code: 'TJ-03',
    name: 'Tunjangan Makan',
    type: 'Pendapatan',
    method: 'Per Hari',
    defaultAmount: 400000,
    rate: 0,
    formula: 'Rp 20.000 × Hari Hadir',
    isTaxable: false
  },
  {
    id: 'TJ-04',
    code: 'TJ-04',
    name: 'Tunjangan Komunikasi & Representasi',
    type: 'Pendapatan',
    method: 'Nominal Tetap',
    defaultAmount: 1000000,
    rate: 0,
    formula: 'Tunjangan pulsa dan representasi bisnis manajemen',
    isTaxable: true
  },
  {
    id: 'LB-01',
    code: 'LB-01',
    name: 'Lembur',
    type: 'Pendapatan',
    method: 'Per Jam',
    defaultAmount: 0,
    rate: 0,
    formula: 'Jumlah Jam Lembur × (Gaji Pokok / 173) × Faktor Pengali',
    isTaxable: true
  },
  {
    id: 'BN-01',
    code: 'BN-01',
    name: 'Bonus',
    type: 'Pendapatan',
    method: 'Nominal Tetap',
    defaultAmount: 0,
    rate: 0,
    formula: 'Bonus capaian kinerja / pencapaian target',
    isTaxable: true
  },
  {
    id: 'IN-01',
    code: 'IN-01',
    name: 'Insentif',
    type: 'Pendapatan',
    method: 'Rumus',
    defaultAmount: 0,
    rate: 0,
    formula: 'Pencapaian Penjualan (%) × Target Insentif',
    isTaxable: true
  },
  // Potongan
  {
    id: 'PT-01',
    code: 'PT-01',
    name: 'BPJS Kesehatan',
    type: 'Potongan',
    method: 'Persentase',
    defaultAmount: 150000,
    rate: 1, // 1% karyawan
    formula: '1% × Gaji Pokok (Maksimal batas upah Rp 12.000.000)',
    isTaxable: false
  },
  {
    id: 'PT-02',
    code: 'PT-02',
    name: 'BPJS Ketenagakerjaan (JHT + JP)',
    type: 'Potongan',
    method: 'Persentase',
    defaultAmount: 180000,
    rate: 3, // JHT 2% + JP 1%
    formula: '3% × Gaji Pokok',
    isTaxable: false
  },
  {
    id: 'PT-03',
    code: 'PT-03',
    name: 'PPh 21',
    type: 'Potongan',
    method: 'Rumus',
    defaultAmount: 120000,
    rate: 0,
    formula: 'Tarif Efektif Rata-Rata (TER) PP 58/2023',
    isTaxable: false
  },
  {
    id: 'PT-04',
    code: 'PT-04',
    name: 'Cicilan Pinjaman',
    type: 'Potongan',
    method: 'Nominal Tetap',
    defaultAmount: 0,
    rate: 0,
    formula: 'Otomatis ditarik dari cicilan pinjaman aktif bulan berjalan',
    isTaxable: false
  },
  {
    id: 'PT-05',
    code: 'PT-05',
    name: 'Kasbon',
    type: 'Potongan',
    method: 'Nominal Tetap',
    defaultAmount: 0,
    rate: 0,
    formula: 'Otomatis ditarik dari kasbon yang jatuh tempo periode ini',
    isTaxable: false
  },
  {
    id: 'PT-06',
    code: 'PT-06',
    name: 'Potongan Keterlambatan',
    type: 'Potongan',
    method: 'Per Jam',
    defaultAmount: 0,
    rate: 0,
    formula: 'Menit Keterlambatan × Tarif Potongan Kebijakan',
    isTaxable: false
  },
  {
    id: 'PT-07',
    code: 'PT-07',
    name: 'Potongan Ketidakhadiran',
    type: 'Potongan',
    method: 'Per Hari',
    defaultAmount: 0,
    rate: 0,
    formula: 'Hari Alpha × (Gaji Pokok / 22)',
    isTaxable: false
  }
];

// Aturan Penggajian & Pinjaman
export let salaryRules = [
  { key: 'loan_min_tenure', name: 'Minimal Masa Kerja Pinjaman', value: '6 bulan', description: 'Karyawan harus bekerja minimal 6 bulan untuk berhak mengajukan pinjaman.' },
  { key: 'loan_max_multiplier', name: 'Maksimal Pinjaman', value: '3 × Gaji Pokok', description: 'Plafon pinjaman maksimal adalah tiga kali dari gaji pokok bulanan.' },
  { key: 'loan_max_tenor', name: 'Maksimal Tenor Pinjaman', value: '12 bulan', description: 'Jangka waktu pembayaran cicilan paling lama 12 bulan.' },
  { key: 'loan_max_deduction_pct', name: 'Maksimal Potongan Gaji', value: '35%', description: 'Total akumulasi potongan gaji per bulan tidak boleh melebihi 35% take-home pay.' },
  { key: 'overtime_base_divisor', name: 'Pembagi Upah Lembur', value: '173 jam', description: 'Upah lembur per jam dihitung dengan 1/173 × Gaji Pokok sesuai standar Depnaker.' },
  { key: 'overtime_first_hour_rate', name: 'Pengali Lembur Jam Pertama', value: '1.5×', description: 'Pengali upah per jam lembur pertama pada hari kerja biasa.' },
  { key: 'payroll_cutoff_day', name: 'Hari Tutup Data (Cut-off)', value: 'Tanggal 25', description: 'Data absensi dan lembur dikunci setiap tanggal 25 setiap bulannya.' },
  { key: 'payroll_payment_day', name: 'Hari Pembayaran Gaji', value: 'Tanggal 30 / Akhir Bulan', description: 'Gaji ditransfer ke rekening karyawan pada tanggal 30 atau hari kerja terakhir.' }
];

// Periode Penggajian
export let payrollPeriods = [
  {
    id: 'prd-2026-09',
    name: 'Penggajian September 2026',
    payrollType: 'Bulanan',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    cutoffDate: '2026-09-25',
    paymentDate: '2026-09-30',
    totalEmployees: 128,
    totalEligible: 135,
    paidEmployees: 128,
    totalGross: 835200000,
    totalDeductions: 90200000,
    totalAmount: 745000000,
    status: 'Menunggu Persetujuan',
    currentStage: 4, // 1: Data, 2: Perhitungan, 3: Pemeriksaan, 4: Persetujuan, 5: Pembayaran, 6: Publikasi Slip
    stages: [
      { name: 'Data Kehadiran', done: true, at: '2026-09-25 18:00' },
      { name: 'Perhitungan', done: true, at: '2026-09-26 10:30' },
      { name: 'Pemeriksaan', done: true, at: '2026-09-26 15:45' },
      { name: 'Persetujuan', done: false, current: true },
      { name: 'Pembayaran', done: false },
      { name: 'Publikasi Slip Gaji', done: false }
    ],
    attentionCount: 4,
    attentionItems: [
      { id: 'att-1', type: 'warning', text: '7 karyawan belum memiliki rekening bank atau data tidak lengkap', actionText: 'Periksa' },
      { id: 'att-2', type: 'warning', text: '3 data penggajian perlu diperiksa (lembur melebihi 20 jam)', actionText: 'Perbaiki' },
      { id: 'att-3', type: 'info', text: '5 pinjaman jatuh tempo dan dipotong pada periode bulan ini', actionText: 'Lihat' },
      { id: 'att-4', type: 'alert', text: '2 pengajuan pinjaman baru menunggu persetujuan HR & Finance', actionText: 'Tinjau' }
    ]
  },
  {
    id: 'prd-2026-08',
    name: 'Penggajian Agustus 2026',
    payrollType: 'Bulanan',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    cutoffDate: '2026-08-25',
    paymentDate: '2026-08-31',
    totalEmployees: 126,
    totalEligible: 126,
    paidEmployees: 126,
    totalGross: 812000000,
    totalDeductions: 88000000,
    totalAmount: 724000000,
    status: 'Slip Dipublikasikan',
    currentStage: 6,
    stages: [
      { name: 'Data Kehadiran', done: true, at: '2026-08-25 18:00' },
      { name: 'Perhitungan', done: true, at: '2026-08-26 10:30' },
      { name: 'Pemeriksaan', done: true, at: '2026-08-26 16:00' },
      { name: 'Persetujuan', done: true, at: '2026-08-28 14:00' },
      { name: 'Pembayaran', done: true, at: '2026-08-31 09:30' },
      { name: 'Publikasi Slip Gaji', done: true, at: '2026-08-31 10:00' }
    ],
    attentionCount: 0,
    attentionItems: []
  },
  {
    id: 'prd-2026-07',
    name: 'Penggajian Juli 2026',
    payrollType: 'Bulanan',
    startDate: '2026-07-01',
    endDate: '2026-07-31',
    cutoffDate: '2026-07-25',
    paymentDate: '2026-07-31',
    totalEmployees: 125,
    totalEligible: 125,
    paidEmployees: 125,
    totalGross: 798000000,
    totalDeductions: 86000000,
    totalAmount: 712000000,
    status: 'Ditutup',
    currentStage: 6,
    stages: [
      { name: 'Data Kehadiran', done: true },
      { name: 'Perhitungan', done: true },
      { name: 'Pemeriksaan', done: true },
      { name: 'Persetujuan', done: true },
      { name: 'Pembayaran', done: true },
      { name: 'Publikasi Slip Gaji', done: true }
    ],
    attentionCount: 0,
    attentionItems: []
  }
];

// Pinjaman Karyawan Aktif
export let employeeLoans = [
  {
    id: 'ln-1',
    employeeId: 'emp-1',
    employeeName: 'Budi Santoso',
    employeeCode: 'EMP-00123',
    department: 'Operasional',
    principalAmount: 5000000,
    tenorMonths: 5,
    monthlyInstallment: 1000000,
    paidAmount: 3000000,
    remainingAmount: 2000000,
    startPeriod: 'Juni 2026',
    status: 'Aktif',
    purpose: 'Renovasi Rumah & Biaya Pendidikan',
    createdAt: '2026-05-20',
    installments: [
      { number: 1, period: 'Juni 2026', dueDate: '2026-06-30', amount: 1000000, status: 'Lunas', paidAt: '2026-06-30' },
      { number: 2, period: 'Juli 2026', dueDate: '2026-07-31', amount: 1000000, status: 'Lunas', paidAt: '2026-07-31' },
      { number: 3, period: 'Agustus 2026', dueDate: '2026-08-31', amount: 1000000, status: 'Lunas', paidAt: '2026-08-31' },
      { number: 4, period: 'September 2026', dueDate: '2026-09-30', amount: 1000000, status: 'Belum dibayar', paidAt: null },
      { number: 5, period: 'Oktober 2026', dueDate: '2026-10-31', amount: 1000000, status: 'Belum dibayar', paidAt: null }
    ]
  },
  {
    id: 'ln-2',
    employeeId: 'emp-3',
    employeeName: 'Cindy Putri',
    employeeCode: 'EMP-00102',
    department: 'Marketing',
    principalAmount: 3000000,
    tenorMonths: 3,
    monthlyInstallment: 1000000,
    paidAmount: 2000000,
    remainingAmount: 1000000,
    startPeriod: 'Juli 2026',
    status: 'Aktif',
    purpose: 'Penggantian Laptop Pribadi untuk Kerja',
    createdAt: '2026-06-25',
    installments: [
      { number: 1, period: 'Juli 2026', dueDate: '2026-07-31', amount: 1000000, status: 'Lunas', paidAt: '2026-07-31' },
      { number: 2, period: 'Agustus 2026', dueDate: '2026-08-31', amount: 1000000, status: 'Lunas', paidAt: '2026-08-31' },
      { number: 3, period: 'September 2026', dueDate: '2026-09-30', amount: 1000000, status: 'Belum dibayar', paidAt: null }
    ]
  },
  {
    id: 'ln-3',
    employeeId: 'emp-5',
    employeeName: 'Eko Prasetyo',
    employeeCode: 'EMP-00104',
    department: 'IT',
    principalAmount: 12000000,
    tenorMonths: 12,
    monthlyInstallment: 1000000,
    paidAmount: 4000000,
    remainingAmount: 8000000,
    startPeriod: 'Mei 2026',
    status: 'Aktif',
    purpose: 'Biaya Pengobatan Keluarga',
    createdAt: '2026-04-18',
    installments: [
      { number: 1, period: 'Mei 2026', dueDate: '2026-05-31', amount: 1000000, status: 'Lunas', paidAt: '2026-05-31' },
      { number: 2, period: 'Juni 2026', dueDate: '2026-06-30', amount: 1000000, status: 'Lunas', paidAt: '2026-06-30' },
      { number: 3, period: 'Juli 2026', dueDate: '2026-07-31', amount: 1000000, status: 'Lunas', paidAt: '2026-07-31' },
      { number: 4, period: 'Agustus 2026', dueDate: '2026-08-31', amount: 1000000, status: 'Lunas', paidAt: '2026-08-31' },
      { number: 5, period: 'September 2026', dueDate: '2026-09-30', amount: 1000000, status: 'Belum dibayar', paidAt: null }
    ]
  }
];

// Pengajuan Pinjaman Baru (Menunggu Persetujuan)
export let loanRequests = [
  {
    id: 'lr-1',
    employeeId: 'emp-6',
    employeeName: 'Fajar Andi',
    employeeCode: 'EMP-00105',
    department: 'IT Support',
    basicSalary: 7200000,
    currentTakeHomePay: 7450000,
    amount: 6000000,
    tenorMonths: 6,
    monthlyInstallment: 1000000,
    totalDeductionsAfter: 1450000,
    purpose: 'Kebutuhan Mendesak Tempat Tinggal',
    attachmentUrl: 'surat_keterangan_sewa.pdf',
    status: 'Menunggu Persetujuan',
    managerStatus: 'Disetujui',
    hrStatus: 'Menunggu',
    financeStatus: 'Menunggu',
    createdAt: '2026-09-22 09:30'
  },
  {
    id: 'lr-2',
    employeeId: 'emp-12',
    employeeName: 'Lukman Hakim',
    employeeCode: 'EMP-00111',
    department: 'Operasional',
    basicSalary: 4800000,
    currentTakeHomePay: 5100000,
    amount: 4000000,
    tenorMonths: 4,
    monthlyInstallment: 1000000,
    totalDeductionsAfter: 1350000,
    purpose: 'Perbaikan Kendaraan Operasional Pribadi',
    attachmentUrl: 'estimasi_bengkel.pdf',
    status: 'Menunggu Persetujuan',
    managerStatus: 'Menunggu',
    hrStatus: 'Menunggu',
    financeStatus: 'Menunggu',
    createdAt: '2026-09-24 14:15'
  }
];

// Kasbon Karyawan
export let cashAdvances = [
  {
    id: 'kb-1',
    employeeId: 'emp-1',
    employeeName: 'Budi Santoso',
    employeeCode: 'EMP-00123',
    department: 'Operasional',
    amount: 500000,
    purpose: 'Kebutuhan Mendesak Keluarga',
    requestDate: '2026-09-12',
    deductionPeriod: 'September 2026',
    status: 'Disetujui',
    attachmentUrl: null,
    createdAt: '2026-09-12 11:20'
  },
  {
    id: 'kb-2',
    employeeId: 'emp-16',
    employeeName: 'Panji Gumilang',
    employeeCode: 'EMP-00115',
    department: 'Operasional',
    amount: 350000,
    purpose: 'Perpanjangan SIM Pengemudi Operasional',
    requestDate: '2026-09-15',
    deductionPeriod: 'September 2026',
    status: 'Disetujui',
    attachmentUrl: 'bukti_sim.jpg',
    createdAt: '2026-09-15 08:45'
  },
  {
    id: 'kb-3',
    employeeId: 'emp-4',
    employeeName: 'Dewi Lestari',
    employeeCode: 'EMP-00103',
    department: 'Divisi Keuangan',
    amount: 750000,
    purpose: 'Pembelian Kacamata Kerja Medis',
    requestDate: '2026-09-20',
    deductionPeriod: 'September 2026',
    status: 'Menunggu Persetujuan',
    attachmentUrl: 'resep_dokter.pdf',
    createdAt: '2026-09-20 16:10'
  }
];

// Penggantian Biaya (Reimbursement)
export let reimbursements = [
  {
    id: 'rmb-1',
    employeeId: 'emp-1',
    employeeName: 'Budi Santoso',
    employeeCode: 'EMP-00123',
    department: 'Operasional',
    category: 'Transportasi',
    title: 'Bensin & Tol Kunjungan Lapangan Vendor Cikarang',
    amount: 350000,
    transactionDate: '2026-09-18',
    description: 'Survei gudang logistik dan meeting koordinasi vendor mitra Cikarang',
    receiptUrl: 'struk_bensin_tol.jpg',
    status: 'Disetujui Atasan',
    payoutMethod: 'Penggajian',
    approvals: [
      { role: 'Atasan Langsung', name: 'Hadi Kurniawan', status: 'Disetujui', date: '2026-09-19 10:20' },
      { role: 'HR & Finance', name: 'Siti Rahmawati', status: 'Menunggu', date: null }
    ],
    createdAt: '2026-09-18 17:30'
  },
  {
    id: 'rmb-2',
    employeeId: 'emp-3',
    employeeName: 'Cindy Putri',
    employeeCode: 'EMP-00102',
    department: 'Marketing',
    category: 'Makan',
    title: 'Jamuan Makan Siang Prospek Klien Korporat',
    amount: 485000,
    transactionDate: '2026-09-14',
    description: 'Meeting penjajakan kontrak tahunan HRIS dengan tim PT Jaya Mandiri',
    receiptUrl: 'bill_resto_senayan.pdf',
    status: 'Disetujui HR/Finance',
    payoutMethod: 'Penggajian',
    approvals: [
      { role: 'Atasan Langsung', name: 'Rian Hidayat', status: 'Disetujui', date: '2026-09-15 09:00' },
      { role: 'HR & Finance', name: 'Dewi Lestari', status: 'Disetujui', date: '2026-09-16 11:30' }
    ],
    createdAt: '2026-09-14 15:40'
  },
  {
    id: 'rmb-3',
    employeeId: 'emp-2',
    employeeName: 'Andi Prasetyo',
    employeeCode: 'EMP-00101',
    department: 'IT Support',
    category: 'Operasional',
    title: 'Langganan Cloud Server & SSL Staging',
    amount: 1250000,
    transactionDate: '2026-09-08',
    description: 'Pembayaran tagihan domain dan server staging sprint September',
    receiptUrl: 'invoice_digitalocean.pdf',
    status: 'Disetujui HR/Finance',
    payoutMethod: 'Penggajian',
    approvals: [
      { role: 'Atasan Langsung', name: 'Teguh Prakoso', status: 'Disetujui', date: '2026-09-09 13:00' },
      { role: 'HR & Finance', name: 'Dewi Lestari', status: 'Disetujui', date: '2026-09-10 14:00' }
    ],
    createdAt: '2026-09-08 19:15'
  }
];

// Timeline Persetujuan Penggajian September 2026
export let payrollApprovals = [
  {
    id: 'appr-1',
    periodId: 'prd-2026-09',
    stageName: 'Dibuat & Dihitung oleh HR',
    role: 'hrd',
    actorName: 'Mega Utami (Staf HR)',
    status: 'Disetujui',
    date: '2026-09-25 17:30',
    notes: 'Seluruh data absensi tanggal 1-25 telah disinkronkan dan dihitung otomatis.'
  },
  {
    id: 'appr-2',
    periodId: 'prd-2026-09',
    stageName: 'Diperiksa oleh HR Manager',
    role: 'hrd',
    actorName: 'Siti Rahmawati (HR Manager)',
    status: 'Disetujui',
    date: '2026-09-26 15:45',
    notes: 'Koreksi lembur telah divalidasi. Rekening karyawan baru telah dilengkapi.'
  },
  {
    id: 'appr-3',
    periodId: 'prd-2026-09',
    stageName: 'Verifikasi & Persetujuan Finance',
    role: 'finance',
    actorName: 'Dewi Lestari (Finance Manager)',
    status: 'Menunggu',
    date: null,
    notes: 'Menunggu verifikasi alokasi anggaran kas perusahaan.'
  },
  {
    id: 'appr-4',
    periodId: 'prd-2026-09',
    stageName: 'Persetujuan Akhir Direktur',
    role: 'director',
    actorName: 'Teguh Prakoso (Direktur)',
    status: 'Menunggu',
    date: null,
    notes: 'Menunggu tanda tangan digital setelah verifikasi Finance.'
  }
];

// Penyesuaian Penggajian (Payroll Adjustment - Immutability Rule)
export let payrollAdjustments = [
  {
    id: 'adj-1',
    employeeId: 'emp-1',
    employeeName: 'Budi Santoso',
    targetPeriod: 'September 2026',
    referencePeriod: 'Agustus 2026',
    type: 'Pendapatan',
    amount: 500000,
    reason: 'Kelebihan lembur bulan Agustus 2026 yang belum terhitung pada cut-off',
    status: 'Diterapkan',
    createdBy: 'Siti Rahmawati (HR Manager)',
    createdAt: '2026-09-10 10:15'
  }
];

// Log Audit Penggajian
export let payrollAuditLogs = [
  {
    id: 'log-1',
    timestamp: '25 September 2026 14:32',
    actorName: 'Siti Rahmawati',
    actorRole: 'HR Manager',
    employeeName: 'Budi Santoso',
    action: 'Koreksi Komponen Lembur',
    beforeValue: 'Rp 300.000',
    afterValue: 'Rp 500.000',
    reason: 'Koreksi perhitungan lembur shift akhir pekan setelah verifikasi supervisor.'
  },
  {
    id: 'log-2',
    timestamp: '25 September 2026 11:20',
    actorName: 'Mega Utami',
    actorRole: 'Staf HR',
    employeeName: 'Semua Karyawan',
    action: 'Sinkronisasi Absensi & Komponen',
    beforeValue: 'Draft Kosong',
    afterValue: '128 Karyawan Terhitung',
    reason: 'Sinkronisasi rutin cut-off tanggal 25.'
  },
  {
    id: 'log-3',
    timestamp: '24 September 2026 16:45',
    actorName: 'Dewi Lestari',
    actorRole: 'Senior Accountant',
    employeeName: 'Cindy Putri',
    action: 'Persetujuan Reimbursement',
    beforeValue: 'Menunggu Persetujuan',
    afterValue: 'Disetujui Rp 485.000',
    reason: 'Verifikasi struk jamuan makan siang klien lengkap dan sesuai plafon.'
  },
  {
    id: 'log-4',
    timestamp: '22 September 2026 15:10',
    actorName: 'Hadi Kurniawan',
    actorRole: 'Operations Manager',
    employeeName: 'Fajar Andi',
    action: 'Persetujuan Awal Pinjaman',
    beforeValue: 'Menunggu Persetujuan',
    afterValue: 'Disetujui Atasan Langsung',
    reason: 'Rekomendasi disetujui karena performa kerja baik dan masa kerja > 4 tahun.'
  }
];

// Notifikasi Penggajian
export let payrollNotifications = [
  {
    id: 'notif-1',
    employeeId: 'emp-1',
    title: 'Slip Gaji Tersedia',
    message: 'Slip gaji September 2026 telah tersedia dan dapat diunduh.',
    time: '2 jam yang lalu',
    isRead: false,
    category: 'Slip Gaji'
  },
  {
    id: 'notif-2',
    employeeId: 'emp-1',
    title: 'Pembayaran Gaji Diproses',
    message: 'Pembayaran gaji September 2026 telah diproses via transfer BCA.',
    time: '1 hari yang lalu',
    isRead: true,
    category: 'Pembayaran'
  },
  {
    id: 'notif-3',
    employeeId: 'emp-1',
    title: 'Cicilan Pinjaman Dipotong',
    message: 'Cicilan pinjaman sebesar Rp 1.000.000 telah dipotong pada penggajian September 2026.',
    time: '3 hari yang lalu',
    isRead: true,
    category: 'Pinjaman'
  },
  {
    id: 'notif-4',
    employeeId: 'emp-1',
    title: 'Pengajuan Biaya Disetujui',
    message: 'Pengajuan penggantian biaya Anda sebesar Rp 350.000 telah disetujui atasan.',
    time: '5 hari yang lalu',
    isRead: true,
    category: 'Penggantian Biaya'
  }
];

// Fungsi Penghitung Komponen per Karyawan
export function calculateEmployeeSalary(emp, periodName = 'September 2026') {
  const basic = emp.dailyRate ? emp.dailyRate * (emp.presentDays || 22) : emp.basicSalary;
  
  // Tunjangan
  let tunjanganJabatan = 0;
  if (emp.position.includes('Manager') || emp.position.includes('Direktur')) {
    tunjanganJabatan = 2500000;
  } else if (emp.position.includes('Supervisor') || emp.position.includes('Lead')) {
    tunjanganJabatan = 750000;
  } else if (emp.position.includes('Senior')) {
    tunjanganJabatan = 450000;
  }

  const tunjanganTransport = Math.min(500000, (emp.presentDays || 22) * 25000);
  const tunjanganMakan = (emp.presentDays || 22) * 20000;

  // Hitung lembur detail
  // Rumus resmi Depnaker: Jam lembur × (Gaji Pokok / 173) × 1.5
  const hourlyRate = Math.round(basic / 173);
  const lemburAmount = Math.round((emp.overtimeHours || 0) * hourlyRate * 1.5);
  // Pembulatan ke ribuan
  const lemburRounded = Math.round(lemburAmount / 1000) * 1000;

  // Bonus / Insentif khusus sales
  let bonusInsentif = 0;
  if (emp.department === 'Sales' || emp.division === 'Marketing') {
    bonusInsentif = 850000;
  }

  // Penyesuaian Penggajian (jika ada)
  const adj = payrollAdjustments.find(a => a.employeeId === emp.id && a.targetPeriod === periodName);
  const adjustmentAmount = adj ? adj.amount : 0;

  // Total Pendapatan
  const totalEarnings = basic + tunjanganJabatan + tunjanganTransport + tunjanganMakan + lemburRounded + bonusInsentif + adjustmentAmount;

  // Potongan
  // BPJS Kesehatan (1% gaji maks 12 jt)
  const bpjsKesehatan = Math.min(120000, Math.round(basic * 0.01));
  // BPJS Ketenagakerjaan (3%)
  const bpjsKetenagakerjaan = Math.round(basic * 0.03);
  // PPh 21 (estimasi TER 1.5% - 3%)
  const pph21 = Math.round(basic * 0.02);

  // Pinjaman Aktif
  const activeLoan = employeeLoans.find(l => l.employeeId === emp.id && l.status === 'Aktif');
  const cicilanPinjaman = activeLoan ? activeLoan.monthlyInstallment : 0;

  // Kasbon Aktif periode ini
  const activeKasbon = cashAdvances.find(k => k.employeeId === emp.id && k.deductionPeriod === periodName && (k.status === 'Disetujui' || k.status === 'Dipotong Payroll'));
  const kasbonAmount = activeKasbon ? activeKasbon.amount : 0;

  // Potongan lainnya (keterlambatan/izin)
  const potonganLainnya = (emp.absentDays || 0) * Math.round(basic / 22);

  // Total Potongan
  const totalDeductions = bpjsKesehatan + bpjsKetenagakerjaan + pph21 + cicilanPinjaman + kasbonAmount + potonganLainnya;

  // Gaji Bersih
  const netSalary = Math.max(0, totalEarnings - totalDeductions);

  return {
    employeeId: emp.id,
    employeeCode: emp.code,
    name: emp.name,
    department: emp.department,
    position: emp.position,
    status: emp.status,
    bankName: emp.bankName || 'BCA',
    accountNumber: emp.accountNumber || '',
    accountNumberMasked: emp.accountNumber ? `****${emp.accountNumber.slice(-4)}` : 'Belum ada rekening',
    accountHolder: emp.accountHolder || emp.name,
    attendance: {
      workDays: emp.workDays || 22,
      presentDays: emp.presentDays || 22,
      leaveDays: emp.leaveDays || 0,
      sickDays: emp.sickDays || 0,
      permitDays: emp.permitDays || 0,
      absentDays: emp.absentDays || 0,
      overtimeHours: emp.overtimeHours || 0
    },
    earnings: {
      basicSalary: basic,
      tunjanganJabatan,
      tunjanganTransport,
      tunjanganMakan,
      overtime: lemburRounded,
      overtimeDetail: {
        hours: emp.overtimeHours || 0,
        hourlyRate,
        rawTotal: lemburAmount,
        roundedTotal: lemburRounded
      },
      bonusInsentif,
      adjustment: adjustmentAmount,
      total: totalEarnings
    },
    deductions: {
      bpjsKesehatan,
      bpjsKetenagakerjaan,
      pph21,
      loanInstallment: cicilanPinjaman,
      cashAdvance: kasbonAmount,
      otherDeductions: potonganLainnya,
      total: totalDeductions
    },
    netSalary,
    terbilangText: terbilang(netSalary),
    payslipCode: `SLIP-2026-09-${emp.code.replace(/[^a-zA-Z0-9]/g, '')}`,
    verificationCode: `SMART-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    calculationStatus: !emp.accountNumber ? 'Perlu Periksa' : (emp.overtimeHours > 20 ? 'Perlu Periksa' : 'Selesai'),
    warningReason: !emp.accountNumber ? 'Rekening bank belum tersedia' : (emp.overtimeHours > 20 ? 'Jam lembur tinggi (>20 jam) perlu verifikasi' : null)
  };
}

// Generate pre-calculated items for the 20+ employees
export function getPayrollItems(periodId = 'prd-2026-09') {
  return payrollEmployees.map(emp => calculateEmployeeSalary(emp, 'September 2026'));
}
