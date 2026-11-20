// Tela "Reuniões" dos dois portais: calendário do mês com as reuniões, convites pendentes,
// próximas reuniões e histórico.
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import MeetingCard from "./MeetingCard";
import { ApiError, api } from "../services/api";
import type { Meeting } from "../services/api";

type MeetingsPageProps = {
  sidebar: ReactNode;
  viewer: "investor" | "startup";
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

function key(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function start(meeting: Meeting) {
  const [y, m, d] = meeting.date.split("-").map(Number);
  const [h, min] = meeting.time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min);
}

/** 6 semanas a partir do domingo anterior ao dia 1 do mês. */
function monthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(first);
  gridStart.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

function Section({ title, children, empty }: { title: string; children: ReactNode[]; empty: string }) {
  return (
    <section className="rounded-lg border border-[#E7E7E7] bg-white p-5 shadow-[0_2px_3px_rgba(0,0,0,0.12)]">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children.length === 0 ? (
        <p className="mt-3 text-xs text-[#888888]">{empty}</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
      )}
    </section>
  );
}

export default function MeetingsPage({ sidebar, viewer }: MeetingsPageProps) {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setMeetings(await api.reunioes.listar());
      setError("");
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        navigate(viewer === "investor" ? "/investors/login" : "/startups/login", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Não foi possível carregar as reuniões.");
    } finally {
      setLoading(false);
    }
  }, [navigate, viewer]);

  useEffect(() => {
    void load();
  }, [load]);

  function replace(meeting: Meeting) {
    setMeetings((current) => current.map((item) => (item.id === meeting.id ? meeting : item)));
  }

  const now = new Date();
  const byDay = useMemo(() => {
    const map = new Map<string, Meeting[]>();
    for (const meeting of meetings) {
      if (meeting.status !== "ACEITO" && meeting.status !== "PENDENTE") continue;
      const list = map.get(meeting.date) ?? [];
      list.push(meeting);
      map.set(meeting.date, list);
    }
    map.forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)));
    return map;
  }, [meetings]);

  const pending = meetings.filter((m) => m.status === "PENDENTE");
  const upcoming = meetings.filter((m) => m.status === "ACEITO" && start(m) > now);
  const history = meetings
    .filter((m) => !(m.status === "PENDENTE") && !(m.status === "ACEITO" && start(m) > now))
    .sort((a, b) => start(b).getTime() - start(a).getTime());
  const daySelection = selectedDay ? meetings.filter((m) => m.date === selectedDay) : [];

  const todayKey = key(now);
  const days = monthGrid(month);

  return (
    <div className="min-h-screen bg-[#F5F8FA] text-[#222222]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {sidebar}

      <main className="md:ml-48">
        <div className="mx-auto max-w-[1440px] space-y-6 px-4 py-7 sm:px-7 lg:px-10">
          <header>
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Reuniões</h1>
            <p className="mt-2 text-xs text-[#666666] sm:text-sm">
              {viewer === "investor"
                ? "Sua agenda com as startups. Para marcar uma reunião, envie um convite pelo chat em Mensagens."
                : "Sua agenda com os investidores. Os convites chegam pelo chat e podem ser respondidos aqui ou lá."}
            </p>
          </header>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          <section
            aria-label="Calendário de reuniões"
            className="overflow-hidden rounded-lg border border-[#E7E7E7] bg-white shadow-[0_2px_3px_rgba(0,0,0,0.16)]"
          >
            <div className="flex items-center justify-between border-b border-[#E7E7E7] px-4 py-3">
              <button
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                aria-label="Mês anterior"
                className="rounded-full p-2 text-[#EF5948] hover:bg-[#FFF4F1]"
              >
                <FiChevronLeft size={18} />
              </button>
              <h2 className="text-sm font-semibold" aria-live="polite">
                {(() => {
                  const label = monthFormatter.format(month);
                  return label.charAt(0).toUpperCase() + label.slice(1);
                })()}
              </h2>
              <button
                type="button"
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                aria-label="Próximo mês"
                className="rounded-full p-2 text-[#EF5948] hover:bg-[#FFF4F1]"
              >
                <FiChevronRight size={18} />
              </button>
            </div>
            <div>
              <div className="grid grid-cols-7">
                {WEEKDAYS.map((weekday) => (
                  <div key={weekday} className="border-b border-[#E7E7E7] bg-[#FAFBFC] py-2 text-center text-[10px] font-medium text-[#777777]">
                    {weekday}
                  </div>
                ))}
                {days.map((day, index) => {
                  const dayKey = key(day);
                  const inMonth = day.getMonth() === month.getMonth();
                  const items = byDay.get(dayKey) ?? [];
                  const isToday = dayKey === todayKey;
                  return (
                    <button
                      key={dayKey}
                      type="button"
                      onClick={() => setSelectedDay(dayKey === selectedDay ? null : dayKey)}
                      aria-label={`${day.toLocaleDateString("pt-BR")}: ${items.length} reunião(ões)`}
                      aria-pressed={dayKey === selectedDay}
                      className={[
                        "flex min-h-[58px] min-w-0 flex-col items-center gap-1 p-1 text-left align-top transition hover:bg-[#FFF8F5] sm:min-h-[96px] sm:items-stretch sm:p-2 lg:min-h-[112px]",
                        (index + 1) % 7 !== 0 ? "border-r border-[#E7E7E7]" : "",
                        index < 35 ? "border-b border-[#E7E7E7]" : "",
                        dayKey === selectedDay ? "bg-[#FFF4F1]" : "bg-white",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold",
                          isToday ? "bg-[#EF5948] text-white" : inMonth ? "text-[#EF5948]" : "text-[#BBBBBB]",
                        ].join(" ")}
                      >
                        {day.getDate()}
                      </span>
                      {/* No celular, um ponto por reunião; o dia selecionado lista os detalhes abaixo. */}
                      {items.length > 0 && (
                        <span className="flex gap-0.5 sm:hidden" aria-hidden="true">
                          {items.slice(0, 3).map((meeting) => (
                            <span
                              key={meeting.id}
                              className={`h-1.5 w-1.5 rounded-full ${meeting.status === "ACEITO" ? "bg-[#EF5948]" : "border border-[#EF5948]"}`}
                            />
                          ))}
                        </span>
                      )}
                      {items.slice(0, 3).map((meeting) => (
                        <span
                          key={meeting.id}
                          title={`${meeting.time.slice(0, 5)} · ${meeting.subject} · ${meeting.contactName}`}
                          className={[
                            "hidden truncate rounded px-1.5 py-0.5 text-[9px] sm:block",
                            meeting.status === "ACEITO"
                              ? "bg-[#EF5948] text-white"
                              : "border border-dashed border-[#EF5948] text-[#EF5948]",
                          ].join(" ")}
                        >
                          {meeting.time.slice(0, 5)} {meeting.contactName}
                        </span>
                      ))}
                      {items.length > 3 && <span className="hidden text-[9px] text-[#888888] sm:inline">+{items.length - 3}</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="flex flex-wrap gap-4 border-t border-[#E7E7E7] px-4 py-2 text-[10px] text-[#777777]">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-[#EF5948]" /> Confirmada
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded border border-dashed border-[#EF5948]" /> Convite aguardando resposta
              </span>
            </p>
          </section>

          {selectedDay && (
            <Section
              title={`Reuniões de ${new Date(`${selectedDay}T00:00`).toLocaleDateString("pt-BR")}`}
              empty="Nenhuma reunião neste dia."
            >
              {daySelection.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} showContact onChange={replace} />
              ))}
            </Section>
          )}

          {loading ? (
            <p role="status" className="text-sm text-[#777777]">Carregando reuniões...</p>
          ) : (
            <>
              <Section
                title="Convites aguardando resposta"
                empty={viewer === "investor" ? "Nenhum convite pendente." : "Nenhum convite para responder."}
              >
                {pending.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} showContact onChange={replace} />
                ))}
              </Section>
              <Section title="Próximas reuniões" empty="Nenhuma reunião confirmada.">
                {upcoming.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} showContact onChange={replace} />
                ))}
              </Section>
              <Section title="Histórico" empty="Nenhuma reunião passada, recusada ou cancelada.">
                {history.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} showContact onChange={replace} />
                ))}
              </Section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
