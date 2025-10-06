import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Package, Truck, Search, LogOut, Box } from 'lucide-react';
import { cn } from '@/lib/utils';

export function DesktopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout } = useAuth();
  const isAdmin = role === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-border bg-primary sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary-foreground font-semibold">
          <Box className="h-5 w-5" />
          <span>Inventory Management System</span>
        </div>

        <nav className="flex items-center gap-1">
          {isAdmin && (
            <button
              onClick={() => navigate('/items')}
              className={cn(
                'nav-item text-sm',
                location.pathname === '/items'
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'text-primary-foreground/80 hover:bg-primary-foreground/10'
              )}
            >
              <Package className="h-4 w-4" />
              Item Management
            </button>
          )}

          <button
            onClick={() => navigate('/search')}
            className={cn(
              'nav-item text-sm',
              location.pathname === '/search'
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'text-primary-foreground/80 hover:bg-primary-foreground/10'
            )}
          >
            <Search className="h-4 w-4" />
            Item Search
          </button>

          {isAdmin && (
            <button
              onClick={() => navigate('/dashboard')}
              className={cn(
                'nav-item text-sm',
                location.pathname === '/dashboard'
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'text-primary-foreground/80 hover:bg-primary-foreground/10'
              )}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </button>
          )}

          <button
            onClick={() => navigate('/delivery-orders')}
            className={cn(
              'nav-item text-sm',
              location.pathname.startsWith('/delivery-orders') || location.pathname === '/create-order'
                ? 'bg-primary-foreground text-primary'
                : 'text-primary-foreground/80 hover:bg-primary-foreground/10'
            )}
          >
            <Truck className="h-4 w-4" />
            Order Management
          </button>

          <button
            onClick={handleLogout}
            className="nav-item text-sm text-primary-foreground/80 hover:bg-primary-foreground/10"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
