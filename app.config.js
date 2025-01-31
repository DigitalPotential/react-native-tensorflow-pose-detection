module.exports = {
  expo: {
    name: "react-native-tensorflow-pose-detection",
    slug: "react-native-tensorflow-pose-detection",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSCameraUsageDescription:
          "$(PRODUCT_NAME) needs access to your Camera.",
        NSMicrophoneUsageDescription:
          "$(PRODUCT_NAME) needs access to your Microphone.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
      ],
      package: "com.digitalpotential.reactnativetensorflowposedetection",
      minSdkVersion: 26,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "react-native-vision-camera",
        {
          cameraPermissionText: "$(PRODUCT_NAME) needs access to your Camera.",
          enableMicrophonePermission: true,
          microphonePermissionText:
            "$(PRODUCT_NAME) needs access to your Microphone.",
          android: {
            minSdkVersion: 26,
          },
        },
      ],
      "react-native-fast-tflite",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "4968c73a-98a9-4f0c-be5f-af7e9593b620",
      },
    },
  },
};
