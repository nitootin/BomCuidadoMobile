import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { EmergencyOverlay } = NativeModules;

async function solicitarPermissaoLigacaoDireta() {
  const resultado = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CALL_PHONE,
    {
      title: 'Permissão para chamada de emergência',
      message: 'O BomCuidado precisa desta permissão para ligar direto ao tocar no SOS.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Cancelar',
    }
  );

  if (resultado !== PermissionsAndroid.RESULTS.GRANTED) {
    throw new Error('Permissão de chamada negada. Ative a permissão Telefone para usar a ligação direta.');
  }
}

export function overlayEmergenciaDisponivel() {
  return Platform.OS === 'android' && Boolean(EmergencyOverlay);
}

export async function iniciarWidgetEmergencia(telefone) {
  if (Platform.OS !== 'android') {
    throw new Error('Widget sobreposto disponível apenas no Android.');
  }

  if (!EmergencyOverlay) {
    throw new Error('Recompile o APK/dev build para habilitar o widget sobre outros apps.');
  }

  await solicitarPermissaoLigacaoDireta();

  const permitido = await EmergencyOverlay.canDrawOverlays();
  if (!permitido) {
    EmergencyOverlay.openOverlaySettings();
    throw new Error('Ative a permissão "Aparecer sobre outros apps" e toque em emergência novamente.');
  }

  await EmergencyOverlay.startOverlay(telefone);
}

export async function pararWidgetEmergencia() {
  if (Platform.OS === 'android' && EmergencyOverlay) {
    await EmergencyOverlay.stopOverlay();
  }
}
