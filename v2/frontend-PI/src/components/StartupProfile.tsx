// Perfil da startup: visualização (própria ou por investidores), edição e materiais.
import { useId, useState } from "react";
import type { FormEvent } from "react";
import { FiDownload, FiEdit2, FiExternalLink, FiTrash2, FiUpload } from "react-icons/fi";

import Combobox from "./Combobox";
import StateCityFields from "./StateCityFields";
import TicketRangeFields, { ticketRangeError } from "./TicketRangeFields";
import {
  Dialog,
  InfoList,
  Paragraph,
  PhotoPicker,
  ProfileCard,
  ProfilePhoto,
  StatusMessage,
  cardClass,
  fieldInput,
  fieldLabel,
  outlineButton,
  primaryButton,
} from "./ProfileUI";
import { ESTAGIOS, SEGMENTOS, toOptions } from "../data/options";
import { api, formatarTicket } from "../services/api";
import type { MaterialTipo, StartupProfile } from "../services/api";
import { maskCnpj, maskCurrency, parseCurrency } from "../utils/forms";

const MATERIAL_MAX = 10 * 1024 * 1024;
const MATERIAL_EXT = /\.(pdf|pptx?)$/i;

export function toCurrencyField(value: number | null): string {
  return value == null ? "" : maskCurrency(String(Math.round(value * 100)));
}

function mensagem(error: unknown, padrao: string) {
  return error instanceof Error ? error.message : padrao;
}

/* ------------------------------------------------------------- materiais */

function MaterialRow({
  label,
  tipo,
  profile,
  owner,
  onProfileChange,
}: {
  label: string;
  tipo: MaterialTipo;
  profile: StartupProfile;
  owner: boolean;
  onProfileChange?: (profile: StartupProfile) => void;
}) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const present = tipo === "pitch" ? profile.hasPitchDeck : profile.hasCanvas;
  const fileName = tipo === "pitch" ? profile.pitchDeckName : profile.canvasName;

  async function run(action: () => Promise<StartupProfile | void>) {
    setBusy(true);
    setError("");
    try {
      const updated = await action();
      if (updated) onProfileChange?.(updated);
    } catch (e) {
      setError(mensagem(e, "Não foi possível concluir a operação."));
    } finally {
      setBusy(false);
    }
  }

  if (!present && !owner) return null;

  return (
    <div className="py-2.5">
      <div className="flex items-center justify-between gap-3 text-xs text-[#666666]">
        <div className="min-w-0">
          <p>{label}</p>
          {present && fileName && <p className="truncate text-[10px] text-[#999999]">{fileName}</p>}
          {!present && <p className="text-[10px] text-[#A0A0A0]">Não anexado (opcional)</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {present && (
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => api.baixarMaterial(profile.id, tipo, fileName))}
              aria-label={`Baixar ${label}`}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#777777] transition hover:bg-[#FFF4F1] hover:text-[#EF5948] disabled:opacity-50"
            >
              <FiDownload size={14} aria-hidden="true" />
            </button>
          )}
          {owner && (
            <>
              <input
                id={inputId}
                type="file"
                accept=".pdf,.ppt,.pptx,application/pdf"
                className="sr-only"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = "";
                  if (!file) return;
                  if (!MATERIAL_EXT.test(file.name)) return setError("Envie PDF, PPT ou PPTX.");
                  if (file.size > MATERIAL_MAX) return setError("O arquivo deve ter no máximo 10 MB.");
                  run(() => api.perfil.enviarMaterial(tipo, file));
                }}
              />
              <label
                htmlFor={inputId}
                aria-label={present ? `Substituir ${label}` : `Anexar ${label}`}
                title={present ? "Substituir" : "Anexar"}
                className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#777777] transition hover:bg-[#FFF4F1] hover:text-[#EF5948] ${busy ? "pointer-events-none opacity-50" : ""}`}
              >
                <FiUpload size={14} aria-hidden="true" />
              </label>
              {present && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Remover o ${label} do seu perfil?`)) run(() => api.perfil.removerMaterial(tipo));
                  }}
                  aria-label={`Remover ${label}`}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#777777] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                >
                  <FiTrash2 size={14} aria-hidden="true" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {error && (
        <p role="alert" className="mt-1 text-[11px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function MaterialsCard({
  profile,
  owner,
  onProfileChange,
}: {
  profile: StartupProfile;
  owner: boolean;
  onProfileChange?: (profile: StartupProfile) => void;
}) {
  const nothing = !profile.hasPitchDeck && !profile.hasCanvas && !profile.presentationVideo;
  return (
    <ProfileCard title="Pitch e materiais">
      {!owner && nothing ? (
        <Paragraph text="" empty="A startup ainda não anexou materiais." />
      ) : (
        <div className="divide-y divide-[#DADADA]">
          <MaterialRow label="Pitch Deck" tipo="pitch" profile={profile} owner={owner} onProfileChange={onProfileChange} />
          <MaterialRow
            label="Business Model Canvas"
            tipo="canvas"
            profile={profile}
            owner={owner}
            onProfileChange={onProfileChange}
          />
          {profile.presentationVideo ? (
            <a
              href={profile.presentationVideo}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-3 py-2.5 text-xs text-[#666666] transition hover:text-[#EF5948]"
            >
              Link de apresentação
              <FiExternalLink size={13} aria-hidden="true" className="shrink-0 text-[#999999] group-hover:text-[#EF5948]" />
            </a>
          ) : (
            owner && (
              <p className="py-2.5 text-xs text-[#666666]">
                Link de apresentação
                <span className="block text-[10px] text-[#A0A0A0]">Não informado — adicione em “Editar perfil”</span>
              </p>
            )
          )}
        </div>
      )}
    </ProfileCard>
  );
}

/* ------------------------------------------------------------ visualização */

export function StartupProfileView({
  profile,
  owner = false,
  onEdit,
  onProfileChange,
}: {
  profile: StartupProfile;
  owner?: boolean;
  onEdit?: () => void;
  onProfileChange?: (profile: StartupProfile) => void;
}) {
  const local = [profile.city, profile.state].filter(Boolean).join(" - ");
  const information = [
    { label: "Segmento", value: profile.segment },
    { label: "Estágio", value: profile.stage },
    { label: "Cidade/Estado", value: local },
    { label: "Ano de fundação", value: profile.foundedYear },
    ...(profile.website
      ? [
          {
            label: "Site",
            value: (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[#EF5948] hover:underline">
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            ),
          },
        ]
      : []),
    ...(owner
      ? [
          { label: "CNPJ", value: profile.cnpj ? maskCnpj(profile.cnpj) : "" },
          { label: "Responsável", value: profile.profileOwner ?? "" },
          { label: "E-mail", value: profile.email ?? "" },
        ]
      : []),
  ];

  return (
    <>
      <header className={`${cardClass} relative mb-6 flex flex-wrap items-center gap-5 p-5 sm:gap-6 sm:p-6`}>
        <ProfilePhoto userId={profile.userId} hasPhoto={profile.hasPhoto} name={profile.name} square />
        <div className="min-w-0 flex-1 basis-44">
          <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">{profile.name}</h1>
          <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#EF5948] sm:text-sm">
            <li>{profile.segment}</li>
            <li className="border-l border-[#D5D5D5] pl-3">{profile.stage}</li>
            {local && <li className="border-l border-[#D5D5D5] pl-3">{local}</li>}
          </ul>
        </div>
        {owner && onEdit && (
          <button type="button" onClick={onEdit} className={outlineButton("w-full sm:w-auto sm:self-start")}>
            <FiEdit2 aria-hidden="true" /> Editar perfil
          </button>
        )}
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-5">
          <ProfileCard title="Sobre a Startup">
            <Paragraph text={profile.summary} />
          </ProfileCard>
          <div className="grid items-stretch gap-5 sm:grid-cols-2">
            <ProfileCard title="Problema que resolvemos">
              <Paragraph text={profile.problem} />
            </ProfileCard>
            <ProfileCard title="Diferencial competitivo">
              <Paragraph text={profile.competitiveAdvantages} />
            </ProfileCard>
          </div>
        </div>

        <div className="grid min-w-0 gap-5">
          <ProfileCard title="Informações da Startup">
            <InfoList items={information} />
          </ProfileCard>
          <ProfileCard title="Captação">
            <p className="text-xs text-[#888888]">Buscando investimentos</p>
            <p className="mt-2 text-xl font-medium leading-snug text-[#EF5948]">
              {formatarTicket(profile.minimumTicket, profile.maximumTicket)}
            </p>
          </ProfileCard>
          <MaterialsCard profile={profile} owner={owner} onProfileChange={onProfileChange} />
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ edição */

export function StartupEditDialog({
  profile,
  onClose,
  onSaved,
}: {
  profile: StartupProfile;
  onClose: () => void;
  onSaved: (profile: StartupProfile) => void;
}) {
  const [values, setValues] = useState({
    name: profile.name,
    website: profile.website,
    city: profile.city,
    state: profile.state,
    foundedYear: profile.foundedYear,
    profileOwner: profile.profileOwner ?? "",
    segment: profile.segment,
    stage: profile.stage,
    minimumTicket: toCurrencyField(profile.minimumTicket),
    maximumTicket: toCurrencyField(profile.maximumTicket),
    summary: profile.summary,
    problem: profile.problem,
    competitiveAdvantages: profile.competitiveAdvantages,
    presentationVideo: profile.presentationVideo,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [hasPhoto, setHasPhoto] = useState(profile.hasPhoto);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (patch: Partial<typeof values>) => setValues((current) => ({ ...current, ...patch }));
  const segmentOptions = toOptions(SEGMENTOS.includes(values.segment) || !values.segment ? SEGMENTOS : [values.segment, ...SEGMENTOS]);

  async function removerFoto() {
    setSaving(true);
    setError("");
    try {
      await api.perfil.removerFoto(profile.userId);
      setHasPhoto(false);
      onSaved({ ...profile, hasPhoto: false });
    } catch (e) {
      setError(mensagem(e, "Não foi possível remover a foto."));
    } finally {
      setSaving(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (ticketRangeError(values.minimumTicket, values.maximumTicket)) return;
    setSaving(true);
    setError("");
    try {
      if (photo) await api.perfil.enviarFoto(profile.userId, photo);
      const saved = await api.perfil.editarStartup({
        ...values,
        minimumTicket: parseCurrency(values.minimumTicket),
        maximumTicket: parseCurrency(values.maximumTicket),
      });
      onSaved(saved);
      onClose();
    } catch (e) {
      setError(mensagem(e, "Não foi possível salvar o perfil."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog title="Editar perfil da startup" onClose={onClose} wide>
      <form onSubmit={submit} className="grid gap-4">
        <PhotoPicker
          file={photo}
          onChange={setPhoto}
          name={values.name}
          userId={profile.userId}
          hasPhoto={hasPhoto}
          onRemoveSaved={removerFoto}
          label="Logo / foto de perfil"
          busy={saving}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-startup-name" className={fieldLabel}>
              Nome da startup *
            </label>
            <input
              id="edit-startup-name"
              required
              maxLength={150}
              value={values.name}
              onChange={(e) => set({ name: e.currentTarget.value })}
              className={fieldInput}
            />
          </div>
          <div>
            <label htmlFor="edit-startup-owner" className={fieldLabel}>
              Responsável pelo perfil
            </label>
            <input
              id="edit-startup-owner"
              maxLength={150}
              value={values.profileOwner}
              onChange={(e) => set({ profileOwner: e.currentTarget.value })}
              className={fieldInput}
            />
          </div>
          <div>
            <label htmlFor="edit-startup-segment" className={fieldLabel}>
              Segmento *
            </label>
            <Combobox
              id="edit-startup-segment"
              required
              value={values.segment}
              onChange={(segment) => set({ segment })}
              options={segmentOptions}
              placeholder="Digite ou selecione"
              className={fieldInput}
            />
          </div>
          <div>
            <label htmlFor="edit-startup-stage" className={fieldLabel}>
              Estágio *
            </label>
            <Combobox
              id="edit-startup-stage"
              required
              value={values.stage}
              onChange={(stage) => set({ stage })}
              options={toOptions(ESTAGIOS)}
              placeholder="Selecione"
              className={fieldInput}
            />
          </div>
          <StateCityFields
            idPrefix="edit-startup"
            state={values.state}
            city={values.city}
            onChange={(next) => set(next)}
            labelClass={fieldLabel}
            inputClass={fieldInput}
            required={false}
          />
          <div>
            <label htmlFor="edit-startup-year" className={fieldLabel}>
              Ano de fundação
            </label>
            <input
              id="edit-startup-year"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={values.foundedYear}
              onChange={(e) => set({ foundedYear: e.currentTarget.value.replace(/\D/g, "") })}
              className={fieldInput}
            />
          </div>
          <TicketRangeFields
            idPrefix="edit-startup"
            label="Captação buscada"
            minimum={values.minimumTicket}
            maximum={values.maximumTicket}
            onChange={({ minimum, maximum }) => set({ minimumTicket: minimum, maximumTicket: maximum })}
            labelClass={fieldLabel}
            inputClass={fieldInput}
            required={false}
          />
          <div>
            <label htmlFor="edit-startup-site" className={fieldLabel}>
              Site
            </label>
            <input
              id="edit-startup-site"
              type="url"
              placeholder="https://"
              value={values.website}
              onChange={(e) => set({ website: e.currentTarget.value })}
              className={fieldInput}
            />
          </div>
          <div>
            <label htmlFor="edit-startup-video" className={fieldLabel}>
              Link de apresentação
            </label>
            <input
              id="edit-startup-video"
              type="url"
              placeholder="https://"
              value={values.presentationVideo}
              onChange={(e) => set({ presentationVideo: e.currentTarget.value })}
              className={fieldInput}
            />
          </div>
        </div>
        {(
          [
            ["summary", "Sobre a startup"],
            ["problem", "Problema que resolvem"],
            ["competitiveAdvantages", "Diferencial competitivo"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label htmlFor={`edit-startup-${key}`} className={fieldLabel}>
              {label}
            </label>
            <textarea
              id={`edit-startup-${key}`}
              rows={3}
              maxLength={4000}
              value={values[key]}
              onChange={(e) => set({ [key]: e.currentTarget.value })}
              className={`${fieldInput} resize-y`}
            />
          </div>
        ))}
        <p className="text-[10px] text-[#999999]">Pitch Deck e Canvas são gerenciados no card “Pitch e materiais”.</p>
        <StatusMessage error={error} />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={outlineButton()}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} className={primaryButton()}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
