import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ItemSearchNew from "./pages/ItemSearchNew";
import DeliveryOrdersNew from "./pages/DeliveryOrdersNew";
import CreateDeliveryOrderNew from "./pages/CreateDeliveryOrderNew";
import EditDeliveryOrder from "./pages/EditDeliveryOrder";
import ItemManagement from "./pages/ItemManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && role !== 'ADMIN') {
    return <Navigate to="/search" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={role === 'ADMIN' ? '/items' : '/search'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      <Route path="/dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
      <Route path="/items" element={<ProtectedRoute adminOnly><ItemManagement /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><ItemSearchNew /></ProtectedRoute>} />
      <Route path="/delivery-orders" element={<ProtectedRoute><DeliveryOrdersNew /></ProtectedRoute>} />
      <Route path="/create-order" element={<ProtectedRoute><CreateDeliveryOrderNew /></ProtectedRoute>} />
      <Route path="/edit-order/:id" element={<ProtectedRoute><EditDeliveryOrder /></ProtectedRoute>} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
