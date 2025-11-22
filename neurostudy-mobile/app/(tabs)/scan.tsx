import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Button from '../../components/Button';
import { Colors } from '@/constants/colors';
import { studyService } from '../../services/studyService';

export default function ScanScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is needed to scan textbook pages'
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleChooseFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleUploadAndProcess = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Please select an image first');
      return;
    }

    setUploading(true);
    try {
      const uploadResult = await studyService.uploadImage(selectedImage);
      router.push({
        pathname: '/processing',
        params: {
          sessionId: uploadResult.session_id,
          imageUrl: uploadResult.image_url,
        },
      });
    } catch (error: any) {
      Alert.alert('Upload Failed', error.toString());
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan Textbook Page</Text>
        <Text style={styles.subtitle}>
          Take a photo or upload an image of your textbook
        </Text>
      </View>

      {selectedImage ? (
        <View style={styles.imagePreview}>
          <Image
            source={{ uri: selectedImage }}
            style={styles.image}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.changeButton}
            onPress={() => setSelectedImage(null)}
          >
            <Text style={styles.changeButtonText}>Change Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleTakePhoto}
          >
            <View style={styles.captureIconCircle}>
              <Ionicons name="camera" size={40} color={Colors.white} />
            </View>
            <Text style={styles.captureText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleChooseFromGallery}
          >
            <Ionicons name="image" size={24} color={Colors.primary} />
            <Text style={styles.uploadText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      )}

      {selectedImage && (
        <View style={styles.footer}>
          <Button
            title="Process Image"
            onPress={handleUploadAndProcess}
            loading={uploading}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
  },
  imagePreview: {
    flex: 1,
    margin: 24,
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    width: '100%',
  },
  changeButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.background,
  },
  changeButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  captureButton: {
    alignItems: 'center',
    marginBottom: 32,
  },
  captureIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  captureText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  uploadText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
  },
});
