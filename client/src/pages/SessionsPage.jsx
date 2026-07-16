import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Save } from "lucide-react";
import api from "../api";
import { buttonClass, inputClass } from "../constants/ui";
import { errorMessage, formatDate, initials } from "../utils/formatters";
import PageTitle from "../components/ui/PageTitle";
import Modal from "../components/ui/Modal";
import Empty from "../components/ui/Empty";
import Field from "../components/ui/Field";
import StudentSelect from "../components/students/StudentSelect";
export default function SessionsPage({ notify }) {
  const [list,setList]=useState([]),[modal,setModal]=useState(false),[edit,setEdit]=useState(null),[selected,setSelected]=useState("");
  const load=()=>api.get("/sessions").then(r=>setList(r.data)).catch(e=>notify(errorMessage(e),"error"));
  useEffect(()=>{void load();},[]);
  const open=session=>{setEdit(session||null);setSelected(session?.student?._id||"");setModal(true);};
  const save=async event=>{event.preventDefault();try{const body=Object.fromEntries(new FormData(event.currentTarget));edit?await api.patch(`/sessions/${edit._id}`,body):await api.post("/sessions",body);notify("Session saved");setModal(false);await load();}catch(e){notify(errorMessage(e),"error");}};
  const remove=async id=>{if(confirm("Delete this session?")){try{await api.delete(`/sessions/${id}`);await load();}catch(e){notify(errorMessage(e),"error");}}};
  return <><PageTitle kicker="Mentoring" title="Sessions" desc="Schedule meetings and document proceedings." action={<button onClick={()=>open()} className={`${buttonClass} bg-teal-700 text-white`}><Plus size={16}/>New session</button>}/><div className="mt-6 space-y-3">{list.length?list.map(s=><div key={s._id} className="flex items-center gap-4 rounded-2xl border bg-white p-5"><div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 font-bold text-teal-700">{initials(s.student?.user?.name)}</div><div className="flex-1"><b>{s.student?.user?.name}</b><p className="text-sm text-slate-500">{s.agenda}</p></div><div><b className="text-sm">{formatDate(s.scheduledAt)}</b><p className="text-xs uppercase text-teal-700">{s.status}</p></div><button onClick={()=>open(s)} className="text-teal-700"><Pencil size={16}/></button><button onClick={()=>remove(s._id)} className="text-rose-600"><Trash2 size={16}/></button></div>):<Empty text="No sessions recorded"/>}</div>{modal&&<Modal title={edit?"Update session":"New session"} close={()=>setModal(false)}><form onSubmit={save} className="mt-6 space-y-4"><Field label="Student"><StudentSelect name="student" value={selected} onChange={e=>setSelected(e.target.value)}/></Field><Field label="Date and time"><input name="scheduledAt" type="datetime-local" required className={inputClass} defaultValue={edit?.scheduledAt?.slice(0,16)}/></Field><Field label="Agenda"><input name="agenda" required className={inputClass} defaultValue={edit?.agenda}/></Field><Field label="Discussion"><textarea name="discussion" className={inputClass} defaultValue={edit?.discussion}/></Field><Field label="Status"><select name="status" className={inputClass} defaultValue={edit?.status||"scheduled"}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></Field><button className={`${buttonClass} w-full bg-teal-700 text-white`}><Save size={16}/>Save session</button></form></Modal>}</>;
}
