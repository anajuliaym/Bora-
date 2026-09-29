# Bora? — Backend (API)

Spring Boot 3 (Maven, Java 21) + H2. Hoje expõe o **grafo de locais de São Paulo** (ver `../Grafos/`) como API REST, com o banco populado automaticamente na primeira subida.

## Rodar

```bash
./run.sh            # usa o JDK 21 do Homebrew e o Maven wrapper
# ou, com JAVA_HOME já apontando pra um JDK 21:
./mvnw spring-boot:run
```

API em `http://localhost:8080`. Requisitos: JDK 21 (`brew install openjdk@21`). O Maven vem pelo wrapper (`./mvnw`), não precisa instalar.

## Banco de dados

H2 em **arquivo** (`backend/data/bora.mv.db`, ignorado no git). Na primeira subida o `GrafoSeeder` lê `src/main/resources/data/grafo.json` e cria:

| Tabela   | Linhas | Conteúdo                                                      |
| -------- | ------ | ------------------------------------------------------------- |
| `regiao` | 10     | vértices de região (ids 0–9 do `grafo.txt`)                   |
| `local`  | 70     | locais reais com nome, categoria, região, lat/lon (ids 10–79) |
| `aresta` | 133    | arestas de proximidade (não orientadas, peso em km)           |

As 70 arestas região→local (peso 0) do `grafo.txt` viraram a coluna `local.regiao_id`.

**Console web do banco:** http://localhost:8080/h2-console
JDBC URL `jdbc:h2:file:./data/bora` · usuário `sa` · senha em branco. Exemplos:

```sql
SELECT * FROM LOCAL WHERE CATEGORIA = 'Bar';
SELECT l.NOME, r.NOME AS REGIAO FROM LOCAL l JOIN REGIAO r ON r.ID = l.REGIAO_ID;
SELECT COUNT(*) FROM ARESTA;
```

Pra resetar o banco: apague `backend/data/` e suba de novo (o seed roda outra vez).

`SUBSTITUIR EM PRODUÇÃO`: trocar H2 por Postgres/MySQL — só `application.properties` + driver no `pom.xml`, as entidades JPA não mudam.

## Endpoints

| Método/rota                                          | O que faz                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| `GET /api/health`                                    | status da API + nome/versão do banco + `COUNT(*)` das 3 tabelas           |
| `GET /api/grafo`                                     | grafo completo: regiões, locais (com lat/lon) e arestas                   |
| `GET /api/locais?q=sesc&categoria=Cultura`           | busca por nome (contém, sem case) e/ou categoria                          |
| `GET /api/locais/categorias`                         | categorias distintas                                                      |
| `GET /api/locais/{id}`                               | um local (404 se não existe)                                              |
| `GET /api/locais/{id}/vizinhos`                      | vizinhos diretos no grafo, com o peso da aresta                           |
| `GET /api/locais/{id}/proximos?raio=3&categoria=Bar` | locais num raio (Haversine, 0.1–50 km), filtro opcional por categoria     |
| `GET /api/rota?de=12&para=26`                        | caminho mínimo pelas arestas (Dijkstra); `encontrada=false` se desconexo |

Parâmetro inválido devolve `400` com `{ "erro": "Parâmetro inválido", ... }`.

```bash
curl 'localhost:8080/api/locais?q=sesc'
curl 'localhost:8080/api/locais/27/proximos?raio=3&categoria=Bar'
curl 'localhost:8080/api/rota?de=12&para=26'
```

## Estrutura

```
backend/
├── pom.xml, mvnw, run.sh
└── src/main/
    ├── java/br/com/bora/
    │   ├── BoraApplication.java
    │   ├── config/
    │   │   ├── GrafoSeeder.java         popula o banco a partir de data/grafo.json
    │   │   ├── WebConfig.java           CORS pros origins locais (dev)
    │   │   └── ApiExceptionHandler.java parâmetros inválidos → 400
    │   └── locais/
    │       ├── model/       Regiao, Local, Aresta (entidades JPA)
    │       ├── repository/  Spring Data JPA
    │       ├── service/     GrafoService (busca, vizinhos, raio, Dijkstra)
    │       ├── controller/  LocalController (/api/...), HealthController
    │       └── dto/         records de resposta
    └── resources/
        ├── application.properties
        └── data/grafo.json, grafo.txt
```

## Próximos domínios

Auth/Perfil, Feed, Rolês/Eventos, Desafios, Ranking, Chat, Álbuns, Upload de mídia — mesmo padrão de pacote (`br.com.bora.<dominio>.{model,repository,service,controller,dto}`). Os rolês devem virar atributo dos locais (próxima etapa prevista no README do grafo).
