// Formulário de convite de reunião (só no portal do investidor).
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { FiX } from "react-icons/fi";

import { api } from "../services/api";
import type { ChatMessage } from "../services/api";

const DURATIONS = [15, 30, 45, 60, 90, 120];

function isoDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

type InviteDialogProps = {
  conversationId: string;
  contactName: string;
  onClose: () => void;
  onSent: (message: ChatMessage) => void;
};

const labelClass = "mb-1 block text-[11px] font-medium text-[#444444]";
const fieldClass =
  "h-9 w-full rounded-lg border border-[#D8D8D8] bg-white px-3 text-xs outline-none focus:border-[#EF5948] focus:ring-2 focus:ring-[#EF5948]/10";

export default function InviteDialog({ conversationId, contactName, onClose, onSent }: InviteDialogProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);

  const [date, setDate] = useState(isoDate(tomorrow));
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState(60);
  const [subject, setSubject] = useState("");
  const [location, setLocation] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (new Date(`${date}T${time}`) <= new Date()) {
      setError("Escolha uma data e um horário futuros.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const message = await api.conversas.convidar(conversationId, {
        date,
        time,
        durationMinutes: duration,
        subject: subject.trim(),
        location: location.trim() || undefined,
      });
      onSent(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o convite.");
    } finally {
      setSending(false);
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
        aria-labelledby="invite-title"
        onSubmit={handleSubmit}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="invite-title" className="text-base font-semibold">
              Convidar {contactName} para uma reunião
            </h2>
            <p className="mt-1 text-xs text-[#777777]">
              O convite aparece no chat. Se a startup aceitar, a reunião entra na aba Reuniões de vocês dois.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="rounded p-1 text-[#666666] hover:bg-[#F5F5F5]">
            <FiX size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="invite-date" className={labelClass}>Data</label>
            <input
              id="invite-date"
              type="date"
              required
              min={isoDate(new Date())}
              max={isoDate(maxDate)}
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="invite-time" className={labelClass}>Horário</label>
            <input
              id="invite-time"
              type="time"
              required
              step={300}
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="invite-duration" className={labelClass}>Duração</label>
            <select
              id="invite-duration"
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className={fieldClass}
            >
              {DURATIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes < 60
                    ? `${minutes} min`
                    : `${Math.floor(minutes / 60)} h${minutes % 60 ? ` ${minutes % 60} min` : ""}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label htmlFor="invite-subject" className={`${labelClass} mt-4`}>Assunto</label>
        <input
          id="invite-subject"
          required
          maxLength={200}
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="Ex.: Apresentação do pitch e próximos passos"
          className={fieldClass}
        />

        <label htmlFor="invite-location" className={`${labelClass} mt-4`}>Link da videochamada ou endereço (opcional)</label>
        <input
          id="invite-location"
          maxLength={300}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="https://meet.google.com/... ou Porto Digital, Recife"
          className={fieldClass}
        />

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#DDDDDD] px-4 py-2 text-xs text-[#555555] hover:bg-[#F7F7F7]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={sending}
            className="rounded-lg bg-[#EF5948] px-4 py-2 text-xs font-medium text-white hover:bg-[#DA4939] disabled:cursor-wait disabled:opacity-70"
          >
            {sending ? "Enviando..." : "Enviar convite"}
          </button>
        </div>
      </form>
    </div>
  );
}
