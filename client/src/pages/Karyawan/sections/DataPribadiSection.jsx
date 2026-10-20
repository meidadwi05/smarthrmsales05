import React from "react";
import { Users } from "lucide-react";
import { Section, Field, ProfileUploadField } from "../FormUI";

export default function DataPribadiSection({
    form,
    setForm,
    files,
    setFiles
}) {
    const genderOptions = [
        { value: "Laki-laki", label: "Laki-laki" },
        { value: "Perempuan", label: "Perempuan" }
    ];

    const pendidikanOptions = [
        { value: "SD", label: "SD" },
        { value: "SMP", label: "SMP" },
        { value: "SMA/SMK", label: "SMA/SMK" },
        { value: "D1", label: "D1" },
        { value: "D2", label: "D2" },
        { value: "D3", label: "D3" },
        { value: "S1", label: "S1" },
        { value: "S2", label: "S2" },
        { value: "S3", label: "S3" }
    ];

    const agamaOptions = [
        { value: "Islam", label: "Islam" },
        { value: "Kristen", label: "Kristen" },
        { value: "Katolik", label: "Katolik" },
        { value: "Hindu", label: "Hindu" },
        { value: "Buddha", label: "Buddha" },
        { value: "Konghucu", label: "Konghucu" }
    ];

    return (
        <Section title="Data Pribadi" icon={Users}>
            <ProfileUploadField
                label="File Foto Profil"
                name="photo_profile"
                files={files}
                setFiles={setFiles}
                required
            />


            <div
                style={{
                    paddingTop: "7px",
                    width: "100%",
                    minWidth: 0,
                    boxSizing: "border-box"
                }}
            >
                <Field
                    label="Nama Karyawan"
                    name="nama_karyawan"
                    form={form}
                    setForm={setForm}
                    placeholder="Nama Karyawan"
                    required
                />
            </div>

            <Field
                label="Nomor Telepon"
                name="nomor_telepon"
                form={form}
                setForm={setForm}
                placeholder="08xxx"
                required
            />

            <Field
                label="Tempat Lahir"
                name="tempat_lahir"
                form={form}
                setForm={setForm}
                placeholder="Tempat Lahir"
                required
            />

            <Field
                label="Tanggal Lahir"
                name="tanggal_lahir"
                type="date"
                form={form}
                setForm={setForm}
                required
            />

            <Field
                label="Jenis Kelamin"
                name="jenis_kelamin"
                form={form}
                setForm={setForm}
                options={genderOptions}
                required
            />

            <Field
                label="Alamat KTP"
                name="alamat_ktp"
                form={form}
                setForm={setForm}
                textarea
                rows={4}
                full
                required
                helperText="*) Isi alamat sesuai KTP"
            />

            <Field
                label="Alamat Domisili"
                name="alamat_domisili"
                form={form}
                setForm={setForm}
                textarea
                rows={4}
                full
                required
                helperText="*) Jika mengisi domisili harap input nama kota"
            />

            <Field
                label="Pendidikan"
                name="pendidikan"
                form={form}
                setForm={setForm}
                options={pendidikanOptions}
                required
            />

            <Field
                label="Agama"
                name="agama"
                form={form}
                setForm={setForm}
                options={agamaOptions}
                required
            />

            <Field
                label="Nama Suami/Istri"
                name="nama_suami_istri"
                form={form}
                setForm={setForm}
                placeholder="contoh: nama1, nama2, dst"
            />

            <Field
                label="Nama Anak"
                name="nama_anak"
                form={form}
                setForm={setForm}
                placeholder="Contoh: Nama1, Nama2, dst"
            />

            <Field
                label="Jumlah Anak"
                name="jumlah_anak"
                form={form}
                setForm={setForm}
                placeholder="Total jumlah anak"
            />

            <Field
                label="Nama Bapak"
                name="nama_bapak"
                form={form}
                setForm={setForm}
                placeholder="Nama Bapak"
            />

            <Field
                label="Nama Ibu"
                name="nama_ibu"
                form={form}
                setForm={setForm}
                placeholder="Nama Ibu"
            />
        </Section>
    );
}