package br.com.bora.locais.dto;

import java.util.List;

public record GrafoDTO(int tipo, List<RegiaoDTO> regioes, List<LocalDTO> locais, List<ArestaDTO> arestas) {}
