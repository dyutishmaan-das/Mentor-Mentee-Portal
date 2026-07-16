import { useEffect, useState } from "react";
import { Plus, Trash2, ClipboardList, Save } from "lucide-react";
import api from "../api";
import { buttonClass, inputClass, recordCategories } from "../constants/ui";
import { errorMessage, formatDate } from "../utils/formatters";
import PageTitle from "../components/ui/PageTitle";
import Modal from "../components/ui/Modal";
import Empty from "../components/ui/Empty";
import Field from "../components/ui/Field";
import StudentSelect from "../components/students/StudentSelect";
export default function RecordsPage({notify}) {
  const [student,setStudent]=useState(""),[category,setCategory]=useState("certification"),[list,setList]=useState([]),[modal,setModal]=useState(false);
  const load=(s=student,c=category)=>s?api.get(`/records?student=${s}&category=${c}`).then(r=>setList(r.data)).catch(e=>notify(errorMessage(e),"error")):setList([]);
  useEffect(()=>{void load();},[student,category]);
  const save=async e=>{e.preventDefault();try{const data=Object.fromEntries(new FormData(e.currentTarget));await api.post("/records",{...data,student,category,semester:Number(data.semester)});notify("Record saved");setModal(false);await load();}catch(error){notify(errorMessage(error),"error");}};
  const remove=async id=>{try{await api.delete(`/records/${id}`);await load();}catch(e){notify(errorMessage(e),"error");}};
  return <><PageTitle kicker="Complete diary records" title="Activities & other records" desc="Certifications, internships, clubs, achievements, discipline and parent visits." action={<button disabled={!student} onClick={()=>setModal(true)} className={`${buttonClass} bg-teal-700 text-white`}><Plus size={16}/>Add record</button>}/><div className="mt-6 grid gap-3 sm:grid-cols-2"><StudentSelect value={student} onChange={e=>setStudent(e.target.value)}/><select className={inputClass} value={category} onChange={e=>setCategory(e.target.value)}>{recordCategories.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div><div className="mt-5 space-y-3">{list.length?list.map(r=><div key={r._id} className="flex items-center gap-4 rounded-2xl border bg-white p-5"><ClipboardList className="text-teal-700"/><div className="flex-1"><b>{r.title}</b><p className="text-sm text-slate-500">{r.organization} · Semester {r.semester} · {formatDate(r.date)}</p></div><button onClick={()=>remove(r._id)} className="text-rose-600"><Trash2 size={16}/></button></div>):<Empty text={student?"No records in this category":"Select a student"}/>}</div>{modal&&<Modal title="Add diary record" close={()=>setModal(false)}><form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Title"><input name="title" required className={inputClass}/></Field><Field label="Semester"><input name="semester" type="number" min="1" max="8" required className={inputClass}/></Field><Field label="Organization / parent"><input name="organization" className={inputClass}/></Field><Field label="Date"><input name="date" type="date" className={inputClass}/></Field><Field label="Result"><input name="result" className={inputClass}/></Field><Field label="Details" span><textarea name="details" className={inputClass}/></Field><button className={`${buttonClass} bg-teal-700 text-white sm:col-span-2`}><Save size={16}/>Save record</button></form></Modal>}</>;
}
