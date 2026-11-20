import ChatPage from "../../components/ChatPage";
import SSidebar from "../../components/SSidebar";

/** Mensagens com as conexões firmadas (RF05). */
export default function SMensagens() {
  return <ChatPage sidebar={<SSidebar />} viewer="startup" />;
}
