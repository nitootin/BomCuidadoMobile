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
import { EmergencyCallWidget } from '../components/EmergencyCallWidget';
import { agendarNotificacoesMedicacoes } from '../services/notificationService';

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

function obterTimestamp(data) {
  const valor = new Date(data);
  return Number.isNaN(valor.getTime()) ? Number.MAX_SAFE_INTEGER : valor.getTime();
}

function ehAlertaMedicacao(alerta) {
  return alerta.tipoAlerta === 'REMEDIO' || Boolean(alerta.prescricaoId || alerta.remedioNome);
}

function selecionarProximasMedicacoes(alertas) {
  const agora = Date.now();

  return alertas
    .filter(ehAlertaMedicacao)
    .filter((alerta) => alerta.statusAlertas !== 'REALIZADO')
    .sort((a, b) => {
      const diffA = Math.abs(obterTimestamp(a.dataAgendada) - agora);
      const diffB = Math.abs(obterTimestamp(b.dataAgendada) - agora);
      return diffA - diffB;
    })
    .slice(0, 3);
}

function normalizarAlerta(alerta) {
  const realizado = alerta.statusAlertas === 'REALIZADO';
  const horarioAgendado = obterTimestamp(alerta.dataAgendada);
  const atrasado = !realizado && horarioAgendado < Date.now();

  return {
    id: alerta.id,
    nome: alerta.remedioNome || 'Medicamento',
    horario: formatarHorario(alerta.dataAgendada),
    dose: 'Medicamento',
    status: realizado ? 'tomou' : atrasado ? 'atrasado' : 'pendente',
    confirmadoAs: realizado ? formatarHorario(alerta.dataAtualizacao) : null,
    corFundo: '#E3F2FD',
  };
}

function MedCard({ med, onConfirmar }) {
  const borderColor =
    med.status === 'atrasado'
      ? '#FFB74D'
      : med.status === 'tomou'
        ? colors.verdeBorda
        : colors.cinzaBorda;

  const badgeStyle =
    med.status === 'atrasado'
      ? styles.badgeAtrasado
      : med.status === 'tomou'
        ? styles.badgeTomou
        : styles.badgePendente;

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
          style={[styles.medBadge, badgeStyle]}
        >
          {med.status === 'tomou'
            ? 'Tomou'
            : med.status === 'atrasado'
              ? 'Atrasado'
              : med.horario}
        </Text>
      </View>

      {med.status !== 'tomou' ? (
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

  async function carregarAlertas() {
    try {
      setCarregando(true);
      setErro('');
      const lista = await listarMeusAlertas();
      await agendarNotificacoesMedicacoes(lista).catch(() => null);
      const proximasMedicacoes = selecionarProximasMedicacoes(lista);
      setMedicacoes(proximasMedicacoes.map(normalizarAlerta));
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
      await confirmarAlerta(id);
      await carregarAlertas();
    } catch (error) {
      Alert.alert('Erro', error.message || 'Nao foi possivel confirmar o alerta.');
    }
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
        <EmergencyCallWidget />

        <Text style={styles.secaoTitulo}>Proximas medicacoes</Text>

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
            <Text style={styles.estadoTexto}>Nenhuma medicacao pendente.</Text>
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
  badgePendente: { color: colors.textoMudo },
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
