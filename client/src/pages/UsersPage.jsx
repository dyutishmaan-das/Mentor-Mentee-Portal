import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import api from "../api";
import { buttonClass, inputClass } from "../constants/ui";
import { errorMessage } from "../utils/formatters";
import PageTitle from "../components/ui/PageTitle";
import Modal from "../components/ui/Modal";
import Field from "../components/ui/Field";
export default function UsersPage({notify}) {
  const [list,setList]=useState([]),[modal,setModal]=useState(false);
  const load=()=>api.get("/users").then(r=>setList(r.data)).catch(e=>notify(errorMessage(e),"error"));
  useEffect(()=>{void load();},[]);
  const save=async e=>{e.preventDefault();try{await api.post("/users",Object.fromEntries(new FormData(e.currentTarget)));notify("User created");setModal(false);await load();}catch(error){notify(errorMessage(error),"error");}};
  const toggle=async user=>{try{await api.patch(`/users/${user._id}`,{active:!user.active});await load();}catch(e){notify(errorMessage(e),"error");}};
  return <><PageTitle kicker="Administration" title="Users & roles" desc="Manage administrators, HoDs and mentors." action={<button onClick={()=>setModal(true)} className={`${buttonClass} bg-teal-700 text-white`}><Plus size={16}/>Add user</button>}/><div className="mt-6 overflow-x-auto rounded-2xl border bg-white"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th></tr></thead><tbody className="divide-y">{list.map(u=><tr key={u._id}><td className="p-4 font-bold">{u.name}</td><td>{u.email}</td><td className="uppercase">{u.role}</td><td>{u.department}</td><td><button onClick={()=>toggle(u)}>{u.active?"Active":"Inactive"}</button></td></tr>)}</tbody></table></div>{modal&&<Modal title="Create university user" close={()=>setModal(false)}><form onSubmit={save} className="mt-6 space-y-4"><Field label="Full name"><input name="name" required className={inputClass}/></Field><Field label="Email"><input name="email" type="email" required className={inputClass}/></Field><Field label="Password"><input name="password" type="password" minLength="8" required className={inputClass}/></Field><Field label="Role"><select name="role" className={inputClass}><option value="mentor">Mentor</option><option value="hod">HoD</option><option value="admin">Administrator</option></select></Field><Field label="Department"><input name="department" className={inputClass}/></Field><button className={`${buttonClass} w-full bg-teal-700 text-white`}>Create user</button></form></Modal>}</>;
}
