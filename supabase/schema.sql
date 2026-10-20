-- SMART HRM initial schema. Review and harden RLS before production.
create extension if not exists pgcrypto;
create table if not exists companies (
 id uuid primary key default gen_random_uuid(), name text not null, industry text,
 created_at timestamptz not null default now()
);
create table if not exists profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 company_id uuid references companies(id) on delete cascade,
 full_name text not null, email text not null, role text not null check(role in ('employee','manager','director','hrd')),
 department text, manager_id uuid references profiles(id), employee_number text,
 created_at timestamptz not null default now()
);
create table if not exists demo_requests (
 id uuid primary key default gen_random_uuid(), company_name text not null, industry text not null,
 pic_name text not null, phone text not null, email text not null, message text not null,
 status text not null default 'new', created_at timestamptz not null default now()
);
create table if not exists approval_routes (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references companies(id) on delete cascade,
 request_type text not null, requester_role text not null,
 steps jsonb not null check(jsonb_typeof(steps)='array'), unique(company_id,request_type,requester_role)
);
create table if not exists approval_requests (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references companies(id) on delete cascade,
 requester_id uuid not null references profiles(id), requester_role text not null, request_type text not null,
 title text not null, details jsonb not null default '{}', steps jsonb not null, current_step int not null default 0,
 current_approver_role text not null, current_approver_id uuid references profiles(id),
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists approval_events (
 id uuid primary key default gen_random_uuid(), request_id uuid not null references approval_requests(id) on delete cascade,
 actor_id uuid not null references profiles(id), decision text not null, note text default '',
 created_at timestamptz not null default now()
);
create table if not exists kpi_cycles (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references companies(id) on delete cascade,
 name text not null, start_date date not null, end_date date not null, created_by uuid references profiles(id),
 created_at timestamptz not null default now(), check(end_date>=start_date)
);
create table if not exists kpi_goals (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references companies(id) on delete cascade,
 cycle_id uuid not null references kpi_cycles(id) on delete cascade, employee_id uuid not null references profiles(id),
 title text not null, description text, target numeric, actual numeric, unit text, weight numeric default 1,
 status text not null default 'draft', created_by uuid references profiles(id), created_at timestamptz not null default now()
);
create table if not exists attendance_locations (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references companies(id) on delete cascade,
 name text not null, latitude numeric not null, longitude numeric not null, radius_meters int not null default 150,
 active boolean not null default true, created_by uuid references profiles(id), created_at timestamptz not null default now()
);
create table if not exists attendance (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references companies(id) on delete cascade,
 employee_id uuid not null references profiles(id), location_id uuid not null references attendance_locations(id),
 kind text not null check(kind in ('in','out')), latitude numeric not null, longitude numeric not null,
 distance_meters int not null, recorded_at timestamptz not null default now()
);
create table if not exists leave_requests (
 id uuid primary key default gen_random_uuid(), company_id uuid not null references companies(id) on delete cascade,
 employee_id uuid not null references profiles(id), start_date date not null, end_date date not null,
 leave_type text not null, reason text, status text not null default 'pending', created_at timestamptz not null default now()
);
create table if not exists divisions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists positions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists departments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists employees (
  -- 1. INFORMASI AKUN
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  user_id uuid,
  username text,
  email text,
  role text default 'employee',

  -- 2. DATA PRIBADI
  photo text,
  name text not null,
  nomor_telepon text,
  tempat_lahir text,
  tanggal_lahir text,
  jenis_kelamin text,
  alamat_ktp text,
  alamat_domisili text,
  pendidikan text,
  agama text,
  nama_suami_istri text,
  nama_anak text,
  jumlah_anak text,
  nama_bapak text,
  nama_ibu text,

  -- 3. DATA KEPEGAWAIAN
  employee_code text not null,
  division text,
  position text,
  department text,
  work_location text,
  join_date text,
  contract_start text,
  contract_end text,
  "group" text,
  category text default 'Full Time',
  marital_status text,
  reference text,
  sio_number text,
  account_status text default 'Aktif',
  work_status text default 'Aktif',
  contract_reminder text,
  has_npwp text,

  -- 4. INFORMASI GAJI
  basic_salary numeric default 0,
  salary_basic text,
  allowance_position text,
  allowance_project text,
  allowance_meal text,
  allowance_transport text,
  allowance_other text,

  -- 5. DOKUMEN PENDUKUNG
  file_ktp text,
  ktp_number text,
  file_kk text,
  kk_number text,
  file_npwp text,
  npwp_number text,
  file_kpj text,
  kpj_number text,
  file_jkn text,
  jkn_number text,
  file_cv text,
  file_other text,

  -- 6. DETAIL AKUN BANK
  bank_name text default 'BCA',
  bank_account_number text,
  bank_account_holder text,
  bank_account_name text,

  -- 7. KONTAK DARURAT
  emergency_name text,
  emergency_relation text,
  emergency_phone text,

  -- 8. IDENTITAS KENDARAAN
  file_sim text,
  sim_number text,
  file_stnk text,
  stnk_number text,
  file_vehicle_front text,
  file_vehicle_back text,
  file_vehicle_side text,

  -- 9. WADAH JSON DATA LENGKAP
  documents jsonb default '{}'::jsonb,
  details jsonb default '{}'::jsonb,

  -- 10. TIMESTAMPS (PALING AKHIR)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- SQL LENGKAP UNTUK SUPABASE SQL EDITOR (JALANKAN SEKALI UNTUK SEMUA SECTION)
-- ============================================================================
-- ALTER TABLE employees 
-- -- Dokumen Pendukung & Nomor
-- ADD COLUMN IF NOT EXISTS file_npwp text,
-- ADD COLUMN IF NOT EXISTS file_ktp text,
-- ADD COLUMN IF NOT EXISTS file_kk text,
-- ADD COLUMN IF NOT EXISTS file_kpj text,
-- ADD COLUMN IF NOT EXISTS file_jkn text,
-- ADD COLUMN IF NOT EXISTS file_cv text,
-- ADD COLUMN IF NOT EXISTS file_other text,
-- -- Identitas Kendaraan (File)
-- ADD COLUMN IF NOT EXISTS file_sim text,
-- ADD COLUMN IF NOT EXISTS file_stnk text,
-- ADD COLUMN IF NOT EXISTS file_vehicle_front text,
-- ADD COLUMN IF NOT EXISTS file_vehicle_back text,
-- ADD COLUMN IF NOT EXISTS file_vehicle_side text,
-- -- Informasi Gaji
-- ADD COLUMN IF NOT EXISTS salary_basic text,
-- ADD COLUMN IF NOT EXISTS allowance_position text,
-- ADD COLUMN IF NOT EXISTS allowance_project text,
-- ADD COLUMN IF NOT EXISTS allowance_meal text,
-- ADD COLUMN IF NOT EXISTS allowance_transport text,
-- ADD COLUMN IF NOT EXISTS allowance_other text,
-- -- Detail Akun Bank
-- ADD COLUMN IF NOT EXISTS bank_name text,
-- ADD COLUMN IF NOT EXISTS bank_account_number text,
-- ADD COLUMN IF NOT EXISTS bank_account_name text,
-- -- Kontak Darurat
-- ADD COLUMN IF NOT EXISTS emergency_name text,
-- ADD COLUMN IF NOT EXISTS emergency_relation text,
-- ADD COLUMN IF NOT EXISTS emergency_phone text,
-- -- Data Pribadi
-- ADD COLUMN IF NOT EXISTS nomor_telepon text,
-- ADD COLUMN IF NOT EXISTS tempat_lahir text,
-- ADD COLUMN IF NOT EXISTS tanggal_lahir text,
-- ADD COLUMN IF NOT EXISTS jenis_kelamin text,
-- ADD COLUMN IF NOT EXISTS alamat_ktp text,
-- ADD COLUMN IF NOT EXISTS alamat_domisili text,
-- ADD COLUMN IF NOT EXISTS pendidikan text,
-- ADD COLUMN IF NOT EXISTS agama text,
-- ADD COLUMN IF NOT EXISTS nama_suami_istri text,
-- ADD COLUMN IF NOT EXISTS nama_anak text,
-- ADD COLUMN IF NOT EXISTS jumlah_anak text,
-- ADD COLUMN IF NOT EXISTS nama_bapak text,
-- ADD COLUMN IF NOT EXISTS nama_ibu text,
-- -- Data Kepegawaian Ekstra
-- ADD COLUMN IF NOT EXISTS work_location text,
-- ADD COLUMN IF NOT EXISTS "group" text,
-- ADD COLUMN IF NOT EXISTS marital_status text,
-- ADD COLUMN IF NOT EXISTS reference text,
-- ADD COLUMN IF NOT EXISTS sio_number text,
-- ADD COLUMN IF NOT EXISTS has_npwp text;

-- ============================================================================
-- MODUL PENGGAJIAN & KEUANGAN KARYAWAN (PAYROLL & EMPLOYEE FINANCIAL SYSTEM)
-- ============================================================================

-- 1. Struktur Gaji (Salary Structures)
create table if not exists salary_structures (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  payroll_type text not null default 'Bulanan' check(payroll_type in ('Bulanan', 'Mingguan', 'Harian', 'Kustom')),
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Komponen Gaji (Salary Components)
create table if not exists salary_components (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  code text not null,
  name text not null,
  type text not null check(type in ('Pendapatan', 'Potongan')),
  calculation_method text not null check(calculation_method in ('Nominal Tetap', 'Persentase', 'Per Hari', 'Per Jam', 'Rumus')),
  default_amount numeric default 0,
  percentage_rate numeric default 0,
  formula_expression text,
  is_taxable boolean default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3. Hubungan Struktur Gaji dengan Komponen Gaji
create table if not exists salary_structure_components (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid not null references salary_structures(id) on delete cascade,
  component_id uuid not null references salary_components(id) on delete cascade,
  custom_amount numeric,
  sort_order int default 0,
  unique(structure_id, component_id)
);

-- 4. Penugasan Struktur Gaji ke Karyawan
create table if not exists employee_salary_structures (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  structure_id uuid not null references salary_structures(id) on delete cascade,
  effective_date date not null default current_date,
  custom_basic_salary numeric,
  unique(employee_id)
);

-- 5. Aturan Penggajian (Salary & Loan Rules)
create table if not exists salary_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  rule_key text not null,
  rule_name text not null,
  rule_value text not null,
  description text,
  updated_at timestamptz not null default now()
);

-- 6. Periode Penggajian (Payroll Periods)
create table if not exists payroll_periods (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  payroll_type text not null default 'Bulanan' check(payroll_type in ('Bulanan', 'Mingguan', 'Harian', 'Kustom')),
  start_date date not null,
  end_date date not null,
  cutoff_date date not null,
  payment_date date not null,
  total_employees int default 0,
  total_amount numeric default 0,
  status text not null default 'Draft' check(status in (
    'Draft',
    'Perhitungan',
    'Menunggu Pemeriksaan',
    'Menunggu Persetujuan',
    'Disetujui',
    'Menunggu Pembayaran',
    'Sudah Dibayar',
    'Slip Dipublikasikan',
    'Ditutup'
  )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Eksekusi Penggajian (Payroll Runs)
create table if not exists payroll_runs (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references payroll_periods(id) on delete cascade,
  run_number int default 1,
  total_gross numeric default 0,
  total_deductions numeric default 0,
  total_net numeric default 0,
  processed_by uuid references profiles(id),
  processed_at timestamptz not null default now(),
  is_locked boolean not null default false
);

-- 8. Butir Gaji per Karyawan (Payroll Items)
create table if not exists payroll_items (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references payroll_runs(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  basic_salary numeric not null default 0,
  total_earnings numeric not null default 0,
  total_deductions numeric not null default 0,
  net_salary numeric not null default 0,
  work_days int default 22,
  present_days int default 22,
  leave_days int default 0,
  sick_days int default 0,
  permit_days int default 0,
  absent_days int default 0,
  overtime_hours numeric default 0,
  status text not null default 'Selesai' check(status in ('Selesai', 'Perlu Periksa', 'Tertunda', 'Ditolak')),
  notes text,
  created_at timestamptz not null default now()
);

-- 9. Rincian Komponen Butir Gaji (Payroll Item Components)
create table if not exists payroll_item_components (
  id uuid primary key default gen_random_uuid(),
  payroll_item_id uuid not null references payroll_items(id) on delete cascade,
  component_id uuid references salary_components(id),
  component_code text not null,
  component_name text not null,
  type text not null check(type in ('Pendapatan', 'Potongan')),
  amount numeric not null default 0,
  calculation_source text
);

-- 10. Slip Gaji Resmi (Payslips)
create table if not exists payslips (
  id uuid primary key default gen_random_uuid(),
  payroll_item_id uuid not null references payroll_items(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  period_id uuid not null references payroll_periods(id) on delete cascade,
  payslip_code text not null unique,
  verification_code text not null,
  is_published boolean not null default false,
  published_at timestamptz,
  viewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 11. Pengajuan Pinjaman Karyawan (Loan Requests)
create table if not exists loan_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  amount numeric not null check(amount > 0),
  tenor_months int not null check(tenor_months > 0),
  monthly_installment numeric not null check(monthly_installment > 0),
  purpose text not null,
  attachment_url text,
  status text not null default 'Menunggu Persetujuan' check(status in ('Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Dibatalkan')),
  manager_approval_status text default 'Menunggu',
  hr_approval_status text default 'Menunggu',
  finance_approval_status text default 'Menunggu',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 12. Pinjaman Karyawan Aktif (Employee Loans)
create table if not exists employee_loans (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references loan_requests(id),
  employee_id uuid not null references employees(id) on delete cascade,
  principal_amount numeric not null,
  tenor_months int not null,
  monthly_installment numeric not null,
  paid_amount numeric not null default 0,
  remaining_amount numeric not null,
  start_period text not null,
  status text not null default 'Aktif' check(status in ('Aktif', 'Lunas', 'Macet', 'Ditangguhkan')),
  created_at timestamptz not null default now()
);

-- 13. Jadwal Cicilan Pinjaman (Loan Installments)
create table if not exists loan_installments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references employee_loans(id) on delete cascade,
  installment_number int not null,
  period_name text not null,
  due_date date not null,
  amount numeric not null,
  status text not null default 'Belum dibayar' check(status in ('Belum dibayar', 'Lunas', 'Lewat Jatuh Tempo')),
  paid_at timestamptz,
  payroll_item_id uuid references payroll_items(id)
);

-- 14. Pembayaran Cicilan Pinjaman (Loan Payments)
create table if not exists loan_payments (
  id uuid primary key default gen_random_uuid(),
  installment_id uuid not null references loan_installments(id) on delete cascade,
  amount numeric not null,
  payment_method text default 'Potong Gaji',
  paid_at timestamptz not null default now(),
  recorded_by uuid references profiles(id)
);

-- 15. Kasbon / Pinjaman Cepat (Cash Advances & Requests)
create table if not exists cash_advances (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  amount numeric not null check(amount > 0),
  purpose text not null,
  deduction_period text not null,
  status text not null default 'Menunggu Persetujuan' check(status in ('Menunggu Persetujuan', 'Disetujui', 'Dipotong Payroll', 'Ditolak', 'Lunas')),
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- 16. Penggantian Biaya (Reimbursement Requests)
create table if not exists reimbursement_requests (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  category text not null check(category in ('Transportasi', 'Makan', 'Perjalanan Dinas', 'Penginapan', 'Operasional', 'Lainnya')),
  title text not null,
  amount numeric not null check(amount > 0),
  transaction_date date not null,
  description text,
  receipt_url text,
  status text not null default 'Menunggu Persetujuan' check(status in ('Menunggu Persetujuan', 'Disetujui Atasan', 'Disetujui HR/Finance', 'Dibayar', 'Ditolak')),
  payout_method text default 'Penggajian' check(payout_method in ('Penggajian', 'Transfer Langsung')),
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- 17. Penyesuaian Penggajian (Payroll Adjustments)
create table if not exists payroll_adjustments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  target_period_id uuid not null references payroll_periods(id) on delete cascade,
  type text not null check(type in ('Pendapatan', 'Potongan')),
  amount numeric not null,
  reason text not null,
  reference_period text,
  status text not null default 'Menunggu' check(status in ('Menunggu', 'Diterapkan', 'Dibatalkan')),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- 18. Alur Persetujuan Penggajian (Payroll Approvals)
create table if not exists payroll_approvals (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references payroll_periods(id) on delete cascade,
  stage_name text not null,
  approver_role text not null,
  approver_name text,
  status text not null default 'Menunggu' check(status in ('Menunggu', 'Disetujui', 'Ditolak')),
  decision_date timestamptz,
  notes text,
  sort_order int default 1
);

-- 19. Batch Pembayaran Gaji (Payment Batches)
create table if not exists payment_batches (
  id uuid primary key default gen_random_uuid(),
  period_id uuid not null references payroll_periods(id) on delete cascade,
  batch_code text not null unique,
  payment_method text not null default 'Transfer Bank' check(payment_method in ('Transfer Bank', 'Tunai', 'Metode Lainnya')),
  total_employees int not null,
  total_amount numeric not null,
  status text not null default 'Diproses' check(status in ('Diproses', 'Selesai', 'Gagal')),
  confirmed_by uuid references profiles(id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

-- 20. Transaksi Pembayaran per Karyawan (Payment Transactions)
create table if not exists payment_transactions (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references payment_batches(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  bank_name text not null,
  account_number text not null,
  account_holder text not null,
  amount numeric not null,
  status text not null default 'Sukses' check(status in ('Sukses', 'Gagal', 'Tertunda')),
  reference_number text
);

-- 21. Log Audit Penggajian (Payroll Audit Logs)
create table if not exists payroll_audit_logs (
  id uuid primary key default gen_random_uuid(),
  period_id uuid references payroll_periods(id) on delete set null,
  employee_id uuid references employees(id) on delete set null,
  action text not null,
  description text not null,
  actor_name text not null,
  actor_role text not null,
  before_value text,
  after_value text,
  reason text,
  created_at timestamptz not null default now()
);

-- 22. Notifikasi Penggajian (Payroll Notifications)
create table if not exists payroll_notifications (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  title text not null,
  message text not null,
  category text not null check(category in ('Slip Gaji', 'Pembayaran', 'Pinjaman', 'Kasbon', 'Penggantian Biaya', 'Sistem')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);




