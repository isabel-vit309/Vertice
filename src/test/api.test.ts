// Regressão: cliente HTTP (erros, sessão, multipart do cadastro, fotos e downloads).
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ApiError,
  api,
  compact,
  formatarTicket,
  normalizeTicket,
  validarFoto,
} from "../services/api";
import { buildPayload } from "../integration/payload";
import { getSession, saveSession } from "../services/session";

function mockFetch(...responses: Response[]) {
  const fn = vi.fn();
  responses.forEach((r) => fn.mockResolvedValueOnce(r));
  vi.stubGlobal("fetch", fn);
  return fn;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

afterEach(() => vi.unstubAllGlobals());

describe("utilitários", () => {
  it("normaliza tickets digitados com máscara", () => {
    expect(normalizeTicket("R$ 1.500,50")).toBe("1500.50");
    expect(normalizeTicket("1.000.000")).toBe("1000000");
    expect(normalizeTicket("1000.50")).toBe("1000.50");
    expect(normalizeTicket("")).toBe("");
  });

  it("compact remove vazios mas mantém zero e false", () => {
    expect(compact({ a: "", b: null, c: undefined, d: 0, e: false, f: "x" })).toEqual({ d: 0, e: false, f: "x" });
  });

  it("formata faixas de ticket", () => {
    expect(formatarTicket(null, null)).toBe("Não informado");
    expect(formatarTicket(50000, null)).toMatch(/^A partir de R\$\s50\.000$/);
    expect(formatarTicket(null, 9000)).toMatch(/^Até R\$\s9\.000$/);
  });

  it("valida a foto antes do envio (tipo e 2 MB)", () => {
    expect(validarFoto(new File(["x"], "a.png", { type: "image/png" }))).toBe("");
    expect(validarFoto(new File(["<svg/>"], "a.svg", { type: "image/svg+xml" }))).toMatch(/JPG, PNG ou WebP/);
    const grande = new File([new Uint8Array(2 * 1024 * 1024 + 1)], "g.jpg", { type: "image/jpeg" });
    expect(validarFoto(grande)).toMatch(/2 MB/);
  });
});

describe("payload do cadastro", () => {
  it("remove campos só de tela e arquivos, limpa documento e ticket", () => {
    const photo = new File(["x"], "f.png", { type: "image/png" });
    const payload = buildPayload({
      email: " a@b.com ",
      corporateEmail: "outro@b.com",
      documentType: "cpf",
      cpf: "123.456.789-09",
      minimumTicket: "R$ 1.500,00",
      photo,
      pitchDeck: null,
      businessModelCanvas: null,
      segments: ["Fintech"],
    });
    expect(payload).toEqual({ email: "a@b.com", cpf: "12345678909", minimumTicket: "1500.00", segments: ["Fintech"] });
  });
});

describe("requisições", () => {
  it("usa a mensagem do backend no erro", async () => {
    mockFetch(json({ status: 409, message: "Já existe um cadastro com este e-mail" }, 409));
    await expect(api.cadastrarStartup({ email: "x" })).rejects.toMatchObject({
      status: 409,
      message: "Já existe um cadastro com este e-mail",
    });
  });

  it("erro de rede vira mensagem amigável", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const erro = await api.login("a", "b").catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(ApiError);
    expect((erro as ApiError).status).toBe(0);
  });

  it("401 em rota autenticada encerra a sessão", async () => {
    saveSession({ token: "t", email: "a@b.com", papel: "INVESTIDOR" });
    mockFetch(new Response("", { status: 401 }));
    await expect(api.perfil.proprio()).rejects.toMatchObject({ status: 401 });
    expect(getSession()).toBeNull();
  });

  it("envia o token nas rotas autenticadas", async () => {
    saveSession({ token: "abc", email: "a@b.com", papel: "STARTUP" });
    const fetchMock = mockFetch(json({ role: "STARTUP", startup: null, investor: null }));
    await api.perfil.proprio();
    const headers = fetchMock.mock.calls[0][1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer abc");
  });

  it("cadastro do investidor sem foto vai em JSON", async () => {
    const fetchMock = mockFetch(json({ id: 1 }, 201));
    await api.cadastrarInvestidor({ email: "a@b.com", segments: ["A"] });
    const init = fetchMock.mock.calls[0][1];
    expect((init.headers as Headers).get("Content-Type")).toBe("application/json");
    expect(JSON.parse(init.body as string)).toEqual({ email: "a@b.com", segments: ["A"] });
  });

  it("cadastro do investidor com foto vai em multipart, listas como campos repetidos", async () => {
    const fetchMock = mockFetch(json({ id: 1 }, 201));
    const photo = new File(["x"], "f.png", { type: "image/png" });
    await api.cadastrarInvestidor({ email: "a@b.com", segments: ["Fintech", "Healthtech"], vazio: "" }, photo);
    const body = fetchMock.mock.calls[0][1].body as FormData;
    expect(body).toBeInstanceOf(FormData);
    expect(body.getAll("segments")).toEqual(["Fintech", "Healthtech"]);
    expect(body.get("photo")).toBeInstanceOf(File);
    expect(body.has("vazio")).toBe(false);
  });

  it("cadastro da startup com foto vai em multipart", async () => {
    const fetchMock = mockFetch(json({ id: 1 }, 201));
    await api.cadastrarStartup({ name: "X" }, { photo: new File(["x"], "f.png", { type: "image/png" }) });
    const body = fetchMock.mock.calls[0][1].body as FormData;
    expect(body.get("name")).toBe("X");
    expect(body.get("photo")).toBeInstanceOf(File);
  });

  it("foto inexistente resolve null e fica em cache", async () => {
    const fetchMock = mockFetch(new Response("", { status: 404 }));
    expect(await api.foto(987)).toBeNull();
    expect(await api.foto(987)).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("download de material usa o nome do arquivo informado pelo servidor", async () => {
    mockFetch(
      new Response("%PDF", {
        status: 200,
        headers: { "Content-Disposition": 'attachment; filename="pitch-deck.pdf"' },
      }),
    );
    const clicked: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
      clicked.push(this.download);
    });
    await api.baixarMaterial("1", "pitch");
    expect(clicked).toEqual(["pitch-deck.pdf"]);
  });
});
