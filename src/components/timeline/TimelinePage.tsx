// Timeline dos dois portais (inspirada no X): publicações de texto, curtidas, comentários e
// compartilhamentos. Foto e nome de quem publica ou comenta levam ao perfil da pessoa.
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { FiMessageCircle, FiMoreHorizontal, FiRepeat, FiShare2, FiTrash2 } from "react-icons/fi";
import { HiHandThumbUp, HiOutlineHandThumbUp } from "react-icons/hi2";
import { Link, useNavigate } from "react-router-dom";

import UserPhoto from "../Avatar";
import { loadOwnProfile } from "../MatchCelebration";
import type { MatchParty } from "../MatchCelebration";
import { Dialog, cardClass, outlineButton, primaryButton } from "../ProfileUI";
import { fullDate, profilePath, relativeTime } from "./profileLink";
import type { Viewer } from "./profileLink";
import { ApiError, api } from "../../services/api";
import type { TimelineAuthor, TimelineComment, TimelinePost } from "../../services/api";

const MAX = 500;
const POLL_MS = 30000;

function errorText(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

function count(n: number) {
  return n >= 1000 ? `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : String(n);
}

/* ------------------------------------------------------------ peças */

function AuthorPhoto({ author, viewer, me, size = "md" }: { author: TimelineAuthor; viewer: Viewer; me?: number | null; size?: "md" | "sm" }) {
  return (
    <Link
      to={profilePath(author, viewer, me)}
      aria-label={`Ver perfil de ${author.name}`}
      className="shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948]"
    >
      <UserPhoto
        userId={author.userId}
        hasPhoto={author.hasPhoto}
        name={author.name}
        className={`${size === "md" ? "h-10 w-10 text-xs" : "h-8 w-8 text-[10px]"} rounded-full bg-[#F5DDD3] font-medium !text-[#AF5039] transition hover:opacity-85`}
      />
    </Link>
  );
}

function AuthorLine({ author, viewer, me, createdAt }: { author: TimelineAuthor; viewer: Viewer; me?: number | null; createdAt: string }) {
  return (
    <p className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-[11px] leading-5">
      <Link to={profilePath(author, viewer, me)} className="truncate font-semibold text-[#222222] hover:underline">
        {author.name}
      </Link>
      <span className="text-[#888888]">· {author.role}</span>
      <time dateTime={createdAt} title={fullDate(createdAt)} className="text-[#999999]">
        · {relativeTime(createdAt)}
      </time>
    </p>
  );
}

function PostText({ text }: { text: string }) {
  return <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-[#333333] [overflow-wrap:anywhere]">{text}</p>;
}

/** Publicação compartilhada, embutida (um nível). */
function Embedded({ post, viewer, me }: { post: TimelinePost; viewer: Viewer; me?: number | null }) {
  return (
    <div className="mt-2.5 rounded-lg border border-[#E5E7EB] p-3">
      <div className="flex items-start gap-2">
        <AuthorPhoto author={post.author} viewer={viewer} me={me} size="sm" />
        <div className="min-w-0 flex-1">
          <AuthorLine author={post.author} viewer={viewer} me={me} createdAt={post.createdAt} />
          {post.text && <PostText text={post.text} />}
        </div>
      </div>
    </div>
  );
}

function Composer({ me, viewer, onPost }: { me: MatchParty | null; viewer: Viewer; onPost: (post: TimelinePost) => void }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const id = useId();
  const left = MAX - text.length;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      onPost(await api.timeline.publicar(text.trim()));
      setText("");
    } catch (err) {
      setError(errorText(err, "Não foi possível publicar."));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={submit} aria-label="Nova publicação" className={`${cardClass} flex gap-3 p-4`}>
      {me && (
        <Link to={viewer === "investor" ? "/investors/perfil" : "/startups/perfil"} aria-label="Ver meu perfil" className="shrink-0">
          <UserPhoto userId={me.userId} hasPhoto={me.hasPhoto} name={me.name} className="h-10 w-10 rounded-full bg-[#F5DDD3] text-xs font-medium !text-[#AF5039]" />
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="sr-only">O que você quer compartilhar?</label>
        <textarea
          id={id}
          value={text}
          maxLength={MAX}
          rows={2}
          onChange={(e) => setText(e.currentTarget.value)}
          placeholder="O que está acontecendo no seu ecossistema?"
          className="w-full resize-none border-0 bg-transparent px-0 py-2 text-sm leading-relaxed text-[#222222] outline-none [field-sizing:content] placeholder:text-[#9A9A9A]"
        />
        {error && <p role="alert" className="mb-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <div className="flex items-center justify-end gap-3 border-t border-[#F0F0F0] pt-3">
          <span className={`text-[10px] tabular-nums ${left < 0 ? "text-red-600" : left <= 20 ? "text-[#C2432F]" : "text-[#999999]"}`} aria-live="polite">
            {left} caracteres restantes
          </span>
          <button type="submit" disabled={sending || !text.trim()} className={primaryButton("rounded-full px-5")}>
            {sending ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Comments({ post, viewer, me, onCount }: { post: TimelinePost; viewer: Viewer; me?: number | null; onCount: (delta: number) => void }) {
  const [comments, setComments] = useState<TimelineComment[] | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const id = useId();

  useEffect(() => {
    api.timeline.comentarios(post.id).then(setComments).catch((err: unknown) => setError(errorText(err, "Não foi possível carregar os comentários.")));
  }, [post.id]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    setError("");
    try {
      const saved = await api.timeline.comentar(post.id, text.trim());
      setComments((current) => [...(current ?? []), saved]);
      setText("");
      onCount(1);
    } catch (err) {
      setError(errorText(err, "Não foi possível comentar."));
    } finally {
      setSending(false);
    }
  }

  async function remove(comment: TimelineComment) {
    try {
      await api.timeline.excluirComentario(comment.id);
      setComments((current) => (current ?? []).filter((item) => item.id !== comment.id));
      onCount(-1);
    } catch (err) {
      setError(errorText(err, "Não foi possível apagar o comentário."));
    }
  }

  return (
    <section aria-label={`Comentários da publicação de ${post.author.name}`} className="mt-3 border-t border-[#F0F0F0] pt-3">
      {comments == null && !error && <p className="text-[10px] text-[#999999]">Carregando comentários...</p>}
      <ul className="space-y-3">
        {comments?.map((comment) => (
          <li key={comment.id} className="flex gap-2.5">
            <AuthorPhoto author={comment.author} viewer={viewer} me={me} size="sm" />
            <div className="min-w-0 flex-1 rounded-lg bg-[#F7F9FA] px-3 py-2">
              <div className="flex items-start justify-between gap-2">
                <AuthorLine author={comment.author} viewer={viewer} me={me} createdAt={comment.createdAt} />
                {comment.canDelete && (
                  <button type="button" onClick={() => void remove(comment)} aria-label="Apagar comentário" className="rounded p-1 text-[#999999] hover:bg-white hover:text-red-600">
                    <FiTrash2 size={12} aria-hidden="true" />
                  </button>
                )}
              </div>
              <PostText text={comment.text} />
            </div>
          </li>
        ))}
      </ul>
      {error && <p role="alert" className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
      <form onSubmit={submit} className="mt-3 flex gap-2" aria-label="Comentar">
        <label htmlFor={id} className="sr-only">Escreva um comentário</label>
        <input
          id={id}
          value={text}
          maxLength={MAX}
          onChange={(e) => setText(e.currentTarget.value)}
          placeholder="Escreva um comentário..."
          className="h-9 min-w-0 flex-1 rounded-full border border-[#D8D8D8] bg-white px-4 text-xs outline-none transition focus:border-[#EF5948] focus:ring-2 focus:ring-[#EF5948]/10"
        />
        <button type="submit" disabled={sending || !text.trim()} className={primaryButton("rounded-full")}>
          {sending ? "..." : "Comentar"}
        </button>
      </form>
    </section>
  );
}

function Action({ label, active, onClick, icon, value, tone, expanded, haspopup }: {
  label: string; active?: boolean; onClick: () => void; icon: ReactNode; value: number; tone: string; expanded?: boolean; haspopup?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={haspopup || expanded !== undefined ? undefined : active}
      aria-expanded={expanded}
      aria-haspopup={haspopup ? "menu" : undefined}
      className={`group flex items-center gap-1.5 rounded-full px-2 py-1.5 text-[11px] tabular-nums transition ${active ? tone : "text-[#777777]"} hover:bg-[#FFF2EF] hover:text-[#EF5948]`}
    >
      {icon}
      <span aria-hidden="true">{value > 0 ? count(value) : ""}</span>
    </button>
  );
}

function PostCard({
  item,
  viewer,
  me,
  onChange,
  onRemove,
  onShare,
}: {
  item: TimelinePost;
  viewer: Viewer;
  me?: number | null;
  onChange: (post: TimelinePost) => void;
  onRemove: (post: TimelinePost) => void;
  onShare: (post: TimelinePost, mode: "repost" | "quote" | "undo") => void;
}) {
  // Compartilhamento simples: o cartão é a publicação original, com "Fulano compartilhou" acima.
  const post = item.repost && item.sharedPost ? item.sharedPost : item;
  const [showComments, setShowComments] = useState(false);
  const [menu, setMenu] = useState<"share" | "more" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function patch(next: Partial<TimelinePost>) {
    const updated = { ...post, ...next };
    onChange(item.repost ? { ...item, sharedPost: updated } : updated);
  }

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    setError("");
    // Resposta imediata na tela; o servidor confirma os números.
    patch({ liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) });
    try {
      const saved = post.liked ? await api.timeline.descurtir(post.id) : await api.timeline.curtir(post.id);
      patch({ liked: saved.liked, likes: saved.likes, comments: saved.comments, shares: saved.shares, shared: saved.shared });
    } catch (err) {
      patch({ liked: post.liked, likes: post.likes });
      setError(errorText(err, "Não foi possível curtir."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={`${cardClass} px-4 pb-2 pt-3.5`} aria-label={`Publicação de ${post.author.name}`}>
      {item.repost && (
        <p className="mb-2 flex items-center gap-1.5 pl-[52px] text-[10px] font-medium text-[#777777]">
          <FiRepeat size={12} aria-hidden="true" />
          {item.mine ? "Você compartilhou" : (
            <>
              <Link to={profilePath(item.author, viewer, me)} className="hover:underline">{item.author.name}</Link> compartilhou
            </>
          )}
        </p>
      )}
      <div className="flex gap-3">
        <AuthorPhoto author={post.author} viewer={viewer} me={me} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <AuthorLine author={post.author} viewer={viewer} me={me} createdAt={post.createdAt} />
            {item.mine && !item.repost && (
              <div className="relative">
                <button type="button" onClick={() => setMenu(menu === "more" ? null : "more")} aria-label="Mais opções" aria-haspopup="menu" aria-expanded={menu === "more"} className="rounded-full p-1.5 text-[#999999] hover:bg-[#F5F5F5]">
                  <FiMoreHorizontal size={15} aria-hidden="true" />
                </button>
                {menu === "more" && (
                  <div role="menu" className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
                    <button type="button" role="menuitem" onClick={() => { setMenu(null); onRemove(item); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50">
                      <FiTrash2 aria-hidden="true" /> Excluir publicação
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {post.text && <PostText text={post.text} />}
          {!item.repost && item.sharedPost && <Embedded post={item.sharedPost} viewer={viewer} me={me} />}
          {!item.repost && item.sharedUnavailable && (
            <p className="mt-2.5 rounded-lg border border-dashed border-[#DADDE0] px-3 py-2.5 text-[11px] text-[#999999]">Esta publicação não está mais disponível.</p>
          )}

          {error && <p role="alert" className="mt-2 text-[10px] text-red-600">{error}</p>}

          <div className="-ml-2 mt-1.5 flex max-w-sm items-center justify-between">
            <Action
              label={`Comentar (${post.comments} comentários)`}
              expanded={showComments}
              onClick={() => setShowComments((open) => !open)}
              icon={<FiMessageCircle size={15} aria-hidden="true" />}
              value={post.comments}
              tone="text-[#EF5948]"
            />
            <div className="relative">
              <Action
                label={`Compartilhar (${post.shares} compartilhamentos)`}
                active={post.shared}
                haspopup
                expanded={menu === "share"}
                onClick={() => setMenu(menu === "share" ? null : "share")}
                icon={<FiShare2 size={15} aria-hidden="true" />}
                value={post.shares}
                tone="text-[#1D7A55]"
              />
              {menu === "share" && (
                <div role="menu" className="absolute left-0 top-9 z-10 w-56 rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
                  <button type="button" role="menuitem" onClick={() => { setMenu(null); onShare(post, post.shared ? "undo" : "repost"); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#333333] hover:bg-[#FFF7F5]">
                    <FiShare2 aria-hidden="true" /> {post.shared ? "Desfazer compartilhamento" : "Compartilhar"}
                  </button>
                  <button type="button" role="menuitem" onClick={() => { setMenu(null); onShare(post, "quote"); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-[#333333] hover:bg-[#FFF7F5]">
                    <FiMessageCircle aria-hidden="true" /> Compartilhar com comentário
                  </button>
                </div>
              )}
            </div>
            <Action
              label={post.liked ? `Remover curtida (${post.likes} curtidas)` : `Curtir (${post.likes} curtidas)`}
              active={post.liked}
              onClick={() => void toggleLike()}
              icon={post.liked ? <HiHandThumbUp size={16} aria-hidden="true" /> : <HiOutlineHandThumbUp size={16} aria-hidden="true" />}
              value={post.likes}
              tone="text-[#EF5948]"
            />
          </div>

          {showComments && (
            <Comments post={post} viewer={viewer} me={me} onCount={(delta) => patch({ comments: Math.max(0, post.comments + delta) })} />
          )}
        </div>
      </div>
    </article>
  );
}

function QuoteDialog({ post, viewer, me, onClose, onDone }: { post: TimelinePost; viewer: Viewer; me?: number | null; onClose: () => void; onDone: (created: TimelinePost) => void }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setError("");
    try {
      onDone(await api.timeline.publicar(text.trim() || null, post.id));
    } catch (err) {
      setError(errorText(err, "Não foi possível compartilhar."));
      setSending(false);
    }
  }
  return (
    <Dialog title="Compartilhar com comentário" onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3">
        <label htmlFor="quote-text" className="sr-only">Seu comentário</label>
        <textarea id="quote-text" value={text} maxLength={MAX} rows={3} onChange={(e) => setText(e.currentTarget.value)} placeholder="Adicione um comentário..." className="w-full resize-y rounded-md border border-[#D6DADC] px-3 py-2 text-xs outline-none focus:border-[#EF5948] focus:ring-2 focus:ring-[#EF5948]/10" />
        <Embedded post={post} viewer={viewer} me={me} />
        {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={outlineButton()}>Cancelar</button>
          <button type="submit" disabled={sending} className={primaryButton()}>{sending ? "Compartilhando..." : "Compartilhar"}</button>
        </div>
      </form>
    </Dialog>
  );
}

/* ------------------------------------------------------------ página */

export default function TimelinePage({ sidebar, viewer }: { sidebar: ReactNode; viewer: Viewer }) {
  const navigate = useNavigate();
  const loginPath = viewer === "investor" ? "/investors/login" : "/startups/login";
  const [posts, setPosts] = useState<TimelinePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [fresh, setFresh] = useState<TimelinePost[]>([]);
  const [me, setMe] = useState<MatchParty | null>(null);
  const [quote, setQuote] = useState<TimelinePost | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<TimelinePost | null>(null);
  const newest = useRef<string | null>(null);

  const handle = useCallback(
    (err: unknown, fallback: string) => {
      if (err instanceof ApiError && (err.status === 401 || (err.status === 403 && err.message === "Acesso não permitido"))) {
        navigate(loginPath, { replace: true });
        return;
      }
      setError(errorText(err, fallback));
    },
    [navigate, loginPath],
  );

  useEffect(() => {
    loadOwnProfile().then(setMe).catch(() => undefined);
    api.timeline
      .feed()
      .then((page) => {
        setPosts(page);
        setHasMore(page.length >= 20);
        newest.current = page[0]?.id ?? null;
      })
      .catch((err: unknown) => handle(err, "Não foi possível carregar a timeline."))
      .finally(() => setLoading(false));
  }, [handle]);

  // Procura publicações novas a cada 30 s e mostra um aviso (não muda a lista sozinha).
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible" || !newest.current) return;
      api.timeline.novas(newest.current).then((found) => {
        const others = found.filter((post) => !post.mine);
        if (others.length) setFresh(others);
      }).catch(() => undefined);
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, []);

  function prepend(created: TimelinePost[]) {
    setPosts((current) => {
      const ids = new Set(created.map((post) => post.id));
      return [...created, ...current.filter((post) => !ids.has(post.id))];
    });
    if (created[0]) newest.current = created[0].id;
  }

  function showFresh() {
    prepend(fresh);
    setFresh([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loadMore() {
    const last = posts[posts.length - 1];
    if (!last || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await api.timeline.feed(last.id);
      setPosts((current) => [...current, ...page.filter((post) => !current.some((c) => c.id === post.id))]);
      setHasMore(page.length >= 20);
    } catch (err) {
      handle(err, "Não foi possível carregar mais publicações.");
    } finally {
      setLoadingMore(false);
    }
  }

  // Atualiza todas as aparições da mesma publicação (original e compartilhamentos dela).
  function update(changed: TimelinePost) {
    const target = changed.repost && changed.sharedPost ? changed.sharedPost : changed;
    setPosts((current) =>
      current.map((post) => {
        if (post.id === changed.id) return changed;
        if (post.id === target.id) return { ...post, ...pick(target) };
        if (post.sharedPost?.id === target.id) return { ...post, sharedPost: { ...post.sharedPost, ...pick(target) } };
        return post;
      }),
    );
  }

  function pick(post: TimelinePost) {
    const { likes, liked, comments, shares, shared } = post;
    return { likes, liked, comments, shares, shared };
  }

  async function share(post: TimelinePost, mode: "repost" | "quote" | "undo") {
    setError("");
    if (mode === "quote") return setQuote(post);
    try {
      if (mode === "repost") {
        const created = await api.timeline.publicar(null, post.id);
        prepend([created]);
        if (created.sharedPost) update(created.sharedPost);
      } else {
        const original = await api.timeline.descompartilhar(post.id);
        setPosts((current) => current.filter((item) => !(item.repost && item.mine && item.sharedPost?.id === post.id)));
        update(original);
      }
    } catch (err) {
      handle(err, "Não foi possível compartilhar.");
    }
  }

  async function remove(post: TimelinePost) {
    setConfirmRemove(null);
    try {
      await api.timeline.excluir(post.id);
      setPosts((current) =>
        current
          .filter((item) => item.id !== post.id && !(item.repost && item.sharedPost?.id === post.id))
          .map((item) => (item.sharedPost?.id === post.id ? { ...item, sharedPost: null, sharedUnavailable: true } : item)),
      );
    } catch (err) {
      handle(err, "Não foi possível excluir a publicação.");
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F8FA] text-[#222222]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {sidebar}
      <main className="md:ml-48">
        <div className="mx-auto max-w-2xl px-4 py-7 sm:px-7">
          <header className="mb-5">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Timeline</h1>
            <p className="mt-2 text-xs text-[#666666] sm:text-sm">Novidades de startups e investidores da Vértice</p>
          </header>

          <Composer me={me} viewer={viewer} onPost={(post) => prepend([post])} />

          {fresh.length > 0 && (
            <div className="sticky top-3 z-20 mt-4 flex justify-center">
              <button type="button" onClick={showFresh} className="rounded-full bg-[#EF5948] px-4 py-2 text-[11px] font-medium text-white shadow-md transition hover:bg-[#DA4939]">
                Ver {fresh.length === 1 ? "1 nova publicação" : `${fresh.length} novas publicações`}
              </button>
            </div>
          )}

          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          {loading && <p role="status" className="mt-6 text-xs text-[#888888]">Carregando publicações...</p>}
          {!loading && posts.length === 0 && !error && (
            <div className={`${cardClass} mt-4 p-8 text-center text-xs text-[#777777]`}>
              Ainda não há publicações. Que tal começar contando uma novidade da sua empresa?
            </div>
          )}

          <div className="mt-4 grid gap-3" aria-label="Publicações" role="feed" aria-busy={loading || loadingMore}>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                item={post}
                viewer={viewer}
                me={me?.userId}
                onChange={update}
                onRemove={(target) => setConfirmRemove(target)}
                onShare={(target, mode) => void share(target, mode)}
              />
            ))}
          </div>

          {!loading && hasMore && posts.length > 0 && (
            <div className="mt-5 flex justify-center">
              <button type="button" onClick={() => void loadMore()} disabled={loadingMore} className={outlineButton("rounded-full")}>
                {loadingMore ? "Carregando..." : "Carregar mais"}
              </button>
            </div>
          )}
        </div>
      </main>

      {quote && (
        <QuoteDialog
          post={quote}
          viewer={viewer}
          me={me?.userId}
          onClose={() => setQuote(null)}
          onDone={(created) => {
            setQuote(null);
            prepend([created]);
            if (created.sharedPost) update(created.sharedPost);
          }}
        />
      )}
      {confirmRemove && (
        <Dialog title="Excluir publicação?" onClose={() => setConfirmRemove(null)}>
          <p className="text-xs leading-relaxed text-[#666666]">A publicação sai da timeline e os compartilhamentos dela deixam de mostrá-la. Não é possível desfazer.</p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setConfirmRemove(null)} className={outlineButton()}>Cancelar</button>
            <button type="button" onClick={() => void remove(confirmRemove)} className={primaryButton("bg-red-600 hover:bg-red-700")}>Excluir</button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
