// Textos, sugestões de indicadores e formatação da aba "Crescimento".
import type { BusinessModel, MilestoneStatus, RevenueCriterion } from "../../services/api";

export const GROWTH_DISCLAIMER =
  "Os dados desta aba são informados pela própria startup. A Vértice não audita nem verifica esses números: " +
  "use-os como ponto de partida e confirme as informações antes de qualquer decisão de investimento.";

export const businessModels: { value: BusinessModel; label: string; hint: string }[] = [
  { value: "B2B", label: "B2B", hint: "Vende para empresas" },
  { value: "B2C", label: "B2C", hint: "Vende direto ao consumidor" },
  { value: "B2B2C", label: "B2B2C", hint: "Chega ao consumidor por meio de empresas parceiras" },
  { value: "MARKETPLACE", label: "Marketplace", hint: "Conecta quem compra a quem vende" },
  { value: "OUTRO", label: "Outro", hint: "Outro modelo de negócio" },
];

/** Sugestões de indicadores de tração por modelo de negócio (a startup também pode escrever o seu). */
export const tractionSuggestions: Record<BusinessModel, string[]> = {
  B2B: ["Pilotos ativos", "Cartas de intenção (LOIs)", "Empresas em negociação", "Usuários ativos nos pilotos"],
  B2C: ["Usuários cadastrados", "Usuários ativos no mês", "Lista de espera", "Retenção do mês (%)"],
  B2B2C: ["Empresas parceiras integradas", "Usuários finais ativos", "Pilotos ativos", "Lista de espera"],
  MARKETPLACE: ["Vendedores cadastrados", "Compradores cadastrados", "Transações no mês", "Volume transacionado (R$)"],
  OUTRO: ["Usuários cadastrados", "Usuários ativos no mês", "Pilotos ativos", "Parcerias firmadas"],
};

export const milestoneSuggestions = [
  "Lançar o MVP",
  "Concluir os pilotos",
  "Conquistar o primeiro cliente pagante",
  "Lançar a versão comercial",
];

export const criterionLabels: Record<RevenueCriterion, { label: string; hint: string }> = {
  FATURADA: { label: "Receita faturada", hint: "O que foi vendido e faturado no mês (notas emitidas), mesmo que ainda não tenha sido pago." },
  RECEBIDA: { label: "Receita recebida", hint: "O que efetivamente entrou no caixa no mês." },
};

export const milestoneStatusLabels: Record<MilestoneStatus, string> = {
  NAO_INICIADO: "Não iniciado",
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
};

const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const monthFull = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

/** "2026-10" → "out/26" */
export function shortMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${monthNames[m - 1]}/${String(y).slice(2)}`;
}

/** "2026-10" → "outubro de 2026" */
export function longMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${monthFull[m - 1]} de ${y}`;
}

/** "2026-10" → "Outubro de 2026" (início de frase, lista e tabela). */
export function longMonthTitle(month: string): string {
  const text = longMonth(month);
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Mês atual e anteriores, do mais recente ao mais antigo, no formato "AAAA-MM". */
export function recentMonths(count = 24, now = new Date()): string[] {
  const months: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const compactBrl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const compactNumber = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 });

export function money(value: number | null | undefined): string {
  // "+ 0" evita "-R$ 0" quando o cálculo resulta em zero negativo.
  return value == null ? "—" : brl.format(value + 0);
}

/** Valores grandes abreviados (R$ 1,2 mi), para eixos e cartões. */
export function moneyCompact(value: number | null | undefined): string {
  if (value == null) return "—";
  return Math.abs(value) < 10_000 ? brl.format(value) : compactBrl.format(value);
}

export function number(value: number | null | undefined): string {
  return value == null ? "—" : integer.format(value);
}

export function numberCompact(value: number): string {
  return Math.abs(value) < 10_000 ? integer.format(value) : compactNumber.format(value);
}

export function percent(value: number | null | undefined, signed = false): string {
  if (value == null) return "—";
  const text = `${integer.format(Math.abs(value))}%`;
  if (!signed) return value < 0 ? `-${text}` : text;
  return value > 0 ? `+${text}` : value < 0 ? `−${text}` : text;
}

/** Runway em meses ("18 meses"); nulo = sem queima de caixa. */
export function runway(value: number | null | undefined): string {
  if (value == null) return "Sem queima de caixa";
  if (value >= 120) return "Mais de 10 anos";
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${integer.format(rounded)} ${rounded === 1 ? "mês" : "meses"}`;
}
