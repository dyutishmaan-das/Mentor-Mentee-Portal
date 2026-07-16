import { useState } from "react";
import AccessPage from "../features/auth/AccessPage";
import AppShell from "./AppShell";
export default function App() {
  const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem("user"));}catch{return null;}});
  return user?<AppShell user={user} setUser={setUser}/>:<AccessPage onReady={setUser}/>;
}
