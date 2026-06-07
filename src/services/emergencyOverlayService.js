import { NativeModules, Platform } from 'react-native';

const { EmergencyOverlay } = NativeModules;


export function overlayEmergenciaDisponivel() {
  return Platform.OS === 'android' && Boolean(EmergencyOverlay);
}

export async function iniciarWidgetEmergencia(telefone) {
  if (Platform.OS !== 'android') {
    throw new Error('Widget sobreposto disponivel apenas no Android.');
  }

  if (!EmergencyOverlay) {
    throw new Error('Recompile o APK/dev build para habilitar o widget sobre outros apps.');
  }

  const permitido = await EmergencyOverlay.canDrawOverlays();
  if (!permitido) {
    EmergencyOverlay.openOverlaySettings();
    throw new Error('Ative a permissao "Aparecer sobre outros apps" e toque em emergencia novamente.');
  }

  await EmergencyOverlay.startOverlay(telefone);
}

export async function pararWidgetEmergencia() {
  if (Platform.OS === 'android' && EmergencyOverlay) {
    await EmergencyOverlay.stopOverlay();
  }
}
