import { useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiGrid,
  FiMessageSquare,
  FiUsers,
} from "react-icons/fi";

import AdminShell from "./AdminShell";
import { addAuditRecord } from "./adminData";

type ReviewStatus = "pending" | "approved" | "rejected";
type ReviewRecord = {
  id: number;
  type: "Startup" | "Investidor" | "Conteúdo";
  name: string;
  owner: string;
  submittedAt: string;
  status: ReviewStatus;
};

const initialRecords: ReviewRecord[] = [
  {
    id: 1,
    type: "Startup",
    name: "NexaHub",
    owner: "Marina Costa",
    submittedAt: "Hoje, 09:42",
    status: "pending",
  },
  {
    id: 2,
    type: "Investidor",
    name: "Isabel Alves",
    owner: "Isabel Alves",
    submittedAt: "Hoje, 08:17",
    status: "pending",
  },
  {
    id: 3,
    type: "Startup",
    name: "Lumora",
    owner: "Rafael Lima",
    submittedAt: "Ontem, 16:31",
    status: "pending",
  },
  {
    id: 4,
    type: "Conteúdo",
    name: "Pitch deck Verdi",
    owner: "Verdi",
    submittedAt: "Ontem, 14:08",
    status: "pending",
  },
];

function StatusBadge({ status }: { status: ReviewStatus }) {
  const labels = {
    pending: "Pendente",
    approved: "Aprovado",
    rejected: "Rejeitado",
  };
  const colors = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-red-50 text-red-700",
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
  const [records, setRecords] = useState(initialRecords);
  const [filter, setFilter] = useState<"all" | ReviewStatus>("all");
  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((record) => {
      const matchesStatus = filter === "all" || record.status === filter;
      const matchesSearch =
        !term ||
        `${record.name} ${record.owner} ${record.type}`
          .toLowerCase()
          .includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [filter, records, search]);

  function moderate(
    record: ReviewRecord,
    status: Exclude<ReviewStatus, "pending">,
  ) {
    setRecords((current) =>
      current.map((item) =>
        item.id === record.id ? { ...item, status } : item,
      ),
    );
    addAuditRecord({
      id: Date.now(),
      action:
        status === "approved" ? "Cadastro aprovado" : "Cadastro rejeitado",
      target: record.name,
      actor: "admin@vertice.com",
      date: "Agora",
    });
  }

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
            label="Startups cadastradas"
            value="128"
            detail="+12% neste mês"
            icon={FiGrid}
          />
          <MetricCard
            label="Investidores e mentores"
            value="74"
            detail="+8% neste mês"
            icon={FiUsers}
          />
          <MetricCard
            label="Matches realizados"
            value="312"
            detail="46 nesta semana"
            icon={FiMessageSquare}
          />
          <MetricCard
            label="Pendências"
            value={String(
              records.filter((record) => record.status === "pending").length,
            )}
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
                placeholder="Buscar..."
                className="h-9 rounded-lg border border-[#D8D8D8] px-3 text-xs outline-none focus:border-[#EF5948]"
              />
              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.currentTarget.value as typeof filter)
                }
                className="h-9 rounded-lg border border-[#D8D8D8] px-3 text-xs outline-none focus:border-[#EF5948]"
              >
                <option value="all">Todos</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovados</option>
                <option value="rejected">Rejeitados</option>
              </select>
            </div>
          </div>
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
                      {record.type} · {record.owner} · {record.submittedAt}
                    </p>
                  </div>
                </div>
                <StatusBadge status={record.status} />
                {record.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => moderate(record, "rejected")}
                      className="rounded-lg border border-[#EF5948] px-3 py-2 text-xs font-medium text-[#EF5948] hover:bg-[#FFF1EE]"
                    >
                      Rejeitar
                    </button>
                    <button
                      type="button"
                      onClick={() => moderate(record, "approved")}
                      className="flex items-center gap-1 rounded-lg bg-[#EF5948] px-3 py-2 text-xs font-medium text-white hover:bg-[#DA4939]"
                    >
                      <FiCheck /> Aprovar
                    </button>
                  </div>
                )}
              </div>
            ))}
            {filteredRecords.length === 0 && (
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
