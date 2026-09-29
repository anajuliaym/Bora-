package br.com.bora.locais.controller;

import br.com.bora.locais.dto.GrafoDTO;
import br.com.bora.locais.dto.LocalDTO;
import br.com.bora.locais.dto.RotaDTO;
import br.com.bora.locais.dto.VizinhoDTO;
import br.com.bora.locais.service.GrafoService;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * API do grafo de locais.
 *
 *   GET /api/grafo                          grafo completo (regiões, locais, arestas)
 *   GET /api/locais?q=sesc&categoria=Cultura   busca por nome e/ou categoria
 *   GET /api/locais/categorias              categorias distintas
 *   GET /api/locais/{id}                    um local
 *   GET /api/locais/{id}/vizinhos           vizinhos diretos no grafo
 *   GET /api/locais/{id}/proximos?raio=1&categoria=Bar   locais num raio (1, 3, 5 km)
 *   GET /api/rota?de=10&para=27             caminho mínimo (Dijkstra)
 */
@RestController
@RequestMapping("/api")
@Validated
public class LocalController {

    private final GrafoService grafo;

    public LocalController(GrafoService grafo) {
        this.grafo = grafo;
    }

    @GetMapping("/grafo")
    public GrafoDTO grafo() {
        return grafo.grafo();
    }

    @GetMapping("/locais")
    public List<LocalDTO> buscar(
        @RequestParam(required = false) @Size(max = 80) String q,
        @RequestParam(required = false) @Size(max = 40) String categoria
    ) {
        return grafo.buscar(q, categoria);
    }

    @GetMapping("/locais/categorias")
    public List<String> categorias() {
        return grafo.categorias();
    }

    @GetMapping("/locais/{id}")
    public ResponseEntity<LocalDTO> porId(@PathVariable Long id) {
        return grafo.porId(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/locais/{id}/vizinhos")
    public List<VizinhoDTO> vizinhos(@PathVariable Long id) {
        return grafo.vizinhos(id);
    }

    @GetMapping("/locais/{id}/proximos")
    public List<VizinhoDTO> proximos(
        @PathVariable Long id,
        @RequestParam(defaultValue = "1") @DecimalMin("0.1") @DecimalMax("50") double raio,
        @RequestParam(required = false) @Size(max = 40) String categoria
    ) {
        return grafo.proximos(id, raio, categoria);
    }

    @GetMapping("/rota")
    public RotaDTO rota(@RequestParam Long de, @RequestParam Long para) {
        return grafo.rota(de, para);
    }
}
