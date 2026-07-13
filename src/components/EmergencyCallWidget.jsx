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
        throw new Error('Sessão do idoso não encontrada. Faça login novamente.');
      }

      const contato = await buscarContatoEmergencia(usuario.id);
      const telefone = montarTelefoneContato(contato);

      if (!telefone) {
        throw new Error('Contato de emergência sem telefone cadastrado.');
      }

      if (Platform.OS === 'android') {
        await iniciarWidgetEmergencia(telefone);
        Alert.alert('Emergência', 'Widget de emergência ativado. Ele ficará sobreposto fora do app.');
        return;
      }

      const url = `tel:${telefone}`;
      const podeLigar = await Linking.canOpenURL(url);

      if (!podeLigar) {
        throw new Error('Este dispositivo não permite iniciar ligações.');
      }

      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Emergência', error.message || 'Não foi possível ligar para o cuidador.');
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
      <Text style={styles.label}>{ligando ? 'Ligando...' : 'Emergência'}</Text>
      <Text style={styles.subLabel}>
        {ligando ? 'Ativando widget...' : 'Toque para ligar ao cuidador'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.vermelhoClaro,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f2c2c2',
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  icon: { fontSize: 32, color: colors.vermelho, fontWeight: '900' },
  label: { fontSize: 22, fontWeight: '800', color: colors.vermelhoEsc, letterSpacing: 0 },
  subLabel: { fontSize: 13, color: colors.textoSecundario },
});
