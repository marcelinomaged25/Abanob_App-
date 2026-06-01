import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Trophy, LogIn, Mail, Lock, ShieldAlert } from 'lucide-react';

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
    <div className="w-full min-h-[calc(100vh-12rem)] flex items-center justify-center p-4" dir="rtl">
      
      <div className="w-full max-w-md bg-white dark:bg-brand-navy-900 border border-slate-200 dark:border-brand-navy-800 rounded-3xl p-8 shadow-xl space-y-6 animate-scale-in">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gold-50 dark:bg-brand-gold-950/20 text-brand-gold-500 mb-2">
            <Trophy className="h-6 w-6" />
          </div>
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
