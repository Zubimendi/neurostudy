import 'dotenv/config';

export default {
  expo: {
    name: "NeuroStudy",
    slug: "neurostudy",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#4B4BFF"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.neurostudy.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#4B4BFF"
      },
      package: "com.neurostudy.app"
    },
    plugins: [
      "expo-router",
      "expo-camera",
      "expo-image-picker"
    ],
    extra: {
      // These will be available via expo-constants
      apiUrl: process.env.BACKEND_URL || "http://10.65.72.243:8080/api/v1",
      aiWorkerUrl: process.env.AI_WORKER_URL || "http://10.65.72.243:5000/api"
    }
  }
};