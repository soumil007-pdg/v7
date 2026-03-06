'use client';
import React from "react";
import Link from "next/link";
import { Scale, MessageSquare, FileText, LogOut, Globe } from 'lucide-react'; 
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

const Navbar = ({ isLoggedIn, userEmail, handleLogout }) => {
  const t = useTranslations('Navbar');
  const router = useRouter();
  const pathname = usePathname();

  // Function to handle language change
  const handleLanguageChange = (e) => {
    const nextLocale = e.target.value;
    const segments = pathname.split('/');
    segments[1] = nextLocale; // Replaces the language code in the URL
    router.push(segments.join('/') || '/');
  };

  // Get current language to highlight the correct option in dropdown
  const currentLocale = pathname.split('/')[1] || 'en';

  return (
    <div className="flex w-full justify-between items-center p-3" style={{backgroundColor: 'var(--dark-text)'}}>
      
      {/* Left Side: Logo & Title */}
      <Link href={"/"} className="flex items-center gap-2 title text-3xl font-extrabold text-white">
        <Scale size={32} style={{color: 'var(--primary-accent)'}} />
        ADVOCAT-Easy
      </Link>
      
      {/* Center: Tagline (Translated) */}
      <div className="hidden md:block text-sm text-gray-400">
        {t('tagline')}
      </div>

      {/* Right Side: User Info, Actions & Language Switcher */}
      <div className="flex items-center gap-4 text-white">
        
        {/* --- LANGUAGE SWITCHER --- */}
        <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
          <Globe size={16} />
          <select 
            onChange={handleLanguageChange} 
            value={currentLocale}
            className="bg-transparent text-sm text-white outline-none cursor-pointer"
          >
            <option value="en" className="text-black">English</option>
            <option value="hi" className="text-black">हिन्दी (Hindi)</option>
            <option value="mr" className="text-black">मराठी (Marathi)</option>
            <option value="te" className="text-black">తెలుగు (Telugu)</option>
          </select>
        </div>

        {isLoggedIn ? (
          <>
            <span className="text-sm hidden lg:block text-white/80">{t('welcome')}, {userEmail}</span>
            <Link 
              href="/general-queries" 
              className="flex items-center gap-1 text-sm font-semibold hover:text-white/70 transition-colors duration-150"
              title="Quick rights chat for casual queries"
            >
              <MessageSquare size={16} /> {t('queries')}
            </Link>
            <Link 
              href="/case-advisor" 
              className="flex items-center gap-1 text-sm font-semibold hover:text-white/70 transition-colors duration-150"
              title="Build a detailed case plan for stuck scenarios"
            >
              <FileText size={16} /> {t('caseAdvisor')}
            </Link>
            
            {/* --- LOGOUT BUTTON --- */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm font-bold bg-red-600 hover:bg-red-700 py-2 px-4 rounded transition-colors duration-150"
            >
              <LogOut size={16} /> {t('logout')}
            </button>
          </>
        ) : (
          // --- LOGIN / SIGNUP BUTTON ---
          <Link
            href="/auth"
            style={{backgroundColor: 'var(--primary-accent)'}}
            className="text-sm font-bold text-white py-2 px-4 rounded hover:opacity-90 transition-opacity"
          >
            {t('login')}
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
