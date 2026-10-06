import type { ReactNode } from "react";
import { FiChevronRight, FiMoreHorizontal } from "react-icons/fi";
import ISidebar from "../../components/ISidebar";

export type InvestorProfile = {
  name: string;
  sector: string;
  stage: string;
  location: string;
  about: string;
  career: string;
  lookingFor: string;
  startupSegment: string;
  startupStage: string;
  startupLocation: string;
  funding: string;
  avatarUrl?: string;
};

type InvestorProfileProps = {
  investor?: InvestorProfile;
  onOptions?: () => void;
};

const investorExample: InvestorProfile = {
  name: "Isabel Alves",
  sector: "Setor",
  stage: "Estágio",
  location: "Cidade/Estado",
  about:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis venenatis, nunc a tincidunt malesuada, odio diam varius nunc, sit amet tristique dolor enim id libero. Donec venenatis mi dui, lobortis ultrices urna volutpat vitae. Morbi ut nibh et massa interdum ultrices id euismod odio. Phasellus malesuada blandit vehicula.",
  career:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis venenatis, nunc a tincidunt malesuada, odio diam varius nunc, sit amet tristique dolor enim id libero. Donec venenatis mi dui, lobortis ultrices urna volutpat vitae. Morbi ut nibh et massa interdum ultrices id euismod odio.",
  lookingFor:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis venenatis, nunc a tincidunt malesuada, odio diam varius nunc, sit amet tristique dolor enim id libero. Donec venenatis mi dui, lobortis ultrices urna volutpat vitae. Morbi ut nibh et massa interdum ultrices id euismod odio.",
  startupSegment: "Segmento",
  startupStage: "Estágio",
  startupLocation: "Cidade - Estado",
  funding: "R$ 100 Mil - 500 Mil",
};

const cardClass =
  "rounded-lg border border-[#ECEFF1] bg-white shadow-[0_2px_3px_rgba(0,0,0,0.16)]";

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

export default function IPerfil({
  investor = investorExample,
  onOptions,
}: InvestorProfileProps = {}) {
  return (
    <main
      className="min-h-screen bg-[#F5F8FA] text-[#252525]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
        <ISidebar/>
      <div className="md:ml-48">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-7 lg:px-9">
        <nav
          aria-label="Localização"
          className="mb-6 flex items-center gap-2 text-xs text-[#777777]"
        >
          <a href="/investors/perfil" className="hover:text-[#ef5d4d]">
            Perfil
          </a>
          <FiChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">{investor.name}</span>
        </nav>

        <header
          className={`${cardClass} relative mb-6 flex items-center gap-5 p-5 sm:gap-6 sm:p-6`}
        >
          <div className="shrink-0 rounded-[5px] bg-gradient-to-r from-[#e4007e] to-[#00bdd6] p-[3px]">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[4px] bg-[#20292d] sm:h-24 sm:w-24">
              {investor.avatarUrl ? (
                <img
                  src={investor.avatarUrl}
                  alt={`Foto de ${investor.name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-medium italic tracking-tight text-white sm:text-4xl">
                  {investor.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </span>
              )}
            </div>
          </div>

          <div className="min-w-0 flex-1 self-center">
            <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
              {investor.name}
            </h1>
            <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#EF5948] sm:text-sm">
              <li>{investor.sector}</li>
              <li className="border-l border-[#D5D5D5] pl-3">
                {investor.stage}
              </li>
              <li className="border-l border-[#D5D5D5] pl-3">
                {investor.location}
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onOptions}
            aria-label={`Opções do perfil de ${investor.name}`}
            className="absolute right-[18px] top-[30px] flex h-7 w-7 items-center justify-center rounded-md text-[#222222] transition hover:bg-[#f4f4f4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ef5d4d]"
          >
            <FiMoreHorizontal size={20} aria-hidden="true" />
          </button>
        </header>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <div className="grid min-w-0 gap-5">
            <ProfileCard title="Sobre o (a) Investidor (a)">
              <p className="text-xs leading-relaxed text-[#777777]">
                {investor.about}
              </p>
            </ProfileCard>

            <div className="grid items-stretch gap-5 sm:grid-cols-2">
              <ProfileCard title="Carreira">
                <p className="text-xs leading-relaxed text-[#777777]">
                  {investor.career}
                </p>
              </ProfileCard>
              <ProfileCard title="O que está buscando">
                <p className="text-xs leading-relaxed text-[#777777]">
                  {investor.lookingFor}
                </p>
              </ProfileCard>
            </div>
          </div>

          <div className="grid min-w-0 gap-5">
            <ProfileCard title="Informações da Startup">
              <dl className="divide-y divide-[#bcbcbc]">
                {[
                  ["Segmento", investor.startupSegment],
                  ["Estágio", investor.startupStage],
                  ["Cidade/Estado", investor.startupLocation],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-start justify-between gap-4 py-3 text-[11px] text-[#777777] first:pt-0 last:pb-0"
                  >
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </ProfileCard>

            <ProfileCard title="Captação">
              <p className="text-xs text-[#888888]">
                Buscando investimento
              </p>
              <p className="mt-2 text-xl font-medium leading-snug text-[#EF5948]">
                {investor.funding}
              </p>
            </ProfileCard>
          </div>
        </div>
        </div>
      </div>
    </main>
  );
}
