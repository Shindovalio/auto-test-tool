import { useState } from "react";
import type { NetworkEvent } from "../../types";

interface Props {
  events: NetworkEvent[];
}

export default function NetworkLog({ events }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (events.length === 0) {
    return <div className="empty-state">No network calls captured.</div>;
  }

  return (
    <div className="network-log">
      {events.map((ev, i) => (
        <div key={i} className="network-row">
          <div
            className="network-summary"
            onClick={() => setExpanded(expanded === i ? null : i)}
          >
            <span className={`method method-${ev.method.toLowerCase()}`}>{ev.method}</span>
            <span className="net-status">{ev.status}</span>
            <span className="net-url">{ev.url}</span>
            <span className="net-time">{new Date(ev.timestamp).toLocaleTimeString()}</span>
          </div>
          {expanded === i && (
            <pre className="network-body">{ev.body || "(empty)"}</pre>
          )}
        </div>
      ))}
    </div>
  );
}
