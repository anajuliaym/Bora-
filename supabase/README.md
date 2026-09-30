# Bora? — Supabase (login, senha e fotos)

O Supabase guarda **contas** (email + senha, via Supabase Auth), o **perfil** de cada pessoa (`perfis`) e as **fotos postadas** (arquivo no Storage + linha em `fotos`). O grafo de locais continua na API Spring Boot + H2.

| Tela      | Com Supabase configurado                                                                 | Sem configurar                          |
| --------- | ---------------------------------------------------------------------------------------- | --------------------------------------- |
| Cadastro  | `auth.signUp` com nome e @usuario; trigger cria a linha em `perfis`                      | navega pro feed (protótipo)             |
| Login     | `auth.signInWithPassword`; erros traduzidos (senha errada, email não confirmado…)        | navega pro feed (protótipo)             |
| Câmera    | "Postar" sobe a foto pro bucket `fotos/<user_id>/<timestamp>.jpg` e insere em `fotos`   | post fica só em memória                 |
| Feed      | lista `feed_fotos` (fotos + quem postou) acima dos posts mockados                        | só posts mockados                       |
| Perfil    | mostra o nome e @usuario da conta                                                        | `@thiago_rolê` (mock)                   |
