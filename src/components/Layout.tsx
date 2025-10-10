import { useIsMobile } from '@/hooks/use-mobile';
import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DesktopNav } from '@/components/DesktopNav';
import { MobileNav } from '@/components/MobileNav';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const isMobile = useIsMobile();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && (<DesktopNav /> )}
      <main className="md:container md:mx-auto">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
