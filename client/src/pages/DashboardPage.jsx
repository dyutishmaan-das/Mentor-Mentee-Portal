import { useEffect, useState } from "react";
import { Users, CheckCircle2, CalendarDays, TriangleAlert, LoaderCircle } from "lucide-react";
import api from "../api";
import PageTitle from "../components/ui/PageTitle";
import { formatDate } from "../utils/formatters";
export default function DashboardPage({ user, notify }) {
  const [data, setData] = useState(null);
  useEffect(() => { void api.get("/dashboard").then(r => setData(r.data)).catch(e => notify(e.message, "error")); }, []);
  if (!data) return <LoaderCircle className="animate-spin"/>;
  const stats = [["Total students", data.totalMentees, Users], ["Average attendance", `${data.averageAttendance}%`, CheckCircle2], ["Sessions this month", data.monthlySessions, CalendarDays], ["Need attention", data.attentionNeeded, TriangleAlert]];
  return <><PageTitle kicker={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} title={`Welcome, ${user.name}`} desc="Live information from the university progression database."/><div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([label,value,Icon]) => <div key={label} className="rounded-2xl border bg-white p-5 shadow-soft"><Icon className="text-teal-700"/><div className="mt-5 font-display text-3xl font-extrabold">{value}</div><p className="text-sm text-slate-500">{label}</p></div>)}</div><div className="mt-6 rounded-2xl border bg-white p-5 shadow-soft"><h2 className="font-display text-lg font-bold">Upcoming sessions</h2><div className="mt-3 divide-y">{data.upcoming.length ? data.upcoming.map(session => <div key={session._id} className="flex items-center justify-between py-4"><div><b className="text-sm">{session.student?.user?.name}</b><p className="text-xs text-slate-500">{session.agenda}</p></div><span className="text-xs font-bold text-teal-700">{formatDate(session.scheduledAt)}</span></div>) : <p className="py-8 text-center text-sm text-slate-400">No upcoming sessions</p>}</div></div></>;
}
