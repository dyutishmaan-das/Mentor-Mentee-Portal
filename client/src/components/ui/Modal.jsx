import { X } from "lucide-react";
export default function Modal({ title, close, children, wide = false }) {
  return <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/50 p-4"><div className={`my-8 w-full ${wide ? "max-w-4xl" : "max-w-xl"} rounded-3xl bg-white p-6 shadow-2xl`}><div className="flex items-center justify-between"><h2 className="font-display text-xl font-extrabold">{title}</h2><button onClick={close} className="rounded-lg p-2 hover:bg-slate-100"><X size={19}/></button></div>{children}</div></div>;
}
