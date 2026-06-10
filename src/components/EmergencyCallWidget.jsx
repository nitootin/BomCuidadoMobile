import { useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { buscarContatoEmergencia } from '../api/vinculosApi';
import { iniciarWidgetEmergencia } from '../services/emergencyOverlayService';
import { colors } from '../constants/colors';
import { obterUsuario } from '../services/sessionService';

function montarTelefoneContato(contato) {
  const ddd = String(contato?.ddd || '').replace(/\D/g, '');
  const telefone = String(contato?.telefone || '').replace(/\D/g, '');

  return `${ddd}${telefone}`;
}

export function EmergencyCallWidget() {
  const [ligando, setLigando] = useState(false);

  async function handleEmergencia() {
    if (ligando) return;

    try {
      setLigando(true);

      const usuario = await obterUsuario();
      if (!usuario?.id) {
        throw new Error('Sessao do idoso nao encontrada. Faca login novamente.');
      }

      const contato = await buscarContatoEmergencia(usuario.id);
      const telefone = montarTelefoneContato(contato);

      if (!telefone) {
        throw new Error('Contato de emergencia sem telefone cadastrado.');
      }

      if (Platform.OS === 'android') {
        await iniciarWidgetEmergencia(telefone);
        Alert.alert('Emergencia', 'Widget de emergencia ativado. Ele ficara sobreposto fora do app.');
        return;
      }

      const url = `tel:${telefone}`;
      const podeLigar = await Linking.canOpenURL(url);

      if (!podeLigar) {
        throw new Error('Este dispositivo nao permite iniciar ligacoes.');
      }

      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Emergencia', error.message || 'Nao foi possivel ligar para o cuidador.');
    } finally {
      setLigando(false);
    }
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleEmergencia}
      activeOpacity={0.9}
      disabled={ligando}
    >
      <Text style={styles.icon}>!</Text>
      <Text style={styles.label}>{ligando ? 'LIGANDO...' : 'EMERGENCIA'}</Text>
      <Text style={styles.subLabel}>
        {ligando ? 'Ativando widget...' : 'Toque para ativar o widget'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.vermelho,
    borderRadius: 26,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
    shadowColor: colors.vermelho,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 6,
  },
  icon: { fontSize: 36, color: '#fff', fontWeight: '900' },
  label: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  subLabel: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
});
