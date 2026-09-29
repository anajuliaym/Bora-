// Cliente HTTP da API (backend/ — Spring Boot em :8080, acessado via proxy
// /api do Vite, ver vite.config.js).
//
// Hoje só o mapa (grafo de locais) fala com a API de verdade. Login/cadastro,
// feed, eventos, ranking, chat, grupos e perfis de terceiros continuam
// mockados em mock-data/mock-data.js — migrar cada um pra cá conforme os
// endpoints forem existindo no backend.
//
// O token de autenticação fica em escopo de módulo (variável não exportada),
// nunca em localStorage/sessionStorage — não fica acessível a script de
// terceiros nem sobrevive a um XSS (OWASP A07).

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

const TIMEOUT_MS = 4000;

export async function apiFetch(path, options = {}) {
  const headers = { Accept: 'application/json', ...options.headers };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`/api${path}`, { ...options, headers, signal: ctrl.signal });
    if (!res.ok) throw new Error(`API ${path} respondeu ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

const qs = (params) => {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};

// ---- Grafo de locais -------------------------------------------------------

export const getHealth = () => apiFetch('/health');
export const getGrafo = () => apiFetch('/grafo');
export const buscarLocais = (q, categoria) => apiFetch(`/locais${qs({ q, categoria })}`);
export const getVizinhos = (id) => apiFetch(`/locais/${encodeURIComponent(id)}/vizinhos`);
export const getProximos = (id, raio, categoria) =>
  apiFetch(`/locais/${encodeURIComponent(id)}/proximos${qs({ raio, categoria })}`);
export const getRota = (de, para) => apiFetch(`/rota${qs({ de, para })}`);
