import { useState } from "react";
import {
  FiBriefcase,
  FiGrid,
  FiMenu,
  FiMessageSquare,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import { IoInfinite } from "react-icons/io5";
import { useLocation } from "react-router-dom";

import Logo from "../assests/VerticeLogo.png";

export default function ISidebar() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigation = [
    { label: "Perfil", icon: FiUsers, href: "/investors/perfil" },
    { label: "Startups", icon: HiOutlineRocketLaunch, href: "/investors/startups" },
    { label: "Matching", icon: FiGrid, href: "/investors/matching" },
    { label: "Mensagens", icon: FiMessageSquare, href: "/investors/mensagens" },
    { label: "Reuniões", icon: FiBriefcase, href: "/investors/meetings" },
    { label: "Conexões", icon: IoInfinite, href: "/investors/conections" },
  ];

  const isActive = (href: string) =>
    location.pathname === href || location.pathname.startsWith(`${href}/`);

  const links = (mobile = false) =>
    navigation.map(({ label, icon: Icon, href }) => {
      const active = isActive(href);

      return (
        <a
          key={label}
          href={href}
          aria-current={active ? "page" : undefined}
          onClick={() => mobile && setIsMobileMenuOpen(false)}
          className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[11px] transition hover:bg-[#FFF2EF] hover:text-[#EF5948] ${
            active
              ? "bg-[#FFF7F5] font-medium text-[#EF5948]"
              : "text-[#777777]"
          }`}
        >
          <Icon size={14} aria-hidden="true" />
          {label}
        </a>
      );
    });

  return (
    <div>
      <div className="border-b border-[#EAEAEA] bg-white md:hidden">
        <div className="flex min-h-16 items-center justify-between px-4">
          <a
            href="/painel"
            aria-label="Vértice — página inicial"
            className="flex items-center"
          >
            <img src={Logo} alt="Vértice — página inicial" className="h-9 w-auto" />
          </a>
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
          </nav>
        )}
      </div>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-48 border-r border-[#EAEAEA] bg-white md:block">
        <a
          href="/painel"
          aria-label="Vértice — página inicial"
          className="flex flex-col items-center px-4 pb-7 pt-7"
        >
          <img src={Logo} alt="Vértice — página inicial" className="h-10 w-auto object-contain" />
        </a>
        <nav aria-label="Menu principal" className="space-y-1 px-3">
          {links()}
        </nav>
      </aside>
    </div>
  );
}
