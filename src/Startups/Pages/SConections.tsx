import { useState } from "react";

import {
  FiArrowUpRight,
  FiCalendar,
  FiHome,
  FiLink,
  FiMessageSquare,
  FiSearch,
  FiTarget,
  FiUser,
} from "react-icons/fi";
import SSidebar from "../../components/SSidebar";

export type InvestorConnection = {
  id: string;
  investorId: string;
  name: string;
  photoUrl?: string;
  type: string;
  city: string;
  state: string;
  segments: string[];
  ticketMin: number;
  ticketMax: number;
  connectedAt: string; // YYYY-MM-DD
};

type SConexoesProps = {
  connections?: InvestorConnection[];
  logoUrl?: string;
  getInvestorProfileHref?: (investorId: string) => string;
};

const exampleConnections: InvestorConnection[] = [
  {
    id: "connection-1",
    investorId: "isabel-alves",
    name: "Isabel Alves",
    type: "Investidora-anjo",
    city: "São Paulo",
    state: "SP",
    segments: ["Fintech", "Educação"],
    ticketMin: 100000,
    ticketMax: 500000,
    connectedAt: "2026-09-10",
  },
  {
    id: "connection-2",
    investorId: "fernando-torres",
    name: "Fernando Torres",
    type: "Investidor-anjo",
    city: "Recife",
    state: "PE",
    segments: ["SaaS", "Tecnologia"],
    ticketMin: 200000,
    ticketMax: 600000,
    connectedAt: "2026-09-08",
  },
  {
    id: "connection-3",
    investorId: "amanda-ellem",
    name: "Amanda Ellem",
    type: "Investidora-anjo",
    city: "Belo Horizonte",
    state: "MG",
    segments: ["Saúde", "Biotecnologia"],
    ticketMin: 150000,
    ticketMax: 400000,
    connectedAt: "2026-09-05",
  },
  {
    id: "connection-4",
    investorId: "ronald-paixao",
    name: "Ronald Paixão",
    type: "Investidor-anjo",
    city: "Curitiba",
    state: "PR",
    segments: ["Agronegócio", "Sustentabilidade"],
    ticketMin: 300000,
    ticketMax: 1000000,
    connectedAt: "2026-09-02",
  },
];

const navigation = [
  { label: "Perfil", icon: FiUser, href: "/perfil" },
  { label: "Início", icon: FiHome, href: "/painel" },
  { label: "Matching", icon: FiTarget, href: "/matching" },
  {
    label: "Mensagens",
    icon: FiMessageSquare,
    href: "/mensagens",
  },
  { label: "Reuniões", icon: FiCalendar, href: "/reunioes" },
  { label: "Conexões", icon: FiLink, href: "/conexoes" },
];

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function SConections({
  connections = exampleConnections,
  logoUrl,
  getInvestorProfileHref = (investorId) =>
    `/investidores/${encodeURIComponent(investorId)}`,
}: SConexoesProps = {}) {
  const [search, setSearch] = useState("");

  const query = normalizeText(search);

  const filteredConnections = connections.filter((connection) => {
    const searchableText = [
      connection.name,
      connection.type,
      connection.city,
      connection.state,
      ...connection.segments,
    ].join(" ");

    return normalizeText(searchableText).includes(query);
  });

  return (
    <div
      className="min-h-screen bg-[#F5F8FA] text-[#222222]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <SSidebar />

      <header className="border-b border-[#E5E7EB] bg-white md:hidden">
        <a
          href="/painel"
          aria-label="Vértice — página inicial"
          className="flex h-16 items-center px-5"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Vértice"
              className="max-h-10 w-24 object-contain"
            />
          ) : (
            <span className="text-sm font-semibold tracking-[0.18em]">
              VÉRTICE
            </span>
          )}
        </a>

        <nav
          aria-label="Menu principal mobile"
          className="flex overflow-x-auto px-2"
        >
          {navigation.map(({ label, icon: Icon, href }) => {
            const active = label === "Conexões";

            return (
              <a
                key={label}
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs",
                  active
                    ? "border-[#EF5948] text-[#EF5948]"
                    : "border-transparent text-[#777777]",
                ].join(" ")}
              >
                <Icon size={14} aria-hidden="true" />
                {label}
              </a>
            );
          })}
        </nav>
      </header>

      <main className="md:ml-48">
        <div className="mx-auto max-w-[1600px] px-4 py-7 sm:px-7 lg:px-10">
          <header className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Conexões
            </h1>

            <p className="mt-2 text-xs leading-relaxed text-[#666666] sm:text-sm">
              Acompanhe aqui todas as conexões que sua startup fez dentro do
              Vértice.
            </p>
          </header>

          <section
            aria-labelledby="connections-title"
            className="min-h-[460px] overflow-hidden rounded-lg border border-[#ECEFF1] bg-white shadow-[0_2px_3px_rgba(0,0,0,0.16)]"
          >
            <div className="flex flex-col gap-4 border-b border-[#ECECEC] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="connections-title" className="text-sm font-medium">
                    Investidores conectados
                  </h2>

                  <span className="rounded-full bg-[#FFF1EB] px-2.5 py-1 text-[10px] font-medium text-[#EF5948]">
                    {connections.length}
                  </span>
                </div>

                <p className="mt-1.5 text-[11px] text-[#888888]">
                  Consulte os dados e acesse o perfil de cada investidor.
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <label htmlFor="connection-search" className="sr-only">
                  Buscar por nome, localização ou segmento
                </label>

                <FiSearch
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]"
                />

                <input
                  id="connection-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar investidor..."
                  className="h-10 w-full rounded-lg border border-[#DDDDDD] bg-white pl-10 pr-3 text-xs outline-none transition placeholder:text-[#999999] focus:border-[#EF5948] focus:ring-2 focus:ring-[#EF5948]/10"
                />
              </div>
            </div>

            <div
              role="region"
              aria-label="Tabela de conexões"
              tabIndex={0}
              className="overflow-x-auto focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#EF5948]"
            >
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <caption className="sr-only">
                  Conexões da startup com dados dos investidores e links para
                  seus perfis.
                </caption>

                <thead>
                  <tr className="border-b border-[#EAEAEA] bg-[#FAFBFC] text-[11px] text-[#777777]">
                    <th scope="col" className="px-6 py-4 font-medium">
                      Investidor
                    </th>
                    <th scope="col" className="px-4 py-4 font-medium">
                      Localização
                    </th>
                    <th scope="col" className="px-4 py-4 font-medium">
                      Segmentos de interesse
                    </th>
                    <th scope="col" className="px-4 py-4 font-medium">
                      Faixa de investimento
                    </th>
                    <th scope="col" className="px-4 py-4 font-medium">
                      Conectado em
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right font-medium"
                    >
                      Perfil
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EEEEEE]">
                  {filteredConnections.map((connection) => {
                    const profileHref = getInvestorProfileHref(
                      connection.investorId,
                    );

                    return (
                      <tr
                        key={connection.id}
                        className="transition-colors hover:bg-[#FFFCFA]"
                      >
                        <th scope="row" className="px-6 py-5 font-normal">
                          <a
                            href={profileHref}
                            className="group flex items-center gap-3 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EF5948]"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F8E3DA] text-xs font-medium text-[#B9573E]">
                              {connection.photoUrl ? (
                                <img
                                  src={connection.photoUrl}
                                  alt=""
                                  loading="lazy"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span aria-hidden="true">
                                  {getInitials(connection.name)}
                                </span>
                              )}
                            </div>

                            <div>
                              <p className="whitespace-nowrap text-xs font-medium text-[#303030] group-hover:text-[#EF5948]">
                                {connection.name}
                              </p>

                              <p className="mt-1 text-[10px] text-[#888888]">
                                {connection.type}
                              </p>
                            </div>
                          </a>
                        </th>

                        <td className="px-4 py-5 text-xs text-[#777777]">
                          <span className="whitespace-nowrap">
                            {connection.city}/{connection.state}
                          </span>
                        </td>

                        <td className="px-4 py-5">
                          <div className="flex max-w-56 flex-wrap gap-1.5">
                            {connection.segments.map((segment) => (
                              <span
                                key={segment}
                                className="rounded-full bg-[#FFF2EC] px-2.5 py-1 text-[10px] text-[#D96648]"
                              >
                                {segment}
                              </span>
                            ))}

                            {connection.segments.length === 0 && (
                              <span className="text-xs text-[#999999]">
                                Não informado
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-5 text-[11px] text-[#777777]">
                          <span className="whitespace-nowrap">
                            {currencyFormatter.format(connection.ticketMin)}
                          </span>
                          <span className="mx-1">a</span>
                          <span className="whitespace-nowrap">
                            {currencyFormatter.format(connection.ticketMax)}
                          </span>
                        </td>

                        <td className="px-4 py-5 text-xs text-[#777777]">
                          <time dateTime={connection.connectedAt}>
                            {formatDate(connection.connectedAt)}
                          </time>
                        </td>

                        <td className="px-6 py-5 text-right">
                          <a
                            href={profileHref}
                            aria-label={`Ver perfil de ${connection.name}`}
                            className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[#EF5948] px-3 py-2 text-[11px] font-medium text-[#EF5948] transition hover:bg-[#EF5948] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948]"
                          >
                            Ver perfil
                            <FiArrowUpRight size={14} aria-hidden="true" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredConnections.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <FiLink
                          size={28}
                          aria-hidden="true"
                          className="mx-auto mb-3 text-[#EF5948]"
                        />

                        <p className="text-sm font-medium text-[#555555]">
                          {connections.length === 0
                            ? "Sua startup ainda não possui conexões."
                            : "Nenhum investidor encontrado."}
                        </p>

                        <p className="mt-2 text-xs text-[#888888]">
                          {connections.length === 0
                            ? "As conexões confirmadas aparecerão nesta tabela."
                            : "Tente buscar por outro nome, localização ou segmento."}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="border-t border-[#EEEEEE] px-6 py-4">
              <p role="status" className="text-[11px] text-[#888888]">
                Exibindo {filteredConnections.length} de {connections.length}{" "}
                conexões
              </p>
            </footer>
          </section>
        </div>
      </main>
    </div>
  );
}
