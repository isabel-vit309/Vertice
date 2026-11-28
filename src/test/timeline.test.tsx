// Timeline: feed, publicar, curtir, comentar, compartilhar, excluir e links para os perfis.
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ISidebar from "../components/ISidebar";
import SSidebar from "../components/SSidebar";
import TimelinePage from "../components/timeline/TimelinePage";
import { PublicInvestorPage } from "../components/PublicProfilePages";
import { esquecerPerfilProprio } from "../components/MatchCelebration";
import { api } from "../services/api";
import type { InvestorProfile, OwnProfile, TimelineAuthor, TimelinePost } from "../services/api";
import { saveSession } from "../services/session";

const ana: TimelineAuthor = { userId: 1, type: "INVESTIDOR", profileId: "11", name: "Ana Investidora", role: "Investidor(a) anjo", hasPhoto: false };
const credi: TimelineAuthor = { userId: 7, type: "STARTUP", profileId: "42", name: "CrediFeira", role: "Startup", hasPhoto: false };
const bruno: TimelineAuthor = { userId: 9, type: "INVESTIDOR", profileId: "19", name: "Bruno Mentor", role: "Mentor(a)", hasPhoto: false };

const post = (id: string, author: TimelineAuthor, extra: Partial<TimelinePost> = {}): TimelinePost => ({
  id, author, text: `Texto ${id}`, createdAt: new Date().toISOString(), mine: author.userId === 1,
  likes: 0, comments: 0, shares: 0, liked: false, shared: false, repost: false, sharedPost: null, sharedUnavailable: false,
  ...extra,
});

function renderTimeline(viewer: "investor" | "startup" = "investor") {
  return render(
    <MemoryRouter initialEntries={["/t"]}>
      <Routes>
        <Route path="/t" element={<TimelinePage sidebar={null} viewer={viewer} />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  saveSession({ token: "t", email: "ana@x.com", papel: "INVESTIDOR" });
  esquecerPerfilProprio();
  vi.spyOn(api.perfil, "proprio").mockResolvedValue({
    role: "INVESTIDOR", startup: null, investor: { name: "Ana Investidora", userId: 1, hasPhoto: false, type: "INVESTIDOR" },
  } as unknown as OwnProfile);
  vi.spyOn(api.conexoes, "listar").mockResolvedValue([]);
});
afterEach(() => vi.restoreAllMocks());

describe("feed e perfis", () => {
  it("foto e nome levam ao perfil de quem publicou, conforme o portal", async () => {
    vi.spyOn(api.timeline, "feed").mockResolvedValue([post("2", credi), post("1", bruno), post("0", ana)]);
    renderTimeline("investor");
    expect(await screen.findByText("Texto 2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver perfil de CrediFeira" })).toHaveAttribute("href", "/investors/startups/42");
    expect(screen.getByRole("link", { name: "CrediFeira" })).toHaveAttribute("href", "/investors/startups/42");
    expect(screen.getByRole("link", { name: "Ver perfil de Bruno Mentor" })).toHaveAttribute("href", "/investors/perfis/investidor/9");
    await waitFor(() => expect(screen.getByRole("link", { name: "Ver perfil de Ana Investidora" })).toHaveAttribute("href", "/investors/perfil"));
  });

  it("no portal da startup os links vão para as páginas de perfil da startup", async () => {
    saveSession({ token: "t", email: "st@x.com", papel: "STARTUP" });
    vi.spyOn(api.timeline, "feed").mockResolvedValue([post("2", credi), post("1", bruno)]);
    renderTimeline("startup");
    expect(await screen.findByRole("link", { name: "Ver perfil de CrediFeira" })).toHaveAttribute("href", "/startups/perfis/startup/42");
    expect(screen.getByRole("link", { name: "Ver perfil de Bruno Mentor" })).toHaveAttribute("href", "/startups/perfis/investidor/9");
  });

  it("compartilhamento simples mostra a original com quem compartilhou", async () => {
    const original = post("5", credi, { shares: 1 });
    vi.spyOn(api.timeline, "feed").mockResolvedValue([post("6", bruno, { text: null, repost: true, sharedPost: original })]);
    renderTimeline();
    expect(await screen.findByText("Texto 5")).toBeInTheDocument();
    expect(screen.getByText(/compartilhou/)).toHaveTextContent("Bruno Mentor compartilhou");
    expect(screen.getByRole("article", { name: "Publicação de CrediFeira" })).toBeInTheDocument();
  });
});

describe("interações", () => {
  it("publica um texto e ele aparece no topo", async () => {
    vi.spyOn(api.timeline, "feed").mockResolvedValue([post("1", credi)]);
    const publicar = vi.spyOn(api.timeline, "publicar").mockResolvedValue(post("9", ana, { text: "Olá, ecossistema!" }));
    renderTimeline();
    const campo = await screen.findByLabelText("O que você quer compartilhar?");
    fireEvent.change(campo, { target: { value: "Olá, ecossistema!" } });
    expect(screen.getByText("483 caracteres restantes")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Publicar" }));
    await waitFor(() => expect(publicar).toHaveBeenCalledWith("Olá, ecossistema!"));
    const artigos = await screen.findAllByRole("article");
    expect(within(artigos[0]).getByText("Olá, ecossistema!")).toBeInTheDocument();
    expect(campo).toHaveValue("");
  });

  it("curtir usa o ícone de joinha (não o coração do X) e atualiza o contador", async () => {
    vi.spyOn(api.timeline, "feed").mockResolvedValue([post("1", credi, { likes: 2 })]);
    const curtir = vi.spyOn(api.timeline, "curtir").mockResolvedValue(post("1", credi, { likes: 3, liked: true }));
    renderTimeline();
    fireEvent.click(await screen.findByRole("button", { name: "Curtir (2 curtidas)" }));
    await waitFor(() => expect(curtir).toHaveBeenCalledWith("1"));
    expect(await screen.findByRole("button", { name: "Remover curtida (3 curtidas)" })).toHaveAttribute("aria-pressed", "true");
  });

  it("abre os comentários, comenta e o comentário leva ao perfil do autor", async () => {
    vi.spyOn(api.timeline, "feed").mockResolvedValue([post("1", credi, { comments: 1 })]);
    vi.spyOn(api.timeline, "comentarios").mockResolvedValue([
      { id: "c1", postId: "1", author: bruno, text: "Parabéns!", createdAt: new Date().toISOString(), mine: false, canDelete: false },
    ]);
    const comentar = vi.spyOn(api.timeline, "comentar").mockResolvedValue({
      id: "c2", postId: "1", author: ana, text: "Quero conversar", createdAt: new Date().toISOString(), mine: true, canDelete: true,
    });
    renderTimeline();
    fireEvent.click(await screen.findByRole("button", { name: "Comentar (1 comentários)" }));
    expect(await screen.findByText("Parabéns!")).toBeInTheDocument();
    const secao = screen.getByRole("region", { name: /Comentários/ });
    expect(within(secao).getByRole("link", { name: "Ver perfil de Bruno Mentor" })).toHaveAttribute("href", "/investors/perfis/investidor/9");
    fireEvent.change(within(secao).getByLabelText("Escreva um comentário"), { target: { value: "Quero conversar" } });
    fireEvent.click(within(secao).getByRole("button", { name: "Comentar" }));
    await waitFor(() => expect(comentar).toHaveBeenCalledWith("1", "Quero conversar"));
    expect(await screen.findByText("Quero conversar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Comentar (2 comentários)" })).toBeInTheDocument();
  });

  it("compartilha (ícone próprio) e também com comentário", async () => {
    const original = post("1", credi);
    vi.spyOn(api.timeline, "feed").mockResolvedValue([original]);
    const publicar = vi
      .spyOn(api.timeline, "publicar")
      .mockResolvedValueOnce(post("8", ana, { text: null, repost: true, sharedPost: { ...original, shares: 1, shared: true } }))
      .mockResolvedValueOnce(post("10", ana, { text: "Vale olhar", sharedPost: original }));
    renderTimeline();
    fireEvent.click(await screen.findByRole("button", { name: "Compartilhar (0 compartilhamentos)" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Compartilhar" }));
    await waitFor(() => expect(publicar).toHaveBeenCalledWith(null, "1"));
    expect(await screen.findByText("Você compartilhou")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /Compartilhar \(1 compartilhamentos\)/ })[0]);
    fireEvent.click(screen.getByRole("menuitem", { name: "Compartilhar com comentário" }));
    const dialogo = screen.getByRole("dialog", { name: "Compartilhar com comentário" });
    fireEvent.change(within(dialogo).getByLabelText("Seu comentário"), { target: { value: "Vale olhar" } });
    fireEvent.click(within(dialogo).getByRole("button", { name: "Compartilhar" }));
    await waitFor(() => expect(publicar).toHaveBeenLastCalledWith("Vale olhar", "1"));
    expect(await screen.findByText("Vale olhar")).toBeInTheDocument();
  });

  it("exclui a própria publicação depois de confirmar", async () => {
    vi.spyOn(api.timeline, "feed").mockResolvedValue([post("3", ana, { text: "Vou apagar" }), post("1", credi)]);
    const excluir = vi.spyOn(api.timeline, "excluir").mockResolvedValue(undefined);
    renderTimeline();
    fireEvent.click(await screen.findByRole("button", { name: "Mais opções" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Excluir publicação/ }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Excluir publicação?" })).getByRole("button", { name: "Excluir" }));
    await waitFor(() => expect(excluir).toHaveBeenCalledWith("3"));
    await waitFor(() => expect(screen.queryByText("Vou apagar")).not.toBeInTheDocument());
  });
});

describe("menu e perfil público", () => {
  it.each([
    ["investidor", <ISidebar />, "INVESTIDOR" as const],
    ["startup", <SSidebar />, "STARTUP" as const],
  ])("Timeline aparece no menu do %s, antes de Comunidades", (_, sidebar, papel) => {
    saveSession({ token: "t", email: "x@x.com", papel });
    render(<MemoryRouter>{sidebar}</MemoryRouter>);
    const nomes = within(screen.getByRole("navigation", { name: "Menu principal" })).getAllByRole("link").map((l) => l.textContent);
    expect(nomes.slice(-2)).toEqual(["Timeline", "Comunidades"]);
  });

  it("o perfil público do investidor não mostra dados da conta", async () => {
    vi.spyOn(api.perfil, "investidor").mockResolvedValue({
      id: "19", userId: 9, type: "MENTOR", name: "Bruno Mentor", city: "Recife", state: "PE", linkedin: "", segments: ["Fintech"],
      stages: [], ticketMin: null, ticketMax: null, aboutInvestor: "Mentor de fintechs", career: "", lookingFor: "", hasPhoto: false,
      cpf: null, cnpj: null, email: null,
    } as InvestorProfile);
    render(
      <MemoryRouter initialEntries={["/investors/perfis/investidor/9"]}>
        <Routes>
          <Route path="/investors/perfis/investidor/:userId" element={<PublicInvestorPage viewer="investor" />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole("heading", { name: "Bruno Mentor" })).toBeInTheDocument();
    expect(screen.getByText("Mentor de fintechs")).toBeInTheDocument();
    expect(screen.queryByText("Dados da conta")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Editar perfil/ })).not.toBeInTheDocument();
  });
});
