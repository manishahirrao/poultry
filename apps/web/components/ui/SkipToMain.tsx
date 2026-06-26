// FlockIQ — Skip to Main Content Component
// File: apps/web/components/ui/SkipToMain.tsx
// Version: v3.0 | June 2026
// Task Reference: A11Y-001
// Requirements: WCAG 2.1 AA - Focus Management
// Design Reference: FlockIQ_PreLogin_Design_Master_v3.md

export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-700 focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}
