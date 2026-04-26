import type { Step, StepResult, NetworkEvent, RunResult } from "../types";

export type ProgressCallback = (result: StepResult) => void;
export type NetworkCallback = (event: NetworkEvent) => void;

export async function runTest(
  testId: string,
  steps: Step[],
  tabId: number,
  onStep: ProgressCallback,
  onNetwork: NetworkCallback
): Promise<RunResult> {
  const networkEvents: NetworkEvent[] = [];
  const stepResults: StepResult[] = [];

  // Listen for messages from content script during this run
  const messageListener = (msg: Record<string, unknown>) => {
    if (msg.type === "STEP_RESULT") {
      const result = msg.result as StepResult;
      onStep(result);
      // Update or push
      const idx = stepResults.findIndex((r) => r.stepIndex === result.stepIndex);
      if (idx >= 0) {
        stepResults[idx] = result;
      } else {
        stepResults.push(result);
      }
    } else if (msg.type === "NETWORK_EVENT") {
      const event = msg.event as NetworkEvent;
      networkEvents.push(event);
      onNetwork(event);
    }
  };

  chrome.runtime.onMessage.addListener(messageListener);

  await chrome.tabs.sendMessage(tabId, {
    type: "RUN_TEST",
    testId,
    steps,
  });

  // Wait for RUN_COMPLETE
  await new Promise<void>((resolve) => {
    const completeListener = (msg: Record<string, unknown>) => {
      if (msg.type === "RUN_COMPLETE" && msg.testId === testId) {
        chrome.runtime.onMessage.removeListener(completeListener);
        resolve();
      }
    };
    chrome.runtime.onMessage.addListener(completeListener);
  });

  chrome.runtime.onMessage.removeListener(messageListener);

  const anyFail = stepResults.some((r) => r.status === "fail");

  return {
    testId,
    steps: stepResults,
    networkEvents,
    status: anyFail ? "fail" : "pass",
  };
}
