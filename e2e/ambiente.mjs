// Ambiente isolado dos testes ponta a ponta:
//   PostgreSQL local, banco "vertice_e2e" recriado a cada execução  →  backend (porta 8083)  →  front (porta 5175).
// Não toca nos bancos projeto_pi e vertice_simulacao e não conflita com o ambiente de desenvolvimento.
//
// Variáveis opcionais: E2E_PG_HOST (localhost), E2E_PG_PORT (5432), E2E_PG_USER (postgres),
// E2E_PG_PASSWORD (root), E2E_PSQL (caminho do psql; padrão: PATH ou PostgreSQL 18 no Windows).
import { execFileSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const aqui = dirname(fileURLToPath(import.meta.url));
export const BACKEND_DIR = resolve(aqui, "../../backend-PI-main");
export const JAR = join(BACKEND_DIR, "target", "Projeto-PI-0.0.1-SNAPSHOT.jar");
export const API_PORT = 8083;
export const WEB_PORT = 5175;
export const BANCO = "vertice_e2e";
// Chave de criptografia só de teste (a mesma dos testes do backend).
export const CHAVE_TESTE = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const pg = {
  host: process.env.E2E_PG_HOST ?? "localhost",
  port: process.env.E2E_PG_PORT ?? "5432",
  user: process.env.E2E_PG_USER ?? "postgres",
  password: process.env.E2E_PG_PASSWORD ?? "root",
};
const isWin = process.platform === "win32";

function psqlPath() {
  if (process.env.E2E_PSQL) return process.env.E2E_PSQL;
  const windows = "C:\\Program Files\\PostgreSQL\\18\\bin\\psql.exe";
  return isWin && existsSync(windows) ? windows : "psql";
}

function psql(sql) {
  execFileSync(psqlPath(), ["-h", pg.host, "-p", pg.port, "-U", pg.user, "-d", "postgres", "-v", "ON_ERROR_STOP=1", "-q", "-c", sql], {
    stdio: "pipe",
    env: { ...process.env, PGPASSWORD: pg.password },
  });
}

/** Apaga e recria o banco do E2E: cada execução começa sem nenhum dado. */
export function recriarBanco() {
  psql(`DROP DATABASE IF EXISTS ${BANCO} WITH (FORCE)`);
  psql(`CREATE DATABASE ${BANCO}`);
}

/** Compila o backend (sem rodar os testes dele) para o E2E usar o código atual. */
export function compilarBackend() {
  console.log("[e2e] compilando o backend...");
  // Caminho absoluto: o cmd do Windows não procura executáveis na pasta atual.
  execFileSync(join(BACKEND_DIR, isWin ? "mvnw.cmd" : "mvnw"), ["-q", "-DskipTests", "package"], {
    cwd: BACKEND_DIR,
    stdio: "inherit",
    shell: isWin,
  });
}

/** Usado pelo webServer do Playwright: banco novo e backend apontando para ele. */
export function iniciarBackend() {
  if (!existsSync(JAR)) compilarBackend();
  recriarBanco();
  const backend = spawn("java", [
    "-jar", JAR,
    `--server.port=${API_PORT}`,
    `--spring.datasource.url=jdbc:postgresql://${pg.host}:${pg.port}/${BANCO}`,
    `--spring.datasource.username=${pg.user}`,
    `--spring.datasource.password=${pg.password}`,
    "--spring.jpa.show-sql=false",
  ], {
    stdio: "inherit",
    env: {
      ...process.env,
      VERTICE_ENCRYPTION_KEY: CHAVE_TESTE,
      CORS_ALLOWED_ORIGINS: `http://localhost:${WEB_PORT}`,
      VERTICE_IA_HABILITADA: "false",
      VERTICE_IA_POLITICA_MINIMA: "1.0",
    },
  });
  const encerrar = () => {
    backend.kill();
    process.exit(0);
  };
  process.on("SIGINT", encerrar);
  process.on("SIGTERM", encerrar);
  backend.on("exit", (code) => process.exit(code ?? 0));
}

if (process.argv[2] === "backend") iniciarBackend();
if (process.argv[2] === "compilar") compilarBackend();
