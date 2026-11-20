// Portal da startup: só os pedidos de conexão recebidos de investidores, para firmar ou negar.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import MatchDeck from "../../components/MatchDeck";
import type { DeckItem } from "../../components/MatchDeck";
import SSidebar from "../../components/SSidebar";
import MatchCelebration from "../../components/MatchCelebration";
import { ApiError, api, formatarTicket } from "../../services/api";
import type { RequestCard } from "../../services/api";

function toDeckItem(card: RequestCard): DeckItem {
  return {
    id: card.id,
    name: card.name,
    role: card.role,
    tags: card.tags,
    description: card.description,
    location: card.location,
    ticket: formatarTicket(card.ticketMin, card.ticketMax),
    badge: "Pediu conexão",
    affinity: card.affinity,
    chip: `${card.affinity}% de afinidade`,
    summary: card.summary,
    userId: card.userId,
    hasPhoto: card.hasPhoto,
  };
}

export default function SMatching() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  // Conexão recém-firmada: dispara a animação de match.
  const [match, setMatch] = useState<{ id: string; name: string; userId?: number; hasPhoto?: boolean; role?: string } | null>(null);

  useEffect(() => {
    api.matching
      .pedidos()
      .then(setRequests)
      .catch((err: unknown) => {
        if (
          err instanceof ApiError &&
          (err.status === 401 || err.status === 403)
        ) {
          navigate("/startups/login", { replace: true });
          return;
        }
        setLoadError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os pedidos.",
        );
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <>
      <MatchDeck
        sidebar={<SSidebar />}
        title="Conexões recebidas"
        subtitle="Investidores que solicitaram conexão com sua startup"
        items={requests.map(toDeckItem)}
        loading={loading}
        loadError={loadError}
        acceptLabel="Firmar conexão"
        rejectLabel="Negar"
        acceptedMessage={(name) => `Conexão com ${name} confirmada.`}
        rejectedMessage={(name) => `Pedido de ${name} negado.`}
        emptyTitle="Nenhuma conexão pendente"
        emptyText="Novos pedidos de investidores aparecerão aqui."
        hint="Deslize para ver os pedidos e escolha negar ou firmar conexão."
        onDecision={async (item, decision) => {
          const result = await api.matching.responder(item.id, decision);
          setRequests((current) =>
            current.filter((card) => card.id !== item.id),
          );
          if (decision === "accepted")
            setMatch({
              id: String(result.connectionId ?? item.id),
              name: item.name,
              userId: item.userId,
              hasPhoto: item.hasPhoto,
              role: item.role,
            });
        }}
      />
      {match && (
        <MatchCelebration
          contact={match}
          chatHref={`/startups/mensagens?conversa=${match.id}`}
          onClose={() => setMatch(null)}
        />
      )}
    </>
  );
}
