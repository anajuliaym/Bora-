// Este app não tem backend real — login/cadastro, feed, eventos, ranking,
// chat, grupos e perfis de terceiros são todos dados mockados (ver
// mock-data/mock-data.js) ou gerados na hora (ver Perfil.jsx). A única
// integração real com algo externo é a câmera do dispositivo (useCamera.js).
//
// Quando este app ganhar um backend de verdade, o padrão a seguir é: o
// token de autenticação fica em escopo de módulo aqui (uma variável de
// módulo, não exportada), nunca em localStorage/sessionStorage — assim ele
// não fica acessível a nenhum script de terceiros nem sobrevive a um XSS.
//
// let authToken = null;
// export function setAuthToken(token) { authToken = token; }
// export async function apiFetch(path, options = {}) {
//   const headers = { ...options.headers };
//   if (authToken) headers.Authorization = `Bearer ${authToken}`;
//   const res = await fetch(`/api${path}`, { ...options, headers });
//   if (!res.ok) throw new Error(`API ${path} respondeu ${res.status}`);
//   return res.json();
// }
