import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Lock, ArrowRight, Loader2, BookOpen } from 'lucide-react';

import { useFirebase } from './FirebaseProvider';

interface LoginViewProps {
  onLogin: (username: string, password: string) => Promise<boolean>;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const { login: firebaseLogin, user: firebaseUser } = useFirebase();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('الرجاء إدخال اسم المستخدم وكلمة المرور.');
      return;
    }
    setIsLoading(true);
    const success = await onLogin(username, password);
    if (!success) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] font-sans" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(79,70,229,0.05),transparent)] pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-20 h-20 bg-slate-900 rounded-3xl mx-auto flex items-center justify-center shadow-2xl mb-6 relative group rotate-3 hover:rotate-0 transition-transform duration-500"
            >
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <BookOpen className="text-white relative z-10" size={40} />
            </motion.div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">أهلاً بك</h1>
            <p className="text-slate-500 font-medium">سجل الدخول للمتابعة إلى سوق الكتاب</p>
        </div>

        <div className="glass-panel p-8 shadow-2xl border border-white/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">اسم المستخدم</label>
              <div className="relative group">
                <User size={18} className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 pr-12 text-slate-700 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold"
                  placeholder="أدخل اسمك هنا"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">كلمة المرور</label>
              <div className="relative group">
                <Lock size={18} className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 pr-12 text-slate-700 bg-white/50 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white transition-all outline-none font-bold"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-lg text-center border border-red-100"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 transition-all duration-300 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 disabled:bg-slate-400 disabled:shadow-none"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight size={18} className="rotate-180" />
                </>
              )}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-bold">أو للمسؤولين</span></div>
            </div>

            <button
              type="button"
              onClick={firebaseLogin}
              className="w-full h-12 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" referrerPolicy="no-referrer" />
              <span>تسجيل الدخول عبر Google</span>
              {firebaseUser && <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
            © 2026 SOOQ ALKETAB • v2.0 Professional
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginView;
