import { FiBriefcase, FiGrid, FiMessageSquare, FiUsers } from "react-icons/fi";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { IoInfinite } from "react-icons/io5";

import PortalSidebar from "./PortalSidebar";

const navigation = [
  { label: "Perfil", icon: FiUsers, href: "/startups/perfil" },
  { label: "Matching", icon: FiGrid, href: "/startups/matching" },
  { label: "Mensagens", icon: FiMessageSquare, href: "/startups/mensagens" },
  { label: "Reuniões", icon: FiBriefcase, href: "/startups/meetings" },
  { label: "Conexões", icon: IoInfinite, href: "/startups/conections" },
  { label: "Comunidades", icon: HiOutlineUserGroup, href: "/startups/comunidades" },
];

export default function SSidebar() {
  return <PortalSidebar navigation={navigation} home="/startups/perfil" loginPath="/startups/login" papel="STARTUP" />;
}
