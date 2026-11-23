// Peças visuais compartilhadas pelas telas de perfil (startup e investidor).
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { FiCamera, FiTrash2, FiX } from "react-icons/fi";

import Avatar from "./Avatar";
import { validarFoto } from "../services/api";

export const cardClass =
  "rounded-lg border border-[#ECEFF1] bg-white shadow-[0_2px_3px_rgba(0,0,0,0.16)]";

export const fieldLabel = "mb-1 block text-[11px] font-medium text-[#555555]";
export const fieldInput =
  "w-full rounded-md border border-[#D6DADC] bg-white px-3 py-2 text-xs text-[#333333] outline-none transition " +
  "focus:border-[#EF5948] focus:ring-2 focus:ring-[#EF5948]/10 disabled:bg-[#F5F5F5]";

export function ProfileCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`${cardClass} p-5 ${className}`}>
      <span aria-hidden="true" className="mb-2 block h-[2px] w-7 bg-[#EF5948]" />
      <h2 className="mb-3 text-sm font-medium text-[#252525]">{title}</h2>
      {children}
    </section>
  );
}

export function Paragraph({ text, empty = "Não informado." }: { text?: string | null; empty?: string }) {
  return (
    <p className="whitespace-pre-line break-words text-xs leading-relaxed text-[#777777]">
      {text?.trim() ? text : <span className="italic text-[#A0A0A0]">{empty}</span>}
    </p>
  );
}

export function InfoList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-[#DADADA]">
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="flex items-start justify-between gap-4 py-3 text-[11px] text-[#777777] first:pt-0 last:pb-0"
        >
          <dt className="shrink-0">{label}</dt>
          <dd className="min-w-0 break-words text-right">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Breadcrumb({ parent, href, current }: { parent: string; href: string; current: string }) {
  return (
    <nav aria-label="Localização" className="mb-6 flex items-center gap-2 text-xs text-[#777777]">
      <a href={href} className="hover:text-[#EF5948]">
        {parent}
      </a>
      <span aria-hidden="true">›</span>
      <span aria-current="page" className="truncate">
        {current}
      </span>
    </nav>
  );
}

/** Foto grande do cabeçalho do perfil, com moldura em degradê. */
export function ProfilePhoto({
  userId,
  hasPhoto,
  name,
  square = false,
}: {
  userId: number;
  hasPhoto: boolean;
  name: string;
  square?: boolean;
}) {
  return (
    <div className={`shrink-0 bg-gradient-to-r from-[#E4007E] to-[#00BDD6] p-[2px] ${square ? "rounded-md" : "rounded-full"}`}>
      <Avatar
        userId={userId}
        hasPhoto={hasPhoto}
        name={name}
        className={`h-20 w-20 bg-[#052B2B] text-3xl italic sm:h-24 sm:w-24 sm:text-4xl ${square ? "rounded-[4px]" : "rounded-full"}`}
      />
    </div>
  );
}

/**
 * Escolha de foto com prévia. Valida tipo (JPG/PNG/WebP) e tamanho (2 MB) antes do envio;
 * o backend confere de novo pelo conteúdo do arquivo.
 */
export function PhotoPicker({
  file,
  onChange,
  name,
  userId,
  hasPhoto = false,
  onRemoveSaved,
  label = "Foto de perfil (opcional)",
  busy = false,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  name: string;
  userId?: number;
  hasPhoto?: boolean;
  onRemoveSaved?: () => void;
  label?: string;
  busy?: boolean;
}) {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div>
      <span className={fieldLabel}>{label}</span>
      <div className="flex items-center gap-4">
        <Avatar
          userId={userId}
          hasPhoto={hasPhoto}
          name={name || "?"}
          previewUrl={preview}
          className="h-16 w-16 rounded-full bg-[#7250f4] text-xl"
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={input}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(event) => {
              const chosen = event.currentTarget.files?.[0] ?? null;
              event.currentTarget.value = "";
              if (!chosen) return;
              const problem = validarFoto(chosen);
              setError(problem);
              if (!problem) onChange(chosen);
            }}
          />
          <label
            htmlFor={inputId}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-md border border-[#EF5948] px-3 py-1.5 text-[11px] font-medium text-[#EF5948] transition hover:bg-[#FFF4F1] ${busy ? "pointer-events-none opacity-60" : ""}`}
          >
            <FiCamera aria-hidden="true" />
            {file || hasPhoto ? "Trocar foto" : "Escolher foto"}
          </label>
          {file && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-[11px] text-[#777777] underline-offset-2 hover:text-[#EF5948] hover:underline"
            >
              Descartar
            </button>
          )}
          {!file && hasPhoto && onRemoveSaved && (
            <button
              type="button"
              disabled={busy}
              onClick={onRemoveSaved}
              className="inline-flex items-center gap-1 text-[11px] text-[#777777] hover:text-red-600 disabled:opacity-60"
            >
              <FiTrash2 aria-hidden="true" /> Remover foto
            </button>
          )}
        </div>
      </div>
      <p className="mt-1 text-[10px] text-[#999999]">JPG, PNG ou WebP, até 2 MB.</p>
      {error && (
        <p role="alert" className="mt-1 text-[11px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/** Janela modal simples (Esc fecha; foco vai para o primeiro campo). */
export function Dialog({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    // Se um campo interno já tratou o Esc (ex.: fechar a lista de segmentos), a janela continua aberta.
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && !event.defaultPrevented && onClose();
    document.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("input, textarea, button")?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    // A janela nunca encosta nas bordas: 16 px no celular, 32 px a partir do tablet e 48 px
    // em telas grandes. O conteúdo rola por dentro, com o título sempre visível.
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-8 lg:p-12">
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative flex max-h-full w-full ${wide ? "max-w-2xl" : "max-w-lg"} flex-col overflow-hidden rounded-xl bg-white shadow-xl`}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-[#F0F0F0] px-5 py-4 sm:px-6">
          <h2 id={titleId} className="text-base font-semibold text-[#252525]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#555555] hover:bg-[#F5F5F5]"
          >
            <FiX size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}

export function StatusMessage({ error, success }: { error?: string; success?: string }) {
  if (error) {
    return (
      <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p role="status" className="rounded-md bg-green-50 px-3 py-2 text-xs text-green-700">
        {success}
      </p>
    );
  }
  return null;
}

export function PageShell({ sidebar, children }: { sidebar: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F5F8FA] text-[#252525]" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {sidebar}
      <main className="md:ml-48">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-7 lg:px-9">{children}</div>
      </main>
    </div>
  );
}

export function primaryButton(extra = "") {
  return (
    "inline-flex items-center justify-center gap-2 rounded-md bg-[#EF5948] px-4 py-2 text-xs font-medium text-white " +
    "transition hover:bg-[#dc4b3b] disabled:cursor-not-allowed disabled:opacity-60 " +
    extra
  );
}

export function outlineButton(extra = "") {
  return (
    "inline-flex items-center justify-center gap-2 rounded-md border border-[#EF5948] px-4 py-2 text-xs font-medium " +
    "text-[#EF5948] transition hover:bg-[#FFF4F1] disabled:cursor-not-allowed disabled:opacity-60 " +
    extra
  );
}

