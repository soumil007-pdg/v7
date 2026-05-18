import ThemeSetter from './ThemeSetter';
import ProNavbarClient from './ProNavbarClient';
import ProFooter from './ProFooter';
import GoldTransition from './GoldTransition';

export default function ProLayout({ children }) {
  return (
    <>
      <ThemeSetter />
      <GoldTransition />
      <ProNavbarClient />
      <div className="pro-page-enter">
        {children}
      </div>
      <ProFooter />
      <style>{`
        .pro-page-enter {
          animation: pro-enter 0.38s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes pro-enter {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
