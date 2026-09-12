import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
  FiArrowLeft,
  FiCalendar,
  FiHome,
  FiLink,
  FiMessageSquare,
  FiPaperclip,
  FiTarget,
  FiUser,
  FiX,
} from "react-icons/fi";
import SSidebar from "../../components/SSidebar";

type Contact = {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
};

type Message = {
  id: string;
  contactId: string;
  sender: "me" | "contact";
  text: string;
  attachmentName?: string;
};

type SendMessagePayload = {
  contactId: string;
  text: string;
  file?: File;
};

type SMensagensProps = {
  logoUrl?: string;
  contacts?: Contact[];
  initialMessages?: Message[];
  onSendMessage?: (payload: SendMessagePayload) => void | Promise<void>;
};

const exampleContacts: Contact[] = [
  {
    id: "isabel",
    name: "Isabel Alves",
    role: "Investidor(a) Anjo",
  },
  {
    id: "fernando",
    name: "Fernando Torres",
    role: "Investidor(a) Anjo",
  },
  {
    id: "amanda",
    name: "Amanda Ellem",
    role: "Investidor(a) Anjo",
  },
  {
    id: "ronald",
    name: "Ronald Paixão",
    role: "Investidor(a) Anjo",
  },
];

const exampleMessages: Message[] = [
  {
    id: "1",
    contactId: "isabel",
    sender: "contact",
    text: "Olá! Gostei da proposta da sua startup e gostaria de conhecer melhor o projeto.",
  },
  {
    id: "2",
    contactId: "isabel",
    sender: "contact",
    text: "Você pode compartilhar mais informações sobre a solução e o momento da empresa?",
  },
  {
    id: "3",
    contactId: "isabel",
    sender: "me",
    text: "Olá, Isabel! Obrigado pelo interesse. Será um prazer apresentar nosso projeto.",
  },
  {
    id: "4",
    contactId: "isabel",
    sender: "me",
    text: "Podemos agendar uma conversa? Também posso enviar nossa apresentação por aqui.",
  },
];

const navigation = [
  { label: "Perfil", icon: FiUser, href: "/perfil" },
  { label: "Início", icon: FiHome, href: "/painel" },
  { label: "Matching", icon: FiTarget, href: "/matching" },
  {
    label: "Mensagens",
    icon: FiMessageSquare,
    href: "/mensagens",
  },
  { label: "Reuniões", icon: FiCalendar, href: "/reunioes" },
  { label: "Conexões", icon: FiLink, href: "/conexoes" },
];

function Avatar({
  contact,
  size = "small",
}: {
  contact: Contact;
  size?: "small" | "medium";
}) {
  const initials = contact.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={[
        "flex shrink-0 items-center justify-center overflow-hidden",
        "rounded-full bg-[#F5DDD3] font-medium text-[#AF5039]",
        size === "medium" ? "h-10 w-10 text-xs" : "h-8 w-8 text-[10px]",
      ].join(" ")}
    >
      {contact.photoUrl ? (
        <img
          src={contact.photoUrl}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}

export default function SMensagens({
  logoUrl,
  contacts = exampleContacts,
  initialMessages = exampleMessages,
  onSendMessage,
}: SMensagensProps = {}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    contacts[0]?.id ?? null,
  );

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<
    Record<string, File | undefined>
  >({});

  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);

  const activeContact =
    contacts.find((contact) => contact.id === selectedId) ?? contacts[0];

  const contactId = activeContact?.id;
  const draft = contactId ? (drafts[contactId] ?? "") : "";
  const attachment = contactId ? attachments[contactId] : undefined;

  const conversation = messages.filter(
    (message) => message.contactId === contactId,
  );

  useEffect(() => {
    const container = messagesContainerRef.current;

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [contactId, messages, mobileChatOpen]);

  function selectContact(id: string) {
    setSelectedId(id);
    setMobileChatOpen(true);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function removeAttachment() {
    if (!contactId) return;

    setAttachments((current) => ({
      ...current,
      [contactId]: undefined,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!contactId || isSending) return;

    const text = draft.trim();

    if (!text && !attachment) return;

    const destinationId = contactId;

    setError("");
    setIsSending(true);

    try {
      if (onSendMessage) {
        await onSendMessage({
          contactId: destinationId,
          text,
          file: attachment,
        });
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          contactId: destinationId,
          sender: "me",
          text,
          attachmentName: attachment?.name,
        },
      ]);

      setDrafts((current) => ({
        ...current,
        [destinationId]: "",
      }));

      setAttachments((current) => ({
        ...current,
        [destinationId]: undefined,
      }));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      setError("Não foi possível enviar a mensagem. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-[#F5F8FA] text-[#222222]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <SSidebar />

      <header className="border-b border-[#E5E7EB] bg-white md:hidden">
        <a
          href="/painel"
          aria-label="Vértice — página inicial"
          className="flex h-16 items-center px-5"
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              alt="Vértice"
              className="max-h-10 w-24 object-contain"
            />
          ) : (
            <span className="text-sm font-semibold tracking-[0.18em]">
              VÉRTICE
            </span>
          )}
        </a>

        <nav
          aria-label="Menu principal mobile"
          className="flex overflow-x-auto px-2"
        >
          {navigation.map(({ label, icon: Icon, href }) => {
            const active = label === "Mensagens";

            return (
              <a
                key={label}
                href={href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex shrink-0 items-center gap-2 border-b-2 px px-3 py-3 text-xs",
                  active
                    ? "border-[#EF5948] text-[#EF5948]"
                    : "border-transparent text-[#777777]",
                ].join(" ")}
              >
                <Icon size={14} aria-hidden="true" />
                {label}
              </a>
            );
          })}
        </nav>
      </header>

      <main className="md:ml-48">
        <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-7 lg:px-10">
          <header className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Mensagens
            </h1>

            <p className="mt-2 text-xs text-[#666666] sm:text-sm">
              Acompanhe suas conversas e conexões estratégicas
            </p>
          </header>

          <div className="grid h-[calc(100dvh-245px)] min-h-[480px] gap-4 md:h-[calc(100dvh-125px)] md:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
            <section
              aria-label="Conversas"
              className={[
                "min-h-0 overflow-y-auto rounded-lg border border-[#ECEFF1]",
                "bg-white shadow-[0_2px_3px_rgba(0,0,0,0.16)]",
                mobileChatOpen ? "hidden md:block" : "block",
              ].join(" ")}
            >
              {contacts.length === 0 ? (
                <p className="p-5 text-xs text-[#888888]">
                  Nenhuma conversa disponível.
                </p>
              ) : (
                <ul>
                  {contacts.map((contact) => {
                    const active = contact.id === contactId;

                    return (
                      <li
                        key={contact.id}
                        className="border-b border-[#E7E7E7]"
                      >
                        <button
                          type="button"
                          onClick={() => selectContact(contact.id)}
                          aria-current={active ? "true" : undefined}
                          className={[
                            "flex w-full items-center gap-3 border-l-2",
                            "px-4 py-4 text-left transition",
                            "focus-visible:outline focus-visible:outline-2",
                            "focus-visible:-outline-offset-2",
                            "focus-visible:outline-[#EF5948]",
                            active
                              ? "border-[#EF5948] bg-[#FAF7F5]"
                              : "border-transparent hover:bg-[#FAFAFA]",
                          ].join(" ")}
                        >
                          <Avatar contact={contact} />

                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium">
                              {contact.name}
                            </p>
                            <p className="mt-0.5 truncate text-[9px] text-[#777777]">
                              {contact.role}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section
              aria-label={
                activeContact
                  ? `Conversa com ${activeContact.name}`
                  : "Mensagens"
              }
              className={[
                "min-h-0 min-w-0 flex-col overflow-hidden rounded-lg",
                "border border-[#ECEFF1] bg-white",
                "shadow-[0_2px_3px_rgba(0,0,0,0.16)]",
                mobileChatOpen ? "flex" : "hidden md:flex",
              ].join(" ")}
            >
              {activeContact ? (
                <>
                  <header className="flex min-h-20 shrink-0 items-center gap-3 border-b border-[#E7E7E7] px-4 py-4 sm:px-6">
                    <button
                      type="button"
                      onClick={() => setMobileChatOpen(false)}
                      aria-label="Voltar para conversas"
                      className="rounded p-1 text-[#777777] hover:bg-[#F5F5F5] md:hidden"
                    >
                      <FiArrowLeft size={20} />
                    </button>

                    <Avatar contact={activeContact} size="medium" />

                    <div>
                      <h2 className="text-xs font-medium">
                        {activeContact.name}
                      </h2>
                      <p className="mt-0.5 text-[9px] text-[#777777]">
                        {activeContact.role}
                      </p>
                    </div>
                  </header>

                  <div
                    ref={messagesContainerRef}
                    role="log"
                    aria-label="Histórico de mensagens"
                    aria-live="polite"
                    aria-relevant="additions"
                    className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-6 sm:px-6"
                  >
                    {conversation.length === 0 && (
                      <p className="py-8 text-center text-xs text-[#999999]">
                        Inicie uma conversa com {activeContact.name}.
                      </p>
                    )}

                    {conversation.map((message, index) => {
                      const isMine = message.sender === "me";

                      const showAvatar =
                        !isMine &&
                        (index === 0 ||
                          conversation[index - 1].sender !== "contact");

                      return (
                        <div
                          key={message.id}
                          className={`flex items-start gap-3 ${
                            isMine ? "justify-end" : "justify-start"
                          }`}
                        >
                          {!isMine && (
                            <div className="w-8 shrink-0">
                              {showAvatar && <Avatar contact={activeContact} />}
                            </div>
                          )}

                          <div
                            className={[
                              "max-w-[80%] rounded-md px-4 py-3",
                              "text-[11px] leading-relaxed sm:max-w-[68%]",
                              isMine
                                ? "border border-[#DCDCDC] bg-white text-[#666666]"
                                : "bg-[#ECECEC] text-[#666666]",
                            ].join(" ")}
                          >
                            <span className="sr-only">
                              {isMine ? "Você" : activeContact.name}:{" "}
                            </span>

                            {message.text && (
                              <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                {message.text}
                              </p>
                            )}

                            {message.attachmentName && (
                              <div
                                className={`flex items-start gap-2 ${
                                  message.text ? "mt-2" : ""
                                }`}
                              >
                                <FiPaperclip
                                  size={14}
                                  aria-hidden="true"
                                  className="mt-0.5 shrink-0 text-[#EF5948]"
                                />
                                <span className="break-all">
                                  {message.attachmentName}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="shrink-0 px-4 pb-6 pt-3 sm:px-6">
                    {error && (
                      <p
                        role="alert"
                        className="mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700"
                      >
                        {error}
                      </p>
                    )}

                    {attachment && (
                      <div className="mb-3 flex items-center gap-2 rounded-md bg-[#FFF5F1] px-3 py-2 text-xs text-[#777777]">
                        <FiPaperclip
                          aria-hidden="true"
                          className="shrink-0 text-[#EF5948]"
                        />

                        <span className="min-w-0 flex-1 truncate">
                          {attachment.name}
                        </span>

                        <button
                          type="button"
                          onClick={removeAttachment}
                          disabled={isSending}
                          aria-label="Remover anexo"
                          className="rounded p-1 hover:bg-[#FFE6DE] disabled:opacity-50"
                        >
                          <FiX size={15} />
                        </button>
                      </div>
                    )}

                    <form
                      onSubmit={handleSubmit}
                      aria-label="Enviar mensagem"
                      aria-busy={isSending}
                      className="flex items-center gap-3 rounded-lg bg-white px-3 py-3 shadow-[0_2px_3px_rgba(0,0,0,0.22)]"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        tabIndex={-1}
                        aria-label="Selecionar anexo"
                        className="hidden"
                        onChange={(event) => {
                          if (!contactId) return;

                          const file = event.currentTarget.files?.[0];

                          setAttachments((current) => ({
                            ...current,
                            [contactId]: file,
                          }));

                          setError("");
                        }}
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending}
                        aria-label="Anexar arquivo"
                        className="flex h-8 w-7 shrink-0 items-center justify-center rounded text-[#EF5948] transition hover:bg-[#FFF4F1] disabled:opacity-50"
                      >
                        <FiPaperclip size={17} aria-hidden="true" />
                      </button>

                      <input
                        ref={textInputRef}
                        type="text"
                        value={draft}
                        disabled={isSending}
                        onChange={(event) => {
                          if (!contactId) return;

                          const value = event.currentTarget.value;

                          setDrafts((current) => ({
                            ...current,
                            [contactId]: value,
                          }));
                        }}
                        aria-label="Digite sua mensagem"
                        autoComplete="off"
                        className="h-8 min-w-0 flex-1 rounded-lg border border-[#D8D8D8] bg-white px-3 text-xs outline-none transition focus:border-[#EF5948] focus:ring-2 focus:ring-[#EF5948]/10 disabled:bg-[#FAFAFA]"
                      />

                      <button
                        type="submit"
                        disabled={isSending || (!draft.trim() && !attachment)}
                        className="flex h-8 shrink-0 items-center justify-center rounded-lg bg-[#EF5948] px-4 text-[11px] font-medium text-white transition hover:bg-[#DA4939] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948] disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
                      >
                        {isSending ? "Enviando..." : "Enviar"}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                  <FiMessageSquare
                    size={32}
                    className="text-[#EF5948]"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-[#777777]">
                    Selecione uma conversa para começar.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
