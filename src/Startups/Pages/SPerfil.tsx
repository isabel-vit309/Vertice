import type { ReactNode } from "react";
import {
  FiChevronRight,
  FiExternalLink,
  FiMoreHorizontal,
} from "react-icons/fi";
import SSidebar from "../../components/SSidebar";

type Startup = {
  nome: string;
  sigla: string;
  logoUrl?: string;
  setor: string;
  segmento: string;
  estagio: string;
  cidade: string;
  estado: string;
  anoFundacao: string;
  cnpj: string;
  sobre: string;
  problema: string;
  solucao: string;
  diferencial: string;
  captacao: string;
  pitchDeckUrl?: string;
  businessCanvasUrl?: string;
  videoUrl?: string;
};

type SPerfilStartupProps = {
  startup?: Startup;
  logoPlataformaUrl?: string;
  onOptions?: () => void;
};

const startupExemplo: Startup = {
  nome: "Avenue",
  sigla: "AV",
  setor: "Setor",
  segmento: "Segmento",
  estagio: "Estágio",
  cidade: "Cidade",
  estado: "Estado",
  anoFundacao: "2026",
  cnpj: "00.000.000/0000-00",
  sobre:
    "Apresente a trajetória da startup, seu propósito e o mercado em que atua. " +
    "Explique como a empresa surgiu, quem são seus clientes e quais resultados " +
    "já alcançou. Este espaço permite que investidores e parceiros conheçam " +
    "o negócio e entendam sua visão de futuro.",
  problema:
    "Descreva o principal problema enfrentado pelo seu público. " +
    "Explique como essa dificuldade afeta seus clientes e por que " +
    "as alternativas disponíveis ainda não atendem às suas necessidades.",
  solucao:
    "Apresente sua solução e explique como ela funciona na prática. " +
    "Mostre como seu produto ou serviço resolve o problema identificado " +
    "e quais benefícios oferece aos clientes.",
  diferencial:
    "Destaque os fatores que diferenciam sua startup no mercado, como " +
    "tecnologia própria, experiência da equipe, modelo de negócio ou " +
    "conhecimento do público. Explique por que esses fatores representam " +
    "uma vantagem competitiva.",
  captacao: "R$ 100 Mil - 500 Mil",
};

const cardClass =
  "rounded-lg border border-[#ECEFF1] bg-white " +
  "shadow-[0_2px_3px_rgba(0,0,0,0.16)]";

function ProfileCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${cardClass} p-5 ${className}`}>
      <span
        aria-hidden="true"
        className="mb-2 block h-[2px] w-7 bg-[#EF5948]"
      />

      <h2 className="mb-3 text-sm font-medium text-[#252525]">
        {title}
      </h2>

      {children}
    </section>
  );
}

function MaterialLink({
  label,
  href,
}: {
  label: string;
  href?: string;
}) {
  if (!href) {
    return (
      <span className="block py-2.5 text-xs text-[#919191]">
        {label}
        <span className="sr-only"> — não disponibilizado</span>
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-3 py-2.5 text-xs text-[#666666] transition hover:text-[#EF5948]"
    >
      {label}

      <FiExternalLink
        size={13}
        aria-hidden="true"
        className="shrink-0 text-[#999999] group-hover:text-[#EF5948]"
      />
    </a>
  );
}

export default function SPerfil({
  startup = startupExemplo,
  onOptions,
}: SPerfilStartupProps = {}) {
  const information = [
    { label: "Segmento", value: startup.segmento },
    { label: "Estágio", value: startup.estagio },
    {
      label: "Cidade/Estado",
      value: `${startup.cidade} - ${startup.estado}`,
    },
    { label: "Ano de Fundação", value: startup.anoFundacao },
    { label: "CNPJ", value: startup.cnpj },
  ];

  return (
    <div
      className="min-h-screen bg-[#F5F8FA] text-[#252525]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
     <SSidebar/>

      <main className="md:ml-48">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-7 lg:px-9">

          <nav
            aria-label="Localização"
            className="mb-6 flex items-center gap-2 text-xs text-[#777777]"
          >
            <a href="/perfil" className="hover:text-[#EF5948]">
              Perfil
            </a>

            <FiChevronRight size={12} aria-hidden="true" />

            <span aria-current="page">{startup.nome}</span>
          </nav>

       
          <header
            className={`${cardClass} relative mb-6 flex items-center gap-5 p-5 sm:gap-6 sm:p-6`}
          >
            <div className="shrink-0 rounded-md bg-gradient-to-r from-[#E4007E] to-[#00BDD6] p-[2px]">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[4px] bg-[#052B2B] sm:h-24 sm:w-24">
                {startup.logoUrl ? (
                  <img
                    src={startup.logoUrl}
                    alt={`Logo da ${startup.nome}`}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <span className="text-3xl font-medium italic tracking-tight text-white sm:text-4xl">
                    {startup.sigla}
                  </span>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1 pr-6">
              <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                {startup.nome}
              </h1>

              <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#EF5948] sm:text-sm">
                <li>{startup.setor}</li>

                <li className="border-l border-[#D5D5D5] pl-3">
                  {startup.estagio}
                </li>

                <li className="border-l border-[#D5D5D5] pl-3">
                  {startup.cidade}/{startup.estado}
                </li>
              </ul>
            </div>

            {onOptions && (
              <button
                type="button"
                onClick={onOptions}
                aria-label={`Opções do perfil de ${startup.nome}`}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-[#444444] transition hover:bg-[#F5F5F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EF5948]"
              >
                <FiMoreHorizontal size={21} aria-hidden="true" />
              </button>
            )}
          </header>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
    
            <div className="grid min-w-0 gap-5">
              <ProfileCard title="Sobre a Startup">
                <p className="whitespace-pre-line text-xs leading-relaxed text-[#777777]">
                  {startup.sobre}
                </p>
              </ProfileCard>

              <div className="grid items-stretch gap-5 sm:grid-cols-2">
                <ProfileCard title="Problema que resolvemos">
                  <p className="whitespace-pre-line text-xs leading-relaxed text-[#777777]">
                    {startup.problema}
                  </p>
                </ProfileCard>

                <ProfileCard title="Nossa solução">
                  <p className="whitespace-pre-line text-xs leading-relaxed text-[#777777]">
                    {startup.solucao}
                  </p>
                </ProfileCard>
              </div>

              <ProfileCard
                title="Diferencial competitivo"
                className="min-h-40"
              >
                <p className="whitespace-pre-line text-xs leading-relaxed text-[#777777]">
                  {startup.diferencial}
                </p>
              </ProfileCard>
            </div>

            <div className="grid min-w-0 gap-5">
              <ProfileCard title="Informações da Startup">
                <dl className="divide-y divide-[#DADADA]">
                  {information.map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-4 py-3 text-[11px] text-[#777777] first:pt-0 last:pb-0"
                    >
                      <dt className="shrink-0">{label}</dt>

                      <dd className="min-w-0 break-words text-right">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </ProfileCard>

              <ProfileCard title="Captação">
                <p className="text-xs text-[#888888]">
                  Buscando investimentos
                </p>

                <p className="mt-2 text-xl font-medium leading-snug text-[#EF5948]">
                  {startup.captacao}
                </p>
              </ProfileCard>

              <ProfileCard title="Pitch e materiais">
                <div className="divide-y divide-[#BEBEBE]">
                  <MaterialLink
                    label="Pitch Deck"
                    href={startup.pitchDeckUrl}
                  />

                  <MaterialLink
                    label="Business Model Canvas"
                    href={startup.businessCanvasUrl}
                  />

                  <MaterialLink
                    label="Vídeo de apresentação"
                    href={startup.videoUrl}
                  />
                </div>
              </ProfileCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
