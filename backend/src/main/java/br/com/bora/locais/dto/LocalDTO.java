package br.com.bora.locais.dto;

import br.com.bora.locais.model.Local;

public record LocalDTO(Long id, String nome, String categoria, Long regiaoId, String regiao, double lat, double lon) {
    public static LocalDTO de(Local l) {
        return new LocalDTO(l.getId(), l.getNome(), l.getCategoria(),
            l.getRegiao().getId(), l.getRegiao().getNome(), l.getLat(), l.getLon());
    }
}
