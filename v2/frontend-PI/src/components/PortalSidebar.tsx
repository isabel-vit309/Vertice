// Menu lateral dos portais do investidor e da startup. O botão "Sair" segue o padrão do
// painel administrativo: no rodapé do menu no computador e no fim do menu no celular;
// encerra a sessão e volta para o login do portal.
import { useState } from "react";
import type { ComponentType } from "react";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Logo from "../assests/VerticeLogo.png";
import { clearSession, getSession } from "../services/session";
import type { Papel } from "../services/api";

export type PortalNavItem = { label: string; icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>; href: string };

export default function PortalSidebar({
  navigation,
  home,
  loginPath,
  papel,
  children,
}: {
  navigation: PortalNavItem[];
  /** Destino do logo (página inicial do portal). */
  home: string;
  /** Para onde vai depois de sair. */
  loginPath: string;
  /** O "Sair" só aparece para quem está logado neste portal (não nas telas de cadastro). */
  papel: Papel;
  children?: React.ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const loggedIn = getSession()?.papel === papel;

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(`${href}/`);

  function logout() {
    setIsMobileMenuOpen(false);
    clearSession();
    navigate(loginPath, { replace: true });
  }

  const links = (mobile = false) =>
    navigation.map(({ label, icon: Icon, href }) => {
      const active = isActive(href);
      return (
        <Link
          key={label}
          to={href}
          aria-current={active ? "page" : undefined}
          onClick={() => mobile && setIsMobileMenuOpen(false)}
          className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[11px] transition hover:bg-[#FFF2EF] hover:text-[#EF5948] ${
            active ? "bg-[#FFF7F5] font-medium text-[#EF5948]" : "text-[#777777]"
          }`}
        >
          <Icon size={14} aria-hidden={true} />
          {label}
        </Link>
      );
    });

  const logoutControl = (mobile = false) =>
    loggedIn && (
      <button
        type="button"
        onClick={logout}
        className={
          mobile
            ? "flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-[11px] text-[#777777] transition hover:bg-[#FFF2EF] hover:text-[#EF5948]"
            : "absolute bottom-6 left-6 flex items-center gap-2.5 text-[11px] text-[#777777] transition hover:text-[#EF5948]"
        }
      >
        <FiLogOut size={14} aria-hidden="true" /> Sair
      </button>
    );

  return (
    <div>
      <div className="border-b border-[#EAEAEA] bg-white md:hidden">
        <div className="flex min-h-16 items-center justify-between px-4">
          <Link to={home} aria-label="Vértice — página inicial" className="flex items-center">
            <img src={Logo} alt="Vértice — página inicial" className="h-9 w-auto" />
          </Link>
          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-md text-[#555555] hover:bg-[#FFF2EF] hover:text-[#EF5948] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#EF5948]"
          >
            {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <nav aria-label="Menu principal" className="space-y-1 border-t border-[#F0F0F0] px-3 py-3">
            {links(true)}
            {logoutControl(true)}
          </nav>
        )}
      </div>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-48 border-r border-[#EAEAEA] bg-white md:block">
        <Link to={home} aria-label="Vértice — página inicial" className="flex flex-col items-center px-4 pb-7 pt-7">
          <img src={Logo} alt="Vértice — página inicial" className="h-10 w-auto object-contain" />
        </Link>
        <nav aria-label="Menu principal" className="space-y-1 px-3">
          {links()}
        </nav>
        {logoutControl()}
      </aside>
      {children}
    </div>
  );
}
