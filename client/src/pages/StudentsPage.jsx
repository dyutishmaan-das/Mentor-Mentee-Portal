import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Save } from "lucide-react";
import api from "../api";
import { buttonClass, inputClass } from "../constants/ui";
import { errorMessage } from "../utils/formatters";
import PageTitle from "../components/ui/PageTitle";
import Modal from "../components/ui/Modal";
import Empty from "../components/ui/Empty";
import Field from "../components/ui/Field";

function StudentForm({ close, onSaved, student, notify }) {
  const [mentors, setMentors] = useState([]);
  const [form, setForm] = useState(student ? { ...student, name: student.user?.name, email: student.user?.email, phone: student.user?.phone } : { name: "", email: "", password: "", enrollmentNo: "", course: "", branch: "", semester: 1, batch: "", mentor: "", attendance: 0, cgpa: 0, risk: "On track" });
  useEffect(() => { void api.get("/users?role=mentor").then(r => setMentors(r.data)).catch(() => {}); }, []);
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const submit = async event => {
    event.preventDefault();
    try {
      const payload = { ...form, semester: Number(form.semester), attendance: Number(form.attendance), cgpa: Number(form.cgpa), mentor: form.mentor?._id || form.mentor || undefined };
      student ? await api.patch(`/students/${student._id}`, payload) : await api.post("/students", payload);
      notify("Student saved"); await onSaved(); close();
    } catch (error) { notify(errorMessage(error), "error"); }
  };
  return <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
    <Field label="Student name"><input className={inputClass} required value={form.name} onChange={e => set("name", e.target.value)}/></Field>
    <Field label="Email"><input className={inputClass} type="email" required value={form.email} onChange={e => set("email", e.target.value)}/></Field>
    {!student && <Field label="Initial password"><input className={inputClass} type="password" minLength="8" required value={form.password} onChange={e => set("password", e.target.value)}/></Field>}
    <Field label="Enrollment number"><input className={inputClass} required value={form.enrollmentNo} onChange={e => set("enrollmentNo", e.target.value)}/></Field>
    <Field label="Course"><input className={inputClass} required value={form.course} onChange={e => set("course", e.target.value)}/></Field>
    <Field label="Branch"><input className={inputClass} required value={form.branch} onChange={e => set("branch", e.target.value)}/></Field>
    <Field label="Semester"><input className={inputClass} type="number" min="1" max="8" value={form.semester} onChange={e => set("semester", e.target.value)}/></Field>
    <Field label="Batch"><input className={inputClass} value={form.batch || ""} onChange={e => set("batch", e.target.value)}/></Field>
    <Field label="Mentor"><select className={inputClass} value={form.mentor?._id || form.mentor || ""} onChange={e => set("mentor", e.target.value)}><option value="">Unassigned</option>{mentors.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}</select></Field>
    <Field label="Attendance %"><input className={inputClass} type="number" min="0" max="100" value={form.attendance} onChange={e => set("attendance", e.target.value)}/></Field>
    <Field label="CGPA"><input className={inputClass} type="number" min="0" max="10" step=".01" value={form.cgpa} onChange={e => set("cgpa", e.target.value)}/></Field>
    <Field label="Risk"><select className={inputClass} value={form.risk} onChange={e => set("risk", e.target.value)}>{["On track", "Watch", "Needs attention"].map(x => <option key={x}>{x}</option>)}</select></Field>
    <button className={`${buttonClass} bg-teal-700 text-white sm:col-span-2`}><Save size={16}/>Save student</button>
  </form>;
}

export default function StudentsPage({ user, notify }) {
  const [list, setList] = useState([]), [query, setQuery] = useState(""), [modal, setModal] = useState(false), [edit, setEdit] = useState(null);
  const load = () => api.get("/students").then(r => setList(r.data)).catch(e => notify(errorMessage(e), "error"));
  useEffect(() => { void load(); }, []);
  const remove = async student => { if (!confirm(`Delete ${student.user?.name} and all related records?`)) return; try { await api.delete(`/students/${student._id}`); notify("Student deleted"); await load(); } catch (e) { notify(errorMessage(e), "error"); } };
  const filtered = list.filter(s => `${s.user?.name} ${s.enrollmentNo}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageTitle kicker="Student management" title="Students" desc="Create and maintain complete mentee profiles." action={["admin","hod"].includes(user.role) && <button onClick={() => { setEdit(null); setModal(true); }} className={`${buttonClass} bg-teal-700 text-white`}><Plus size={16}/>Add student</button>}/><div className="relative mt-6 max-w-xl"><Search className="absolute left-3 top-3 text-slate-400" size={17}/><input className={`${inputClass} pl-10`} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search students"/></div><div className="mt-5 overflow-x-auto rounded-2xl border bg-white">{filtered.length ? <table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50"><tr><th className="p-4">Student</th><th>Course</th><th>Semester</th><th>Attendance</th><th>CGPA</th><th>Status</th><th/></tr></thead><tbody className="divide-y">{filtered.map(s => <tr key={s._id}><td className="p-4"><b>{s.user?.name}</b><p className="text-xs text-slate-400">{s.enrollmentNo}</p></td><td>{s.course} · {s.branch}</td><td>{s.semester}</td><td>{s.attendance}%</td><td>{s.cgpa}</td><td>{s.risk}</td><td><button onClick={() => { setEdit(s); setModal(true); }} className="p-2 text-teal-700"><Pencil size={16}/></button>{user.role === "admin" && <button onClick={() => remove(s)} className="p-2 text-rose-600"><Trash2 size={16}/></button>}</td></tr>)}</tbody></table> : <Empty text="No students found"/>}</div>{modal && <Modal wide title={edit ? "Edit student" : "Add student"} close={() => setModal(false)}><StudentForm student={edit} close={() => setModal(false)} onSaved={load} notify={notify}/></Modal>}</>;
}
