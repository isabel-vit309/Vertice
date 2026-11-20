import type { LoginResponse } from "./api";

const STORAGE_KEY = "vertice.session";

export type Session = LoginResponse;

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return parsed?.token ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // armazenamento indisponível (modo privado etc.)
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Rota inicial de cada papel após o login. */
export function homeFor(papel: string): string {
  switch (papel) {
    case "INVESTIDOR":
      return "/investors/startups";
    case "ADMIN":
      return "/adm";
    default:
      return "/startups/perfil";
  }
}
