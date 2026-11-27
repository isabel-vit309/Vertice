// Aba "Crescimento": primeira visita, configuração, envio mensal, painel e aba no perfil visto pelo investidor.
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import SSidebar from "../components/SSidebar";
import SCrescimento from "../Startups/Pages/SCrescimento";
import StartupPerfil from "../Investors/Pages/StartupPerfil";
import { api } from "../services/api";
import type { GrowthDashboard, MonthlyUpdate, StartupProfile } from "../services/api";
import { saveSession } from "../services/session";

const vazio: GrowthDashboard = { startupId: 5, startupName: "CuraMed", owner: true, settings: null, updates: [], nextMonth: null, pendingMonths: [] };

const mes = (month: string, extra: Partial<MonthlyUpdate>): MonthlyUpdate => ({
  month, mode: "COM_FATURAMENTO", revenueCriterion: "RECEBIDA", revenue: null, directCosts: null, operatingExpenses: null,
  grossProfit: null, grossMarginPercent: null, revenueGrowthPercent: null, expenses: null, operatingResult: 0, burn: 0,
  cash: 0, runwayMonths: null, newFunding: false, fundingAmount: null, newDebt: false, debtAmount: null, indicators: null,
  milestone: null, milestoneStatus: null, milestoneProgress: null, comment: null, submittedAt: "2026-11-01T10:00:00", editedAt: null,
  ...extra,
});

const comFaturamento: GrowthDashboard = {
  ...vazio,
  settings: { mode: "COM_FATURAMENTO", revenueCriterion: "RECEBIDA", businessModel: null, indicators: [], milestone: null, milestoneDeadline: null, updatedAt: "2026-11-01T10:00:00" },
  updates: [
    mes("2026-09", { revenue: 40000, directCosts: 10000, operatingExpenses: 45000, operatingResult: -15000, burn: 15000, cash: 300000, runwayMonths: 20 }),
    mes("2026-10", { revenue: 50000, directCosts: 12000, operatingExpenses: 48000, grossProfit: 38000, grossMarginPercent: 76, revenueGrowthPercent: 25,
      operatingResult: -10000, burn: 10000, cash: 290000, runwayMonths: 29, newFunding: true, fundingAmount: 500000, comment: "Fechamos dois contratos" }),
  ],
};

function renderStartup() {
  saveSession({ token: "t", email: "curamed@x.com", papel: "STARTUP" });
  return render(
    <MemoryRouter initialEntries={["/startups/crescimento"]}>
      <Routes>
        <Route path="/startups/crescimento" element={<SCrescimento />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.spyOn(api.conexoes, "listar").mockResolvedValue([]);
});
afterEach(() => vi.restoreAllMocks());

describe("primeira visita da startup", () => {
  it("explica a atualização mensal, avisa que os dados não são verificados e pergunta sobre faturamento", async () => {
    vi.spyOn(api.crescimento, "meu").mockResolvedValue(vazio);
    renderStartup();
    expect(await screen.findByText(/Atualização mensal\./)).toBeInTheDocument();
    expect(screen.getByRole("note")).toHaveTextContent("não audita nem verifica");
    expect(screen.getByRole("heading", { name: "Sua startup já tem faturamento?" })).toBeInTheDocument();
  });

  it("com faturamento: exige o critério de receita e salva", async () => {
    vi.spyOn(api.crescimento, "meu").mockResolvedValue(vazio);
    const configurar = vi.spyOn(api.crescimento, "configurar").mockResolvedValue({ ...comFaturamento, updates: [], nextMonth: "2026-10" });
    renderStartup();
    fireEvent.click(await screen.findByRole("button", { name: /Sim, já faturamos/ }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar e continuar" }));
    expect(await screen.findByText("Escolha o critério de receita.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Receita recebida/ }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar e continuar" }));
    await waitFor(() => expect(configurar).toHaveBeenCalledWith({ mode: "COM_FATURAMENTO", revenueCriterion: "RECEBIDA" }));
    // em seguida abre o envio da primeira atualização
    expect(await screen.findByRole("dialog", { name: "Atualização mensal" })).toBeInTheDocument();
  });

  it("sem faturamento: modelo, 2 a 3 indicadores e um marco", async () => {
    vi.spyOn(api.crescimento, "meu").mockResolvedValue(vazio);
    const configurar = vi.spyOn(api.crescimento, "configurar").mockResolvedValue(vazio);
    renderStartup();
    fireEvent.click(await screen.findByRole("button", { name: /Ainda não/ }));
    fireEvent.click(screen.getByRole("radio", { name: /B2B Vende para empresas/ }));
    const grupo = screen.getByRole("group", { name: "Indicadores de tração" });
    fireEvent.click(within(grupo).getByRole("button", { name: "Pilotos ativos" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar e continuar" }));
    expect(await screen.findByText("Escolha de dois a três indicadores de tração.")).toBeInTheDocument();

    fireEvent.click(within(grupo).getByRole("button", { name: "Cartas de intenção (LOIs)" }));
    fireEvent.click(within(grupo).getByRole("button", { name: "Empresas em negociação" }));
    // o quarto fica bloqueado
    expect(within(grupo).getByRole("button", { name: "Usuários ativos nos pilotos" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Marco"), { target: { value: "Lançar o MVP" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar e continuar" }));
    await waitFor(() =>
      expect(configurar).toHaveBeenCalledWith({
        mode: "SEM_FATURAMENTO", businessModel: "B2B",
        indicators: ["Pilotos ativos", "Cartas de intenção (LOIs)", "Empresas em negociação"],
        milestone: "Lançar o MVP", milestoneDeadline: null,
      }),
    );
  });
});

describe("painel e envio mensal", () => {
  it("mostra a evolução financeira, os indicadores calculados e o histórico", async () => {
    vi.spyOn(api.crescimento, "meu").mockResolvedValue(comFaturamento);
    renderStartup();
    expect(await screen.findByText("Receita e resultado operacional")).toBeInTheDocument();
    expect(screen.getByText("+25% vs. mês anterior")).toBeInTheDocument();
    expect(screen.getAllByText("29 meses").length).toBeGreaterThan(0); // cartão e histórico
    expect(screen.getByText("76%")).toBeInTheDocument();
    const tabela = screen.getByRole("table");
    expect(within(tabela).getAllByRole("row")).toHaveLength(3);
    expect(within(tabela).getByText("Fechamos dois contratos")).toBeInTheDocument();
    expect(within(tabela).getByText(/Captação R\$/)).toBeInTheDocument();
  });

  it("envia o mês com os valores e mostra a prévia do resultado e do runway", async () => {
    vi.spyOn(api.crescimento, "meu").mockResolvedValue({ ...comFaturamento, nextMonth: "2026-11", pendingMonths: [] });
    const atualizar = vi.spyOn(api.crescimento, "atualizar").mockResolvedValue(comFaturamento);
    renderStartup();
    fireEvent.click(await screen.findByRole("button", { name: /Enviar atualização/ }));
    const dialogo = screen.getByRole("dialog", { name: "Atualização mensal" });
    fireEvent.change(within(dialogo).getByLabelText("Mês de referência"), { target: { value: "2026-11" } });
    fireEvent.change(within(dialogo).getByLabelText(/Receita \(receita recebida\)/), { target: { value: "6000000" } });
    fireEvent.change(within(dialogo).getByLabelText("Custos diretos"), { target: { value: "1000000" } });
    fireEvent.change(within(dialogo).getByLabelText("Despesas operacionais"), { target: { value: "7000000" } });
    fireEvent.change(within(dialogo).getByLabelText("Caixa disponível no fim do mês"), { target: { value: "28000000" } });
    expect(within(dialogo).getByText("14 meses")).toBeInTheDocument(); // 280 mil / 20 mil de queima
    fireEvent.click(within(dialogo).getByRole("button", { name: "Enviar atualização" }));
    await waitFor(() =>
      expect(atualizar).toHaveBeenCalledWith("2026-11", expect.objectContaining({
        revenue: 60000, directCosts: 10000, operatingExpenses: 70000, cash: 280000, newFunding: false, newDebt: false,
      })),
    );
  });

  it("avisa o mês pendente", async () => {
    vi.spyOn(api.crescimento, "meu").mockResolvedValue({ ...comFaturamento, nextMonth: "2026-10", pendingMonths: ["2026-10"] });
    renderStartup();
    expect(await screen.findByText(/ainda não foi enviada/)).toHaveTextContent("outubro de 2026");
  });

  it("nas configurações dá para passar de sem faturamento para com faturamento", async () => {
    const semFaturamento: GrowthDashboard = {
      ...vazio,
      settings: { mode: "SEM_FATURAMENTO", revenueCriterion: null, businessModel: "B2B", indicators: ["Pilotos ativos", "LOIs"], milestone: "Lançar o MVP", milestoneDeadline: null, updatedAt: "2026-11-01T10:00:00" },
    };
    vi.spyOn(api.crescimento, "meu").mockResolvedValue(semFaturamento);
    const configurar = vi.spyOn(api.crescimento, "configurar").mockResolvedValue(comFaturamento);
    renderStartup();
    fireEvent.click(await screen.findByRole("button", { name: /Configurações/ }));
    fireEvent.click(screen.getByRole("radio", { name: /Com faturamento/ }));
    expect(screen.getByText(/passa a mostrar a evolução financeira/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: /Receita faturada/ }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar configurações" }));
    await waitFor(() => expect(configurar).toHaveBeenCalledWith({ mode: "COM_FATURAMENTO", revenueCriterion: "FATURADA" }));
  });
});

describe("investidor e menu", () => {
  it("o investidor abre a aba Crescimento no perfil da startup", async () => {
    saveSession({ token: "t", email: "inv@x.com", papel: "INVESTIDOR" });
    vi.spyOn(api.perfil, "startup").mockResolvedValue({ id: 5, userId: 9, name: "CuraMed", segment: "Saúde", stage: "MVP", hasPhoto: false } as unknown as StartupProfile);
    const daStartup = vi.spyOn(api.crescimento, "daStartup").mockResolvedValue({ ...comFaturamento, owner: false });
    render(
      <MemoryRouter initialEntries={["/investors/startups/5"]}>
        <Routes>
          <Route path="/investors/startups/:id" element={<StartupPerfil />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole("tab", { name: "Crescimento" }));
    expect(await screen.findByText("Receita e resultado operacional")).toBeInTheDocument();
    expect(daStartup).toHaveBeenCalledWith("5");
    expect(screen.getByRole("note")).toHaveTextContent("Dados não verificados");
    expect(screen.queryByRole("button", { name: /Enviar atualização/ })).not.toBeInTheDocument();
  });

  it("Crescimento fica no menu da startup, com Comunidades ainda por último", () => {
    saveSession({ token: "t", email: "st@x.com", papel: "STARTUP" });
    render(<MemoryRouter><SSidebar /></MemoryRouter>);
    const links = within(screen.getByRole("navigation", { name: "Menu principal" })).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual(["Perfil", "Matching", "Mensagens", "Reuniões", "Conexões", "Crescimento", "Comunidades"]);
  });
});
