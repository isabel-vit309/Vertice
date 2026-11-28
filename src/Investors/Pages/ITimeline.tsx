import ISidebar from "../../components/ISidebar";
import TimelinePage from "../../components/timeline/TimelinePage";

/** Timeline de publicações de startups e investidores. */
export default function ITimeline() {
  return <TimelinePage sidebar={<ISidebar />} viewer="investor" />;
}
