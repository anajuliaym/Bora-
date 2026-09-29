package br.com.bora.config;

import br.com.bora.locais.model.Aresta;
import br.com.bora.locais.model.Local;
import br.com.bora.locais.model.Regiao;
import br.com.bora.locais.repository.ArestaRepository;
import br.com.bora.locais.repository.LocalRepository;
import br.com.bora.locais.repository.RegiaoRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Popula o banco na primeira subida a partir de resources/data/grafo.json
 * (gerado do grafo.txt + coordenadas do KMZ em Grafos/). Se as tabelas já
 * têm dados (banco H2 em arquivo), não faz nada.
 */
@Component
public class GrafoSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(GrafoSeeder.class);

    private final RegiaoRepository regioes;
    private final LocalRepository locais;
    private final ArestaRepository arestas;
    private final ObjectMapper mapper;

    public GrafoSeeder(RegiaoRepository regioes, LocalRepository locais, ArestaRepository arestas, ObjectMapper mapper) {
        this.regioes = regioes;
        this.locais = locais;
        this.arestas = arestas;
        this.mapper = mapper;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (locais.count() > 0) {
            log.info("Banco já populado: {} regiões, {} locais, {} arestas", regioes.count(), locais.count(), arestas.count());
            return;
        }
        try (InputStream in = new ClassPathResource("data/grafo.json").getInputStream()) {
            JsonNode root = mapper.readTree(in);

            Map<Long, Regiao> porId = new HashMap<>();
            for (JsonNode r : root.get("regioes")) {
                Regiao reg = regioes.save(new Regiao(r.get("id").asLong(), r.get("nome").asText()));
                porId.put(reg.getId(), reg);
            }
            for (JsonNode l : root.get("locais")) {
                locais.save(new Local(
                    l.get("id").asLong(),
                    l.get("nome").asText(),
                    l.get("categoria").asText(),
                    porId.get(l.get("regiaoId").asLong()),
                    l.get("lat").asDouble(),
                    l.get("lon").asDouble()
                ));
            }
            for (JsonNode a : root.get("arestas")) {
                arestas.save(new Aresta(a.get("de").asLong(), a.get("para").asLong(), a.get("km").asDouble()));
            }
        }
        log.info("Seed concluído: {} regiões, {} locais, {} arestas", regioes.count(), locais.count(), arestas.count());
    }
}
