import ConnectionsPage from "../../components/ConnectionsPage";
import ISidebar from "../../components/ISidebar";

/** Portal do investidor: startups com conexão firmada e avaliação pós-interação (RF10). */
export default function IConections() {
  return <ConnectionsPage sidebar={<ISidebar />} viewer="investor" />;
}
