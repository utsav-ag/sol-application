import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Package, Truck, Search, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, logout } = useAuth();
  const isAdmin = role === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    ...(isAdmin ? [{ icon: Home, label: 'Dashboard', path: '/dashboard' }] : []),
    { icon: Search, label: 'Search', path: '/search' },
    ...(isAdmin ? [{ icon: Package, label: 'Items', path: '/items' }] : []),
    { icon: Truck, label: 'Orders', path: '/delivery-orders' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-primary border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 flex-1 h-full',
              location.pathname === item.path
                ? 'text-primary-foreground'
                : 'text-primary-foreground/60'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-primary-foreground/60"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </div>
  );
}
