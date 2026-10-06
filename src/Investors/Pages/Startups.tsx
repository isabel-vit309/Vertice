import { useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import ISidebar from "../../components/ISidebar";

type Startup = {
  id: string;
  name: string;
  location: string;
  segment: string;
  stage: string;
  description: string;
  tone: string;
};

const startups: Startup[] = [
  {
    id: "nexahub",
    name: "NexaHub",
    location: "Recife/PE",
    segment: "Fintech",
    stage: "Captação",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis venenatis, nunc a tincidunt malesuada, odio diam varius nunc, sit amet tristique dolor enim id libero.",
    tone: "bg-[#7250f4]",
  },
  {
    id: "verdi",
    name: "Verdi",
    location: "São Paulo/SP",
    segment: "Healthtech",
    stage: "Captação",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis venenatis, nunc a tincidunt malesuada, odio diam varius nunc, sit amet tristique dolor enim id libero.",
    tone: "bg-[#2c9f4e]",
  },
  {
    id: "lumora",
    name: "Lumora",
    location: "Belo Horizonte/MG",
    segment: "Healthtech",
    stage: "Captação",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis venenatis, nunc a tincidunt malesuada, odio diam varius nunc, sit amet tristique dolor enim id libero.",
    tone: "bg-[#546cf4]",
  },
  {
    id: "princehub",
    name: "PrinceHub",
    location: "Recife/PE",
    segment: "Edtech",
    stage: "Captação",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis venenatis, nunc a tincidunt malesuada, odio diam varius nunc, sit amet tristique dolor enim id libero.",
    tone: "bg-[#24104c]",
  },
  {
    id: "neoncard",
    name: "NeonCard",
    location: "São Paulo/SP",
    segment: "Fintech",
    stage: "Captação",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis venenatis, nunc a tincidunt malesuada, odio diam varius nunc, sit amet tristique dolor enim id libero.",
    tone: "bg-[#07051b]",
  },
  {
    id: "sicarios",
    name: "Sicarios",
    location: "Curitiba/PR",
    segment: "SaaS",
    stage: "Captação",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis venenatis, nunc a tincidunt malesuada, odio diam varius nunc, sit amet tristique dolor enim id libero.",
    tone: "bg-[#161616]",
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export default function Startups() {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("");
  const [stage, setStage] = useState("");
  const [location, setLocation] = useState("");

  const filteredStartups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return startups.filter((startup) => {
      const matchesSearch =
        !normalizedSearch ||
        startup.name.toLowerCase().includes(normalizedSearch);
      const matchesSegment = !segment || startup.segment === segment;
      const matchesStage = !stage || startup.stage === stage;
      const matchesLocation = !location || startup.location === location;

      return matchesSearch && matchesSegment && matchesStage && matchesLocation;
    });
  }, [location, search, segment, stage]);

  return (
    <div
      className="min-h-screen bg-[#F5F8FA] text-[#222222]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <ISidebar />

      <main className="md:ml-48">
        <div className="mx-auto max-w-7xl px-3 pb-10 pt-6 sm:px-7 lg:px-9">
          <header>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Startups
            </h1>
            <p className="mt-1 text-[11px] leading-relaxed text-[#666666] sm:text-xs">
              Fique por dentro de todas as startups que estão cadastradas no Vértice
            </p>
          </header>

          <div className="mt-5 flex flex-wrap gap-3">
            <label className="relative block w-full max-w-[340px] flex-1">
              <span className="sr-only">Buscar empresa</span>
              <FiSearch
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#777777]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                placeholder="Buscar empresa..."
                className="h-10 w-full rounded-lg border border-[#d2d6d8] bg-white pl-10 pr-3 text-sm outline-none transition focus:border-[#ef5948] focus:ring-2 focus:ring-[#ef5948]/10"
              />
            </label>

            <select
              value={segment}
              onChange={(event) => setSegment(event.currentTarget.value)}
              aria-label="Filtrar por segmento"
              className="h-10 w-full min-w-[145px] rounded-lg border border-[#d2d6d8] bg-white px-3 text-xs text-[#666666] outline-none transition focus:border-[#ef5948] focus:ring-2 focus:ring-[#ef5948]/10 sm:w-[155px]"
            >
              <option value="">Segmento</option>
              {[...new Set(startups.map((startup) => startup.segment))].map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ),
              )}
            </select>

            <select
              value={stage}
              onChange={(event) => setStage(event.currentTarget.value)}
              aria-label="Filtrar por estágio"
              className="h-10 w-full min-w-[145px] rounded-lg border border-[#d2d6d8] bg-white px-3 text-xs text-[#666666] outline-none transition focus:border-[#ef5948] focus:ring-2 focus:ring-[#ef5948]/10 sm:w-[155px]"
            >
              <option value="">Estágio</option>
              <option value="Captação">Captação</option>
            </select>

            <select
              value={location}
              onChange={(event) => setLocation(event.currentTarget.value)}
              aria-label="Filtrar por localização"
              className="h-10 w-full min-w-[145px] rounded-lg border border-[#d2d6d8] bg-white px-3 text-xs text-[#666666] outline-none transition focus:border-[#ef5948] focus:ring-2 focus:ring-[#ef5948]/10 sm:w-[155px]"
            >
              <option value="">Localização</option>
              {[...new Set(startups.map((startup) => startup.location))].map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 min-[620px]:grid-cols-2 min-[980px]:grid-cols-3">
            {filteredStartups.map((startup) => (
              <article
                key={startup.id}
                className="flex min-h-[300px] flex-col rounded-lg border border-[#e9ecee] bg-white p-5 shadow-[0_2px_3px_rgba(0,0,0,0.18)] sm:p-6"
              >
                <span className="w-fit rounded-full bg-[#FAF5F2] px-8 py-1.5 text-[10px] font-medium leading-none text-[#EF5948]">
                  Startup
                </span>

                <div className="mt-4 flex items-center gap-4">
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${startup.tone} text-xl font-semibold text-white`}
                  >
                    {getInitials(startup.name)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-medium leading-tight sm:text-xl">
                      {startup.name}
                    </h2>
                    <p className="mt-1 text-xs text-[#777777]">
                      Startup cadastrada
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-[#FFF5F1] px-2.5 py-1 text-[9px] text-[#EF5948]">
                        {startup.segment}
                      </span>
                      <span className="rounded-full bg-[#FFF5F1] px-2.5 py-1 text-[9px] text-[#EF5948]">
                        {startup.stage}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-xs leading-relaxed text-[#666666] sm:text-[13px]">
                  {startup.description}
                </p>

                <a
                  href="/startups/perfil"
                  className="mt-5 flex h-[36px] items-center justify-center rounded-md border border-[#EF5948] text-xs font-medium text-[#EF5948] transition hover:bg-[#FFF4F1] sm:text-[13px]"
                >
                  Visualizar Perfil
                </a>
              </article>
            ))}
          </div>

          {filteredStartups.length === 0 && (
            <p className="mt-8 text-center text-sm text-[#777777]">
              Nenhuma startup encontrada.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
