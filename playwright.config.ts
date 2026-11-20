// Testes ponta a ponta (front + backend + PostgreSQL reais). Uso: npm run test:e2e
// Usa o PostgreSQL local (banco vertice_e2e, recriado a cada execução) — ver e2e/ambiente.mjs.
import { defineConfig, devices } from "@playwright/test";

const API_PORT = 8083;
const WEB_PORT = 5175;

export default defineConfig({
  testDir: "./e2e",
  // Os cenários formam uma jornada (cadastro → aprovação → match → conversa → reunião → avaliação):
  // rodam em sequência, num único worker, sobre o mesmo banco recém-criado.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000, toHaveScreenshot: { maxDiffPixelRatio: 0.02 } },
  reporter: [["list"], ["html", { open: "never", outputFolder: "e2e-relatorio" }]],
  outputDir: "e2e-resultados",
  snapshotPathTemplate: "{testDir}/capturas/{testFilePath}/{arg}-{projectName}{ext}",
  updateSnapshots: "missing",
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    locale: "pt-BR",
    timezoneId: "America/Recife",
    // Animações reduzidas deixam os testes determinísticos; a animação de login tem cenário próprio.
    contextOptions: { reducedMotion: "reduce" },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node e2e/ambiente.mjs backend",
      url: `http://localhost:${API_PORT}/politica-privacidade`,
      timeout: 180_000,
      reuseExistingServer: false,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: `npx vite --port ${WEB_PORT} --strictPort`,
      url: `http://localhost:${WEB_PORT}`,
      timeout: 60_000,
      reuseExistingServer: false,
      env: { VITE_API_URL: `http://localhost:${API_PORT}` },
    },
  ],
});
