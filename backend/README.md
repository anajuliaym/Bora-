# Bora? — Backend (esqueleto)

Esqueleto Spring Boot (Maven, Java 21) vazio. Sem stack definida pelo time ainda além de "Java" — este projeto usa Spring Boot como ponto de partida padrão; troque à vontade (framework web, banco, etc).

## Rodar

```
cd backend
./mvnw spring-boot:run
```

API sobe em `http://localhost:8080`. Banco H2 em memória (console em `/h2-console`) só para começar — trocar por Postgres/MySQL antes de produção.

## Domínios do app (a partir do frontend)

Áreas do app que vão precisar de API, para orientar os primeiros recursos/endpoints:

- **Auth/Perfil** — login, dados de perfil (XP, stats, check-ins), perfis de terceiros (somente leitura)
- **Feed** — posts, curtidas, comentários
- **Rolês/Eventos** — listagem, detalhes, agenda, check-in
- **Desafios** — lista, progresso, XP/recompensas
- **Ranking** — leaderboard
- **Chat** — mensagens
- **Álbuns** — CRUD de álbuns por usuário, páginas, fotos, adesivos, textos (capa customizável)
- **Upload de mídia** — fotos tiradas na câmera, upload/armazenamento (hoje otimizadas no client: ~100KB/foto)

Sugestão de pacotes: `br.com.bora.{auth,feed,eventos,desafios,ranking,chat,album,media}`, cada um com `controller/`, `service/`, `repository/`, `model/`/`dto/`.

## Estrutura atual

```
backend/
├── pom.xml
└── src/main/
    ├── java/br/com/bora/BoraApplication.java
    └── resources/application.properties
```
