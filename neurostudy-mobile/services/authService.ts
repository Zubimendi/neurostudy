import { apiClient } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export const authService = {
  register: async (email: string, password: string, fullName: string) => {
    try {
      console.log('🔵 Attempting registration...');
      const response = await apiClient.post('/auth/register', {
        email,
        password,
        full_name: fullName,
      });
      
      console.log('✅ Registration response:', response.data);
      const { token, user } = response.data.data;
      
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error: any) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      throw error.response?.data?.error || error.message || 'Registration failed';
    }
  },

  login: async (email: string, password: string) => {
    try {
      console.log('🔵 Attempting login for:', email);
      console.log('🔵 API endpoint:', apiClient.defaults.baseURL);
      
      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      console.log('✅ Login response:', response.data);
      const { token, user } = response.data.data;
      
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ Token saved, user logged in');
      return { token, user };
    } catch (error: any) {
      console.error('❌ Login error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error.response?.data?.error || error.message || 'Login failed';
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['authToken', 'user']);
  },

  getCurrentUser: async (): Promise<User | null> => {
    const userJson = await AsyncStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
  },

  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('authToken');
    return !!token;
  },
};
