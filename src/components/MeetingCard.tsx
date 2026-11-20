// Cartão de reunião usado no chat (convite) e na aba Reuniões.
import { useState } from "react";
import { FiCalendar, FiClock, FiMapPin } from "react-icons/fi";

import { api, formatarReuniao, statusReuniao } from "../services/api";
import type { Meeting } from "../services/api";

const statusStyle: Record<Meeting["status"], string> = {
  PENDENTE: "bg-amber-50 text-amber-700",
  ACEITO: "bg-emerald-50 text-emerald-700",
  REJEITADO: "bg-red-50 text-red-700",
  CANCELADO: "bg-slate-100 text-slate-600",
  EXPIRADO: "bg-slate-100 text-slate-600",
};

function isLink(value: string) {
  return /^https?:\/\//i.test(value);
}

type MeetingCardProps = {
  meeting: Meeting;
  /** Mostra com quem é a reunião (na aba Reuniões; no chat isso já está no cabeçalho). */
  showContact?: boolean;
  onChange: (meeting: Meeting) => void;
};

export default function MeetingCard({ meeting, showContact = false, onChange }: MeetingCardProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function act(action: () => Promise<Meeting>) {
    setBusy(true);
    setError("");
    try {
      onChange(await action());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar a reunião.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-lg border border-[#F3D5CC] bg-[#FFFAF8] p-4 text-left">
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#EF5948]">
          <FiCalendar aria-hidden="true" />
          {meeting.status === "PENDENTE" ? "Convite de reunião" : "Reunião"}
        </p>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusStyle[meeting.status]}`}>
          {statusReuniao[meeting.status]}
        </span>
      </div>

      <p className="mt-2 text-xs font-medium text-[#333333]">{meeting.subject}</p>
      {showContact && (
        <p className="mt-0.5 text-[11px] text-[#777777]">
          Com {meeting.contactName} · {meeting.contactRole}
        </p>
      )}

      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-[#555555]">
        <FiClock aria-hidden="true" className="shrink-0 text-[#999999]" />
        {formatarReuniao(meeting)}
      </p>
      {meeting.location && (
        <p className="mt-1 flex items-start gap-1.5 text-[11px] text-[#555555]">
          <FiMapPin aria-hidden="true" className="mt-0.5 shrink-0 text-[#999999]" />
          {isLink(meeting.location) ? (
            <a
              href={meeting.location}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-[#EF5948] underline-offset-2 hover:underline"
            >
              {meeting.location}
            </a>
          ) : (
            <span className="break-words">{meeting.location}</span>
          )}
        </p>
      )}

      {meeting.status === "PENDENTE" && meeting.organizer && (
        <p className="mt-2 text-[10px] text-[#888888]">Aguardando a resposta de {meeting.contactName}.</p>
      )}

      {(meeting.canRespond || meeting.canCancel) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {meeting.canRespond && (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={() => act(() => api.reunioes.responder(meeting.id, "accepted"))}
                className="rounded-md bg-[#EF5948] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#DA4939] disabled:opacity-60"
              >
                Aceitar
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => act(() => api.reunioes.responder(meeting.id, "rejected"))}
                className="rounded-md border border-[#EF5948] px-3 py-1.5 text-[11px] font-medium text-[#EF5948] hover:bg-[#FFF1EE] disabled:opacity-60"
              >
                Recusar
              </button>
            </>
          )}
          {meeting.canCancel && !meeting.canRespond && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (window.confirm("Cancelar esta reunião? A outra parte será avisada no chat.")) {
                  void act(() => api.reunioes.cancelar(meeting.id));
                }
              }}
              className="rounded-md border border-[#D8D8D8] px-3 py-1.5 text-[11px] text-[#666666] hover:bg-[#F5F5F5] disabled:opacity-60"
            >
              {meeting.status === "PENDENTE" ? "Cancelar convite" : "Cancelar reunião"}
            </button>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 rounded bg-red-50 px-2 py-1.5 text-[10px] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
