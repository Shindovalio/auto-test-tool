import type { TestDefinition, StepResult, NetworkEvent } from "../../types";
import StepLog from "./StepLog";
import NetworkLog from "./NetworkLog";

interface Props {
  test: TestDefinition;
  stepResults: StepResult[];
  networkEvents: NetworkEvent[];
  runStatus: "idle" | "running" | "pass" | "fail";
  onRun: () => void;
}

export default function TestRunner({ test, stepResults, networkEvents, runStatus, onRun }: Props) {
  return (
    <div className="test-runner">
      <div className="runner-header">
        <h2 className="test-title">{test.name}</h2>
        <div className="runner-controls">
          {runStatus !== "idle" && (
            <span className={`run-badge run-badge-${runStatus}`}>
              {runStatus.toUpperCase()}
            </span>
          )}
          <button
            className="btn-run"
            onClick={onRun}
            disabled={runStatus === "running"}
          >
            {runStatus === "running" ? "Running…" : "▶ Run"}
          </button>
        </div>
      </div>

      <div className="runner-steps">
        <h3 className="section-label">Steps</h3>
        <div className="step-definitions">
          {test.steps.map((s, i) => (
            <div key={i} className="step-def">
              <span className="step-def-index">#{i + 1}</span>
              <span className="step-def-type">{s.type}</span>
              {"selector" in s && (
                <code className="step-def-selector">{s.selector}</code>
              )}
              {"expected" in s && (
                <span className="step-def-extra">→ "{s.expected}"</span>
              )}
              {"value" in s && (
                <span className="step-def-extra">→ "{s.value}"</span>
              )}
              {"urlPattern" in s && (
                <code className="step-def-selector">{s.urlPattern}</code>
              )}
              {"expectedStatus" in s && (
                <span className="step-def-extra">status {s.expectedStatus}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {stepResults.length > 0 && (
        <div className="runner-results">
          <h3 className="section-label">Run Log</h3>
          <StepLog results={stepResults} />
        </div>
      )}

      <div className="runner-network">
        <h3 className="section-label">Network ({networkEvents.length})</h3>
        <NetworkLog events={networkEvents} />
      </div>
    </div>
  );
}
