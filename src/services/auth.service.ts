import { ApiClient } from '@/lib/api-client';
import { LoginRequest, LoginResponse } from '@/types/api';

export class AuthService {
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await ApiClient.post<LoginResponse>(
      '/auth/login',
      credentials
    );
    
    // Store token and user data
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user_phone', response.phoneNumber);
    localStorage.setItem('user_role', response.role);
    
    return response;
  }

  static logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_phone');
    localStorage.removeItem('user_role');
  }

  static getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  static getRole(): 'ADMIN' | 'STORE_EMPLOYEE' | null {
    const role = localStorage.getItem('user_role');
    return role as 'ADMIN' | 'STORE_EMPLOYEE' | null;
  }

  static getPhoneNumber(): string | null {
    return localStorage.getItem('user_phone');
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }
}
