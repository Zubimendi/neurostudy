import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update these URLs based on your environment
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:8080/api/v1'  // Android emulator
  // ? 'http://localhost:8080/api/v1'  // iOS simulator
  : 'https://your-production-api.com/api/v1';

const AI_BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000/api'
  : 'https://your-production-ai.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      // Router will handle redirect
    }
    return Promise.reject(error);
  }
);

export { apiClient, API_BASE_URL, AI_BASE_URL };