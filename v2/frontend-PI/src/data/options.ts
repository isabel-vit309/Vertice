// Listas compartilhadas pelos formulários de cadastro e filtros.

export type Option = { value: string; label: string };

/** Unidades federativas (valor = sigla, usada também em "Cidade/UF" no feed). */
export const ESTADOS: Option[] = [
  ["AC", "Acre"], ["AL", "Alagoas"], ["AP", "Amapá"], ["AM", "Amazonas"],
  ["BA", "Bahia"], ["CE", "Ceará"], ["DF", "Distrito Federal"], ["ES", "Espírito Santo"],
  ["GO", "Goiás"], ["MA", "Maranhão"], ["MT", "Mato Grosso"], ["MS", "Mato Grosso do Sul"],
  ["MG", "Minas Gerais"], ["PA", "Pará"], ["PB", "Paraíba"], ["PR", "Paraná"],
  ["PE", "Pernambuco"], ["PI", "Piauí"], ["RJ", "Rio de Janeiro"], ["RN", "Rio Grande do Norte"],
  ["RS", "Rio Grande do Sul"], ["RO", "Rondônia"], ["RR", "Roraima"], ["SC", "Santa Catarina"],
  ["SP", "São Paulo"], ["SE", "Sergipe"], ["TO", "Tocantins"],
].map(([value, name]) => ({ value, label: `${name} (${value})` }));

/**
 * Segmentos de startups usados no ecossistema brasileiro (mapeamentos de
 * associações e hubs de inovação, ex.: ABStartups/Distrito). "Tecnologia",
 * "Saúde" e "Educação" foram mantidos por compatibilidade com cadastros antigos.
 */
export const SEGMENTOS: string[] = [
  "Adtech", "Agritech / Agronegócio", "Biotech", "Cleantech / Sustentabilidade",
  "Construtech", "Cybersecurity", "Deeptech", "E-commerce", "Edtech", "Educação",
  "Energytech", "Fashiontech", "Fintech", "Foodtech", "Games", "Govtech",
  "Healthtech", "HRtech / RH", "Impacto social", "Indústria 4.0", "Inteligência Artificial",
  "Insurtech", "IoT", "Legaltech", "Logtech / Logística", "Marketplace", "Martech",
  "Mídia e entretenimento", "Mobilidade", "Pettech", "Proptech", "Regtech", "Retailtech / Varejo",
  "SaaS", "Saúde", "Sportstech", "Tecnologia", "Traveltech / Turismo", "Web3 / Blockchain",
  "Outro",
].sort((a, b) => a.localeCompare(b, "pt-BR"));

export const ESTAGIOS: string[] = ["Ideação", "Operação", "Escala"];

export const toOptions = (values: string[]): Option[] =>
  values.map((value) => ({ value, label: value }));

type Municipios = Record<string, string[]>;
let municipiosCache: Promise<Municipios> | null = null;

/** Municípios do IBGE por UF — carregados sob demanda (fora do bundle principal). */
export function carregarMunicipios(uf: string): Promise<string[]> {
  municipiosCache ??= import("./municipios.json").then(
    (module) => module.default as Municipios,
  );
  return municipiosCache.then((data) => data[uf] ?? []);
}
