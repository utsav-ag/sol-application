import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DesktopNav } from '@/components/DesktopNav';
import { MobileNav } from '@/components/MobileNav';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <DesktopNav />
      <main className="md:container md:mx-auto">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
