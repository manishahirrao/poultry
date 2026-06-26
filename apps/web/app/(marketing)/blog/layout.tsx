// Blog layout — scopes BlogScrollPopup to blog pages only
// BlogScrollPopup is NOT in the top-level marketing layout to avoid
// it firing on pricing/features/homepage where it's irrelevant.
import BlogScrollPopup from '@/components/popups/BlogScrollPopup';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BlogScrollPopup />
    </>
  );
}
