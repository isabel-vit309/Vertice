// Painel de crescimento (somente leitura), igual para a startup e para o investidor:
// startups com faturamento mostram a evolução financeira; sem faturamento, tração, marco e fôlego.
import type { ReactNode } from "react";
import { FiArrowDownRight, FiArrowUpRight, FiInfo } from "react-icons/fi";

import { cardClass } from "../ProfileUI";
import LineChart from "./LineChart";
import type { ChartSeries } from "./LineChart";
import {
  GROWTH_DISCLAIMER,
  criterionLabels,
  longMonth,
  longMonthTitle,
  milestoneStatusLabels,
  money,
  moneyCompact,
  number,
  numberCompact,
  percent,
  runway,
  shortMonth,
} from "./catalog";
import type { GrowthDashboard as Dashboard, MonthlyUpdate } from "../../services/api";

const ACCENT = "#EF5948";
const SECOND = "#2D5DB8";

export function Disclaimer() {
  return (
    <p role="note" className="mb-5 flex items-start gap-2.5 rounded-lg border border-[#E6E1D3] bg-[#FBF8EF] px-4 py-3 text-[11px] leading-relaxed text-[#5C5440]">
      <FiInfo size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
      <span>
        <strong className="font-semibold">Dados não verificados.</strong> {GROWTH_DISCLAIMER}
      </span>
    </p>
  );
}

function Tile({ label, value, detail, delta }: { label: string; value: string; detail?: ReactNode; delta?: { text: string; good: boolean | null; up: boolean } }) {
  return (
    <article className={`${cardClass} p-4`}>
      <p className="text-[11px] text-[#777777]">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold tabular-nums tracking-tight text-[#222222]">{value}</p>
      {delta && (
        <p
          className={`mt-1 flex items-center gap-1 text-[10px] font-medium ${
            delta.good == null ? "text-[#777777]" : delta.good ? "text-[#1D7A55]" : "text-[#B42318]"
          }`}
        >
          {delta.up ? <FiArrowUpRight aria-hidden="true" /> : <FiArrowDownRight aria-hidden="true" />}
          {delta.text}
        </p>
      )}
      {detail && <p className="mt-1 text-[10px] leading-relaxed text-[#888888]">{detail}</p>}
    </article>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className={`${cardClass} min-w-0 p-5`}>
      <h3 className="text-sm font-medium text-[#252525]">{title}</h3>
      {subtitle && <p className="mt-0.5 text-[10px] text-[#888888]">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Medidor do marco: preenchimento na cor de destaque sobre uma trilha clara da mesma cor. */
export function MilestoneMeter({ progress, label }: { progress: number; label: string }) {
  return (
    <div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#FBE0DB]" role="progressbar" aria-label={label} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-[#EF5948] transition-[width] duration-700" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function Events({ update }: { update: MonthlyUpdate }) {
  if (!update.newFunding && !update.newDebt) return <span className="text-[#AAAAAA]">—</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {update.newFunding && (
        <span className="rounded-full bg-[#E8F6EF] px-2 py-0.5 text-[10px] font-medium text-[#1D7A55]">Captação {moneyCompact(update.fundingAmount)}</span>
      )}
      {update.newDebt && (
        <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[10px] font-medium text-[#555555]">Dívida {moneyCompact(update.debtAmount)}</span>
      )}
    </span>
  );
}

function History({ updates }: { updates: MonthlyUpdate[] }) {
  const hasRevenue = updates.some((u) => u.mode === "COM_FATURAMENTO");
  const hasTraction = updates.some((u) => u.mode === "SEM_FATURAMENTO");
  const rows = [...updates].reverse();
  return (
    <section className={`${cardClass} min-w-0 p-5`}>
      <h3 className="text-sm font-medium text-[#252525]">Histórico mensal</h3>
      <p className="mt-0.5 text-[10px] text-[#888888]">Todos os valores enviados, do mês mais recente ao mais antigo</p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left text-[11px]">
          <thead>
            <tr className="border-b border-[#ECEFF1] text-[10px] uppercase tracking-wide text-[#888888]">
              <th scope="col" className="py-2 pr-3 font-medium">Mês</th>
              {hasRevenue && <th scope="col" className="py-2 pr-3 text-right font-medium">Receita</th>}
              {hasTraction && <th scope="col" className="py-2 pr-3 text-right font-medium">Gastos</th>}
              <th scope="col" className="py-2 pr-3 text-right font-medium">Resultado operacional</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Caixa</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Runway</th>
              {hasTraction && <th scope="col" className="py-2 pr-3 font-medium">Tração e marco</th>}
              <th scope="col" className="py-2 pr-3 font-medium">Captação / dívida</th>
              <th scope="col" className="py-2 font-medium">Comentário</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.month} className="border-b border-[#F3F4F6] align-top text-[#444444]">
                <th scope="row" className="whitespace-nowrap py-2.5 pr-3 font-medium">{longMonthTitle(u.month)}</th>
                {hasRevenue && <td className="py-2.5 pr-3 text-right tabular-nums">{money(u.revenue)}</td>}
                {hasTraction && <td className="py-2.5 pr-3 text-right tabular-nums">{money(u.expenses)}</td>}
                <td className="py-2.5 pr-3 text-right tabular-nums">{money(u.operatingResult)}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums">{money(u.cash)}</td>
                <td className="whitespace-nowrap py-2.5 pr-3 text-right tabular-nums">{runway(u.runwayMonths)}</td>
                {hasTraction && (
                  <td className="py-2.5 pr-3">
                    {u.indicators ? (
                      <ul>
                        {Object.entries(u.indicators).map(([name, value]) => (
                          <li key={name}>
                            {name}: <span className="tabular-nums">{number(value)}</span>
                          </li>
                        ))}
                        {u.milestone && u.milestoneStatus && (
                          <li className="text-[#777777]">
                            {u.milestone}: {milestoneStatusLabels[u.milestoneStatus]} ({u.milestoneProgress}%)
                          </li>
                        )}
                      </ul>
                    ) : (
                      <span className="text-[#AAAAAA]">—</span>
                    )}
                  </td>
                )}
                <td className="py-2.5 pr-3"><Events update={u} /></td>
                <td className="max-w-[260px] whitespace-pre-wrap break-words py-2.5 text-[#666666]">{u.comment ?? <span className="text-[#AAAAAA]">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RevenueView({ updates, criterion }: { updates: MonthlyUpdate[]; criterion: string | null }) {
  const latest = updates[updates.length - 1];
  const labels = updates.map((u) => shortMonth(u.month));
  const financial: ChartSeries[] = [
    { key: "receita", label: "Receita", color: ACCENT, values: updates.map((u) => u.revenue) },
    { key: "resultado", label: "Resultado operacional", color: SECOND, values: updates.map((u) => u.operatingResult) },
  ];
  const growth = latest.revenueGrowthPercent;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Tile
          label={`Receita de ${longMonth(latest.month)}`}
          value={money(latest.revenue)}
          delta={growth == null ? undefined : { text: `${percent(growth, true)} vs. mês anterior`, good: growth > 0 ? true : growth < 0 ? false : null, up: growth >= 0 }}
          detail={criterion ?? undefined}
        />
        <Tile label="Margem bruta" value={percent(latest.grossMarginPercent)} detail={`Lucro bruto de ${money(latest.grossProfit)}`} />
        <Tile label="Resultado operacional" value={money(latest.operatingResult)} detail="Receita − custos diretos − despesas operacionais" />
        <Tile label="Caixa disponível" value={money(latest.cash)} />
        <Tile label="Runway" value={runway(latest.runwayMonths)} detail={latest.burn > 0 ? `Queima de ${money(latest.burn)} por mês` : "Operação sem queima de caixa no mês"} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <ChartCard title="Receita e resultado operacional" subtitle="Valores mensais em reais">
          <LineChart title="Receita e resultado operacional por mês" labels={labels} series={financial} format={money} axisFormat={moneyCompact} />
        </ChartCard>
        <ChartCard title="Caixa disponível" subtitle="Saldo informado no fim de cada mês">
          <LineChart
            title="Caixa disponível por mês"
            labels={labels}
            series={[{ key: "caixa", label: "Caixa", color: ACCENT, values: updates.map((u) => u.cash), area: true }]}
            format={money}
            axisFormat={moneyCompact}
          />
        </ChartCard>
      </div>
    </>
  );
}

function TractionView({ updates, indicators, milestone, deadline }: { updates: MonthlyUpdate[]; indicators: string[]; milestone: string | null; deadline: string | null }) {
  const latest = updates[updates.length - 1];
  const labels = updates.map((u) => shortMonth(u.month));
  const previous = updates.length > 1 ? updates[updates.length - 2] : null;
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label={`Gastos de ${longMonth(latest.month)}`} value={money(latest.expenses ?? latest.burn)} detail="Queima de caixa do mês" />
        <Tile label="Caixa disponível" value={money(latest.cash)} />
        <Tile label="Runway (fôlego financeiro)" value={runway(latest.runwayMonths)} detail="Caixa dividido pelos gastos do mês" />
        <article className={`${cardClass} p-4`}>
          <p className="text-[11px] text-[#777777]">Marco: {latest.milestone ?? milestone ?? "—"}</p>
          <p className="mt-2 text-xl font-semibold tabular-nums tracking-tight text-[#222222]">{latest.milestoneProgress ?? 0}%</p>
          <div className="mt-2">
            <MilestoneMeter progress={latest.milestoneProgress ?? 0} label={`Progresso do marco ${latest.milestone ?? ""}`} />
          </div>
          <p className="mt-1.5 text-[10px] text-[#888888]">
            {latest.milestoneStatus ? milestoneStatusLabels[latest.milestoneStatus] : "—"}
            {deadline && ` · previsto para ${longMonth(deadline)}`}
          </p>
        </article>
      </div>

      <h3 className="mb-3 mt-6 text-sm font-medium text-[#252525]">Indicadores de tração</h3>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {indicators.map((name) => {
          const values = updates.map((u) => (u.indicators && name in u.indicators ? u.indicators[name] : null));
          const now = latest.indicators?.[name] ?? null;
          const before = previous?.indicators?.[name] ?? null;
          const diff = now != null && before != null ? now - before : null;
          return (
            <ChartCard key={name} title={name} subtitle={now == null ? "Sem valor no último mês" : `${number(now)} em ${longMonth(latest.month)}${diff == null ? "" : ` (${diff >= 0 ? "+" : "−"}${number(Math.abs(diff))} no mês)`}`}>
              <LineChart title={`${name} por mês`} labels={labels} series={[{ key: name, label: name, color: ACCENT, values, area: true }]} format={number} axisFormat={numberCompact} />
            </ChartCard>
          );
        })}
      </div>

      <div className="mt-4">
        <ChartCard title="Caixa e gastos" subtitle="Quanto há em caixa e quanto saiu em cada mês">
          <LineChart
            title="Caixa e gastos por mês"
            labels={labels}
            series={[
              { key: "caixa", label: "Caixa disponível", color: ACCENT, values: updates.map((u) => u.cash) },
              { key: "gastos", label: "Gastos do mês", color: SECOND, values: updates.map((u) => u.burn) },
            ]}
            format={money}
            axisFormat={moneyCompact}
          />
        </ChartCard>
      </div>
    </>
  );
}

export default function GrowthDashboard({ data, emptyText }: { data: Dashboard; emptyText: string }) {
  const { settings, updates } = data;
  if (!settings || updates.length === 0) {
    return (
      <>
        <Disclaimer />
        <div className={`${cardClass} p-8 text-center text-xs text-[#777777]`}>{emptyText}</div>
      </>
    );
  }
  const latest = updates[updates.length - 1];
  // O painel segue o modo atual; meses do outro modo continuam no histórico.
  const sameMode = updates.filter((u) => u.mode === settings.mode);
  const criterion = settings.revenueCriterion ? criterionLabels[settings.revenueCriterion].label : null;
  return (
    <>
      <Disclaimer />
      <p className="mb-4 text-[11px] text-[#777777]">
        Última atualização: <strong className="font-medium text-[#444444]">{longMonth(latest.month)}</strong>
        {" · "}
        {settings.mode === "COM_FATURAMENTO" ? `Com faturamento (${criterion?.toLowerCase()})` : "Sem faturamento: acompanhando tração"}
      </p>
      {sameMode.length === 0 ? (
        <div className={`${cardClass} mb-4 p-6 text-center text-xs text-[#777777]`}>
          A startup passou a acompanhar {settings.mode === "COM_FATURAMENTO" ? "a receita" : "a tração"} e ainda não enviou o primeiro mês neste formato.
        </div>
      ) : settings.mode === "COM_FATURAMENTO" ? (
        <RevenueView updates={sameMode} criterion={criterion} />
      ) : (
        <TractionView updates={sameMode} indicators={settings.indicators} milestone={settings.milestone} deadline={settings.milestoneDeadline} />
      )}
      <div className="mt-4">
        <History updates={updates} />
      </div>
    </>
  );
}
