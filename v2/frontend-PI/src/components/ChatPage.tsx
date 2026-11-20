// Tela "Mensagens" dos dois portais: conversas das conexões firmadas, histórico e,
// no portal do investidor, o convite para reunião.
import { useCallback, useEffect, useRef, useState } from "react";
import UserPhoto from "./Avatar";
import type { FormEvent, ReactNode } from "react";
import { FiArrowLeft, FiCalendar, FiMessageSquare } from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";

import InviteDialog from "./InviteDialog";
import MeetingCard from "./MeetingCard";
import { ApiError, api } from "../services/api";
import type { ChatMessage, Conversation, Meeting } from "../services/api";

/** Novas mensagens são buscadas a cada 5 s enquanto a aba está visível. */
const POLL_MS = 5000;

type ChatPageProps = {
  sidebar: ReactNode;
  viewer: "investor" | "startup";
};

function Avatar({ name, size = "small", userId, hasPhoto }: { name: string; size?: "small" | "medium"; userId?: number; hasPhoto?: boolean }) {
  return (
    <UserPhoto
      userId={userId}
      hasPhoto={hasPhoto}
      name={name}
      className={[
        "rounded-full bg-[#F5DDD3] font-medium !text-[#AF5039]",
        size === "medium" ? "h-10 w-10 text-xs" : "h-8 w-8 text-[10px]",
      ].join(" ")}
    />
  );
}

const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dayFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

function formatTime(iso: string) {
  return timeFormatter.format(new Date(iso));
}

function formatPreviewDate(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  return date.toDateString() === today.toDateString()
    ? timeFormatter.format(date)
    : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export default function ChatPage({ sidebar, viewer }: ChatPageProps) {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const loginPath = viewer === "investor" ? "/investors/login" : "/startups/login";
  const connectionsPath = viewer === "investor" ? "/investors/conections" : "/startups/conections";

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const selectedId = params.get("conversa") ?? conversations[0]?.id ?? null;
  const active = conversations.find((conversation) => conversation.id === selectedId) ?? null;
  const text = selectedId ? (draft[selectedId] ?? "") : "";

  const handleAuthError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        navigate(loginPath, { replace: true });
        return true;
      }
      return false;
    },
    [navigate, loginPath],
  );

  const loadConversations = useCallback(async () => {
    try {
      setConversations(await api.conversas.listar());
      setLoadError("");
    } catch (err) {
      if (!handleAuthError(err)) {
        setLoadError(err instanceof Error ? err.message : "Não foi possível carregar as conversas.");
      }
    } finally {
      setLoading(false);
    }
  }, [handleAuthError]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      try {
        const history = await api.conversas.mensagens(conversationId);
        setMessages(history);
        // Abrir a conversa marca as mensagens como lidas.
        setConversations((current) =>
          current.map((item) => (item.id === conversationId ? { ...item, unread: 0 } : item)),
        );
      } catch (err) {
        if (!handleAuthError(err)) {
          setError(err instanceof Error ? err.message : "Não foi possível carregar as mensagens.");
        }
      }
    },
    [handleAuthError],
  );

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (!active) return;
    setMessages([]);
    lastCount.current = 0;
    void loadMessages(active.id);
  }, [active?.id, loadMessages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Atualização periódica enquanto a aba está visível.
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void loadConversations();
      if (active) void loadMessages(active.id);
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [active, loadConversations, loadMessages]);

  // Rola até o fim quando chegam mensagens novas.
  useEffect(() => {
    if (messages.length !== lastCount.current && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
    lastCount.current = messages.length;
  }, [messages, mobileChatOpen]);

  function select(id: string) {
    setParams({ conversa: id }, { replace: true });
    setMobileChatOpen(true);
    setError("");
  }

  function appendOwn(message: ChatMessage) {
    setMessages((current) => [...current, message]);
    setConversations((current) =>
      current.map((item) =>
        item.id === active?.id
          ? { ...item, lastMessage: { text: message.text, type: message.type, sentAt: message.sentAt, mine: true } }
          : item,
      ),
    );
  }

  function updateMeeting(meeting: Meeting) {
    setMessages((current) =>
      current.map((message) => (message.meeting?.id === meeting.id ? { ...message, meeting } : message)),
    );
    // O backend registra um aviso no chat; recarrega para mostrá-lo.
    if (active) void loadMessages(active.id);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!active || sending || !text.trim()) return;
    setSending(true);
    setError("");
    try {
      appendOwn(await api.conversas.enviar(active.id, text.trim()));
      setDraft((current) => ({ ...current, [active.id]: "" }));
    } catch (err) {
      if (!handleAuthError(err)) {
        setError(err instanceof Error ? err.message : "Não foi possível enviar a mensagem.");
      }
    } finally {
      setSending(false);
    }
  }

  let lastDay = "";

  return (
    <div className="min-h-screen bg-[#F5F8FA] text-[#222222]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {sidebar}

      <main className="md:ml-48">
        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-10">
          <header className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Mensagens</h1>
            <p className="mt-2 text-xs text-[#666666] sm:text-sm">
              Converse com suas conexões{viewer === "investor" ? " e convide para reuniões" : ""}
            </p>
          </header>

          {loadError && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {loadError}
            </p>
          )}

          <div className="grid h-[calc(100dvh-245px)] min-h-[480px] gap-4 md:h-[calc(100dvh-125px)] lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
            <section
              aria-label="Conversas"
              className={[
                "min-h-0 overflow-y-auto rounded-lg border border-[#ECEFF1] bg-white shadow-[0_2px_3px_rgba(0,0,0,0.16)]",
                mobileChatOpen ? "hidden lg:block" : "block",
              ].join(" ")}
            >
              {loading && <p className="p-5 text-xs text-[#888888]">Carregando conversas...</p>}
              {!loading && conversations.length === 0 && (
                <div className="p-5 text-xs leading-relaxed text-[#888888]">
                  <p>Nenhuma conversa ainda.</p>
                  <p className="mt-2">
                    As conversas aparecem quando uma conexão é firmada.{" "}
                    <a href={connectionsPath} className="text-[#EF5948] underline-offset-2 hover:underline">
                      Ver conexões
                    </a>
                  </p>
                </div>
              )}
              <ul>
                {conversations.map((conversation) => {
                  const isActive = conversation.id === active?.id;
                  return (
                    <li key={conversation.id} className="border-b border-[#E7E7E7]">
                      <button
                        type="button"
                        onClick={() => select(conversation.id)}
                        aria-current={isActive ? "true" : undefined}
                        className={[
                          "flex w-full items-center gap-3 border-l-2 px-4 py-4 text-left transition",
                          "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#EF5948]",
                          isActive ? "border-[#EF5948] bg-[#FAF7F5]" : "border-transparent hover:bg-[#FAFAFA]",
                        ].join(" ")}
                      >
                        <Avatar name={conversation.name} userId={conversation.contactUserId} hasPhoto={conversation.hasPhoto} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className={`truncate text-xs ${conversation.unread ? "font-semibold" : "font-medium"}`}>
                              {conversation.name}
                            </p>
                            {conversation.lastMessage && (
                              <span className="shrink-0 text-[9px] text-[#999999]">
                                {formatPreviewDate(conversation.lastMessage.sentAt)}
                              </span>
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center justify-between gap-2">
                            <p className="truncate text-[10px] text-[#777777]">
                              {conversation.lastMessage
                                ? `${conversation.lastMessage.mine ? "Você: " : ""}${conversation.lastMessage.text}`
                                : conversation.role}
                            </p>
                            {conversation.unread > 0 && (
                              <span
                                className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-[#EF5948] px-1 text-[9px] font-semibold text-white"
                                aria-label={`${conversation.unread} não lidas`}
                              >
                                {conversation.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section
              aria-label={active ? `Conversa com ${active.name}` : "Mensagens"}
              className={[
                "min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-[#ECEFF1] bg-white shadow-[0_2px_3px_rgba(0,0,0,0.16)]",
                mobileChatOpen ? "flex" : "hidden lg:flex",
              ].join(" ")}
            >
              {active ? (
                <>
                  <header className="flex min-h-20 shrink-0 items-center gap-3 border-b border-[#E7E7E7] px-4 py-4 sm:px-6">
                    <button
                      type="button"
                      onClick={() => setMobileChatOpen(false)}
                      aria-label="Voltar para conversas"
                      className="rounded p-1 text-[#777777] hover:bg-[#F5F5F5] lg:hidden"
                    >
                      <FiArrowLeft size={20} />
                    </button>
                    <Avatar name={active.name} size="medium" userId={active.contactUserId} hasPhoto={active.hasPhoto} />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-xs font-medium">{active.name}</h2>
                      <p className="mt-0.5 text-[9px] text-[#777777]">{active.role}</p>
                    </div>
                    {viewer === "investor" && (
                      <button
                        type="button"
                        onClick={() => setInviteOpen(true)}
                        className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[#EF5948] px-3 py-2 text-[11px] font-medium text-[#EF5948] transition hover:bg-[#FFF1EE]"
                      >
                        <FiCalendar aria-hidden="true" />
                        <span className="hidden sm:inline">Convidar para reunião</span>
                        <span className="sm:hidden">Reunião</span>
                      </button>
                    )}
                  </header>

                  <div
                    ref={logRef}
                    role="log"
                    aria-label="Histórico de mensagens"
                    aria-live="polite"
                    aria-relevant="additions"
                    className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-6 sm:px-6"
                  >
                    {messages.length === 0 && (
                      <p className="py-8 text-center text-xs text-[#999999]">
                        Inicie uma conversa com {active.name}.
                      </p>
                    )}
                    {messages.map((message) => {
                      const day = dayFormatter.format(new Date(message.sentAt));
                      const separator = day !== lastDay;
                      lastDay = day;
                      return (
                        <div key={message.id}>
                          {separator && (
                            <p className="my-3 text-center text-[10px] text-[#999999]">
                              <span className="rounded-full bg-[#F3F4F6] px-3 py-1">{day}</span>
                            </p>
                          )}
                          {message.sender === "system" ? (
                            <p className="text-center text-[10px] italic text-[#888888]">
                              {message.text} · {formatTime(message.sentAt)}
                            </p>
                          ) : (
                            <div className={`flex items-end gap-2 ${message.sender === "me" ? "justify-end" : "justify-start"}`}>
                              {message.sender === "contact" && <Avatar name={active.name} userId={active.contactUserId} hasPhoto={active.hasPhoto} />}
                              {message.type === "CONVITE" && message.meeting ? (
                                <div className="flex flex-col gap-1">
                                  <MeetingCard meeting={message.meeting} onChange={updateMeeting} />
                                  <span className={`text-[9px] text-[#999999] ${message.sender === "me" ? "text-right" : ""}`}>
                                    {formatTime(message.sentAt)}
                                  </span>
                                </div>
                              ) : (
                                <div
                                  className={[
                                    "max-w-[80%] rounded-md px-4 py-2.5 text-[11px] leading-relaxed sm:max-w-[68%]",
                                    message.sender === "me"
                                      ? "border border-[#DCDCDC] bg-white text-[#555555]"
                                      : "bg-[#ECECEC] text-[#555555]",
                                  ].join(" ")}
                                >
                                  <span className="sr-only">{message.sender === "me" ? "Você" : active.name}: </span>
                                  <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{message.text}</p>
                                  <p className="mt-1 text-right text-[9px] text-[#999999]">
                                    {formatTime(message.sentAt)}
                                    {message.sender === "me" && (message.read ? " · lida" : " · enviada")}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="shrink-0 px-4 pb-6 pt-3 sm:px-6">
                    {error && (
                      <p role="alert" className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                        {error}
                      </p>
                    )}
                    <form
                      onSubmit={handleSubmit}
                      aria-label="Enviar mensagem"
                      aria-busy={sending}
                      className="flex items-center gap-3 rounded-lg bg-white px-3 py-3 shadow-[0_2px_3px_rgba(0,0,0,0.22)]"
                    >
                      <input
                        type="text"
                        value={text}
                        maxLength={1000}
                        disabled={sending}
                        onChange={(event) => {
                          const value = event.currentTarget.value;
                          setDraft((current) => ({ ...current, [active.id]: value }));
                        }}
                        aria-label="Digite sua mensagem"
                        placeholder="Escreva uma mensagem..."
                        autoComplete="off"
                        className="h-8 min-w-0 flex-1 rounded-lg border border-[#D8D8D8] bg-white px-3 text-xs outline-none transition focus:border-[#EF5948] focus:ring-2 focus:ring-[#EF5948]/10"
                      />
                      <button
                        type="submit"
                        disabled={sending || !text.trim()}
                        className="flex h-8 shrink-0 items-center justify-center rounded-lg bg-[#EF5948] px-4 text-[11px] font-medium text-white transition hover:bg-[#DA4939] disabled:opacity-60"
                      >
                        {sending ? "Enviando..." : "Enviar"}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                  <FiMessageSquare size={32} className="text-[#EF5948]" aria-hidden="true" />
                  <p className="text-sm text-[#777777]">
                    {conversations.length === 0 ? "Você ainda não tem conversas." : "Selecione uma conversa para começar."}
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {inviteOpen && active && (
        <InviteDialog
          conversationId={active.id}
          contactName={active.name}
          onClose={() => setInviteOpen(false)}
          onSent={(message) => {
            appendOwn(message);
            setInviteOpen(false);
          }}
        />
      )}
    </div>
  );
}
