# Sistema ABCD Paulista

Projeto completo com frontend, backend e banco de dados.

## 1. Banco de dados
Entre no Supabase > SQL Editor > cole o arquivo `database/banco.sql` > Run.

## 2. Backend no Render
Suba este projeto no GitHub.
No Render, crie um Web Service apontando para a pasta `backend`.

Comandos:
- Build Command: `npm install`
- Start Command: `npm start`

Variáveis de ambiente no Render:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STAFF_PASSWORD`
- `FRONTEND_URL`

## 3. Frontend no GitHub Pages
Na pasta `frontend/js/config.js`, troque:
`COLE_A_URL_DO_RENDER_AQUI`

Pela URL do seu backend Render, exemplo:
`https://abcd-api.onrender.com`

Depois publique a pasta `frontend` no GitHub Pages.

## Observação
A atualização em tempo real pode ser feita de dois jeitos:
1. Atualizar automaticamente consultando a API a cada poucos segundos.
2. Usar Supabase Realtime direto no frontend.

Esta versão já está pronta para funcionar com API. A próxima melhoria é ativar Realtime direto no painel.
