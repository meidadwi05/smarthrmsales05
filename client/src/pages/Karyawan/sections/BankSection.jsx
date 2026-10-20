import React from "react";
import { CreditCard } from "lucide-react";
import { Section, Field, UploadField } from "../FormUI.jsx";
export default function BankSection({form,setForm,files,setFiles}) {return <Section title="Detail Akun Bank" icon={CreditCard}><Field label="Nama Pemilik Rekening" name="bank_account_name" form={form} setForm={setForm}/><Field label="Nomor Rekening" name="bank_account_number" form={form} setForm={setForm}/><Field label="Bank" name="bank_name" form={form} setForm={setForm} options={["BCA","Mandiri","BNI","BRI","BTN","CIMB Niaga","Bank Lainnya"]}/></Section>}
