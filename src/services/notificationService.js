import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

const IDS_NOTIFICACOES_KEY = 'bomcuidado_notificacoes_medicacoes';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function configurarCanalAndroid() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('medicacoes', {
    name: 'Medicações',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

async function solicitarPermissaoNotificacoes() {
  const permissaoAtual = await Notifications.getPermissionsAsync();
  let status = permissaoAtual.status;

  if (status !== 'granted') {
    const novaPermissao = await Notifications.requestPermissionsAsync();
    status = novaPermissao.status;
  }

  return status === 'granted';
}

async function obterIdsAgendados() {
  const valor = await SecureStore.getItemAsync(IDS_NOTIFICACOES_KEY);
  if (!valor) return [];

  try {
    const ids = JSON.parse(valor);
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

async function limparNotificacoesMedicacoes() {
  const ids = await obterIdsAgendados();

  await Promise.all(
    ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => null))
  );

  await SecureStore.deleteItemAsync(IDS_NOTIFICACOES_KEY);
}

function ehMedicacaoPendente(alerta) {
  const ehMedicacao =
    alerta.tipoAlerta === 'REMEDIO' || Boolean(alerta.prescricaoId || alerta.remedioNome);

  return ehMedicacao && alerta.statusAlertas !== 'REALIZADO';
}

function obterDataAgendada(alerta) {
  const data = new Date(alerta.dataAgendada);
  return Number.isNaN(data.getTime()) ? null : data;
}

function formatarHorarioNotificacao(data) {
  return data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function montarConteudoNotificacao(alerta, dataAgendada) {
  const nomeMedicacao = alerta.remedioNome || 'sua medicação';
  const horario = formatarHorarioNotificacao(dataAgendada);

  return {
    title: `Hora de tomar ${nomeMedicacao}`,
    subtitle: `Medicação das ${horario}`,
    body: `Está na hora da sua medicação das ${horario}. Confirme no BomCuidado quando tomar.`,
    sound: 'default',
    priority: Notifications.AndroidNotificationPriority.HIGH,
    data: { alertaId: alerta.id, tipo: 'medicacao' },
  };
}

export async function agendarNotificacoesMedicacoes(alertas) {
  const notificacoesHabilitadas = await solicitarPermissaoNotificacoes();
  if (!notificacoesHabilitadas) return;

  await configurarCanalAndroid();
  await limparNotificacoesMedicacoes();

  const agora = Date.now();
  const alertasParaAgendar = alertas
    .filter(ehMedicacaoPendente)
    .map((alerta) => ({ alerta, dataAgendada: obterDataAgendada(alerta) }))
    .filter(({ dataAgendada }) => dataAgendada && dataAgendada.getTime() > agora)
    .sort((a, b) => a.dataAgendada.getTime() - b.dataAgendada.getTime());

  const ids = [];

  for (const { alerta, dataAgendada } of alertasParaAgendar) {
    const id = await Notifications.scheduleNotificationAsync({
      content: montarConteudoNotificacao(alerta, dataAgendada),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: dataAgendada,
        channelId: 'medicacoes',
      },
    });

    ids.push(id);
  }

  await SecureStore.setItemAsync(IDS_NOTIFICACOES_KEY, JSON.stringify(ids));
}
