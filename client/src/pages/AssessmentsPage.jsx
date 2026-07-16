import { useEffect, useState } from "react";
import api from "../api";
import { buttonClass, inputClass } from "../constants/ui";
import { errorMessage } from "../utils/formatters";
import PageTitle from "../components/ui/PageTitle";
import Empty from "../components/ui/Empty";
import Field from "../components/ui/Field";
import StudentSelect from "../components/students/StudentSelect";
export default function AssessmentsPage({user,notify}) {
  const [student,setStudent]=useState(""),[type,setType]=useState("mentorAssessment"),[list,setList]=useState([]);
  const load=()=>student&&api.get(`/assessments?student=${student}`).then(r=>setList(r.data)).catch(e=>notify(errorMessage(e),"error"));
  useEffect(()=>{void load();},[student]);
  const save=async e=>{e.preventDefault();const form=new FormData(e.currentTarget);try{await api.post("/assessments",{student,type,semester:Number(form.get("semester")),ratings:[{criterion:"Overall assessment",score:Number(form.get("score"))}],comments:form.get("comments"),suggestions:form.get("suggestions"),mentor:user.role==="mentor"?user.id:undefined});notify("Assessment submitted");e.currentTarget.reset();await load();}catch(error){notify(errorMessage(error),"error");}};
  return <><PageTitle kicker="Evaluation" title="Feedback & assessments" desc="Mentor assessment, mentor feedback and mentee self-assessment."/><div className="mt-6 max-w-xl"><StudentSelect value={student} onChange={e=>setStudent(e.target.value)}/></div>{student&&<div className="mt-5 grid gap-5 lg:grid-cols-2"><form onSubmit={save} className="space-y-4 rounded-2xl border bg-white p-5"><Field label="Type"><select className={inputClass} value={type} onChange={e=>setType(e.target.value)}><option value="mentorAssessment">Mentor assessment</option><option value="mentorFeedback">Mentor feedback</option><option value="selfAssessment">Self assessment</option></select></Field><Field label="Semester"><input name="semester" type="number" min="1" max="8" required className={inputClass}/></Field><Field label="Rating (0–10)"><input name="score" type="number" min="0" max="10" required className={inputClass}/></Field><Field label="Comments"><textarea name="comments" className={inputClass}/></Field><Field label="Suggestions"><textarea name="suggestions" className={inputClass}/></Field><button className={`${buttonClass} w-full bg-teal-700 text-white`}>Submit assessment</button></form><div className="space-y-3">{list.length?list.map(a=><div key={a._id} className="rounded-2xl border bg-white p-5"><b>{a.type}</b><p className="text-sm">{a.comments||"No comments"}</p><p className="text-xs font-bold text-teal-700">Rating {a.ratings?.[0]?.score??"—"}/10</p></div>):<Empty text="No assessments yet"/>}</div></div>}</>;
}
