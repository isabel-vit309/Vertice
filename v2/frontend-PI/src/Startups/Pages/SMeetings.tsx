import MeetingsPage from "../../components/MeetingsPage";
import SSidebar from "../../components/SSidebar";

/** Agenda de reuniões: calendário, convites pendentes, próximas reuniões e histórico. */
export default function SMeetings() {
  return <MeetingsPage sidebar={<SSidebar />} viewer="startup" />;
}
