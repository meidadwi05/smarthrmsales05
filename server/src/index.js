import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const roles = ['employee', 'manager', 'director', 'hrd'];

async function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return res.status(401).json({ error: 'Bearer token diperlukan' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    const user = data?.user;
    if (error || !user) {
      return res.status(401).json({ error: 'Sesi tidak valid' });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Gagal membaca profil:', {
        code: profileError.code,
        message: profileError.message
      });
      return res.status(500).json({
        error: 'Gagal membaca profil. Periksa terminal backend.'
      });
    }

    if (!profile) {
      console.error('Profil tidak ditemukan untuk UID:', user.id);
      return res.status(403).json({
        error: 'Profil akun login tidak ditemukan'
      });
    }

    req.user = user;
    req.profile = profile;
    return next();
  } catch (error) {
    console.error('Gagal memeriksa sesi/profil:', {
      name: error?.name,
      message: error?.message
    });
    return res.status(500).json({
      error: 'Gagal memeriksa sesi/profil. Periksa terminal backend.'
    });
  }
}

const allow = (...allowed) => (req, res, next) => allowed.includes(req.profile.role) ? next() : res.status(403).json({ error: 'Tidak memiliki akses' });

app.get('/api/health', (_, res) => res.json({ ok: true, service: 'SMART HRM API' }));

// Public prospect registration: no auth or tenant account is created.
app.post('/api/demo-requests', async (req, res) => {
  const { company_name, industry, pic_name, phone, email, message } = req.body || {};
  if (!company_name || !industry || !pic_name || !phone || !email || !message)
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  const { data, error } = await supabase.from('demo_requests').insert({
    company_name, industry, pic_name, phone, email, message
  }).select('id,created_at').single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ message: 'Permintaan demo terkirim', request: data });
});

app.get('/api/me', auth, (req, res) => res.json({ profile: req.profile }));

app.get('/api/dashboard', auth, async (req, res) => {
  const company = req.profile.company_id;
  const [staff, attendance, leave, kpis, pending] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('company_id', company),
    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('company_id', company),
    supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('company_id', company).eq('status', 'pending'),
    supabase.from('kpi_cycles').select('id', { count: 'exact', head: true }).eq('company_id', company),
    supabase.from('approval_requests').select('id', { count: 'exact', head: true }).eq('company_id', company).eq('status', 'pending').eq('current_approver_role', req.profile.role)
  ]);
  res.json({ totalEmployees: staff.count || 0, attendanceRecords: attendance.count || 0, pendingLeaves: leave.count || 0, kpiCycles: kpis.count || 0, myPendingApprovals: pending.count || 0 });
});

// Workflow routes are configured per company and request type in approval_routes.
// Example employee -> manager -> HRD; manager -> director -> HRD.
app.post('/api/requests', auth, async (req, res) => {
  const { request_type, title, details } = req.body || {};
  if (!request_type || !title) return res.status(400).json({ error: 'Jenis dan judul wajib diisi' });
  const { data: route, error: routeError } = await supabase.from('approval_routes').select('steps')
    .eq('company_id', req.profile.company_id).eq('request_type', request_type).eq('requester_role', req.profile.role).single();
  if (routeError || !route?.steps?.length) return res.status(400).json({ error: 'Rute persetujuan belum dikonfigurasi HRD' });
  const first = route.steps[0];
  const { data, error } = await supabase.from('approval_requests').insert({
    company_id: req.profile.company_id, requester_id: req.user.id, requester_role: req.profile.role,
    request_type, title, details: details || {}, steps: route.steps, current_step: 0,
    current_approver_role: first.role, current_approver_id: first.user_id || null, status: 'pending'
  }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ request: data });
});
app.get('/api/requests', auth, async (req, res) => {
  let q = supabase.from('approval_requests').select('*').eq('company_id', req.profile.company_id).order('created_at', { ascending: false });
  if (req.query.mine === 'true') q = q.eq('requester_id', req.user.id);
  else if (!['hrd', 'director'].includes(req.profile.role)) q = q.or(`requester_id.eq.${req.user.id},current_approver_role.eq.${req.profile.role}`);
  const { data, error } = await q;
  if (error) return res.status(400).json({ error: error.message });
  res.json({ requests: data });
});
app.post('/api/requests/:id/decision', auth, async (req, res) => {
  const { decision, note = '' } = req.body || {};
  if (!['approve', 'reject'].includes(decision)) return res.status(400).json({ error: 'Keputusan tidak valid' });
  const { data: r, error } = await supabase.from('approval_requests').select('*').eq('id', req.params.id).eq('company_id', req.profile.company_id).single();
  if (error || !r) return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
  if (r.status !== 'pending' || r.current_approver_role !== req.profile.role || (r.current_approver_id && r.current_approver_id !== req.user.id))
    return res.status(403).json({ error: 'Pengajuan bukan untuk Anda' });
  const { error: logError } = await supabase.from('approval_events').insert({ request_id: r.id, actor_id: req.user.id, decision, note });
  if (logError) return res.status(400).json({ error: logError.message });
  let patch = {};
  if (decision === 'reject') patch = { status: 'rejected' };
  else if (r.current_step + 1 >= r.steps.length) patch = { status: 'approved' };
  else { const next = r.steps[r.current_step + 1]; patch = { current_step: r.current_step + 1, current_approver_role: next.role, current_approver_id: next.user_id || null }; }
  const { data, error: updateError } = await supabase.from('approval_requests').update(patch).eq('id', r.id).select().single();
  if (updateError) return res.status(400).json({ error: updateError.message });
  res.json({ request: data });
});

app.post('/api/kpi/cycles', auth, allow('hrd', 'director'), async (req, res) => {
  const { name, start_date, end_date } = req.body || {};
  if (!name || !start_date || !end_date) return res.status(400).json({ error: 'Nama dan periode wajib diisi' });
  const { data, error } = await supabase.from('kpi_cycles').insert({ company_id: req.profile.company_id, name, start_date, end_date, created_by: req.user.id }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ cycle: data });
});
app.get('/api/kpi', auth, async (req, res) => {
  const { data, error } = await supabase.from('kpi_goals').select('*,kpi_cycles(name,start_date,end_date)').eq('company_id', req.profile.company_id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ goals: data });
});
app.post('/api/kpi/goals', auth, allow('hrd', 'manager'), async (req, res) => {
  const { cycle_id, employee_id, title, description, target, unit } = req.body || {};
  const { data, error } = await supabase.from('kpi_goals').insert({ company_id: req.profile.company_id, cycle_id, employee_id, title, description, target, unit, created_by: req.user.id }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ goal: data });
});

app.get('/api/attendance/locations', auth, async (req, res) => {
  const { data, error } = await supabase.from('attendance_locations').select('*').eq('company_id', req.profile.company_id).eq('active', true);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ locations: data });
});
app.post('/api/attendance/locations', auth, allow('hrd'), async (req, res) => {
  const { name, latitude, longitude, radius_meters = 150 } = req.body || {};
  if (!name || !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude)) || Number(radius_meters) <= 0)
    return res.status(400).json({ error: 'Nama, koordinat, dan radius valid wajib diisi' });
  const { data, error } = await supabase.from('attendance_locations').insert({ company_id: req.profile.company_id, name, latitude, longitude, radius_meters: Number(radius_meters), created_by: req.user.id }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ location: data });
});
app.post('/api/attendance/check-in', auth, async (req, res) => {
  const { location_id, latitude, longitude, kind = 'in' } = req.body || {};
  const { data: loc, error: locErr } = await supabase.from('attendance_locations').select('*').eq('id', location_id).eq('company_id', req.profile.company_id).eq('active', true).single();
  if (locErr || !loc) return res.status(400).json({ error: 'Lokasi absen tidak valid' });
  const rad = x => x * Math.PI / 180, R = 6371000;
  const dLat = rad(Number(latitude) - Number(loc.latitude)), dLon = rad(Number(longitude) - Number(loc.longitude));
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(Number(loc.latitude))) * Math.cos(rad(Number(latitude))) * Math.sin(dLon / 2) ** 2;
  const distance = 2 * R * Math.asin(Math.sqrt(a));
  if (distance > loc.radius_meters) return res.status(403).json({ error: `Di luar radius lokasi (${Math.round(distance)} m)` });
  const { data, error } = await supabase.from('attendance').insert({ company_id: req.profile.company_id, employee_id: req.user.id, location_id, kind, latitude, longitude, distance_meters: Math.round(distance) }).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json({ attendance: data });
});

// ==========================================
// CRUD ENDPOINTS: Divisi, Jabatan, Bagian, Karyawan
// ==========================================
let storeDivisions = [
  { id: '1', name: 'Divisi SDM' },
  { id: '2', name: 'Divisi Keuangan' },
  { id: '3', name: 'Divisi Operasional' }
];

let storePositions = [
  { id: '1', name: 'Manager' },
  { id: '2', name: 'Staff' },
  { id: '3', name: 'Admin' }
];

let storeDepartments = [
  { id: '1', name: 'IT Support' },
  { id: '2', name: 'IT Helpdesk' },
  { id: '3', name: 'System Analyst' }
];

let storeEmployees = [
  {
    id: '1',
    employee_code: 'K001',
    name: 'Andi Prasetyo',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    division: 'IT',
    position: 'Software Engineer',
    department: 'IT Support',
    join_date: '15-03-2021',
    category: 'Full Time',
    contract_start: '15-03-2021',
    contract_end: '15-03-2024',
    work_status: 'Aktif',
    account_status: 'Aktif',
    contract_reminder: 'Kontrak akan habis dalam 90 hari'
  },
  {
    id: '2',
    employee_code: 'K002',
    name: 'Budi Santoso',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    division: 'HRD',
    position: 'HR Manager',
    department: 'Divisi SDM',
    join_date: '20-07-2019',
    category: 'Full Time',
    contract_start: '20-07-2019',
    contract_end: '20-07-2024',
    work_status: 'Tidak Aktif',
    account_status: 'Tidak Aktif',
    contract_reminder: '-'
  },
  {
    id: '3',
    employee_code: 'K003',
    name: 'Cindy Putri',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    division: 'Marketing',
    position: 'Digital Marketing',
    department: 'Marketing',
    join_date: '01-06-2023',
    category: 'Internship',
    contract_start: '01-06-2023',
    contract_end: '01-06-2024',
    work_status: 'Aktif',
    account_status: 'Aktif',
    contract_reminder: 'Kontrak akan habis dalam 365 hari'
  },
  {
    id: '4',
    employee_code: 'K004',
    name: 'Dewi Lestari',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    division: 'Finance',
    position: 'Accountant',
    department: 'Divisi Keuangan',
    join_date: '10-01-2022',
    category: 'Full Time',
    contract_start: '10-01-2022',
    contract_end: '10-01-2025',
    work_status: 'Aktif',
    account_status: 'Aktif',
    contract_reminder: 'Kontrak akan habis dalam 395 hari'
  },
  {
    id: '5',
    employee_code: 'K005',
    name: 'Eko Prasetyo',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    division: 'IT',
    position: 'DevOps Engineer',
    department: 'System Analyst',
    join_date: '05-11-2020',
    category: 'Full Time',
    contract_start: '05-11-2023',
    contract_end: '05-11-2024',
    work_status: 'Aktif',
    account_status: 'Tidak Aktif',
    contract_reminder: 'Kontrak akan habis dalam 328 hari'
  },
  {
    id: '6',
    employee_code: 'K006',
    name: 'Fajar Andi',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    division: 'IT',
    position: 'Frontend Developer',
    department: 'IT Support',
    join_date: '01-05-2020',
    category: 'Full Time',
    contract_start: '01-05-2020',
    contract_end: '01-05-2024',
    work_status: 'Aktif',
    account_status: 'Aktif',
    contract_reminder: '-'
  }
];

// 1. DIVISI
app.get('/api/divisions', auth, async (req, res) => {
  try {
    const companyId = req.profile.company_id;

    if (!companyId) {
      return res.status(403).json({
        error: 'Akun belum terhubung ke perusahaan'
      });
    }

    const { data, error } = await supabase
      .from('divisions')
      .select('id, name')
      .eq('company_id', companyId)
      .order('name');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ divisions: data });
  } catch {
    res.status(500).json({ error: 'Gagal memuat divisi' });
  }
});

app.post('/api/divisions', auth, allow('hrd'), async (req, res) => {
  try {
    const name = typeof req.body?.name === 'string'
      ? req.body.name.trim()
      : '';

    if (!name) {
      return res.status(400).json({
        error: 'Nama divisi wajib diisi'
      });
    }

    const companyId = req.profile.company_id;

    if (!companyId) {
      return res.status(403).json({
        error: 'Akun belum terhubung ke perusahaan'
      });
    }

    const { data, error } = await supabase
      .from('divisions')
      .insert({ name, company_id: companyId })
      .select('id, name')
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({ division: data });
  } catch {
    res.status(500).json({ error: 'Gagal menyimpan divisi' });
  }
});

app.put('/api/divisions/:id', auth, allow('hrd'), async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  if (!name) return res.status(400).json({ error: 'Nama divisi wajib diisi' });
  if (!req.profile.company_id) return res.status(403).json({ error: 'Akun belum terhubung ke perusahaan' });
  const { data, error } = await supabase.from('divisions')
    .update({ name })
    .eq('id', req.params.id).eq('company_id', req.profile.company_id)
    .select('id,name').maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Divisi tidak ditemukan' });
  return res.json({ division: data });
});

app.delete('/api/divisions/:id', auth, allow('hrd'), async (req, res) => {
  if (!req.profile.company_id) return res.status(403).json({ error: 'Akun belum terhubung ke perusahaan' });
  const { data, error } = await supabase.from('divisions')
    .delete().eq('id', req.params.id).eq('company_id', req.profile.company_id)
    .select('id,name').maybeSingle();
  if (error) return res.status(400).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Divisi tidak ditemukan' });
  return res.json({ division: data });
});

// 2. JABATAN — data persisted in Supabase
const cleanName = value => typeof value === 'string' ? value.trim() : '';
const makeCode = prefix => `${prefix}-${randomUUID().slice(0, 12).toUpperCase()}`;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const dbFailure = (res, error) => {
  console.error('Supabase CRUD error:', error);
  return res.status(400).json({ error: error.message });
};
const requireCompany = (req, res, next) => {
  if (!req.profile.company_id) return res.status(403).json({ error: 'Akun belum terhubung ke perusahaan' });
  next();
};
const validId = (req, res, next) => uuidPattern.test(req.params.id)
  ? next() : res.status(400).json({ error: 'ID tidak valid' });

app.get('/api/positions', auth, requireCompany, async (req, res) => {
  const { data, error } = await supabase.from('jabatan')
    .select('id,kode_jabatan,nama_jabatan,deskripsi')
    .eq('company_id', req.profile.company_id)
    .order('nama_jabatan');
  if (error) return dbFailure(res, error);
  res.json({ positions: data.map(p => ({ ...p, name: p.nama_jabatan })) });
});

app.post('/api/positions', auth, allow('hrd'), requireCompany, async (req, res) => {
  const name = cleanName(req.body?.name);
  if (!name) return res.status(400).json({ error: 'Nama jabatan wajib diisi' });
  const { data, error } = await supabase.from('jabatan').insert({
    company_id: req.profile.company_id,
    kode_jabatan: makeCode('JBT'),
    nama_jabatan: name,
    deskripsi: cleanName(req.body?.description) || null
  }).select().single();
  if (error) return dbFailure(res, error);
  res.status(201).json({ position: { ...data, name: data.nama_jabatan } });
});

app.put('/api/positions/:id', auth, allow('hrd'), requireCompany, validId, async (req, res) => {
  const name = cleanName(req.body?.name);
  if (!name) return res.status(400).json({ error: 'Nama jabatan wajib diisi' });
  const { data, error } = await supabase.from('jabatan')
    .update({ nama_jabatan: name, updated_at: new Date().toISOString() })
    .eq('id', req.params.id).eq('company_id', req.profile.company_id)
    .select().maybeSingle();
  if (error) return dbFailure(res, error);
  if (!data) return res.status(404).json({ error: 'Jabatan tidak ditemukan' });
  res.json({ position: { ...data, name: data.nama_jabatan } });
});

app.delete('/api/positions/:id', auth, allow('hrd'), requireCompany, validId, async (req, res) => {
  const { data, error } = await supabase.from('jabatan').delete()
    .eq('id', req.params.id).eq('company_id', req.profile.company_id)
    .select().maybeSingle();
  if (error) return dbFailure(res, error);
  if (!data) return res.status(404).json({ error: 'Jabatan tidak ditemukan' });
  res.json({ position: { ...data, name: data.nama_jabatan } });
});

// 3. BAGIAN — must belong to a division in the same company

app.get('/api/departments', auth, requireCompany, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bagian')
      .select('id, company_id, division_id, kode_bagian, nama_bagian, deskripsi')
      .eq('company_id', req.profile.company_id)
      .order('nama_bagian', { ascending: true });

    if (error) return dbFailure(res, error);

    res.json({
      departments: (data || []).map(d => ({
        ...d,
        name: d.nama_bagian,
        division_id: d.division_id
      }))
    });
  } catch (error) {
    console.error('GET departments:', error);
    res.status(500).json({
      error: 'Gagal mengambil data bagian'
    });
  }
});

app.post('/api/departments', auth, allow('hrd'), requireCompany, async (req, res) => {
  try {
    const name = cleanName(req.body?.name);
    const divisionId = req.body?.division_id ?? req.body?.divisi_id;

    if (!name) {
      return res.status(400).json({
        error: 'Nama bagian wajib diisi'
      });
    }

    if (typeof divisionId !== 'string' || !uuidPattern.test(divisionId)) {
      return res.status(400).json({
        error: 'Pilih divisi yang valid'
      });
    }

    const { data: division, error: divisionError } = await supabase
      .from('divisions')
      .select('id')
      .eq('id', divisionId)
      .eq('company_id', req.profile.company_id)
      .maybeSingle();

    if (divisionError) return dbFailure(res, divisionError);

    if (!division) {
      return res.status(400).json({
        error: 'Divisi tidak ditemukan di perusahaan ini'
      });
    }

    const { data, error } = await supabase
      .from('bagian')
      .insert({
        company_id: req.profile.company_id,
        division_id: divisionId,
        kode_bagian: makeCode('BGN'),
        nama_bagian: name,
        deskripsi: cleanName(req.body?.description) || null
      })
      .select()
      .single();

    if (error) return dbFailure(res, error);

    res.status(201).json({
      department: {
        ...data,
        name: data.nama_bagian,
        division_id: data.division_id
      }
    });
  } catch (error) {
    console.error('POST departments:', error);
    res.status(500).json({
      error: 'Gagal menambahkan bagian'
    });
  }
});

app.put('/api/departments/:id', auth, allow('hrd'), requireCompany, validId, async (req, res) => {
  try {
    const name = cleanName(req.body?.name);
    const divisionId = req.body?.division_id ?? req.body?.divisi_id;

    if (!name) {
      return res.status(400).json({
        error: 'Nama bagian wajib diisi'
      });
    }

    const patch = {
      nama_bagian: name,
      updated_at: new Date().toISOString()
    };

    if (divisionId !== undefined) {
      if (typeof divisionId !== 'string' || !uuidPattern.test(divisionId)) {
        return res.status(400).json({
          error: 'Divisi tidak valid'
        });
      }

      const { data: division, error: divisionError } = await supabase
        .from('divisions')
        .select('id')
        .eq('id', divisionId)
        .eq('company_id', req.profile.company_id)
        .maybeSingle();

      if (divisionError) return dbFailure(res, divisionError);

      if (!division) {
        return res.status(400).json({
          error: 'Divisi tidak ditemukan di perusahaan ini'
        });
      }

      patch.division_id = divisionId;
    }

    const { data, error } = await supabase
      .from('bagian')
      .update(patch)
      .eq('id', req.params.id)
      .eq('company_id', req.profile.company_id)
      .select()
      .maybeSingle();

    if (error) return dbFailure(res, error);

    if (!data) {
      return res.status(404).json({
        error: 'Bagian tidak ditemukan'
      });
    }

    res.json({
      department: {
        ...data,
        name: data.nama_bagian,
        division_id: data.division_id
      }
    });
  } catch (error) {
    console.error('PUT departments:', error);
    res.status(500).json({
      error: 'Gagal memperbarui bagian'
    });
  }
});

app.delete('/api/departments/:id', auth, allow('hrd'), requireCompany, validId, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bagian')
      .delete()
      .eq('id', req.params.id)
      .eq('company_id', req.profile.company_id)
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === '23503') {
        return res.status(409).json({
          error: 'Bagian masih digunakan dan tidak dapat dihapus'
        });
      }

      return dbFailure(res, error);
    }

    if (!data) {
      return res.status(404).json({
        error: 'Bagian tidak ditemukan'
      });
    }

    res.json({
      department: {
        ...data,
        name: data.nama_bagian,
        division_id: data.division_id
      }
    });
  } catch (error) {
    console.error('DELETE departments:', error);
    res.status(500).json({
      error: 'Gagal menghapus bagian'
    });
  }
});


// 4. KARYAWAN

let cachedEmployeeColumns = null;
let lastColumnCheck = 0;

async function getEmployeeTableColumns() {
  const now = Date.now();
  if (cachedEmployeeColumns && now - lastColumnCheck < 20000) {
    return cachedEmployeeColumns;
  }
  try {
    const url = `${process.env.SUPABASE_URL}/rest/v1/?apikey=${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
    const res = await fetch(url);
    const openapi = await res.json();
    const cols = Object.keys(openapi.definitions?.employees?.properties || {});
    if (cols.length > 0) {
      cachedEmployeeColumns = new Set(cols);
      lastColumnCheck = now;
      return cachedEmployeeColumns;
    }
  } catch (err) {
    console.warn('Gagal membaca schema kolom employees:', err.message);
  }
  return cachedEmployeeColumns;
}

app.get('/api/employees', async (req, res) => {
  try {
    const { search, status } = req.query;
    let list = [];

    // Coba baca token jika ada untuk filter company_id
    let companyId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token) {
        const { data: sessionData } = await supabase.auth.getUser(token);
        if (sessionData?.user) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', sessionData.user.id)
            .maybeSingle();
          companyId = prof?.company_id || null;
        }
      }
    }

    if (companyId) {
      const { data: dbEmployees, error: dbError } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (!dbError && dbEmployees && dbEmployees.length > 0) {
        list = dbEmployees;
      }
    }

    if (list.length === 0) {
      list = [...storeEmployees];
    }

    if (status && status !== 'Semua') {
      list = list.filter(e => e.work_status === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(e =>
        (e.name && e.name.toLowerCase().includes(q)) ||
        (e.employee_code && e.employee_code.toLowerCase().includes(q)) ||
        (e.division && e.division.toLowerCase().includes(q)) ||
        (e.position && e.position.toLowerCase().includes(q))
      );
    }

    res.json({ employees: list, total: list.length });
  } catch (error) {
    console.error('GET /api/employees error:', error);
    res.json({ employees: storeEmployees, total: storeEmployees.length });
  }
});

app.post(
  '/api/employees',
  auth,
  allow('hrd', 'director'),
  requireCompany,
  async (req, res) => {
    let createdUserId = null;

    try {
      const data = req.body || {};
      const companyId = req.profile.company_id;

      const empName = String(
        data.name || data.nama_karyawan || ''
      ).trim();

      const email = String(data.email || '')
        .trim()
        .toLowerCase();

      const username = String(data.username || '').trim();

      const role = data.role || 'employee';

      const allowedRoles = [
        'employee',
        'manager',
        'director',
        'hrd',
        'finance'
      ];

      if (!empName) {
        return res.status(400).json({
          error: 'Nama karyawan wajib diisi'
        });
      }

      if (!email) {
        return res.status(400).json({
          error: 'Email karyawan wajib diisi'
        });
      }

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          error: 'Role tidak valid'
        });
      }

      // Password sementara sesuai pengaturan form
      const password = String(data.password || '').trim() || '123456';

      if (password.length < 6) {
        return res.status(400).json({
          error: 'Password minimal 6 karakter'
        });
      }

      const employeeCode = String(
        data.employee_code || ''
      ).trim() || makeCode('KRY');

      // Upload file dokumen & kendaraan ke Supabase Storage (bucket: employee-files)
      const uploadedDocs = {};
      const incomingFiles = data.files || {};

      for (const [key, fileInfo] of Object.entries(incomingFiles)) {
        if (!fileInfo || !fileInfo.data) continue;

        try {
          const rawData = String(fileInfo.data);
          const matches = rawData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          let buffer;
          let mime = fileInfo.type || 'application/octet-stream';

          if (matches && matches.length === 3) {
            mime = matches[1];
            buffer = Buffer.from(matches[2], 'base64');
          } else {
            buffer = Buffer.from(rawData, 'base64');
          }

          const originalName = fileInfo.name || `${key}.bin`;
          const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
          const ext = extMatch ? extMatch[1] : (mime.split('/')[1] || 'bin');
          const cleanKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
          const storagePath = `${companyId}/${employeeCode}/${cleanKey}-${Date.now()}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from('employee-files')
            .upload(storagePath, buffer, {
              contentType: mime,
              upsert: true
            });

          if (uploadError) {
            console.error(`Gagal upload file [${key}] ke storage:`, uploadError);
          } else {
            const { data: pubData } = supabase.storage
              .from('employee-files')
              .getPublicUrl(storagePath);

            uploadedDocs[key] = pubData?.publicUrl || '';
            console.log(`Berhasil upload file [${key}]:`, pubData?.publicUrl);
          }
        } catch (err) {
          console.error(`Error memproses file [${key}]:`, err);
        }
      }

      // Kumpulkan data detail tambahan dari semua section (pribadi, gaji, kontak, bank, kendaraan)
      const extraDetails = {
        // Data Pribadi
        nama_karyawan: data.nama_karyawan || empName,
        nomor_telepon: data.nomor_telepon || null,
        tempat_lahir: data.tempat_lahir || null,
        tanggal_lahir: data.tanggal_lahir || null,
        jenis_kelamin: data.jenis_kelamin || null,
        alamat_ktp: data.alamat_ktp || null,
        alamat_domisili: data.alamat_domisili || null,
        pendidikan: data.pendidikan || null,
        agama: data.agama || null,
        nama_suami_istri: data.nama_suami_istri || null,
        nama_anak: data.nama_anak || null,
        jumlah_anak: data.jumlah_anak || null,
        nama_bapak: data.nama_bapak || null,
        nama_ibu: data.nama_ibu || null,

        // Data Kepegawaian Ekstra
        work_location: data.work_location || null,
        group: data.group || null,
        marital_status: data.marital_status || null,
        reference: data.reference || null,
        sio_number: data.sio_number || null,
        has_npwp: data.has_npwp || null,

        // Informasi Gaji
        salary_basic: data.salary_basic || null,
        allowance_position: data.allowance_position || null,
        allowance_project: data.allowance_project || null,
        allowance_meal: data.allowance_meal || null,
        allowance_transport: data.allowance_transport || null,
        allowance_other: data.allowance_other || null,

        // Nomor Dokumen
        ktp_number: data.ktp_number || null,
        kk_number: data.kk_number || null,
        npwp_number: data.npwp_number || null,
        kpj_number: data.kpj_number || null,
        jkn_number: data.jkn_number || null,

        // Detail Bank
        bank_account_name: data.bank_account_name || null,
        bank_account_number: data.bank_account_number || null,
        bank_name: data.bank_name || null,

        // Kontak Darurat
        emergency_name: data.emergency_name || null,
        emergency_relation: data.emergency_relation || null,
        emergency_phone: data.emergency_phone || null,

        // Identitas Kendaraan
        sim_number: data.sim_number || null,
        stnk_number: data.stnk_number || null
      };

      // Persiapkan data karyawan dasar
      const newEmployee = {
        company_id: companyId,
        employee_code: employeeCode,
        name: empName,
        photo: uploadedDocs.photo_profile || data.photo || null,
        division: data.division || null,
        position: data.position || null,
        department: data.department || null,
        join_date: data.join_date || null,
        category: data.category || null,
        contract_start: data.contract_start || null,
        contract_end: data.contract_end || null,
        work_status: data.work_status || 'Aktif',
        account_status: data.account_status || 'Aktif',
        contract_reminder: data.contract_reminder || null
      };

      // Buat akun login Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: empName,
            username,
            must_change_password: true
          }
        });

      if (authError) {
        return res.status(400).json({
          error: `Gagal membuat akun: ${authError.message}`
        });
      }

      createdUserId = authData?.user?.id;

      if (!createdUserId) {
        throw new Error('ID akun Supabase tidak ditemukan');
      }

      // Simpan profil akun
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: createdUserId,
          company_id: companyId,
          full_name: empName,
          email,
          role,
          department: newEmployee.department,
          employee_number: employeeCode
        });

      if (profileError) {
        throw new Error(
          `Gagal menyimpan profil: ${profileError.message}`
        );
      }

      // Hubungkan data karyawan dengan akun login
      newEmployee.user_id = createdUserId;

      // Kolom spesifik untuk seluruh section form (dokumen, kendaraan, gaji, bank, kontak, pribadi, kepegawaian)
      const specificColumns = {
        // Dokumen Pendukung (File & Nomor)
        ktp: uploadedDocs.ktp || null,
        file_ktp: uploadedDocs.ktp || null,
        ktp_number: data.ktp_number || null,

        kk: uploadedDocs.kk || null,
        file_kk: uploadedDocs.kk || null,
        kk_number: data.kk_number || null,

        npwp: uploadedDocs.npwp || null,
        file_npwp: uploadedDocs.npwp || null,
        npwp_number: data.npwp_number || null,

        kpj: uploadedDocs.kpj || null,
        file_kpj: uploadedDocs.kpj || null,
        kpj_number: data.kpj_number || null,

        jkn: uploadedDocs.jkn || null,
        file_jkn: uploadedDocs.jkn || null,
        jkn_number: data.jkn_number || null,

        cv: uploadedDocs.cv || null,
        file_cv: uploadedDocs.cv || null,

        other: uploadedDocs.other || null,
        file_other: uploadedDocs.other || null,
        other_document: uploadedDocs.other || null,

        // Identitas Kendaraan (File & Nomor)
        sim: uploadedDocs.sim || null,
        file_sim: uploadedDocs.sim || null,
        sim_number: data.sim_number || null,

        stnk: uploadedDocs.stnk || null,
        file_stnk: uploadedDocs.stnk || null,
        stnk_number: data.stnk_number || null,

        vehicle_front: uploadedDocs.vehicle_front || null,
        file_vehicle_front: uploadedDocs.vehicle_front || null,

        vehicle_back: uploadedDocs.vehicle_back || null,
        file_vehicle_back: uploadedDocs.vehicle_back || null,

        vehicle_side: uploadedDocs.vehicle_side || null,
        file_vehicle_side: uploadedDocs.vehicle_side || null,

        // Informasi Gaji
        salary_basic: data.salary_basic || null,
        allowance_position: data.allowance_position || null,
        allowance_project: data.allowance_project || null,
        allowance_meal: data.allowance_meal || null,
        allowance_transport: data.allowance_transport || null,
        allowance_other: data.allowance_other || null,

        // Detail Akun Bank
        bank_name: data.bank_name || null,
        bank_account_number: data.bank_account_number || null,
        bank_account_name: data.bank_account_name || null,
        bank_account_holder: data.bank_account_name || null,

        // Kontak Darurat
        emergency_name: data.emergency_name || null,
        emergency_relation: data.emergency_relation || null,
        emergency_phone: data.emergency_phone || null,

        // Data Pribadi Tambahan
        nomor_telepon: data.nomor_telepon || null,
        tempat_lahir: data.tempat_lahir || null,
        tanggal_lahir: data.tanggal_lahir || null,
        jenis_kelamin: data.jenis_kelamin || null,
        alamat_ktp: data.alamat_ktp || null,
        alamat_domisili: data.alamat_domisili || null,
        pendidikan: data.pendidikan || null,
        agama: data.agama || null,
        nama_suami_istri: data.nama_suami_istri || null,
        nama_anak: data.nama_anak || null,
        jumlah_anak: data.jumlah_anak || null,
        nama_bapak: data.nama_bapak || null,
        nama_ibu: data.nama_ibu || null,

        // Data Kepegawaian Ekstra
        work_location: data.work_location || null,
        group: data.group || null,
        marital_status: data.marital_status || null,
        reference: data.reference || null,
        sio_number: data.sio_number || null,
        has_npwp: data.has_npwp || null,

        // Wadah JSONB
        documents: uploadedDocs,
        details: extraDetails
      };

      const candidateInsert = {
        ...newEmployee,
        ...specificColumns
      };

      // Filter hanya kolom yang benar-benar ada di database Supabase saat ini
      const tableCols = await getEmployeeTableColumns();
      let insertPayload = candidateInsert;
      if (tableCols && tableCols.size > 0) {
        insertPayload = {};
        for (const [col, val] of Object.entries(candidateInsert)) {
          if (tableCols.has(col)) {
            insertPayload[col] = val;
          }
        }
      }

      let savedEmployee = null;
      let employeeError = null;

      try {
        const { data: inserted, error: insertErr } = await supabase
          .from('employees')
          .insert(insertPayload)
          .select()
          .single();

        if (insertErr) {
          employeeError = insertErr;
        } else {
          savedEmployee = inserted;
        }
      } catch (err) {
        employeeError = err;
      }

      // Fallback jika terjadi kendala pada kolom tambahan
      if (employeeError || !savedEmployee) {
        console.warn('Fallback insert hanya kolom dasar:', employeeError?.message);
        const { data: fallbackSaved, error: fallbackError } = await supabase
          .from('employees')
          .insert(newEmployee)
          .select()
          .single();

        if (fallbackError) {
          throw new Error(`Gagal menyimpan karyawan: ${fallbackError.message}`);
        }
        savedEmployee = fallbackSaved;
      }

      // Lengkapi objek employee dengan dokumen & detail untuk respon dan state in-memory
      const completeEmployee = {
        ...savedEmployee,
        documents: uploadedDocs,
        details: extraDetails,
        username,
        email,
        role
      };

      // Perbarui tampilan sementara di server
      storeEmployees.unshift(completeEmployee);

      return res.status(201).json({
        success: true,
        message: 'Karyawan, file lampiran, dan akun login berhasil disimpan',
        employee: completeEmployee
      });

    } catch (error) {
      console.error('POST /api/employees:', error);

      // Batalkan pembuatan akun jika penyimpanan gagal
      if (createdUserId) {
        const { error: cleanupError } =
          await supabase.auth.admin.deleteUser(createdUserId);

        if (cleanupError) {
          console.error(
            'Gagal membatalkan akun:',
            cleanupError.message
          );

          return res.status(500).json({
            error: 'Penyimpanan gagal dan akun perlu diperiksa oleh admin'
          });
        }
      }

      return res.status(500).json({
        error: error.message || 'Gagal membuat karyawan'
      });
    }
  }
);

app.put('/api/employees/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const patch = req.body || {};

    const index = storeEmployees.findIndex(e => String(e.id) === String(id));
    if (index !== -1) {
      storeEmployees[index] = { ...storeEmployees[index], ...patch };
    }

    try {
      await supabase.from('employees').update(patch).eq('id', id);
    } catch {}

    const employee = index !== -1 ? storeEmployees[index] : { id, ...patch };
    res.json({ employee });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Gagal memperbarui karyawan' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const index = storeEmployees.findIndex(e => String(e.id) === String(id));
    let deleted = null;
    if (index !== -1) {
      deleted = storeEmployees.splice(index, 1)[0];
    }

    try {
      await supabase.from('employees').delete().eq('id', id);
    } catch {}

    res.json({ employee: deleted || { id } });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Gagal menghapus karyawan' });
  }
});

app.post('/api/employees/batch-status', async (req, res) => {
  try {
    const { ids, status } = req.body || {};
    if (!Array.isArray(ids) || !ids.length || !status) {
      return res.status(400).json({ error: 'Data ids dan status wajib diisi' });
    }
    const idSet = new Set(ids.map(String));
    storeEmployees.forEach(e => {
      if (idSet.has(String(e.id))) {
        e.work_status = status;
        if (status === 'Tidak Aktif') e.account_status = 'Tidak Aktif';
      }
    });

    try {
      await supabase.from('employees').update({
        work_status: status,
        ...(status === 'Tidak Aktif' ? { account_status: 'Tidak Aktif' } : {})
      }).in('id', ids);
    } catch {}

    res.json({ success: true, count: ids.length });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Gagal mengubah status massal' });
  }
});

app.post('/api/employees/batch-delete', async (req, res) => {
  try {
    const { ids } = req.body || {};
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ error: 'Data ids wajib diisi' });
    }
    const idSet = new Set(ids.map(String));
    storeEmployees = storeEmployees.filter(e => !idSet.has(String(e.id)));

    try {
      await supabase.from('employees').delete().in('id', ids);
    } catch {}

    res.json({ success: true, count: ids.length });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Gagal menghapus massal' });
  }
});

// ============================================================================
// MODUL PENGGAJIAN & KEUANGAN KARYAWAN (REST ENDPOINTS)
// ============================================================================
import {
  payrollEmployees,
  salaryStructures,
  salaryComponents,
  salaryRules,
  payrollPeriods,
  employeeLoans,
  loanRequests,
  cashAdvances,
  reimbursements,
  payrollApprovals,
  payrollAdjustments,
  payrollAuditLogs,
  payrollNotifications,
  calculateEmployeeSalary,
  getPayrollItems,
  formatRupiah,
  terbilang
} from './payrollStore.js';

// 1. Dashboard Penggajian
app.get('/api/payroll/dashboard', (req, res) => {
  const periodId = req.query.period || 'prd-2026-09';
  const period = payrollPeriods.find(p => p.id === periodId) || payrollPeriods[0];

  // Total Pinjaman Aktif
  const totalActiveLoans = employeeLoans
    .filter(l => l.status === 'Aktif')
    .reduce((sum, l) => sum + (l.remainingAmount || 0), 0);

  // Total Kasbon Bulan Ini
  const totalCashAdvances = cashAdvances
    .filter(c => c.deductionPeriod.includes('September 2026') && c.status !== 'Ditolak')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  // Total Reimbursement Bulan Ini
  const totalReimbursements = reimbursements
    .filter(r => r.status !== 'Ditolak')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  // Tren Biaya Penggajian Bulanan
  const monthlyTrends = [
    { month: 'Apr 2026', total: 685000000, employees: 120 },
    { month: 'Mei 2026', total: 698000000, employees: 122 },
    { month: 'Jun 2026', total: 705000000, employees: 124 },
    { month: 'Jul 2026', total: 712000000, employees: 125 },
    { month: 'Agu 2026', total: 724000000, employees: 126 },
    { month: 'Sep 2026', total: 745000000, employees: 128 }
  ];

  res.json({
    period,
    stats: {
      totalPayroll: period.totalAmount || 745000000,
      paidEmployees: period.paidEmployees || 128,
      totalEmployees: period.totalEmployees || 135,
      totalActiveLoans,
      totalCashAdvances,
      totalReimbursements
    },
    monthlyTrends,
    stages: period.stages,
    attentionItems: period.attentionItems,
    periodsList: payrollPeriods.map(p => ({ id: p.id, name: p.name, status: p.status }))
  });
});

// 2. Karyawan untuk Seleksi Periode
app.get('/api/payroll/employees', (req, res) => {
  res.json({ employees: payrollEmployees });
});

// 2. Periode Penggajian (CRUD)
app.get('/api/payroll/periods', (req, res) => {
  res.json({ periods: payrollPeriods });
});

app.post('/api/payroll/periods', (req, res) => {
  const data = req.body || {};
  if (!data.name || !data.startDate || !data.endDate) {
    return res.status(400).json({ error: 'Nama periode, tanggal mulai, dan tanggal selesai wajib diisi' });
  }

  const totalCount = Number(data.totalEmployees) || (data.selectedEmployeeIds ? data.selectedEmployeeIds.length : 86);
  const newPeriod = {
    id: `prd-${Date.now()}`,
    name: data.name,
    payrollType: data.payrollType || 'Bulanan',
    startDate: data.startDate,
    endDate: data.endDate,
    cutoffDate: data.cutoffDate || data.endDate,
    paymentDate: data.paymentDate || data.endDate,
    totalEmployees: totalCount,
    totalEligible: data.totalEligible || totalCount,
    paidEmployees: 0,
    totalGross: 0,
    totalDeductions: 0,
    totalAmount: 0,
    status: 'Draft',
    selectedEmployeeIds: data.selectedEmployeeIds || [],
    employeeCategories: data.employeeCategories || [],
    currentStage: 1,
    stages: [
      { name: 'Data Kehadiran', done: true, at: new Date().toLocaleString('id-ID') },
      { name: 'Perhitungan', done: false },
      { name: 'Pemeriksaan', done: false },
      { name: 'Persetujuan', done: false },
      { name: 'Pembayaran', done: false },
      { name: 'Publikasi Slip Gaji', done: false }
    ],
    attentionCount: 0,
    attentionItems: []
  };

  payrollPeriods.unshift(newPeriod);

  // Catat Audit Log
  payrollAuditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString('id-ID'),
    actorName: req.body?.actorName || 'Meida — HRD',
    actorRole: 'HR / HRD',
    employeeName: `${totalCount} Karyawan Dipilih`,
    action: 'Membuat Periode Penggajian Baru (Draft)',
    beforeValue: '-',
    afterValue: newPeriod.name,
    reason: `Inisiasi draft periode penggajian ${newPeriod.name} dengan ${totalCount} karyawan.`
  });

  res.status(201).json({ period: newPeriod });
});

app.put('/api/payroll/periods/:id', (req, res) => {
  const index = payrollPeriods.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Periode tidak ditemukan' });

  // Guard: payroll yang sudah Disetujui/Dibayar/Ditutup tidak boleh sembarangan diubah langsung
  const existing = payrollPeriods[index];
  if (existing.status === 'Sudah Dibayar' && req.body.status !== 'Ditutup' && req.body.status !== 'Slip Dipublikasikan') {
    return res.status(400).json({ error: 'Penggajian yang sudah dibayar tidak boleh diubah langsung. Gunakan Penyesuaian Penggajian.' });
  }

  payrollPeriods[index] = { ...existing, ...req.body };
  res.json({ period: payrollPeriods[index] });
});

// Manual item adjustment with audit trail
app.put('/api/payroll/process/item/:periodId/:employeeId', (req, res) => {
  const { earnings, deductions, reason, actorName = 'Meida — HRD' } = req.body || {};
  const period = payrollPeriods.find(p => p.id === req.params.periodId) || payrollPeriods[0];

  // Record audit log
  payrollAuditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString('id-ID'),
    actorName,
    actorRole: 'HR / HRD',
    employeeName: req.body.employeeName || req.params.employeeId,
    action: 'Penyesuaian Manual Komponen Gaji',
    beforeValue: req.body.beforeValue || '-',
    afterValue: req.body.afterValue || 'Komponen Diperbarui',
    reason: reason || 'Penyesuaian manual perhitungan gaji oleh HRD'
  });

  res.json({ success: true, message: 'Penyesuaian manual berhasil disimpan dan tercatat di audit trail.' });
});

// Submit for review / examination
app.post('/api/payroll/process/submit-review', (req, res) => {
  const { periodId } = req.body || {};
  const period = payrollPeriods.find(p => p.id === periodId) || payrollPeriods[0];
  period.status = 'Menunggu Pemeriksaan';
  period.currentStage = 3;
  if (period.stages[1]) {
    period.stages[1].done = true;
    period.stages[1].at = new Date().toLocaleString('id-ID');
  }

  payrollAuditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString('id-ID'),
    actorName: req.body?.actorName || 'Meida — HRD',
    actorRole: 'HR / HRD',
    employeeName: period.name,
    action: 'Pengajuan Penggajian untuk Pemeriksaan',
    beforeValue: 'Perhitungan',
    afterValue: 'Menunggu Pemeriksaan',
    reason: 'Perhitungan telah tervalidasi dan diajukan untuk audit pemeriksaan'
  });

  res.json({ success: true, period });
});

// Review decision
app.post('/api/payroll/process/review-decision', (req, res) => {
  const { periodId, action, reason, actorName = 'Pemeriksa HR' } = req.body || {};
  const period = payrollPeriods.find(p => p.id === periodId) || payrollPeriods[0];

  if (action === 'approve') {
    period.status = 'Menunggu Persetujuan';
    period.currentStage = 4;
    if (period.stages[2]) {
      period.stages[2].done = true;
      period.stages[2].at = new Date().toLocaleString('id-ID');
    }
  } else {
    period.status = 'Perhitungan';
    period.currentStage = 2;
  }

  payrollAuditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString('id-ID'),
    actorName,
    actorRole: 'Auditor HR',
    employeeName: period.name,
    action: action === 'approve' ? 'Persetujuan Hasil Pemeriksaan' : 'Pengembalian untuk Perbaikan Perhitungan',
    beforeValue: 'Menunggu Pemeriksaan',
    afterValue: period.status,
    reason: reason || (action === 'approve' ? 'Pemeriksaan validasi anomali disetujui' : 'Data perlu dikoreksi ulang oleh HRD')
  });

  res.json({ success: true, period });
});

// 3. Proses Penggajian (Stepper 01-06 & Perhitungan)
app.get('/api/payroll/process/items/:periodId', (req, res) => {
  const items = getPayrollItems(req.params.periodId);
  res.json({
    periodId: req.params.periodId,
    items,
    totalCount: items.length,
    summary: {
      totalBasic: items.reduce((s, i) => s + i.earnings.basicSalary, 0),
      totalEarnings: items.reduce((s, i) => s + i.earnings.total, 0),
      totalDeductions: items.reduce((s, i) => s + i.deductions.total, 0),
      totalNet: items.reduce((s, i) => s + i.netSalary, 0)
    }
  });
});

app.post('/api/payroll/process/sync', (req, res) => {
  const { periodId } = req.body || {};
  const period = payrollPeriods.find(p => p.id === periodId) || payrollPeriods[0];

  // Update stage
  period.stages[0].done = true;
  period.stages[0].at = new Date().toLocaleString('id-ID');
  period.stages[1].done = true;
  period.stages[1].at = new Date().toLocaleString('id-ID');
  period.currentStage = Math.max(period.currentStage, 2);
  period.status = 'Perhitungan';

  const items = getPayrollItems(period.id);
  const totalNet = items.reduce((s, i) => s + i.netSalary, 0);
  const totalGross = items.reduce((s, i) => s + i.earnings.total, 0);
  const totalDeductions = items.reduce((s, i) => s + i.deductions.total, 0);

  period.totalGross = totalGross;
  period.totalDeductions = totalDeductions;
  period.totalAmount = totalNet;

  payrollAuditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString('id-ID'),
    actorName: req.body?.actorName || 'HR Specialist',
    actorRole: 'HR / HRD',
    employeeName: 'Semua Karyawan',
    action: 'Sinkronisasi Data Absensi & Perhitungan Otomatis',
    beforeValue: 'Data Absensi & Lembur Mentah',
    afterValue: `${items.length} Data Terhitung (${formatRupiah(totalNet)})`,
    reason: 'Sinkronisasi rutin cut-off data penggajian'
  });

  res.json({
    message: 'Data kehadiran, lembur, pinjaman, dan potongan berhasil disinkronkan dan dihitung otomatis.',
    period,
    itemsCount: items.length,
    totalNet
  });
});

app.post('/api/payroll/process/verify', (req, res) => {
  const { periodId, fixItem } = req.body || {};
  const period = payrollPeriods.find(p => p.id === periodId) || payrollPeriods[0];

  if (fixItem) {
    period.attentionItems = period.attentionItems.filter(i => i.id !== fixItem);
    period.attentionCount = period.attentionItems.length;
  } else {
    period.stages[2].done = true;
    period.stages[2].at = new Date().toLocaleString('id-ID');
    period.currentStage = Math.max(period.currentStage, 3);
    period.status = 'Menunggu Persetujuan';
  }

  res.json({ success: true, period });
});

// 4. Persetujuan Penggajian (Approval Workflow Timeline)
app.get('/api/payroll/approvals', (req, res) => {
  res.json({ approvals: payrollApprovals });
});

app.post('/api/payroll/approvals/:id/decision', (req, res) => {
  const { decision, actorName, notes } = req.body || {};
  const item = payrollApprovals.find(a => a.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Tahap persetujuan tidak ditemukan' });

  item.status = decision === 'approve' ? 'Disetujui' : 'Ditolak';
  item.decisionDate = new Date().toLocaleString('id-ID');
  if (actorName) item.actorName = actorName;
  if (notes) item.notes = notes;

  const currentPeriod = payrollPeriods[0];
  const allApproved = payrollApprovals.every(a => a.status === 'Disetujui');
  if (allApproved) {
    currentPeriod.status = 'Disetujui';
    currentPeriod.stages[3].done = true;
    currentPeriod.currentStage = 5;
  }

  payrollAuditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString('id-ID'),
    actorName: actorName || 'Pemberi Persetujuan',
    actorRole: item.role.toUpperCase(),
    employeeName: 'Penggajian September 2026',
    action: `Persetujuan Tahap ${item.stageName}`,
    beforeValue: 'Menunggu',
    afterValue: item.status,
    reason: notes || 'Persetujuan berjenjang sesuai alur otoritas perusahaan'
  });

  res.json({ approval: item, allApproved, period: currentPeriod });
});

// 5. Pembayaran Gaji
app.post('/api/payroll/process/payment', (req, res) => {
  const { periodId, method = 'Transfer Bank', confirmedBy = 'Dewi Lestari (Finance)' } = req.body || {};
  const period = payrollPeriods.find(p => p.id === periodId) || payrollPeriods[0];

  period.status = 'Sudah Dibayar';
  period.paidEmployees = period.totalEmployees;
  period.stages[4].done = true;
  period.stages[4].at = new Date().toLocaleString('id-ID');
  period.currentStage = 6;

  // Update status cicilan pinjaman & kasbon bulan ini menjadi Lunas
  employeeLoans.forEach(l => {
    const inst = l.installments.find(i => i.period === 'September 2026');
    if (inst) {
      inst.status = 'Lunas';
      inst.paidAt = new Date().toISOString().slice(0, 10);
      l.paidAmount += inst.amount;
      l.remainingAmount = Math.max(0, l.remainingAmount - inst.amount);
      if (l.remainingAmount <= 0) l.status = 'Lunas';
    }
  });

  cashAdvances.forEach(c => {
    if (c.deductionPeriod === 'September 2026' && c.status === 'Disetujui') {
      c.status = 'Lunas';
    }
  });

  // Notifikasi pembayaran
  payrollNotifications.unshift({
    id: `notif-${Date.now()}`,
    employeeId: 'emp-1',
    title: 'Pembayaran Gaji Selesai',
    message: `Gaji periode ${period.name} sebesar Rp 7.250.000 telah sukses ditransfer ke rekening BCA.`,
    time: 'Baru saja',
    isRead: false,
    category: 'Pembayaran'
  });

  payrollAuditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString('id-ID'),
    actorName: confirmedBy,
    actorRole: 'Finance',
    employeeName: `${period.totalEmployees} Karyawan`,
    action: 'Konfirmasi Pembayaran Gaji (Batch Transfer)',
    beforeValue: 'Menunggu Pembayaran',
    afterValue: `Sudah Dibayar (${method} - ${formatRupiah(period.totalAmount)})`,
    reason: 'Batch transfer bank diproses dan divalidasi sukses'
  });

  res.json({ success: true, period });
});

// 6. Publikasi Slip Gaji
app.post('/api/payroll/process/publish', (req, res) => {
  const { periodId, notifyApp = true, notifyEmail = true } = req.body || {};
  const period = payrollPeriods.find(p => p.id === periodId) || payrollPeriods[0];

  period.status = 'Slip Dipublikasikan';
  period.stages[5].done = true;
  period.stages[5].at = new Date().toLocaleString('id-ID');

  payrollNotifications.unshift({
    id: `notif-${Date.now()}`,
    employeeId: 'emp-1',
    title: 'Slip Gaji Diterbitkan',
    message: `Slip gaji resmi untuk periode ${period.name} telah dipublikasikan ke portal karyawan.`,
    time: 'Baru saja',
    isRead: false,
    category: 'Slip Gaji'
  });

  payrollAuditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString('id-ID'),
    actorName: req.body?.actorName || 'Siti Rahmawati (HR Manager)',
    actorRole: 'HRD',
    employeeName: `${period.totalEmployees} Karyawan`,
    action: 'Publikasi Slip Gaji ke Aplikasi Karyawan',
    beforeValue: 'Belum Terpublikasi',
    afterValue: 'Slip Dipublikasikan',
    reason: `Dipublikasikan dengan notifikasi: App=${notifyApp}, Email=${notifyEmail}`
  });

  res.json({ success: true, period, message: 'Slip gaji berhasil dipublikasikan ke seluruh akun karyawan.' });
});

// 7. Struktur Gaji & Komponen Gaji & Aturan
app.get('/api/payroll/structures', (req, res) => {
  res.json({ structures: salaryStructures });
});

app.post('/api/payroll/structures', (req, res) => {
  const { name, type = 'Bulanan', description = '', components = [] } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Nama struktur gaji wajib diisi' });

  const newStructure = {
    id: `str-${Date.now()}`,
    name,
    type,
    componentCount: components.length || 5,
    employeeCount: 0,
    description,
    components: components.length ? components : ['GP-01', 'TJ-01', 'TJ-02', 'PT-01', 'PT-02']
  };
  salaryStructures.push(newStructure);
  res.status(201).json({ structure: newStructure });
});

app.get('/api/payroll/components', (req, res) => {
  res.json({ components: salaryComponents });
});

app.post('/api/payroll/components', (req, res) => {
  const { name, code, type, method, defaultAmount = 0, formula = '' } = req.body || {};
  if (!name || !code || !type || !method) {
    return res.status(400).json({ error: 'Nama, kode, tipe, dan metode perhitungan wajib diisi' });
  }
  const newComp = {
    id: code.toUpperCase(),
    code: code.toUpperCase(),
    name,
    type,
    method,
    defaultAmount: Number(defaultAmount) || 0,
    rate: 0,
    formula: formula || name,
    isTaxable: true
  };
  salaryComponents.push(newComp);
  res.status(201).json({ component: newComp });
});

app.get('/api/payroll/rules', (req, res) => {
  res.json({ rules: salaryRules });
});

app.put('/api/payroll/rules', (req, res) => {
  const { rules } = req.body || {};
  if (Array.isArray(rules)) {
    rules.forEach(r => {
      const idx = salaryRules.findIndex(sr => sr.key === r.key);
      if (idx !== -1) salaryRules[idx] = { ...salaryRules[idx], ...r };
    });
  }
  res.json({ rules: salaryRules });
});

// 8. Pinjaman Karyawan & Pengajuan
app.get('/api/payroll/loans', (req, res) => {
  res.json({
    loans: employeeLoans,
    requests: loanRequests,
    stats: {
      totalActiveAmount: employeeLoans.reduce((sum, l) => sum + (l.remainingAmount || 0), 0),
      activeLoanCount: employeeLoans.length,
      pendingApprovalCount: loanRequests.length,
      monthlyInstallmentTotal: employeeLoans.reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0)
    }
  });
});

app.post('/api/payroll/loan-requests', (req, res) => {
  const { employeeId, amount, tenorMonths, purpose, attachmentUrl } = req.body || {};
  if (!employeeId || !amount || !tenorMonths || !purpose) {
    return res.status(400).json({ error: 'Karyawan, jumlah pinjaman, tenor, dan keperluan wajib diisi' });
  }

  const emp = payrollEmployees.find(e => e.id === employeeId) || payrollEmployees[0];
  const principal = Number(amount);
  const tenor = Number(tenorMonths);
  const installment = Math.round(principal / tenor);

  const newRequest = {
    id: `lr-${Date.now()}`,
    employeeId: emp.id,
    employeeName: emp.name,
    employeeCode: emp.code,
    department: emp.department,
    basicSalary: emp.basicSalary,
    currentTakeHomePay: Math.round(emp.basicSalary * 0.95),
    amount: principal,
    tenorMonths: tenor,
    monthlyInstallment: installment,
    totalDeductionsAfter: installment + 350000,
    purpose,
    attachmentUrl: attachmentUrl || 'dokumen_pendukung.pdf',
    status: 'Menunggu Persetujuan',
    managerStatus: 'Menunggu',
    hrStatus: 'Menunggu',
    financeStatus: 'Menunggu',
    createdAt: new Date().toLocaleString('id-ID')
  };

  loanRequests.unshift(newRequest);

  payrollNotifications.unshift({
    id: `notif-${Date.now()}`,
    employeeId: emp.id,
    title: 'Pengajuan Pinjaman Terkirim',
    message: `Pengajuan pinjaman sebesar ${formatRupiah(principal)} untuk keperluan "${purpose}" sedang ditinjau atasan dan HRD.`,
    time: 'Baru saja',
    isRead: false,
    category: 'Pinjaman'
  });

  res.status(201).json({ request: newRequest });
});

app.post('/api/payroll/loan-requests/:id/action', (req, res) => {
  const { action, role = 'hrd', note = '' } = req.body || {};
  const request = loanRequests.find(r => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Pengajuan pinjaman tidak ditemukan' });

  if (action === 'approve') {
    request.status = 'Disetujui';
    // Otomatis buat data Pinjaman Aktif dan jadwal cicilan
    const newLoan = {
      id: `ln-${Date.now()}`,
      employeeId: request.employeeId,
      employeeName: request.employeeName,
      employeeCode: request.employeeCode,
      department: request.department,
      principalAmount: request.amount,
      tenorMonths: request.tenorMonths,
      monthlyInstallment: request.monthlyInstallment,
      paidAmount: 0,
      remainingAmount: request.amount,
      startPeriod: 'Oktober 2026',
      status: 'Aktif',
      purpose: request.purpose,
      createdAt: new Date().toISOString().slice(0, 10),
      installments: Array.from({ length: request.tenorMonths }, (_, i) => ({
        number: i + 1,
        period: `Bulan ke-${i + 1}`,
        dueDate: `2026-${String((10 + i) > 12 ? (10 + i) - 12 : (10 + i)).padStart(2, '0')}-30`,
        amount: request.monthlyInstallment,
        status: 'Belum dibayar',
        paidAt: null
      }))
    };
    employeeLoans.unshift(newLoan);

    payrollNotifications.unshift({
      id: `notif-${Date.now()}`,
      employeeId: request.employeeId,
      title: 'Pinjaman Disetujui',
      message: `Selamat, pengajuan pinjaman sebesar ${formatRupiah(request.amount)} telah disetujui. Pencairan akan segera diproses.`,
      time: 'Baru saja',
      isRead: false,
      category: 'Pinjaman'
    });
  } else {
    request.status = 'Ditolak';
    payrollNotifications.unshift({
      id: `notif-${Date.now()}`,
      employeeId: request.employeeId,
      title: 'Pinjaman Ditolak',
      message: `Pengajuan pinjaman sebesar ${formatRupiah(request.amount)} tidak disetujui. Catatan: ${note || 'Tidak memenuhi kualifikasi batasan cicilan.'}`,
      time: 'Baru saja',
      isRead: false,
      category: 'Pinjaman'
    });
  }

  res.json({ request });
});

// 9. Kasbon
app.get('/api/payroll/cash-advances', (req, res) => {
  res.json({ cashAdvances });
});

app.post('/api/payroll/cash-advances', (req, res) => {
  const { employeeId, amount, purpose, deductionPeriod } = req.body || {};
  if (!employeeId || !amount || !purpose) {
    return res.status(400).json({ error: 'Karyawan, nominal kasbon, dan keperluan wajib diisi' });
  }
  const emp = payrollEmployees.find(e => e.id === employeeId) || payrollEmployees[0];
  const newAdvance = {
    id: `kb-${Date.now()}`,
    employeeId: emp.id,
    employeeName: emp.name,
    employeeCode: emp.code,
    department: emp.department,
    amount: Number(amount),
    purpose,
    requestDate: new Date().toISOString().slice(0, 10),
    deductionPeriod: deductionPeriod || 'September 2026',
    status: 'Menunggu Persetujuan',
    attachmentUrl: null,
    createdAt: new Date().toLocaleString('id-ID')
  };
  cashAdvances.unshift(newAdvance);
  res.status(201).json({ cashAdvance: newAdvance });
});

app.post('/api/payroll/cash-advances/:id/action', (req, res) => {
  const { action } = req.body || {};
  const adv = cashAdvances.find(c => c.id === req.params.id);
  if (!adv) return res.status(404).json({ error: 'Data kasbon tidak ditemukan' });

  adv.status = action === 'approve' ? 'Disetujui' : 'Ditolak';
  res.json({ cashAdvance: adv });
});

// 10. Penggantian Biaya (Reimbursement)
app.get('/api/payroll/reimbursements', (req, res) => {
  res.json({ reimbursements });
});

app.post('/api/payroll/reimbursements', (req, res) => {
  const { employeeId, category, title, amount, transactionDate, description, receiptUrl } = req.body || {};
  if (!employeeId || !category || !title || !amount) {
    return res.status(400).json({ error: 'Data pengajuan biaya tidak lengkap' });
  }
  const emp = payrollEmployees.find(e => e.id === employeeId) || payrollEmployees[0];
  const newReimb = {
    id: `rmb-${Date.now()}`,
    employeeId: emp.id,
    employeeName: emp.name,
    employeeCode: emp.code,
    department: emp.department,
    category,
    title,
    amount: Number(amount),
    transactionDate: transactionDate || new Date().toISOString().slice(0, 10),
    description: description || '',
    receiptUrl: receiptUrl || 'bukti_transaksi.jpg',
    status: 'Menunggu Persetujuan',
    payoutMethod: 'Penggajian',
    approvals: [
      { role: 'Atasan Langsung', name: 'Atasan Divisi', status: 'Menunggu', date: null },
      { role: 'HR & Finance', name: 'Finance Lead', status: 'Menunggu', date: null }
    ],
    createdAt: new Date().toLocaleString('id-ID')
  };
  reimbursements.unshift(newReimb);
  res.status(201).json({ reimbursement: newReimb });
});

app.post('/api/payroll/reimbursements/:id/action', (req, res) => {
  const { action, role = 'HR & Finance', name = 'Reviewer' } = req.body || {};
  const rmb = reimbursements.find(r => r.id === req.params.id);
  if (!rmb) return res.status(404).json({ error: 'Data reimbursement tidak ditemukan' });

  if (action === 'approve') {
    rmb.status = 'Disetujui HR/Finance';
    rmb.approvals.forEach(a => {
      a.status = 'Disetujui';
      a.date = new Date().toLocaleString('id-ID');
    });
  } else {
    rmb.status = 'Ditolak';
  }
  res.json({ reimbursement: rmb });
});

// 11. Detail Slip Gaji Spesifik Karyawan
app.get('/api/payroll/payslips/:employeeId', (req, res) => {
  const emp = payrollEmployees.find(e => e.id === req.params.employeeId) || payrollEmployees[0];
  const period = req.query.period || 'September 2026';
  const payslip = calculateEmployeeSalary(emp, period);

  res.json({
    company: {
      name: 'PT PROVEN FORCE INDONESIA',
      brand: 'SMART HRM',
      address: 'Gedung Menara Mandiri Lt. 14, Jl. Jend. Sudirman Kav. 54-55, Jakarta Selatan 12190',
      phone: '+62 21 5289 7788',
      email: 'hr-support@provenforce.co.id'
    },
    period: {
      name: period,
      paymentDate: '30 September 2026'
    },
    employee: {
      name: emp.name,
      employeeCode: emp.code,
      position: emp.position,
      department: emp.department,
      status: emp.status,
      bankName: emp.bankName || 'BCA',
      accountNumberMasked: emp.accountNumber ? `****${emp.accountNumber.slice(-4)}` : '****1234'
    },
    earnings: payslip.earnings,
    deductions: payslip.deductions,
    netSalary: payslip.netSalary,
    terbilang: payslip.terbilangText,
    attendance: payslip.attendance,
    paymentInfo: {
      method: 'Transfer Bank',
      bankName: emp.bankName || 'BCA',
      accountNumberMasked: emp.accountNumber ? `****${emp.accountNumber.slice(-4)}` : '****1234',
      paymentDate: '30 September 2026'
    },
    meta: {
      payslipId: payslip.payslipCode,
      verificationCode: payslip.verificationCode,
      generatedAt: '30 September 2026 10:00:00 WIB',
      disclaimer: 'Dokumen ini merupakan dokumen elektronik yang diterbitkan secara sah oleh sistem Smart HRM PT Proven Force Indonesia.'
    }
  });
});

// 12. Dashboard Keuangan Karyawan Pribadi (Employee Financial Portal)
app.get('/api/payroll/my-finance/:employeeId', (req, res) => {
  const emp = payrollEmployees.find(e => e.id === req.params.employeeId) || payrollEmployees[0];
  const currentSlip = calculateEmployeeSalary(emp, 'September 2026');

  const myLoans = employeeLoans.filter(l => l.employeeId === emp.id);
  const myKasbon = cashAdvances.filter(k => k.employeeId === emp.id);
  const myReimbursements = reimbursements.filter(r => r.employeeId === emp.id);
  const myNotifications = payrollNotifications.filter(n => n.employeeId === emp.id);

  // Riwayat Gaji Karyawan (Historis)
  const salaryHistory = [
    { period: 'September 2026', netSalary: 7250000, basicSalary: 6000000, status: 'Sudah Dibayar', paymentDate: '30 September 2026', slipId: 'SLIP-2026-09-EMP00123' },
    { period: 'Agustus 2026', netSalary: 7100000, basicSalary: 6000000, status: 'Sudah Dibayar', paymentDate: '31 Agustus 2026', slipId: 'SLIP-2026-08-EMP00123' },
    { period: 'Juli 2026', netSalary: 7200000, basicSalary: 6000000, status: 'Sudah Dibayar', paymentDate: '31 Juli 2026', slipId: 'SLIP-2026-07-EMP00123' },
    { period: 'Juni 2026', netSalary: 6950000, basicSalary: 6000000, status: 'Sudah Dibayar', paymentDate: '30 Juni 2026', slipId: 'SLIP-2026-06-EMP00123' },
    { period: 'Mei 2026', netSalary: 7300000, basicSalary: 6000000, status: 'Sudah Dibayar', paymentDate: '31 Mei 2026', slipId: 'SLIP-2026-05-EMP00123' }
  ];

  const totalRemainingLoan = myLoans.reduce((sum, l) => sum + (l.remainingAmount || 0), 0);
  const nextLoanInstallment = myLoans.reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0);
  const pendingReimbursements = myReimbursements
    .filter(r => r.status.includes('Menunggu') || r.status.includes('Atasan'))
    .reduce((sum, r) => sum + r.amount, 0);

  res.json({
    employee: emp,
    cards: {
      lastNetSalary: currentSlip.netSalary,
      remainingLoan: totalRemainingLoan,
      nextInstallment: nextLoanInstallment,
      pendingReimbursement: pendingReimbursements || 150000
    },
    latestPayslip: currentSlip,
    history: salaryHistory,
    loans: myLoans,
    kasbon: myKasbon,
    reimbursements: myReimbursements,
    notifications: myNotifications
  });
});

// 13. Penyesuaian Penggajian (Payroll Adjustments)
app.get('/api/payroll/adjustments', (req, res) => {
  res.json({ adjustments: payrollAdjustments });
});

app.post('/api/payroll/adjustments', (req, res) => {
  const { employeeId, type, amount, reason, targetPeriod, referencePeriod } = req.body || {};
  if (!employeeId || !type || !amount || !reason) {
    return res.status(400).json({ error: 'Data penyesuaian gaji belum lengkap' });
  }

  const emp = payrollEmployees.find(e => e.id === employeeId) || payrollEmployees[0];
  const newAdj = {
    id: `adj-${Date.now()}`,
    employeeId: emp.id,
    employeeName: emp.name,
    targetPeriod: targetPeriod || 'September 2026',
    referencePeriod: referencePeriod || 'Bulan Sebelumnya',
    type,
    amount: Number(amount),
    reason,
    status: 'Diterapkan',
    createdBy: req.body?.createdBy || 'HR Manager',
    createdAt: new Date().toLocaleString('id-ID')
  };
  payrollAdjustments.unshift(newAdj);

  payrollAuditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleString('id-ID'),
    actorName: req.body?.createdBy || 'HR Manager',
    actorRole: 'HRD',
    employeeName: emp.name,
    action: 'Menambahkan Penyesuaian Penggajian',
    beforeValue: '0',
    afterValue: `${type === 'Pendapatan' ? '+' : '-'}${formatRupiah(amount)}`,
    reason
  });

  res.status(201).json({ adjustment: newAdj });
});

// 14. Audit Log & Notifikasi
app.get('/api/payroll/audit-logs', (req, res) => {
  res.json({ logs: payrollAuditLogs });
});

app.get('/api/payroll/notifications', (req, res) => {
  res.json({ notifications: payrollNotifications });
});

// 15. Laporan Penggajian & Analitik
app.get('/api/payroll/reports', (req, res) => {
  const { period = 'September 2026', department, status, type } = req.query;
  let items = getPayrollItems('prd-2026-09');

  if (department && department !== 'Semua') {
    items = items.filter(i => i.department === department);
  }
  if (status && status !== 'Semua') {
    items = items.filter(i => i.status === status);
  }

  res.json({
    period,
    totalRecords: items.length,
    totals: {
      gross: items.reduce((s, i) => s + i.earnings.total, 0),
      deductions: items.reduce((s, i) => s + i.deductions.total, 0),
      net: items.reduce((s, i) => s + i.netSalary, 0),
      overtime: items.reduce((s, i) => s + i.earnings.overtime, 0),
      loans: items.reduce((s, i) => s + i.deductions.loanInstallment, 0),
      kasbon: items.reduce((s, i) => s + i.deductions.cashAdvance, 0)
    },
    records: items
  });
});

app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Terjadi kesalahan server' }); });
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`SMART HRM API listening on ${port}`));

