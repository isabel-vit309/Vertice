// Comunidades: lista (foto, nome e descrição), entrar, conversa em grupo e item na sidebar.
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CommunitiesPage from "../components/CommunitiesPage";
import ISidebar from "../components/ISidebar";
import SSidebar from "../components/SSidebar";
import { api } from "../services/api";
import type { Community, CommunityPost } from "../services/api";
import { saveSession } from "../services/session";

const base: Community = {
  id: "1", slug: "ciberseguranca", name: "Cibersegurança & LGPD", description: "Proteção de dados e LGPD.",
  members: 3, joined: false, unread: 0, lastMessage: null,
};
const lista: Community[] = [
  { ...base },
  { ...base, id: "2", slug: "captacao", name: "Captação & Venture Capital", description: "Rodadas e valuation.", joined: true, unread: 2,
    lastMessage: { text: "Edital aberto", author: "Ana", category: "NOTICIA", sentAt: "2026-11-26T10:00:00", mine: false } },
];
const post = (id: string, extra: Partial<CommunityPost>): CommunityPost => ({
  id, sender: "member", authorUserId: 7, authorName: "CrediFeira", authorRole: "Startup", authorHasPhoto: false,
  category: "MENSAGEM", text: "", sentAt: "2026-11-26T10:00:00", ...extra,
});

function renderPage(path = "/investors/comunidades") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/investors/comunidades" element={<CommunitiesPage sidebar={null} viewer="investor" />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => saveSession({ token: "t", email: "inv@x.com", papel: "INVESTIDOR" }));
afterEach(() => vi.restoreAllMocks());

describe("lista de comunidades", () => {
  it("mostra foto, nome e descrição de cada comunidade", async () => {
    vi.spyOn(api.comunidades, "listar").mockResolvedValue(lista);
    renderPage();
    const cards = await screen.findAllByRole("article");
    expect(cards).toHaveLength(2);
    const primeiro = within(cards[0]);
    expect(primeiro.getByRole("img", { name: "Foto da comunidade Cibersegurança & LGPD" })).toBeInTheDocument();
    expect(primeiro.getByRole("heading", { name: "Cibersegurança & LGPD" })).toBeInTheDocument();
    expect(primeiro.getByText("Proteção de dados e LGPD.")).toBeInTheDocument();
    expect(primeiro.getByText("3 membros")).toBeInTheDocument();
    // quem já participa vê as não lidas e o botão de abrir a conversa
    expect(within(cards[1]).getByLabelText("2 mensagens não lidas")).toBeInTheDocument();
    expect(within(cards[1]).getByRole("button", { name: /Abrir conversa/ })).toBeInTheDocument();
  });

  it("entrar na comunidade abre a conversa do grupo", async () => {
    vi.spyOn(api.comunidades, "listar").mockResolvedValue(lista);
    const entrar = vi.spyOn(api.comunidades, "entrar").mockResolvedValue({ ...base, joined: true, members: 4 });
    vi.spyOn(api.comunidades, "mensagens").mockResolvedValue([
      post("10", { sender: "system", category: "SISTEMA", text: "Ana entrou na comunidade" }),
    ]);
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Entrar na comunidade Cibersegurança & LGPD" }));
    await waitFor(() => expect(entrar).toHaveBeenCalledWith("1"));
    expect(await screen.findByText("Ana entrou na comunidade")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Comunidade Cibersegurança & LGPD" })).toBeInTheDocument();
    expect(screen.getByText(/Nenhuma mensagem ainda/)).toBeInTheDocument();
  });
});

describe("conversa em grupo", () => {
  it("mostra autor, papel e tipo da mensagem, e envia com a categoria escolhida", async () => {
    vi.spyOn(api.comunidades, "listar").mockResolvedValue(lista);
    vi.spyOn(api.comunidades, "mensagens").mockResolvedValue([
      post("20", { text: "Fechamos nossa rodada seed!", category: "MOVIMENTO" }),
      post("21", { text: "Contratando devs", category: "MENSAGEM" }),
      post("22", { sender: "me", authorUserId: 1, authorName: "Ana", authorRole: "Investidor anjo", text: "Parabéns!" }),
    ]);
    const enviar = vi.spyOn(api.comunidades, "enviar").mockResolvedValue(
      post("23", { sender: "me", authorUserId: 1, authorName: "Ana", text: "Novo edital da Finep", category: "NOTICIA" }),
    );
    renderPage("/investors/comunidades?comunidade=2");

    expect(await screen.findByText("Fechamos nossa rodada seed!")).toBeInTheDocument();
    // o nome aparece uma vez para mensagens seguidas do mesmo autor
    expect(screen.getAllByText("CrediFeira")).toHaveLength(1);
    expect(screen.getByText("· Startup")).toBeInTheDocument();
    expect(screen.getByText("Movimento interno", { selector: "span" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Notícia" }));
    const campo = screen.getByRole("textbox", { name: "Digite sua mensagem" });
    fireEvent.change(campo, { target: { value: "Novo edital da Finep" } });
    fireEvent.keyDown(campo, { key: "Enter" });
    await waitFor(() => expect(enviar).toHaveBeenCalledWith("2", "Novo edital da Finep", "NOTICIA"));
    expect(await screen.findByText("Novo edital da Finep")).toBeInTheDocument();
    expect(campo).toHaveValue("");
    expect(screen.getByRole("radio", { name: "Mensagem" })).toBeChecked();
  });

  it("Shift+Enter quebra a linha em vez de enviar", async () => {
    vi.spyOn(api.comunidades, "listar").mockResolvedValue(lista);
    vi.spyOn(api.comunidades, "mensagens").mockResolvedValue([]);
    const enviar = vi.spyOn(api.comunidades, "enviar");
    renderPage("/investors/comunidades?comunidade=2");
    const campo = await screen.findByRole("textbox", { name: "Digite sua mensagem" });
    fireEvent.change(campo, { target: { value: "linha 1" } });
    fireEvent.keyDown(campo, { key: "Enter", shiftKey: true });
    expect(enviar).not.toHaveBeenCalled();
  });

  it("busca só as mensagens novas na atualização periódica", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.spyOn(api.comunidades, "listar").mockResolvedValue(lista);
    const mensagens = vi
      .spyOn(api.comunidades, "mensagens")
      .mockResolvedValueOnce([post("30", { text: "Primeira" })])
      .mockResolvedValue([post("31", { authorUserId: 8, authorName: "Bruno", text: "Chegou agora" })]);
    renderPage("/investors/comunidades?comunidade=2");
    expect(await screen.findByText("Primeira")).toBeInTheDocument();
    await vi.advanceTimersByTimeAsync(4100);
    expect(await screen.findByText("Chegou agora")).toBeInTheDocument();
    expect(mensagens).toHaveBeenLastCalledWith("2", "30");
    expect(screen.getByText("Primeira")).toBeInTheDocument();
  });
});

describe("sidebar", () => {
  it.each([
    ["investidor", <ISidebar />, "INVESTIDOR", "/investors/comunidades"],
    ["startup", <SSidebar />, "STARTUP", "/startups/comunidades"],
  ] as const)("Comunidades é o último item do menu do %s", (_, sidebar, papel, href) => {
    vi.spyOn(api.conexoes, "listar").mockResolvedValue([]);
    saveSession({ token: "t", email: "x@x.com", papel });
    render(<MemoryRouter>{sidebar}</MemoryRouter>);
    const links = within(screen.getByRole("navigation", { name: "Menu principal" })).getAllByRole("link");
    expect(links.at(-1)).toHaveTextContent("Comunidades");
    expect(links.at(-1)).toHaveAttribute("href", href);
  });
});
