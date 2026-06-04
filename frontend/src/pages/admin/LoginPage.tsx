import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, Mail, Lock, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { loginUser, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('الرجاء كتابة البريد الإلكتروني وكلمة المرور');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await loginUser(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message || 
        'فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-12rem)] flex items-center justify-center p-4 relative" dir="rtl">
      {/* Church-inspired decorative background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #c9931d 1px, transparent 1px), radial-gradient(circle at 75% 75%, #c9931d 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      
      <div className="w-full max-w-md bg-white dark:bg-brand-navy-900 border border-brand-gold-200/50 dark:border-brand-gold-500/20 rounded-3xl p-8 shadow-xl space-y-6 animate-scale-in relative church-glow" style={{ boxShadow: '0 0 30px rgba(201, 147, 29, 0.08), 0 20px 60px rgba(0, 0, 0, 0.1)' }}>
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <img src="/abanob-icon.png" alt="القديس أبانوب" className="inline-block h-14 w-14 rounded-full object-cover ring-2 ring-brand-gold-400/50 mb-2" />
          <h2 className="text-xl font-black text-slate-900 dark:text-white">بوابة الإدارة الإلكترونية</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            سجل دخولك لإدخال درجات الفئات وإدارة الفرق والمواسم
          </p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 flex items-start gap-2 animate-pulse">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
              البريد الإلكتروني للإدارة
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@abanob.com"
                required
                className="w-full h-11 pr-10 pl-4 text-xs bg-slate-50 border border-slate-200 text-slate-800 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-100 rounded-xl"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
              كلمة المرور الإدارية
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-11 pr-10 pl-4 text-xs bg-slate-50 border border-slate-200 text-slate-800 dark:bg-brand-navy-950 dark:border-brand-navy-850 dark:text-slate-100 rounded-xl"
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full h-11 bg-brand-navy-950 hover:bg-brand-navy-900 dark:bg-brand-gold-500 dark:text-brand-navy-950 dark:hover:bg-brand-gold-400 text-white font-extrabold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer mt-6"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 border-2 border-white dark:border-brand-navy-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>تسجيل الدخول الآمن</span>
              </>
            )}
          </button>

        </form>

        {/* Helpful Tip */}
        <div className="p-3.5 bg-slate-50 dark:bg-brand-navy-950 border border-slate-200 dark:border-brand-navy-850 rounded-xl text-[10px] text-slate-400 leading-relaxed">
          💡 <strong>معلومة:</strong> الحسابات والدرجات مؤمنة بالكامل بتشفير JWT و hashing عالي الحماية. يرجى عدم مشاركة بيانات دخول المشرفين مع أي شخص خارجي.
        </div>

      </div>

    </div>
  );
};
