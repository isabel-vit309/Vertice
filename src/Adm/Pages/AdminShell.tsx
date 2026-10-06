import { type ReactNode, useState } from "react";
import {
  FiActivity,
  FiBarChart2,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import Logo from "../../assests/VerticeLogo.png";

export default function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated =
    sessionStorage.getItem("adm-authenticated") === "true";

  function logout() {
    sessionStorage.removeItem("adm-authenticated");
    navigate("/adm/login");
  }

  const navigation = [
    { label: "Visão geral", icon: FiGrid, href: "/adm#visao-geral", path: "/adm" },
    { label: "Métricas", icon: FiBarChart2, href: "/adm/metricas", path: "/adm/metricas" },
    { label: "Log de auditoria", icon: FiActivity, href: "/adm/auditoria", path: "/adm/auditoria" },
  ];

  const navLinks = (mobile = false) =>
    navigation.map(({ label, icon: Icon, href, path }) => {
      const active = location.pathname === path;
      return (
        <a
          key={label}
          href={href}
          aria-current={active ? "page" : undefined}
          onClick={() => mobile && setIsMobileMenuOpen(false)}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-[#FFF1EE] hover:text-[#EF5948] ${
            active
              ? "bg-[#FFF7F5] font-medium text-[#EF5948]"
              : "text-[#707070]"
          }`}
        >
          <Icon size={17} aria-hidden="true" />
          {label}
        </a>
      );
    });

  const logoutControl = (mobile = false) => (
    <button
      type="button"
      onClick={() => {
        setIsMobileMenuOpen(false);
        logout();
      }}
      className={mobile
        ? "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#777777] transition hover:bg-[#FFF1EE] hover:text-[#EF5948]"
        : "absolute bottom-6 left-7 flex items-center gap-3 text-sm text-[#777777] hover:text-[#EF5948]"}
    >
      <FiLogOut size={17} /> Sair
    </button>
  );

  if (!isAuthenticated) {
    return <Navigate to="/adm/login" replace />;
  }

  return (
    <div
      className="min-h-screen bg-[#F5F8FA] text-[#252525]"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      <div className="border-b border-[#E5E7EB] bg-white md:hidden">
        <div className="flex min-h-16 items-center justify-between px-4">
          <a
            href="/adm"
            aria-label="Vértice — painel administrativo"
            className="flex items-center"
          >
            <img
              src={Logo}
              alt="Vértice — painel administrativo"
              className="h-9 w-auto"
            />
          </a>
          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[#555555] hover:bg-[#FFF1EE] hover:text-[#EF5948]"
          >
            {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <nav
            aria-label="Menu administrativo"
            className="space-y-1 border-t border-[#F0F0F0] px-3 py-3"
          >
            {navLinks(true)}
            {logoutControl(true)}
          </nav>
        )}
      </div>

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-[#E5E7EB] bg-white px-4 py-6 md:block">
        <a
          href="/adm"
          aria-label="Vértice — painel administrativo"
          className="flex flex-col items-center px-4 pb-7 pt-1"
        >
          <img
            src={Logo}
            alt="Vértice — painel administrativo"
            className="h-10 w-auto object-contain"
          />
        </a>
        <nav aria-label="Menu administrativo" className="space-y-1 px-3">
          {navLinks()}
        </nav>
        {logoutControl()}
      </aside>

      <main className="md:ml-64">{children}</main>
    </div>
  );
}
