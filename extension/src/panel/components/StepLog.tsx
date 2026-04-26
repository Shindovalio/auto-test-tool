import type { StepResult } from "../../types";

interface Props {
  results: StepResult[];
}

function statusLabel(status: StepResult["status"]): string {
  if (status === "pass") return "PASS";
  if (status === "fail") return "FAIL";
  return "...";
}

export default function StepLog({ results }: Props) {
  if (results.length === 0) {
    return <div className="empty-state">No steps run yet.</div>;
  }

  return (
    <div className="step-log">
      {results.map((r) => (
        <div key={r.stepIndex} className={`step-row step-${r.status}`}>
          <span className={`badge badge-${r.status}`}>{statusLabel(r.status)}</span>
          <span className="step-index">#{r.stepIndex + 1}</span>
          <span className="step-type">{r.type}</span>
          {r.status !== "running" && (
            <span className="step-duration">{r.duration}ms</span>
          )}
          {r.message && <span className="step-message">{r.message}</span>}
        </div>
      ))}
    </div>
  );
}
