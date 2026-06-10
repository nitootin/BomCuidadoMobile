import { Platform } from 'react-native';

const DEFAULT_API_HOST = '144.22.199.87';
const HOST = process.env.EXPO_PUBLIC_API_HOST || DEFAULT_API_HOST;
const PORT = process.env.EXPO_PUBLIC_API_PORT || '8080';
const USE_ANDROID_EMULATOR_LOCALHOST =
  process.env.EXPO_PUBLIC_USE_ANDROID_EMULATOR_LOCALHOST === 'true';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (Platform.OS === 'android' && USE_ANDROID_EMULATOR_LOCALHOST
    ? `http://10.0.2.2:${PORT}/api`
    : `http://${HOST}:${PORT}/api`);
