import React, { useState } from "react";
import {
  X,
  Pencil,
  Users,
  CreditCard,
  CarFront,
  FileText,
  ExternalLink,
  ShieldAlert,
  Wallet
} from "lucide-react";


function terbilang(n) {
  if (!n || isNaN(n) || n <= 0) return "Nol Rupiah";
  const bilangan = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas"
  ];

  function convert(num) {
    num = Math.floor(num);
    if (num < 12) {
      return bilangan[num];
    } else if (num < 20) {
      return convert(num - 10) + " Belas";
    } else if (num < 100) {
      return (
        convert(Math.floor(num / 10)) +
        " Puluh" +
        (num % 10 !== 0 ? " " + convert(num % 10) : "")
      );
    } else if (num < 200) {
      return "Seratus" + (num - 100 !== 0 ? " " + convert(num - 100) : "");
    } else if (num < 1000) {
      return (
        convert(Math.floor(num / 100)) +
        " Ratus" +
        (num % 100 !== 0 ? " " + convert(num % 100) : "")
      );
    } else if (num < 2000) {
      return "Seribu" + (num - 1000 !== 0 ? " " + convert(num - 1000) : "");
    } else if (num < 1000000) {
      return (
        convert(Math.floor(num / 1000)) +
        " Ribu" +
        (num % 1000 !== 0 ? " " + convert(num % 1000) : "")
      );
    } else if (num < 1000000000) {
      return (
        convert(Math.floor(num / 1000000)) +
        " Juta" +
        (num % 1000000 !== 0 ? " " + convert(num % 1000000) : "")
      );
    } else if (num < 1000000000000) {
      return (
        convert(Math.floor(num / 1000000000)) +
        " Miliar" +
        (num % 1000000000 !== 0 ? " " + convert(num % 1000000000) : "")
      );
    } else {
      return (
        convert(Math.floor(num / 1000000000000)) +
        " Triliun" +
        (num % 1000000000000 !== 0 ? " " + convert(num % 1000000000000) : "")
      );
    }
  }

  return `${convert(n).trim()} Rupiah`;
}

function parseCurrency(val) {
  if (val === null || val === undefined || val === "") return 0;
  if (typeof val === "number") return val;
  const digits = String(val).replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function formatRp(val) {
  const num = parseCurrency(val);
  return `Rp${num.toLocaleString("id-ID")}`;
}

function formatDateIndo(dateStr) {
  if (!dateStr || dateStr === "—") return "—";
  if (typeof dateStr === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [y, m, d] = dateStr.slice(0, 10).split("-");
      return `${d}-${m}-${y}`;
    }
    if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
      return dateStr.replace(/\//g, "-");
    }
  }
  return dateStr;
}

export default function DetailKaryawanModal({ employee, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState("pribadi");

  if (!employee) return null;

  const empName =
    employee.name || employee.nama_karyawan || "Tanpa Nama";
  const empCode = employee.employee_code || "—";
  const empDivision = employee.division || employee.details?.division || "—";
  const empPosition = employee.position || employee.details?.position || "—";
  const isAktif = (employee.work_status || "Aktif").toLowerCase() === "aktif";
  const avatarUrl =
    employee.photo ||
    employee.documents?.photo_profile ||
    employee.file_photo_profile ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";

  // Data Gaji
  const salaryBasic = parseCurrency(
    employee.salary_basic || employee.basic_salary || employee.details?.salary_basic
  );
  const allowanceMeal = parseCurrency(
    employee.allowance_meal || employee.details?.allowance_meal
  );
  const allowancePosition = parseCurrency(
    employee.allowance_position || employee.details?.allowance_position
  );
  const allowanceTransport = parseCurrency(
    employee.allowance_transport || employee.details?.allowance_transport
  );
  const allowanceProject = parseCurrency(
    employee.allowance_project || employee.details?.allowance_project
  );
  const allowanceOther = parseCurrency(
    employee.allowance_other || employee.details?.allowance_other
  );
  const totalKompensasi =
    salaryBasic +
    allowanceMeal +
    allowancePosition +
    allowanceTransport +
    allowanceProject +
    allowanceOther;
  const kalimatTerbilang = terbilang(totalKompensasi);

  // Dokumen Pendukung
  const docs = {
    ktp: employee.file_ktp || employee.ktp || employee.documents?.ktp,
    kk: employee.file_kk || employee.kk || employee.documents?.kk,
    npwp: employee.file_npwp || employee.npwp || employee.documents?.npwp,
    kpj: employee.file_kpj || employee.kpj || employee.documents?.kpj,
    jkn: employee.file_jkn || employee.jkn || employee.documents?.jkn,
    cv: employee.file_cv || employee.cv || employee.documents?.cv,
    other:
      employee.file_other ||
      employee.other ||
      employee.other_document ||
      employee.documents?.other
  };

  // Kendaraan
  const fileSim = employee.file_sim || employee.sim || employee.documents?.sim;
  const fileStnk = employee.file_stnk || employee.stnk || employee.documents?.stnk;
  const fileVehicleFront =
    employee.file_vehicle_front ||
    employee.vehicle_front ||
    employee.documents?.vehicle_front;
  const fileVehicleBack =
    employee.file_vehicle_back ||
    employee.vehicle_back ||
    employee.documents?.vehicle_back;
  const fileVehicleSide =
    employee.file_vehicle_side ||
    employee.vehicle_side ||
    employee.documents?.vehicle_side;

  const tabs = [
    { id: "pribadi", label: "Data Pribadi" },
    { id: "kepegawaian", label: "Data Kepegawaian" },
    { id: "gaji", label: "Informasi Gaji" },
    { id: "dokumen", label: "Dokumen Pendukung" },
    { id: "bank", label: "Akun Bank" },
    { id: "kontak", label: "Kontak Darurat" },
    { id: "kendaraan", label: "Kendaraan" }
  ];

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
        backgroundColor: "rgba(15, 23, 42, 0.65)"
      }}
    >
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "840px",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          overflow: "hidden",
          border: "1px solid #e2e8f0"
        }}
      >
        {/* Header Modal */}
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            borderBottom: "1px solid #f1f5f9"
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0
              }}
            >
              Detail Karyawan
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "4px 0 0 0"
              }}
            >
              Informasi lengkap profil dan administrasi karyawan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            style={{
              background: "transparent",
              border: 0,
              color: "#64748b",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              transition: "background-color 0.15s ease"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Hero Profil Karyawan */}
        <div
          style={{
            padding: "18px 24px",
            display: "flex",
            alignItems: "center",
            gap: "18px",
            borderBottom: "1px solid #f1f5f9"
          }}
        >
          <img
            src={avatarUrl}
            alt={empName}
            style={{
              width: "68px",
              height: "68px",
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
              border: "2px solid #e2e8f0",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)"
            }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80";
            }}
          />
          <div>
            <h3
              style={{
                margin: "0 0 5px 0",
                fontSize: "18px",
                fontWeight: 750,
                color: "#0f172a"
              }}
            >
              {empName}
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "4px"
              }}
            >
              <span
                style={{
                  fontWeight: 700,
                  color: "#2563eb",
                  fontSize: "13px"
                }}
              >
                {empCode}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "2px 10px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: 600,
                  backgroundColor: isAktif ? "#dcfce7" : "#fee2e2",
                  color: isAktif ? "#15803d" : "#b91c1c"
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: isAktif ? "#16a34a" : "#dc2626"
                  }}
                />
                {employee.work_status || "Aktif"}
              </span>
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "#64748b",
                fontWeight: 500
              }}
            >
              {empDivision} • {empPosition}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            padding: "0 24px",
            display: "flex",
            gap: "24px",
            borderBottom: "1px solid #e2e8f0",
            overflowX: "auto",
            scrollbarWidth: "none"
          }}
        >
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  padding: "12px 2px 14px 2px",
                  fontSize: "13px",
                  fontWeight: active ? 700 : 500,
                  color: active ? "#2563eb" : "#64748b",
                  borderBottom: active
                    ? "2.5px solid #2563eb"
                    : "2.5px solid transparent",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                  marginBottom: "-1px"
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Modal Body / Tab Contents */}
        <div
          style={{
            padding: "24px 28px",
            overflowY: "auto",
            maxHeight: "calc(92vh - 280px)",
            minHeight: "330px"
          }}
        >
          {/* TAB 1: DATA PRIBADI */}
          {activeTab === "pribadi" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px 36px"
              }}
            >
              <FieldItem
                label="NAMA KARYAWAN"
                value={empName}
              />
              <FieldItem
                label="NOMOR TELEPON"
                value={
                  employee.nomor_telepon ||
                  employee.phone ||
                  employee.details?.nomor_telepon ||
                  "—"
                }
              />

              <FieldItem
                label="TEMPAT LAHIR"
                value={
                  employee.tempat_lahir ||
                  employee.details?.tempat_lahir ||
                  "—"
                }
              />
              <FieldItem
                label="TANGGAL LAHIR"
                value={
                  formatDateIndo(
                    employee.tanggal_lahir || employee.details?.tanggal_lahir
                  ) || "—"
                }
              />

              <FieldItem
                label="JENIS KELAMIN"
                value={
                  employee.jenis_kelamin ||
                  employee.gender ||
                  employee.details?.jenis_kelamin ||
                  "—"
                }
              />
              <FieldItem
                label="AGAMA"
                value={
                  employee.agama ||
                  employee.religion ||
                  employee.details?.agama ||
                  "—"
                }
              />

              <FieldItem
                label="ALAMAT KTP"
                value={
                  employee.alamat_ktp ||
                  employee.address ||
                  employee.details?.alamat_ktp ||
                  "—"
                }
                fullWidth
              />

              <FieldItem
                label="ALAMAT DOMISILI"
                value={
                  employee.alamat_domisili ||
                  employee.domicile_address ||
                  employee.details?.alamat_domisili ||
                  "—"
                }
                fullWidth
              />

              <FieldItem
                label="PENDIDIKAN"
                value={
                  employee.pendidikan ||
                  employee.education ||
                  employee.details?.pendidikan ||
                  "—"
                }
              />
              <FieldItem
                label="NAMA SUAMI/ISTRI"
                value={
                  employee.nama_suami_istri ||
                  employee.spouse_name ||
                  employee.details?.nama_suami_istri ||
                  "—"
                }
              />

              <FieldItem
                label="NAMA ANAK"
                value={
                  employee.nama_anak ||
                  employee.children_names ||
                  employee.details?.nama_anak ||
                  "—"
                }
              />
              <FieldItem
                label="JUMLAH ANAK"
                value={
                  employee.jumlah_anak != null && employee.jumlah_anak !== ""
                    ? String(employee.jumlah_anak)
                    : employee.details?.jumlah_anak != null &&
                      employee.details?.jumlah_anak !== ""
                      ? String(employee.details.jumlah_anak)
                      : "—"
                }
              />

              <FieldItem
                label="NAMA BAPAK"
                value={
                  employee.nama_bapak ||
                  employee.father_name ||
                  employee.details?.nama_bapak ||
                  "—"
                }
              />
              <FieldItem
                label="NAMA IBU"
                value={
                  employee.nama_ibu ||
                  employee.mother_name ||
                  employee.details?.nama_ibu ||
                  "—"
                }
              />
            </div>
          )}

          {/* TAB 2: DATA KEPEGAWAIAN */}
          {activeTab === "kepegawaian" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px 36px"
              }}
            >
              <FieldItem
                label="ID KARYAWAN"
                value={employee.employee_code || "—"}
              />
              <FieldItem
                label="GRUP"
                value={employee.group || employee.details?.group || "—"}
              />

              <FieldItem
                label="DIVISI"
                value={employee.division || employee.details?.division || "—"}
              />
              <FieldItem
                label="KATEGORI KARYAWAN"
                value={employee.category || employee.details?.category || "—"}
              />

              <FieldItem
                label="JABATAN"
                value={employee.position || employee.details?.position || "—"}
              />
              <FieldItem
                label="STATUS MARITAL"
                value={
                  employee.marital_status ||
                  employee.details?.marital_status ||
                  "—"
                }
              />

              <FieldItem
                label="BAGIAN"
                value={
                  employee.department || employee.details?.department || "—"
                }
              />
              <FieldItem
                label="REFERENSI"
                value={
                  employee.reference || employee.details?.reference || "—"
                }
              />

              <FieldItem
                label="LOKASI KERJA"
                value={
                  employee.work_location ||
                  employee.details?.work_location ||
                  "—"
                }
              />
              <FieldItem
                label="NO SIO"
                value={
                  employee.sio_number || employee.details?.sio_number || "—"
                }
              />

              <FieldItem
                label="TANGGAL BERGABUNG"
                value={
                  formatDateIndo(
                    employee.join_date || employee.details?.join_date
                  ) || "—"
                }
              />
              <FieldItem
                label="STATUS AKUN"
                value={
                  employee.account_status ||
                  employee.details?.account_status ||
                  "Aktif"
                }
              />

              <FieldItem
                label="TANGGAL KONTRAK"
                value={
                  formatDateIndo(
                    employee.contract_start || employee.details?.contract_start
                  ) || "—"
                }
              />
              <FieldItem
                label="STATUS KERJA"
                value={
                  employee.work_status ||
                  employee.details?.work_status ||
                  "Full Time"
                }
              />

              <FieldItem
                label="SELESAI KONTRAK"
                value={
                  formatDateIndo(
                    employee.contract_end || employee.details?.contract_end
                  ) || "—"
                }
              />
              <FieldItem
                label="APAKAH KARYAWAN MEMILIKI NPWP?"
                value={
                  employee.has_npwp === "ya" ||
                    employee.has_npwp === true ||
                    employee.has_npwp === "Ya" ||
                    employee.details?.has_npwp === "ya"
                    ? "Ya"
                    : employee.has_npwp === "tidak" ||
                      employee.has_npwp === false ||
                      employee.details?.has_npwp === "tidak"
                      ? "Tidak"
                      : employee.has_npwp || employee.details?.has_npwp || "—"
                }
              />

              {(employee.email || employee.username || employee.role) && (
                <>
                  <FieldItem
                    label="EMAIL AKUN"
                    value={employee.email || "—"}
                  />
                  <FieldItem
                    label="ROLE / HAK AKSES"
                    value={
                      employee.role === "hrd"
                        ? "HRD"
                        : employee.role === "director"
                          ? "Direktur"
                          : employee.role === "manager"
                            ? "Manager"
                            : employee.role === "finance"
                              ? "Finance"
                              : employee.role || "Karyawan"
                    }
                  />
                </>
              )}
            </div>
          )}

          {/* TAB 3: INFORMASI GAJI */}
          {activeTab === "gaji" && (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px 36px"
                }}
              >
                <FieldItem
                  label="GAJI POKOK"
                  value={formatRp(salaryBasic)}
                />
                <FieldItem
                  label="TUNJANGAN MAKAN"
                  value={formatRp(allowanceMeal)}
                />

                <FieldItem
                  label="TUNJANGAN JABATAN"
                  value={formatRp(allowancePosition)}
                />
                <FieldItem
                  label="TUNJANGAN TRANSPORT"
                  value={formatRp(allowanceTransport)}
                />

                <FieldItem
                  label="TUNJANGAN PROJECT"
                  value={formatRp(allowanceProject)}
                />
                <FieldItem
                  label="TUNJANGAN LAIN-LAIN"
                  value={formatRp(allowanceOther)}
                />
              </div>

              {/* Total Kompensasi Card */}
              <div
                style={{
                  marginTop: "26px",
                  background: "#f0f7ff",
                  border: "1px solid #dbeafe",
                  borderRadius: "14px",
                  padding: "20px 24px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1.2fr",
                  gap: "20px",
                  alignItems: "center"
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block"
                    }}
                  >
                    TOTAL KOMPENSASI
                  </span>
                  <div
                    style={{
                      fontSize: "26px",
                      fontWeight: 800,
                      color: "#2563eb",
                      marginTop: "4px"
                    }}
                  >
                    {formatRp(totalKompensasi)}
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block"
                    }}
                  >
                    TERBILANG
                  </span>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginTop: "4px",
                      lineHeight: "1.4"
                    }}
                  >
                    {kalimatTerbilang}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DOKUMEN PENDUKUNG */}
          {activeTab === "dokumen" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <DocumentRow
                title="KTP (Kartu Tanda Penduduk)"
                number={
                  employee.ktp_number || employee.details?.ktp_number
                    ? `Nomor: ${employee.ktp_number || employee.details?.ktp_number}`
                    : null
                }
                fileUrl={docs.ktp}
              />

              <DocumentRow
                title="Kartu Keluarga (KK)"
                number={
                  employee.kk_number || employee.details?.kk_number
                    ? `Nomor: ${employee.kk_number || employee.details?.kk_number}`
                    : null
                }
                fileUrl={docs.kk}
              />

              <DocumentRow
                title="NPWP (Nomor Pokok Wajib Pajak)"
                number={
                  employee.npwp_number || employee.details?.npwp_number
                    ? `Nomor: ${employee.npwp_number || employee.details?.npwp_number}`
                    : null
                }
                fileUrl={docs.npwp}
              />

              <DocumentRow
                title="KPJ (BPJS Ketenagakerjaan)"
                number={
                  employee.kpj_number || employee.details?.kpj_number
                    ? `Nomor: ${employee.kpj_number || employee.details?.kpj_number}`
                    : null
                }
                fileUrl={docs.kpj}
              />

              <DocumentRow
                title="JKN (BPJS Kesehatan)"
                number={
                  employee.jkn_number || employee.details?.jkn_number
                    ? `Nomor: ${employee.jkn_number || employee.details?.jkn_number}`
                    : null
                }
                fileUrl={docs.jkn}
              />

              <DocumentRow
                title="Curriculum Vitae (CV) / Riwayat Hidup"
                fileUrl={docs.cv}
              />

              <DocumentRow
                title="File Pendukung Lainnya"
                fileUrl={docs.other}
              />
            </div>
          )}

          {/* TAB 5: AKUN BANK */}
          {activeTab === "bank" && (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "24px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px"
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    backgroundColor: "#e0edff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <CreditCard size={22} color="#2563eb" />
                </div>
                <div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#2563eb"
                    }}
                  >
                    Rekening Bank Utama
                  </h4>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: "12px",
                      color: "#64748b"
                    }}
                  >
                    Rekening yang digunakan untuk penggajian karyawan.
                  </p>
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px solid #e2e8f0",
                  margin: "18px 0",
                  width: "100%"
                }}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 1fr",
                    alignItems: "center"
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    NAMA BANK
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a"
                    }}
                  >
                    {employee.bank_name ||
                      employee.bank ||
                      employee.details?.bank_name ||
                      "—"}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 1fr",
                    alignItems: "center"
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    NOMOR REKENING
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a"
                    }}
                  >
                    {employee.bank_account_number ||
                      employee.account_number ||
                      employee.details?.bank_account_number ||
                      "—"}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 1fr",
                    alignItems: "center"
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    NAMA PEMILIK REKENING
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a"
                    }}
                  >
                    {employee.bank_account_name ||
                      employee.bank_account_holder ||
                      empName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: KONTAK DARURAT (Persis Gambar Lampiran) */}
          {activeTab === "kontak" && (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "24px"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px"
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    backgroundColor: "#e0edff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}
                >
                  <Users size={22} color="#2563eb" />
                </div>
                <div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#2563eb"
                    }}
                  >
                    Kontak Darurat Utama
                  </h4>
                  <p
                    style={{
                      margin: "3px 0 0",
                      fontSize: "12px",
                      color: "#64748b"
                    }}
                  >
                    Kontak yang akan dihubungi dalam keadaan darurat.
                  </p>
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px solid #e2e8f0",
                  margin: "18px 0",
                  width: "100%"
                }}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 1fr",
                    alignItems: "center"
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    NAMA LENGKAP
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a"
                    }}
                  >
                    {employee.emergency_name ||
                      employee.details?.emergency_name ||
                      "—"}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 1fr",
                    alignItems: "center"
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    HUBUNGAN
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a"
                    }}
                  >
                    {employee.emergency_relation ||
                      employee.details?.emergency_relation ||
                      "—"}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 1fr",
                    alignItems: "center"
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px"
                    }}
                  >
                    NOMOR TELEPON
                  </span>
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "#0f172a"
                    }}
                  >
                    {employee.emergency_phone ||
                      employee.details?.emergency_phone ||
                      "—"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: KENDARAAN */}
          {activeTab === "kendaraan" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Card SIM & STNK */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "14px",
                  padding: "20px 24px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px"
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      backgroundColor: "#e0edff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <CarFront size={22} color="#2563eb" />
                  </div>
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#2563eb"
                      }}
                    >
                      Identitas Dokumen Kendaraan
                    </h4>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: "12px",
                        color: "#64748b"
                      }}
                    >
                      Surat Izin Mengemudi (SIM) & STNK operasional karyawan.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px solid #e2e8f0",
                    margin: "18px 0",
                    width: "100%"
                  }}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px 32px"
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        display: "block"
                      }}
                    >
                      NOMOR SIM
                    </span>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#0f172a",
                        marginTop: "4px"
                      }}
                    >
                      {employee.sim_number ||
                        employee.details?.sim_number ||
                        "—"}
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      {fileSim ? (
                        <a
                          href={fileSim}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            borderRadius: "8px",
                            color: "#2563eb",
                            fontSize: "12px",
                            fontWeight: 600,
                            textDecoration: "none"
                          }}
                        >
                          <ExternalLink size={13} /> Lihat File SIM
                        </a>
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            background: "#f1f5f9",
                            color: "#94a3b8",
                            fontSize: "11px",
                            fontWeight: 600
                          }}
                        >
                          File SIM belum ada
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#64748b",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        display: "block"
                      }}
                    >
                      NOMOR STNK
                    </span>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#0f172a",
                        marginTop: "4px"
                      }}
                    >
                      {employee.stnk_number ||
                        employee.details?.stnk_number ||
                        "—"}
                    </div>
                    <div style={{ marginTop: "8px" }}>
                      {fileStnk ? (
                        <a
                          href={fileStnk}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 12px",
                            background: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            borderRadius: "8px",
                            color: "#2563eb",
                            fontSize: "12px",
                            fontWeight: 600,
                            textDecoration: "none"
                          }}
                        >
                          <ExternalLink size={13} /> Lihat File STNK
                        </a>
                      ) : (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            background: "#f1f5f9",
                            color: "#94a3b8",
                            fontSize: "11px",
                            fontWeight: 600
                          }}
                        >
                          File STNK belum ada
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Foto Fisik Kendaraan */}
              <div>
                <h4
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: "0 0 10px 0"
                  }}
                >
                  Foto Fisik Kendaraan:
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "14px"
                  }}
                >
                  <VehiclePhotoCard
                    label="Tampak Depan"
                    photoUrl={fileVehicleFront}
                  />
                  <VehiclePhotoCard
                    label="Tampak Belakang"
                    photoUrl={fileVehicleBack}
                  />
                  <VehiclePhotoCard
                    label="Tampak Samping"
                    photoUrl={fileVehicleSide}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            padding: "16px 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "10px",
            background: "#ffffff"
          }}
        >
          <button
            type="button"
            onClick={onEdit}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 18px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              background: "#ffffff",
              color: "#334155",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <Pencil size={14} /> Edit Data
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "9px 24px",
              borderRadius: "8px",
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: "0 2px 4px rgba(37, 99, 235, 0.2)"
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Komponen reusable untuk label + value
 */
function FieldItem({ label, value, fullWidth = false }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        gridColumn: fullWidth ? "1 / -1" : "auto"
      }}
    >
      <span
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#64748b",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "#0f172a",
          lineHeight: "1.4"
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}

/**
 * Komponen baris dokumen
 */
function DocumentRow({ title, number, fileUrl }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        transition: "border-color 0.15s ease"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#2563eb"
          }}
        >
          <FileText size={18} />
        </div>
        <div>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
            {title}
          </div>
          {number && (
            <div style={{ fontSize: "11.5px", color: "#64748b", marginTop: "2px" }}>
              {number}
            </div>
          )}
        </div>
      </div>

      <div>
        {fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 14px",
              borderRadius: "8px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              color: "#2563eb",
              fontSize: "12px",
              fontWeight: 600,
              textDecoration: "none"
            }}
          >
            <ExternalLink size={13} /> Lihat Dokumen
          </a>
        ) : (
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: "6px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#94a3b8",
              fontSize: "11px",
              fontWeight: 500
            }}
          >
            Belum Diunggah
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Komponen preview foto kendaraan
 */
function VehiclePhotoCard({ label, photoUrl }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#ffffff"
      }}
    >
      <div
        style={{
          height: "120px",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden"
        }}
      >
        {photoUrl ? (
          <a
            href={photoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ width: "100%", height: "100%" }}
            title="Klik untuk melihat resolusi penuh"
          >
            <img
              src={photoUrl}
              alt={label}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              }}
            />
          </a>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "10px",
              color: "#94a3b8",
              fontSize: "11px"
            }}
          >
            <CarFront size={24} style={{ margin: "0 auto 4px", opacity: 0.4 }} />
            Belum diunggah
          </div>
        )}
      </div>
      <div
        style={{
          padding: "8px 12px",
          fontSize: "12px",
          fontWeight: 600,
          color: "#334155",
          textAlign: "center",
          background: "#ffffff",
          borderTop: "1px solid #f1f5f9"
        }}
      >
        {label}
      </div>
    </div>
  );
}
