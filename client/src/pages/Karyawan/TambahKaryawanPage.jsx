import React, { useState } from "react";
import { ChevronRight, ArrowLeft, Save, CheckCircle, UploadCloud } from "lucide-react";
import AkunSection from "./sections/AkunSection.jsx";
import DataPribadiSection from "./sections/DataPribadiSection.jsx";
import DataKepegawaianSection from "./sections/DataKepegawaianSection.jsx";
import InformasiGajiSection from "./sections/InformasiGajiSection.jsx";
import DokumenSection from "./sections/DokumenSection.jsx";
import BankSection from "./sections/BankSection.jsx";
import KontakSection from "./sections/KontakSection.jsx";
import KendaraanSection from "./sections/KendaraanSection.jsx";

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Gagal membaca file ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export default function TambahKaryawanPage({ API, initialData = {}, divisions = [], positions = [], departments = [], fetchWithAuth, onCancel, onSaved }) {
  const [form, setForm] = useState({ ...initialData, username: "", email: "", password: "", role: "employee" });
  const [files, setFiles] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const empName = (form.name || form.nama_karyawan || "").trim();

      // Konversi semua file yang dipilih (foto, dokumen, kendaraan) ke format data payload
      const filesPayload = {};
      for (const [key, file] of Object.entries(files)) {
        if (file && typeof file === "object" && file.name) {
          try {
            const dataUrl = await fileToDataUrl(file);
            filesPayload[key] = {
              name: file.name,
              type: file.type || "application/octet-stream",
              size: file.size,
              data: dataUrl
            };
          } catch (fileErr) {
            console.warn(`Gagal membaca file ${key}:`, fileErr);
          }
        }
      }

      const payload = {
        ...form,
        name: empName,
        username: form.username?.trim() || "",
        email: form.email?.trim() || "",
        password: form.password?.trim() || "",
        role: form.role || "employee",
        files: filesPayload
      };

      const res = await fetchWithAuth(`${API}/api/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Gagal menyimpan karyawan");
      onSaved?.();
    } catch (e) {
      setError(e.message || "Gagal menyimpan karyawan");
    } finally {
      setSaving(false);
    }
  }

  const shared = { form, setForm, files, setFiles };

  return (
    <main className="employee-add-page" style={{ width: "100%", margin: "0 auto", paddingBottom: 32 }}>
      <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#7b8aa2", marginBottom: 15 }}>
        <button type="button" onClick={onCancel} style={{ border: 0, background: "none", color: "#2563eb", fontWeight: 600, cursor: "pointer", padding: 0 }}>Data Karyawan</button>
        <ChevronRight size={14} /><span style={{ color: "#34455f", fontWeight: 700 }}>Tambah Karyawan</span>
      </nav>
      <div style={{ background: "#ffffff", border: "1px solid #e3eaf4", borderRadius: 14, overflow: "hidden", boxShadow: "0 12px 26px rgba(36,64,112,0.07)" }}>
        <div style={{ padding: "20px 22px", borderBottom: "1px solid #edf1f7", background: "#ffffff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: 17, fontWeight: 750, margin: 0, color: "#1b293f" }}>Tambah Karyawan</h1>
            <p style={{ fontSize: 12, color: "#8090aa", margin: "5px 0 0" }}>Lengkapi formulir di bawah. Foto, dokumen, dan data kendaraan akan otomatis diunggah ke storage.</p>
          </div>
          <button type="button" aria-label="Kembali ke Data Karyawan" onClick={onCancel} style={{ background: "transparent", border: 0, color: "#8d9eb6", fontSize: 23, cursor: "pointer" }}>×</button>
        </div>
        <form onSubmit={submit}>
          <AkunSection {...shared} />
          <DataPribadiSection {...shared} />
          <DataKepegawaianSection {...shared} divisions={divisions} positions={positions} departments={departments} />
          <InformasiGajiSection {...shared} />
          <DokumenSection {...shared} />
          <BankSection {...shared} />
          <KontakSection {...shared} />
          <KendaraanSection {...shared} />

          <div style={{ padding: "13px 20px", color: "#1e40af", background: "#eff6ff", fontSize: 12, borderTop: "1px solid #dbeafe", borderBottom: "1px solid #dbeafe", display: "flex", alignItems: "center", gap: 9 }}>
            <UploadCloud size={16} color="#2563eb" style={{ flexShrink: 0 }} />
            <span>Semua file upload (Foto profil, SIM, STNK, Foto Kendaraan, KTP, KK, NPWP, KPJ, JKN, CV) akan diunggah ke Supabase Storage & tersimpan ke database.</span>
          </div>

          {error && <p role="alert" style={{ color: "#be123c", fontSize: 12, padding: "10px 20px 0" }}>{error}</p>}
          <footer style={{ background: "#ffffff", borderTop: "1px solid #e3eaf4", padding: "14px 20px", display: "flex", justifyContent: "flex-end", gap: 9 }}>
            <button type="button" className="secondary" onClick={onCancel}>Batal</button>
            <button type="submit" className="primary compact" disabled={saving}>
              {saving ? "Menyimpan & Mengunggah..." : "Simpan Data Karyawan"}
            </button>
          </footer>
        </form>
      </div>
      <style>{`.content:has(.employee-add-page) > .content-breadcrumb { display: none; } @media(max-width:720px){.employee-form-grid{grid-template-columns:1fr !important;}}`}</style>
    </main>
  );
}
