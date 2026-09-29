# Bora?

Bora? — plataforma de eventos gamificada (feed social, rolês, agenda, desafios, ranking, chat, perfil e álbum de fotos), com um **mapa de locais de São Paulo modelado como grafo**.

## Estrutura

```
projeto_lab_eng_software/
├── frontend-react/   app React + Vite (câmera, álbum 3D, mapa com grafo)
├── backend/          API Spring Boot (Java 21) + banco H2
├── Grafos/           modelagem do grafo (grafo.txt, KMZ, Java do menu de opções)
├── supabase/         schema SQL + guia do projeto Supabase (auth e fotos)
├── Documentation/    diagramas e definição do produto
└── dev.sh            sobe backend + frontend de uma vez
```

## Rodar tudo (demo)

```bash
./dev.sh
```

Isso sobe a API em `http://localhost:8080` (com o banco populado no primeiro start) e depois o front em `http://localhost:5173`. Ou separado:

```bash
# terminal 1 — backend
cd backend && ./run.sh

# terminal 2 — frontend
cd frontend-react && npm install && npm run dev
```

Requisitos: Node 20+, JDK 21 (`brew install openjdk@21`). O Maven vem pelo wrapper (`backend/mvnw`).

## O que está integrado

| Camada       | O que tem hoje                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------ |
| **Frontend** | Aba **Mapa** consome a API: mapa interativo (Leaflet), busca por nome, filtro por categoria, vizinhos no grafo, locais num raio (1/3/5 km), rota pelo grafo (Dijkstra). O resto do app (feed, rolês, ranking…) ainda usa `mock-data/`. |
| **Backend**  | `GET /api/grafo`, `/api/locais?q=&categoria=`, `/api/locais/{id}/vizinhos`, `/api/locais/{id}/proximos?raio=`, `/api/rota?de=&para=`, `/api/health`. Ver `backend/README.md`. |
| **Banco**    | H2 em arquivo (`backend/data/`), tabelas `regiao` (10), `local` (70), `aresta` (133), populadas pelo `GrafoSeeder` a partir do `grafo.txt` + coordenadas do KMZ. Console em `http://localhost:8080/h2-console`. |

Como o front fala com a API: em dev, o Vite faz proxy de `/api` → `:8080` (`vite.config.js`), então a chamada é same-origin e a CSP continua com `connect-src 'self'`. Se a API estiver fora do ar, o mapa cai pro `mock-data/grafo.json` e mostra "Offline · dados locais" no selo de status (`SUBSTITUIR EM PRODUÇÃO`).

## Roteiro sugerido pra apresentação

1. `./dev.sh` — mostrar no terminal o log `Seed concluído: 10 regiões, 70 locais, 133 arestas` (ou `Banco já populado`).
2. Abrir `http://localhost:8080/api/health` — API + nome do banco + contagens reais (`SELECT COUNT(*)`).
3. Abrir `http://localhost:8080/h2-console` (JDBC `jdbc:h2:file:./data/bora`, user `sa`) e rodar `SELECT * FROM LOCAL WHERE CATEGORIA = 'Bar'`.
4. No app, aba **Mapa**: selo verde "API + H2"; buscar "sesc"; tocar num pino → vizinhos com a distância da aresta; "Perto 3 km" com filtro **Bar**; "Traçar rota" entre dois locais da mesma região (ex.: Sesc Ipiranga → Kaskata's Lanches) — e entre regiões diferentes pra mostrar o grafo desconexo (5 componentes, como no relatório de Grafos).
5. Botão "Grafo" (canto inferior direito) liga/desliga as arestas; "Tudo" enquadra os 70 locais.

## Supabase (login, senha e fotos)

Contas (email + senha), perfis e as fotos postadas no feed ficam num projeto Supabase: schema em [`supabase/migrations/0001_auth_e_fotos.sql`](supabase/migrations/0001_auth_e_fotos.sql), passo a passo em [`supabase/README.md`](supabase/README.md). Sem `frontend-react/.env.local` o app roda em "modo protótipo" (login decorativo, fotos só em memória), então nada quebra se o projeto ainda não existir.

## Grafo

`Grafos/` tem o `grafo.txt` (tipo 2: não orientado com peso, 80 vértices, 203 arestas), o KMZ do Google My Maps e o programa Java com o menu de operações. O `grafo.json` usado pelo backend/front foi gerado a partir deles (`backend/src/tools/gerar_grafo.py` gera o `grafo.txt`; as coordenadas vêm do KMZ).

## Assets

`frontend-react/public/assets/` são imagens e texturas já otimizadas (fotos, adesivos WebP, madeira, texturas do polaroid 3D).
