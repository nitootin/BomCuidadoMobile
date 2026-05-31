import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'bomcuidado_token';
const USER_KEY = 'bomcuidado_usuario';

export async function salvarSessao(data) {
  await SecureStore.setItemAsync(TOKEN_KEY, data.token);
  await SecureStore.setItemAsync(
    USER_KEY,
    JSON.stringify({
      id: data.id,
      nome: data.nome,
      perfil: data.perfil,
    })
  );
}

export async function obterToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function obterUsuario() {
  const data = await SecureStore.getItemAsync(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export async function limparSessao() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}
