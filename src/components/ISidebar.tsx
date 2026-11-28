import { FiBriefcase, FiGrid, FiMessageSquare, FiRss, FiUsers } from "react-icons/fi";
import { HiOutlineRocketLaunch, HiOutlineUserGroup } from "react-icons/hi2";
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
  { label: "Timeline", icon: FiRss, href: "/investors/timeline" },
  { label: "Comunidades", icon: HiOutlineUserGroup, href: "/investors/comunidades" },
];

export default function ISidebar() {
  return (
    <PortalSidebar navigation={navigation} home="/investors/startups" loginPath="/investors/login" papel="INVESTIDOR">
      <NewMatchWatcher chatPath="/investors/mensagens" />
    </PortalSidebar>
  );
}
