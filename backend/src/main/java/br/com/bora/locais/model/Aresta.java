package br.com.bora.locais.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Aresta de proximidade (não orientada, peso = distância de Haversine em km).
 * As arestas região→local (peso 0) do grafo.txt viram a coluna regiao_id em Local.
 */
@Entity
@Table(name = "aresta", uniqueConstraints = @UniqueConstraint(columnNames = {"de_id", "para_id"}))
public class Aresta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "de_id", nullable = false)
    private Long de;

    @Column(name = "para_id", nullable = false)
    private Long para;

    @Column(nullable = false)
    private double km;

    protected Aresta() {}

    public Aresta(Long de, Long para, double km) {
        this.de = de;
        this.para = para;
        this.km = km;
    }

    public Long getId() { return id; }
    public Long getDe() { return de; }
    public Long getPara() { return para; }
    public double getKm() { return km; }
}
