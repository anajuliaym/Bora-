import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ScreenShell from '../../layout/ScreenShell.jsx';
import MapaCanvas from './MapaCanvas.jsx';
import { CAT_ICONS, corDe } from './categorias.js';
import styles from './Mapa.module.css';
import * as api from '../../../api.js';
import { criarOperacoesLocais } from '../../../lib/grafo.js';

const RAIOS = [1, 3, 5];
const fmtKm = (km) => `${km.toFixed(2).replace('.', ',')} km`;

const opsApi = {
  buscar: api.buscarLocais,
  vizinhos: api.getVizinhos,
  proximos: api.getProximos,
  rota: api.getRota,
};

export default function Mapa({ go }) {
  const [grafo, setGrafo] = useState(null);
  const [fonte, setFonte] = useState(null); // 'api' | 'local'
  const [health, setHealth] = useState(null);

  const [busca, setBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscaFoco, setBuscaFoco] = useState(false);
  const [cat, setCat] = useState(null);

  const [selecionado, setSelecionado] = useState(null);
  const [vizinhos, setVizinhos] = useState([]);
  const [raio, setRaio] = useState(null);
  const [modoRota, setModoRota] = useState(false);
  const [rota, setRota] = useState(null);
  const [mostrarGrafo, setMostrarGrafo] = useState(true);
  const [foco, setFoco] = useState(null);
  const [ajuste, setAjuste] = useState(0);
  const [ocupado, setOcupado] = useState(false);

  const inputRef = useRef(null);
  const topoRef = useRef(null);
  const sheetRef = useRef(null);
  // Altura (px) que os overlays ocupam no topo e no rodapé do mapa — o
  // canvas usa isso pra enquadrar o conteúdo na área realmente visível.
  const margens = useCallback(() => ({
    topo: (topoRef.current?.getBoundingClientRect().bottom ?? 180) - (topoRef.current?.parentElement?.getBoundingClientRect().top ?? 0),
    fundo: (sheetRef.current?.offsetHeight ?? 90) + 108,
  }), []);

  // ---- carga do grafo: API primeiro, fallback pro JSON local ---------------
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const [g, h] = await Promise.all([api.getGrafo(), api.getHealth().catch(() => null)]);
        if (!vivo) return;
        setGrafo(g);
        setHealth(h);
        setFonte('api');
        setAjuste((n) => n + 1); // enquadra todos os locais assim que o grafo chega
      } catch {
        // SUBSTITUIR EM PRODUÇÃO: sem backend não há app — aqui o fallback
        // existe só pra demo/desenvolvimento offline.
        const { default: g } = await import('../../../mock-data/grafo.json');
        if (!vivo) return;
        setGrafo(g);
        setFonte('local');
        setAjuste((n) => n + 1);
      }
    })();
    return () => { vivo = false; };
  }, []);

  const opsLocal = useMemo(() => (grafo ? criarOperacoesLocais(grafo) : null), [grafo]);

  // Chama a API; se ela cair no meio da demo, cai pro cálculo local e avisa.
  const chamar = useCallback(async (nome, ...args) => {
    if (fonte === 'api') {
      try {
        return await opsApi[nome](...args);
      } catch {
        setFonte('local');
      }
    }
    return opsLocal ? opsLocal[nome](...args) : [];
  }, [fonte, opsLocal]);

  const porId = useMemo(() => new Map((grafo?.locais || []).map((l) => [l.id, l])), [grafo]);
  const categorias = useMemo(
    () => [...new Set((grafo?.locais || []).map((l) => l.categoria))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [grafo],
  );
  const visiveis = useMemo(() => {
    const s = new Set();
    for (const l of grafo?.locais || []) if (!cat || l.categoria === cat) s.add(l.id);
    if (selecionado != null) s.add(selecionado);
    for (const p of rota?.caminho || []) s.add(p.id);
    return s;
  }, [grafo, cat, selecionado, rota]);

  // ---- busca com debounce --------------------------------------------------
  useEffect(() => {
    if (!grafo) return;
    const q = busca.trim();
    const t = setTimeout(async () => {
      if (!q) { setResultados([]); return; }
      const r = await chamar('buscar', q, cat);
      setResultados(r.slice(0, 8));
    }, 180);
    return () => clearTimeout(t);
  }, [busca, cat, grafo, chamar]);

  // ---- seleção -------------------------------------------------------------
  const selecionar = useCallback(async (id, { voar = true } = {}) => {
    const local = porId.get(id);
    if (!local) return;

    if (modoRota && selecionado != null && id !== selecionado) {
      setOcupado(true);
      const r = await chamar('rota', selecionado, id);
      setOcupado(false);
      setRota({ ...r, deId: selecionado, paraId: id });
      setModoRota(false);
      setRaio(null);
      setBusca('');
      setBuscaFoco(false);
      inputRef.current?.blur();
      setSelecionado(id);
      setVizinhos(await chamar('vizinhos', id));
      return;
    }

    setSelecionado(id);
    setRaio(null);
    setRota(null);
    setModoRota(false);
    setBusca('');
    setBuscaFoco(false);
    inputRef.current?.blur();
    if (voar) setFoco({ lat: local.lat, lon: local.lon, n: Date.now() });
    setVizinhos(await chamar('vizinhos', id));
  }, [porId, modoRota, selecionado, chamar]);

  const limpar = () => {
    setSelecionado(null); setVizinhos([]); setRaio(null); setRota(null); setModoRota(false);
  };

  const aplicarRaio = async (km) => {
    if (selecionado == null) return;
    if (raio?.km === km) { setRaio(null); return; }
    setOcupado(true);
    const itens = await chamar('proximos', selecionado, km, cat);
    setOcupado(false);
    setRaio({ centro: porId.get(selecionado), km, itens, categoria: cat });
  };

  // Ao trocar a categoria com um raio ativo, recalcula.
  useEffect(() => {
    if (!raio || raio.categoria === cat) return;
    (async () => {
      const itens = await chamar('proximos', raio.centro.id, raio.km, cat);
      setRaio((r) => (r ? { ...r, itens, categoria: cat } : r));
    })();
  }, [cat, raio, chamar]);

  const sel = selecionado != null ? porId.get(selecionado) : null;
  const regiaoDe = (l) => l?.regiao || grafo?.regioes.find((r) => r.id === l?.regiaoId)?.nome || '';

  return (
    <ScreenShell overflow="hidden" className={styles.screen}>
      {grafo ? (
        <MapaCanvas
          locais={grafo.locais}
          arestas={grafo.arestas}
          visiveis={visiveis}
          selecionado={selecionado}
          vizinhos={vizinhos}
          rota={rota}
          raio={raio}
          mostrarGrafo={mostrarGrafo}
          foco={foco}
          ajuste={ajuste}
          onSelect={selecionar}
          margens={margens}
        />
      ) : (
        <div className={styles.carregando}>
          <div className={styles.spinner} />
          <span>Carregando o grafo de locais…</span>
        </div>
      )}

      {/* ---- topo: busca + status + categorias ---- */}
      <div className={styles.topo} ref={topoRef}>
        <div className={[styles.searchBar, buscaFoco && busca ? styles.searchBarAberta : ''].join(' ')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value.slice(0, 80))}
            onFocus={() => setBuscaFoco(true)}
            onBlur={() => setTimeout(() => setBuscaFoco(false), 150)}
            placeholder={modoRota ? 'Buscar o destino da rota…' : 'Buscar um local em São Paulo'}
            aria-label="Buscar local"
            autoComplete="off"
            maxLength={80}
          />
          {busca && (
            <button type="button" className={styles.limparBusca} onClick={() => setBusca('')} aria-label="Limpar busca">×</button>
          )}
        </div>

        {buscaFoco && busca.trim() && (
          <ul className={styles.resultados} role="listbox">
            {resultados.length === 0 && <li className={styles.semResultado}>Nenhum local encontrado</li>}
            {resultados.map((l) => (
              <li key={l.id}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => selecionar(l.id)}>
                  <span className={styles.dot} style={{ background: corDe(l.categoria) }} />
                  <span className={styles.resNome}>{l.nome}</span>
                  <span className={styles.resSub}>{l.categoria} · {regiaoDe(l)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.linhaStatus}>
          <span className={[styles.status, fonte === 'api' ? styles.statusOk : styles.statusOff].join(' ')}>
            <span className={styles.statusDot} />
            {fonte === 'api'
              ? `API + ${health?.banco?.split(' ')[0] || 'H2'}`
              : fonte === 'local' ? 'Offline · dados locais' : 'Conectando…'}
          </span>
          {grafo && (
            <span className={styles.contagem}>
              {grafo.locais.length} locais · {grafo.arestas.length} conexões
            </span>
          )}
        </div>

        <div className={styles.chips} role="group" aria-label="Filtrar por categoria">
          <button
            type="button"
            className={[styles.chip, !cat ? styles.chipAtivo : ''].join(' ')}
            onClick={() => setCat(null)}
          >Todos</button>
          {categorias.map((c) => (
            <button
              key={c}
              type="button"
              className={[styles.chip, cat === c ? styles.chipAtivo : ''].join(' ')}
              style={cat === c ? { background: corDe(c), borderColor: corDe(c) } : undefined}
              onClick={() => setCat(cat === c ? null : c)}
            >
              <span aria-hidden="true">{CAT_ICONS[c]}</span> {c}
            </button>
          ))}
        </div>
      </div>

      {/* ---- botões laterais ---- */}
      <div className={styles.lado}>
        <button
          type="button"
          className={[styles.ladoBtn, mostrarGrafo ? styles.ladoBtnAtivo : ''].join(' ')}
          onClick={() => setMostrarGrafo((v) => !v)}
          aria-pressed={mostrarGrafo}
          title="Mostrar/ocultar arestas do grafo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="5" cy="6" r="2.5" /><circle cx="19" cy="6" r="2.5" /><circle cx="12" cy="18" r="2.5" />
            <line x1="7" y1="7" x2="10.5" y2="16" /><line x1="17" y1="7" x2="13.5" y2="16" /><line x1="7.5" y1="6" x2="16.5" y2="6" />
          </svg>
          <span>Grafo</span>
        </button>
        <button type="button" className={styles.ladoBtn} onClick={() => setAjuste((n) => n + 1)} title="Enquadrar todos os locais">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
          <span>Tudo</span>
        </button>
      </div>

      {/* ---- painel inferior ---- */}
      <div className={styles.sheet} ref={sheetRef}>
        {!sel ? (
          <div className={styles.vazio}>
            <div className={styles.vazioIcone}>🗺️</div>
            <div>
              <strong>Grafo de locais de São Paulo</strong>
              <span>
                {grafo
                  ? `${grafo.regioes.length} regiões · ${grafo.locais.length} locais · ${grafo.arestas.length} arestas de proximidade`
                  : 'Carregando…'}
              </span>
              <span>Toque em um pino ou busque um local para ver vizinhos, raio e rota.</span>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.cabec}>
              <span className={styles.icone} style={{ background: corDe(sel.categoria) }} aria-hidden="true">
                {CAT_ICONS[sel.categoria]}
              </span>
              <div className={styles.cabecTexto}>
                <strong>{sel.nome}</strong>
                <span>{sel.categoria} · {regiaoDe(sel)}</span>
              </div>
              <button type="button" className={styles.fechar} onClick={limpar} aria-label="Fechar">×</button>
            </div>

            {rota && (
              <div className={styles.rotaBox}>
                {rota.encontrada ? (
                  <>
                    <div className={styles.rotaTitulo}>
                      <strong>Rota pelo grafo · {fmtKm(rota.distanciaKm)}</strong>
                      <span>{rota.caminho.length - 1} {rota.caminho.length - 1 === 1 ? 'trecho' : 'trechos'} (Dijkstra)</span>
                    </div>
                    <ol className={styles.rotaPassos}>
                      {rota.caminho.map((p, i) => (
                        <li key={p.id}>
                          <span className={styles.dot} style={{ background: corDe(p.categoria) }} />
                          <button type="button" onClick={() => selecionar(p.id)}>{p.nome}</button>
                          {i < rota.arestas.length && <em>{fmtKm(rota.arestas[i].km)}</em>}
                        </li>
                      ))}
                    </ol>
                  </>
                ) : (
                  <div className={styles.rotaTitulo}>
                    <strong>Sem caminho no grafo</strong>
                    <span>
                      {porId.get(rota.deId)?.nome} e {porId.get(rota.paraId)?.nome} estão em componentes
                      desconexos (o grafo tem 5 componentes).
                    </span>
                  </div>
                )}
                <button type="button" className={styles.linkBtn} onClick={() => setRota(null)}>Limpar rota</button>
              </div>
            )}

            {!rota && (
              <div className={styles.secao}>
                <span className={styles.secaoLabel}>Conexões no grafo ({vizinhos.length})</span>
                <div className={styles.vizinhos}>
                  {vizinhos.map((v) => (
                    <button key={v.local.id} type="button" className={styles.vizinho} onClick={() => selecionar(v.local.id)}>
                      <span className={styles.dot} style={{ background: corDe(v.local.categoria) }} />
                      <span className={styles.vizNome}>{v.local.nome}</span>
                      <em>{fmtKm(v.km)}</em>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.acoes}>
              <div className={styles.segmentado} role="group" aria-label="Raio de busca">
                <span className={styles.segLabel}>Perto</span>
                {RAIOS.map((km) => (
                  <button
                    key={km}
                    type="button"
                    className={[styles.segBtn, raio?.km === km ? styles.segBtnAtivo : ''].join(' ')}
                    onClick={() => aplicarRaio(km)}
                    aria-pressed={raio?.km === km}
                  >{km} km</button>
                ))}
              </div>
              <button
                type="button"
                className={[styles.rotaBtn, modoRota ? styles.rotaBtnAtivo : ''].join(' ')}
                onClick={() => { setModoRota((v) => !v); setRaio(null); }}
                aria-pressed={modoRota}
              >
                {modoRota ? 'Escolha o destino…' : 'Traçar rota'}
              </button>
            </div>

            {modoRota && (
              <p className={styles.dica}>Toque em outro pino (ou busque) para calcular o caminho mínimo pelas arestas do grafo.</p>
            )}

            {raio && (
              <div className={styles.secao}>
                <span className={styles.secaoLabel}>
                  {raio.itens.length} {raio.itens.length === 1 ? 'local' : 'locais'} até {raio.km} km
                  {cat ? ` · ${cat}` : ''}
                </span>
                <ul className={styles.lista}>
                  {raio.itens.length === 0 && <li className={styles.semResultado}>Nada nesse raio{cat ? ` na categoria ${cat}` : ''}.</li>}
                  {raio.itens.map((v) => (
                    <li key={v.local.id}>
                      <button type="button" onClick={() => selecionar(v.local.id)}>
                        <span className={styles.dot} style={{ background: corDe(v.local.categoria) }} />
                        <span className={styles.resNome}>{v.local.nome}</span>
                        <span className={styles.resSub}>{v.local.categoria}</span>
                        <em>{fmtKm(v.km)}</em>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button type="button" className={styles.cta} onClick={() => go('descobrir')}>
              Ver rolês por aqui
            </button>
          </>
        )}
        {ocupado && <div className={styles.ocupado} aria-live="polite">Calculando…</div>}
      </div>
    </ScreenShell>
  );
}
