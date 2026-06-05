import React from 'react';

type Props = { onLogin: () => Promise<void> };

export default function LoginView({ onLogin }: Props) {
  return (
    <main dir="rtl" className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <section className="max-w-5xl w-full grid gap-8 lg:grid-cols-2 items-center">
        <div className="space-y-6">
          <p className="text