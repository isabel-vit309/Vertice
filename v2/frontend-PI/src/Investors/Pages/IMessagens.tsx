import ChatPage from "../../components/ChatPage";
import ISidebar from "../../components/ISidebar";

/** Mensagens com as conexões firmadas (RF05), com convite para reunião. */
export default function IMensagens() {
  return <ChatPage sidebar={<ISidebar />} viewer="investor" />;
}
