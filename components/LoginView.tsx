import React from 'react';

type Props={onLogin:()=>Promise<void>};

export default function LoginView({onLogin}:Props){
  return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-slate-50"><button onClick={()=>void onLogin()} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold">تسجيل الدخول عبر Google</button></div>;
}
