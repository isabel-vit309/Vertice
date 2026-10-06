import { useRef, useState } from "react";
import type { PointerEvent } from "react";

import {
  FiChevronLeft,
  FiChevronRight,
  FiLink,
  FiMoreVertical,
} from "react-icons/fi";
import ISidebar from "../../components/ISidebar";

type Investor = {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
  tags: string[];
  description: string;
  location: string;
  ticket: string;
};

type ConnectionDecision = "accepted" | "rejected";

type SMatchingProps = {
  investors?: Investor[];
  logoUrl?: string;
  onDecision?: (
    investor: Investor,
    decision: ConnectionDecision,
  ) => void | Promise<void>;
  onOptions?: (investor: Investor) => void;
};

const exampleInvestors: Investor[] = [
  {
    id: "verdi",
    name: "Verdi",
    role: "Startup Cadastrada",
    tags: ["Fintech", "SaaS"],
    description:
      "venenatis, nunc a tincidunt malesuada, odio diam varius nunc" +
      "venenatis, nunc a tincidunt malesuada, odio diam varius nunc" +
      "venenatis, nunc a tincidunt malesuada, odio diam varius nunc",
    location: "Recife/PE",
    ticket: "R$ 500 Mil - 600 Mil",
  },
  {
    id: "nexahub",
    name: "NexaHub",
    role: "Startup Cadastrada",
    tags: ["Fintech", "Educação"],
    description:
      "venenatis, nunc a tincidunt malesuada, odio diam varius nunc" +
      "venenatis, nunc a tincidunt malesuada, odio diam varius nunc" +
      "venenatis, nunc a tincidunt malesuada, odio diam varius nunc",
    location: "São Paulo/SP",
    ticket: "R$ 500 Mil - 600 Mil",
  },
  {
    id: "lumora",
    name: "Lumora",
    role: "Startup Cadastrada",
    tags: ["Healthtech"],
    description:
      "venenatis, nunc a tincidunt malesuada, odio diam varius nunc" +
      "venenatis, nunc a tincidunt malesuada, odio diam varius nunc " +
      "venenatis, nunc a tincidunt malesuada, odio diam varius nunc",
    location: "Belo Horizonte/MG",
    ticket: "R$ 500 Mil - 600 Mil",
  },
];


function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function SMatching({
  investors = exampleInvestors,
  onDecision,
  onOptions,
}: SMatchingProps = {}) {
  const [activeIndex, setActiveIndex] = useState(1);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const pointerStart = useRef<{
    id: number;
    x: number;
    y: number;
  } | null>(null);

  const pendingInvestors = investors.filter(
    (investor) => !resolvedIds.includes(investor.id),
  );

  const total = pendingInvestors.length;
  const currentIndex = total > 0 ? Math.min(activeIndex, total - 1) : 0;
  const activeInvestor = pendingInvestors[currentIndex];

  function navigate(direction: -1 | 1) {
    if (isSubmitting || total < 2) return;

    setActiveIndex((currentIndex + direction + total) % total);
    setError("");
  }

  async function handleDecision(decision: ConnectionDecision) {
    if (!activeInvestor || isSubmitting) return;

    setError("");
    setFeedback("");

    if (!onDecision) {
      setError("Conecte o serviço de conexões para concluir esta ação.");
      return;
    }

    setIsSubmitting(true);

    try {
      await onDecision(activeInvestor, decision);

      setResolvedIds((current) => [...current, activeInvestor.id]);

      setActiveIndex(Math.max(0, Math.min(currentIndex, total - 2)));

      setFeedback(
        decision === "accepted"
          ? `Conexão com ${activeInvestor.name} confirmada.`
          : `Pedido de ${activeInvestor.name} negado.`,
      );
    } catch {
      setError("Não foi possível atualizar a conexão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (
      isSubmitting ||
      !event.isPrimary ||
      event.button !== 0 ||
      (event.target instanceof Element && event.target.closest("button, a"))
    ) {
      return;
    }

    pointerStart.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;

    if (!start || start.id !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;

    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    navigate(deltaX < 0 ? 1 : -1);
  }

  function getCardOffset(index: number) {
    if (index === currentIndex) return 0;

    if (total === 2) {
      return index < currentIndex ? -1 : 1;
    }

    if (index === (currentIndex - 1 + total) % total) return -1;
    if (index === (currentIndex + 1) % total) return 1;

    return null;
  }

  return (
    <div
      className="min-h-screen bg-[#F5F8FA] text-[#222222]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <ISidebar />

      <main className="md:ml-48">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8 lg:px-10">
          <header>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Matching
            </h1>

            <p className="mt-2 text-xs leading-relaxed text-[#666666] sm:text-sm">
              Startups que combinam com seu perfil de investidor
            </p>
          </header>

          {total > 0 ? (
            <section
              aria-label="Pedidos de conexão"
              aria-roledescription="carrossel"
              aria-busy={isSubmitting}
              className="mt-8 sm:mt-12"
            >
              <div className="relative">
                <div
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={() => {
                    pointerStart.current = null;
                  }}
                  className="relative h-[440px] touch-pan-y overflow-hidden sm:h-[460px]"
                >
                  {pendingInvestors.map((investor, index) => {
                    const offset = getCardOffset(index);

                    if (offset === null) return null;

                    const isActive = offset === 0;

                    return (
                      <article
                        key={investor.id}
                        aria-hidden={!isActive}
                        aria-label={`${investor.name}, ${index + 1} de ${total}`}
                        aria-roledescription="slide"
                        className={[
                          "absolute left-1/2 top-3 flex min-h-[390px]",
                          "w-[calc(100%-1rem)] max-w-[350px] flex-col sm:top-5 sm:min-h-[410px] sm:w-[calc(100%-2rem)]",
                          "rounded-xl border border-[#F0F0F0] bg-white",
                          "p-4 shadow-[0_3px_3px_rgba(0,0,0,0.22)] sm:p-6",
                          "transition-[transform,opacity] duration-300 ease-out",
                          "motion-reduce:transition-none",
                          isActive ? "z-20" : "pointer-events-none z-10",
                        ].join(" ")}
                        style={{
                          transform: isActive
                            ? "translateX(-50%)"
                            : `translateX(calc(-50% + ${
                                offset * 165
                              }px)) translateY(8px) rotate(${
                                offset * 5
                              }deg) scale(0.94)`,
                          opacity: isActive ? 1 : 0.95,
                        }}
                      >
                        <div className="mb-3 flex items-center justify-between sm:mb-4">
                          <span className="rounded-full bg-[#FAF5F2] px-4 py-1 text-[9px] font-medium text-[#EF5948]">
                            Pediu conexão
                          </span>

                          {onOptions && (
                            <button
                              type="button"
                              tabIndex={isActive ? 0 : -1}
                              disabled={isSubmitting}
                              onClick={() => onOptions(investor)}
                              aria-label={`Opções de ${investor.name}`}
                              className="rounded p-1 text-[#444444] hover:bg-[#F5F5F5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EF5948]"
                            >
                              <FiMoreVertical size={16} aria-hidden="true" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#FCE3DA] text-base font-semibold text-[#B94D35] sm:h-16 sm:w-16 sm:text-lg">
                            {investor.photoUrl ? (
                              <img
                                src={investor.photoUrl}
                                alt={investor.name}
                                draggable={false}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getInitials(investor.name)
                            )}
                          </div>

                          <div className="min-w-0">
                            <h2 className="break-words text-[15px] font-medium sm:text-base">
                              {investor.name}
                            </h2>

                            <p className="mt-0.5 text-[9px] text-[#777777] sm:text-[10px]">
                              {investor.role}
                            </p>

                            <ul className="mt-1.5 flex flex-wrap gap-1.5 sm:mt-2">
                              {investor.tags.map((tag) => (
                                <li
                                  key={tag}
                                  className="rounded-full bg-[#FFF5F1] px-2 py-0.5 text-[8px] text-[#EF5948] sm:px-2.5"
                                >
                                  {tag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <p className="mt-4 text-[10px] leading-relaxed text-[#777777] sm:mt-5 sm:text-[11px]">
                          {investor.description}
                        </p>

                        <dl className="mb-4 mt-3 divide-y divide-[#BEBEBE] border-y border-[#BEBEBE] text-[10px] text-[#777777] sm:mb-6 sm:mt-4 sm:text-[11px]">
                          <div className="flex justify-between gap-3 py-2 sm:py-2.5">
                            <dt>Localização</dt>
                            <dd className="text-right">{investor.location}</dd>
                          </div>

                          <div className="flex justify-between gap-3 py-2 sm:py-2.5">
                            <dt className="shrink-0">Ticket médio</dt>
                            <dd className="text-right">{investor.ticket}</dd>
                          </div>
                        </dl>

                        <div className="mt-auto grid grid-cols-2 gap-2.5 sm:gap-4">
                          <button
                            type="button"
                            tabIndex={isActive ? 0 : -1}
                            disabled={!isActive || isSubmitting}
                            onClick={() => handleDecision("rejected")}
                            className="min-h-9 rounded-lg border border-[#EF5948] px-2 py-2 text-[10px] font-medium text-[#EF5948] transition hover:bg-[#FFF4F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948] disabled:opacity-60 sm:px-3 sm:text-[11px]"
                          >
                            Passar
                          </button>

                          <button
                            type="button"
                            tabIndex={isActive ? 0 : -1}
                            disabled={!isActive || isSubmitting}
                            onClick={() => handleDecision("accepted")}
                            className="min-h-9 rounded-lg bg-[#EF5948] px-2 py-2 text-[10px] font-medium text-white transition hover:bg-[#DA4939] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948] disabled:opacity-60 sm:px-3 sm:text-[11px]"
                          >
                            {isActive && isSubmitting
                              ? "Aguarde..."
                              : "Solicitar Conexão"}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={total < 2 || isSubmitting}
                  aria-label="Investidor anterior"
                  className="absolute left-0 top-[170px] z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#EF5948] shadow-[0_2px_3px_rgba(0,0,0,0.25)] transition hover:bg-[#FFF4F1] disabled:opacity-40 sm:top-[210px] sm:h-12 sm:w-12"
                >
                  <FiChevronLeft size={26} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate(1)}
                  disabled={total < 2 || isSubmitting}
                  aria-label="Próximo investidor"
                  className="absolute right-0 top-[170px] z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#EF5948] shadow-[0_2px_3px_rgba(0,0,0,0.25)] transition hover:bg-[#FFF4F1] disabled:opacity-40 sm:top-[210px] sm:h-12 sm:w-12"
                >
                  <FiChevronRight size={26} aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center">
                {pendingInvestors.map((investor, index) => (
                  <button
                    key={investor.id}
                    type="button"
                    disabled={isSubmitting}
                    aria-label={`Ver pedido de ${investor.name}`}
                    aria-current={index === currentIndex ? "true" : undefined}
                    onClick={() => {
                      setActiveIndex(index);
                      setError("");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EF5948]"
                  >
                    <span
                      className={[
                        "h-2.5 w-2.5 rounded-full transition-colors",
                        index === currentIndex
                          ? "bg-[#EF5948]"
                          : "bg-[#D8D8D8]",
                      ].join(" ")}
                    />
                  </button>
                ))}
              </div>

              <p className="mt-2 text-center text-[11px] text-[#888888]">
                Deslize para ver os pedidos e escolha passar ou solicitar
                conexão.
              </p>
            </section>
          ) : (
            <section className="mx-auto mt-20 max-w-md rounded-xl border border-[#ECECEC] bg-white px-6 py-12 text-center shadow-sm">
              <FiLink
                size={30}
                aria-hidden="true"
                className="mx-auto mb-4 text-[#EF5948]"
              />

              <h2 className="text-lg font-medium">Nenhuma conexão pendente</h2>

              <p className="mt-2 text-sm leading-relaxed text-[#777777]">
                Novos pedidos de investidores aparecerão aqui.
              </p>
            </section>
          )}

          {error && (
            <p
              role="alert"
              className="mx-auto mt-5 max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-xs text-red-700"
            >
              {error}
            </p>
          )}

          {feedback && (
            <p
              role="status"
              className="mx-auto mt-5 max-w-md rounded-lg bg-green-50 px-4 py-3 text-center text-xs text-green-700"
            >
              {feedback}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
