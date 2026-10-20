import React from "react";
import { Phone } from "lucide-react";
import { Section, Field, UploadField } from "../FormUI.jsx";
export default function KontakSection({form,setForm,files,setFiles}) {return <Section title="Kontak Darurat" icon={Phone}><Field label="Nama Lengkap" name="emergency_name" form={form} setForm={setForm}/><Field label="Hubungan" name="emergency_relation" form={form} setForm={setForm} options={["Orang Tua","Suami","Istri","Saudara Kandung","Kerabat","Teman","Lainnya"]}/><Field label="Nomor Telepon" name="emergency_phone" form={form} setForm={setForm}/></Section>}
