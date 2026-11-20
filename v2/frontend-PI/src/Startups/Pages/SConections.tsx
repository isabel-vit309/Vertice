import ConnectionsPage from "../../components/ConnectionsPage";
import SSidebar from "../../components/SSidebar";

/** Portal da startup: investidores com conexão firmada e avaliação pós-interação (RF10). */
export default function SConections() {
  return <ConnectionsPage sidebar={<SSidebar />} viewer="startup" />;
}
