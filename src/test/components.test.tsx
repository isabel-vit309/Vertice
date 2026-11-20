// Regressão de componentes: logout dos portais, popup de edição, matching, aviso de match e animações.
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import ISidebar from "../components/ISidebar";
import SSidebar from "../components/SSidebar";
import MatchDeck from "../components/MatchDeck";
import type { DeckItem } from "../components/MatchDeck";
import MatchCelebration, { loadOwnProfile } from "../components/MatchCelebration";
import NewMatchWatcher from "../components/NewMatchWatcher";
import { Dialog } from "../components/ProfileUI";
import { useCountUp } from "../components/motion";
import { api } from "../services/api";
import type { ConnectionItem, OwnProfile } from "../services/api";
import { getSession, saveSession } from "../services/session";

afterEach(() => vi.unstubAllGlobals());

function withRouter(ui: React.ReactNode, path = "/inicio") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={ui} />
        <Route path="/investors/login" element={<p>Tela de login do investidor</p>} />
        <Route path="/startups/login" element={<p>Tela de login da startup</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

/* ------------------------------------------------------------- logout */

describe("logout dos portais", () => {
  it("investidor logado sai, a sessão é apagada e volta ao login do investidor", async () => {
    vi.spyOn(api.conexoes, "listar").mockResolvedValue([]);
    saveSession({ token: "t", email: "inv@x.com", papel: "INVESTIDOR" });
    withRouter(<ISidebar />);
    const sair = screen.getAllByRole("button", { name: /sair/i });
    expect(sair).toHaveLength(1); // no computador (o menu do celular está fechado)
    fireEvent.click(sair[0]);
    expect(getSession()).toBeNull();
    expect(await screen.findByText("Tela de login do investidor")).toBeInTheDocument();
  });

  it("startup sai pelo menu do celular", async () => {
    saveSession({ token: "t", email: "st@x.com", papel: "STARTUP" });
    withRouter(<SSidebar />);
    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    const sair = screen.getAllByRole("button", { name: /sair/i });
    expect(sair).toHaveLength(2);
    fireEvent.click(sair[0]);
    expect(getSession()).toBeNull();
    expect(await screen.findByText("Tela de login da startup")).toBeInTheDocument();
  });

  it("sem sessão do portal (telas de cadastro) o botão Sair não aparece", () => {
    withRouter(<SSidebar />);
    expect(screen.queryByRole("button", { name: /sair/i })).not.toBeInTheDocument();
    saveSession({ token: "t", email: "a@x.com", papel: "INVESTIDOR" });
    withRouter(<SSidebar />);
    expect(screen.queryByRole("button", { name: /sair/i })).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------- popup de edição */

describe("popup de edição", () => {
  it("fica afastado das bordas, com rolagem interna, e fecha com Esc", () => {
    const onClose = vi.fn();
    render(
      <Dialog title="Editar meu perfil" onClose={onClose} wide>
        <input aria-label="Nome" />
      </Dialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Editar meu perfil" });
    expect(dialog.parentElement).toHaveClass("p-4", "sm:p-8", "lg:p-12");
    expect(dialog).toHaveClass("max-h-full", "overflow-hidden");
    expect(screen.getByLabelText("Nome").parentElement).toHaveClass("overflow-y-auto");
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------- matching */

const card = (id: string, extra: Partial<DeckItem> = {}): DeckItem => ({
  id,
  name: `Startup ${id}`,
  role: "Startup cadastrada",
  tags: ["Fintech"],
  description: "Descrição",
  location: "Recife/PE",
  ticket: "R$ 1",
  badge: "90% de afinidade",
  ...extra,
});

function deck(items: DeckItem[], onDecision = vi.fn().mockResolvedValue(undefined)) {
  render(
    <MatchDeck
      sidebar={null}
      title="Matching"
      subtitle=""
      items={items}
      acceptLabel="Solicitar Conexão"
      rejectLabel="Passar"
      acceptedMessage={(n) => `Pedido enviado para ${n}.`}
      rejectedMessage={(n) => `${n} dispensada.`}
      emptyTitle="Vazio"
      emptyText=""
      hint=""
      onDecision={onDecision}
    />,
  );
  return onDecision;
}

const ativo = () => document.querySelector('article[aria-hidden="false"] h2')?.textContent;

describe("matching", () => {
  it("avança e volta de forma circular (skip e skipback)", () => {
    deck([card("1"), card("2"), card("3")]);
    expect(ativo()).toBe("Startup 1");
    fireEvent.click(screen.getAllByRole("button", { name: "Próximo" })[0]);
    expect(ativo()).toBe("Startup 2");
    fireEvent.click(screen.getAllByRole("button", { name: "Anterior" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Anterior" })[0]);
    expect(ativo()).toBe("Startup 3");
  });

  it("transição curta com aceleração e desaceleração", () => {
    deck([card("1"), card("2")]);
    const article = document.querySelector('article[aria-hidden="false"]')!;
    expect(article.className).toContain("duration-[380ms]");
    expect(article.className).toContain("ease-[cubic-bezier(0.76,0,0.24,1)]");
    fireEvent.click(screen.getAllByRole("button", { name: "Próximo" })[0]);
    expect(document.querySelector('article[aria-hidden="false"]')!.className).toMatch(/deck-speed-[ab]/);
  });

  it("anexos só aparecem quando a startup enviou (RF06)", () => {
    const abrir = vi.fn();
    deck([
      card("1", { materials: [{ label: "Pitch Deck", onOpen: abrir }, { label: "Apresentação", href: "https://v.example" }] }),
      card("2", { materials: [] }),
    ]);
    const ativoEl = document.querySelector('article[aria-hidden="false"]')!;
    expect(ativoEl.textContent).toContain("Materiais da startup");
    fireEvent.click(screen.getByRole("button", { name: /Pitch Deck/ }));
    expect(abrir).toHaveBeenCalled();
    expect(screen.getByRole("link", { name: /Apresentação/ })).toHaveAttribute("href", "https://v.example");
    fireEvent.click(screen.getAllByRole("button", { name: "Próximo" })[0]);
    expect(document.querySelector('article[aria-hidden="false"]')!.textContent).not.toContain("Materiais da startup");
  });

  it("decisão remove o cartão e mostra o retorno", async () => {
    const onDecision = deck([card("1")]);
    fireEvent.click(screen.getByRole("button", { name: "Solicitar Conexão" }));
    await waitFor(() => expect(onDecision).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }), "accepted"));
    expect(await screen.findByText("Pedido enviado para Startup 1.")).toBeInTheDocument();
  });
});

/* ------------------------------------------------------ aviso de match */

const conexao = (id: string): ConnectionItem => ({
  id,
  profileId: "p" + id,
  userId: Number(id),
  name: `Startup ${id}`,
  type: "Startup cadastrada",
  city: "Recife",
  state: "PE",
  segments: [],
  ticketMin: null,
  ticketMax: null,
  connectedAt: "2026-11-19",
  myRating: null,
  hasPhoto: false,
});

describe("aviso de novo match do investidor", () => {
  it("na primeira visita marca as conexões existentes como vistas, sem animação", async () => {
    saveSession({ token: "t", email: "Inv@X.com", papel: "INVESTIDOR" });
    vi.spyOn(api.conexoes, "listar").mockResolvedValue([conexao("1")]);
    withRouter(<NewMatchWatcher chatPath="/investors/mensagens" />);
    await waitFor(() => expect(localStorage.getItem("vertice.matches.vistos.inv@x.com")).toBe('["1"]'));
    expect(screen.queryByText("Conexão bem-sucedida!")).not.toBeInTheDocument();
  });

  it("conexão nova dispara a animação com o link da conversa", async () => {
    (window as { __reducedMotion?: boolean }).__reducedMotion = true; // pop-up liberado sem esperar a animação
    saveSession({ token: "t", email: "inv@x.com", papel: "INVESTIDOR" });
    localStorage.setItem("vertice.matches.vistos.inv@x.com", '["1"]');
    vi.spyOn(api.conexoes, "listar").mockResolvedValue([conexao("1"), conexao("2")]);
    vi.spyOn(api.perfil, "proprio").mockResolvedValue({ role: "INVESTIDOR", startup: null, investor: null });
    withRouter(<NewMatchWatcher chatPath="/investors/mensagens" />);
    expect(await screen.findByText("Conexão bem-sucedida!")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: /Enviar mensagem/ })).toHaveAttribute("href", "/investors/mensagens?conversa=2");
    expect(JSON.parse(localStorage.getItem("vertice.matches.vistos.inv@x.com")!)).toEqual(["1", "2"]);
  });

  it("startup não consulta conexões no aviso", () => {
    saveSession({ token: "t", email: "st@x.com", papel: "STARTUP" });
    const listar = vi.spyOn(api.conexoes, "listar");
    withRouter(<NewMatchWatcher chatPath="/startups/mensagens" />);
    expect(listar).not.toHaveBeenCalled();
  });
});

/* -------------------------------------------------- animação de match */

describe("animação de match", () => {
  it("mostra as duas partes e fecha com 'Agora não'", async () => {
    (window as { __reducedMotion?: boolean }).__reducedMotion = true;
    saveSession({ token: "t1", email: "st@x.com", papel: "STARTUP" });
    const own: OwnProfile = {
      role: "STARTUP",
      investor: null,
      startup: { name: "Minha Startup", userId: 7, hasPhoto: false } as OwnProfile["startup"],
    };
    vi.spyOn(api.perfil, "proprio").mockResolvedValue(own);
    const onClose = vi.fn();
    render(
      <MatchCelebration contact={{ name: "Juliana", role: "Investidor(a) anjo" }} chatHref="/x" onClose={onClose} />,
    );
    expect(await screen.findByText("Minha Startup")).toBeInTheDocument();
    expect(screen.getByText("Investidor(a) anjo")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: "Agora não" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("pop-up 'Inicie a conversa' fica oculto até a logo se formar", () => {
    render(<MatchCelebration contact={{ name: "J" }} chatHref="/x" onClose={() => undefined} />);
    expect(screen.queryByRole("button", { name: "Agora não" })).not.toBeInTheDocument();
    expect(screen.getByText("Inicie a conversa").closest("[aria-hidden]")).toHaveAttribute("aria-hidden", "true");
  });

  it("brilho da logo suave (pico baixo e halo discreto)", () => {
    render(<MatchCelebration contact={{ name: "J" }} chatHref="/x" onClose={() => undefined} />);
    const css = document.querySelector("style")!.textContent!;
    const pico = Number(/vtx-glow-pulse \{.*?35% \{ opacity: ([\d.]+)/.exec(css)![1]);
    expect(pico).toBeLessThanOrEqual(0.4);
    expect(document.body.innerHTML).toContain("rgba(239,89,72,0.16)");
  });

  it("perfil próprio é buscado de novo depois de trocar de conta (logout + login)", async () => {
    const proprio = vi
      .spyOn(api.perfil, "proprio")
      .mockResolvedValueOnce({ role: "STARTUP", investor: null, startup: { name: "A", userId: 1, hasPhoto: false } as OwnProfile["startup"] })
      .mockResolvedValueOnce({ role: "STARTUP", investor: null, startup: { name: "B", userId: 2, hasPhoto: false } as OwnProfile["startup"] });
    saveSession({ token: "conta-a", email: "a@x.com", papel: "STARTUP" });
    expect((await loadOwnProfile())?.name).toBe("A");
    expect((await loadOwnProfile())?.name).toBe("A");
    saveSession({ token: "conta-b", email: "b@x.com", papel: "STARTUP" });
    expect((await loadOwnProfile())?.name).toBe("B");
    expect(proprio).toHaveBeenCalledTimes(2);
  });
});

/* ------------------------------------------------------ contagem animada */

function Contador({ alvo }: { alvo: number | null }) {
  return <span data-testid="valor">{useCountUp(alvo, 1000)}</span>;
}

describe("métricas animadas", () => {
  it("parte de zero e chega ao valor final", async () => {
    let now = 0;
    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal("cancelAnimationFrame", () => undefined);
    render(<Contador alvo={80} />);
    expect(screen.getByTestId("valor")).toHaveTextContent("0");
    const step = (t: number) => act(() => { now = t; const cb = frames.shift(); cb?.(now); });
    step(0);
    step(300);
    const meio = Number(screen.getByTestId("valor").textContent);
    expect(meio).toBeGreaterThan(0);
    expect(meio).toBeLessThan(80);
    step(1200);
    expect(screen.getByTestId("valor")).toHaveTextContent("80");
  });

  it("com 'reduzir movimento' mostra o valor direto", () => {
    (window as { __reducedMotion?: boolean }).__reducedMotion = true;
    render(<Contador alvo={42} />);
    expect(screen.getByTestId("valor")).toHaveTextContent("42");
  });
});
