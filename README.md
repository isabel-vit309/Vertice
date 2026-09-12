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

## Estrutura

```text
src/
├── Investors/
│   ├── Pages/index.tsx
│   └── Service/.gitkeep
├── Startups/
│   ├── Pages/index.tsx
│   └── Service/.gitkeep
├── Adm/
│   ├── Pages/index.tsx
│   └── Service/.gitkeep
├── Routes.tsx
├── App.tsx
├── main.tsx
├── index.css
└── vite-env.d.ts
```

Cada pasta Pages contém um único arquivo. As pastas Service estão reservadas
para futuras integrações com APIs; .gitkeep preserva essas pastas no Git.

## Rotas

| URL | Página |
| --- | --- |
| / | Redireciona para /investors |
| /investors | Investidor |
| /startups | Startup |
| /adm | Administração |
| Demais URLs | Página não encontrada |

Todas as rotas ficam em src/Routes.tsx, divididas por perfil com grupos de rotas.
O BrowserRouter e a navegação ficam em src/App.tsx.
Esta base não implementa login nem controle de acesso por perfil.

Em hospedagem estática, configure o servidor para retornar index.html nas
rotas da aplicação, permitindo acessar ou atualizar /investors, /startups e /adm.

Tailwind está configurado pelo plugin oficial do Vite e importado em index.css.

Referências:
- https://tailwindcss.com/docs/installation/using-vite
- https://reactrouter.com/start/declarative/routing
