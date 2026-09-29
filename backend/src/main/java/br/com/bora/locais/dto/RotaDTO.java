package br.com.bora.locais.dto;

import java.util.List;

/** Caminho mínimo (Dijkstra) entre dois locais, seguindo as arestas de proximidade. */
public record RotaDTO(boolean encontrada, double distanciaKm, List<LocalDTO> caminho, List<ArestaDTO> arestas) {}
