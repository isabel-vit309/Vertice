// Para onde leva o clique na foto ou no nome de quem publicou/comentou, conforme o portal de quem vê.
import type { TimelineAuthor } from "../../services/api";

export type Viewer = "investor" | "startup";

export function profilePath(author: TimelineAuthor, viewer: Viewer, myUserId?: number | null): string {
  const base = viewer === "investor" ? "/investors" : "/startups";
  if (myUserId != null && author.userId === myUserId) return `${base}/perfil`;
  if (author.type === "STARTUP") {
    // O investidor já tem a página do perfil da startup (com a aba Crescimento).
    return viewer === "investor" ? `/investors/startups/${author.profileId}` : `/startups/perfis/startup/${author.profileId}`;
  }
  return `${base}/perfis/investidor/${author.userId}`;
}

/** "agora", "5 min", "3 h", "2 d" ou a data. */
export function relativeTime(iso: string, now = new Date()): string {
  const date = new Date(iso);
  const seconds = Math.max(0, (now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "agora";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)} d`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: date.getFullYear() === now.getFullYear() ? undefined : "numeric" });
}

export function fullDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
