import { useEffect, useState } from "react";
import Logo from "./assests/VerticeLogo.png";
import ImageOne from "./assests/Image-One.png";
import ImageTwo from "./assests/Image-Two.png";
import ImageThree from "./assests/Image-Three.png";
import ImageFour from "./assests/Image-Four.png";
import VideoChat from "./assests/vertice-chat-reuniao.mp4";

const LandingPage: React.FC = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (!openDropdown) return;
    const wrapper = document.getElementById(openDropdown);
    function closeOutside(event: Event) {
      if (event.target instanceof Node && !wrapper?.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        wrapper?.querySelector("button")?.focus();
      }
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("focusin", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("focusin", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [openDropdown]);

  return (
    <div
      id="vertice-landing"
      lang="pt-BR"
      className="
        isolate w-full max-w-none overflow-x-clip bg-white text-left
        font-sans text-[#241e1b] antialiased selection:bg-orange-200
        [#root:has(&)]:m-0 [#root:has(&)]:w-full
        [#root:has(&)]:max-w-none [#root:has(&)]:p-0
        [body:has(&)]:m-0 [body:has(&)]:block
        [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2
        [&_a:focus-visible]:outline-offset-4
        [&_a:focus-visible]:outline-[#a53c23]
      "
    >
      <div className="relative z-10 bg-white h-16 flex items-center md:mt-3 md:h-24">
        {" "}
        <div className="mx-auto flex min-h-16 w-full max-w-[96rem] items-center justify-between gap-3 md:gap-20 px-[clamp(1.25rem,4.5vw,4.5rem)] py-2">
          <a
            href="#inicio"
            aria-label="Vértice — início"
            className="shrink-0 rounded-md min-[1800px]:invisible"
          ></a>
          <nav
            aria-label="Navegação principal"
            className="flex shrink-0 items-center gap-3 text-sm sm:gap-6"
          >
            <a
              href="#como-funciona"
              className="hidden text-lg text-neutral-600 transition-colors hover:text-orange-800 md:inline"
            >
              Como funciona
            </a>
            <a
              href="#matching"
              className="hidden text-lg text-neutral-600 transition-colors hover:text-orange-800 md:inline"
            >
              Matching
            </a>
            <div id="entrar-topo" className="relative">
              <button
                type="button"
                className="text-lg font-medium text-[#EF5948] transition-colors hover:text-orange-800 hidden md:inline"
                aria-expanded={openDropdown === "entrar-topo"}
                aria-controls="entrar-topo-opcoes"
                onClick={() =>
                  setOpenDropdown((current) =>
                    current === "entrar-topo" ? null : "entrar-topo",
                  )
                }
              >
                Entrar
              </button>
              <div
                id="entrar-topo-opcoes"
                hidden={openDropdown !== "entrar-topo"}
                className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-[#ebe5df] bg-white p-1 text-left text-sm font-medium text-[#302722] shadow-lg"
              >
                <a
                  href="/investors/login"
                  className="block rounded-lg px-3 py-3 hover:bg-[#fff2ed] focus-visible:bg-[#fff2ed]"
                >
                  Investidores
                </a>
                <a
                  href="/startups/login"
                  className="block rounded-lg px-3 py-3 hover:bg-[#fff2ed] focus-visible:bg-[#fff2ed]"
                >
                  Startups
                </a>
              </div>
            </div>
            <div id="cadastro-topo" className="relative">
              <button
                type="button"
                className="min-h-11 items-center justify-center rounded-xl bg-[#EF5948] px-4 font-semibold text-base text-white transition-colors hover:bg-[#9f301b] hidden md:inline"
                aria-expanded={openDropdown === "cadastro-topo"}
                aria-controls="cadastro-topo-opcoes"
                onClick={() =>
                  setOpenDropdown((current) =>
                    current === "cadastro-topo" ? null : "cadastro-topo",
                  )
                }
              >
                Criar perfil
              </button>
              <div
                id="cadastro-topo-opcoes"
                hidden={openDropdown !== "cadastro-topo"}
                className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-[#ebe5df] bg-white p-1 text-left text-sm font-medium text-[#302722] shadow-lg"
              >
                <a
                  href="/investors/register"
                  className="block rounded-lg px-3 py-3 hover:bg-[#fff2ed] focus-visible:bg-[#fff2ed]"
                >
                  Investidores
                </a>
                <a
                  href="/startups/register"
                  className="block rounded-lg px-3 py-3 hover:bg-[#fff2ed] focus-visible:bg-[#fff2ed]"
                >
                  Startups
                </a>
              </div>
            </div>
          </nav>
        </div>
      </div>
      <main className="w-full max-w-none">
        <section
          id="inicio"
          aria-labelledby="titulo-principal"
          className="relative isolate overflow-hidden bg-white bg-[linear-gradient(158deg,white_64%,#fff8f2_64.2%,white_94%)] "
        >
          <div className="relative mx-auto grid min-h-[calc(100svh_-_4rem)] md:min-h-[calc(100svh_-_6.75rem)] max-w-[96rem] grid-rows-[auto_auto_1fr] px-[clamp(1.25rem,4.5vw,4.5rem)] pt-3 md:grid-cols-[0.95fr_1.05fr] md:pt-0">
            <p
              aria-hidden="true"
              className="pointer-events-none select-none whitespace-nowrap text-[20vw] font-black leading-none tracking-[-0.065em] text-[#fa4813] md:col-span-2 md:col-start-1 md:row-start-1 md:text-[min(15vw,14.4rem)]"
            >
              VÉRTICE
            </p>
            <div className="relative z-10 min-w-0 pb-3 pt-2 md:col-start-1 md:row-start-2 md:pb-12">
              <h1
                id="titulo-principal"
                className="max-w-[18ch] text-[clamp(2rem,3.5vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.05em] text-[#9e3015]"
              >
                Onde startups e investidores-anjo se encontram.
              </h1>
              <p className="mt-4 max-w-[44ch] text-base leading-relaxed text-[#883018] lg:text-lg">
                Descubra afinidades por segmento, estágio e faixa de
                investimento.
              </p>
              <div className="mt-5 flex flex-wrap gap-3 max-sm:[&>a]:grow">
                <a
                  href="/investors/register"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[#d74113] bg-white px-5 text-sm font-bold text-[#9e3015] transition-colors hover:bg-[#fff2e9]"
                >
                  Sou investidor-anjo
                </a>
                <a
                  href="/startups/register"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[#EF5948] bg-[#EF5948] px-5 text-sm font-bold text-white transition-colors hover:bg-[#992c09]"
                >
                  Sou uma startup
                </a>
              </div>
            </div>
            <img
              src={ImageOne}
              alt="Dois profissionais em retratos conectados pela fita laranja do Vértice."
              decoding="async"
              className="relative z-[1] origin-bottom scale-110  lg:scale-140 xl:scale-160 mx-auto block h-auto w-full max-w-lg self-end object-contain object-bottom md:col-start-2 md:absolute md:bottom-0 md:col-end-3 md:row-start-1 md:row-end-4 md:mx-0 md:w-full min-[1800px]:w-[118%] md:max-w-none md:justify-self-center"
            />
          </div>
        </section>
        <section
          id="como-funciona"
          aria-labelledby="titulo-afinidade"
          className="
            w-full scroll-mt-4 border-y border-[#ebe5df]
            bg-[#FEEFE9]
            md:bg-[radial-gradient(ellipse_32%_62%_at_75%_54%,#ff9b5033_0%,transparent_100%)]
          "
        >
          <div className="mx-auto grid w-full max-w-[96rem] items-center gap-7 px-[clamp(1.25rem,4.5vw,4.5rem)] py-[clamp(2.5rem,3.8vw,3.75rem)] lg:grid-cols-2 lg:gap-12 min-[1800px]:mt-42">
            <div className="min-[1800px]:-mt-32">
              <h2
                id="titulo-afinidade"
                className="max-w-[24ch] text-balance font-semibold leading-[1.13] tracking-[-0.045em] text-[clamp(1.85rem,3.15vw,3rem)]"
              >
                Encontre startups alinhadas à sua tese.
              </h2>
              <p className="mt-3.5 max-w-[52ch] text-lg leading-[1.65] text-[#635c56]">
                O Vértice compara os critérios do investidor com o perfil da
                startup e mostra por que os dois combinam.
              </p>
              <dl className="mt-6 grid max-w-xl grid-cols-3 gap-3 border-t border-[#ded7d0] pt-4">
                <div>
                  <dt className="text-base sm:text-lg font-semibold">
                    Segmento
                  </dt>
                  <dd className="mt-1 text-sm leading-5 text-[#635c56] sm:text-sm">
                    Setores de interesse
                  </dd>
                </div>
                <div>
                  <dt className="text-base sm:text-lg font-semibold">
                    Estágio
                  </dt>
                  <dd className="mt-1 text-sm leading-5 text-[#635c56] sm:text-sm">
                    Fase do negócio
                  </dd>
                </div>
                <div>
                  <dt className="text-base sm:text-lg font-semibold">Ticket</dt>
                  <dd className="mt-1 text-sm leading-5 text-[#635c56] sm:text-sm">
                    Faixa de investimento
                  </dd>
                </div>
              </dl>
            </div>
            <div className="flex min-w-0 justify-center min-[1800px]:mb-20">
              <img
                src={ImageTwo}
                alt="Celular dobrável flutuando sobre um palco iluminado em laranja. Na tela, a EventoPro tem 82% de afinidade, atua em SaaS, está em ideação e busca de R$ 60 mil a R$ 150 mil."
                loading="lazy"
                decoding="async"
                className="block h-auto w-full max-w-[38rem] object-contain [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)] min-[1800px]:scale-150"
              />
            </div>
          </div>
        </section>
        <section
          id="matching"
          aria-labelledby="titulo-matching"
          className="
            w-full scroll-mt-4 bg-white
            bg-white
          "
        >
          <div className="mx-auto grid w-full max-w-[96rem] items-center gap-7 px-[clamp(1.25rem,4.5vw,4.5rem)] py-[clamp(2.5rem,3.8vw,3.75rem)] lg:grid-cols-2 lg:gap-12 min-[1800px]:mt-32">
            <div className="lg:order-2">
              <h2
                id="titulo-matching"
                className="max-w-[24ch] text-[clamp(1.85rem,3.15vw,3rem)] font-semibold leading-[1.13] tracking-[-0.045em]"
              >
                Quando o interesse é mútuo, a conversa começa.
              </h2>
              <p className="mt-3.5 max-w-[52ch] text-lg  leading-[1.65] text-[#635c56]">
                Depois que a conexão é aceita, startup e investidor podem trocar
                mensagens e combinar os próximos passos dentro do Vértice.
              </p>
            </div>
            <div className="flex min-w-0 justify-center lg:order-1 min-[1800px]:mt-24">
              <img
                src={ImageThree}
                alt="Conexão confirmada entre a startup EduSaúde e a investidora-anjo Isabel Alves."
                loading="lazy"
                decoding="async"
                className="block h-auto max-h-[clamp(17rem,32vw,33rem)] min-[1800px]:max-h-72 w-auto max-w-full rounded-2xl object-contain min-[1800px]:scale-240"
              />
            </div>
          </div>
        </section>
        <section
          aria-labelledby="titulo-startups"
          className="w-full bg-white bg-[radial-gradient(ellipse_48%_62%_at_73%_63%,#ff945220_0%,transparent_100%)]"
        >
          <div className="mx-auto grid w-full max-w-[96rem] items-center gap-7 px-[clamp(1.25rem,4.5vw,4.5rem)] py-[clamp(2.5rem,3.8vw,3.75rem)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:gap-10 min-[1800px]:mt-58 min-[1800px]:mb-30">
            <div>
              <h2
                id="titulo-startups"
                className="max-w-[24ch] text-balance text-[clamp(1.85rem,3.15vw,3rem)] font-semibold leading-[1.13] tracking-[-0.045em]"
              >
                Explore as startups.
              </h2>
              <p className="mt-3.5 max-w-[52ch] text-lg leading-[1.65] text-[#635c56]">
                No diretório do Vértice, você pode buscar empresas por nome e
                filtrar por segmento, estágio ou localização.
              </p>
            </div>
            <div
              role="region"
              aria-label="Diretório de startups com rolagem horizontal em telas pequenas"
              tabIndex={0}
              className="min-w-0 overflow-x-auto rounded-2xl border border-[#e7e1db] bg-white shadow-[0_10px_30px_-24px_rgba(74,44,28,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a53c23]"
            >
              <img
                src={ImageFour}
                alt="Diretório com TeleSertão, VitaRural e ClinGest e filtros de segmento, estágio e localização."
                loading="lazy"
                decoding="async"
                className="block h-auto w-full min-w-[640px]"
              />
            </div>
          </div>
        </section>
        <section
          aria-labelledby="titulo-reuniao"
          className="
            w-full border-y border-[#ebe5df] bg-[#faf9f7]
            bg-[radial-gradient(ellipse_65%_40%_at_51%_72%,#fb824821_0%,transparent_100%)]
            lg:bg-[radial-gradient(ellipse_46%_65%_at_72%_59%,#fb824828_0%,transparent_100%)]
          "
        >
          <div className="mx-auto grid w-full max-w-[96rem] items-center gap-7 px-[clamp(1.25rem,4.5vw,4.5rem)] py-[clamp(2.5rem,3.8vw,3.75rem)] lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)] lg:gap-10 min-[1800px]:mt-32 min-[1800px]:mb-24">
            <div>
              <h2
                id="titulo-reuniao"
                className="max-w-[24ch] text-balance text-[clamp(1.85rem,3.15vw,3rem)] font-semibold leading-[1.13] tracking-[-0.045em]"
              >
                Da primeira mensagem à reunião.
              </h2>
              <p className="mt-3.5 max-w-[52ch] text-lg leading-[1.65] text-[#635c56]">
                Tire dúvidas pelo chat, envie um convite e acompanhe a reunião
                na agenda.
              </p>
            </div>
            <div className="mx-auto w-full min-w-0 max-w-[360px] sm:max-w-[760px]">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                className="pointer-events-none select-none w-full h-auto min-[1800px]:scale-125"
              >
                <source src={VideoChat} type="video/mp4" />
              </video>
            </div>
          </div>
        </section>
        <section
          id="criar-perfil"
          aria-labelledby="titulo-perfis"
          className="w-full scroll-mt-4 bg-white"
        >
          <div className="mx-auto w-full max-w-[96rem] px-[clamp(1.25rem,4.5vw,4.5rem)] py-[clamp(2.5rem,3.8vw,3.75rem)] min-[1800px]:mt-22 min-[1800px]:mb-18">
            <h2
              id="titulo-perfis"
              className="max-w-[24ch] text-balance text-[clamp(1.85rem,3.15vw,3rem)] font-semibold leading-[1.13] tracking-[-0.045em]"
            >
              Dois perfis, dois pontos de partida.
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <article className="flex flex-col items-start rounded-2xl border border-[#e7e1db] bg-[#faf9f7] p-5 sm:p-6 min-[1800px]:mt-10">
                <h3 className="text-lg font-semibold tracking-tight">
                  Para investidores-anjo
                </h3>
                <p className="mb-5 mt-2 max-w-[55ch] flex-1 text-sm leading-6 text-[#635c56]">
                  Defina os setores, estágios e valores que fazem sentido para
                  sua tese. Conheça as startups que atendem a esses critérios e
                  escolha com quem conversar.
                </p>
                <a
                  href="/investors/register"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d9d0c8] bg-white px-4 text-sm font-semibold text-[#302722] transition-colors hover:border-[#cf907e] hover:bg-[#fff7f2]"
                >
                  Criar perfil de investidor
                </a>
              </article>
              <article className="flex flex-col items-start rounded-2xl border border-[#efdbcf] bg-[#fff5ef] p-5 sm:p-6 min-[1800px]:mt-10">
                <h3 className="text-lg font-semibold tracking-tight">
                  Para startups
                </h3>
                <p className="mb-5 mt-2 max-w-[55ch] flex-1 text-sm leading-6 text-[#635c56]">
                  Apresente sua solução, o estágio da empresa e o valor que
                  busca captar. Seu perfil ajuda investidores a entender o
                  negócio antes da primeira conversa.
                </p>
                <a
                  href="/startups/register"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#d9d0c8] bg-white px-4 text-sm font-semibold text-[#302722] transition-colors hover:border-[#cf907e] hover:bg-[#fff7f2]"
                >
                  Criar perfil da startup
                </a>
              </article>
            </div>
          </div>
        </section>
        <section
          aria-labelledby="titulo-final"
          className="w-full bg-[#af371f] bg-[radial-gradient(ellipse_at_85%_110%,#f87842_0%,transparent_48%)] text-white"
        >
          <div className="mx-auto flex w-full max-w-[96rem] flex-col items-start justify-between gap-5 px-[clamp(1.25rem,4.5vw,4.5rem)] py-8 sm:flex-row sm:items-center sm:py-10">
            <h2
              id="titulo-final"
              className="text-[clamp(1.6rem,2.3vw,2.3rem)] font-semibold leading-tight tracking-[-0.045em]"
            >
              Quem você quer conhecer?
            </h2>
            <a
              href="#inicio"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#302722] transition-colors hover:bg-orange-50"
            >
              Escolher meu perfil
            </a>
          </div>
        </section>
      </main>
      <footer className="w-full bg-white">
        <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-4 px-[clamp(1.25rem,4.5vw,4.5rem)] py-6 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <a
            href="#inicio"
            aria-label="Vértice — voltar ao início"
            className="w-fit rounded-md"
          >
            <img
              src={Logo}
              alt="Vértice"
              loading="lazy"
              className="block h-9 w-auto max-w-[100px] object-contain object-left"
            />
          </a>
          <nav
            aria-label="Navegação do rodapé"
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#635c56]"
          >
            <a
              href="#como-funciona"
              className="transition-colors hover:text-orange-800"
            >
              Como funciona
            </a>
            <a
              href="#matching"
              className="transition-colors hover:text-orange-800"
            >
              Matching
            </a>
            <div id="entrar-rodape" className="relative">
              <button
                type="button"
                className="transition-colors hover:text-orange-800"
                aria-expanded={openDropdown === "entrar-rodape"}
                aria-controls="entrar-rodape-opcoes"
                onClick={() =>
                  setOpenDropdown((current) =>
                    current === "entrar-rodape" ? null : "entrar-rodape",
                  )
                }
              >
                Entrar
              </button>
              <div
                id="entrar-rodape-opcoes"
                hidden={openDropdown !== "entrar-rodape"}
                className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-[#ebe5df] bg-white p-1 text-left text-sm font-medium text-[#302722] shadow-lg"
              >
                <a
                  href="/investors/login"
                  className="block rounded-lg px-3 py-3 hover:bg-[#fff2ed] focus-visible:bg-[#fff2ed]"
                >
                  Investidores
                </a>
                <a
                  href="/startups/login"
                  className="block rounded-lg px-3 py-3 hover:bg-[#fff2ed] focus-visible:bg-[#fff2ed]"
                >
                  Startups
                </a>
              </div>
            </div>
          </nav>
          <p className="text-xs text-neutral-500">
            © {new Date().getFullYear()} Vértice
          </p>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
