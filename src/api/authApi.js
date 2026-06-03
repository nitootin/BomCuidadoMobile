import { apiFetch } from './client';
import { salvarSessao } from '../services/sessionService';

export async function loginIdoso(senhaAcesso) {
  const sessao = await apiFetch('/auth/idoso/login', {
    method: 'POST',
    body: JSON.stringify({ senhaAcesso }),
  });

  await salvarSessao(sessao);
  return sessao;
}
