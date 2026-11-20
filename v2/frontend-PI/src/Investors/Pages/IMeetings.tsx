import MeetingsPage from "../../components/MeetingsPage";
import ISidebar from "../../components/ISidebar";

/** Agenda de reuniões: calendário, convites pendentes, próximas reuniões e histórico. */
export default function IMeetings() {
  return <MeetingsPage sidebar={<ISidebar />} viewer="investor" />;
}
