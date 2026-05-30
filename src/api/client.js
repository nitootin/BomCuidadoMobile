import { API_BASE_URL } from '../config/api';
import { limparSessao, obterToken } from '../services/sessionService';

export async function apiFetch(path, options = {}) {
  const token = await obterToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    await limparSessao();
  }

  if (!response.ok) {
    throw new Error(data?.message || 'Erro ao conectar com o servidor.');
  }

  return data;
}
