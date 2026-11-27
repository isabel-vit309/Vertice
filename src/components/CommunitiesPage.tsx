// Tela "Comunidades" dos dois portais: grupos temáticos em que startups e investidores
// conversam e compartilham notícias, iniciativas e movimentos internos.
// Sem comunidade aberta mostra a lista (foto, nome e descrição); com ?comunidade=<id> abre o grupo.
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent, ReactNode } from "react";
import { FiArrowLeft, FiLogOut, FiMessageCircle, FiSend, FiUsers } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";

import UserPhoto, { initials } from "./Avatar";
import { communityImages } from "./communityImages";
import { Dialog } from "./ProfileUI";
import { ApiError, api } from "../services/api";
import type { Community, CommunityMember, CommunityPost, PostCategory } from "../services/api";

/** Novas mensagens do grupo aberto a cada 4 s; a lista (não lidas) a cada 10 s. */
const POLL_MESSAGES_MS = 4000;
const POLL_LIST_MS = 10000;

type Viewer = "investor" | "startup";

export const categoryLabels: Record<Exclude<PostCategory, "SISTEMA">, string> = {
  MENSAGEM: "Mensagem",
  NOTICIA: "Notícia",
  INICIATIVA: "Iniciativa",
  MOVIMENTO: "Movimento interno",
};

const categoryStyles: Record<Exclude<PostCategory, "SISTEMA" | "MENSAGEM">, string> = {
  NOTICIA: "bg-[#EAF2FF] text-[#2D5DB8]",
  INICIATIVA: "bg-[#E8F6EF] text-[#1D7A55]",
  MOVIMENTO: "bg-[#FFF1EE] text-[#C2432F]",
};

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dayFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

function previewDate(iso: string) {
  const date = new Date(iso);
  return date.toDateString() === new Date().toDateString()
    ? timeFormatter.format(date)
    : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

/** Prévia da última mensagem: avisos de entrada e saída aparecem sem "Fulano:" na frente. */
function lastMessagePreview(last: NonNullable<Community["lastMessage"]>) {
  if (last.category === "SISTEMA") return last.text;
  return `${last.mine ? "Você" : last.author}: ${last.text}`;
}

function membersLabel(count: number) {
  return count === 1 ? "1 membro" : `${count} membros`;
}

/** Cor estável por autor, para distinguir quem fala no grupo (como nos apps de mensagem). */
const authorColors = ["#AF5039", "#2D5DB8", "#1D7A55", "#7250F4", "#B5651D", "#A3366F"];
function authorColor(userId: number) {
  return authorColors[Math.abs(userId) % authorColors.length];
}

export function CommunityPhoto({ community, size = "large" }: { community: Pick<Community, "slug" | "name">; size?: "small" | "medium" | "large" }) {
  const src = communityImages[community.slug];
  const box = size === "large" ? "h-16 w-16 rounded-2xl text-lg" : size === "medium" ? "h-10 w-10 rounded-xl text-xs" : "h-9 w-9 rounded-lg text-[10px]";
  return (
    <span className={`flex shrink-0 items-center justify-center overflow-hidden bg-[#F5DDD3] font-semibold text-[#AF5039] ${box}`}>
      {src ? (
        <img src={src} alt={`Foto da comunidade ${community.name}`} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{initials(community.name)}</span>
      )}
    </span>
  );
}

function CategoryBadge({ category }: { category: PostCategory }) {
  if (category === "MENSAGEM" || category === "SISTEMA") return null;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${categoryStyles[category]}`}>
      {categoryLabels[category]}
    </span>
  );
}

export default function CommunitiesPage({ sidebar, viewer }: { sidebar: ReactNode; viewer: Viewer }) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const loginPath = viewer === "investor" ? "/investors/login" : "/startups/login";

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const openId = params.get("comunidade");
  const open = communities.find((item) => item.id === openId) ?? null;

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || (err.status === 403 && err.message === "Acesso não permitido"))) {
        navigate(loginPath, { replace: true });
        return true;
      }
      return false;
    },
    [navigate, loginPath],
  );

  const loadCommunities = useCallback(async () => {
    try {
      setCommunities(await api.comunidades.listar());
      setLoadError("");
    } catch (err) {
      if (!handleAuthError(err)) setLoadError(err instanceof Error ? err.message : "Não foi possível carregar as comunidades.");
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  useEffect(() => {
    void loadCommunities();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadCommunities();
    }, POLL_LIST_MS);
    return () => window.clearInterval(timer);
  }, [loadCommunities]);

  // Abrir o grupo marca as mensagens como lidas (sem recriar a lista quando nada muda).
  const markRead = useCallback(
    (id: string) =>
      setCommunities((current) =>
        current.some((item) => item.id === id && item.unread > 0)
          ? current.map((item) => (item.id === id ? { ...item, unread: 0 } : item))
          : current,
      ),
    [],
  );

  const replace = (updated: Community) =>
    setCommunities((current) => current.map((item) => (item.id === updated.id ? updated : item)));

  function openCommunity(id: string) {
    setParams({ comunidade: id });
  }

  async function join(community: Community) {
    setBusyId(community.id);
    try {
      replace(await api.comunidades.entrar(community.id));
      openCommunity(community.id);
    } catch (err) {
      if (!handleAuthError(err)) setLoadError(err instanceof Error ? err.message : "Não foi possível entrar na comunidade.");
    } finally {
      setBusyId(null);
    }
  }

  async function leave(community: Community) {
    setBusyId(community.id);
    try {
      replace(await api.comunidades.sair(community.id));
      setParams({});
    } catch (err) {
      if (!handleAuthError(err)) setLoadError(err instanceof Error ? err.message : "Não foi possível sair da comunidade.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F8FA] text-[#222222]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {sidebar}
      <main className="md:ml-48">
        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-10">
          <header className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Comunidades</h1>
            <p className="mt-2 text-xs text-[#666666] sm:text-sm">
              Compartilhe notícias, iniciativas e movimentos com startups e investidores
            </p>
          </header>

          {loadError && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {loadError}
            </p>
          )}

          {loading && <p className="text-xs text-[#888888]">Carregando comunidades...</p>}

          {!loading && open ? (
            <GroupView
              key={open.id}
              community={open}
              communities={communities}
              busy={busyId === open.id}
              onBack={() => setParams({})}
              onSelect={openCommunity}
              onJoin={() => void join(open)}
              onLeave={() => void leave(open)}
              onRead={markRead}
              onAuthError={handleAuthError}
              onNotMember={loadCommunities}
            />
          ) : (
            !loading && (
              <ul aria-label="Lista de comunidades" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {communities.map((community) => (
                  <li key={community.id}>
                    <CommunityCard
                      community={community}
                      busy={busyId === community.id}
                      onOpen={() => openCommunity(community.id)}
                      onJoin={() => void join(community)}
                    />
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </main>
    </div>
  );
}

function CommunityCard({ community, busy, onOpen, onJoin }: { community: Community; busy: boolean; onOpen: () => void; onJoin: () => void }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-[#ECEFF1] bg-white p-5 shadow-[0_2px_3px_rgba(0,0,0,0.16)] transition hover:shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
      <div className="flex items-start gap-4">
        <CommunityPhoto community={community} />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold leading-snug text-[#252525]">{community.name}</h2>
          <p className="mt-1 flex items-center gap-1.5 text-[10px] text-[#888888]">
            <FiUsers size={11} aria-hidden="true" /> {membersLabel(community.members)}
            {community.joined && <span className="rounded-full bg-[#FFF2EF] px-2 py-0.5 font-medium text-[#EF5948]">Você participa</span>}
          </p>
        </div>
        {community.unread > 0 && (
          <span
            className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#EF5948] px-1.5 text-[10px] font-semibold text-white"
            aria-label={`${community.unread} mensagens não lidas`}
          >
            {community.unread}
          </span>
        )}
      </div>
      <p className="mt-4 flex-1 text-xs leading-relaxed text-[#666666]">{community.description}</p>
      {community.joined && community.lastMessage && (
        <p className="mt-3 truncate rounded-md bg-[#F7F9FA] px-3 py-2 text-[10px] text-[#777777]">
          {lastMessagePreview(community.lastMessage)}
        </p>
      )}
      <div className="mt-4">
        {community.joined ? (
          <button
            type="button"
            onClick={onOpen}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#EF5948] px-4 py-2.5 text-[11px] font-medium text-white transition hover:bg-[#DA4939]"
          >
            <FiMessageCircle aria-hidden="true" /> Abrir conversa
          </button>
        ) : (
          <button
            type="button"
            onClick={onJoin}
            disabled={busy}
            aria-label={`Entrar na comunidade ${community.name}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#EF5948] px-4 py-2.5 text-[11px] font-medium text-[#EF5948] transition hover:bg-[#FFF1EE] disabled:opacity-60"
          >
            {busy ? "Entrando..." : "Entrar na comunidade"}
          </button>
        )}
      </div>
    </article>
  );
}

function GroupView({
  community,
  communities,
  busy,
  onBack,
  onSelect,
  onJoin,
  onLeave,
  onRead,
  onAuthError,
  onNotMember,
}: {
  community: Community;
  communities: Community[];
  busy: boolean;
  onBack: () => void;
  onSelect: (id: string) => void;
  onJoin: () => void;
  onLeave: () => void;
  onRead: (id: string) => void;
  onAuthError: (err: unknown) => boolean;
  onNotMember: () => Promise<void>;
}) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<Exclude<PostCategory, "SISTEMA">>("MENSAGEM");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [membersOpen, setMembersOpen] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const lastId = useRef<string | undefined>(undefined);
  const stickToBottom = useRef(true);

  const merge = useCallback((incoming: CommunityPost[]) => {
    if (incoming.length === 0) return;
    setPosts((current) => {
      const known = new Set(current.map((post) => post.id));
      const fresh = incoming.filter((post) => !known.has(post.id));
      return fresh.length ? [...current, ...fresh] : current;
    });
    lastId.current = incoming[incoming.length - 1].id;
  }, []);

  const fetchPosts = useCallback(
    async (initial: boolean) => {
      try {
        const found = await api.comunidades.mensagens(community.id, initial ? undefined : lastId.current);
        if (initial) {
          setPosts(found);
          lastId.current = found.length ? found[found.length - 1].id : undefined;
          stickToBottom.current = true;
        } else {
          merge(found);
        }
        setLoaded(true);
        onRead(community.id);
      } catch (err) {
        if (onAuthError(err)) return;
        if (err instanceof ApiError && err.status === 403) void onNotMember();
        else setError(err instanceof Error ? err.message : "Não foi possível carregar as mensagens.");
      }
    },
    [community.id, merge, onAuthError, onNotMember, onRead],
  );

  useEffect(() => {
    if (!community.joined) return;
    void fetchPosts(true);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void fetchPosts(false);
    }, POLL_MESSAGES_MS);
    return () => window.clearInterval(timer);
  }, [community.joined, fetchPosts]);

  // Mantém o fim da conversa visível, a não ser que a pessoa tenha rolado para ler o histórico.
  useEffect(() => {
    const log = logRef.current;
    if (log && stickToBottom.current) log.scrollTop = log.scrollHeight;
  }, [posts]);

  async function send(event?: FormEvent) {
    event?.preventDefault();
    const clean = text.trim();
    if (!clean || sending) return;
    setSending(true);
    setError("");
    try {
      const saved = await api.comunidades.enviar(community.id, clean, category);
      stickToBottom.current = true;
      merge([saved]);
      setText("");
      setCategory("MENSAGEM");
    } catch (err) {
      if (onAuthError(err)) return;
      if (err instanceof ApiError && err.status === 403) void onNotMember();
      setError(err instanceof Error ? err.message : "Não foi possível enviar a mensagem.");
    } finally {
      setSending(false);
    }
  }

  function onComposerKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  let lastDay = "";
  let previousAuthor: number | null = null;

  return (
    <div className="grid h-[calc(100dvh-245px)] min-h-[480px] gap-4 md:h-[calc(100dvh-125px)] lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
      <nav aria-label="Suas comunidades" className="hidden min-h-0 overflow-y-auto rounded-lg border border-[#ECEFF1] bg-white shadow-[0_2px_3px_rgba(0,0,0,0.16)] lg:block">
        <button type="button" onClick={onBack} className="flex w-full items-center gap-2 border-b border-[#E7E7E7] px-4 py-3 text-[11px] font-medium text-[#EF5948] hover:bg-[#FFF7F5]">
          <FiArrowLeft aria-hidden="true" /> Todas as comunidades
        </button>
        <ul>
          {communities.map((item) => {
            const active = item.id === community.id;
            return (
              <li key={item.id} className="border-b border-[#E7E7E7]">
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-current={active ? "true" : undefined}
                  className={`flex w-full items-center gap-3 border-l-2 px-4 py-3 text-left transition ${
                    active ? "border-[#EF5948] bg-[#FAF7F5]" : "border-transparent hover:bg-[#FAFAFA]"
                  }`}
                >
                  <CommunityPhoto community={item} size="small" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={`truncate text-xs ${item.unread ? "font-semibold" : "font-medium"}`}>{item.name}</p>
                      {item.joined && item.lastMessage && (
                        <span className="shrink-0 text-[9px] text-[#999999]">{previewDate(item.lastMessage.sentAt)}</span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-2">
                      <p className="truncate text-[10px] text-[#777777]">
                        {!item.joined
                          ? "Você não participa"
                          : item.lastMessage
                            ? lastMessagePreview(item.lastMessage)
                            : membersLabel(item.members)}
                      </p>
                      {item.unread > 0 && (
                        <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#EF5948] px-1 text-[9px] font-semibold text-white" aria-label={`${item.unread} não lidas`}>
                          {item.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <section aria-label={`Comunidade ${community.name}`} className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-[#ECEFF1] bg-white shadow-[0_2px_3px_rgba(0,0,0,0.16)]">
        <header className="flex min-h-20 shrink-0 items-center gap-3 border-b border-[#E7E7E7] px-4 py-4 sm:px-6">
          <button type="button" onClick={onBack} aria-label="Voltar para comunidades" className="rounded p-1 text-[#777777] hover:bg-[#F5F5F5] lg:hidden">
            <FiArrowLeft size={20} />
          </button>
          <CommunityPhoto community={community} size="medium" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xs font-medium sm:text-sm">{community.name}</h2>
            <p className="mt-0.5 text-[9px] text-[#777777] sm:text-[10px]">{membersLabel(community.members)}</p>
          </div>
          {community.joined && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setMembersOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[#D8D8D8] px-3 py-2 text-[11px] font-medium text-[#555555] transition hover:border-[#EF5948] hover:text-[#EF5948]"
              >
                <FiUsers aria-hidden="true" /> <span className="hidden sm:inline">Membros</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmLeave(true)}
                aria-label="Sair da comunidade"
                className="flex items-center gap-1.5 rounded-lg border border-[#D8D8D8] px-3 py-2 text-[11px] font-medium text-[#555555] transition hover:border-[#EF5948] hover:text-[#EF5948]"
              >
                <FiLogOut aria-hidden="true" /> <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          )}
        </header>

        {!community.joined ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
            <CommunityPhoto community={community} />
            <p className="max-w-md text-xs leading-relaxed text-[#666666]">{community.description}</p>
            <button
              type="button"
              onClick={onJoin}
              disabled={busy}
              className="rounded-lg bg-[#EF5948] px-5 py-2.5 text-[11px] font-medium text-white transition hover:bg-[#DA4939] disabled:opacity-60"
            >
              {busy ? "Entrando..." : "Entrar na comunidade"}
            </button>
          </div>
        ) : (
          <>
            <div
              ref={logRef}
              role="log"
              aria-label="Mensagens da comunidade"
              aria-live="polite"
              aria-relevant="additions"
              onScroll={(event) => {
                const el = event.currentTarget;
                stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
              }}
              className="min-h-0 flex-1 space-y-1.5 overflow-y-auto bg-[#FAFBFC] px-4 py-5 sm:px-6"
            >
              {posts.map((post) => {
                const day = dayFormatter.format(new Date(post.sentAt));
                const separator = day !== lastDay;
                lastDay = day;
                if (post.sender === "system") {
                  previousAuthor = null;
                  return (
                    <div key={post.id}>
                      {separator && <DaySeparator day={day} />}
                      <p className="py-1 text-center text-[10px] text-[#888888]">
                        <span className="rounded-full bg-[#F0F2F4] px-3 py-1">{post.text}</span>
                      </p>
                    </div>
                  );
                }
                const mine = post.sender === "me";
                const showAuthor = separator || previousAuthor !== post.authorUserId;
                previousAuthor = post.authorUserId;
                return (
                  <div key={post.id} className={showAuthor ? "pt-2" : ""}>
                    {separator && <DaySeparator day={day} />}
                    <div className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}>
                      {!mine && (
                        <span className="w-8 shrink-0">
                          {showAuthor && (
                            <UserPhoto
                              userId={post.authorUserId}
                              hasPhoto={post.authorHasPhoto}
                              name={post.authorName}
                              className="h-8 w-8 rounded-full bg-[#F5DDD3] text-[10px] font-medium !text-[#AF5039]"
                            />
                          )}
                        </span>
                      )}
                      <div
                        className={`max-w-[82%] rounded-lg px-3.5 py-2 text-[11px] leading-relaxed sm:max-w-[68%] ${
                          mine ? "border border-[#F3C9BF] bg-[#FFF5F2] text-[#4A4A4A]" : "border border-[#ECEFF1] bg-white text-[#4A4A4A]"
                        }`}
                      >
                        {!mine && showAuthor && (
                          <p className="mb-0.5 flex flex-wrap items-baseline gap-x-1.5 text-[10px]">
                            <span className="font-semibold" style={{ color: authorColor(post.authorUserId) }}>{post.authorName}</span>
                            <span className="text-[#999999]">· {post.authorRole}</span>
                          </p>
                        )}
                        <span className="sr-only">{mine ? "Você" : post.authorName}: </span>
                        {post.category !== "MENSAGEM" && (
                          <div className="mb-1">
                            <CategoryBadge category={post.category} />
                          </div>
                        )}
                        <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{post.text}</p>
                        <p className="mt-0.5 text-right text-[9px] text-[#999999]">{timeFormatter.format(new Date(post.sentAt))}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {loaded && posts.every((post) => post.sender === "system") && (
                <p className="py-6 text-center text-xs text-[#999999]">
                  Nenhuma mensagem ainda. Compartilhe uma notícia, iniciativa ou movimento da sua empresa.
                </p>
              )}
            </div>

            <div className="shrink-0 border-t border-[#EEF0F2] px-4 pb-5 pt-3 sm:px-6">
              {error && (
                <p role="alert" className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}
              <fieldset className="mb-2 flex flex-wrap gap-1.5">
                <legend className="sr-only">Tipo da mensagem</legend>
                {(Object.keys(categoryLabels) as Exclude<PostCategory, "SISTEMA">[]).map((key) => (
                  <label
                    key={key}
                    className={`cursor-pointer rounded-full border px-3 py-1 text-[10px] font-medium transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[#EF5948] ${
                      category === key ? "border-[#EF5948] bg-[#FFF1EE] text-[#EF5948]" : "border-[#E0E0E0] text-[#777777] hover:border-[#EF5948]"
                    }`}
                  >
                    <input type="radio" name="categoria" value={key} checked={category === key} onChange={() => setCategory(key)} className="sr-only" />
                    {categoryLabels[key]}
                  </label>
                ))}
              </fieldset>
              <form onSubmit={send} aria-label="Enviar mensagem para a comunidade" aria-busy={sending} className="flex items-end gap-3 rounded-lg bg-white px-3 py-3 shadow-[0_2px_3px_rgba(0,0,0,0.22)]">
                <textarea
                  value={text}
                  rows={1}
                  maxLength={1000}
                  disabled={sending}
                  onChange={(event) => setText(event.currentTarget.value)}
                  onKeyDown={onComposerKey}
                  aria-label="Digite sua mensagem"
                  placeholder={category === "MENSAGEM" ? "Escreva para o grupo..." : `Compartilhe uma ${categoryLabels[category].toLowerCase()}...`}
                  className="max-h-28 min-h-8 min-w-0 flex-1 resize-none rounded-lg border border-[#D8D8D8] bg-white px-3 py-1.5 text-xs leading-5 outline-none transition [field-sizing:content] focus:border-[#EF5948] focus:ring-2 focus:ring-[#EF5948]/10"
                />
                <button
                  type="submit"
                  disabled={sending || !text.trim()}
                  className="flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#EF5948] px-4 text-[11px] font-medium text-white transition hover:bg-[#DA4939] disabled:opacity-60"
                >
                  <FiSend aria-hidden="true" /> {sending ? "Enviando..." : "Enviar"}
                </button>
              </form>
            </div>
          </>
        )}
      </section>

      {membersOpen && <MembersDialog community={community} onClose={() => setMembersOpen(false)} />}
      {confirmLeave && (
        <Dialog title="Sair da comunidade?" onClose={() => setConfirmLeave(false)}>
          <p className="text-xs leading-relaxed text-[#666666]">
            Você deixa de receber as mensagens de <strong>{community.name}</strong>. Pode entrar de novo quando quiser.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setConfirmLeave(false)} className="rounded-lg border border-[#D8D8D8] px-4 py-2 text-[11px] font-medium text-[#555555] hover:bg-[#F5F5F5]">
              Cancelar
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setConfirmLeave(false);
                onLeave();
              }}
              className="rounded-lg bg-[#EF5948] px-4 py-2 text-[11px] font-medium text-white hover:bg-[#DA4939] disabled:opacity-60"
            >
              Sair da comunidade
            </button>
          </div>
        </Dialog>
      )}
    </div>
  );
}

function DaySeparator({ day }: { day: string }) {
  return (
    <p className="my-3 text-center text-[10px] text-[#999999]">
      <span className="rounded-full bg-[#F3F4F6] px-3 py-1">{day}</span>
    </p>
  );
}

function MembersDialog({ community, onClose }: { community: Community; onClose: () => void }) {
  const [members, setMembers] = useState<CommunityMember[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.comunidades
      .membros(community.id)
      .then(setMembers)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Não foi possível carregar os membros."));
  }, [community.id]);

  return (
    <Dialog title={`Membros · ${community.name}`} onClose={onClose}>
      {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
      {!members && !error && <p className="text-xs text-[#888888]">Carregando membros...</p>}
      {members && (
        <ul className="divide-y divide-[#F0F0F0]">
          {members.map((member) => (
            <li key={member.userId} className="flex items-center gap-3 py-3">
              <UserPhoto
                userId={member.userId}
                hasPhoto={member.hasPhoto}
                name={member.name}
                className="h-9 w-9 rounded-full bg-[#F5DDD3] text-[10px] font-medium !text-[#AF5039]"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-[#252525]">
                  {member.name}
                  {member.me && <span className="ml-1.5 text-[10px] font-normal text-[#999999]">(você)</span>}
                </p>
                <p className="text-[10px] text-[#888888]">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Dialog>
  );
}
