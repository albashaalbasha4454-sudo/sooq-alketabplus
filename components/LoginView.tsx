import React from 'react';

type Props = { onLogin: () => Promise<void> };

export default function LoginView({ onLogin }: Props) {
  return <main dir="rtl" className="min-h-screen flex items-center justify-center bg-slate-950 text-white"><div className="text-center p-6"><h1 className="text-3xl font-black mb-4">Sooq Alketab</h1><p className="mb-6 text-slate-300">مكتبة ومنصة إدارة