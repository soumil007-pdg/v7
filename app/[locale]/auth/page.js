import { getTranslations } from 'next-intl/server';

// ==================== CLIENT COMPONENT (Form + interactivity) ====================
'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { CheckCircle, ArrowRight } from 'lucide-react';

function AuthForm({ t }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (res.ok) {
        if (isLogin) {
          if (data.token) {
            localStorage.setItem('sessionToken', data.token);
            toast.success(t('toastWelcome'));
            router.push('/');
          } else {
            toast.error(t('toastNoToken'));
          }
        } else {
          setIsLogin(true);
          toast.success(t('toastCreated'));
          setPassword(''); 
        }
      } else {
        toast.error(data.message || t('toastFail'));
      }
    } catch (err) {
      toast.error(t('toastError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-white">
      
      {/* --- LEFT COLUMN: Brand & Emotion (Hidden on Mobile) --- */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 text-white flex-col justify-end p-12 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/pic4.jpg')" }} 
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent"></div>

        <div className="relative z-10 max-w-md">
          <blockquote className="text-2xl font-medium leading-relaxed mb-6 border-l-4 border-[#FF5B33] pl-6">
            {t('quote')}
          </blockquote>
        </div>
      </div>

      {/* --- RIGHT COLUMN: The Form --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">
              {isLogin ? t('welcomeBack') : t('createAccount')}
            </h2>
            <p className="text-slate-500">
              {isLogin ? t('loginDesc') : t('signupDesc')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('emailLabel')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPh')}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#FF5B33] focus:ring-4 focus:ring-[#FF5B33]/10 transition-all outline-none text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('passLabel')}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passPh')}
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-[#FF5B33] focus:ring-4 focus:ring-[#FF5B33]/10 transition-all outline-none text-slate-900 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#171717] text-white font-bold py-3.5 rounded-lg hover:bg-black hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? t('signInBtn') : t('getStartedBtn')} 
                  {!isLogin && <ArrowRight size={18} />}
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-slate-500">
            {isLogin ? t('noAccount') : t('hasAccount')}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-[#FF5B33] hover:text-[#e04f2a] hover:underline transition-colors"
            >
              {isLogin ? t('signUpLink') : t('logInLink')}
            </button>
          </div>

          {!isLogin && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <CheckCircle size={14} className="text-green-500" /> {t('trustFree')}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <CheckCircle size={14} className="text-green-500" /> {t('trustNoCard')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== SERVER COMPONENT (for SEO) ====================
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: 'Auth' });

  return {
    title: t('welcomeBack') || 'Login / Signup - ADVOCAT-Easy',
    description: t('loginDesc') || 'Sign in to access your AI legal assistant',
  };
}

export default async function AuthPage({ params }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const t = await getTranslations({ locale, namespace: 'Auth' });

  return <AuthForm t={t} />;
}