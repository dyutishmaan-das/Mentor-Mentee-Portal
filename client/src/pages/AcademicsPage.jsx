import { useState } from "react";
import { Plus, Save } from "lucide-react";
import api from "../api";
import { buttonClass, inputClass } from "../constants/ui";
import { errorMessage } from "../utils/formatters";
import PageTitle from "../components/ui/PageTitle";
import Modal from "../components/ui/Modal";
import Empty from "../components/ui/Empty";
import Field from "../components/ui/Field";
import StudentSelect from "../components/students/StudentSelect";
export default function AcademicsPage({notify}) {
  const [student,setStudent]=useState(""),[list,setList]=useState([]),[modal,setModal]=useState(false);
  const load=id=>id?api.get(`/academics?student=${id}`).then(r=>setList(r.data)).catch(e=>notify(errorMessage(e),"error")):setList([]);
  const save=async e=>{e.preventDefault();const form=new FormData(e.currentTarget);try{const internal=Number(form.get("internal")),external=Number(form.get("external"));await api.post("/academics",{student,semester:Number(form.get("semester")),sgpa:Number(form.get("sgpa")),aggregate:Number(form.get("aggregate")),subjects:[{name:form.get("subject"),code:form.get("code"),internal,external,total:internal+external}]});notify("Academic record saved");setModal(false);await load(student);}catch(error){notify(errorMessage(error),"error");}};
  return <><PageTitle kicker="Semester progression" title="Academics" desc="Marks, SGPA, aggregate, subject performance and backlogs." action={<button disabled={!student} onClick={()=>setModal(true)} className={`${buttonClass} bg-teal-700 text-white`}><Plus size={16}/>Add semester</button>}/><div className="mt-6 max-w-xl"><StudentSelect value={student} onChange={e=>{setStudent(e.target.value);void load(e.target.value);}}/></div><div className="mt-5 grid gap-4 lg:grid-cols-2">{list.length?list.map(a=><div key={a._id} className="rounded-2xl border bg-white p-5"><div className="flex justify-between"><h3 className="font-display text-lg font-bold">Semester {a.semester}</h3><b className="text-teal-700">SGPA {a.sgpa||"—"}</b></div><p className="text-sm text-slate-500">Aggregate {a.aggregate||0}% · Backlogs {a.backlogs?.length||0}</p><div className="mt-4 divide-y">{a.subjects.map((s,i)=><div key={i} className="flex justify-between py-2 text-sm"><span>{s.name} {s.code}</span><b>{s.total}</b></div>)}</div></div>):<div className="lg:col-span-2"><Empty text={student?"No academic records":"Select a student"}/></div>}</div>{modal&&<Modal title="Add academic record" close={()=>setModal(false)}><form onSubmit={save} className="mt-6 grid gap-4 sm:grid-cols-2">{[["Semester","semester","number"],["SGPA","sgpa","number"],["Aggregate %","aggregate","number"],["Subject name","subject","text"],["Subject code","code","text"],["Internal marks","internal","number"],["External marks","external","number"]].map(([label,name,type])=><Field key={name} label={label}><input name={name} type={type} required={["semester","subject"].includes(name)} className={inputClass}/></Field>)}<button className={`${buttonClass} bg-teal-700 text-white sm:col-span-2`}><Save size={16}/>Save record</button></form></Modal>}</>;
}
