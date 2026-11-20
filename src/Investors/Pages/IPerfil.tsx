// Perfil do próprio investidor: dados reais, foto e edição (inclui as preferências do matching).
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { FiEdit2, FiExternalLink } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import ISidebar from "../../components/ISidebar";
import MultiCombobox from "../../components/MultiCombobox";
import StateCityFields from "../../components/StateCityFields";
import TicketRangeFields, { ticketRangeError } from "../../components/TicketRangeFields";
import {
  Breadcrumb,
  Dialog,
  InfoList,
  PageShell,
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
} from "../../components/ProfileUI";
import { toCurrencyField } from "../../components/StartupProfile";
import { ESTAGIOS, SEGMENTOS, toOptions } from "../../data/options";
import { ApiError, api, formatarTicket } from "../../services/api";
import type { InvestorProfile } from "../../services/api";
import { getSession } from "../../services/session";
import { maskCnpj, maskCpf, parseCurrency } from "../../utils/forms";

function InvestorEditDialog({
  profile,
  onClose,
  onSaved,
}: {
  profile: InvestorProfile;
  onClose: () => void;
  onSaved: (profile: InvestorProfile) => void;
}) {
  const [values, setValues] = useState({
    name: profile.name,
    linkedin: profile.linkedin,
    city: profile.city,
    state: profile.state,
    segments: profile.segments,
    stages: profile.stages,
    ticketMin: toCurrencyField(profile.ticketMin),
    ticketMax: toCurrencyField(profile.ticketMax),
    aboutInvestor: profile.aboutInvestor,
    career: profile.career,
    lookingFor: profile.lookingFor,
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [hasPhoto, setHasPhoto] = useState(profile.hasPhoto);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (patch: Partial<typeof values>) => setValues((current) => ({ ...current, ...patch }));
  const segmentOptions = toOptions([...new Set([...values.segments, ...SEGMENTOS])]);

  async function removerFoto() {
    setSaving(true);
    setError("");
    try {
      await api.perfil.removerFoto(profile.userId);
      setHasPhoto(false);
      onSaved({ ...profile, hasPhoto: false });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível remover a foto.");
    } finally {
      setSaving(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (ticketRangeError(values.ticketMin, values.ticketMax)) return;
    if (values.segments.length === 0) {
      setError("Escolha pelo menos um segmento de interesse.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (photo) await api.perfil.enviarFoto(profile.userId, photo);
      const saved = await api.perfil.editarInvestidor({
        ...values,
        ticketMin: parseCurrency(values.ticketMin),
        ticketMax: parseCurrency(values.ticketMax),
      });
      onSaved(saved);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar o perfil.");
    } finally {
      setSaving(false);
    }
  }

  const textAreas = [
    ["aboutInvestor", "Sobre você"],
    ["career", "Carreira"],
    ["lookingFor", "O que está buscando"],
  ] as const;

  return (
    <Dialog title="Editar meu perfil" onClose={onClose} wide>
      <form onSubmit={submit} className="grid gap-4">
        <PhotoPicker
          file={photo}
          onChange={setPhoto}
          name={values.name}
          userId={profile.userId}
          hasPhoto={hasPhoto}
          onRemoveSaved={removerFoto}
          busy={saving}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="edit-investor-name" className={fieldLabel}>
              Nome *
            </label>
            <input
              id="edit-investor-name"
              required
              maxLength={150}
              value={values.name}
              onChange={(e) => set({ name: e.currentTarget.value })}
              className={fieldInput}
            />
          </div>
          <div>
            <label htmlFor="edit-investor-linkedin" className={fieldLabel}>
              LinkedIn
            </label>
            <input
              id="edit-investor-linkedin"
              type="url"
              placeholder="https://linkedin.com/in/..."
              value={values.linkedin}
              onChange={(e) => set({ linkedin: e.currentTarget.value })}
              className={fieldInput}
            />
          </div>
          <StateCityFields
            idPrefix="edit-investor"
            state={values.state}
            city={values.city}
            onChange={(next) => set(next)}
            labelClass={fieldLabel}
            inputClass={fieldInput}
            required={false}
          />
          <div>
            <label htmlFor="edit-investor-segments" className={fieldLabel}>
              Segmentos de interesse *
            </label>
            <MultiCombobox
              id="edit-investor-segments"
              values={values.segments}
              onChange={(segments) => set({ segments })}
              options={segmentOptions}
              placeholder="Digite para adicionar"
              className={fieldInput}
            />
          </div>
          <div>
            <label htmlFor="edit-investor-stages" className={fieldLabel}>
              Estágios preferidos
            </label>
            <MultiCombobox
              id="edit-investor-stages"
              values={values.stages}
              onChange={(stages) => set({ stages })}
              options={toOptions(ESTAGIOS)}
              placeholder="Todos os estágios"
              className={fieldInput}
            />
          </div>
          <TicketRangeFields
            idPrefix="edit-investor"
            label="Ticket médio"
            minimum={values.ticketMin}
            maximum={values.ticketMax}
            onChange={({ minimum, maximum }) => set({ ticketMin: minimum, ticketMax: maximum })}
            labelClass={fieldLabel}
            inputClass={fieldInput}
            required={false}
          />
        </div>
        <p className="text-[10px] text-[#999999]">
          Segmentos, estágios e ticket definem as startups que aparecem no seu Matching.
        </p>
        {textAreas.map(([key, label]) => (
          <div key={key}>
            <label htmlFor={`edit-investor-${key}`} className={fieldLabel}>
              {label}
            </label>
            <textarea
              id={`edit-investor-${key}`}
              rows={3}
              maxLength={4000}
              value={values[key]}
              onChange={(e) => set({ [key]: e.currentTarget.value })}
              className={`${fieldInput} resize-y`}
            />
          </div>
        ))}
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

export default function IPerfil() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (getSession()?.papel !== "INVESTIDOR") {
      navigate("/investors/login", { replace: true });
      return;
    }
    let active = true;
    api.perfil
      .proprio()
      .then((data) => active && setProfile(data.investor))
      .catch((e: unknown) => {
        if (!active) return;
        if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
          navigate("/investors/login", { replace: true });
          return;
        }
        setError(e instanceof Error ? e.message : "Não foi possível carregar o perfil.");
      });
    return () => {
      active = false;
    };
  }, [navigate]);

  const local = profile ? [profile.city, profile.state].filter(Boolean).join(" - ") : "";

  return (
    <PageShell sidebar={<ISidebar />}>
      <Breadcrumb parent="Perfil" href="/investors/perfil" current={profile?.name ?? "Carregando..."} />
      <StatusMessage error={error} success={saved} />
      {!profile && !error && (
        <p role="status" className="text-sm text-[#777777]">
          Carregando perfil...
        </p>
      )}
      {profile && (
        <div className={saved ? "mt-4" : ""}>
          <header className={`${cardClass} relative mb-6 flex flex-wrap items-center gap-5 p-5 sm:gap-6 sm:p-6`}>
            <ProfilePhoto userId={profile.userId} hasPhoto={profile.hasPhoto} name={profile.name} />
            <div className="min-w-0 flex-1 basis-44">
              <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">{profile.name}</h1>
              <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#EF5948] sm:text-sm">
                <li>{profile.type === "MENTOR" ? "Mentor(a)" : "Investidor(a) anjo"}</li>
                {profile.segments.length > 0 && (
                  <li className="border-l border-[#D5D5D5] pl-3">{profile.segments.join(", ")}</li>
                )}
                {local && <li className="border-l border-[#D5D5D5] pl-3">{local}</li>}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => {
                setSaved("");
                setEditing(true);
              }}
              className={outlineButton("w-full sm:w-auto sm:self-start")}
            >
              <FiEdit2 aria-hidden="true" /> Editar perfil
            </button>
          </header>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <div className="grid min-w-0 gap-5">
              <ProfileCard title="Sobre o(a) investidor(a)">
                <Paragraph text={profile.aboutInvestor} />
              </ProfileCard>
              <div className="grid items-stretch gap-5 sm:grid-cols-2">
                <ProfileCard title="Carreira">
                  <Paragraph text={profile.career} />
                </ProfileCard>
                <ProfileCard title="O que está buscando">
                  <Paragraph text={profile.lookingFor} />
                </ProfileCard>
              </div>
            </div>

            <div className="grid min-w-0 gap-5">
              <ProfileCard title="Startups que procuro">
                <InfoList
                  items={[
                    { label: "Segmentos", value: profile.segments.join(", ") },
                    { label: "Estágios", value: profile.stages.length ? profile.stages.join(", ") : "Todos" },
                    { label: "Cidade/Estado", value: local },
                  ]}
                />
              </ProfileCard>
              <ProfileCard title="Ticket médio">
                <p className="text-xs text-[#888888]">Faixa de investimento</p>
                <p className="mt-2 text-xl font-medium leading-snug text-[#EF5948]">
                  {formatarTicket(profile.ticketMin, profile.ticketMax)}
                </p>
              </ProfileCard>
              <ProfileCard title="Dados da conta">
                <InfoList
                  items={[
                    { label: "E-mail", value: profile.email ?? "" },
                    ...(profile.cpf ? [{ label: "CPF", value: maskCpf(profile.cpf) }] : []),
                    ...(profile.cnpj ? [{ label: "CNPJ", value: maskCnpj(profile.cnpj) }] : []),
                    {
                      label: "LinkedIn",
                      value: profile.linkedin ? (
                        <a
                          href={profile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#EF5948] hover:underline"
                        >
                          Abrir <FiExternalLink size={11} aria-hidden="true" />
                        </a>
                      ) : (
                        ""
                      ),
                    },
                  ]}
                />
              </ProfileCard>
            </div>
          </div>
        </div>
      )}
      {profile && editing && (
        <InvestorEditDialog
          profile={profile}
          onClose={() => setEditing(false)}
          onSaved={(next) => {
            setProfile(next);
            setSaved("Perfil atualizado.");
          }}
        />
      )}
    </PageShell>
  );
}
