import { useState } from "react";
import { Eye, Download } from "lucide-react";
import api from "../api";
import { buttonClass, recordCategories } from "../constants/ui";
import { errorMessage } from "../utils/formatters";
import PageTitle from "../components/ui/PageTitle";
import StudentSelect from "../components/students/StudentSelect";
export default function ReportsPage({notify}) {
  const [student,setStudent]=useState(""),[report,setReport]=useState(null);
  const generate=async()=>{try{setReport((await api.get(`/reports/student/${student}`)).data);notify("Report generated");}catch(e){notify(errorMessage(e),"error");}};
  return <><PageTitle kicker="Institutional reporting" title="Student progression report" desc="Generate a complete printable diary report." action={<button disabled={!student} onClick={generate} className={`${buttonClass} bg-teal-700 text-white`}><Eye size={16}/>Generate</button>}/><div className="mt-6 max-w-xl no-print"><StudentSelect value={student} onChange={e=>{setStudent(e.target.value);setReport(null);}}/></div>{report&&<div className="mt-6 rounded-2xl border bg-white p-8"><div className="flex justify-between border-b pb-5"><div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">Haridwar University, Roorkee</p><h2 className="mt-2 font-display text-2xl font-extrabold">Student Progression & Mentor–Mentee Diary</h2><p>{report.student.user.name} · {report.student.enrollmentNo}</p></div><button onClick={()=>window.print()} className={`${buttonClass} h-fit border no-print`}><Download size={16}/>Print / PDF</button></div><div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">{[["Course",report.student.course],["Branch",report.student.branch],["Semester",report.student.semester],["Mentor",report.student.mentor?.name||"Unassigned"],["Attendance",`${report.student.attendance}%`],["CGPA",report.student.cgpa],["Academic semesters",report.academics.length],["Sessions",report.sessions.length]].map(([a,b])=><div key={a} className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">{a}</p><b>{b}</b></div>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-3">{recordCategories.map(([value,label])=><div key={value} className="rounded-xl border p-3"><b>{label}</b><p className="text-2xl font-extrabold text-teal-700">{report.records.filter(r=>r.category===value).length}</p></div>)}</div></div>}</>;
}
