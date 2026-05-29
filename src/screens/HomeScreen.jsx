import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors } from '../../src/constants/colors';

// ─── Dados de exemplo (virão da API futuramente) ───────────────────────────
const MEDICACOES_INICIAL = [
  {
    id: 1,
    nome: 'Losartana 50mg',
    horario: '8:00 da manhã',
    dose: '1 comprimido',
    status: 'atrasado', // 'atrasado' | 'tomou' | 'futuro'
    confirmadoAs: null,
    cor: '#EF5350',
    corFundo: '#FFEBEE',
  },
  {
    id: 2,
    nome: 'Metformina 850mg',
    horario: '7:00 da manhã',
    dose: '1 comprimido',
    status: 'tomou',
    confirmadoAs: '7:15',
    cor: '#42A5F5',
    corFundo: '#E3F2FD',
  },
  {
    id: 3,
    nome: 'AAS 100mg',
    horario: '14:00',
    dose: '1 comprimido · após almoço',
    status: 'futuro',
    confirmadoAs: null,
    cor: '#AB47BC',
    corFundo: '#F3E5F5',
  },
];

// ─── Componente de card de medicação ──────────────────────────────────────
function MedCard({ med, onConfirmar }) {
  const borderColor =
    med.status === 'atrasado' ? '#FFB74D'
    : med.status === 'tomou'  ? colors.verdeBorda
    : colors.cinzaBorda;

  return (
    <View style={[styles.medCard, { borderColor }]}>
      {/* Topo */}
      <View style={styles.medTopo}>
        <View style={[styles.medIco, { backgroundColor: med.corFundo }]}>
          <Text style={{ fontSize: 22 }}>💊</Text>
        </View>
        <View style={styles.medInfo}>
          <Text style={styles.medNome}>{med.nome}</Text>
          <Text style={styles.medHorario}>{med.horario} · {med.dose}</Text>
        </View>
        <Text style={[
          styles.medBadge,
          med.status === 'atrasado' ? styles.badgeAtrasado
          : med.status === 'tomou'  ? styles.badgeTomou
          : styles.badgeFuturo,
        ]}>
          {med.status === 'atrasado' ? 'Atrasado'
           : med.status === 'tomou'  ? '✓ Tomou'
           : med.horario}
        </Text>
      </View>

      {/* Botão / status */}
      {med.status === 'atrasado' && (
        <TouchableOpacity
          style={styles.btnConfirmar}
          onPress={() => onConfirmar(med.id)}
          activeOpacity={0.85}
        >
          <Text style={styles.btnConfirmarTexto}>✓  Confirmar que tomei</Text>
        </TouchableOpacity>
      )}

      {med.status === 'tomou' && (
        <View style={styles.confirmadoBox}>
          <Text style={styles.confirmadoTexto}>✓ Confirmado às {med.confirmadoAs}</Text>
        </View>
      )}

      {med.status === 'futuro' && (
        <View style={styles.btnBloqueado}>
          <Text style={styles.btnBloqueadoTexto}>🕐  Disponível às {med.horario}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Tela principal ────────────────────────────────────────────────────────
export default function HomeScreen() {
  const [medicacoes, setMedicacoes] = useState(MEDICACOES_INICIAL);
  const [ligando, setLigando] = useState(false);

  function handleConfirmar(id) {
    const agora = new Date();
    const hora = `${agora.getHours()}:${String(agora.getMinutes()).padStart(2, '0')}`;
    setMedicacoes((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: 'tomou', confirmadoAs: hora } : m
      )
    );
  }

  function handleEmergencia() {
    setLigando(true);
    // Aqui você integrará com a chamada real (ex: Linking.openURL('tel:192'))
    Alert.alert('Emergência', 'Ligando para o serviço de socorro...', [
      { text: 'OK', onPress: () => setLigando(false) },
    ]);
    setTimeout(() => setLigando(false), 3000);
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerOla}>Olá,</Text>
        <Text style={styles.headerNome}>Sr. José</Text>
        <Text style={styles.headerData}>Terça, 24 de Junho</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Emergência */}
        <TouchableOpacity
          style={styles.btnEmergencia}
          onPress={handleEmergencia}
          activeOpacity={0.9}
        >
          <Text style={styles.emgIco}>📞</Text>
          <Text style={styles.emgLabel}>
            {ligando ? 'LIGANDO...' : 'EMERGÊNCIA'}
          </Text>
          <Text style={styles.emgSub}>
            {ligando ? 'Conectando ao socorro...' : 'Toque para ligar para socorro'}
          </Text>
        </TouchableOpacity>

        {/* Medicações */}
        <Text style={styles.secaoTitulo}>Medicações de Hoje</Text>

        {medicacoes.map((med) => (
          <MedCard key={med.id} med={med} onConfirmar={handleConfirmar} />
        ))}

        {/* Próxima consulta */}
        <View style={styles.consultaCard}>
          <View style={styles.consultaIco}>
            <Text style={{ fontSize: 22 }}>📅</Text>
          </View>
          <View>
            <Text style={styles.consultaTitulo}>Próxima Consulta</Text>
            <Text style={styles.consultaInfo}>Dr. Roberto · 26 Jun, 14h</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Estilos ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cinzaBg,
  },

  // Header
  header: {
    backgroundColor: colors.branco,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cinzaBorda,
  },
  headerOla:   { fontSize: 16, color: colors.textoMudo },
  headerNome:  { fontSize: 32, fontWeight: '900', color: colors.texto, marginVertical: 2 },
  headerData:  { fontSize: 13, color: colors.textoMudo },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },

  // Emergência
  btnEmergencia: {
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
  emgIco:   { fontSize: 36 },
  emgLabel: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  emgSub:   { fontSize: 13, color: 'rgba(255,255,255,0.75)' },

  // Seção
  secaoTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.texto,
    marginTop: 4,
  },

  // Med card
  medCard: {
    backgroundColor: colors.branco,
    borderRadius: 22,
    borderWidth: 2,
    padding: 18,
    gap: 14,
  },
  medTopo:    { flexDirection: 'row', alignItems: 'center', gap: 14 },
  medIco: {
    width: 50, height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medInfo:    { flex: 1 },
  medNome:    { fontSize: 17, fontWeight: '800', color: colors.texto },
  medHorario: { fontSize: 13, color: colors.textoMudo, marginTop: 2 },
  medBadge:   { fontSize: 13, fontWeight: '700' },
  badgeAtrasado: { color: '#F57C00' },
  badgeTomou:    { color: colors.verde },
  badgeFuturo:   { color: colors.textoMudo },

  btnConfirmar: {
    backgroundColor: colors.verde,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: colors.verde,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  btnConfirmarTexto: { fontSize: 17, fontWeight: '800', color: '#fff' },

  confirmadoBox: {
    backgroundColor: colors.verdeClaro,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmadoTexto: { fontSize: 16, fontWeight: '700', color: colors.verde },

  btnBloqueado: {
    backgroundColor: '#ECEFF1',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnBloqueadoTexto: { fontSize: 15, fontWeight: '700', color: colors.textoMudo },

  // Consulta
  consultaCard: {
    backgroundColor: colors.verdeClaro,
    borderWidth: 1.5,
    borderColor: colors.verdeBorda,
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  consultaIco: {
    width: 48, height: 48,
    borderRadius: 16,
    backgroundColor: colors.verde,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consultaTitulo: { fontSize: 15, fontWeight: '800', color: colors.verdeEsc },
  consultaInfo:   { fontSize: 13, color: '#00796B', marginTop: 2 },
});