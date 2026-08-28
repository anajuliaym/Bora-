const INDEX_KEY = 'bora_albums_index';
const albumKey = (id) => `bora_album_${id}`;

export function loadAlbumIndex() {
  let idx;
  try {
    idx = JSON.parse(localStorage.getItem(INDEX_KEY));
  } catch {
    idx = null;
  }
  if (!idx || !idx.length) {
    idx = [{ id: 'default', name: 'Meu álbum' }];
    saveAlbumIndex(idx);
  }
  return idx;
}

export function saveAlbumIndex(idx) {
  try { localStorage.setItem(INDEX_KEY, JSON.stringify(idx)); } catch { /* localStorage indisponível (modo privado, quota) */ }
}

export function loadAlbumFor(id) {
  try {
    const v = localStorage.getItem(albumKey(id));
    if (v) return JSON.parse(v) || {};
    // SUBSTITUIR EM PRODUÇÃO: compat com a chave legada de uma versão
    // anterior do protótipo, que guardava só um álbum sem essa indexação.
    if (id === 'default') return JSON.parse(localStorage.getItem('bora_album_v1')) || {};
    return {};
  } catch {
    return {};
  }
}

export function saveAlbum(id, items) {
  try { localStorage.setItem(albumKey(id), JSON.stringify(items)); } catch { /* ignore */ }
}

export function deleteAlbumStorage(id) {
  try {
    localStorage.removeItem(albumKey(id));
    if (id === 'default') localStorage.removeItem('bora_album_v1');
  } catch { /* ignore */ }
}
