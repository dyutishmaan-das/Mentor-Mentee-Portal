import { useState } from "react";
import { Save } from "lucide-react";
import api from "../api";
import { buttonClass, inputClass } from "../constants/ui";
import { errorMessage } from "../utils/formatters";
import PageTitle from "../components/ui/PageTitle";
import Field from "../components/ui/Field";
export default function SettingsPage({user,notify}) {
  const [form,setForm]=useState(user);
  const save=async e=>{e.preventDefault();try{const {data}=await api.patch("/auth/me",form);localStorage.setItem("user",JSON.stringify(data));notify("Settings updated");}catch(error){notify(errorMessage(error),"error");}};
  return <><PageTitle kicker="Account" title="Settings" desc="Update your personal and security information."/><form onSubmit={save} className="mt-6 max-w-2xl space-y-4 rounded-2xl border bg-white p-6">{[["Name","name"],["Phone","phone"],["Department","department"]].map(([label,key])=><Field key={key} label={label}><input className={inputClass} value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})}/></Field>)}<Field label="New password"><input type="password" minLength="8" className={inputClass} value={form.password||""} onChange={e=>setForm({...form,password:e.target.value})}/></Field><button className={`${buttonClass} bg-teal-700 text-white`}><Save size={16}/>Save changes</button></form></>;
}
