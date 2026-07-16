export default function Field({ label, children, span = false }) {
  return <label className={span ? "sm:col-span-2" : ""}><span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>{children}</label>;
}
