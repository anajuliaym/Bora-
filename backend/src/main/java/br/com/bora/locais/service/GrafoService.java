package br.com.bora.locais.service;

import br.com.bora.locais.dto.ArestaDTO;
import br.com.bora.locais.dto.GrafoDTO;
import br.com.bora.locais.dto.LocalDTO;
import br.com.bora.locais.dto.RegiaoDTO;
import br.com.bora.locais.dto.RotaDTO;
import br.com.bora.locais.dto.VizinhoDTO;
import br.com.bora.locais.model.Aresta;
import br.com.bora.locais.model.Local;
import br.com.bora.locais.repository.ArestaRepository;
import br.com.bora.locais.repository.LocalRepository;
import br.com.bora.locais.repository.RegiaoRepository;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.PriorityQueue;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Operações sobre o grafo de locais (tipo 2: não orientado, com peso).
 * O grafo vive no banco (tabelas local/aresta); aqui ele é montado como
 * lista de adjacência a cada chamada — são 70 vértices e 133 arestas,
 * então o custo é desprezível.
 */
@Service
@Transactional(readOnly = true)
public class GrafoService {

    private static final double RAIO_TERRA_KM = 6371.0;

    private final LocalRepository locais;
    private final ArestaRepository arestas;
    private final RegiaoRepository regioes;

    public GrafoService(LocalRepository locais, ArestaRepository arestas, RegiaoRepository regioes) {
        this.locais = locais;
        this.arestas = arestas;
        this.regioes = regioes;
    }

    public GrafoDTO grafo() {
        List<Local> todos = locais.findAllByOrderByNomeAsc();
        Map<Long, Long> porRegiao = todos.stream()
            .collect(Collectors.groupingBy(l -> l.getRegiao().getId(), Collectors.counting()));
        return new GrafoDTO(
            2,
            regioes.findAll().stream()
                .sorted(Comparator.comparing(r -> r.getId()))
                .map(r -> RegiaoDTO.de(r, porRegiao.getOrDefault(r.getId(), 0L)))
                .toList(),
            todos.stream().map(LocalDTO::de).toList(),
            arestas.findAll().stream().map(ArestaDTO::de).toList()
        );
    }

    public List<LocalDTO> buscar(String q, String categoria) {
        boolean temQ = q != null && !q.isBlank();
        boolean temCat = categoria != null && !categoria.isBlank();
        List<Local> res;
        if (temQ && temCat) {
            res = locais.findByNomeContainingIgnoreCaseAndCategoriaIgnoreCaseOrderByNomeAsc(q.trim(), categoria.trim());
        } else if (temQ) {
            res = locais.findByNomeContainingIgnoreCaseOrderByNomeAsc(q.trim());
        } else if (temCat) {
            res = locais.findByCategoriaIgnoreCaseOrderByNomeAsc(categoria.trim());
        } else {
            res = locais.findAllByOrderByNomeAsc();
        }
        return res.stream().map(LocalDTO::de).toList();
    }

    public Optional<LocalDTO> porId(Long id) {
        return locais.findById(id).map(LocalDTO::de);
    }

    public List<String> categorias() {
        return locais.findAll().stream().map(Local::getCategoria).distinct().sorted().toList();
    }

    /** Vizinhos diretos no grafo (arestas de proximidade), ordenados por distância. */
    public List<VizinhoDTO> vizinhos(Long id) {
        Map<Long, Local> porId = indice();
        return arestas.findByDeOrPara(id, id).stream()
            .map(a -> {
                Long outro = a.getDe().equals(id) ? a.getPara() : a.getDe();
                Local l = porId.get(outro);
                return l == null ? null : new VizinhoDTO(LocalDTO.de(l), a.getKm());
            })
            .filter(v -> v != null)
            .sorted(Comparator.comparingDouble(VizinhoDTO::km))
            .toList();
    }

    /**
     * Locais a até `raioKm` do local de origem (distância de Haversine em linha
     * reta, independente das arestas), com filtro opcional por categoria.
     */
    public List<VizinhoDTO> proximos(Long id, double raioKm, String categoria) {
        Local origem = locais.findById(id).orElse(null);
        if (origem == null) return List.of();
        return locais.findAll().stream()
            .filter(l -> !l.getId().equals(id))
            .filter(l -> categoria == null || categoria.isBlank() || l.getCategoria().equalsIgnoreCase(categoria.trim()))
            .map(l -> new VizinhoDTO(LocalDTO.de(l), haversine(origem, l)))
            .filter(v -> v.km() <= raioKm)
            .sorted(Comparator.comparingDouble(VizinhoDTO::km))
            .toList();
    }

    /** Caminho mínimo entre dois locais pelas arestas do grafo (Dijkstra). */
    public RotaDTO rota(Long de, Long para) {
        Map<Long, Local> porId = indice();
        if (!porId.containsKey(de) || !porId.containsKey(para)) {
            return new RotaDTO(false, 0, List.of(), List.of());
        }
        Map<Long, List<Aresta>> adj = new HashMap<>();
        for (Aresta a : arestas.findAll()) {
            adj.computeIfAbsent(a.getDe(), k -> new ArrayList<>()).add(a);
            adj.computeIfAbsent(a.getPara(), k -> new ArrayList<>()).add(a);
        }

        Map<Long, Double> dist = new HashMap<>();
        Map<Long, Aresta> anterior = new HashMap<>();
        PriorityQueue<long[]> fila = new PriorityQueue<>(Comparator.comparingDouble(x -> Double.longBitsToDouble(x[1])));
        dist.put(de, 0.0);
        fila.add(new long[] { de, Double.doubleToLongBits(0.0) });

        while (!fila.isEmpty()) {
            long[] atual = fila.poll();
            Long u = atual[0];
            double du = Double.longBitsToDouble(atual[1]);
            if (du > dist.getOrDefault(u, Double.MAX_VALUE)) continue;
            if (u.equals(para)) break;
            for (Aresta a : adj.getOrDefault(u, List.of())) {
                Long v = a.getDe().equals(u) ? a.getPara() : a.getDe();
                double nd = du + a.getKm();
                if (nd < dist.getOrDefault(v, Double.MAX_VALUE)) {
                    dist.put(v, nd);
                    anterior.put(v, a);
                    fila.add(new long[] { v, Double.doubleToLongBits(nd) });
                }
            }
        }

        if (!dist.containsKey(para)) {
            // Grafo desconexo (5 componentes hoje): não existe caminho entre as regiões.
            return new RotaDTO(false, 0, List.of(), List.of());
        }

        List<LocalDTO> caminho = new ArrayList<>();
        List<ArestaDTO> usadas = new ArrayList<>();
        Long cur = para;
        while (!cur.equals(de)) {
            caminho.add(LocalDTO.de(porId.get(cur)));
            Aresta a = anterior.get(cur);
            usadas.add(ArestaDTO.de(a));
            cur = a.getDe().equals(cur) ? a.getPara() : a.getDe();
        }
        caminho.add(LocalDTO.de(porId.get(de)));
        Collections.reverse(caminho);
        Collections.reverse(usadas);
        return new RotaDTO(true, Math.round(dist.get(para) * 100.0) / 100.0, caminho, usadas);
    }

    private Map<Long, Local> indice() {
        return locais.findAll().stream().collect(Collectors.toMap(Local::getId, Function.identity()));
    }

    static double haversine(Local a, Local b) {
        double lat1 = Math.toRadians(a.getLat()), lon1 = Math.toRadians(a.getLon());
        double lat2 = Math.toRadians(b.getLat()), lon2 = Math.toRadians(b.getLon());
        double dlat = lat2 - lat1, dlon = lon2 - lon1;
        double h = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
        double d = 2 * RAIO_TERRA_KM * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
        return Math.round(d * 100.0) / 100.0;
    }
}
