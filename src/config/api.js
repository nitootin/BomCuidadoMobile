import { Platform } from 'react-native';

const HOST = process.env.EXPO_PUBLIC_API_HOST || 'localhost';
const PORT = process.env.EXPO_PUBLIC_API_PORT || '8080';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android'
    ? `http://10.0.2.2:${PORT}/api`
    : `http://${HOST}:${PORT}/api`);
