import { apiFetch } from './client';

function conteudoPaginado(data) {
  return Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : [];
}

export async function listarMeusAlertas() {
  const data = await apiFetch('/alertas/me?size=100&sort=id,asc');
  return conteudoPaginado(data);
}

export async function confirmarAlerta(id) {
  return apiFetch(`/alertas/${id}/confirmar`, {
    method: 'PUT',
  });
}
