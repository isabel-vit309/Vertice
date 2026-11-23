// Regressão: outra conta logada em outra aba do mesmo navegador.
// Antes: a edição de perfil recebia "Acesso não permitido" (ou alterava o perfil da outra conta)
// e o aviso de match comemorava conexões de outra pessoa ("matchings falsos").
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import SessionGuard from "../components/SessionGuard";
import NewMatchWatcher from "../components/NewMatchWatcher";
import MatchDeck from "../components/MatchDeck";
import { Dialog } from "../components/ProfileUI";
import { esquecerPerfilProprio, loadOwnProfile } from "../components/MatchCelebration";
import { ApiError, MENSAGEM_OUTRA_ABA, api } from "../services/api";
import { clearSession, saveSession, sessaoTrocadaEmOutraAba } from "../services/session";

const investidora = { token: "token-juliana", email: "juliana@x.com", papel: "INVESTIDOR" as const };
const startup = { token: "token-mamacare", email: "mamacare@x.com", papel: "STARTUP" as const };

/** Simula outra aba gravando no localStorage compartilhado (e o evento que o navegador dispara). */
function outraAbaEntraCom(sessao: typeof startup | null) {
  const antigo = localStorage.getItem("vertice.session");
  const novo = sessao ? JSON.stringify(sessao) : null;
  if (novo) localStorage.setItem("vertice.session", novo);
  else localStorage.removeItem("vertice.session");
  window.dispatchEvent(new StorageEvent("storage", { key: "vertice.session", oldValue: antigo, newValue: novo }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  clearSession();
});

describe("sessão por aba", () => {
  it("bloqueia requisições quando outra aba entra com outra conta (não envia o token alheio)", async () => {
    saveSession(investidora);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    outraAbaEntraCom(startup);

    expect(sessaoTrocadaEmOutraAba()).toBe(true);
    const erro = await api.perfil
      .editarInvestidor({ name: "Juliana", segments: ["Fintech", "Agritech"] } as never)
      .catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(ApiError);
    expect((erro as ApiError).message).toBe(MENSAGEM_OUTRA_ABA);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("também bloqueia quando a outra aba sai da conta", async () => {
    saveSession(investidora);
    vi.stubGlobal("fetch", vi.fn());
    outraAbaEntraCom(null);
    await expect(api.conexoes.listar()).rejects.toMatchObject({ status: 409 });
  });

  it("login e logout feitos na própria aba continuam funcionando", async () => {
    saveSession(investidora);
    saveSession(startup); // entrou com outra conta nesta mesma aba
    expect(sessaoTrocadaEmOutraAba()).toBe(false);
    const fetchMock = vi.fn().mockResolvedValue(new Response("[]", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await api.conexoes.listar();
    expect((fetchMock.mock.calls[0][1].headers as Headers).get("Authorization")).toBe("Bearer token-mamacare");
  });

  it("mostra o aviso e oferece atualizar a aba", async () => {
    saveSession(investidora);
    render(<SessionGuard />);
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    act(() => outraAbaEntraCom(startup));
    expect(await screen.findByRole("alertdialog", { name: "Sessão alterada em outra aba" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Atualizar esta aba" })).toBeInTheDocument();
  });
});

describe("matchings falsos", () => {
  it("o aviso de match não comemora conexões de outra conta logada em outra aba", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    saveSession(investidora);
    localStorage.setItem("vertice.matches.vistos.juliana@x.com", '["31"]');
    const conexao = (id: string, nome: string) => ({ id, name: nome, userId: 9, hasPhoto: false, type: "Startup" });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([conexao("31", "CrediFeira")]), { status: 200 }))
      // se a requisição saísse com o token da outra conta, viriam as conexões dela (ex.: id 14)
      .mockResolvedValue(new Response(JSON.stringify([conexao("14", "Larissa Monteiro")]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(
      <MemoryRouter>
        <NewMatchWatcher chatPath="/investors/mensagens" />
      </MemoryRouter>,
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    // outra aba entra com OUTRA conta de investidor depois que esta página carregou
    outraAbaEntraCom({ ...investidora, token: "token-outro-investidor", email: "outro@x.com" } as never);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(16_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1); // a consulta seguinte foi bloqueada antes de sair
    expect(screen.queryByText("Conexão bem-sucedida!")).not.toBeInTheDocument();
    expect(localStorage.getItem("vertice.matches.vistos.juliana@x.com")).toBe('["31"]');
  });

  it("a animação usa o perfil atualizado depois de uma edição", async () => {
    saveSession(investidora);
    const proprio = vi
      .spyOn(api.perfil, "proprio")
      .mockResolvedValueOnce({ role: "INVESTIDOR", startup: null, investor: { name: "Nome antigo", userId: 1, hasPhoto: false, type: "INVESTIDOR" } as never })
      .mockResolvedValueOnce({ role: "INVESTIDOR", startup: null, investor: { name: "Nome novo", userId: 1, hasPhoto: true, type: "INVESTIDOR" } as never });
    expect((await loadOwnProfile())?.name).toBe("Nome antigo");
    esquecerPerfilProprio();
    expect((await loadOwnProfile())?.name).toBe("Nome novo");
    expect(proprio).toHaveBeenCalledTimes(2);
  });
});

describe("edição de perfil", () => {
  it("Esc na lista de segmentos fecha só a lista, não a janela", () => {
    const onClose = vi.fn();
    render(
      <Dialog title="Editar meu perfil" onClose={onClose}>
        <input aria-label="Segmentos" onKeyDown={(e) => e.key === "Escape" && e.preventDefault()} />
      </Dialog>,
    );
    fireEvent.keyDown(screen.getByLabelText("Segmentos"), { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("carrossel do matching", () => {
  it("não mostra os pontos com a quantidade de perfis, mas continua navegando", () => {
    const itens = ["1", "2", "3"].map((id) => ({
      id, name: `Startup ${id}`, role: "", tags: [], description: "", location: "", ticket: "", badge: "",
    }));
    render(
      <MatchDeck sidebar={null} title="Matching" subtitle="" items={itens} acceptLabel="Solicitar" rejectLabel="Passar"
        acceptedMessage={() => ""} rejectedMessage={() => ""} emptyTitle="" emptyText="" hint="" onDecision={vi.fn()} />,
    );
    expect(screen.queryByRole("button", { name: /^Ver Startup/ })).not.toBeInTheDocument();
    expect(document.querySelectorAll("[aria-current]")).toHaveLength(0);
    fireEvent.click(screen.getAllByRole("button", { name: "Próximo" })[0]);
    expect(document.querySelector('article[aria-hidden="false"] h2')?.textContent).toBe("Startup 2");
  });
});
