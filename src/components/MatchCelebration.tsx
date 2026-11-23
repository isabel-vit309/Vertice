// Animação de match: quando a conexão é firmada, a tela se enche com o laranja do Vértice,
// o laranja recua das margens até o ponto central e, dali, o símbolo da marca se forma do
// centro para as pontas, com um brilho suave acompanhando a expansão. Depois entram os perfis das duas
// partes (como nos apps de relacionamento), "Conexão bem-sucedida!" e o convite para conversar.
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiMessageSquare } from "react-icons/fi";

import Avatar from "./Avatar";
import { api } from "../services/api";
import { getSession } from "../services/session";

const ORANGE = "#EF5948";

/**
 * Símbolo do Vértice (só o elemento gráfico da logo, sem o texto): dois traços espelhados
 * que descem das pontas superiores até o vértice central e terminam em duas curvas.
 * Cada metade é desenhada a partir do vértice (x = 42,5; y = 17), para que a animação
 * cresça do centro para as extremidades.
 */
const ARM = "M42.5 17 L41.4 13.4 C39.6 9.2 36.5 4.4 31 3.9 H20";
const CURL = "M42.5 17 C40.6 19.4 37.6 20.9 33.8 21 C30.6 21 28.4 19.6 27 17.4";
const MIRROR = "translate(85 0) scale(-1 1)";

function Strokes({ width, className }: { width: number; className?: string }) {
  return (
    <g fill="none" stroke={ORANGE} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d={ARM} pathLength={1} />
      <path d={CURL} pathLength={1} />
      <path d={ARM} pathLength={1} transform={MIRROR} />
      <path d={CURL} pathLength={1} transform={MIRROR} />
    </g>
  );
}

export function VerticeSymbol({ className = "", animated = false }: { className?: string; animated?: boolean }) {
  const filterId = useId().replace(/:/g, "");
  return (
    <svg viewBox="15 -1 55 26" className={className} aria-hidden="true" focusable="false" overflow="visible">
      {animated && (
        <>
          <defs>
            <filter id={filterId} x="-50%" y="-80%" width="200%" height="260%">
              <feGaussianBlur stdDeviation="1.4" />
            </filter>
          </defs>
          {/* Brilho: mesmo traço, mais largo e desfocado, crescendo junto com a logo. */}
          <g filter={`url(#${filterId})`} className="vtx-glow">
            <Strokes width={5.2} className="vtx-draw" />
          </g>
        </>
      )}
      <Strokes width={2.3} className={animated ? "vtx-draw" : undefined} />
    </svg>
  );
}

export type MatchParty = { name: string; userId?: number | null; hasPhoto?: boolean; role?: string };

// Perfil de quem está logado (para a foto ao lado da outra parte). Uma busca por sessão de página.
// Vinculado ao token: depois de sair e entrar com outra conta na mesma aba, busca de novo.
let ownProfile: Promise<MatchParty | null> | null = null;
let ownProfileToken: string | null = null;
/** Depois de editar o perfil (nome, foto), a próxima animação busca os dados novos. */
export function esquecerPerfilProprio() {
  ownProfile = null;
}

export function loadOwnProfile(): Promise<MatchParty | null> {
  const token = getSession()?.token ?? null;
  if (token !== ownProfileToken) {
    ownProfile = null;
    ownProfileToken = token;
  }
  ownProfile ??= api.perfil
    .proprio()
    .then((profile) => {
      if (profile.startup) {
        const s = profile.startup;
        return { name: s.name, userId: s.userId, hasPhoto: s.hasPhoto, role: "Startup" };
      }
      if (profile.investor) {
        const i = profile.investor;
        return {
          name: i.name,
          userId: i.userId,
          hasPhoto: i.hasPhoto,
          role: i.type === "MENTOR" ? "Mentor(a)" : "Investidor(a) anjo",
        };
      }
      return null;
    })
    .catch(() => {
      ownProfile = null;
      return null;
    });
  return ownProfile;
}

const styles = `
@keyframes vtx-fill { from { opacity: 0 } to { opacity: 1 } }
@keyframes vtx-recede {
  from { clip-path: circle(150vmax at var(--vtx-x, 50%) var(--vtx-y, 30%)); }
  to   { clip-path: circle(0px at var(--vtx-x, 50%) var(--vtx-y, 30%)); }
}
@keyframes vtx-symbol { 0% { transform: scale(.88); } 100% { transform: scale(1); } }
@keyframes vtx-stroke { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes vtx-glow-pulse { 0% { opacity: 0; } 35% { opacity: .38; } 70% { opacity: .26; } 100% { opacity: .12; } }
@keyframes vtx-halo { 0% { opacity: 0; transform: scale(.3); } 50% { opacity: .5; } 100% { opacity: .2; transform: scale(1.2); } }
@keyframes vtx-in-left  { from { opacity: 0; transform: translateX(-90px) rotate(-14deg) scale(.7); } to { opacity: 1; transform: translateX(0) rotate(-6deg) scale(1); } }
@keyframes vtx-in-right { from { opacity: 0; transform: translateX(90px) rotate(14deg) scale(.7); }  to { opacity: 1; transform: translateX(0) rotate(6deg) scale(1); } }
@keyframes vtx-spark { 0% { opacity: 0; transform: scale(.3); } 50% { opacity: 1; transform: scale(1.15); } 100% { opacity: 1; transform: scale(1); } }
@keyframes vtx-up { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes vtx-pop { 0% { opacity: 0; transform: translateY(18px) scale(.96); } 100% { opacity: 1; transform: none; } }
.vtx-layer  { animation: vtx-fill .25s ease-out both, vtx-recede .9s cubic-bezier(.7,0,.25,1) .55s both; }
.vtx-symbol { animation: vtx-symbol .9s cubic-bezier(.2,.8,.2,1) 1.4s both; }
.vtx-draw path { stroke-dasharray: 1; animation: vtx-stroke .9s cubic-bezier(.33,0,.2,1) 1.4s both; }
.vtx-glow   { animation: vtx-glow-pulse 1.6s ease-out 1.4s both; }
.vtx-halo   { animation: vtx-halo 1.4s ease-out 1.4s both; }
.vtx-left   { animation: vtx-in-left .6s cubic-bezier(.2,.9,.25,1.15) 2.4s both; }
.vtx-right  { animation: vtx-in-right .6s cubic-bezier(.2,.9,.25,1.15) 2.4s both; }
.vtx-spark  { animation: vtx-spark .45s ease-out 2.8s both; }
.vtx-title  { animation: vtx-up .45s ease-out 3s both; }
.vtx-popup  { animation: vtx-pop .45s cubic-bezier(.2,.8,.2,1) 3.4s both; }
@media (prefers-reduced-motion: reduce) {
  .vtx-layer { display: none; }
  .vtx-symbol, .vtx-draw path, .vtx-glow, .vtx-halo, .vtx-spark, .vtx-title, .vtx-popup { animation: none; stroke-dasharray: none; }
  .vtx-glow { opacity: .12; }
  .vtx-halo { opacity: .2; }
  .vtx-left  { animation: none; transform: rotate(-6deg); }
  .vtx-right { animation: none; transform: rotate(6deg); }
}
`;

const POPUP_DELAY_MS = 3400;

function PartyCard({ party, side }: { party: MatchParty; side: "left" | "right" }) {
  return (
    <figure className={`${side === "left" ? "vtx-left" : "vtx-right"} flex w-[min(38vw,150px)] flex-col items-center`}>
      <div className="rounded-full bg-gradient-to-br from-[#FF8A6B] to-[#EF5948] p-[3px] shadow-[0_8px_22px_rgba(239,89,72,0.30)]">
        <div className="rounded-full bg-white p-[3px]">
          <Avatar
            userId={party.userId}
            hasPhoto={party.hasPhoto}
            name={party.name}
            className="h-[clamp(84px,24vw,120px)] w-[clamp(84px,24vw,120px)] rounded-full bg-[#7250f4] text-3xl"
          />
        </div>
      </div>
      <figcaption className="mt-3 text-center">
        <span className="block max-w-full truncate text-sm font-semibold text-[#252525]">{party.name}</span>
        {party.role && <span className="block text-[11px] text-[#888888]">{party.role}</span>}
      </figcaption>
    </figure>
  );
}

export default function MatchCelebration({
  contact,
  chatHref,
  onClose,
}: {
  /** A outra parte da conexão (foto e nome aparecem ao lado do perfil de quem está logado). */
  contact: MatchParty;
  /** Rota da conversa dessa conexão. */
  chatHref: string;
  onClose: () => void;
}) {
  const titleId = useId();
  const startButton = useRef<HTMLAnchorElement>(null);
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState<MatchParty | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const symbol = useRef<HTMLDivElement>(null);

  // O laranja recua exatamente para onde a logo se forma (a posição varia com a altura da tela).
  useLayoutEffect(() => {
    const box = symbol.current?.getBoundingClientRect();
    if (!box || !root.current) return;
    root.current.style.setProperty("--vtx-x", `${box.left + box.width / 2}px`);
    root.current.style.setProperty("--vtx-y", `${box.top + box.height / 2}px`);
  }, []);

  useEffect(() => {
    let active = true;
    loadOwnProfile().then((profile) => active && setMe(profile));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      setReady(true);
      startButton.current?.focus();
    }, reduced ? 0 : POPUP_DELAY_MS);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      window.clearTimeout(timer);
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      ref={root}
      className="fixed inset-0 z-[100] overflow-y-auto overflow-x-hidden bg-white"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <style>{styles}</style>

      <div className="relative mx-auto flex min-h-full max-w-xl flex-col items-center justify-center px-4 py-8">
        {/* Logo formada do centro para as pontas, com brilho. */}
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden="true"
            className="vtx-halo pointer-events-none absolute inset-[-30%] rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(239,89,72,0.16), rgba(239,89,72,0.05) 55%, transparent 75%)" }}
          />
          <div ref={symbol} className="vtx-symbol relative">
            <VerticeSymbol animated className="h-auto w-[min(50vw,230px)]" />
          </div>
        </div>

        {/* Perfis das duas partes, entrando pelas laterais até se encontrarem. */}
        <div className="relative mt-7 flex items-start justify-center gap-2 sm:gap-5">
          <PartyCard party={me ?? { name: "Você" }} side="left" />
          <span
            aria-hidden="true"
            className="vtx-spark absolute left-1/2 top-[clamp(34px,10vw,52px)] z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
          >
            <VerticeSymbol className="w-6" />
          </span>
          <PartyCard party={contact} side="right" />
        </div>

        <div className="vtx-title mt-6 text-center">
          <h2 id={titleId} className="text-2xl font-semibold tracking-tight text-[#252525] sm:text-3xl">
            Conexão bem-sucedida!
          </h2>
          <p className="mt-2 text-sm text-[#666666]">
            Você e <strong className="font-medium text-[#EF5948]">{contact.name}</strong> agora estão conectados.
          </p>
        </div>

        <div
          className="vtx-popup mt-7 w-full max-w-sm rounded-xl border border-[#F1E3DF] bg-white p-5 text-center shadow-[0_10px_30px_rgba(239,89,72,0.18)]"
          aria-hidden={!ready}
        >
          <p className="text-base font-semibold text-[#252525]">Inicie a conversa</p>
          <p className="mt-1 text-xs leading-relaxed text-[#777777]">
            Mande a primeira mensagem para {contact.name} e combinem os próximos passos.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row-reverse">
            <a
              ref={startButton}
              href={chatHref}
              tabIndex={ready ? 0 : -1}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#EF5948] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#dc4b3b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EF5948]"
            >
              <FiMessageSquare aria-hidden="true" /> Enviar mensagem
            </a>
            <button
              type="button"
              onClick={onClose}
              tabIndex={ready ? 0 : -1}
              className="flex-1 rounded-md border border-[#EF5948] px-4 py-2.5 text-xs font-medium text-[#EF5948] transition hover:bg-[#FFF4F1]"
            >
              Agora não
            </button>
          </div>
        </div>
      </div>

      {/* Camada laranja: cobre a tela e recua das margens para o centro, onde a logo se forma. */}
      <div aria-hidden="true" className="vtx-layer pointer-events-none fixed inset-0" style={{ background: ORANGE }} />
    </div>,
    document.body,
  );
}
