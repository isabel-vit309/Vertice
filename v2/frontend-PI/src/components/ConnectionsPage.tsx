// Tela "Conexões" dos dois portais: conexões firmadas (matches) e avaliação pós-interação (RF10).
import { useEffect, useState } from "react";
import UserPhoto from "./Avatar";
import type { FormEvent, ReactNode } from "react";
import { FiLink, FiSearch, FiStar, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { ApiError, api, formatarTicket } from "../services/api";
import type { ConnectionItem } from "../services/api";
import { normalize } from "../utils/forms";

type ConnectionsPageProps = {
  sidebar: ReactNode;
  /** Quem está vendo a tela. */
  viewer: "investor" | "startup";
};

const texts = {
  investor: {
    loginPath: "/investors/login",
    chatPath: "/investors/mensagens",
    listTitle: "Startups conectadas",
    listHint: "Consulte os dados e avalie cada conexão depois de conversar.",
    firstColumn: "Startup",
    segments: "Segmento",
    ticket: "Ticket buscado",
    search: "Buscar startup...",
    empty: "Você ainda não possui conexões.",
    emptyHint: "Quando uma startup firmar o seu pedido, a conexão aparece aqui.",
    notFound: "Nenhuma startup encontrada.",
  },
  startup: {
    loginPath: "/startups/login",
    chatPath: "/startups/mensagens",
    listTitle: "Investidores conectados",
    listHint: "Consulte os dados e avalie cada conexão depois de conversar.",
    firstColumn: "Investidor",
    segments: "Segmentos de interesse",
    ticket: "Faixa de investimento",
    search: "Buscar investidor...",
    empty: "Sua startup ainda não possui conexões.",
    emptyHint: "As conexões que você firmar aparecem nesta tabela.",
    notFound: "Nenhum investidor encontrado.",
  },
};

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function Stars({ score }: { score: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`Nota ${score} de 5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <FiStar
          key={value}
          size={13}
          aria-hidden="true"
          className={value <= score ? "fill-[#EF5948] text-[#EF5948]" : "text-[#CCCCCC]"}
        />
      ))}
    </span>
  );
}

function RatingDialog({
  connection,
  onClose,
  onSaved,
}: {
  connection: ConnectionItem;
  onClose: () => void;
  onSaved: (connection: ConnectionItem) => void;
}) {
  const [score, setScore] = useState(connection.myRating?.score ?? 0);
  const [comment, setComment] = useState(connection.myRating?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (score < 1) {
      setError("Escolha uma nota de 1 a 5.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const saved = await api.conexoes.avaliar(connection.id, score, comment.trim());
      onSaved({ ...connection, myRating: saved });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a avaliação.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="rating-title"
        onSubmit={handleSubmit}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="rating-title" className="text-base font-semibold">
              Avaliar conexão com {connection.name}
            </h2>
            <p className="mt-1 text-xs text-[#777777]">
              Sua avaliação ajuda a plataforma a recomendar melhor. A outra parte não vê o seu comentário.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="rounded p-1 text-[#666666] hover:bg-[#F5F5F5]"
          >
            <FiX size={18} aria-hidden="true" />
          </button>
        </div>

        <fieldset className="mt-5">
          <legend className="text-xs font-medium">Como foi a interação?</legend>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setScore(value)}
                aria-label={`${value} de 5`}
                aria-pressed={score === value}
                className="rounded p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EF5948]"
              >
                <FiStar
                  size={26}
                  aria-hidden="true"
                  className={value <= score ? "fill-[#EF5948] text-[#EF5948]" : "text-[#CCCCCC]"}
                />
              </button>
            ))}
          </div>
        </fieldset>

        <label htmlFor="rating-comment" className="mt-4 block text-xs font-medium">
          Comentário (opcional)
        </label>
        <textarea
          id="rating-comment"
          value={comment}
          maxLength={1000}
          onChange={(event) => setComment(event.target.value)}
          placeholder="O que funcionou bem? O que poderia melhorar?"
          className="mt-1.5 block h-24 w-full resize-none rounded-lg border border-[#DDDDDD] px-3 py-2 text-xs outline-none focus:border-[#EF5948] focus:ring-2 focus:ring-[#EF5948]/10"
        />

        {error && (
          <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#DDDDDD] px-4 py-2 text-xs text-[#555555] hover:bg-[#F7F7F7]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#EF5948] px-4 py-2 text-xs font-medium text-white hover:bg-[#DA4939] disabled:cursor-wait disabled:opacity-70"
          >
            {saving ? "Salvando..." : "Salvar avaliação"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ConnectionsPage({ sidebar, viewer }: ConnectionsPageProps) {
  const t = texts[viewer];
  const navigate = useNavigate();
  const [connections, setConnections] = useState<ConnectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState<ConnectionItem | null>(null);

  useEffect(() => {
    api.conexoes
      .listar()
      .then(setConnections)
      .catch((err: unknown) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          navigate(t.loginPath, { replace: true });
          return;
        }
        setLoadError(err instanceof Error ? err.message : "Não foi possível carregar as conexões.");
      })
      .finally(() => setLoading(false));
  }, [navigate, t.loginPath]);

  const query = normalize(search);
  const filtered = connections.filter((connection) =>
    normalize(
      [connection.name, connection.type, connection.city, connection.state, ...connection.segments].join(" "),
    ).includes(query),
  );

  return (
    <div
      className="min-h-screen bg-[#F5F8FA] text-[#222222]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {sidebar}

      <main className="md:ml-48">
        <div className="mx-auto max-w-[1600px] px-4 py-7 sm:px-7 lg:px-10">
          <header className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Conexões</h1>
            <p className="mt-2 text-xs leading-relaxed text-[#666666] sm:text-sm">
              Acompanhe aqui todas as conexões que você fez dentro do Vértice.
            </p>
          </header>

          <section
            aria-labelledby="connections-title"
            className="min-h-[460px] overflow-hidden rounded-lg border border-[#ECEFF1] bg-white shadow-[0_2px_3px_rgba(0,0,0,0.16)]"
          >
            <div className="flex flex-col gap-4 border-b border-[#ECECEC] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 id="connections-title" className="text-sm font-medium">
                    {t.listTitle}
                  </h2>
                  <span className="rounded-full bg-[#FFF1EB] px-2.5 py-1 text-[10px] font-medium text-[#EF5948]">
                    {connections.length}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] text-[#888888]">{t.listHint}</p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <label htmlFor="connection-search" className="sr-only">
                  Buscar por nome, localização ou segmento
                </label>
                <FiSearch
                  size={16}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]"
                />
                <input
                  id="connection-search"
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t.search}
                  className="h-10 w-full rounded-lg border border-[#DDDDDD] bg-white pl-10 pr-3 text-xs outline-none transition placeholder:text-[#999999] focus:border-[#EF5948] focus:ring-2 focus:ring-[#EF5948]/10"
                />
              </div>
            </div>

            {loadError && (
              <p role="alert" className="mx-6 mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {loadError}
              </p>
            )}

            {/* Celular e tablet: cartões em vez da tabela larga (as ações ficam sempre visíveis). */}
            <ul className="divide-y divide-[#EEEEEE] xl:hidden" aria-label="Conexões">
              {filtered.map((connection) => (
                <li key={connection.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-start gap-3">
                    <UserPhoto
                      userId={connection.userId}
                      hasPhoto={connection.hasPhoto}
                      name={connection.name}
                      className="h-10 w-10 rounded-full bg-[#F8E3DA] text-xs font-medium !text-[#B9573E]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <p className="truncate text-sm font-medium text-[#303030]">{connection.name}</p>
                        {connection.myRating && <Stars score={connection.myRating.score} />}
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#888888]">
                        {connection.type} · {[connection.city, connection.state].filter(Boolean).join("/") || "Local não informado"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {connection.segments.map((segment) => (
                          <span key={segment} className="rounded-full bg-[#FFF2EC] px-2.5 py-1 text-[10px] text-[#D96648]">
                            {segment}
                          </span>
                        ))}
                      </div>
                      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px] text-[#777777]">
                        <dt>{t.ticket}</dt>
                        <dd className="text-right">{formatarTicket(connection.ticketMin, connection.ticketMax)}</dd>
                        <dt>Conectado em</dt>
                        <dd className="text-right">
                          <time dateTime={connection.connectedAt}>{formatDate(connection.connectedAt)}</time>
                        </dd>
                      </dl>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <a
                          href={`${t.chatPath}?conversa=${connection.id}`}
                          aria-label={`Conversar com ${connection.name}`}
                          className="rounded-lg bg-[#EF5948] px-3 py-2 text-center text-[11px] font-medium text-white transition hover:bg-[#DA4939]"
                        >
                          Conversar
                        </a>
                        <button
                          type="button"
                          onClick={() => setRating(connection)}
                          aria-label={`${connection.myRating ? "Editar avaliação de" : "Avaliar"} ${connection.name}`}
                          className="rounded-lg border border-[#EF5948] px-3 py-2 text-[11px] font-medium text-[#EF5948] transition hover:bg-[#FFF4F1]"
                        >
                          {connection.myRating ? "Editar avaliação" : "Avaliar"}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              {!loading && filtered.length === 0 && (
                <li className="px-6 py-14 text-center">
                  <FiLink size={28} aria-hidden="true" className="mx-auto mb-3 text-[#EF5948]" />
                  <p className="text-sm font-medium text-[#555555]">{connections.length === 0 ? t.empty : t.notFound}</p>
                </li>
              )}
              {loading && <li className="px-6 py-14 text-center text-sm text-[#777777]">Carregando conexões...</li>}
            </ul>

            <div
              role="region"
              aria-label="Tabela de conexões"
              tabIndex={0}
              className="hidden overflow-x-auto xl:block focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#EF5948]"
            >
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <caption className="sr-only">Conexões firmadas, com dados da outra parte e avaliação.</caption>
                <thead>
                  <tr className="border-b border-[#EAEAEA] bg-[#FAFBFC] text-[11px] text-[#777777]">
                    <th scope="col" className="px-6 py-4 font-medium">{t.firstColumn}</th>
                    <th scope="col" className="px-4 py-4 font-medium">Localização</th>
                    <th scope="col" className="px-4 py-4 font-medium">{t.segments}</th>
                    <th scope="col" className="px-4 py-4 font-medium">{t.ticket}</th>
                    <th scope="col" className="px-4 py-4 font-medium">Conectado em</th>
                    <th scope="col" className="px-6 py-4 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEEEEE]">
                  {filtered.map((connection) => (
                    <tr key={connection.id} className="transition-colors hover:bg-[#FFFCFA]">
                      <th scope="row" className="px-6 py-5 font-normal">
                        <div className="flex items-center gap-3">
                          <UserPhoto
                            userId={connection.userId}
                            hasPhoto={connection.hasPhoto}
                            name={connection.name}
                            className="h-10 w-10 rounded-full bg-[#F8E3DA] text-xs font-medium !text-[#B9573E]"
                          />
                          <div>
                            <p className="whitespace-nowrap text-xs font-medium text-[#303030]">
                              {connection.name}
                            </p>
                            <p className="mt-1 text-[10px] text-[#888888]">{connection.type}</p>
                          </div>
                        </div>
                      </th>
                      <td className="px-4 py-5 text-xs text-[#777777]">
                        <span className="whitespace-nowrap">
                          {[connection.city, connection.state].filter(Boolean).join("/") || "Não informada"}
                        </span>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex max-w-56 flex-wrap gap-1.5">
                          {connection.segments.map((segment) => (
                            <span
                              key={segment}
                              className="rounded-full bg-[#FFF2EC] px-2.5 py-1 text-[10px] text-[#D96648]"
                            >
                              {segment}
                            </span>
                          ))}
                          {connection.segments.length === 0 && (
                            <span className="text-xs text-[#999999]">Não informado</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-5 text-[11px] text-[#777777]">
                        {formatarTicket(connection.ticketMin, connection.ticketMax)}
                      </td>
                      <td className="px-4 py-5 text-xs text-[#777777]">
                        <time dateTime={connection.connectedAt}>{formatDate(connection.connectedAt)}</time>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          {connection.myRating && <Stars score={connection.myRating.score} />}
                          <a
                            href={`${t.chatPath}?conversa=${connection.id}`}
                            aria-label={`Conversar com ${connection.name}`}
                            className="whitespace-nowrap rounded-lg bg-[#EF5948] px-3 py-2 text-[11px] font-medium text-white transition hover:bg-[#DA4939] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948]"
                          >
                            Conversar
                          </a>
                          <button
                            type="button"
                            onClick={() => setRating(connection)}
                            aria-label={`${connection.myRating ? "Editar avaliação de" : "Avaliar"} ${connection.name}`}
                            className="whitespace-nowrap rounded-lg border border-[#EF5948] px-3 py-2 text-[11px] font-medium text-[#EF5948] transition hover:bg-[#EF5948] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948]"
                          >
                            {connection.myRating ? "Editar" : "Avaliar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <FiLink size={28} aria-hidden="true" className="mx-auto mb-3 text-[#EF5948]" />
                        <p className="text-sm font-medium text-[#555555]">
                          {connections.length === 0 ? t.empty : t.notFound}
                        </p>
                        <p className="mt-2 text-xs text-[#888888]">
                          {connections.length === 0
                            ? t.emptyHint
                            : "Tente buscar por outro nome, localização ou segmento."}
                        </p>
                      </td>
                    </tr>
                  )}
                  {loading && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-sm text-[#777777]">
                        Carregando conexões...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="border-t border-[#EEEEEE] px-6 py-4">
              <p role="status" className="text-[11px] text-[#888888]">
                Exibindo {filtered.length} de {connections.length} conexões
              </p>
            </footer>
          </section>
        </div>
      </main>

      {rating && (
        <RatingDialog
          connection={rating}
          onClose={() => setRating(null)}
          onSaved={(saved) => {
            setConnections((current) => current.map((item) => (item.id === saved.id ? saved : item)));
            setRating(null);
          }}
        />
      )}
    </div>
  );
}
