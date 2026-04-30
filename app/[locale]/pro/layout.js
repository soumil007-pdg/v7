import ThemeSetter from './ThemeSetter';
import ProNavbarClient from './ProNavbarClient';
import ProFooter from './ProFooter';

export default function ProLayout({ children }) {
  return (
    <>
      <ThemeSetter />
      <ProNavbarClient />
      {children}
      <ProFooter />
    </>
  );
}
