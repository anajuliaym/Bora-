package br.com.bora.locais.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Vértice de região (camada do mapa) — ids 0..9 do grafo.txt. */
@Entity
@Table(name = "regiao")
public class Regiao {

    @Id
    private Long id;

    private String nome;

    protected Regiao() {}

    public Regiao(Long id, String nome) {
        this.id = id;
        this.nome = nome;
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
}
