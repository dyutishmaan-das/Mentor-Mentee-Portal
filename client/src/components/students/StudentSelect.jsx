import { useEffect, useState } from "react";
import api from "../../api";
import { inputClass } from "../../constants/ui";
export default function StudentSelect({ value, onChange, name }) {
  const [students, setStudents] = useState([]);
  useEffect(() => { void api.get("/students").then(response => setStudents(response.data)); }, []);
  return <select name={name} className={inputClass} required value={value} onChange={onChange}><option value="">Select student</option>{students.map(student => <option key={student._id} value={student._id}>{student.user?.name} · {student.enrollmentNo}</option>)}</select>;
}
