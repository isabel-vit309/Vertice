// Visualização do perfil de um investidor: o próprio (com dados da conta e botão de editar)
// ou o público, visto por outros usuários (sem CPF, CNPJ e e-mail).
import { FiEdit2, FiExternalLink } from "react-icons/fi";

import { InfoList, Paragraph, ProfileCard, ProfilePhoto, cardClass, outlineButton } from "./ProfileUI";
import { formatarTicket } from "../services/api";
import type { InvestorProfile } from "../services/api";
import { maskCnpj, maskCpf } from "../utils/forms";

function LinkedIn({ url }: { url: string }) {
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[#EF5948] hover:underline">
      Abrir <FiExternalLink size={11} aria-hidden="true" />
    </a>
  ) : (
    ""
  );
}

export function InvestorProfileView({ profile, owner = false, onEdit }: { profile: InvestorProfile; owner?: boolean; onEdit?: () => void }) {
  const local = [profile.city, profile.state].filter(Boolean).join(" - ");
  return (
    <>
      <header className={`${cardClass} relative mb-6 flex flex-wrap items-center gap-5 p-5 sm:gap-6 sm:p-6`}>
        <ProfilePhoto userId={profile.userId} hasPhoto={profile.hasPhoto} name={profile.name} />
        <div className="min-w-0 flex-1 basis-44">
          <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">{profile.name}</h1>
          <ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#EF5948] sm:text-sm">
            <li>{profile.type === "MENTOR" ? "Mentor(a)" : "Investidor(a) anjo"}</li>
            {profile.segments.length > 0 && <li className="border-l border-[#D5D5D5] pl-3">{profile.segments.join(", ")}</li>}
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
          <ProfileCard title={owner ? "Startups que procuro" : "Startups que procura"}>
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
            <p className="mt-2 text-xl font-medium leading-snug text-[#EF5948]">{formatarTicket(profile.ticketMin, profile.ticketMax)}</p>
          </ProfileCard>
          {owner ? (
            <ProfileCard title="Dados da conta">
              <InfoList
                items={[
                  { label: "E-mail", value: profile.email ?? "" },
                  ...(profile.cpf ? [{ label: "CPF", value: maskCpf(profile.cpf) }] : []),
                  ...(profile.cnpj ? [{ label: "CNPJ", value: maskCnpj(profile.cnpj) }] : []),
                  { label: "LinkedIn", value: <LinkedIn url={profile.linkedin} /> },
                ]}
              />
            </ProfileCard>
          ) : (
            profile.linkedin && (
              <ProfileCard title="Contato">
                <InfoList items={[{ label: "LinkedIn", value: <LinkedIn url={profile.linkedin} /> }]} />
              </ProfileCard>
            )
          )}
        </div>
      </div>
    </>
  );
}
