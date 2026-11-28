import SSidebar from "../../components/SSidebar";
import TimelinePage from "../../components/timeline/TimelinePage";

/** Timeline de publicações de startups e investidores. */
export default function STimeline() {
  return <TimelinePage sidebar={<SSidebar />} viewer="startup" />;
}
