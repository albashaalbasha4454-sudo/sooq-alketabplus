import React from 'react';

type Props = { onLogin: () => Promise<void> };

export default function PublicLibraryPortal({ onLogin }: Props) {
  return (
    <div dir="rtl" className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <main className="max-w-4xl w-full bg-white/10 border border-white/10 rounded-3xl p-8">
        <p className="text-sm text-sky-300 font-bold mb-3">SOOQ ALKETAB PLATFORM</