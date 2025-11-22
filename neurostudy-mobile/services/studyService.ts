import { apiClient } from './api';
import * as ImagePicker from 'expo-image-picker';

export const studyService = {
  uploadImage: async (imageUri: string) => {
    const formData = new FormData();
    
    // Expo ImagePicker format
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      type,
      name: filename,
    } as any);

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data;
  },

  processImage: async (sessionId: string, imageUrl: string) => {
    const response = await apiClient.post('/process', {
      session_id: sessionId,
      image_url: imageUrl,
    });
    return response.data.data;
  },

  getStudySession: async (sessionId: string) => {
    const response = await apiClient.get(`/study/${sessionId}`);
    return response.data.data;
  },

  getRecentSessions: async () => {
    const response = await apiClient.get('/study/recent');
    return response.data.data;
  },
};
