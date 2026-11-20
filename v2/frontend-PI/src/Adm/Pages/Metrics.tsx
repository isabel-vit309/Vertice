import { useEffect, useState } from "react";
import { FiBarChart2, FiGrid, FiMessageSquare, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import AdminShell from "./AdminShell";
import { ApiError, api } from "../../services/api";
import type { MetricasAdmin } from "../../services/api";
import { useCountUp } from "../../components/motion";

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  /** Número exibido com contagem a partir de zero; undefined enquanto carrega. */
  value: number | undefined;
  detail: string;
  icon: typeof FiUsers;
}) {
  const shown = useCountUp(value, 900);
  return (
    <article className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_3px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-[#707070]">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF1EE] text-[#EF5948]">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tabular-nums tracking-tight">{value === undefined ? "—" : shown}</p>
      <p className="mt-1 text-xs text-[#808080]">{detail}</p>
    </article>
  );
}

const barColors = ["bg-[#EF5948]", "bg-[#F59B8E]", "bg-[#F7C7BE]"];

/** Barra de engajamento: ao abrir a página, sai de 0% e cresce até o percentual real. */
function EngagementBar({ label, percent, index }: { label: string; percent: number; index: number }) {
  // Pequeno escalonamento entre as barras para a leitura acompanhar o movimento.
  const shown = useCountUp(percent, 1200, index * 120);
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs">
        <span>{label}</span>
        <span className="tabular-nums text-[#777777]">{shown}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[#F2F2F2]"
        role="progressbar"
        aria-label={label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={`h-2 rounded-full ${barColors[index % barColors.length]}`} style={{ width: `${shown}%` }} />
      </div>
    </div>
  );
}

export default function MetricsPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<MetricasAdmin | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.admin
      .metricas()
      .then(setMetrics)
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          navigate("/adm/login", { replace: true });
          return;
        }
        setError(err instanceof Error ? err.message : "Não foi possível carregar as métricas.");
      });
  }, [navigate]);


  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-7 lg:px-9">
        <header className="mb-7">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#EF5948]">
            Painel administrativo
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Métricas do sistema
          </h1>
          <p className="mt-2 text-sm text-[#6F6F6F]">
            Acompanhe os principais indicadores da plataforma.
          </p>
        </header>

        {error && (
          <p role="alert" className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Startups aprovadas"
            value={metrics?.startupsAprovadas}
            detail={
              metrics
                ? `${metrics.startups} cadastradas · ${metrics.startupsNoMes} neste mês`
                : "Carregando..."
            }
            icon={FiGrid}
          />
          <MetricCard
            label="Investidores e mentores aprovados"
            value={metrics?.investidoresAprovados}
            detail={
              metrics
                ? `${metrics.investidores} cadastrados · ${metrics.investidoresNoMes} neste mês`
                : "Carregando..."
            }
            icon={FiUsers}
          />
          <MetricCard
            label="Matches realizados"
            value={metrics?.matches}
            detail={
              metrics
                ? `${metrics.pedidosConexao} pedidos de conexão · ${metrics.pedidosPendentes} aguardando · ${metrics.matchesComIa} com IA`
                : "Carregando..."
            }
            icon={FiMessageSquare}
          />
          <MetricCard
            label="Conversas iniciadas"
            value={metrics?.conversas}
            detail={metrics ? `${metrics.mensagens} mensagens trocadas` : "Carregando..."}
            icon={FiBarChart2}
          />
        </section>

        <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Reuniões agendadas"
            value={metrics?.reunioesAceitas}
            detail={
              metrics
                ? `${metrics.reunioes} convites · ${metrics.reunioesAguardando} aguardando resposta`
                : "Carregando..."
            }
            icon={FiBarChart2}
          />
          <MetricCard
            label="Avaliações pós-interação"
            value={metrics?.avaliacoes}
            detail={
              metrics?.notaMedia != null
                ? `Nota média ${metrics.notaMedia.toFixed(1).replace(".", ",")} de 5`
                : metrics
                  ? "Ainda sem avaliações"
                  : "Carregando..."
            }
            icon={FiUsers}
          />
        </section>

        <section className="mt-7 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_3px_rgba(0,0,0,0.08)] sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Engajamento do ecossistema</h2>
              <p className="mt-1 text-xs text-[#808080]">
                Indicadores de interação entre startups e investidores.
                {metrics && ` ${metrics.matchesComReuniao} de ${metrics.matches} matches já têm reunião confirmada.`}
              </p>
            </div>
            <FiBarChart2 className="text-[#EF5948]" />
          </div>
          <div className="mt-6 space-y-5">
            {!metrics && !error && (
              <p role="status" className="text-sm text-[#777777]">Carregando...</p>
            )}
            {metrics?.engajamento.map(({ rotulo, percentual }, index) => (
              <EngagementBar key={rotulo} label={rotulo} percent={percentual} index={index} />
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
