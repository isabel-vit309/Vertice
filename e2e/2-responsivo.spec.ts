import { expect, test, type Page } from "@playwright/test";

import { contas, semRolagemLateral, sessao } from "./apoio";

const telas = [
  { nome: "celular", width: 390, height: 844 },
  { nome: "tablet", width: 768, height: 1024 },
  { nome: "notebook", width: 1280, height: 800 },
];

const paginas = {
  publicas: ["/investors/login", "/startups/login", "/investors/register", "/startups/register", "/adm/login"],
  investidor: ["/investors/perfil", "/investors/startups", "/investors/matching", "/investors/mensagens", "/investors/meetings", "/investors/conections"],
  startup: ["/startups/perfil", "/startups/matching", "/startups/mensagens", "/startups/meetings", "/startups/conections"],
  admin: ["/adm", "/adm/metricas", "/adm/auditoria"],
};

// Telas sem datas/horários variáveis entram na comparação visual.
const comCaptura = new Set(["/investors/login", "/startups/login", "/investors/perfil", "/startups/perfil", "/adm/metricas"]);

async function verificar(page: Page, rota: string, tela: string) {
  await page.goto(rota);
  await page.waitForLoadState("networkidle");
  await semRolagemLateral(page);
  if (comCaptura.has(rota)) {
    await expect(page).toHaveScreenshot(`${rota.replace(/\//g, "_").slice(1)}-${tela}.png`, {
      fullPage: true,
      mask: [page.locator("time")],
    });
  }
}

for (const tela of telas) {
  test.describe(`${tela.nome} (${tela.width}px)`, () => {
    test.use({ viewport: { width: tela.width, height: tela.height } });

    test("páginas públicas", async ({ page }) => {
      for (const rota of paginas.publicas) await verificar(page, rota, tela.nome);
    });

    test("portal do investidor", async ({ page }) => {
      await sessao(page, contas.investidor.email);
      // conexões já vistas: o aviso de match não cobre as telas
      await page.evaluate((email) => localStorage.setItem(`vertice.matches.vistos.${email}`, '["1","2","3"]'), contas.investidor.email);
      for (const rota of paginas.investidor) await verificar(page, rota, tela.nome);
    });

    test("portal da startup", async ({ page }) => {
      await sessao(page, contas.startup.email);
      for (const rota of paginas.startup) await verificar(page, rota, tela.nome);
    });

    test("painel admin", async ({ page }) => {
      await sessao(page, contas.admin.email, contas.admin.senha);
      for (const rota of paginas.admin) await verificar(page, rota, tela.nome);
    });

    test("popup de edição respeita a margem da tela", async ({ page }) => {
      await sessao(page, contas.startup.email);
      await page.goto("/startups/perfil");
      await page.getByRole("button", { name: "Editar perfil" }).click();
      const caixa = (await page.getByRole("dialog", { name: "Editar perfil da startup" }).boundingBox())!;
      const margem = tela.width < 640 ? 16 : 32;
      expect(caixa.x).toBeGreaterThanOrEqual(margem - 1);
      expect(caixa.y).toBeGreaterThanOrEqual(margem - 1);
      expect(caixa.x + caixa.width).toBeLessThanOrEqual(tela.width - margem + 1);
      expect(caixa.y + caixa.height).toBeLessThanOrEqual(tela.height - margem + 1);
    });
  });
}
