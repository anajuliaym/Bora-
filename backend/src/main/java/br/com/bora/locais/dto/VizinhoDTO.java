package br.com.bora.locais.dto;

/** Local vizinho no grafo, com a distância (peso da aresta ou Haversine) em km. */
public record VizinhoDTO(LocalDTO local, double km) {}
