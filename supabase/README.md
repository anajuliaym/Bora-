# Bora? — Supabase (login, senha e fotos)

O Supabase guarda **contas** (email + senha, via Supabase Auth), o **perfil** de cada pessoa (`perfis`) e as **fotos postadas** (arquivo no Storage + linha em `fotos`). O grafo de locais continua na API Spring Boot + H2.

## Passo a passo (uns 10 minutos)

1. **Criar o projeto** em https://supabase.com/dashboard → *New project*. Nome `bora`, região *South America (São Paulo)*, anote a senha do banco.
2. **Aplicar o schema:** no dashboard, *SQL Editor* → *New query* → colar o conteúdo de [`migrations/0001_auth_e_fotos.sql`](migrations/0001_auth_e_fotos.sql) → *Run*. Isso cria `perfis`, `fotos`, a view `feed_fotos`, o bucket `fotos` e todas as políticas RLS.
3. **Desligar a confirmação de email (só pra demo):** *Authentication* → *Providers* → *Email* → desmarcar **Confirm email** → *Save*. Sem isso, o cadastro exige clicar no link do email antes de entrar.
4. **Copiar as chaves:** *Project Settings* → *API* → `Project URL` e `anon public`.
5. **Configurar o front:** criar `frontend-react/.env.local` (gitignored):

   ```
   VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

6. Reiniciar o `npm run dev`. A tela de login deixa de mostrar "Modo protótipo".

## O que acontece no app

| Tela      | Com Supabase configurado                                                                 | Sem configurar                          |
| --------- | ---------------------------------------------------------------------------------------- | --------------------------------------- |
| Cadastro  | `auth.signUp` com nome e @usuario; trigger cria a linha em `perfis`                      | navega pro feed (protótipo)             |
| Login     | `auth.signInWithPassword`; erros traduzidos (senha errada, email não confirmado…)        | navega pro feed (protótipo)             |
| Câmera    | "Postar" sobe a foto pro bucket `fotos/<user_id>/<timestamp>.jpg` e insere em `fotos`   | post fica só em memória                 |
| Feed      | lista `feed_fotos` (fotos + quem postou) acima dos posts mockados                        | só posts mockados                       |
| Perfil    | mostra o nome e @usuario da conta                                                        | `@thiago_rolê` (mock)                   |

## Onde ver funcionando no dashboard

- *Authentication* → *Users*: cada cadastro aparece aqui (senha com hash, gerenciada pelo Supabase).
- *Table Editor* → `perfis` e `fotos`.
- *Storage* → bucket `fotos` → pasta com o id do usuário → as imagens.

## Segurança (o que o SQL garante)

- RLS ligado em `perfis` e `fotos`: só usuário logado lê; só o dono insere/apaga as próprias fotos e edita o próprio perfil.
- Storage: leitura pública (as fotos aparecem no feed), upload só na pasta do próprio `auth.uid()`, máx. 5 MB, só `image/jpeg|png|webp`.
- No front o token fica só em memória (`src/lib/supabase.js`), nunca em localStorage — recarregar a página pede login de novo; é intencional (OWASP A07).
- A `anon key` é pública por design; a `service_role` **nunca** vai pro front.

## Opcional: mover o grafo pro Postgres do Supabase

O backend Spring Boot aceita as variáveis abaixo pra usar o Postgres do projeto em vez do H2 (o seed roda igual na primeira subida):

```bash
export SPRING_DATASOURCE_URL='jdbc:postgresql://db.xxxxxxxx.supabase.co:5432/postgres?sslmode=require'
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD='senha-do-banco'
export SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
./backend/run.sh
```
