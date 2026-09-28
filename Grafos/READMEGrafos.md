# Bora?: Grafo de Locais de Interesse em São Paulo

## Integrantes

| Nome | RA |
| --- | --- |
| Gabriel Mires Camargo | 10436741 |
| Ana Julia Yaguti Matilha | 10436655 |
| Jiye Huang | 10438990 |

## Problema

O Bora? é um aplicativo que conecta pessoas com interesses em comum para atividades presenciais em São Paulo. Para sugerir locais e roteiros, o projeto modela locais reais de convivência (parques, museus, bares, espaços esportivos, entre outros) como um grafo em que as arestas representam proximidade geográfica.

## Modelagem

- **Tipo do grafo:** 2, não orientado com peso na aresta.
- **Vértices (80):** 10 vértices de região (camadas do mapa) e 70 locais reais, com rótulo no formato `Nome [Categoria]`.
- **Arestas (203):** 70 arestas de pertinência região e local (peso 0) e 133 arestas de proximidade, ligando cada local aos seus 3 vizinhos mais próximos, com peso igual à distância de Haversine em km.
- **Representação:** matriz de adjacência (`double[][]`), com infinito indicando ausência de aresta.

## Estrutura do repositório

```
├── grafo.txt                 grafo modelado (80 vértices, 203 arestas)
├── Grafo de Locais.kmz       dados coletados no Google My Maps
├── docs/                     relatório do projeto
├── src/
│   ├── Main.java             menu de opções (a até j)
│   ├── Grafo.java            matriz de adjacência, operações e conexidade (FCONEX)
│   └── Endereco.java         vértice: nome, rótulo e peso
├── testes/
│   └── direcionado.txt       grafo orientado de teste (C0 a C3 e grafo reduzido)
└── tools/
    └── gerar_grafo.py        gera o grafo.txt a partir do arquivo KMZ
```

## Como executar

Requer Java 17 ou superior. Na raiz do repositório:

```bash
javac -encoding UTF-8 -d out src/*.java
java -cp out Main
```

Para regenerar o `grafo.txt` a partir do KMZ (Python 3, sem dependências externas):

```bash
python tools/gerar_grafo.py
```

## Menu de opções

a) Ler dados do arquivo grafo.txt · b) Gravar dados no arquivo grafo.txt · c) Inserir vértice · d) Inserir aresta · e) Remover vértice · f) Remover aresta · g) Mostrar conteúdo do arquivo · h) Mostrar grafo · i) Apresentar a conexidade do grafo e o reduzido · j) Encerrar a aplicação

## Resultado parcial

O grafo atual é **desconexo, com 5 componentes**: um vértice isolado (camada vazia do mapa) e quatro agrupamentos geográficos (Centro, Ipiranga com Vila Mariana, Moema e zona oeste). A próxima etapa prevê garantir a conexidade, incluir os rolês como atributo e implementar a busca por proximidade (1, 3 e 5 km) com filtro por categoria.

