# Bora?

 Bora? — plataforma de eventos gamificada (feed social, rolês, agenda, desafios, ranking, chat, perfil e álbum de fotos).

## Estrutura

```
bora-monorepo/
├── frontend-react/  # app em React + Vite (câmera, álbum 3D)
└── backend/         # esqueleto Spring Boot (Java) para a API
```

## Frontend

`frontend-react/` é o app: câmera com filtros, feed, rolês, agenda, desafios, ranking, chat, perfil (próprio e de terceiros) e o álbum 3D (livro com páginas, adesivos, capa customizável).

Hoje ele roda standalone, sem backend — os dados (posts, check-ins, perfis, álbuns) estão mockados em `frontend-react/src/mock-data/mock-data.js`. Para rodar:

```
cd frontend-react
npm install
npm run dev
```

**Próximo passo de integração:** substituir os dados mockados por chamadas HTTP para a API em `backend/` (ver `frontend-react/src/api.js`).

## Backend

`backend/` é um esqueleto Spring Boot (Maven) vazio, pronto para receber a implementação da API. Ver `backend/README.md`.

## Assets

`frontend-react/public/assets/` são imagens e texturas já otimizadas (fotos, adesivos WebP, madeira, texturas do polaroid 3D).
