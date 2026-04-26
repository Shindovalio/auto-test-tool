import { useEffect, useState, useCallback } from "react";
import type { TestDefinition, StepResult, NetworkEvent } from "../types";
import TestList from "./components/TestList";
import TestRunner from "./components/TestRunner";

type RunStatus = "idle" | "running" | "pass" | "fail";

export default function App() {
  const [tests, setTests] = useState<TestDefinition[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stepResults, setStepResults] = useState<StepResult[]>([]);
  const [networkEvents, setNetworkEvents] = useState<NetworkEvent[]>([]);
  const [runStatus, setRunStatus] = useState<RunStatus>("idle");

  const selectedTest = tests.find((t) => t.id === selectedId) ?? null;

  // Load tests from storage
  useEffect(() => {
    chrome.runtime.sendMessage({ type: "GET_TESTS" }, (res) => {
      if (res?.tests) {
        setTests(res.tests);
        if (res.tests.length > 0) setSelectedId(res.tests[0].id);
      }
    });
  }, []);

  // Listen for run events from background
  useEffect(() => {
    const listener = (msg: Record<string, unknown>) => {
      if (msg.type === "STEP_RESULT") {
        const result = msg.result as StepResult;
        setStepResults((prev) => {
          const next = [...prev];
          const idx = next.findIndex((r) => r.stepIndex === result.stepIndex);
          if (idx >= 0) {
            next[idx] = result;
          } else {
            next.push(result);
          }
          return next;
        });
      } else if (msg.type === "NETWORK_EVENT") {
        setNetworkEvents((prev) => [...prev, msg.event as NetworkEvent]);
      } else if (msg.type === "RUN_COMPLETE") {
        setRunStatus((msg.status as "pass" | "fail") ?? "fail");
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const handleRun = useCallback(() => {
    if (!selectedTest) return;
    setStepResults([]);
    setNetworkEvents([]);
    setRunStatus("running");

    chrome.runtime.sendMessage({
      type: "RUN_TEST",
      testId: selectedTest.id,
      steps: selectedTest.steps,
    });
  }, [selectedTest]);

  const handleDelete = useCallback(
    (id: string) => {
      chrome.runtime.sendMessage({ type: "DELETE_TEST", id }, (res) => {
        if (res?.tests) {
          setTests(res.tests);
          if (selectedId === id) {
            setSelectedId(res.tests[0]?.id ?? null);
          }
        }
      });
    },
    [selectedId]
  );

  const handleSelect = useCallback(
    (id: string) => {
      if (id !== selectedId) {
        setSelectedId(id);
        setStepResults([]);
        setNetworkEvents([]);
        setRunStatus("idle");
      }
    },
    [selectedId]
  );

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">FlowTest</span>
        </div>
        <TestList
          tests={tests}
          selectedId={selectedId}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      </aside>
      <main className="main">
        {selectedTest ? (
          <TestRunner
            test={selectedTest}
            stepResults={stepResults}
            networkEvents={networkEvents}
            runStatus={runStatus}
            onRun={handleRun}
          />
        ) : (
          <div className="empty-state center">Select a test from the sidebar.</div>
        )}
      </main>
    </div>
  );
}
