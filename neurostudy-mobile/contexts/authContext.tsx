import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService, User } from '../services/authService';
import { useRouter, useSegments, useRootNavigationState } from 'expo-router';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    // Wait for navigation to be ready
    if (!navigationState?.key || loading) {
      console.log('⏳ Navigation not ready yet or still loading');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const currentPath = segments.join('/') || 'root';

    console.log('🔍 Navigation check:', { 
      user: user?.email, 
      inAuthGroup,
      currentPath,
      segments 
    });

    // User is logged in but on auth screen
    if (user && inAuthGroup) {
      console.log('➡️ User logged in, redirecting to dashboard');
      router.replace('/(tabs)');
      return;
    }

    // User is not logged in but not on auth screen
    if (!user && !inAuthGroup && currentPath !== 'root') {
      console.log('➡️ No user, redirecting to login');
      router.replace('/(auth)/login');
      return;
    }

    // User logged in and at root - go to dashboard
    if (user && (currentPath === 'root' || currentPath === '')) {
      console.log('➡️ User at root, redirecting to dashboard');
      router.replace('/(tabs)');
      return;
    }

    // No user and at root - go to login
    if (!user && (currentPath === 'root' || currentPath === '')) {
      console.log('➡️ No user at root, redirecting to login');
      router.replace('/(auth)/login');
      return;
    }

    console.log('✅ Navigation state is correct');
  }, [user, segments, loading, navigationState?.key]);

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      console.log('✅ Current user:', currentUser?.email || 'none');
      setUser(currentUser);
    } catch (error) {
      console.error('❌ Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔐 Login initiated');
    const { user: loggedInUser } = await authService.login(email, password);
    console.log('✅ User logged in:', loggedInUser.email);
    setUser(loggedInUser);
  };

  const register = async (email: string, password: string, fullName: string) => {
    console.log('📝 Registration initiated');
    const { user: registeredUser } = await authService.register(email, password, fullName);
    console.log('✅ User registered:', registeredUser.email);
    setUser(registeredUser);
  };

  const logout = async () => {
    console.log('👋 Logging out');
    await authService.logout();
    setUser(null);
    router.replace('/(auth)/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};