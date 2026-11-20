// Avisa o investidor, com a animação de match, quando uma startup firma a conexão pedida.
// As conexões já vistas ficam no localStorage (por usuário); na primeira visita todas as
// existentes são marcadas como vistas para não comemorar matches antigos.
import { useEffect, useState } from "react";

import MatchCelebration from "./MatchCelebration";
import { api } from "../services/api";
import type { ConnectionItem } from "../services/api";
import { getSession } from "../services/session";

const POLL_MS = 15_000;

function storageKey(email: string) {
  return `vertice.matches.vistos.${email.toLowerCase()}`;
}

function readSeen(email: string): Set<string> | null {
  try {
    const raw = localStorage.getItem(storageKey(email));
    return raw ? new Set(JSON.parse(raw) as string[]) : null;
  } catch {
    return null;
  }
}

function writeSeen(email: string, ids: Set<string>) {
  try {
    localStorage.setItem(storageKey(email), JSON.stringify([...ids]));
  } catch {
    // armazenamento indisponível: a animação pode repetir, sem outros efeitos
  }
}

/** Marca uma conexão como já comemorada (usado também quando a própria pessoa firma). */
export function markMatchSeen(connectionId: string) {
  const email = getSession()?.email;
  if (!email) return;
  const seen = readSeen(email) ?? new Set<string>();
  seen.add(connectionId);
  writeSeen(email, seen);
}

export default function NewMatchWatcher({ chatPath }: { chatPath: string }) {
  const [match, setMatch] = useState<ConnectionItem | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session || session.papel !== "INVESTIDOR") return;
    const email = session.email;
    let active = true;

    async function check() {
      if (document.hidden) return;
      try {
        const items = await api.conexoes.listar();
        if (!active) return;
        const seen = readSeen(email);
        if (!seen) {
          writeSeen(email, new Set(items.map((item) => item.id)));
          return;
        }
        const fresh = items.find((item) => !seen.has(item.id));
        if (fresh) {
          seen.add(fresh.id);
          writeSeen(email, seen);
          setMatch((current) => current ?? fresh);
        }
      } catch {
        // falhas de rede são ignoradas; tenta de novo no próximo ciclo
      }
    }

    void check();
    const timer = window.setInterval(check, POLL_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  if (!match) return null;
  return (
    <MatchCelebration
      contact={{ name: match.name, userId: match.userId, hasPhoto: match.hasPhoto, role: "Startup" }}
      chatHref={`${chatPath}?conversa=${match.id}`}
      onClose={() => setMatch(null)}
    />
  );
}
