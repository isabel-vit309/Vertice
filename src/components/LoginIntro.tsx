// Animação de entrada após o login (mesma linguagem da animação de match): a tela fica
// laranja, o laranja recua das margens até o centro, o símbolo do Vértice se forma do
// centro para as pontas com brilho e o sistema abre por baixo enquanto a camada some.
//
// A camada é montada fora da árvore de rotas, então continua visível durante a navegação
// para a página inicial e só sai depois que ela já entrou.
import { createRoot } from "react-dom/client";

import { VerticeSymbol } from "./MatchCelebration";
import { prefersReducedMotion } from "./motion";

const ORANGE = "#EF5948";
/** Momento em que a logo está formada e a navegação pode acontecer. */
const NAVIGATE_AT_MS = 1650;
/** Duração do fade final, já com a página nova por baixo. */
const FADE_OUT_MS = 450;

const styles = `
@keyframes li-fill { from { opacity: 0 } to { opacity: 1 } }
@keyframes li-recede {
  from { clip-path: circle(150vmax at 50% 50%); }
  to   { clip-path: circle(0px at 50% 50%); }
}
@keyframes li-stroke { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
@keyframes li-glow { 0% { opacity: 0; } 35% { opacity: .7; } 100% { opacity: .25; } }
@keyframes li-halo { 0% { opacity: 0; transform: scale(.2); } 50% { opacity: .8; } 100% { opacity: .3; transform: scale(1.3); } }
@keyframes li-grow { from { transform: scale(.88); } to { transform: scale(1); } }
@keyframes li-out { to { opacity: 0; visibility: hidden; } }
.li-root { position: fixed; inset: 0; z-index: 200; display: flex; align-items: center; justify-content: center; background: #fff; }
.li-root.li-leaving { animation: li-out ${FADE_OUT_MS}ms ease-in forwards; }
.li-layer { position: absolute; inset: 0; background: ${ORANGE};
  animation: li-fill .18s ease-out both, li-recede .75s cubic-bezier(.7,0,.25,1) .25s both; }
.li-logo { position: relative; animation: li-grow .8s cubic-bezier(.2,.8,.2,1) .95s both; }
.li-logo .vtx-draw path { stroke-dasharray: 1; animation: li-stroke .7s cubic-bezier(.33,0,.2,1) .95s both; }
.li-logo .vtx-glow { animation: li-glow 1.2s ease-out .95s both; }
.li-halo { position: absolute; inset: -35%; border-radius: 9999px; pointer-events: none;
  background: radial-gradient(closest-side, rgba(239,89,72,.28), rgba(239,89,72,.1) 55%, transparent 75%);
  animation: li-halo 1.1s ease-out .95s both; }
`;

function Intro() {
  return (
    <div className="li-root" role="status" aria-label="Entrando no Vértice">
      <style>{styles}</style>
      <div className="li-logo">
        <div className="li-halo" aria-hidden="true" />
        <VerticeSymbol animated className="relative h-auto w-[min(46vw,200px)]" />
      </div>
      <div className="li-layer" aria-hidden="true" />
    </div>
  );
}

let running = false;

/**
 * Toca a animação e resolve quando a logo está formada: chame `navigate()` em seguida.
 * A camada sai sozinha logo depois. Com "reduzir movimento", resolve na hora.
 */
export function playLoginIntro(): Promise<void> {
  if (prefersReducedMotion() || running || typeof document === "undefined") return Promise.resolve();
  running = true;
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  root.render(<Intro />);

  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve();
      // Dá um quadro para a página nova montar por baixo antes do fade.
      window.setTimeout(() => {
        host.querySelector(".li-root")?.classList.add("li-leaving");
        window.setTimeout(() => {
          root.unmount();
          host.remove();
          running = false;
        }, FADE_OUT_MS + 50);
      }, 120);
    }, NAVIGATE_AT_MS);
  });
}
