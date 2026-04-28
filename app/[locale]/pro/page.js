// ============================================================
//  PRO DESIGN WORKSPACE
//  This is your new design canvas — edit freely.
//  The orange professor demo is untouched in app/[locale]/page.js
//  Press Ctrl+Shift+T to jump back to the orange version.
// ============================================================

import Link from 'next/link';
import { Scale, MessageSquare, FileText, ArrowRight, ShieldCheck, Clock, Layers } from 'lucide-react';

export const metadata = {
  title: 'ADVOCAT-Easy — Pro',
  robots: { index: false, follow: false },
};

export default function ProHomePage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: '#F4F6F9', color: '#0D1B2A' }}>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden pt-28 pb-36 text-white"
        style={{ background: 'linear-gradient(135deg, #031126 0%, #0D2137 60%, #152947 100%)' }}
      >
        {/* Subtle decorative ring */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #daa53b, transparent 70%)' }} />

        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border"
            style={{ borderColor: '#daa53b44', color: '#daa53b', backgroundColor: '#daa53b11' }}>
            <ShieldCheck size={12} /> AI-Powered Legal Assistant
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight">
            Know Your Rights.{' '}
            <span style={{ color: '#daa53b' }}>Act With Confidence.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed">
            Plain-language legal guidance powered by AI — for everyday situations, from tenant disputes to consumer rights.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/general-queries">
              <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
                style={{ backgroundColor: '#daa53b' }}>
                <MessageSquare size={20} /> Quick Rights Chat
              </button>
            </Link>
            <Link href="/case-advisor">
              <button className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold border-2 text-white transition-all hover:-translate-y-1"
                style={{ borderColor: 'rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                <FileText size={20} /> Case Advisor <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────── */}
      <section className="py-6 border-b" style={{ backgroundColor: '#031126', borderColor: '#1B3050' }}>
        <div className="container mx-auto px-4 max-w-4xl flex flex-wrap justify-center gap-8 text-sm font-medium" style={{ color: '#8fa3bb' }}>
          <span className="flex items-center gap-2"><ShieldCheck size={14} style={{ color: '#daa53b' }} /> 100% Private — No data stored</span>
          <span className="flex items-center gap-2"><Clock size={14} style={{ color: '#daa53b' }} /> Instant AI responses</span>
          <span className="flex items-center gap-2"><Scale size={14} style={{ color: '#daa53b' }} /> Indian law focused</span>
        </div>
      </section>

      {/* ── SERVICES ─────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#daa53b' }}>What We Offer</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12" style={{ color: '#031126' }}>
            Two Tools. One Mission.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <Link href="/general-queries" className="group block">
              <div className="h-full p-8 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFBFC' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: '#FBF5E6' }}>
                  <MessageSquare size={22} style={{ color: '#daa53b' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#031126' }}>Quick Rights Chat</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
                  Ask any legal question in plain language. Get instant, easy-to-understand guidance on your rights and options.
                </p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-bold" style={{ color: '#daa53b' }}>
                  Start chatting <ArrowRight size={14} />
                </span>
              </div>
            </Link>

            {/* Card 2 */}
            <Link href="/case-advisor" className="group block">
              <div className="h-full p-8 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{ borderColor: '#E2E8F0', backgroundColor: '#FAFBFC' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: '#EEF2FF' }}>
                  <FileText size={22} style={{ color: '#031126' }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#031126' }}>Case Advisor</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
                  Build a full legal strategy for your specific situation. Step-by-step guidance with court details and next actions.
                </p>
                <span className="inline-flex items-center gap-1 mt-4 text-sm font-bold" style={{ color: '#031126' }}>
                  Analyze my case <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section className="py-24" style={{ backgroundColor: '#F4F6F9' }}>
        <div className="container mx-auto px-4 max-w-5xl">
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#daa53b' }}>Why ADVOCAT-Easy</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-14" style={{ color: '#031126' }}>
            Built for the People, Not Just Lawyers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Layers, title: 'Easy to Use', desc: 'No legal jargon. Ask in your own words, get answers in plain language.' },
              { icon: Clock, title: 'Saves Time', desc: 'Skip expensive consultations for basic queries. Get answers in seconds.' },
              { icon: ShieldCheck, title: 'Accurate & Updated', desc: 'Responses based on current Indian law including state-specific rules.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-8 rounded-2xl bg-white border" style={{ borderColor: '#E2E8F0' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: '#FBF5E6' }}>
                  <Icon size={20} style={{ color: '#daa53b' }} />
                </div>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#031126' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: '#031126' }}>
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to understand your rights?
          </h2>
          <p className="text-white/60 mb-8">Join thousands getting free, instant legal clarity.</p>
          <Link href="/dashboard">
            <button className="px-10 py-4 rounded-xl font-bold text-white transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ backgroundColor: '#daa53b' }}>
              Get Started Free <ArrowRight size={18} className="inline ml-1" />
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
}
