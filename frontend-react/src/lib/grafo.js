// Operações sobre o grafo de locais rodando no cliente. Espelham o
// GrafoService do backend e servem de fallback quando a API está fora do ar
// (o mapa continua funcional com mock-data/grafo.json).
// SUBSTITUIR EM PRODUÇÃO: remover o fallback — a fonte de verdade é a API.

const RAIO_TERRA_KM = 6371;
const r2 = (x) => Math.round(x * 100) / 100;

export function haversineKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const dlat = lat2 - lat1, dlon = toRad(b.lon - a.lon);
  const h = Math.sin(dlat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
  return r2(2 * RAIO_TERRA_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Cria as mesmas operações da API a partir de um grafo em memória. */
export function criarOperacoesLocais(grafo) {
  const porId = new Map(grafo.locais.map((l) => [l.id, l]));
  const regiaoPorId = new Map(grafo.regioes.map((r) => [r.id, r.nome]));
  const adj = new Map();
  for (const a of grafo.arestas) {
    if (!adj.has(a.de)) adj.set(a.de, []);
    if (!adj.has(a.para)) adj.set(a.para, []);
    adj.get(a.de).push(a);
    adj.get(a.para).push(a);
  }
  const dto = (l) => ({ ...l, regiao: l.regiao || regiaoPorId.get(l.regiaoId) });

  return {
    async buscar(q, categoria) {
      const nq = norm(q), nc = norm(categoria);
      return grafo.locais
        .filter((l) => (!nq || norm(l.nome).includes(nq)) && (!nc || norm(l.categoria) === nc))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
        .map(dto);
    },

    async vizinhos(id) {
      return (adj.get(id) || [])
        .map((a) => ({ local: dto(porId.get(a.de === id ? a.para : a.de)), km: a.km }))
        .sort((a, b) => a.km - b.km);
    },

    async proximos(id, raioKm, categoria) {
      const origem = porId.get(id);
      if (!origem) return [];
      const nc = norm(categoria);
      return grafo.locais
        .filter((l) => l.id !== id && (!nc || norm(l.categoria) === nc))
        .map((l) => ({ local: dto(l), km: haversineKm(origem, l) }))
        .filter((v) => v.km <= raioKm)
        .sort((a, b) => a.km - b.km);
    },

    async rota(de, para) {
      const vazio = { encontrada: false, distanciaKm: 0, caminho: [], arestas: [] };
      if (!porId.has(de) || !porId.has(para)) return vazio;
      const dist = new Map([[de, 0]]);
      const anterior = new Map();
      const aberto = new Set([de]);
      while (aberto.size) {
        let u = null;
        for (const v of aberto) if (u === null || dist.get(v) < dist.get(u)) u = v;
        aberto.delete(u);
        if (u === para) break;
        for (const a of adj.get(u) || []) {
          const v = a.de === u ? a.para : a.de;
          const nd = dist.get(u) + a.km;
          if (nd < (dist.has(v) ? dist.get(v) : Infinity)) {
            dist.set(v, nd);
            anterior.set(v, a);
            aberto.add(v);
          }
        }
      }
      if (!dist.has(para)) return vazio;
      const caminho = [], arestas = [];
      for (let cur = para; cur !== de; ) {
        caminho.push(dto(porId.get(cur)));
        const a = anterior.get(cur);
        arestas.push(a);
        cur = a.de === cur ? a.para : a.de;
      }
      caminho.push(dto(porId.get(de)));
      return { encontrada: true, distanciaKm: r2(dist.get(para)), caminho: caminho.reverse(), arestas: arestas.reverse() };
    },
  };
}
