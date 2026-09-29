import { useEffect, useRef, useState } from 'react';
import { corDe } from './categorias.js';
import './mapa-leaflet.css';

const SP_CENTRO = [-23.575, -46.64];
const ACCENT = 'rgb(255, 0, 127)';
const PRIMARY = 'rgb(51, 132, 170)';
const EDGE = 'rgb(120, 134, 150)';

// Tooltip com DOM montado à mão (textContent) — nunca string HTML, mesmo o
// nome vindo do nosso banco (OWASP A03).
function tooltipNode(local, km) {
  const el = document.createElement('div');
  el.className = 'bora-tip';
  const nome = document.createElement('strong');
  nome.textContent = local.nome;
  el.appendChild(nome);
  const sub = document.createElement('span');
  sub.textContent = km != null ? `${local.categoria} · ${km.toFixed(2)} km` : local.categoria;
  el.appendChild(sub);
  return el;
}

/**
 * Mapa Leaflet "burro": recebe o grafo e o estado da tela e só desenha.
 * O Leaflet é carregado sob demanda (import dinâmico) — só quem abre a
 * aba Mapa paga o download.
 */
export default function MapaCanvas({
  locais, arestas, visiveis, selecionado, vizinhos, rota, raio, mostrarGrafo, foco, ajuste, onSelect, margens,
}) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const Lref = useRef(null);
  const panesRef = useRef(null);
  const onSelectRef = useRef(onSelect);
  const margensRef = useRef(margens);
  const [pronto, setPronto] = useState(false);
  onSelectRef.current = onSelect;
  margensRef.current = margens;

  // Enquadra `bounds` na área livre entre o topo (busca/chips) e o painel
  // inferior. Espera um frame porque o painel cresce depois do setState.
  const enquadrar = (map, bounds, maxZoom) => {
    requestAnimationFrame(() => {
      const { topo, fundo } = margensRef.current?.() || { topo: 180, fundo: 200 };
      map.flyToBounds(bounds, {
        paddingTopLeft: [30, topo + 20], paddingBottomRight: [30, fundo + 20], duration: 0.8, maxZoom,
      });
    });
  };

  // ---- criação do mapa -----------------------------------------------------
  useEffect(() => {
    let cancelado = false;
    (async () => {
      const [{ default: L }] = await Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')]);
      if (cancelado || !elRef.current || mapRef.current) return;

      const map = L.map(elRef.current, {
        zoomControl: false,
        minZoom: 11,
        maxZoom: 18,
        zoomSnap: 0.5,
      });
      map.attributionControl.setPrefix(false);
      // Tiles do OpenStreetMap (sem chave; exige atribuição — abaixo).
      // O domínio precisa estar no img-src da CSP (index.html).
      // SUBSTITUIR EM PRODUÇÃO: provedor com SLA/chave (MapTiler, Stadia, Mapbox…);
      // o tile.openstreetmap.org é mantido por voluntários e não é pra tráfego de app.
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      }).addTo(map);
      map.setView(SP_CENTRO, 12);

      // Panes separados garantem a ordem: arestas < raio < pinos < rota.
      map.createPane('arestas').style.zIndex = 401;
      map.createPane('raio').style.zIndex = 402;
      map.createPane('pinos').style.zIndex = 410;
      map.createPane('rota').style.zIndex = 420;

      panesRef.current = {
        arestas: L.layerGroup().addTo(map),
        raio: L.layerGroup().addTo(map),
        pinos: L.layerGroup().addTo(map),
        rota: L.layerGroup().addTo(map),
      };
      Lref.current = L;
      mapRef.current = map;
      setPronto(true);
      // O ScreenShell anima a entrada (transform) — recalcula o tamanho depois.
      setTimeout(() => map.invalidateSize(), 500);
    })();
    return () => {
      cancelado = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setPronto(false);
      }
    };
  }, []);

  // ---- pinos ---------------------------------------------------------------
  useEffect(() => {
    const L = Lref.current, g = panesRef.current?.pinos;
    if (!pronto || !L || !g) return;
    g.clearLayers();
    const vizIds = new Set((vizinhos || []).map((v) => v.local.id));
    const raioIds = raio ? new Set(raio.itens.map((v) => v.local.id)) : null;
    const temFoco = selecionado != null;

    for (const l of locais) {
      if (!visiveis.has(l.id)) continue;
      const ehSel = l.id === selecionado;
      const ehViz = vizIds.has(l.id);
      const noRaio = raioIds ? raioIds.has(l.id) : false;
      const relacionado = ehSel || ehViz || noRaio;
      const cor = corDe(l.categoria);

      const m = L.circleMarker([l.lat, l.lon], {
        pane: 'pinos',
        radius: ehSel ? 11 : ehViz || noRaio ? 8 : 6.5,
        color: ehSel ? ACCENT : '#fff',
        weight: ehSel ? 4 : 2,
        fillColor: cor,
        fillOpacity: !temFoco || relacionado ? 0.95 : 0.35,
        opacity: !temFoco || relacionado ? 1 : 0.5,
      });
      const km = ehViz ? vizinhos.find((v) => v.local.id === l.id)?.km
        : noRaio ? raio.itens.find((v) => v.local.id === l.id)?.km : null;
      m.bindTooltip(tooltipNode(l, km), {
        direction: 'top', offset: [0, -8], opacity: 1, permanent: ehSel, className: 'bora-tip-wrap',
      });
      m.on('click', () => onSelectRef.current?.(l.id));
      m.addTo(g);
    }
  }, [pronto, locais, visiveis, selecionado, vizinhos, raio]);

  // ---- arestas -------------------------------------------------------------
  useEffect(() => {
    const L = Lref.current, g = panesRef.current?.arestas;
    if (!pronto || !L || !g) return;
    g.clearLayers();
    const porId = new Map(locais.map((l) => [l.id, l]));
    // Com uma rota traçada, as arestas dos vizinhos ficam neutras pra não
    // competir com a linha da rota (mesma cor de destaque).
    const temRota = !!rota?.encontrada;
    for (const a of arestas) {
      const u = porId.get(a.de), v = porId.get(a.para);
      if (!u || !v || !visiveis.has(u.id) || !visiveis.has(v.id)) continue;
      const daSelecao = !temRota && selecionado != null && (a.de === selecionado || a.para === selecionado);
      if (!mostrarGrafo && !daSelecao) continue;
      L.polyline([[u.lat, u.lon], [v.lat, v.lon]], {
        pane: 'arestas',
        color: daSelecao ? ACCENT : EDGE,
        weight: daSelecao ? 3.5 : 1.5,
        opacity: daSelecao ? 0.95 : selecionado != null ? 0.25 : 0.55,
        interactive: false,
      }).addTo(g);
    }
  }, [pronto, locais, arestas, visiveis, selecionado, mostrarGrafo, rota]);

  // ---- raio de proximidade -------------------------------------------------
  useEffect(() => {
    const L = Lref.current, g = panesRef.current?.raio, map = mapRef.current;
    if (!pronto || !L || !g) return;
    g.clearLayers();
    if (!raio) return;
    const c = L.circle([raio.centro.lat, raio.centro.lon], {
      pane: 'raio',
      radius: raio.km * 1000,
      color: PRIMARY,
      weight: 1.5,
      dashArray: '6 6',
      fillColor: PRIMARY,
      fillOpacity: 0.07,
      interactive: false,
    }).addTo(g);
    enquadrar(map, c.getBounds(), 16);
  }, [pronto, raio]);

  // ---- rota (Dijkstra) -----------------------------------------------------
  useEffect(() => {
    const L = Lref.current, g = panesRef.current?.rota, map = mapRef.current;
    if (!pronto || !L || !g) return;
    g.clearLayers();
    if (!rota?.encontrada) return;
    const pts = rota.caminho.map((p) => [p.lat, p.lon]);
    L.polyline(pts, { pane: 'rota', color: '#fff', weight: 9, opacity: 0.9, interactive: false }).addTo(g);
    const linha = L.polyline(pts, {
      pane: 'rota', color: ACCENT, weight: 5, opacity: 1, lineJoin: 'round', interactive: false,
    }).addTo(g);
    rota.caminho.forEach((p, i) => {
      L.circleMarker([p.lat, p.lon], {
        pane: 'rota', radius: i === 0 || i === pts.length - 1 ? 7 : 4,
        color: '#fff', weight: 2, fillColor: ACCENT, fillOpacity: 1, interactive: false,
      }).addTo(g);
    });
    enquadrar(map, linha.getBounds(), 16);
  }, [pronto, rota]);

  // ---- foco (voar até um local) -------------------------------------------
  useEffect(() => {
    const map = mapRef.current;
    if (!pronto || !map || !foco) return;
    // Centraliza o pino na área livre (o painel inferior cobre mais que o topo).
    requestAnimationFrame(() => {
      const { topo, fundo } = margensRef.current?.() || { topo: 180, fundo: 200 };
      const zoom = Math.max(map.getZoom(), 15);
      const pt = map.project([foco.lat, foco.lon], zoom).add([0, (fundo - topo) / 2]);
      map.flyTo(map.unproject(pt, zoom), zoom, { duration: 0.7 });
    });
  }, [pronto, foco]);

  // ---- enquadrar todos os visíveis ----------------------------------------
  useEffect(() => {
    const L = Lref.current, map = mapRef.current;
    if (!pronto || !L || !map || !ajuste) return;
    const pts = locais.filter((l) => visiveis.has(l.id)).map((l) => [l.lat, l.lon]);
    if (pts.length) enquadrar(map, L.latLngBounds(pts), 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pronto, ajuste]);

  return <div ref={elRef} className="bora-mapa" aria-label="Mapa de locais de São Paulo" />;
}
