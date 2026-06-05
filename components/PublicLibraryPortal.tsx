import React from 'react';

type Props = { onLogin: () => Promise<void> };

export default function PublicLibraryPortal({ onLogin }: Props) {
  return <div dir="rtl" className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6"><main className="max-w-3xl rounded-3xl border border-white/10 bg-white/10 p-8"><h1 className="text-4xl