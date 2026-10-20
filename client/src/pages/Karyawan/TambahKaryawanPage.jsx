import React, {useState} from "react";
import {ChevronRight, ArrowLeft, Save} from "lucide-react";
import AkunSection from "./sections/AkunSection.jsx";
import DataPribadiSection from "./sections/DataPribadiSection.jsx";
import DataKepegawaianSection from "./sections/DataKepegawaianSection.jsx";
import InformasiGajiSection from "./sections/InformasiGajiSection.jsx";
import DokumenSection from "./sections/DokumenSection.jsx";
import BankSection from "./sections/BankSection.jsx";
import KontakSection from "./sections/KontakSection.jsx";
import KendaraanSection from "./sections/KendaraanSection.jsx";
export default function TambahKaryawanPage({API,initialData={},divisions=[],positions=[],departments=[],fetchWithAuth,onCancel,onSaved}){
 const [form,setForm]=useState({...initialData, username:"",email:"",password:"",role:"employee"});
 const [files,setFiles]=useState({}); const [saving,setSaving]=useState(false); const [error,setError]=useState("");
 async function submit(e){e.preventDefault();setError("");setSaving(true);try{
 // API /api/employees saat ini hanya menyimpan field lama. Jangan mengirim password atau dokumen mentah ke endpoint itu.
 const {employee_code,name,photo,division,position,department,join_date,category,contract_start,contract_end,work_status,account_status,contract_reminder}=form;
 const res=await fetchWithAuth(`${API}/api/employees`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({employee_code,name,photo,division,position,department,join_date,category,contract_start,contract_end,work_status,account_status,contract_reminder})});
 const body=await res.json();if(!res.ok)throw new Error(body.error||"Gagal menyimpan karyawan");onSaved?.();
 }catch(e){setError(e.message||"Gagal menyimpan karyawan")}finally{setSaving(false)}}
 const shared={form,setForm,files,setFiles};
 return <main className="employee-add-page" style={{width:"100%",margin:"0 auto",paddingBottom:32}}>
 <nav aria-label="Breadcrumb" style={{display:"flex",alignItems:"center",gap:8,fontSize:12,color:"#7b8aa2",marginBottom:15}}>
   <button type="button" onClick={onCancel} style={{border:0,background:"none",color:"#2563eb",fontWeight:600,cursor:"pointer",padding:0}}>Data Karyawan</button>
   <ChevronRight size={14}/><span style={{color:"#34455f",fontWeight:700}}>Tambah Karyawan</span>
 </nav>
 <div style={{background:"#ffffff",border:"1px solid #e3eaf4",borderRadius:14,overflow:"hidden",boxShadow:"0 12px 26px rgba(36,64,112,0.07)"}}>
   <div style={{padding:"20px 22px",borderBottom:"1px solid #edf1f7",background:"#ffffff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
     <div><h1 style={{fontSize:17,fontWeight:750,margin:0,color:"#1b293f"}}>Tambah Karyawan</h1><p style={{fontSize:12,color:"#8090aa",margin:"5px 0 0"}}>Isi data karyawan pada halaman ini.</p></div>
     <button type="button" aria-label="Kembali ke Data Karyawan" onClick={onCancel} style={{background:"transparent",border:0,color:"#8d9eb6",fontSize:23,cursor:"pointer"}}>×</button>
   </div>
   <form onSubmit={submit}>
     <AkunSection {...shared}/><DataPribadiSection {...shared}/><DataKepegawaianSection {...shared} divisions={divisions} positions={positions} departments={departments}/><InformasiGajiSection {...shared}/><DokumenSection {...shared}/><BankSection {...shared}/><KontakSection {...shared}/><KendaraanSection {...shared}/>
     <div style={{padding:"13px 20px",color:"#826024",background:"#fffaf0",fontSize:11,borderBottom:"1px solid #f0e4cd"}}>Penyimpanan sementara hanya mencakup data karyawan dasar. Data akun, gaji, dokumen, bank, kontak, dan kendaraan belum tersimpan di backend.</div>
     {error&&<p role="alert" style={{color:"#be123c",fontSize:12,padding:"0 20px"}}>{error}</p>}
     <footer style={{background:"#ffffff",borderTop:"1px solid #e3eaf4",padding:"14px 20px",display:"flex",justifyContent:"flex-end",gap:9}}>
       <button type="button" className="secondary" onClick={onCancel}>Batal</button>
       <button type="submit" className="primary compact" disabled={saving}>{saving?"Menyimpan...":"Simpan Data Dasar"}</button>
     </footer>
   </form>
 </div>
 <style>{`.content:has(.employee-add-page) > .content-breadcrumb { display: none; } @media(max-width:720px){.employee-form-grid{grid-template-columns:1fr !important;}}`}</style>
 </main>
}
