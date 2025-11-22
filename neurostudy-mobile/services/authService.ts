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
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    
    const { token, user } = response.data.data;
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return { token, user };
  },

  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    
    const { token, user } = response.data.data;
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return { token, user };
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