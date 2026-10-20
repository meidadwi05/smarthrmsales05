import React, { useMemo } from "react";
import { BriefcaseBusiness } from "lucide-react";
import { Section, Field } from "../FormUI.jsx";

const KATEGORI_KARYAWAN_OPTIONS = [
    "Full Time",
    "Internship",
    "Magang",
    "PKWT",
    "PKWTT",
    "KHL",
    "Harian",
    "Borongan"
];

const MARITAL_STATUS_OPTIONS = [
    "TK/0",
    "TK/1",
    "TK/2",
    "TK/3",
    "K/0",
    "K/1",
    "K/2",
    "K/3"
];

const STATUS_OPTIONS = ["Aktif", "Tidak Aktif"];

const NPWP_OPTIONS = [
    { value: "ya", label: "YA" },
    { value: "tidak", label: "TIDAK" }
];

export default function DataKepegawaianSection({
    form,
    setForm,
    files,
    setFiles,
    divisions = [],
    positions = [],
    departments = []
}) {
    const divisionOptions = useMemo(() => {
        return divisions.map((d) => d.name);
    }, [divisions]);

    const positionOptions = useMemo(() => {
        return positions.map((p) => p.name);
    }, [positions]);

    const departmentOptions = useMemo(() => {
        const selectedDivision = divisions.find((v) => v.name === form?.division);
        return departments
            .filter((d) => {
                if (!form?.division || !d.division_id) return true;
                return selectedDivision?.id === d.division_id;
            })
            .map((d) => d.name);
    }, [departments, divisions, form?.division]);

    return (
        <Section title="Data Kepegawaian" icon={BriefcaseBusiness}>
            <Field
                label="ID Karyawan"
                name="employee_code"
                form={form}
                setForm={setForm}
                placeholder="Masukkan ID Karyawan"
                required
            />

            <Field
                label="Divisi"
                name="division"
                form={form}
                setForm={setForm}
                options={divisionOptions}
                required
            />

            <Field
                label="Jabatan"
                name="position"
                form={form}
                setForm={setForm}
                options={positionOptions}
                required
            />

            <Field
                label="Bagian"
                name="department"
                form={form}
                setForm={setForm}
                options={departmentOptions}
                required
            />

            <Field
                label="Lokasi Kerja"
                name="work_location"
                form={form}
                setForm={setForm}
                placeholder="Masukkan lokasi kerja"
                required
            />

            <Field
                label="Tanggal Bergabung"
                name="join_date"
                type="date"
                form={form}
                setForm={setForm}
                required
            />

            <Field
                label="Tanggal Kontrak"
                name="contract_start"
                type="date"
                form={form}
                setForm={setForm}
            />

            <Field
                label="Selesai Kontrak"
                name="contract_end"
                type="date"
                form={form}
                setForm={setForm}
            />

            <Field
                label="Grup"
                name="group"
                form={form}
                setForm={setForm}
                placeholder="Masukkan grup"
            />

            <Field
                label="Kategori Karyawan"
                name="category"
                form={form}
                setForm={setForm}
                options={KATEGORI_KARYAWAN_OPTIONS}
                required
            />

            <Field
                label="Status Marital"
                name="marital_status"
                form={form}
                setForm={setForm}
                options={MARITAL_STATUS_OPTIONS}
                required
            />

            <Field
                label="Referensi"
                name="reference"
                form={form}
                setForm={setForm}
                placeholder="Masukkan referensi"
            />

            <Field
                label="No SIO"
                name="sio_number"
                form={form}
                setForm={setForm}
                placeholder="Masukkan nomor SIO"
            />

            <Field
                label="Status Akun"
                name="account_status"
                form={form}
                setForm={setForm}
                options={STATUS_OPTIONS}
                required
            />

            <Field
                label="Status Kerja"
                name="work_status"
                form={form}
                setForm={setForm}
                options={STATUS_OPTIONS}
                required
            />

            <Field
                label="Apakah karyawan memiliki NPWP?"
                name="has_npwp"
                form={form}
                setForm={setForm}
                options={NPWP_OPTIONS}
                required
            />
        </Section>
    );
}
