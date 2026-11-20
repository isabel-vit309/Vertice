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

O front consome o backend `../backend-PI-main` (contrato em `../backend-PI-main/docs/INTEGRACAO.md`).

1. Suba o backend (PostgreSQL + `VERTICE_ENCRYPTION_KEY`, ver guia do backend) em `http://localhost:8080`.
2. Opcional: copie `.env.example` para `.env` e ajuste `VITE_API_URL` se o backend estiver em outra URL.
3. `npm run dev` na porta **5173** (origem liberada por padrão no CORS do backend).

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
