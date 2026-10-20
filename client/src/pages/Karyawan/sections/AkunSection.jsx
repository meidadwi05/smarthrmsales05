import React from "react";
import { UserRound } from "lucide-react";
import { Section, Field } from "../FormUI.jsx";

const ROLE_OPTIONS = [
  { value: "employee", label: "Karyawan" },
  { value: "manager", label: "Atasan / Manager" },
  { value: "director", label: "Direktur" },
  { value: "hrd", label: "HRD" },
  { value: "finance", label: "Finance" }
];

export default function AkunSection({ form, setForm }) {
  return (
    <Section title="Informasi Akun" icon={UserRound}>
      <Field
        label="Username"
        name="username"
        form={form}
        setForm={setForm}
        placeholder="Masukkan username"
      />

      <Field
        label="Email"
        name="email"
        type="email"
        form={form}
        setForm={setForm}
        placeholder="alamat@email.com"
        required
      />

      <Field
        label="Password"
        name="password"
        type="password"
        form={form}
        setForm={setForm}
        placeholder="Masukkan password"
        helperText="*) Jika password tidak diisi maka memakai password otomatis 123456"
      />

      <Field
        label="Role"
        name="role"
        form={form}
        setForm={setForm}
        options={ROLE_OPTIONS}
        required
      />
    </Section>
  );
}
