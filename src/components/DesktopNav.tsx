import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Package, Truck, Search, LogOut, Box, Plus } from 'lucide-react';
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
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-2 text-gray-900 font-bold">
          <span className="text-lg">SHREE OM LAMINATES</span>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          
          {isAdmin && (
            <button
              onClick={() => navigate('/dashboard')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md font-medium transition',
                location.pathname === '/dashboard'
                  ? 'text-orange-600 bg-orange-100'
                  : 'text-gray-700 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-orange-400'
              )}
            >
              <Home className="h-4 w-4" />
              Dashboard
            </button>
          )}
          
          {isAdmin && (
            <button
              onClick={() => navigate('/items')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-md font-medium transition',
                location.pathname === '/items'
                  ? 'text-orange-600 bg-orange-100'
                  : 'text-gray-700 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-orange-400'
              )}
            >
              <Package className="h-4 w-4" />
              Item Management
            </button>
          )}

          <button
            onClick={() => navigate('/delivery-orders')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md font-medium transition',
              location.pathname.startsWith('/delivery-orders')
                ? 'text-orange-600 bg-orange-100'
                : 'text-gray-700 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-orange-400'
            )}
          >
            <Truck className="h-4 w-4" />
            Order Management
          </button>

          <button
            onClick={() => navigate('/search')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md font-medium transition',
              location.pathname === '/search'
                ? 'text-orange-600 bg-orange-100'
                : 'text-gray-700 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-orange-400'
            )}
          >
            <Search className="h-4 w-4" />
            Item Search
          </button>

          {/* Create Order Button (prominent and centered) */}
          <button
            onClick={() => navigate('/create-order')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md font-medium transition',
              location.pathname === '/create-order'
                ? 'text-orange-600 bg-orange-100'
                : 'text-gray-700 hover:bg-orange-50 focus-visible:ring-2 focus-visible:ring-orange-400'
            )}
          >
            <Plus className="h-4 w-4" />
            Create Order
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium text-gray-700 border border-gray-200 hover:bg-orange-500 hover:text-white transition"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
