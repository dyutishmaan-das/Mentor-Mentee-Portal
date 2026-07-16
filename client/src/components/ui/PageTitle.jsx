export default function PageTitle({ kicker, title, desc, action }) {
  return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-bold text-teal-700">{kicker}</p><h1 className="mt-1 font-display text-3xl font-extrabold">{title}</h1><p className="mt-1 text-sm text-slate-500">{desc}</p></div>{action}</div>;
}
