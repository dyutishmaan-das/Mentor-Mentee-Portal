import { useEffect } from "react";
export default function Toast({ toast, clear }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(clear, 3000);
    return () => clearTimeout(timer);
  }, [toast, clear]);
  return toast ? <div className={`fixed bottom-5 right-5 z-[70] rounded-xl px-4 py-3 text-sm font-bold text-white shadow-xl ${toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"}`}>{toast.text}</div> : null;
}
