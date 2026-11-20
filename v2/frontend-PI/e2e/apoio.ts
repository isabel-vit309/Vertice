// Auxiliares dos testes ponta a ponta.
import { expect, type Locator, type Page } from "@playwright/test";

export const API = "http://localhost:8083";
export const SENHA = "Teste@2026";

export const contas = {
  admin: { email: "admin@projetopi.com", senha: "admin123" },
  startup: { email: "startup.e2e@vertice.test", nome: "SertãoPay" },
  investidor: { email: "investidora.e2e@vertice.test", nome: "Marina Alves" },
};

/** PNG 1×1 válido (o backend confere a assinatura do arquivo). */
export const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);
export const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF");

export const arquivo = (name: string, mimeType: string, buffer: Buffer) => ({ name, mimeType, buffer });

/** Seleciona uma opção num campo digitável (Combobox/MultiCombobox). */
export async function escolher(page: Page, campo: Locator, texto: string, opcao = texto) {
  await campo.click();
  await campo.fill(texto);
  await page.getByRole("option", { name: opcao, exact: true }).first().click();
}

export async function login(page: Page, portal: "investors" | "startups", email: string, senha = SENHA) {
  await page.goto(`/${portal}/login`);
  await page.locator("#startup-email").fill(email);
  await page.locator("#startup-password").fill(senha);
  await page.locator("#startup-password").press("Enter");
  await expect(page).not.toHaveURL(/\/login$/, { timeout: 15_000 });
}

export async function loginAdmin(page: Page) {
  await page.goto("/adm/login");
  await page.locator("#adm-email").fill(contas.admin.email);
  await page.locator("#adm-password").fill(contas.admin.senha);
  await page.locator("#adm-password").press("Enter");
  await expect(page).toHaveURL(/\/adm$/, { timeout: 15_000 });
}

/** Sessão direto pela API (para cenários que não testam a tela de login). */
export async function sessao(page: Page, email: string, senha = SENHA) {
  const resposta = await page.request.post(`${API}/auth/login`, { data: { email, password: senha } });
  expect(resposta.ok(), `login de ${email}`).toBeTruthy();
  const dados = await resposta.json();
  await page.goto("/investors/login");
  await page.evaluate((s) => localStorage.setItem("vertice.session", JSON.stringify(s)), dados);
  return dados as { token: string; email: string; papel: string };
}

/** Nenhum elemento pode passar da largura da tela (sem rolagem lateral). */
export async function semRolagemLateral(page: Page) {
  const excesso = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(excesso, "a página não deve ter rolagem lateral").toBeLessThanOrEqual(0);
}
