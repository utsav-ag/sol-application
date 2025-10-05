import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Home, Package, Truck, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { logout, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const isAdmin = role === 'ADMIN';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Inventory System</h1>
          
          <nav className="flex items-center gap-3">
            {isAdmin && (
              <Button
                variant={location.pathname === '/dashboard' ? 'default' : 'ghost'}
                onClick={() => navigate('/dashboard')}
                className="btn-large gap-2"
              >
                <Home className="h-5 w-5" />
                Dashboard
              </Button>
            )}
            
            <Button
              variant={location.pathname === '/search' ? 'default' : 'ghost'}
              onClick={() => navigate('/search')}
              className="btn-large gap-2"
            >
              <Search className="h-5 w-5" />
              Search Items
            </Button>

            {isAdmin && (
              <Button
                variant={location.pathname === '/items' ? 'default' : 'ghost'}
                onClick={() => navigate('/items')}
                className="btn-large gap-2"
              >
                <Package className="h-5 w-5" />
                Manage Items
              </Button>
            )}

            <Button
              variant={location.pathname === '/delivery-orders' ? 'default' : 'ghost'}
              onClick={() => navigate('/delivery-orders')}
              className="btn-large gap-2"
            >
              <Truck className="h-5 w-5" />
              Delivery Orders
            </Button>

            <Button
              variant="destructive"
              onClick={handleLogout}
              className="btn-large gap-2"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
