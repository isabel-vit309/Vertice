// Aba "Crescimento" da startup: primeira visita (explicação e configuração), envio mensal e painel.
import { useCallback, useEffect, useState } from "react";
import { FiBarChart2, FiCalendar, FiSettings, FiTrendingUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import SSidebar from "../../components/SSidebar";
import { Dialog, PageShell, StatusMessage, cardClass, outlineButton, primaryButton } from "../../components/ProfileUI";
import GrowthDashboard, { Disclaimer } from "../../components/growth/GrowthDashboard";
import { SettingsForm, UpdateForm } from "../../components/growth/GrowthForms";
import { longMonth, recentMonths } from "../../components/growth/catalog";
import { ApiError, api } from "../../services/api";
import type { GrowthDashboard as Dashboard, GrowthMode } from "../../services/api";
import { getSession } from "../../services/session";

function Intro({ onChoose }: { onChoose: (mode: GrowthMode) => void }) {
  return (
    <section className={`${cardClass} p-6 sm:p-8`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF1EE] text-[#EF5948]">
        <FiTrendingUp size={22} aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-[#252525]">Mostre a curva de crescimento da sua startup</h2>
      <ul className="mt-4 grid gap-3 text-xs leading-relaxed text-[#555555] sm:grid-cols-3">
        <li className="flex gap-2.5">
          <FiCalendar className="mt-0.5 shrink-0 text-[#EF5948]" aria-hidden="true" />
          <span><strong className="font-medium text-[#252525]">Atualização mensal.</strong> Uma vez por mês você informa os números do mês que fechou. Leva poucos minutos.</span>
        </li>
        <li className="flex gap-2.5">
          <FiBarChart2 className="mt-0.5 shrink-0 text-[#EF5948]" aria-hidden="true" />
          <span><strong className="font-medium text-[#252525]">Indicadores calculados.</strong> O sistema calcula o resultado operacional e o runway (quantos meses o caixa dura) e monta os gráficos.</span>
        </li>
        <li className="flex gap-2.5">
          <FiTrendingUp className="mt-0.5 shrink-0 text-[#EF5948]" aria-hidden="true" />
          <span><strong className="font-medium text-[#252525]">Visível para investidores.</strong> Investidores acompanham a evolução na aba Crescimento do seu perfil.</span>
        </li>
      </ul>
      <h3 className="mt-8 text-sm font-medium text-[#252525]">Sua startup já tem faturamento?</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={() => onChoose("COM_FATURAMENTO")} className="rounded-lg border border-[#E0E3E6] p-4 text-left transition hover:border-[#EF5948] hover:bg-[#FFF7F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EF5948]">
          <span className="block text-sm font-medium text-[#252525]">Sim, já faturamos</span>
          <span className="mt-1 block text-[11px] leading-relaxed text-[#777777]">Acompanhe receita, custos, despesas, resultado e caixa.</span>
        </button>
        <button type="button" onClick={() => onChoose("SEM_FATURAMENTO")} className="rounded-lg border border-[#E0E3E6] p-4 text-left transition hover:border-[#EF5948] hover:bg-[#FFF7F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EF5948]">
          <span className="block text-sm font-medium text-[#252525]">Ainda não</span>
          <span className="mt-1 block text-[11px] leading-relaxed text-[#777777]">Acompanhe indicadores de tração, um marco (como lançar o MVP) e o fôlego financeiro.</span>
        </button>
      </div>
    </section>
  );
}

export default function SCrescimento() {
  const navigate = useNavigate();
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [onboardingMode, setOnboardingMode] = useState<GrowthMode | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [updateMonth, setUpdateMonth] = useState<string | null>(null);
  const [saved, setSaved] = useState("");

  const handle = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        navigate("/startups/login", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Não foi possível carregar o crescimento.");
    },
    [navigate],
  );

  useEffect(() => {
    if (getSession()?.papel !== "STARTUP") {
      navigate("/startups/login", { replace: true });
      return;
    }
    api.crescimento.meu().then(setData).catch(handle);
  }, [handle, navigate]);

  const defaultMonth = data?.nextMonth ?? recentMonths(2)[1];

  return (
    <PageShell sidebar={<SSidebar />}>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Crescimento</h1>
          <p className="mt-2 text-xs text-[#666666] sm:text-sm">Sua evolução mês a mês, como os investidores veem no seu perfil</p>
        </div>
        {data?.settings && (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setSettingsOpen(true)} className={outlineButton()}>
              <FiSettings aria-hidden="true" /> Configurações
            </button>
            <button type="button" onClick={() => setUpdateMonth(defaultMonth)} className={primaryButton()}>
              <FiCalendar aria-hidden="true" /> Enviar atualização
            </button>
          </div>
        )}
      </header>

      <StatusMessage error={error} success={saved} />
      {!data && !error && <p role="status" className="text-sm text-[#777777]">Carregando...</p>}

      {data && !data.settings && (
        <>
          <Disclaimer />
          {onboardingMode == null ? (
            <Intro onChoose={setOnboardingMode} />
          ) : (
            <section className={`${cardClass} p-6 sm:p-8`}>
              <button type="button" onClick={() => setOnboardingMode(null)} className="mb-4 text-[11px] font-medium text-[#EF5948] hover:underline">
                ← Voltar
              </button>
              <h2 className="mb-5 text-base font-semibold text-[#252525]">
                {onboardingMode === "COM_FATURAMENTO" ? "Como você vai informar a receita?" : "O que você vai acompanhar até faturar?"}
              </h2>
              <SettingsForm
                initial={null}
                fixedMode={onboardingMode}
                submitLabel="Salvar e continuar"
                onSubmit={async (payload) => {
                  const next = await api.crescimento.configurar(payload);
                  setData(next);
                  setSaved("Configuração salva. Agora envie a primeira atualização mensal.");
                  setUpdateMonth(next.nextMonth ?? recentMonths(2)[1]);
                }}
              />
            </section>
          )}
        </>
      )}

      {data?.settings && (
        <>
          {data.pendingMonths.length > 0 && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#F3C9BF] bg-[#FFF7F5] px-4 py-3">
              <p className="text-xs text-[#AF5039]">
                {data.pendingMonths.length === 1 ? (
                  <>A atualização de <strong className="font-semibold">{longMonth(data.pendingMonths[0])}</strong> ainda não foi enviada.</>
                ) : (
                  <>Há {data.pendingMonths.length} meses sem atualização, desde <strong className="font-semibold">{longMonth(data.pendingMonths[0])}</strong>.</>
                )}
              </p>
              <button type="button" onClick={() => setUpdateMonth(data.pendingMonths[0])} className={primaryButton()}>
                Enviar agora
              </button>
            </div>
          )}
          <GrowthDashboard data={data} emptyText="Envie a primeira atualização mensal para montar o seu painel." />
        </>
      )}

      {settingsOpen && data?.settings && (
        <Dialog title="Configurações do crescimento" onClose={() => setSettingsOpen(false)} wide>
          <SettingsForm
            initial={data.settings}
            submitLabel="Salvar configurações"
            onCancel={() => setSettingsOpen(false)}
            onSubmit={async (payload) => {
              setData(await api.crescimento.configurar(payload));
              setSettingsOpen(false);
              setSaved("Configurações salvas.");
            }}
          />
        </Dialog>
      )}

      {updateMonth && data?.settings && (
        <Dialog title="Atualização mensal" onClose={() => setUpdateMonth(null)} wide>
          <UpdateForm
            settings={data.settings}
            updates={data.updates}
            initialMonth={updateMonth}
            onCancel={() => setUpdateMonth(null)}
            onSubmit={async (month, payload) => {
              setData(await api.crescimento.atualizar(month, payload));
              setUpdateMonth(null);
              setSaved(`Atualização de ${longMonth(month)} salva.`);
            }}
          />
        </Dialog>
      )}
    </PageShell>
  );
}
