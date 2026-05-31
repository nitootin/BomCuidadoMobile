import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { confirmarAlerta, listarMeusAlertas } from '../api/alertasApi';
import { colors } from '../constants/colors';

function formatarHorario(data) {
  if (!data) return 'Horario nao informado';

  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return 'Horario nao informado';

  return valor.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatarDataHoje() {
  return new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
}

function normalizarAlerta(alerta) {
  const realizado = alerta.statusAlertas === 'REALIZADO';
  const remedio = alerta.tipoAlerta === 'REMEDIO';

  return {
    id: alerta.id,
    nome: alerta.remedioNome || alerta.tipoAlerta || 'Alerta',
    horario: formatarHorario(alerta.dataAgendada),
    dose: remedio ? 'Medicamento' : 'Compromisso',
    status: realizado ? 'tomou' : 'atrasado',
    confirmadoAs: realizado ? formatarHorario(alerta.dataAtualizacao) : null,
    corFundo: remedio ? '#E3F2FD' : '#F3E5F5',
  };
}

function MedCard({ med, onConfirmar }) {
  const borderColor =
    med.status === 'atrasado'
      ? '#FFB74D'
      : med.status === 'tomou'
        ? colors.verdeBorda
        : colors.cinzaBorda;

  return (
    <View style={[styles.medCard, { borderColor }]}>
      <View style={styles.medTopo}>
        <View style={[styles.medIco, { backgroundColor: med.corFundo }]}>
          <Text style={styles.medIcoTexto}>+</Text>
        </View>
        <View style={styles.medInfo}>
          <Text style={styles.medNome}>{med.nome}</Text>
          <Text style={styles.medHorario}>{med.horario} - {med.dose}</Text>
        </View>
        <Text
          style={[
            styles.medBadge,
            med.status === 'atrasado' ? styles.badgeAtrasado : styles.badgeTomou,
          ]}
        >
          {med.status === 'tomou' ? 'Tomou' : med.horario}
        </Text>
      </View>

      {med.status === 'atrasado' ? (
        <TouchableOpacity
          style={styles.btnConfirmar}
          onPress={() => onConfirmar(med.id)}
          activeOpacity={0.85}
        >
          <Text style={styles.btnConfirmarTexto}>Confirmar que tomei</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.confirmadoBox}>
          <Text style={styles.confirmadoTexto}>Confirmado as {med.confirmadoAs}</Text>
        </View>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const [medicacoes, setMedicacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [ligando, setLigando] = useState(false);

  async function carregarAlertas() {
    try {
      setCarregando(true);
      setErro('');
      const lista = await listarMeusAlertas();
      setMedicacoes(lista.map(normalizarAlerta));
    } catch (error) {
      setErro(error.message || 'Nao foi possivel carregar os alertas.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAlertas();
  }, []);

  async function handleConfirmar(id) {
    try {
      const atualizado = await confirmarAlerta(id);
      const alertaNormalizado = normalizarAlerta(atualizado);
      setMedicacoes((prev) =>
        prev.map((med) => (med.id === id ? alertaNormalizado : med))
      );
    } catch (error) {
      Alert.alert('Erro', error.message || 'Nao foi possivel confirmar o alerta.');
    }
  }

  function handleEmergencia() {
    setLigando(true);
    Alert.alert('Emergencia', 'Ligando para o servico de socorro...', [
      { text: 'OK', onPress: () => setLigando(false) },
    ]);
    setTimeout(() => setLigando(false), 3000);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerOla}>Ola,</Text>
        <Text style={styles.headerNome}>BomCuidado</Text>
        <Text style={styles.headerData}>{formatarDataHoje()}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.btnEmergencia}
          onPress={handleEmergencia}
          activeOpacity={0.9}
        >
          <Text style={styles.emgIco}>!</Text>
          <Text style={styles.emgLabel}>
            {ligando ? 'LIGANDO...' : 'EMERGENCIA'}
          </Text>
          <Text style={styles.emgSub}>
            {ligando ? 'Conectando ao socorro...' : 'Toque para ligar para socorro'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.secaoTitulo}>Medicacoes de Hoje</Text>

        {carregando ? (
          <View style={styles.estadoCard}>
            <Text style={styles.estadoTexto}>Carregando alertas...</Text>
          </View>
        ) : erro ? (
          <View style={styles.estadoCard}>
            <Text style={styles.estadoErro}>{erro}</Text>
          </View>
        ) : medicacoes.length > 0 ? (
          medicacoes.map((med) => (
            <MedCard key={med.id} med={med} onConfirmar={handleConfirmar} />
          ))
        ) : (
          <View style={styles.estadoCard}>
            <Text style={styles.estadoTexto}>Nenhum alerta para hoje.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cinzaBg,
  },
  header: {
    backgroundColor: colors.branco,
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.cinzaBorda,
  },
  headerOla: { fontSize: 16, color: colors.textoMudo },
  headerNome: { fontSize: 32, fontWeight: '900', color: colors.texto, marginVertical: 2 },
  headerData: { fontSize: 13, color: colors.textoMudo, textTransform: 'capitalize' },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
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
  emgIco: { fontSize: 36, color: '#fff', fontWeight: '900' },
  emgLabel: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  emgSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.texto,
    marginTop: 4,
  },
  medCard: {
    backgroundColor: colors.branco,
    borderRadius: 22,
    borderWidth: 2,
    padding: 18,
    gap: 14,
  },
  medTopo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  medIco: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medIcoTexto: { fontSize: 24, fontWeight: '900', color: colors.verde },
  medInfo: { flex: 1 },
  medNome: { fontSize: 17, fontWeight: '800', color: colors.texto },
  medHorario: { fontSize: 13, color: colors.textoMudo, marginTop: 2 },
  medBadge: { fontSize: 13, fontWeight: '700' },
  badgeAtrasado: { color: '#F57C00' },
  badgeTomou: { color: colors.verde },
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
  estadoCard: {
    backgroundColor: colors.branco,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.cinzaBorda,
    padding: 22,
    alignItems: 'center',
  },
  estadoTexto: { fontSize: 15, fontWeight: '700', color: colors.textoMudo },
  estadoErro: { fontSize: 15, fontWeight: '700', color: colors.vermelho },
});
