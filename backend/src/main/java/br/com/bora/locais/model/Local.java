package br.com.bora.locais.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Vértice de local real (parque, museu, bar...) — ids 10..79 do grafo.txt.
 * O id é o mesmo índice usado no grafo, por isso não é gerado pelo banco.
 */
@Entity
@Table(name = "local", indexes = {
    @Index(name = "idx_local_categoria", columnList = "categoria"),
    @Index(name = "idx_local_nome", columnList = "nome")
})
public class Local {

    @Id
    private Long id;

    @Column(nullable = false, length = 160)
    private String nome;

    @Column(nullable = false, length = 40)
    private String categoria;

    @ManyToOne(optional = false)
    @JoinColumn(name = "regiao_id")
    private Regiao regiao;

    @Column(nullable = false)
    private double lat;

    @Column(nullable = false)
    private double lon;

    protected Local() {}

    public Local(Long id, String nome, String categoria, Regiao regiao, double lat, double lon) {
        this.id = id;
        this.nome = nome;
        this.categoria = categoria;
        this.regiao = regiao;
        this.lat = lat;
        this.lon = lon;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getCategoria() { return categoria; }
    public Regiao getRegiao() { return regiao; }
    public double getLat() { return lat; }
    public double getLon() { return lon; }
}
