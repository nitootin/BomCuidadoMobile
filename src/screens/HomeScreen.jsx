import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { confirmarAlerta, listarMeusAlertas } from '../api/alertasApi';
import { colors } from '../constants/colors';
import { EmergencyCallWidget } from '../components/EmergencyCallWidget';
import { BrandLogo } from '../components/BrandLogo';
import { agendarNotificacoesMedicacoes } from '../services/notificationService';

function formatarHorario(data) {
  if (!data) return 'Horário não informado';

  const valor = new Date(data);
  if (Number.isNaN(valor.getTime())) return 'Horário não informado';

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
    corFundo: colors.verdeClaro,
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
          <Text style={styles.medIcoTexto}>Rx</Text>
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
      setErro(error.message || 'Não foi possível carregar os alertas.');
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
      Alert.alert('Erro', error.message || 'Não foi possível confirmar o alerta.');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <BrandLogo size="sm" />
        <View style={styles.headerTexto}>
          <Text style={styles.headerTitulo}>Painel do paciente</Text>
          <Text style={styles.headerData}>{formatarDataHoje()}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <EmergencyCallWidget />

        <View style={styles.secaoCabecalho}>
          <Text style={styles.secaoTitulo}>Próximas medicações</Text>
          <Text style={styles.secaoSubtitulo}>Alertas pendentes e confirmações do dia</Text>
        </View>

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
            <Text style={styles.estadoTexto}>Nenhuma medicação pendente.</Text>
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
    paddingTop: 14,
    paddingBottom: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cinzaBorda,
  },
  headerTexto: {
    flex: 1,
    gap: 4,
  },
  headerTitulo: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.texto,
  },
  headerData: {
    fontSize: 13,
    color: colors.textoSecundario,
    textTransform: 'capitalize',
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  secaoCabecalho: {
    gap: 4,
    marginTop: 2,
  },
  secaoTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.texto,
  },
  secaoSubtitulo: {
    fontSize: 13,
    color: colors.textoSecundario,
  },
  medCard: {
    backgroundColor: colors.branco,
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  medTopo: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  medIco: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medIcoTexto: { fontSize: 16, fontWeight: '900', color: colors.verde },
  medInfo: { flex: 1 },
  medNome: { fontSize: 17, fontWeight: '700', color: colors.texto },
  medHorario: { fontSize: 13, color: colors.textoMudo, marginTop: 2 },
  medBadge: { fontSize: 13, fontWeight: '700' },
  badgeAtrasado: { color: '#b85f00' },
  badgeTomou: { color: colors.verde },
  badgePendente: { color: colors.textoMudo },
  btnConfirmar: {
    backgroundColor: colors.verde,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: colors.verde,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  btnConfirmarTexto: { fontSize: 16, fontWeight: '700', color: '#fff' },
  confirmadoBox: {
    backgroundColor: colors.verdeClaro,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmadoTexto: { fontSize: 16, fontWeight: '700', color: colors.verde },
  estadoCard: {
    backgroundColor: colors.branco,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cinzaBorda,
    padding: 22,
    alignItems: 'center',
  },
  estadoTexto: { fontSize: 15, fontWeight: '700', color: colors.textoMudo },
  estadoErro: { fontSize: 15, fontWeight: '700', color: colors.vermelho },
});
