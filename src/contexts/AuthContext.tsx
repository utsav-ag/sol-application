import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/auth.service';

interface AuthContextType {
  isAuthenticated: boolean;
  role: 'ADMIN' | 'STORE_EMPLOYEE' | null;
  phoneNumber: string | null;
  login: (phoneNumber: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(AuthService.isAuthenticated());
  const [role, setRole] = useState(AuthService.getRole());
  const [phoneNumber, setPhoneNumber] = useState(AuthService.getPhoneNumber());

  useEffect(() => {
    // Check authentication status on mount
    setIsAuthenticated(AuthService.isAuthenticated());
    setRole(AuthService.getRole());
    setPhoneNumber(AuthService.getPhoneNumber());
  }, []);

  const login = async (phoneNumber: string, password: string) => {
    const response = await AuthService.login({ phoneNumber, password });
    setIsAuthenticated(true);
    setRole(response.role);
    setPhoneNumber(response.phoneNumber);
  };

  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setRole(null);
    setPhoneNumber(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, phoneNumber, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
