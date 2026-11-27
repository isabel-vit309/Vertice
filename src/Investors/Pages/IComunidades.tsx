import CommunitiesPage from "../../components/CommunitiesPage";
import ISidebar from "../../components/ISidebar";

/** Comunidades temáticas com startups e investidores (conversa em grupo). */
export default function IComunidades() {
  return <CommunitiesPage sidebar={<ISidebar />} viewer="investor" />;
}
