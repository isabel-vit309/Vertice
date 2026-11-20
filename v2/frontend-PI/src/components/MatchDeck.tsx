// Carrossel de cartões usado nas telas de matching dos dois portais.
// Mantém o visual original (cartões empilhados, arrastar para os lados, dois botões de decisão).
import { useRef, useState } from "react";
import type { PointerEvent, ReactNode } from "react";
import { FiChevronLeft, FiChevronRight, FiExternalLink, FiFileText, FiLink } from "react-icons/fi";

import Avatar from "./Avatar";

export type DeckItem = {
  id: string;
  name: string;
  role: string;
  tags: string[];
  description: string;
  location: string;
  ticket: string;
  /** Texto da etiqueta no topo do cartão. */
  badge: string;
  /** Afinidade de 0 a 100, quando houver. */
  affinity?: number;
  /** Etiqueta secundária (ex.: "Análise por IA"). */
  chip?: string;
  /** Explicação curta de por que os perfis combinam. */
  summary?: string;
  /** Usuário dono do cartão (para a foto de perfil). */
  userId?: number;
  hasPhoto?: boolean;
  /** Anexos opcionais da startup (pitch deck, canvas, link de apresentação). */
  materials?: DeckMaterial[];
};

export type DeckMaterial = { label: string; href?: string; onOpen?: () => Promise<void> | void };

export type DeckDecision = "accepted" | "rejected";

type MatchDeckProps = {
  sidebar: ReactNode;
  title: string;
  subtitle: string;
  /** Faixa informativa acima do carrossel (critérios, situação da IA). */
  notice?: ReactNode;
  items: DeckItem[];
  loading?: boolean;
  loadError?: string;
  acceptLabel: string;
  rejectLabel: string;
  acceptedMessage: (name: string) => string;
  rejectedMessage: (name: string) => string;
  emptyTitle: string;
  emptyText: string;
  hint: string;
  onDecision: (item: DeckItem, decision: DeckDecision) => Promise<void>;
  /** Abre os detalhes do cartão (análise completa, dossiê). */
  onDetails?: (item: DeckItem) => void;
  detailsLabel?: string;
};

function MaterialChip({ material, active }: { material: DeckMaterial; active: boolean }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const chip =
    "inline-flex items-center gap-1 rounded-md border border-[#F3C9C1] bg-[#FFF8F6] px-2 py-1 text-[10px] font-medium " +
    "text-[#C2412F] transition hover:border-[#EF5948] hover:bg-[#FFEFEB] focus-visible:outline focus-visible:outline-2 " +
    "focus-visible:outline-[#EF5948] disabled:opacity-60";
  if (material.href) {
    return (
      <a href={material.href} target="_blank" rel="noopener noreferrer" tabIndex={active ? 0 : -1} className={chip}>
        <FiExternalLink size={11} aria-hidden="true" /> {material.label}
      </a>
    );
  }
  return (
    <button
      type="button"
      tabIndex={active ? 0 : -1}
      disabled={!active || busy}
      title={failed ? "Não foi possível baixar. Tente novamente." : `Baixar ${material.label}`}
      onClick={async () => {
        setBusy(true);
        setFailed(false);
        try {
          await material.onOpen?.();
        } catch {
          setFailed(true);
        } finally {
          setBusy(false);
        }
      }}
      className={`${chip} ${failed ? "border-red-300 text-red-600" : ""}`}
    >
      <FiFileText size={11} aria-hidden="true" /> {busy ? "Baixando..." : material.label}
    </button>
  );
}

export default function MatchDeck({
  sidebar,
  title,
  subtitle,
  notice,
  items,
  loading = false,
  loadError = "",
  acceptLabel,
  rejectLabel,
  acceptedMessage,
  rejectedMessage,
  emptyTitle,
  emptyText,
  hint,
  onDecision,
  onDetails,
  detailsLabel = "Ver análise completa",
}: MatchDeckProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const pointerStart = useRef<{ id: number; x: number; y: number } | null>(null);
  // Cada troca de cartão recebe um número: alterna entre duas animações idênticas para
  // reiniciar o "rastro" de velocidade mesmo em cliques seguidos.
  const [swipe, setSwipe] = useState<{ dir: -1 | 1; n: number }>({ dir: 1, n: 0 });

  const total = items.length;
  const currentIndex = total > 0 ? Math.min(activeIndex, total - 1) : 0;
  const activeItem = items[currentIndex];

  function navigate(direction: -1 | 1) {
    if (isSubmitting || total < 2) return;
    setActiveIndex((currentIndex + direction + total) % total);
    setSwipe((current) => ({ dir: direction, n: current.n + 1 }));
    setError("");
  }

  async function handleDecision(decision: DeckDecision) {
    if (!activeItem || isSubmitting) return;
    setError("");
    setFeedback("");
    setIsSubmitting(true);
    try {
      await onDecision(activeItem, decision);
      setActiveIndex(Math.max(0, Math.min(currentIndex, total - 2)));
      setFeedback(
        decision === "accepted" ? acceptedMessage(activeItem.name) : rejectedMessage(activeItem.name),
      );
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "Não foi possível registrar a decisão. Tente novamente.",
      );
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
    pointerStart.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
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
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY)) return;
    navigate(deltaX < 0 ? 1 : -1);
  }

  /**
   * Posição do cartão em relação ao ativo: 0 (centro), ±1 (laterais visíveis) ou ±2
   * (fora do palco, invisível). Os ±2 ficam montados para que o cartão que entra e o que
   * sai também deslizem, em vez de surgir ou sumir de repente.
   */
  function getCardOffset(index: number) {
    if (index === currentIndex) return 0;
    if (total === 2) return index < currentIndex ? -1 : 1;
    let d = (index - currentIndex + total) % total;
    if (d > total / 2) d -= total;
    if (Math.abs(d) <= 2) return d;
    return null;
  }

  return (
    <div
      className="min-h-screen bg-[#F5F8FA] text-[#222222]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {sidebar}

      <main className="md:ml-48">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8 lg:px-10">
          <header>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
            <p className="mt-2 text-xs leading-relaxed text-[#666666] sm:text-sm">{subtitle}</p>
          </header>

          {notice}

          {loading && (
            <p role="status" className="mt-16 text-center text-sm text-[#777777]">
              Carregando...
            </p>
          )}

          {!loading && loadError && (
            <p
              role="alert"
              className="mx-auto mt-10 max-w-md rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-700"
            >
              {loadError}
            </p>
          )}

          {!loading && !loadError && total > 0 && (
            <section
              aria-label={title}
              aria-roledescription="carrossel"
              aria-busy={isSubmitting}
              className="mt-6 sm:mt-8"
            >
              <div className="relative">
                <div
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={() => {
                    pointerStart.current = null;
                  }}
                  className="relative h-[600px] touch-pan-y overflow-hidden"
                >
                  {items.map((item, index) => {
                    const offset = getCardOffset(index);
                    if (offset === null) return null;
                    const isActive = offset === 0;
                    const offstage = Math.abs(offset) > 1;
                    const sx = offset * 165;

                    return (
                      <article
                        key={item.id}
                        aria-hidden={!isActive}
                        aria-label={`${item.name}, ${index + 1} de ${total}`}
                        aria-roledescription="slide"
                        className={[
                          "absolute left-1/2 top-4 flex h-[560px]",
                          "w-[calc(100%-1rem)] max-w-[360px] flex-col sm:w-[calc(100%-2rem)]",
                          "rounded-xl border border-[#F0F0F0] bg-white",
                          "p-4 shadow-[0_3px_3px_rgba(0,0,0,0.22)] sm:p-6",
                          // Acelera na saída e desacelera na chegada (ease-in-out forte).
                          "transition-[transform,opacity] duration-[380ms] ease-[cubic-bezier(0.76,0,0.24,1)]",
                          "motion-reduce:transition-none",
                          isActive && swipe.n > 0 ? (swipe.n % 2 ? "deck-speed-a" : "deck-speed-b") : "",
                          isActive ? "z-20" : "pointer-events-none z-10",
                        ].join(" ")}
                        style={{
                          transform: isActive
                            ? "translateX(-50%)"
                            : `translateX(calc(-50% + ${sx}px)) translateY(${offstage ? 16 : 8}px) rotate(${
                                Math.sign(offset) * (offstage ? 9 : 5)
                              }deg) scale(${offstage ? 0.88 : 0.94})`,
                          opacity: isActive ? 1 : offstage ? 0 : 0.95,
                          ["--deck-dir" as string]: swipe.dir,
                        }}
                      >
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-[#FAF5F2] px-3 py-1 text-[10px] font-semibold text-[#EF5948]">
                            {item.badge}
                          </span>
                          {item.chip && (
                            <span className="rounded-full border border-[#E6E6E6] px-2.5 py-1 text-[9px] text-[#777777]">
                              {item.chip}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <Avatar
                            userId={item.userId}
                            hasPhoto={item.hasPhoto}
                            name={item.name}
                            className="h-14 w-14 rounded-full bg-[#FCE3DA] text-base !text-[#B94D35]"
                          />
                          <div className="min-w-0">
                            <h2 className="break-words text-[15px] font-medium sm:text-base">
                              {item.name}
                            </h2>
                            <p className="mt-0.5 text-[10px] text-[#777777]">{item.role}</p>
                            <ul className="mt-1.5 flex flex-wrap gap-1.5">
                              {item.tags.map((tag) => (
                                <li
                                  key={tag}
                                  className="rounded-full bg-[#FFF5F1] px-2.5 py-0.5 text-[9px] text-[#EF5948]"
                                >
                                  {tag}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <p className="mt-3 line-clamp-3 text-[11px] leading-relaxed text-[#777777]">
                          {item.description || "Sem descrição informada."}
                        </p>

                        {item.summary && (
                          <div className="mt-3 rounded-lg bg-[#FFF8F6] px-3 py-2">
                            <p className="text-[9px] font-semibold uppercase tracking-wide text-[#EF5948]">
                              Por que combina
                            </p>
                            <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-[#555555]">
                              {item.summary}
                            </p>
                          </div>
                        )}

                        {onDetails && (
                          <button
                            type="button"
                            tabIndex={isActive ? 0 : -1}
                            disabled={!isActive}
                            onClick={() => onDetails(item)}
                            className="mt-2 self-start text-[11px] font-medium text-[#EF5948] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EF5948]"
                          >
                            {detailsLabel}
                          </button>
                        )}

                        <dl className="mb-3 mt-3 divide-y divide-[#DDDDDD] border-y border-[#DDDDDD] text-[11px] text-[#777777]">
                          <div className="flex justify-between gap-3 py-2">
                            <dt>Localização</dt>
                            <dd className="text-right">{item.location || "Não informada"}</dd>
                          </div>
                          <div className="flex justify-between gap-3 py-2">
                            <dt className="shrink-0">Ticket médio</dt>
                            <dd className="text-right">{item.ticket}</dd>
                          </div>
                        </dl>

                        {item.materials && item.materials.length > 0 && (
                          <div className="mb-3">
                            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wide text-[#999999]">
                              Materiais da startup
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {item.materials.map((material) => (
                                <MaterialChip key={material.label} material={material} active={isActive} />
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-auto grid grid-cols-2 gap-2.5 sm:gap-4">
                          <button
                            type="button"
                            tabIndex={isActive ? 0 : -1}
                            disabled={!isActive || isSubmitting}
                            onClick={() => handleDecision("rejected")}
                            className="min-h-9 rounded-lg border border-[#EF5948] px-2 py-2 text-[11px] font-medium text-[#EF5948] transition hover:bg-[#FFF4F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948] disabled:opacity-60"
                          >
                            {rejectLabel}
                          </button>
                          <button
                            type="button"
                            tabIndex={isActive ? 0 : -1}
                            disabled={!isActive || isSubmitting}
                            onClick={() => handleDecision("accepted")}
                            className="min-h-9 rounded-lg bg-[#EF5948] px-2 py-2 text-[11px] font-medium text-white transition hover:bg-[#DA4939] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948] disabled:opacity-60"
                          >
                            {isActive && isSubmitting ? "Aguarde..." : acceptLabel}
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
                  aria-label="Anterior"
                  className="absolute left-0 top-[270px] z-30 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-[#EF5948] shadow-[0_2px_3px_rgba(0,0,0,0.25)] transition hover:bg-[#FFF4F1] disabled:opacity-40 sm:flex sm:h-12 sm:w-12"
                >
                  <FiChevronLeft size={26} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate(1)}
                  disabled={total < 2 || isSubmitting}
                  aria-label="Próximo"
                  className="absolute right-0 top-[270px] z-30 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-[#EF5948] shadow-[0_2px_3px_rgba(0,0,0,0.25)] transition hover:bg-[#FFF4F1] disabled:opacity-40 sm:flex sm:h-12 sm:w-12"
                >
                  <FiChevronRight size={26} aria-hidden="true" />
                </button>
              </div>

              {/* No celular as setas ficam aqui, abaixo do cartão, para não cobrir o conteúdo. */}
              <div className="flex flex-wrap items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  disabled={total < 2 || isSubmitting}
                  aria-label="Anterior"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#EF5948] shadow-[0_2px_3px_rgba(0,0,0,0.25)] disabled:opacity-40 sm:hidden"
                >
                  <FiChevronLeft size={22} aria-hidden="true" />
                </button>
                {items.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isSubmitting}
                    aria-label={`Ver ${item.name}`}
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
                        index === currentIndex ? "bg-[#EF5948]" : "bg-[#D8D8D8]",
                      ].join(" ")}
                    />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => navigate(1)}
                  disabled={total < 2 || isSubmitting}
                  aria-label="Próximo"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#EF5948] shadow-[0_2px_3px_rgba(0,0,0,0.25)] disabled:opacity-40 sm:hidden"
                >
                  <FiChevronRight size={22} aria-hidden="true" />
                </button>
              </div>

              <p className="mt-2 text-center text-[11px] text-[#888888]">{hint}</p>
            </section>
          )}

          {!loading && !loadError && total === 0 && (
            <section className="mx-auto mt-16 max-w-md rounded-xl border border-[#ECECEC] bg-white px-6 py-12 text-center shadow-sm">
              <FiLink size={30} aria-hidden="true" className="mx-auto mb-4 text-[#EF5948]" />
              <h2 className="text-lg font-medium">{emptyTitle}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#777777]">{emptyText}</p>
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
