'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AuthClient() {
  const t = useTranslations('Auth');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // If user already has a valid session, send them to home
  useEffect(() => {
    const token = localStorage.getItem('sessionToken');
    if (!token) return;
    fetch('/api/auth/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(res => res.json()).then(data => {
      if (data.isValid) router.replace('/');
      else {
        localStorage.removeItem('sessionToken');
        document.cookie = 'sessionToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }).catch(() => {});
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, ...(!isLogin && { name }) }),
      });
      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          if (data.token) {
            localStorage.setItem('sessionToken', data.token);
            document.cookie = `sessionToken=${data.token}; path=/; SameSite=Lax`;
            toast.success(t('toastWelcome'));
            window.location.href = '/';
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
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t('nameLabel')}</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('namePh')}
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('emailLabel')}</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('emailPh')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t('passLabel')}</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passPh')}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="dark"
              disabled={isLoading}
              className="w-full py-3.5 hover:shadow-lg hover:-translate-y-0.5"
            >
              {isLoading ? (
                <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? t('signInBtn') : t('getStartedBtn')}
                  {!isLogin && <ArrowRight size={18} />}
                </>
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500">
            {isLogin ? t('noAccount') : t('hasAccount')}
            <Button
              type="button"
              variant="link-brand"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? t('signUpLink') : t('logInLink')}
            </Button>
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
