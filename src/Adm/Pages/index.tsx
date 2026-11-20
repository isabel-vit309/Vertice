import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiGrid,
  FiMessageSquare,
  FiUsers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import AdminShell from "./AdminShell";
import Combobox from "../../components/Combobox";
import { ApiError, api, formatarData } from "../../services/api";
import type { CadastroAdmin, MetricasAdmin, StatusCadastro } from "../../services/api";

type ReviewStatus = "pending" | "approved" | "rejected" | "suspended";
type ReviewRecord = {
  id: number;
  type: CadastroAdmin["tipo"];
  name: string;
  owner: string;
  email: string;
  submittedAt: string;
  status: ReviewStatus;
};

const statusFromApi: Record<StatusCadastro, ReviewStatus> = {
  PENDENTE: "pending",
  APROVADO: "approved",
  REJEITADO: "rejected",
  SUSPENSO: "suspended",
};

function toRecord(item: CadastroAdmin): ReviewRecord {
  return {
    id: item.id,
    type: item.tipo,
    name: item.nome,
    owner: item.responsavel,
    email: item.email,
    submittedAt: formatarData(item.enviadoEm),
    status: statusFromApi[item.status],
  };
}

const filterOptions = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovados" },
  { value: "rejected", label: "Rejeitados" },
  { value: "suspended", label: "Suspensos" },
];

function StatusBadge({ status }: { status: ReviewStatus }) {
  const labels = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
    suspended: "Suspenso",
  };
  const colors = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
    suspended: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${colors[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof FiUsers;
}) {
  return (
    <article className="rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_3px_rgba(0,0,0,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-[#707070]">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF1EE] text-[#EF5948]">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-[#808080]">{detail}</p>
    </article>
  );
}

export default function AdmPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ReviewRecord[]>([]);
  const [metrics, setMetrics] = useState<MetricasAdmin | null>(null);
  const [filter, setFilter] = useState<"all" | ReviewStatus>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        navigate("/adm/login", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Não foi possível carregar os dados.");
    },
    [navigate],
  );

  const load = useCallback(async () => {
    try {
      const [cadastros, metricas] = await Promise.all([
        api.admin.listarCadastros(),
        api.admin.metricas(),
      ]);
      setRecords(cadastros.map(toRecord));
      setMetrics(metricas);
      setError("");
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesStatus = filter === "all" || record.status === filter;
      const matchesSearch =
        !term ||
        `${record.name} ${record.owner} ${record.type} ${record.email}`
          .toLowerCase()
          .includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [filter, records, search]);

  async function moderate(record: ReviewRecord, status: "approved" | "rejected") {
    setBusyId(record.id);
    setError("");
    try {
      const updated = await api.admin.moderar(
        record.id,
        status === "approved" ? "aprovar" : "rejeitar",
      );
      // A auditoria é registrada pelo backend.
      setRecords((current) =>
        current.map((item) => (item.id === record.id ? toRecord(updated) : item)),
      );
      setMetrics(await api.admin.metricas());
    } catch (err) {
      handleError(err);
    } finally {
      setBusyId(null);
    }
  }

  const pending = records.filter((record) => record.status === "pending").length;

  return (
    <AdminShell>
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-7 lg:px-9">
        <header id="visao-geral" className="mb-7">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#EF5948]">
            Painel administrativo
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Visão geral
          </h1>
          <p className="mt-2 text-sm text-[#6F6F6F]">
            Acompanhe os cadastros e mantenha a plataforma em conformidade.
          </p>
        </header>

        <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Startups aprovadas"
            value={metrics ? String(metrics.startupsAprovadas) : "—"}
            detail={metrics ? `${metrics.startups} cadastradas · ${metrics.startupsNoMes} neste mês` : "Carregando..."}
            icon={FiGrid}
          />
          <MetricCard
            label="Investidores e mentores aprovados"
            value={metrics ? String(metrics.investidoresAprovados) : "—"}
            detail={metrics ? `${metrics.investidores} cadastrados · ${metrics.investidoresNoMes} neste mês` : "Carregando..."}
            icon={FiUsers}
          />
          <MetricCard
            label="Matches realizados"
            value={metrics ? String(metrics.matches) : "—"}
            detail={
              metrics ? `${metrics.pedidosPendentes} pedido(s) aguardando resposta` : "Carregando..."
            }
            icon={FiMessageSquare}
          />
          <MetricCard
            label="Pendências"
            value={loading ? "—" : String(pending)}
            detail="Aguardando moderação"
            icon={FiAlertCircle}
          />
        </section>

        <section className="rounded-xl border border-[#E5E7EB] bg-white shadow-[0_2px_3px_rgba(0,0,0,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ECECEC] px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-semibold">
                Moderação de cadastros e conteúdo
              </h2>
              <p className="mt-1 text-xs text-[#808080]">
                Aprove ou rejeite itens antes que sejam publicados.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                aria-label="Buscar cadastros"
                placeholder="Buscar..."
                className="h-9 rounded-lg border border-[#D8D8D8] px-3 text-xs outline-none focus:border-[#EF5948]"
              />
              <div className="w-[150px]">
                <Combobox
                  aria-label="Filtrar por status"
                  value={filter}
                  options={filterOptions}
                  onChange={(value) => setFilter((value || "all") as typeof filter)}
                  className="h-9 w-full rounded-lg border border-[#D8D8D8] px-3 text-xs outline-none focus:border-[#EF5948]"
                />
              </div>
            </div>
          </div>
          {error && (
            <p role="alert" className="mx-5 mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 sm:mx-6">
              {error}
            </p>
          )}
          <div className="divide-y divide-[#ECECEC]">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6"
              >
                <div className="flex min-w-[180px] flex-1 items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FFF1EE] text-xs font-semibold text-[#EF5948]">
                    {record.type[0]}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{record.name}</p>
                    <p className="text-xs text-[#858585]">
                      {record.type} · {record.owner} · {record.email} · {record.submittedAt}
                    </p>
                  </div>
                </div>
                <StatusBadge status={record.status} />
                {record.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={busyId === record.id}
                      onClick={() => moderate(record, "rejected")}
                      className="rounded-lg border border-[#EF5948] px-3 py-2 text-xs font-medium text-[#EF5948] hover:bg-[#FFF1EE]"
                    >
                      Rejeitar
                    </button>
                    <button
                      type="button"
                      disabled={busyId === record.id}
                      onClick={() => moderate(record, "approved")}
                      className="flex items-center gap-1 rounded-lg bg-[#EF5948] px-3 py-2 text-xs font-medium text-white hover:bg-[#DA4939]"
                    >
                      <FiCheck /> Aprovar
                    </button>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <p role="status" className="px-6 py-8 text-center text-sm text-[#777777]">
                Carregando cadastros...
              </p>
            )}
            {!loading && filteredRecords.length === 0 && (
              <p className="px-6 py-8 text-center text-sm text-[#777777]">
                Nenhum item encontrado.
              </p>
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
