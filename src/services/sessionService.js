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

function decodificarBase64Url(valor) {
  const base64 = valor.replace(/-/g, '+').replace(/_/g, '/');
  const preenchido = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let saida = '';

  for (let i = 0; i < preenchido.length; i += 4) {
    const enc1 = caracteres.indexOf(preenchido.charAt(i));
    const enc2 = caracteres.indexOf(preenchido.charAt(i + 1));
    const enc3 = caracteres.indexOf(preenchido.charAt(i + 2));
    const enc4 = caracteres.indexOf(preenchido.charAt(i + 3));
    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    saida += String.fromCharCode(chr1);
    if (enc3 !== 64) saida += String.fromCharCode(chr2);
    if (enc4 !== 64) saida += String.fromCharCode(chr3);
  }

  return decodeURIComponent(
    saida
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join('')
  );
}

function tokenExpirado(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;

    const dados = JSON.parse(decodificarBase64Url(payload));
    if (!dados.exp) return false;

    return dados.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export async function existeSessaoValida() {
  const token = await obterToken();

  if (!token) {
    return false;
  }

  if (tokenExpirado(token)) {
    await limparSessao();
    return false;
  }

  return true;
}

export async function obterUsuario() {
  const data = await SecureStore.getItemAsync(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export async function limparSessao() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}
