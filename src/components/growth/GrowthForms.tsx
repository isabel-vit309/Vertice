// Formulários da aba "Crescimento": configuração (primeira visita e configurações) e envio mensal.
import { useId, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { FiPlus, FiX } from "react-icons/fi";

import { StatusMessage, fieldInput, fieldLabel, outlineButton, primaryButton } from "../ProfileUI";
import {
  businessModels,
  criterionLabels,
  longMonthTitle,
  milestoneStatusLabels,
  milestoneSuggestions,
  money,
  recentMonths,
  runway,
  tractionSuggestions,
} from "./catalog";
import { maskCurrency, parseCurrency } from "../../utils/forms";
import type {
  BusinessModel,
  GrowthMode,
  GrowthSettings,
  GrowthSettingsPayload,
  MilestoneStatus,
  MonthlyUpdate,
  MonthlyUpdatePayload,
  RevenueCriterion,
} from "../../services/api";

const currencyBr = (value: number | null | undefined) =>
  value == null ? "" : maskCurrency(String(Math.round(value * 100)));

function errorText(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

/** Cartão de escolha (rádio estilizado). */
function Choice({
  name,
  checked,
  onChange,
  title,
  hint,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  hint?: string;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#EF5948] ${
        checked ? "border-[#EF5948] bg-[#FFF7F5]" : "border-[#E0E3E6] bg-white hover:border-[#EF5948]/60"
      }`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="mt-0.5 accent-[#EF5948]" />
      <span>
        <span className="block text-xs font-medium text-[#252525]">{title}</span>
        {hint && <span className="mt-0.5 block text-[10px] leading-relaxed text-[#777777]">{hint}</span>}
      </span>
    </label>
  );
}

function Fieldset({ legend, help, children }: { legend: string; help?: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0">
      <legend className="text-xs font-medium text-[#252525]">{legend}</legend>
      {help && <p className="mt-0.5 text-[10px] leading-relaxed text-[#777777]">{help}</p>}
      <div className="mt-2.5">{children}</div>
    </fieldset>
  );
}

/* ================================================================ configuração */

export function SettingsForm({
  initial,
  fixedMode,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: GrowthSettings | null;
  /** Na primeira visita o modo vem da pergunta anterior; nas configurações ele pode ser trocado. */
  fixedMode?: GrowthMode;
  submitLabel: string;
  onSubmit: (payload: GrowthSettingsPayload) => Promise<void>;
  onCancel?: () => void;
}) {
  const [mode, setMode] = useState<GrowthMode>(fixedMode ?? initial?.mode ?? "COM_FATURAMENTO");
  const [criterion, setCriterion] = useState<RevenueCriterion | null>(initial?.revenueCriterion ?? null);
  const [model, setModel] = useState<BusinessModel | null>(initial?.businessModel ?? null);
  const [indicators, setIndicators] = useState<string[]>(initial?.indicators ?? []);
  const [custom, setCustom] = useState("");
  const [milestone, setMilestone] = useState(initial?.milestone ?? "");
  const [deadline, setDeadline] = useState(initial?.milestoneDeadline ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const listId = useId();

  const suggestions = model ? tractionSuggestions[model] : [];
  const options = [...suggestions, ...indicators.filter((name) => !suggestions.includes(name))];
  const switching = initial != null && initial.mode !== mode;

  function toggle(name: string) {
    setIndicators((current) =>
      current.includes(name) ? current.filter((item) => item !== name) : current.length >= 3 ? current : [...current, name],
    );
  }

  function addCustom() {
    const name = custom.trim().replace(/\s+/g, " ");
    if (!name) return;
    if (indicators.some((item) => item.toLowerCase() === name.toLowerCase())) {
      setError("Esse indicador já está na lista.");
      return;
    }
    if (indicators.length >= 3) {
      setError("Escolha no máximo três indicadores.");
      return;
    }
    setIndicators((current) => [...current, name]);
    setCustom("");
    setError("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (mode === "COM_FATURAMENTO" && !criterion) return setError("Escolha o critério de receita.");
    if (mode === "SEM_FATURAMENTO") {
      if (!model) return setError("Escolha o modelo de negócio.");
      if (indicators.length < 2 || indicators.length > 3) return setError("Escolha de dois a três indicadores de tração.");
      if (milestone.trim().length < 3) return setError("Informe o marco que será acompanhado.");
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit(
        mode === "COM_FATURAMENTO"
          ? { mode, revenueCriterion: criterion }
          : { mode, businessModel: model, indicators, milestone: milestone.trim(), milestoneDeadline: deadline || null },
      );
    } catch (err) {
      setError(errorText(err, "Não foi possível salvar a configuração."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-6" aria-label="Configuração do crescimento">
      {!fixedMode && (
        <Fieldset legend="Situação da startup" help="Ao trocar, o histórico já enviado continua no painel. As próximas atualizações seguem o novo formato.">
          <div className="grid gap-2 sm:grid-cols-2">
            <Choice name="modo" checked={mode === "COM_FATURAMENTO"} onChange={() => setMode("COM_FATURAMENTO")} title="Com faturamento" hint="Acompanhar receita, custos, resultado e caixa" />
            <Choice name="modo" checked={mode === "SEM_FATURAMENTO"} onChange={() => setMode("SEM_FATURAMENTO")} title="Sem faturamento" hint="Acompanhar tração, marco e fôlego financeiro" />
          </div>
          {switching && (
            <p className="mt-2 rounded-md bg-[#FFF7F5] px-3 py-2 text-[10px] text-[#AF5039]">
              A partir da próxima atualização, o painel passa a mostrar {mode === "COM_FATURAMENTO" ? "a evolução financeira" : "a tração"}.
            </p>
          )}
        </Fieldset>
      )}

      {mode === "COM_FATURAMENTO" ? (
        <Fieldset legend="Qual critério de receita você vai usar?" help="Use sempre o mesmo critério para os meses poderem ser comparados.">
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(criterionLabels) as RevenueCriterion[]).map((key) => (
              <Choice key={key} name="criterio" checked={criterion === key} onChange={() => setCriterion(key)} title={criterionLabels[key].label} hint={criterionLabels[key].hint} />
            ))}
          </div>
        </Fieldset>
      ) : (
        <>
          <Fieldset legend="Modelo de negócio">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {businessModels.map((item) => (
                <Choice key={item.value} name="modelo" checked={model === item.value} onChange={() => setModel(item.value)} title={item.label} hint={item.hint} />
              ))}
            </div>
          </Fieldset>

          <Fieldset legend="Indicadores de tração (escolha de 2 a 3)" help={model ? "Sugestões para o seu modelo. Você também pode criar o seu." : "Escolha o modelo de negócio para ver sugestões."}>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Indicadores de tração">
              {options.map((name) => {
                const selected = indicators.includes(name);
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={selected}
                    disabled={!selected && indicators.length >= 3}
                    onClick={() => toggle(name)}
                    className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      selected ? "border-[#EF5948] bg-[#FFF1EE] text-[#EF5948]" : "border-[#DADDE0] text-[#666666] hover:border-[#EF5948]"
                    }`}
                  >
                    {selected && <span aria-hidden="true">✓ </span>}
                    {name}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={custom}
                maxLength={60}
                onChange={(e) => setCustom(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustom();
                  }
                }}
                aria-label="Outro indicador"
                placeholder="Outro indicador (ex.: Prefeituras atendidas)"
                className={`${fieldInput} max-w-sm`}
              />
              <button type="button" onClick={addCustom} disabled={!custom.trim() || indicators.length >= 3} className={outlineButton("shrink-0")}>
                <FiPlus aria-hidden="true" /> Adicionar
              </button>
            </div>
            <p className="mt-2 text-[10px] text-[#888888]" aria-live="polite">
              {indicators.length} de 3 escolhidos
            </p>
          </Fieldset>

          <Fieldset legend="Marco que será acompanhado" help="Todo mês você informa o andamento desse marco.">
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
              <div>
                <label className={fieldLabel} htmlFor={`${listId}-marco`}>Marco</label>
                <input id={`${listId}-marco`} list={listId} value={milestone} maxLength={120} onChange={(e) => setMilestone(e.currentTarget.value)} placeholder="Ex.: Lançar o MVP" className={fieldInput} />
                <datalist id={listId}>
                  {milestoneSuggestions.map((item) => <option key={item} value={item} />)}
                </datalist>
              </div>
              <div>
                <label className={fieldLabel} htmlFor={`${listId}-prazo`}>Previsão (opcional)</label>
                <input id={`${listId}-prazo`} type="month" value={deadline} onChange={(e) => setDeadline(e.currentTarget.value)} className={fieldInput} />
              </div>
            </div>
          </Fieldset>
        </>
      )}

      <StatusMessage error={error} />
      <div className="flex flex-wrap justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className={outlineButton()}>
            Cancelar
          </button>
        )}
        <button type="submit" disabled={saving} className={primaryButton()}>
          {saving ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

/* ================================================================ envio mensal */

function MoneyField({ label, value, onChange, help }: { label: string; value: string; onChange: (v: string) => void; help?: string }) {
  const id = useId();
  return (
    <div>
      <label className={fieldLabel} htmlFor={id}>{label}</label>
      <input id={id} inputMode="numeric" value={value} onChange={(e) => onChange(maskCurrency(e.currentTarget.value))} placeholder="R$ 0,00" className={fieldInput} />
      {help && <p className="mt-1 text-[10px] text-[#888888]">{help}</p>}
    </div>
  );
}

export function UpdateForm({
  settings,
  updates,
  initialMonth,
  onSubmit,
  onCancel,
}: {
  settings: GrowthSettings;
  updates: MonthlyUpdate[];
  initialMonth: string;
  onSubmit: (month: string, payload: MonthlyUpdatePayload) => Promise<void>;
  onCancel: () => void;
}) {
  const months = useMemo(() => recentMonths(24), []);
  const [month, setMonth] = useState(initialMonth);
  const existing = updates.find((u) => u.month === month && u.mode === settings.mode) ?? null;
  const revenueMode = settings.mode === "COM_FATURAMENTO";

  const [values, setValues] = useState(() => fromUpdate(existing));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const id = useId();

  function fromUpdate(u: MonthlyUpdate | null) {
    return {
      revenue: currencyBr(u?.revenue),
      directCosts: currencyBr(u?.directCosts),
      operatingExpenses: currencyBr(u?.operatingExpenses),
      expenses: currencyBr(u?.expenses),
      cash: currencyBr(u?.cash),
      newFunding: u?.newFunding ?? false,
      fundingAmount: currencyBr(u?.fundingAmount),
      newDebt: u?.newDebt ?? false,
      debtAmount: currencyBr(u?.debtAmount),
      indicators: Object.fromEntries(settings.indicators.map((name) => [name, u?.indicators?.[name] != null ? String(u.indicators[name]) : ""])),
      milestoneStatus: (u?.milestoneStatus ?? null) as MilestoneStatus | null,
      milestoneProgress: u?.milestoneProgress ?? 0,
      comment: u?.comment ?? "",
    };
  }

  function changeMonth(next: string) {
    setMonth(next);
    setValues(fromUpdate(updates.find((u) => u.month === next && u.mode === settings.mode) ?? null));
    setError("");
  }

  const set = <K extends keyof typeof values>(key: K, value: (typeof values)[K]) => setValues((current) => ({ ...current, [key]: value }));

  // Prévia dos indicadores que o sistema vai calcular.
  const cash = parseCurrency(values.cash);
  const result = revenueMode
    ? (parseCurrency(values.revenue) ?? 0) - (parseCurrency(values.directCosts) ?? 0) - (parseCurrency(values.operatingExpenses) ?? 0)
    : -(parseCurrency(values.expenses) ?? 0);
  const burn = result < 0 ? -result : 0;
  const previewRunway = cash != null && burn > 0 ? cash / burn : null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    const payload: MonthlyUpdatePayload = {
      cash,
      newFunding: values.newFunding,
      fundingAmount: values.newFunding ? parseCurrency(values.fundingAmount) : null,
      newDebt: values.newDebt,
      debtAmount: values.newDebt ? parseCurrency(values.debtAmount) : null,
      comment: values.comment.trim() || null,
    };
    if (revenueMode) {
      Object.assign(payload, {
        revenue: parseCurrency(values.revenue),
        directCosts: parseCurrency(values.directCosts),
        operatingExpenses: parseCurrency(values.operatingExpenses),
      });
    } else {
      const indicators: Record<string, number | null> = {};
      for (const name of settings.indicators) {
        const raw = values.indicators[name]?.replace(",", ".").trim();
        indicators[name] = raw ? Number(raw) : null;
        if (raw && !Number.isFinite(indicators[name])) return setError(`Informe um número válido em "${name}".`);
      }
      Object.assign(payload, {
        expenses: parseCurrency(values.expenses),
        indicators,
        milestoneStatus: values.milestoneStatus,
        milestoneProgress: values.milestoneStatus === "EM_ANDAMENTO" ? values.milestoneProgress : null,
      });
    }
    setSaving(true);
    setError("");
    try {
      await onSubmit(month, payload);
    } catch (err) {
      setError(errorText(err, "Não foi possível enviar a atualização."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-5" aria-label="Atualização mensal">
      <div>
        <label className={fieldLabel} htmlFor={`${id}-mes`}>Mês de referência</label>
        <select id={`${id}-mes`} value={month} onChange={(e) => changeMonth(e.currentTarget.value)} className={`${fieldInput} max-w-xs`}>
          {months.map((m) => (
            <option key={m} value={m}>
              {longMonthTitle(m)}
              {updates.some((u) => u.month === m) ? " (já enviado)" : ""}
            </option>
          ))}
        </select>
        {existing && <p className="mt-1 text-[10px] text-[#AF5039]">Este mês já foi enviado. Ao salvar, os valores serão corrigidos.</p>}
      </div>

      {revenueMode ? (
        <Fieldset legend="Resultado do mês">
          <div className="grid gap-3 sm:grid-cols-2">
            <MoneyField label={`Receita (${settings.revenueCriterion ? criterionLabels[settings.revenueCriterion].label.toLowerCase() : "receita"})`} value={values.revenue} onChange={(v) => set("revenue", v)} />
            <MoneyField label="Custos diretos" value={values.directCosts} onChange={(v) => set("directCosts", v)} help="Custos para entregar o produto ou serviço vendido" />
            <MoneyField label="Despesas operacionais" value={values.operatingExpenses} onChange={(v) => set("operatingExpenses", v)} help="Salários, aluguel, marketing, ferramentas..." />
            <MoneyField label="Caixa disponível no fim do mês" value={values.cash} onChange={(v) => set("cash", v)} />
          </div>
        </Fieldset>
      ) : (
        <>
          <Fieldset legend="Gastos e caixa">
            <div className="grid gap-3 sm:grid-cols-2">
              <MoneyField label="Gastos totais do mês" value={values.expenses} onChange={(v) => set("expenses", v)} />
              <MoneyField label="Caixa disponível no fim do mês" value={values.cash} onChange={(v) => set("cash", v)} />
            </div>
          </Fieldset>
          <Fieldset legend="Indicadores de tração">
            <div className="grid gap-3 sm:grid-cols-3">
              {settings.indicators.map((name) => (
                <div key={name}>
                  <label className={fieldLabel} htmlFor={`${id}-${name}`}>{name}</label>
                  <input
                    id={`${id}-${name}`}
                    inputMode="decimal"
                    value={values.indicators[name] ?? ""}
                    onChange={(e) => {
                      const v = e.currentTarget.value.replace(/[^\d.,]/g, "");
                      setValues((current) => ({ ...current, indicators: { ...current.indicators, [name]: v } }));
                    }}
                    placeholder="0"
                    className={fieldInput}
                  />
                </div>
              ))}
            </div>
          </Fieldset>
          <Fieldset legend={`Andamento do marco: ${settings.milestone ?? ""}`}>
            <div className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(milestoneStatusLabels) as MilestoneStatus[]).map((key) => (
                <Choice key={key} name="status-marco" checked={values.milestoneStatus === key} onChange={() => set("milestoneStatus", key)} title={milestoneStatusLabels[key]} />
              ))}
            </div>
            {values.milestoneStatus === "EM_ANDAMENTO" && (
              <div className="mt-3">
                <label className={fieldLabel} htmlFor={`${id}-progresso`}>Progresso: {values.milestoneProgress}%</label>
                <input id={`${id}-progresso`} type="range" min={0} max={100} step={5} value={values.milestoneProgress} onChange={(e) => set("milestoneProgress", Number(e.currentTarget.value))} className="w-full max-w-sm accent-[#EF5948]" />
              </div>
            )}
          </Fieldset>
        </>
      )}

      <Fieldset legend="Captação e dívida no mês">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <label className="flex items-center gap-2 text-xs text-[#444444]">
              <input type="checkbox" checked={values.newFunding} onChange={(e) => set("newFunding", e.currentTarget.checked)} className="accent-[#EF5948]" />
              Houve nova captação
            </label>
            {values.newFunding && <MoneyField label="Valor captado" value={values.fundingAmount} onChange={(v) => set("fundingAmount", v)} />}
          </div>
          <div className="grid gap-2">
            <label className="flex items-center gap-2 text-xs text-[#444444]">
              <input type="checkbox" checked={values.newDebt} onChange={(e) => set("newDebt", e.currentTarget.checked)} className="accent-[#EF5948]" />
              Houve nova dívida
            </label>
            {values.newDebt && <MoneyField label="Valor da dívida" value={values.debtAmount} onChange={(v) => set("debtAmount", v)} />}
          </div>
        </div>
      </Fieldset>

      <div>
        <label className={fieldLabel} htmlFor={`${id}-comentario`}>Comentário (opcional)</label>
        <textarea id={`${id}-comentario`} rows={3} maxLength={1000} value={values.comment} onChange={(e) => set("comment", e.currentTarget.value)} placeholder="O que aconteceu de importante no mês?" className={`${fieldInput} resize-y`} />
      </div>

      <div className="rounded-lg bg-[#F7F9FA] px-4 py-3 text-[11px] text-[#555555]" aria-live="polite">
        <p className="font-medium text-[#333333]">O sistema vai calcular</p>
        <p className="mt-1">
          Resultado operacional: <strong className="tabular-nums">{money(result)}</strong> · Runway:{" "}
          <strong className="tabular-nums">{cash == null ? "—" : runway(previewRunway)}</strong>
        </p>
      </div>

      <StatusMessage error={error} />
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" onClick={onCancel} className={outlineButton()}>
          <FiX aria-hidden="true" /> Cancelar
        </button>
        <button type="submit" disabled={saving} className={primaryButton()}>
          {saving ? "Enviando..." : existing ? "Salvar correção" : "Enviar atualização"}
        </button>
      </div>
    </form>
  );
}
