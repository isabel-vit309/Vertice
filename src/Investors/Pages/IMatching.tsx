// Portal do investidor: só startups que batem em segmento, estágio e ticket médio,
// ordenadas por afinidade. O investidor solicita conexão ou passa.
import { useCallback, useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import ISidebar from "../../components/ISidebar";
import MatchDeck from "../../components/MatchDeck";
import type { DeckItem } from "../../components/MatchDeck";
import { ApiError, api, formatarTicket } from "../../services/api";
import type { Dossier, MatchCard, MatchQueue } from "../../services/api";

/** Enquanto a IA analisa em segundo plano, a tela consulta de novo a cada 5 s (até 1 minuto). */
const POLL_MS = 5000;
const MAX_POLLS = 12;

function toDeckItem(card: MatchCard): DeckItem {
  return {
    id: card.id,
    name: card.name,
    role: card.role,
    tags: card.tags,
    description: card.description,
    location: card.location,
    ticket: formatarTicket(card.ticketMin, card.ticketMax),
    badge: `${card.affinity}% de afinidade`,
    affinity: card.affinity,
    chip: card.pending ? "IA analisando..." : card.source === "IA" ? "Análise por IA" : "Análise automática",
    summary: card.summary,
    userId: card.userId,
    hasPhoto: card.hasPhoto,
    // RF06: anexos são opcionais; o cartão só mostra o que a startup enviou.
    materials: [
      ...(card.hasPitchDeck
        ? [{ label: "Pitch Deck", onOpen: () => api.baixarMaterial(card.id, "pitch") }]
        : []),
      ...(card.hasCanvas
        ? [{ label: "Business Model Canvas", onOpen: () => api.baixarMaterial(card.id, "canvas") }]
        : []),
      ...(card.presentationVideo ? [{ label: "Apresentação", href: card.presentationVideo }] : []),
    ],
  };
}

function Lista({ titulo, itens }: { titulo: string; itens: string[] }) {
  if (itens.length === 0) return null;
  return (
    <section className="mt-4">
      <h3 className="text-xs font-semibold text-[#333333]">{titulo}</h3>
      <ul className="mt-1.5 list-disc space-y-1 pl-4 text-xs leading-relaxed text-[#555555]">
        {itens.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function DetailsDialog({ card, onClose }: { card: MatchCard; onClose: () => void }) {
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function gerarDossie() {
    setLoading(true);
    setError("");
    try {
      setDossier(await api.matching.dossie(card.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar o dossiê.");
    } finally {
      setLoading(false);
    }
  }

  const { breakdown } = card;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-details-title"
        className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="match-details-title" className="text-lg font-semibold">
              {card.name}
            </h2>
            <p className="mt-1 text-xs text-[#777777]">
              {card.affinity}% de afinidade ·{" "}
              {card.source === "IA" ? "análise por inteligência artificial" : "análise automática do sistema"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded p-1 text-[#666666] hover:bg-[#F5F5F5]"
          >
            <FiX size={18} aria-hidden="true" />
          </button>
        </div>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {card.factors.map((factor) => (
            <li key={factor} className="rounded-full bg-[#F3F6F8] px-2.5 py-1 text-[10px] text-[#555555]">
              {factor}
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-[#444444]">{card.summary}</p>
        <Lista titulo="Pontos fortes" itens={card.strengths} />
        <Lista titulo="Pontos de atenção" itens={card.concerns} />
        <Lista titulo="Perguntas para a primeira conversa" itens={card.questions} />

        <section className="mt-4 rounded-lg bg-[#F7F9FA] px-3 py-2 text-[11px] text-[#666666]">
          <h3 className="font-semibold text-[#444444]">Como a afinidade foi calculada</h3>
          <p className="mt-1">
            {breakdown.ai !== null && <>Analista de IA: {breakdown.ai} · </>}
            Motor do sistema: {breakdown.local}
            {breakdown.learning !== 0 && (
              <>
                {" "}
                · Seu histórico: {breakdown.learning > 0 ? "+" : ""}
                {breakdown.learning}
              </>
            )}
            {breakdown.reputation !== 0 && (
              <>
                {" "}
                · Avaliações: {breakdown.reputation > 0 ? "+" : ""}
                {breakdown.reputation}
              </>
            )}
          </p>
        </section>

        <div className="mt-5 border-t border-[#ECECEC] pt-4">
          {!dossier && (
            <button
              type="button"
              onClick={gerarDossie}
              disabled={loading}
              className="rounded-lg bg-[#EF5948] px-4 py-2 text-xs font-medium text-white hover:bg-[#DA4939] disabled:cursor-wait disabled:opacity-70"
            >
              {loading ? "Gerando dossiê..." : "Gerar dossiê da startup"}
            </button>
          )}
          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          {dossier && (
            <article aria-label="Dossiê da startup">
              <h3 className="text-sm font-semibold">Dossiê da startup</h3>
              <p className="mt-0.5 text-[10px] text-[#888888]">
                {dossier.source === "IA"
                  ? "Gerado por inteligência artificial a partir do perfil da startup."
                  : "Montado automaticamente a partir do perfil da startup."}{" "}
                Apoia a decisão de conversar; não é recomendação de investimento.
              </p>
              <p className="mt-3 text-xs leading-relaxed text-[#444444]">{dossier.executiveSummary}</p>
              <section className="mt-4">
                <h3 className="text-xs font-semibold text-[#333333]">Aderência à sua tese</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#555555]">{dossier.thesisFit}</p>
              </section>
              <Lista titulo="Oportunidades" itens={dossier.opportunities} />
              <Lista titulo="Riscos e lacunas" itens={dossier.risks} />
              <Lista titulo="Perguntas sugeridas" itens={dossier.questions} />
              <Lista titulo="Próximos passos" itens={dossier.nextSteps} />
            </article>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IMatching() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<MatchQueue | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [details, setDetails] = useState<MatchCard | null>(null);
  const polls = useRef(0);

  const load = useCallback(
    async (keepOrder: boolean) => {
      try {
        const next = await api.matching.fila();
        setQueue((current) => {
          if (!keepOrder || !current) return next;
          // Atualização em segundo plano: mantém a ordem que o investidor já está vendo.
          const byId = new Map(next.items.map((item) => [item.id, item]));
          const kept = current.items.filter((item) => byId.has(item.id)).map((item) => byId.get(item.id)!);
          const keptIds = new Set(kept.map((item) => item.id));
          return { ...next, items: [...kept, ...next.items.filter((item) => !keptIds.has(item.id))] };
        });
        setLoadError("");
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          navigate("/investors/login", { replace: true });
          return;
        }
        if (!keepOrder) {
          setLoadError(err instanceof Error ? err.message : "Não foi possível carregar o matching.");
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    void load(false);
  }, [load]);

  const pending = queue?.ai.pending ?? 0;
  useEffect(() => {
    if (pending === 0 || polls.current >= MAX_POLLS) return;
    const timer = window.setTimeout(() => {
      polls.current += 1;
      void load(true);
    }, POLL_MS);
    return () => window.clearTimeout(timer);
  }, [pending, queue, load]);

  const criteria = queue?.criteria;
  const notice = queue && criteria && (
    <div className="mt-4 rounded-lg border border-[#ECECEC] bg-white px-4 py-3 text-[11px] leading-relaxed text-[#666666]">
      <p>
        <span className="font-semibold text-[#444444]">Seus critérios:</span>{" "}
        {criteria.segments.join(", ") || "sem segmento"} ·{" "}
        {criteria.stages.length > 0 ? criteria.stages.join(", ") : "qualquer estágio"} · ticket{" "}
        {criteria.ticketMin === null && criteria.ticketMax === null
          ? "sem faixa definida"
          : formatarTicket(criteria.ticketMin, criteria.ticketMax)}
      </p>
      <p className="mt-1">
        Só aparecem startups que batem nos três critérios.{" "}
        {queue.ai.enabled
          ? pending > 0
            ? `A inteligência artificial está analisando ${pending} startup(s); as notas se atualizam sozinhas.`
            : "A ordem considera a análise por inteligência artificial e o que você já solicitou ou passou."
          : "A ordem é calculada pelo sistema e considera o que você já solicitou ou passou."}
      </p>
    </div>
  );

  return (
    <>
      <MatchDeck
        sidebar={<ISidebar />}
        title="Matching"
        subtitle="Startups que combinam com seu perfil de investidor"
        notice={notice}
        items={(queue?.items ?? []).map(toDeckItem)}
        loading={loading}
        loadError={loadError}
        acceptLabel="Solicitar Conexão"
        rejectLabel="Passar"
        acceptedMessage={(name) => `Pedido de conexão enviado para ${name}.`}
        rejectedMessage={(name) => `${name} não aparecerá mais no seu matching.`}
        emptyTitle="Nenhuma startup compatível no momento"
        emptyText={
          queue && queue.approvedStartups > 0
            ? "Nenhuma startup nova bate com seu segmento, estágio e ticket. Novas startups aprovadas aparecerão aqui."
            : "Ainda não há startups aprovadas na plataforma."
        }
        hint="Deslize para ver as startups e escolha passar ou solicitar conexão."
        onDecision={async (item, decision) => {
          await api.matching.decidir(item.id, decision);
          setQueue((current) =>
            current ? { ...current, items: current.items.filter((card) => card.id !== item.id) } : current,
          );
        }}
        onDetails={(item) => setDetails(queue?.items.find((card) => card.id === item.id) ?? null)}
        detailsLabel="Ver análise completa e dossiê"
      />
      {details && <DetailsDialog card={details} onClose={() => setDetails(null)} />}
    </>
  );
}
