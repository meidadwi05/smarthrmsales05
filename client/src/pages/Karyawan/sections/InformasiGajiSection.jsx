import React from "react";
import { Wallet } from "lucide-react";
import { Section, Field, UploadField } from "../FormUI.jsx";
export default function InformasiGajiSection({form,setForm,files,setFiles}) {return <Section title="Informasi Gaji" icon={Wallet}>{[["Gaji Pokok","salary_basic"],["Tunjangan Jabatan","allowance_position"],["Tunjangan Project","allowance_project"],["Tunjangan Makan","allowance_meal"],["Tunjangan Transport","allowance_transport"],["Tunjangan Lain-lain","allowance_other"]].map(([label,name])=><Field key={name} label={label} name={name} type="number" form={form} setForm={setForm} placeholder="Rp 0"/>)}</Section>}
