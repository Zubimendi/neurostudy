import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Read from expo config (which reads from .env)
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://10.65.72.243:8080/api/v1';
const AI_BASE_URL = Constants.expoConfig?.extra?.aiWorkerUrl || 'http://10.65.72.243:5000/api';

console.log('📡 API Configuration:');
console.log('   Backend:', API_BASE_URL);
console.log('   AI Worker:', AI_BASE_URL);

// Rest of the file stays the same...
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export { apiClient, API_BASE_URL, AI_BASE_URL };