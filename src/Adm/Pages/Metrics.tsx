import { FiBarChart2, FiGrid, FiMessageSquare, FiUsers } from "react-icons/fi";

import AdminShell from "./AdminShell";

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

export default function MetricsPage() {
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

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Startups cadastradas" value="128" detail="+12% neste mês" icon={FiGrid} />
          <MetricCard label="Investidores e mentores" value="74" detail="+8% neste mês" icon={FiUsers} />
          <MetricCard label="Matches realizados" value="312" detail="46 nesta semana" icon={FiMessageSquare} />
          <MetricCard label="Conversas iniciadas" value="198" detail="64% dos matches" icon={FiBarChart2} />
        </section>

        <section className="mt-7 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-[0_2px_3px_rgba(0,0,0,0.08)] sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Engajamento do ecossistema</h2>
              <p className="mt-1 text-xs text-[#808080]">
                Indicadores de interação entre startups e investidores.
              </p>
            </div>
            <FiBarChart2 className="text-[#EF5948]" />
          </div>
          <div className="mt-6 space-y-5">
            {[
              ["Matches com interação", "78%", "bg-[#EF5948]"],
              ["Conversas iniciadas", "64%", "bg-[#F59B8E]"],
              ["Reuniões agendadas", "42%", "bg-[#F7C7BE]"],
            ].map(([label, value, color]) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-xs">
                  <span>{label}</span>
                  <span className="text-[#777777]">{value}</span>
                </div>
                <div className="h-2 rounded-full bg-[#F2F2F2]">
                  <div className={`h-2 rounded-full ${color}`} style={{ width: value }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
