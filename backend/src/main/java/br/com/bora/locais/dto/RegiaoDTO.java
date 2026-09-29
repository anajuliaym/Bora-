package br.com.bora.locais.dto;

import br.com.bora.locais.model.Regiao;

public record RegiaoDTO(Long id, String nome, long totalLocais) {
    public static RegiaoDTO de(Regiao r, long totalLocais) {
        return new RegiaoDTO(r.getId(), r.getNome(), totalLocais);
    }
}
