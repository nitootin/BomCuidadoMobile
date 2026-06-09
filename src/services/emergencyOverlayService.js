import { NativeModules, PermissionsAndroid, Platform } from 'react-native';

const { EmergencyOverlay } = NativeModules;

async function solicitarPermissaoLigacaoDireta() {
  const resultado = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CALL_PHONE,
    {
      title: 'Permissao para chamada de emergencia',
      message: 'O BomCuidado precisa desta permissao para ligar direto ao tocar no SOS.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Cancelar',
    }
  );

  if (resultado !== PermissionsAndroid.RESULTS.GRANTED) {
    throw new Error('Permissao de chamada negada. Ative a permissao Telefone para usar a ligacao direta.');
  }
}

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

  await solicitarPermissaoLigacaoDireta();

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
