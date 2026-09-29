package br.com.bora.locais.dto;

import br.com.bora.locais.model.Aresta;

public record ArestaDTO(Long de, Long para, double km) {
    public static ArestaDTO de(Aresta a) {
        return new ArestaDTO(a.getDe(), a.getPara(), a.getKm());
    }
}
