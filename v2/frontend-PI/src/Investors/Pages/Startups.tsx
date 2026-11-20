import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ISidebar from "../../components/ISidebar";
import Avatar from "../../components/Avatar";
import Combobox from "../../components/Combobox";
import { toOptions } from "../../data/options";
import { ApiError, api } from "../../services/api";
import type { StartupFeedItem } from "../../services/api";
import { getSession } from "../../services/session";

type Startup = StartupFeedItem;

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

export default function Startups() {
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("");
  const [stage, setStage] = useState("");
  const [location, setLocation] = useState("");
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!getSession()) {
      navigate("/investors/login", { replace: true });
      return;
    }

    let active = true;
    api
      .listarStartups()
      .then((data) => {
        if (active) setStartups(data);
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.status === 401) {
          navigate("/investors/login", { replace: true });
          return;
        }
        setLoadError(
          error instanceof Error ? error.message : "Não foi possível carregar as startups.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [navigate]);

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
  }, [location, search, segment, stage, startups]);

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
            <label className="relative block w-full lg:w-auto lg:max-w-[340px] lg:flex-1">
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

            <div className="w-full sm:w-[175px]">
              <Combobox
                aria-label="Filtrar por segmento"
                value={segment}
                onChange={setSegment}
                options={toOptions(uniqueSorted(startups.map((startup) => startup.segment)))}
                placeholder="Segmento (todos)"
                className="h-10 w-full rounded-lg border border-[#d2d6d8] bg-white px-3 text-xs text-[#666666] outline-none transition focus:border-[#ef5948] focus:ring-2 focus:ring-[#ef5948]/10"
              />
            </div>

            <div className="w-full sm:w-[175px]">
              <Combobox
                aria-label="Filtrar por estágio"
                value={stage}
                onChange={setStage}
                options={toOptions(uniqueSorted(startups.map((startup) => startup.stage)))}
                placeholder="Estágio (todos)"
                className="h-10 w-full rounded-lg border border-[#d2d6d8] bg-white px-3 text-xs text-[#666666] outline-none transition focus:border-[#ef5948] focus:ring-2 focus:ring-[#ef5948]/10"
              />
            </div>

            <div className="w-full sm:w-[175px]">
              <Combobox
                aria-label="Filtrar por localização"
                value={location}
                onChange={setLocation}
                options={toOptions(uniqueSorted(startups.map((startup) => startup.location)))}
                placeholder="Localização (todos)"
                className="h-10 w-full rounded-lg border border-[#d2d6d8] bg-white px-3 text-xs text-[#666666] outline-none transition focus:border-[#ef5948] focus:ring-2 focus:ring-[#ef5948]/10"
              />
            </div>
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
                  <Avatar
                    userId={startup.userId}
                    hasPhoto={startup.hasPhoto}
                    name={startup.name}
                    className={`h-16 w-16 rounded-full ${startup.tone} text-xl`}
                  />
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
                  {startup.description || "Descrição não informada."}
                </p>

                <a
                  href={`/investors/startups/${startup.id}`}
                  aria-label={`Visualizar perfil de ${startup.name}`}
                  className="mt-5 flex h-[36px] items-center justify-center rounded-md border border-[#EF5948] text-xs font-medium text-[#EF5948] transition hover:bg-[#FFF4F1] sm:text-[13px]"
                >
                  Visualizar Perfil
                </a>
              </article>
            ))}
          </div>

          {loading && (
            <p role="status" className="mt-8 text-center text-sm text-[#777777]">
              Carregando startups...
            </p>
          )}

          {loadError && (
            <p role="alert" className="mt-8 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-700">
              {loadError}
            </p>
          )}

          {!loading && !loadError && filteredStartups.length === 0 && (
            <p className="mt-8 text-center text-sm text-[#777777]">
              Nenhuma startup encontrada.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
