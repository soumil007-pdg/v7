'use client';
import React from 'react';
import Link from 'next/link';
import { MessageSquare, FileText, Scale, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';

export default function Dashboard() {
  const { isLoggedIn, loading } = useAuth(true);
  const t = useTranslations('Dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF5B33] mb-4"></div>
          <p className="text-slate-400 text-sm font-medium">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      
      {/* --- Header Section --- */}
      <div className="max-w-6xl mx-auto pt-20 pb-12 px-6 text-center">
        <div className="inline-flex items-center justify-center p-4 bg-white shadow-sm rounded-2xl mb-8 border border-slate-100">
          <Scale size={36} className="text-[#FF5B33]" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6 tracking-tight">
          {t('title')}
        </h1>
        <p className="text-lg text-slate-500 max-w-4xl mx-auto leading-relaxed">
          {t.rich('subtitle', {
            bold: (chunks) => <span className="font-semibold text-slate-700">{chunks}</span>
          })}
        </p>
      </div>

      {/* --- Cards Container --- */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* === Card 1: Quick Chat (SOLID ORANGE) === */}
          <Link href="/general-queries" className="group block h-full">
            <div className="relative bg-[#FF5B33] border border-[#FF5B33] p-10 rounded-3xl h-full flex flex-col 
                          transition-all duration-300 ease-out shadow-xl shadow-orange-500/20
                          hover:-translate-y-2 hover:shadow-orange-500/40">
              
              <div className="flex items-start justify-between mb-8">
                <div className="p-4 bg-white text-[#FF5B33] rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <MessageSquare size={32} strokeWidth={2} />
                </div>
                <span className="px-3 py-1 bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-sm border border-white/20">
                  {t('quickChat.tag')}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                {t('quickChat.title')}
              </h2>
              <p className="text-orange-50 text-base leading-relaxed grow mb-8 font-medium opacity-90">
                {t('quickChat.desc')}
              </p>
              
              <div className="flex items-center font-bold text-white mt-auto">
                <span>{t('quickChat.btn')}</span>
                <ArrowRight size={20} className="ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
              </div>
            </div>
          </Link>

          {/* === Card 2: Case Advisor (SOLID BLACK) === */}
          <Link href="/case-advisor" className="group block h-full">
            <div className="relative bg-[#171717] border border-[#171717] p-10 rounded-3xl h-full flex flex-col 
                          transition-all duration-300 ease-out shadow-xl shadow-slate-900/20
                          hover:-translate-y-2 hover:shadow-slate-900/40">
              
              <div className="flex items-start justify-between mb-8">
                <div className="p-4 bg-white text-[#171717] rounded-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <FileText size={32} strokeWidth={2} />
                </div>
                <span className="px-3 py-1 bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-full backdrop-blur-sm border border-white/10">
                  {t('caseAdvisor.tag')}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                {t('caseAdvisor.title')}
              </h2>
              <p className="text-slate-400 text-base leading-relaxed grow mb-8 font-medium">
                {t('caseAdvisor.desc')}
              </p>
              
              <div className="flex items-center font-bold text-white mt-auto">
                <span>{t('caseAdvisor.btn')}</span>
                <ArrowRight size={20} className="ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
              </div>
            </div>
          </Link>

        </div>

        {/* Trust Footer */}
        <div className="mt-20 border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-center gap-2 text-slate-400">
          <ShieldCheck size={16} />
          <p className="text-xs font-medium tracking-wide uppercase">
            {t('footer')}
          </p>
        </div>
      </div>
    </div>
  );
}