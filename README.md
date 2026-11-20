# React + Vite + TypeScript

Base com React, Tailwind CSS, React Icons e React Router.

## Executar

Use Node.js 22 LTS ou superior. Na pasta do projeto:

```bash
npm install
npm run dev
```

Abra a URL exibida pelo Vite no terminal.

## Build

```bash
npm run build
npm run preview
```



## Integração com o backend

O backend é mantido e publicado em um repositório separado. Configure `VITE_API_URL` com a URL base da API; o valor padrão é `http://localhost:8080` para desenvolvimento local.

1. Copie `.env.example` para `.env` e configure `VITE_API_URL` com a URL do backend.
2. Garanta que o backend permita a origem do front nas regras de CORS.
3. Execute `npm run dev` para iniciar o front localmente.

| Tela | Rota | Endpoint |
| --- | --- | --- |
| Login startup / investidor | `/startups/login`, `/investors/login` | `POST /auth/login` |
| Cadastro por etapas (startup) | `/startups/register` → `register-complet/step1..4` | `POST /auth/cadastro/startup` (JSON, ou multipart quando há arquivos) |
| Cadastro por etapas (investidor) | `/investors/register` → `register-complet/step1..3` | `POST /auth/cadastro/investidor` |
| Feed de startups | `/investors/startups` | `GET /startups` (Bearer token) |

Arquivos da integração:

- `src/services/api.ts` — cliente HTTP, tratamento de erros (`{status,message}` ou status HTTP) e normalização de ticket (`R$ 1.000,00` → `1000.00`).
- `src/services/session.ts` — token JWT em `localStorage` e rota inicial por papel.
- `src/services/registrationDraft.tsx` — rascunho do cadastro em memória (credenciais e arquivos não vão para storage; recarregar a página reinicia o fluxo).
- `src/integration/AuthRoutes.tsx` — containers de rota que ligam os callbacks das telas (`onLogin`, `onNext`, `onBack`) à API.

Após o cadastro a conta fica `PENDENTE`; o login só funciona depois da aprovação do admin
(`PUT /admin/usuarios/{id}/aprovar` com token de ADMIN — o painel `/adm` ainda usa dados fixos).
