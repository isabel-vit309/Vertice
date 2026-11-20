import { FiBriefcase, FiGrid, FiMessageSquare, FiUsers } from "react-icons/fi";
import { HiOutlineRocketLaunch } from "react-icons/hi2";
import { IoInfinite } from "react-icons/io5";

import NewMatchWatcher from "./NewMatchWatcher";
import PortalSidebar from "./PortalSidebar";

const navigation = [
  { label: "Perfil", icon: FiUsers, href: "/investors/perfil" },
  { label: "Startups", icon: HiOutlineRocketLaunch, href: "/investors/startups" },
  { label: "Matching", icon: FiGrid, href: "/investors/matching" },
  { label: "Mensagens", icon: FiMessageSquare, href: "/investors/mensagens" },
  { label: "Reuniões", icon: FiBriefcase, href: "/investors/meetings" },
  { label: "Conexões", icon: IoInfinite, href: "/investors/conections" },
];

export default function ISidebar() {
  return (
    <PortalSidebar navigation={navigation} home="/investors/startups" loginPath="/investors/login" papel="INVESTIDOR">
      <NewMatchWatcher chatPath="/investors/mensagens" />
    </PortalSidebar>
  );
}
