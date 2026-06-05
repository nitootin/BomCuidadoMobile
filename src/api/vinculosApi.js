import { apiFetch } from './client';

export async function buscarContatoEmergencia(idosoId) {
  return apiFetch('/vinculo/idoso/' + idosoId + '/contato-emergencia');
}
