// Jornada completa pela interface, sobre um banco recém-criado:
// cadastro (com foto e anexos) → aprovação pelo admin → matching → conexão firmada (animação dos dois lados)
// → conversa → convite de reunião → agenda dos dois → avaliação → métricas → edição de perfil → logout.
import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";

import { PDF, PNG, SENHA, arquivo, contas, escolher, login, loginAdmin } from "./apoio";

test.describe.configure({ mode: "serial" });

const { startup, investidor } = contas;
let ctxStartup: BrowserContext;
let ctxInvestidor: BrowserContext;
let pStartup: Page;
let pInvestidor: Page;
let conexaoId = "";
let startupPerfilId = "";

async function novoContexto(browser: Browser) {
  const ctx = await browser.newContext({ reducedMotion: "reduce", locale: "pt-BR", viewport: { width: 1280, height: 860 } });
  return ctx;
}

test.beforeAll(async ({ browser }) => {
  ctxStartup = await novoContexto(browser);
  ctxInvestidor = await novoContexto(browser);
  pStartup = await ctxStartup.newPage();
  pInvestidor = await ctxInvestidor.newPage();
});

test.afterAll(async () => {
  await ctxStartup?.close();
  await ctxInvestidor?.close();
});

test("cadastro da startup em 4 etapas, com logo, pitch deck e link", async () => {
  const page = pStartup;
  await page.goto("/startups/register");
  await page.locator("#startup-email").fill(startup.email);
  await page.locator("#startup-password").fill(SENHA);
  await page.locator("#startup-confirm-password").fill(SENHA);
  await page.locator("#startup-confirm-password").press("Enter");
  await expect(page).toHaveURL(/register-complet\/step1/);

  // Etapa 1: dados básicos + logo
  await page.locator('input[type="file"][accept*="image"]').setInputFiles(arquivo("logo.png", "image/png", PNG));
  await expect(page.getByRole("img", { name: /Foto de/ })).toBeVisible();
  await page.locator("#startup-name").fill(startup.nome);
  await page.locator("#startup-cnpj").fill("15881399000134");
  await page.locator("#startup-website").fill("https://sertaopay.example");
  await page.locator("#startup-foundedYear").fill("2025");
  await escolher(page, page.locator("#startup-state"), "Pernambuco", "Pernambuco (PE)");
  await escolher(page, page.locator("#startup-city"), "Recife");
  await page.locator("#startup-profile-owner").fill("Caio Lima");
  await page.getByRole("button", { name: "Próximo" }).click();

  // Etapa 2: negócio
  await expect(page).toHaveURL(/step2/);
  await escolher(page, page.locator("#startup-segment"), "Fintech");
  await escolher(page, page.locator("#startup-stage"), "Ideação");
  await page.locator("#startup-minimum-ticket").fill("5000000");
  await page.locator("#startup-maximum-ticket").fill("15000000");
  await page.locator("#startup-summary").fill("Pagamentos por Pix para feiras do Sertão.");
  await page.locator("#startup-problem").fill("Feirantes perdem vendas por falta de troco.");
  await page.locator("#startup-competitive-advantages").fill("Funciona com internet instável.");
  await page.getByRole("button", { name: "Próximo" }).click();

  // Etapa 3: materiais (opcionais) — anexa só o pitch deck e o link
  await expect(page).toHaveURL(/step3/);
  await page.locator("#startup-pitch-deck").setInputFiles(arquivo("pitch-sertaopay.pdf", "application/pdf", PDF));
  await page.locator("#startup-presentation-video").fill("https://video.example/sertaopay");
  await page.getByRole("button", { name: "Próximo" }).click();

  // Etapa 4: consentimentos
  await expect(page).toHaveURL(/step4/);
  for (const id of ["#startup-terms", "#startup-privacy", "#startup-data-processing"]) await page.locator(id).check();
  await page.getByRole("button", { name: "Finalizar cadastro" }).click();
  await expect(page).toHaveURL(/\/startups\/login/);
  await expect(page.getByText(/pendente de aprovação/)).toBeVisible();
});

test("cadastro do investidor em 3 etapas, com foto", async () => {
  const page = pInvestidor;
  await page.goto("/investors/register");
  await page.locator("#startup-email").fill(investidor.email);
  await page.locator("#startup-password").fill(SENHA);
  await page.locator("#startup-confirm-password").fill(SENHA);
  await page.locator("#startup-confirm-password").press("Enter");
  await expect(page).toHaveURL(/register-complet\/step1/);

  await page.locator('input[type="file"][accept*="image"]').setInputFiles(arquivo("eu.png", "image/png", PNG));
  await page.locator("#investor-name").fill(investidor.nome);
  await page.locator("#investor-document").fill("12345678909");
  await page.locator("#investor-linkedin").fill("https://linkedin.com/in/marina-alves");
  await escolher(page, page.locator("#investor-state"), "Pernambuco", "Pernambuco (PE)");
  await escolher(page, page.locator("#investor-city"), "Recife");
  await page.getByRole("button", { name: "Próximo" }).click();

  await expect(page).toHaveURL(/step2/);
  await escolher(page, page.locator("#investor-segment"), "Fintech");
  await escolher(page, page.locator("#investor-stage"), "Ideação");
  await page.locator("#investor-minimum-ticket").fill("3000000");
  await page.locator("#investor-maximum-ticket").fill("20000000");
  await page.locator("#investor-about").fill("Investidora anjo em Recife.");
  await page.locator("#investor-career").fill("Dez anos em meios de pagamento.");
  await page.locator("#investor-looking-for").fill("Fintechs de inclusão financeira.");
  await page.getByRole("button", { name: "Próximo" }).click();

  await expect(page).toHaveURL(/step3/);
  for (const id of ["#investor-terms", "#investor-privacy", "#investor-data-processing"]) await page.locator(id).check();
  await page.getByRole("button", { name: "Finalizar cadastro" }).click();
  await expect(page).toHaveURL(/\/investors\/login/);
});

test("conta pendente não entra; admin aprova as duas", async ({ browser }) => {
  // antes da aprovação o login é recusado
  await pStartup.locator("#startup-email").fill(startup.email);
  await pStartup.locator("#startup-password").fill(SENHA);
  await pStartup.locator("#startup-password").press("Enter");
  await expect(pStartup.getByRole("alert")).toBeVisible();
  await expect(pStartup).toHaveURL(/\/startups\/login/);

  const ctx = await novoContexto(browser);
  const admin = await ctx.newPage();
  await loginAdmin(admin);
  for (const email of [startup.email, investidor.email]) {
    const linha = admin.locator(`div.flex-wrap.px-5:has-text("${email}")`);
    await expect(linha).toContainText("Pendente");
    await linha.getByRole("button", { name: "Aprovar" }).click();
    await expect(linha).toContainText("Aprovado");
  }
  await ctx.close();
});

test("investidor vê a startup compatível com os anexos e pede conexão", async () => {
  const page = pInvestidor;
  await login(page, "investors", investidor.email);
  await expect(page).toHaveURL(/\/investors\/startups/);

  // feed: foto e link para o perfil público
  const cartao = page.locator("article", { hasText: startup.nome });
  await expect(cartao.getByRole("img", { name: `Foto de ${startup.nome}` })).toBeVisible();
  const href = await cartao.getByRole("link", { name: /Visualizar perfil/i }).getAttribute("href");
  startupPerfilId = href!.split("/").pop()!;

  await page.getByRole("link", { name: "Matching" }).first().click();
  const ativo = page.locator('article[aria-hidden="false"]');
  await expect(ativo.getByRole("heading", { name: startup.nome })).toBeVisible();
  await expect(ativo).toContainText("Materiais da startup");
  await expect(ativo.getByRole("button", { name: /Pitch Deck/ })).toBeVisible();
  await expect(ativo.getByRole("button", { name: /Business Model Canvas/ })).toHaveCount(0); // não foi anexado
  await expect(ativo.getByRole("link", { name: /Apresentação/ })).toHaveAttribute("href", "https://video.example/sertaopay");

  // o pitch deck baixa com o nome original
  const download = page.waitForEvent("download");
  await ativo.getByRole("button", { name: /Pitch Deck/ }).click();
  expect((await download).suggestedFilename()).toBe("pitch-sertaopay.pdf");

  await ativo.getByRole("button", { name: "Solicitar Conexão" }).click();
  await expect(page.getByText(`Pedido de conexão enviado para ${startup.nome}.`)).toBeVisible();
});

test("startup firma a conexão: animação de match e conversa", async () => {
  const page = pStartup;
  await login(page, "startups", startup.email);
  await page.getByRole("link", { name: "Matching" }).first().click();
  const ativo = page.locator('article[aria-hidden="false"]');
  await expect(ativo.getByRole("heading", { name: investidor.nome })).toBeVisible();
  await ativo.getByRole("button", { name: "Firmar conexão" }).click();

  const celebracao = page.getByRole("dialog", { name: "Conexão bem-sucedida!" });
  await expect(celebracao).toBeVisible();
  await expect(celebracao.getByText(startup.nome)).toBeVisible(); // a própria startup
  await expect(celebracao.getByText(investidor.nome).first()).toBeVisible(); // quem se conectou
  await celebracao.getByRole("link", { name: /Enviar mensagem/ }).click();

  await expect(page).toHaveURL(/\/startups\/mensagens\?conversa=\d+/);
  conexaoId = new URL(page.url()).searchParams.get("conversa")!;
  await page.getByPlaceholder("Escreva uma mensagem...").fill("Olá, Marina! Obrigado pelo interesse.");
  await page.getByRole("button", { name: "Enviar", exact: true }).click();
  await expect(page.getByText("Olá, Marina! Obrigado pelo interesse.").last()).toBeVisible();
});

test("investidor recebe a animação do novo match e convida para reunião", async () => {
  const page = pInvestidor;
  await page.goto("/investors/perfil");
  const celebracao = page.getByRole("dialog", { name: "Conexão bem-sucedida!" });
  await expect(celebracao).toBeVisible({ timeout: 20_000 });
  await expect(celebracao.getByRole("link", { name: /Enviar mensagem/ })).toHaveAttribute(
    "href",
    `/investors/mensagens?conversa=${conexaoId}`,
  );
  await celebracao.getByRole("link", { name: /Enviar mensagem/ }).click();

  await expect(page.getByText("Olá, Marina! Obrigado pelo interesse.").last()).toBeVisible();
  await page.getByRole("button", { name: /Convidar para reunião/ }).click();
  const convite = page.getByRole("dialog");
  const dia = new Date(Date.now() + 3 * 86_400_000).toISOString().slice(0, 10);
  await convite.getByLabel("Data").fill(dia);
  await convite.getByLabel("Horário").fill("15:00");
  await convite.getByLabel("Assunto").fill("Apresentação do pitch");
  await convite.getByRole("button", { name: "Enviar convite" }).click();
  await expect(page.getByText("Apresentação do pitch").last()).toBeVisible();
});

test("startup aceita o convite e a reunião aparece na agenda dos dois", async () => {
  const page = pStartup;
  await page.goto(`/startups/mensagens?conversa=${conexaoId}`);
  await page.getByRole("button", { name: "Aceitar" }).click();
  await expect(page.getByText(/Confirmada/).first()).toBeVisible();

  for (const [p, rota] of [[pStartup, "/startups/meetings"], [pInvestidor, "/investors/meetings"]] as const) {
    await p.goto(rota);
    await expect(p.getByText("Apresentação do pitch").first()).toBeVisible();
  }
});

test("avaliação pós-interação (RF10) aparece nas métricas do admin", async ({ browser }) => {
  const page = pInvestidor;
  await page.goto("/investors/conections");
  await page.getByRole("button", { name: `Avaliar ${startup.nome}` }).first().click();
  const dialogo = page.getByRole("dialog");
  await dialogo.getByRole("button", { name: "5 de 5" }).click();
  await dialogo.getByRole("textbox").fill("Equipe muito preparada.");
  await dialogo.getByRole("button", { name: "Salvar avaliação" }).click();
  await expect(page.getByRole("img", { name: "Nota 5 de 5" }).first()).toBeVisible();

  const ctx = await novoContexto(browser);
  const admin = await ctx.newPage();
  await loginAdmin(admin);
  await admin.getByRole("link", { name: "Métricas" }).first().click();
  const card = (rotulo: string) => admin.locator("article", { hasText: rotulo });
  await expect(card("Matches realizados")).toContainText("1");
  await expect(card("Conversas iniciadas")).toContainText("1 mensagens trocadas");
  await expect(card("Reuniões agendadas")).toContainText("1");
  await expect(card("Avaliações pós-interação")).toContainText("Nota média 5,0 de 5");
  await expect(admin.getByRole("progressbar", { name: "Matches com reunião confirmada" })).toHaveAttribute("aria-valuenow", "100");
  await ctx.close();
});

test("startup edita o perfil e anexa o canvas; investidor vê no perfil público", async () => {
  const page = pStartup;
  await page.goto("/startups/perfil");
  await page.getByLabel("Anexar Business Model Canvas").setInputFiles(arquivo("canvas.pdf", "application/pdf", PDF));
  await expect(page.getByText("canvas.pdf")).toBeVisible();

  await page.getByRole("button", { name: "Editar perfil" }).click();
  const dialogo = page.getByRole("dialog", { name: "Editar perfil da startup" });
  await dialogo.getByLabel("Sobre a startup").fill("Pix offline para feiras livres do Nordeste.");
  await dialogo.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByText("Perfil atualizado.")).toBeVisible();

  await pInvestidor.goto(`/investors/startups/${startupPerfilId}`);
  await expect(pInvestidor.getByText("Pix offline para feiras livres do Nordeste.")).toBeVisible();
  await expect(pInvestidor.getByRole("button", { name: "Baixar Business Model Canvas" })).toBeVisible();
  await expect(pInvestidor.getByText("CNPJ")).toHaveCount(0); // dado privado não aparece para o investidor
});

test("logout nos três portais bloqueia as páginas protegidas", async ({ browser }) => {
  for (const [page, protegida, loginUrl] of [
    [pStartup, "/startups/perfil", /\/startups\/login/],
    [pInvestidor, "/investors/perfil", /\/investors\/login/],
  ] as const) {
    await page.goto(protegida);
    await page.getByRole("button", { name: "Sair" }).first().click();
    await expect(page).toHaveURL(loginUrl);
    await page.goto(protegida);
    await expect(page).toHaveURL(loginUrl);
  }
  const ctx = await novoContexto(browser);
  const admin = await ctx.newPage();
  await loginAdmin(admin);
  await admin.getByRole("button", { name: "Sair" }).first().click();
  await expect(admin).toHaveURL(/\/adm\/login/);
  await admin.goto("/adm/metricas");
  await expect(admin).toHaveURL(/\/adm\/login/);
  await ctx.close();
});

test("animação de login: tela laranja e símbolo antes de entrar", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "no-preference", viewport: { width: 1280, height: 860 } });
  const page = await ctx.newPage();
  await page.goto("/investors/login");
  await page.locator("#startup-email").fill(investidor.email);
  await page.locator("#startup-password").fill(SENHA);
  await page.locator("#startup-password").press("Enter");
  await expect(page.getByRole("status", { name: "Entrando no Vértice" })).toBeVisible();
  await expect(page).toHaveURL(/\/investors\/startups/);
  await expect(page.getByRole("status", { name: "Entrando no Vértice" })).toHaveCount(0, { timeout: 5_000 });
  await ctx.close();
});
