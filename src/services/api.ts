// Cliente HTTP do Vértice — contrato descrito em backend-PI-main/docs/INTEGRACAO.md.
import { clearSession, getSession, sessaoTrocadaEmOutraAba } from "./session";

export const API_URL = (
  import.meta.env.VITE_API_URL ?? "http://localhost:8080"
).replace(/\/+$/, "");

export type Papel = "STARTUP" | "INVESTIDOR" | "ADMIN";

export type LoginResponse = {
  token: string;
  email: string;
  papel: Papel;
};

export type CadastroResponse = {
  id: number;
  email: string;
  papel: Papel;
  status: string;
};

export type StartupFeedItem = {
  id: string;
  name: string;
  location: string;
  segment: string;
  stage: string;
  description: string;
  tone: string;
  userId: number | null;
  hasPhoto: boolean;
};

/* ------------------------------------------------------------------ perfis */

export type StartupProfile = {
  id: string;
  userId: number;
  name: string;
  segment: string;
  stage: string;
  city: string;
  state: string;
  location: string;
  foundedYear: string;
  website: string;
  summary: string;
  problem: string;
  competitiveAdvantages: string;
  minimumTicket: number | null;
  maximumTicket: number | null;
  presentationVideo: string;
  hasPitchDeck: boolean;
  pitchDeckName: string | null;
  hasCanvas: boolean;
  canvasName: string | null;
  hasPhoto: boolean;
  /** Só no próprio perfil. */
  cnpj: string | null;
  profileOwner: string | null;
  email: string | null;
};

export type InvestorProfile = {
  id: string;
  userId: number;
  type: string;
  name: string;
  city: string;
  state: string;
  linkedin: string;
  segments: string[];
  stages: string[];
  ticketMin: number | null;
  ticketMax: number | null;
  aboutInvestor: string;
  career: string;
  lookingFor: string;
  hasPhoto: boolean;
  cpf: string | null;
  cnpj: string | null;
  email: string | null;
};

export type OwnProfile = {
  role: "STARTUP" | "INVESTIDOR";
  startup: StartupProfile | null;
  investor: InvestorProfile | null;
};

export type StartupUpdate = {
  name: string;
  website: string;
  city: string;
  state: string;
  foundedYear: string;
  profileOwner: string;
  segment: string;
  stage: string;
  minimumTicket: number | null;
  maximumTicket: number | null;
  summary: string;
  problem: string;
  competitiveAdvantages: string;
  presentationVideo: string;
};

export type InvestorUpdate = {
  name: string;
  linkedin: string;
  city: string;
  state: string;
  segments: string[];
  stages: string[];
  ticketMin: number | null;
  ticketMax: number | null;
  aboutInvestor: string;
  career: string;
  lookingFor: string;
};

export type MaterialTipo = "pitch" | "canvas";

export type StatusCadastro = "PENDENTE" | "APROVADO" | "REJEITADO" | "SUSPENSO";

export type CadastroAdmin = {
  id: number;
  tipo: "Startup" | "Investidor" | "Mentor";
  nome: string;
  responsavel: string;
  email: string;
  status: StatusCadastro;
  enviadoEm: string | null;
};

export type MetricasAdmin = {
  startups: number;
  startupsNoMes: number;
  investidores: number;
  investidoresNoMes: number;
  pendentes: number;
  conexoes: number;
  conversas: number;
  mensagens: number;
  reunioes: number;
  reunioesAceitas: number;
  engajamento: { rotulo: string; percentual: number }[];
  /** RF09: conexões firmadas pela startup depois do pedido do investidor. */
  matches: number;
  pedidosConexao: number;
  pedidosPendentes: number;
  recomendacoesPassadas: number;
  matchesComIa: number;
  /** RF10 */
  avaliacoes: number;
  notaMedia: number | null;
  startupsAprovadas: number;
  investidoresAprovados: number;
  /** Convites de reunião ainda sem resposta (e dentro do prazo). */
  reunioesAguardando: number;
  /** Matches com pelo menos uma reunião confirmada. */
  matchesComReuniao: number;
};

export type AuditoriaAdmin = {
  id: number;
  acao: string;
  alvo: string;
  ator: string;
  data: string;
};

/* ----------------------------------------------------------- matchmaking */

export type MatchCard = {
  id: string;
  userId: number;
  name: string;
  role: string;
  tags: string[];
  description: string;
  location: string;
  ticketMin: number | null;
  ticketMax: number | null;
  affinity: number;
  /** "IA": nota do analista generativo; "LOCAL": só o motor interno. */
  source: "IA" | "LOCAL";
  pending: boolean;
  summary: string;
  strengths: string[];
  concerns: string[];
  questions: string[];
  factors: string[];
  breakdown: { ai: number | null; local: number; learning: number; reputation: number };
  hasPhoto: boolean;
  /** Anexos são opcionais (RF06): só aparecem no cartão quando a startup enviou. */
  hasPitchDeck: boolean;
  hasCanvas: boolean;
  presentationVideo: string;
};

export type MatchQueue = {
  items: MatchCard[];
  ai: { enabled: boolean; pending: number; model: string | null };
  criteria: { segments: string[]; stages: string[]; ticketMin: number | null; ticketMax: number | null };
  approvedStartups: number;
};

export type RequestCard = {
  id: string;
  userId: number;
  name: string;
  role: string;
  tags: string[];
  description: string;
  location: string;
  ticketMin: number | null;
  ticketMax: number | null;
  affinity: number;
  summary: string;
  requestedAt: string;
  hasPhoto: boolean;
};

export type Rating = { score: number; comment: string | null };

export type ConnectionItem = {
  id: string;
  profileId: string;
  userId: number;
  name: string;
  type: string;
  city: string;
  state: string;
  segments: string[];
  ticketMin: number | null;
  ticketMax: number | null;
  connectedAt: string;
  myRating: Rating | null;
  hasPhoto: boolean;
};

export type Dossier = {
  source: "IA" | "LOCAL";
  model: string | null;
  executiveSummary: string;
  thesisFit: string;
  opportunities: string[];
  risks: string[];
  questions: string[];
  nextSteps: string[];
  generatedAt: string;
};

export type Decision = "accepted" | "rejected";

/* ------------------------------------------------------ mensagens e reuniões */

export type MeetingStatus = "PENDENTE" | "ACEITO" | "REJEITADO" | "CANCELADO" | "EXPIRADO";

export type Meeting = {
  id: string;
  connectionId: string | null;
  contactName: string;
  contactRole: string;
  /** "2026-11-20" */
  date: string;
  /** "14:30:00" */
  time: string;
  durationMinutes: number;
  subject: string;
  location: string | null;
  status: MeetingStatus;
  /** Quem enviou o convite (o investidor). */
  organizer: boolean;
  canRespond: boolean;
  canCancel: boolean;
};

export type Conversation = {
  id: string;
  contactUserId: number;
  name: string;
  role: string;
  lastMessage: { text: string; type: string; sentAt: string; mine: boolean } | null;
  unread: number;
  hasPhoto: boolean;
};

export type ChatMessage = {
  id: string;
  sender: "me" | "contact" | "system";
  type: "TEXTO" | "CONVITE" | "SISTEMA";
  text: string;
  sentAt: string;
  read: boolean;
  meeting: Meeting | null;
};

/** Tipo de mensagem na comunidade; SISTEMA são avisos de entrada e saída. */
export type PostCategory = "MENSAGEM" | "NOTICIA" | "INICIATIVA" | "MOVIMENTO" | "SISTEMA";

export type Community = {
  id: string;
  slug: string;
  name: string;
  description: string;
  members: number;
  joined: boolean;
  unread: number;
  lastMessage: { text: string; author: string; category: PostCategory; sentAt: string; mine: boolean } | null;
};

export type CommunityPost = {
  id: string;
  sender: "me" | "member" | "system";
  authorUserId: number;
  authorName: string;
  authorRole: string;
  authorHasPhoto: boolean;
  category: PostCategory;
  text: string;
  sentAt: string;
};

export type CommunityMember = {
  userId: number;
  name: string;
  role: string;
  hasPhoto: boolean;
  me: boolean;
  joinedAt: string;
};

export type InvitePayload = {
  date: string;
  time: string;
  durationMinutes: number;
  subject: string;
  location?: string;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Mensagens usadas quando o servidor não devolve {status,message}
// (ex.: erros da cadeia de segurança ou falha de rede).
const fallbackMessages: Record<number, string> = {
  0: "Não foi possível conectar ao servidor. Verifique se o backend está em execução.",
  400: "Dados inválidos. Revise as informações e tente novamente.",
  401: "Sessão expirada ou credenciais inválidas.",
  403: "Acesso não permitido.",
  404: "Recurso não encontrado.",
  409: "Já existe um cadastro com este e-mail.",
  413: "Arquivo excede o limite permitido.",
};

async function request<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = false, headers, ...rest } = init;
  const finalHeaders = new Headers(headers);
  if (auth) garantirSessaoDaAba();

  if (auth) {
    const session = getSession();
    if (session) finalHeaders.set("Authorization", `Bearer ${session.token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...rest, headers: finalHeaders });
  } catch {
    throw new ApiError(0, fallbackMessages[0]);
  }

  if (!response.ok) {
    let message = "";
    try {
      const body: unknown = await response.json();
      if (body && typeof body === "object" && "message" in body) {
        message = String((body as { message: unknown }).message ?? "");
      }
    } catch {
      // corpo vazio ou não-JSON
    }

    if (auth && response.status === 401) clearSession();

    throw new ApiError(
      response.status,
      message || fallbackMessages[response.status] || "Erro inesperado no servidor.",
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

/** Download autenticado (fotos e materiais exigem o token, então não dá para usar <img src> direto). */
async function requestBlob(path: string): Promise<Blob> {
  return (await requestFile(path)).blob;
}

/** Como requestBlob, devolvendo também o nome do arquivo informado pelo servidor. */
async function requestFile(path: string): Promise<{ blob: Blob; fileName: string | null }> {
  garantirSessaoDaAba();
  const session = getSession();
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: session ? { Authorization: `Bearer ${session.token}` } : {},
    });
  } catch {
    throw new ApiError(0, fallbackMessages[0]);
  }
  if (!response.ok) {
    if (response.status === 401) clearSession();
    throw new ApiError(response.status, fallbackMessages[response.status] || "Erro inesperado no servidor.");
  }
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  return { blob: await response.blob(), fileName: match ? decodeURIComponent(match[1]) : null };
}

function sendJson(method: "PUT" | "POST", body: unknown): RequestInit {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}

/** FormData a partir do payload: listas viram campos repetidos (segments=a&segments=b). */
function formData(payload: Record<string, unknown>): FormData {
  const form = new FormData();
  Object.entries(compact(payload)).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => form.append(key, String(item)));
    else form.append(key, String(value));
  });
  return form;
}

// Cache das fotos por usuário (object URLs). Invalidado quando o próprio usuário troca a foto.
const photoCache = new Map<number, Promise<string | null>>();
const photoListeners = new Set<(userId: number) => void>();

export function onPhotoChange(listener: (userId: number) => void): () => void {
  photoListeners.add(listener);
  return () => photoListeners.delete(listener);
}

function invalidatePhoto(userId: number) {
  const cached = photoCache.get(userId);
  photoCache.delete(userId);
  cached?.then((url) => url && URL.revokeObjectURL(url)).catch(() => undefined);
  photoListeners.forEach((listener) => listener(userId));
}

/** Formatos e limite da foto (iguais aos do backend). */
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const PHOTO_MAX_BYTES = 2 * 1024 * 1024;

export function validarFoto(file: File): string {
  if (!PHOTO_TYPES.includes(file.type)) return "Envie uma foto em JPG, PNG ou WebP.";
  if (file.size > PHOTO_MAX_BYTES) return "A foto deve ter no máximo 2 MB.";
  return "";
}

export const MENSAGEM_OUTRA_ABA =
  "Você entrou com outra conta (ou saiu) em outra aba. Atualize esta página para continuar.";

/** Nunca envia o token de outra conta: se outra aba trocou a sessão, a requisição é bloqueada. */
function garantirSessaoDaAba() {
  if (sessaoTrocadaEmOutraAba()) throw new ApiError(409, MENSAGEM_OUTRA_ABA);
}

function json(body: unknown): RequestInit {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

/** Remove chaves com string vazia, null ou undefined (o backend espera omissão). */
export function compact<T extends Record<string, unknown>>(values: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(values).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  ) as Partial<T>;
}

/**
 * Converte valores monetários digitados ("R$ 1.000,50", "1000,5", "1000.50")
 * em decimal simples aceito pelo backend ("1000.50"). Retorna "" se vazio.
 */
export function normalizeTicket(raw: string): string {
  const value = raw.replace(/R\$|\s/gi, "");
  if (!value) return "";
  // Formato brasileiro: ponto como milhar e vírgula como decimal.
  if (value.includes(",")) return value.replace(/\./g, "").replace(",", ".");
  // Somente pontos: "1.000.000" → milhar; "1000.50" → decimal.
  if (/^\d{1,3}(\.\d{3})+$/.test(value)) return value.replace(/\./g, "");
  return value;
}

export const api = {
  login(email: string, password: string): Promise<LoginResponse> {
    return request<LoginResponse>("/auth/login", json({ email, password }));
  },

  cadastrarStartup(
    payload: Record<string, unknown>,
    files: { pitchDeck?: File | null; businessModelCanvas?: File | null; photo?: File | null } = {},
  ): Promise<CadastroResponse> {
    const hasFiles = Boolean(files.pitchDeck || files.businessModelCanvas || files.photo);

    if (!hasFiles) {
      return request<CadastroResponse>("/auth/cadastro/startup", json(compact(payload)));
    }

    // Com arquivos: multipart. O navegador define o boundary (não setar Content-Type).
    const form = formData(payload);
    if (files.photo) form.append("photo", files.photo);
    if (files.pitchDeck) form.append("pitchDeck", files.pitchDeck);
    if (files.businessModelCanvas) {
      form.append("businessModelCanvas", files.businessModelCanvas);
    }

    return request<CadastroResponse>("/auth/cadastro/startup", {
      method: "POST",
      body: form,
    });
  },

  cadastrarInvestidor(payload: Record<string, unknown>, photo?: File | null): Promise<CadastroResponse> {
    if (!photo) {
      return request<CadastroResponse>("/auth/cadastro/investidor", json(compact(payload)));
    }
    const form = formData(payload);
    form.append("photo", photo);
    return request<CadastroResponse>("/auth/cadastro/investidor", { method: "POST", body: form });
  },

  perfil: {
    proprio(): Promise<OwnProfile> {
      return request<OwnProfile>("/perfil", { auth: true });
    },
    /** Perfil de uma startup aprovada (visto por investidores). */
    startup(startupId: string): Promise<StartupProfile> {
      return request<StartupProfile>(`/startups/${startupId}/perfil`, { auth: true });
    },
    editarStartup(dados: StartupUpdate): Promise<StartupProfile> {
      return request<StartupProfile>("/perfil/startup", { ...sendJson("PUT", dados), auth: true });
    },
    editarInvestidor(dados: InvestorUpdate): Promise<InvestorProfile> {
      return request<InvestorProfile>("/perfil/investidor", { ...sendJson("PUT", dados), auth: true });
    },
    async enviarFoto(userId: number, file: File): Promise<void> {
      const form = new FormData();
      form.append("photo", file);
      await request<void>("/perfil/foto", { method: "PUT", body: form, auth: true });
      invalidatePhoto(userId);
    },
    async removerFoto(userId: number): Promise<void> {
      await request<void>("/perfil/foto", { method: "DELETE", auth: true });
      invalidatePhoto(userId);
    },
    enviarMaterial(tipo: MaterialTipo, file: File): Promise<StartupProfile> {
      const form = new FormData();
      form.append("file", file);
      return request<StartupProfile>(`/perfil/materiais/${tipo}`, { method: "PUT", body: form, auth: true });
    },
    removerMaterial(tipo: MaterialTipo): Promise<StartupProfile> {
      return request<StartupProfile>(`/perfil/materiais/${tipo}`, { method: "DELETE", auth: true });
    },
  },

  /** Object URL da foto do usuário, ou null se ele não tiver foto. Cacheado por sessão. */
  foto(userId: number): Promise<string | null> {
    let cached = photoCache.get(userId);
    if (!cached) {
      cached = requestBlob(`/usuarios/${userId}/foto`)
        .then((blob) => URL.createObjectURL(blob))
        .catch(() => null);
      photoCache.set(userId, cached);
    }
    return cached;
  },

  /** Baixa o pitch deck ou o canvas de uma startup e abre o arquivo salvo. */
  async baixarMaterial(startupId: string, tipo: MaterialTipo, nome?: string | null): Promise<void> {
    const { blob, fileName } = await requestFile(`/startups/${startupId}/materiais/${tipo}`);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nome || fileName || (tipo === "pitch" ? "pitch-deck" : "business-model-canvas");
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30_000);
  },

  listarStartups(
    filters: Partial<Record<"search" | "segment" | "stage" | "location", string>> = {},
  ): Promise<StartupFeedItem[]> {
    const params = new URLSearchParams(compact(filters) as Record<string, string>);
    const query = params.toString();
    return request<StartupFeedItem[]>(`/startups${query ? `?${query}` : ""}`, {
      auth: true,
    });
  },

  matching: {
    /** Portal do investidor: startups que batem em segmento, estágio e ticket, por afinidade. */
    fila(): Promise<MatchQueue> {
      return request<MatchQueue>("/matchmaking/investidor", { auth: true });
    },
    decidir(startupId: string, decision: Decision): Promise<{ connectionId: number; status: string }> {
      return request(`/matchmaking/investidor/startups/${startupId}/decisao`, { ...json({ decision }), auth: true });
    },
    dossie(startupId: string): Promise<Dossier> {
      return request<Dossier>(`/matchmaking/investidor/startups/${startupId}/dossie`, { auth: true });
    },
    /** Portal da startup: pedidos de conexão recebidos. */
    pedidos(): Promise<RequestCard[]> {
      return request<RequestCard[]>("/matchmaking/startup/pedidos", { auth: true });
    },
    responder(conexaoId: string, decision: Decision): Promise<{ connectionId: number; status: string }> {
      return request(`/matchmaking/startup/pedidos/${conexaoId}/decisao`, { ...json({ decision }), auth: true });
    },
  },

  conversas: {
    listar(): Promise<Conversation[]> {
      return request<Conversation[]>("/conversas", { auth: true });
    },
    /** Histórico da conversa; as mensagens recebidas passam a contar como lidas. */
    mensagens(conexaoId: string): Promise<ChatMessage[]> {
      return request<ChatMessage[]>(`/conversas/${conexaoId}/mensagens`, { auth: true });
    },
    enviar(conexaoId: string, text: string): Promise<ChatMessage> {
      return request<ChatMessage>(`/conversas/${conexaoId}/mensagens`, { ...json({ text }), auth: true });
    },
    /** Só o investidor da conexão pode convidar. */
    convidar(conexaoId: string, convite: InvitePayload): Promise<ChatMessage> {
      return request<ChatMessage>(`/conversas/${conexaoId}/convites`, { ...json(convite), auth: true });
    },
  },

  comunidades: {
    listar(): Promise<Community[]> {
      return request<Community[]>("/comunidades", { auth: true });
    },
    entrar(id: string): Promise<Community> {
      return request<Community>(`/comunidades/${id}/entrar`, { method: "POST", auth: true });
    },
    sair(id: string): Promise<Community> {
      return request<Community>(`/comunidades/${id}/sair`, { method: "POST", auth: true });
    },
    /** Sem `depois`: histórico recente. Com `depois`: só as mensagens novas. Marca tudo como lido. */
    mensagens(id: string, depois?: string): Promise<CommunityPost[]> {
      const query = depois ? `?depois=${encodeURIComponent(depois)}` : "";
      return request<CommunityPost[]>(`/comunidades/${id}/mensagens${query}`, { auth: true });
    },
    enviar(id: string, text: string, category: PostCategory = "MENSAGEM"): Promise<CommunityPost> {
      return request<CommunityPost>(`/comunidades/${id}/mensagens`, { ...json({ text, category }), auth: true });
    },
    membros(id: string): Promise<CommunityMember[]> {
      return request<CommunityMember[]>(`/comunidades/${id}/membros`, { auth: true });
    },
  },
  reunioes: {
    listar(): Promise<Meeting[]> {
      return request<Meeting[]>("/reunioes", { auth: true });
    },
    responder(id: string, decision: Decision): Promise<Meeting> {
      return request<Meeting>(`/reunioes/${id}/resposta`, { ...json({ decision }), auth: true });
    },
    cancelar(id: string): Promise<Meeting> {
      return request<Meeting>(`/reunioes/${id}/cancelar`, { method: "POST", auth: true });
    },
  },

  conexoes: {
    listar(): Promise<ConnectionItem[]> {
      return request<ConnectionItem[]>("/conexoes", { auth: true });
    },
    /** RF10: avaliação pós-interação (nota de 1 a 5 e comentário opcional). */
    avaliar(conexaoId: string, score: number, comment: string): Promise<Rating> {
      return request<Rating>(`/conexoes/${conexaoId}/avaliacao`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, comment }),
        auth: true,
      });
    },
  },

  admin: {
    listarCadastros(status?: StatusCadastro): Promise<CadastroAdmin[]> {
      const query = status ? `?status=${status}` : "";
      return request<CadastroAdmin[]>(`/admin/usuarios${query}`, { auth: true });
    },
    moderar(id: number, acao: "aprovar" | "rejeitar" | "suspender"): Promise<CadastroAdmin> {
      return request<CadastroAdmin>(`/admin/usuarios/${id}/${acao}`, { method: "PUT", auth: true });
    },
    metricas(): Promise<MetricasAdmin> {
      return request<MetricasAdmin>("/admin/metricas", { auth: true });
    },
    auditoria(): Promise<AuditoriaAdmin[]> {
      return request<AuditoriaAdmin[]>("/admin/auditoria", { auth: true });
    },
  },
};

/** "2026-11-11T09:42:10" → "Hoje, 09:42" / "Ontem, 16:31" / "05/11/2026, 14:08". */
export function formatarData(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const hora = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const hoje = new Date();
  const ontem = new Date();
  ontem.setDate(hoje.getDate() - 1);
  if (date.toDateString() === hoje.toDateString()) return `Hoje, ${hora}`;
  if (date.toDateString() === ontem.toDateString()) return `Ontem, ${hora}`;
  return `${date.toLocaleDateString("pt-BR")}, ${hora}`;
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/** Faixa de ticket para exibição: "R$ 50.000 a R$ 200.000". */
export function formatarTicket(min: number | null, max: number | null): string {
  if (min != null && max != null) return `${brl.format(min)} a ${brl.format(max)}`;
  if (min != null) return `A partir de ${brl.format(min)}`;
  if (max != null) return `Até ${brl.format(max)}`;
  return "Não informado";
}

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });

/** "qui., 20/11/2026 · 14:30 às 15:15" */
export function formatarReuniao(meeting: Pick<Meeting, "date" | "time" | "durationMinutes">): string {
  const [year, month, day] = meeting.date.split("-").map(Number);
  const [hour, minute] = meeting.time.split(":").map(Number);
  const start = new Date(year, month - 1, day, hour, minute);
  const end = new Date(start.getTime() + meeting.durationMinutes * 60_000);
  const hhmm = (d: Date) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${weekdayFormatter.format(start)} · ${hhmm(start)} às ${hhmm(end)}`;
}

export const statusReuniao: Record<MeetingStatus, string> = {
  PENDENTE: "Aguardando resposta",
  ACEITO: "Confirmada",
  REJEITADO: "Recusada",
  CANCELADO: "Cancelada",
  EXPIRADO: "Expirada",
};
