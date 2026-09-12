import {
  FiBriefcase,
  FiFileText,
  FiGrid,
  FiMessageSquare,
  FiUsers,
} from "react-icons/fi";

import Logo from "../assests/VerticeLogo.png"

export default function SSidebar() {
  const navigation = [
    { label: "Perfil", icon: FiUsers, href: "/startups/perfil" },
    { label: "Matching", icon: FiGrid, href: "/startups/matching" },
    { label: "Mensagens", icon: FiMessageSquare, href: "/startups/mensagens" },
    { label: "Reuniões", icon: FiBriefcase, href: "/startups/meetings" },
    { label: "Conexões", icon: FiFileText, href: "/startups/conections" },
  ];

  return (
    <div>
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-48 border-r border-[#EAEAEA] bg-white md:block">
        <a
          href="/painel"
          aria-label="Vértice — página inicial"
          className="flex flex-col items-center px-4 pb-7 pt-7"
        >
          <img
            src={Logo}
            alt="Vértice — página inicial"
            className="h-10 w-auto object-contain"
          />
        </a>

        <nav aria-label="Menu principal" className="space-y-1 px-3">
          {navigation.map(({ label, icon: Icon, href }) => (
            <a
              key={label}
              href={href}
              className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-[11px] text-[#777777] transition hover:bg-[#FFF2EF] hover:text-[#EF5948]"
            >
              <Icon size={14} aria-hidden="true" />
              {label}
            </a>
          ))}
        </nav>
      </aside>
    </div>
  );
}
