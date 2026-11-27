import CommunitiesPage from "../../components/CommunitiesPage";
import SSidebar from "../../components/SSidebar";

/** Comunidades temáticas com startups e investidores (conversa em grupo). */
export default function SComunidades() {
  return <CommunitiesPage sidebar={<SSidebar />} viewer="startup" />;
}
