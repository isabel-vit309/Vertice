import type { LoginResponse } from "./api";

const STORAGE_KEY = "vertice.session";

export type Session = LoginResponse;

function ler(raw: string | null): Session | null {
  try {
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    return parsed?.token ? parsed : null;
  } catch {
    return null;
  }
}

export function getSession(): Session | null {
  try {
    return ler(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

/*
 * Sessão da aba. O login fica no localStorage, que é compartilhado por todas as abas do navegador.
 * Se outra aba entrar com outra conta (ou sair), esta aba continuaria mostrando a conta antiga mas
 * enviando o token novo: a edição de perfil recebia "Acesso não permitido" (ou, pior, alterava o
 * perfil da outra conta) e o aviso de match mostrava conexões de outra pessoa.
 * Por isso cada aba guarda o token com que começou e só o troca quando ela mesma entra ou sai.
 */
let tokenDaAba: string | null = getSession()?.token ?? null;

/** true quando outra aba trocou de conta ou saiu depois que esta aba carregou. */
export function sessaoTrocadaEmOutraAba(): boolean {
  return tokenDaAba !== null && (getSession()?.token ?? null) !== tokenDaAba;
}

/** Avisa quando outra aba altera a sessão de forma diferente da desta aba. */
export function observarSessaoEntreAbas(aoTrocar: () => void): () => void {
  const ouvir = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    if (sessaoTrocadaEmOutraAba()) aoTrocar();
  };
  window.addEventListener("storage", ouvir);
  return () => window.removeEventListener("storage", ouvir);
}

export function saveSession(session: Session): void {
  tokenDaAba = session.token;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // armazenamento indisponível (modo privado etc.)
  }
}

export function clearSession(): void {
  tokenDaAba = null;
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
