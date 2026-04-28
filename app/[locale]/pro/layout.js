import ThemeSetter from './ThemeSetter';

// Pro design workspace layout.
// ThemeSetter activates the navy+gold CSS variables automatically.
// All pages inside /pro/ get the pro theme — no changes to the orange pages.
export default function ProLayout({ children }) {
  return (
    <>
      <ThemeSetter />
      {children}
    </>
  );
}
