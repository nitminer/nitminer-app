'use client';

import { useState, useEffect } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle, FiShield, FiZap } from 'react-icons/fi';
import Link from 'next/link';
import Image from "next/image"
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import LoginTypeSelector from './LoginTypeSelector';

export default function AdminLoginComponent() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (session?.user?.role === 'admin') router.push('/admin/dashboard');
  }, [session, status, router]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) throw new Error(result.error || 'Identity Verification Failed');

      if (result?.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/admin/dashboard'), 800);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#050506] selection:bg-indigo-500/30" style={{ fontFamily: "'League Spartan', sans-serif" }}>
      
      {/* Background Cinematic Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="w-full max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden shadow-2xl">
          
          {/* --- LEFT VISUAL PANAL (7 Cols) --- */}
          <div className="hidden lg:flex lg:col-span-7 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 items-center justify-center relative p-12">
            <div className="relative w-full h-full min-h-[500px] animate-in fade-in zoom-in duration-1000">
              <Image 
                src="/auth/admin_login.png" 
                alt="Nexus Admin"
                fill
                className="object-contain drop-shadow-[0_0_50px_rgba(79,70,229,0.3)]"
                priority
              />
            </div>
            {/* Branding Overlay */}
            <div className="absolute top-10 left-10 flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
                  <FiZap className="text-white text-xl" />
               </div>
               <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Nexus <span className="text-indigo-500">OS</span></h1>
            </div>
          </div>

          {/* --- RIGHT LOGIN FORM (5 Cols) --- */}
          <div className="lg:col-span-5 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-zinc-900/50">
            <div className="mb-10 flex justify-between items-center">
              <div className="p-2 bg-indigo-600/10 text-indigo-500 rounded-xl">
                <FiShield size={24} />
              </div>
              <LoginTypeSelector />
            </div>

            <div className="mb-10">
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-3">
                Authorize <span className="text-indigo-600">Access.</span>
              </h2>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Administrator Identity Verification</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 items-center animate-shake">
                <FiAlertCircle className="text-red-500 shrink-0" size={18} />
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Email</label>
                <div className="relative group">
                  <FiMail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600/50 transition-all text-white font-bold"
                    placeholder="admin@nexus.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Secret</label>
                <div className="relative group">
                  <FiLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-14 pr-14 py-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/50 focus:border-indigo-600/50 transition-all text-white font-bold"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || success}
                className="w-full relative group overflow-hidden bg-indigo-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-center gap-3 uppercase text-xs tracking-[0.2em]">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : success ? (
                    <span className="text-emerald-400">Identity Verified</span>
                  ) : (
                    <>
                      <span>Initialize Login</span>
                      <FiArrowRight />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                External User?{' '}
                <Link href="/login" className="text-indigo-500 hover:text-indigo-400 transition-colors ml-1">
                  Return to Base
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  
  );
}