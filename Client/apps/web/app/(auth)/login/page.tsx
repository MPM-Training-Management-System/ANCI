
"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import {  auth } from "@/lib/auth";
import { notify } from "@repo/hooks";


export default function LoginPage() {
   const [showPassword, setShowPassword] = useState(false);
    const [loading] = useState(false);
    const router = useRouter();
  
  
  
     const [email, setUsername] = useState("");
    const [password, setPassword] = useState("");
  
   const handleLogin = async () => {
  try {
    const data = await authApi.login({
      email,
      password,
    });
    localStorage.setItem("user", JSON.stringify(data.user));
    auth.saveToken(data.token);
    router.push("/dashboard");
    notify.success("Login successful!");
  } catch (error) {
    console.error(error);
    notify.error("Invalid email or password");
  }

}
    
  return (
      <div className="flex justify-center">
               <div className="w-full max-w-md bg-white rounded-2xl p-10 shadow-2xl">
                 <div className="mb-8">
                   <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-teal-700 text-xs font-bold uppercase tracking-widest">
                     Secure Access Point
                   </span>
     
                   <h3 className="text-2xl font-bold text-slate-900 mt-4">
                     Administrator Login
                   </h3>
     
                   <p className="text-sm text-slate-500 mt-1">
                     Access your ISTMS dashboard.
                   </p>
                 </div>
     
                 <form
                   onSubmit={(e) => {
                     e.preventDefault();
                     handleLogin();
                   }}
                   className="space-y-6"
                 >
                   {/* EMAIL */}
                   <div>
                     <label className="block text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">
                       Institutional Email
                     </label>
     
                     <Input
                       type="string"
                        onChange={(e) => setUsername(e.target.value)}
                        value={email}
                       placeholder="admin@acenextgen.com"
                       className="w-full px-4 py-3 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-teal-400"
                     />
                   </div>
     
                   {/* PASSWORD */}
                   <div>
                     <label className="block text-xs uppercase tracking-widest font-bold text-slate-500 mb-2">
                       Security Password
                     </label>
     
                     <div className="relative">
                       <Input
                         type={
                           showPassword
                             ? "text"
                             : "password"
                         }
                         placeholder="••••••••"
                         onChange={(e) => setPassword(e.target.value)}
                         value={password}
                         className="w-full px-4 py-3 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-teal-400"
                       />
     
                       <button
                         type="button"
                         onClick={() =>
                           setShowPassword(
                             !showPassword
                           )
                         }
                         className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                       >
                         {showPassword
                           ? "Hide"
                           : "Show"}
                       </button>
                     </div>
                   </div>
     
                   {/* REMEMBER */}
                   <div className="flex items-center gap-3">
                     <input
                       type="checkbox"
                       className="w-4 h-4"
                     />
     
                     <label className="text-sm text-slate-600">
                       Keep session active for 30 days
                     </label>
                   </div>
     
                   {/* BUTTON */}
                   <Button
                     type="submit"
                     disabled={loading}
                     variant="primary"
                     className="w-full py-4  font-bold rounded-lg hover:bg-secondary transition"
                   >
                     {loading
                       ? "Authenticating..."
                       : "Secure Login"}
                   </Button>
                 </form>
     
                 <div className="mt-8 pt-8 border-t text-center">
                   <p className="text-[10px] uppercase tracking-widest text-slate-400">
                     Authorized Personnel Only • All
                     activity monitored
                   </p>
                 </div>
               </div>
            </div>
  );
}