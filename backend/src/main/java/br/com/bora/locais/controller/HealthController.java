package br.com.bora.locais.controller;

import br.com.bora.locais.repository.ArestaRepository;
import br.com.bora.locais.repository.LocalRepository;
import br.com.bora.locais.repository.RegiaoRepository;
import java.time.Instant;
import java.util.Map;
import javax.sql.DataSource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** GET /api/health — prova de vida da API e do banco (contagens vêm de SELECT COUNT(*) reais). */
@RestController
public class HealthController {

    private final Instant inicio = Instant.now();
    private final LocalRepository locais;
    private final ArestaRepository arestas;
    private final RegiaoRepository regioes;
    private final DataSource dataSource;

    public HealthController(LocalRepository locais, ArestaRepository arestas, RegiaoRepository regioes, DataSource dataSource) {
        this.locais = locais;
        this.arestas = arestas;
        this.regioes = regioes;
        this.dataSource = dataSource;
    }

    @GetMapping("/api/health")
    public Map<String, Object> health() {
        String banco = "desconhecido";
        try (var con = dataSource.getConnection()) {
            var md = con.getMetaData();
            banco = md.getDatabaseProductName() + " " + md.getDatabaseProductVersion();
        } catch (Exception e) {
            banco = "erro: " + e.getMessage();
        }
        return Map.of(
            "status", "ok",
            "banco", banco,
            "regioes", regioes.count(),
            "locais", locais.count(),
            "arestas", arestas.count(),
            "desde", inicio.toString()
        );
    }
}
