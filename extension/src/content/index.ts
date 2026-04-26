import "./interceptor";
import { waitForElement } from "./observer";
import { emulateClick, emulateInput } from "./emulator";
import type { Step, StepResult, NetworkEvent } from "../types";

declare global {
  interface Window {
    __flowtestBus: EventTarget;
    __flowtestActive: boolean;
  }
}

let networkBuffer: NetworkEvent[] = [];

window.__flowtestBus.addEventListener("network", (e) => {
  const event = (e as CustomEvent<NetworkEvent>).detail;
  networkBuffer.push(event);
  chrome.runtime.sendMessage({ type: "NETWORK_EVENT", event });
});

async function executeStep(step: Step, index: number): Promise<StepResult> {
  const start = Date.now();
  const base = { stepIndex: index, type: step.type };

  try {
    switch (step.type) {
      case "waitFor": {
        await waitForElement(step.selector, step.timeout ?? 5000);
        break;
      }
      case "click": {
        const el = document.querySelector(step.selector);
        if (!el) throw new Error(`Element not found: ${step.selector}`);
        emulateClick(el);
        break;
      }
      case "assertVisible": {
        const el = document.querySelector(step.selector);
        if (!el) throw new Error(`Element not found: ${step.selector}`);
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          throw new Error(`Element not visible: ${step.selector}`);
        }
        break;
      }
      case "assertText": {
        const el = document.querySelector(step.selector);
        if (!el) throw new Error(`Element not found: ${step.selector}`);
        const text = el.textContent ?? "";
        if (!text.includes(step.expected)) {
          throw new Error(`Expected text "${step.expected}" not found in "${text}"`);
        }
        break;
      }
      case "assertNetwork": {
        const pattern = step.urlPattern.replace(/\*/g, ".*");
        const regex = new RegExp(pattern);
        const match = networkBuffer.find(
          (ev) => regex.test(ev.url) && ev.status === step.expectedStatus
        );
        if (!match) {
          throw new Error(
            `No network call matched pattern "${step.urlPattern}" with status ${step.expectedStatus}`
          );
        }
        if (step.assertBody && !match.body.includes(step.assertBody)) {
          throw new Error(
            `Network body did not contain "${step.assertBody}"`
          );
        }
        break;
      }
      case "input": {
        const el = document.querySelector(step.selector);
        if (!el) throw new Error(`Element not found: ${step.selector}`);
        emulateInput(el, step.value);
        break;
      }
    }

    return { ...base, status: "pass", duration: Date.now() - start };
  } catch (err) {
    return {
      ...base,
      status: "fail",
      message: err instanceof Error ? err.message : String(err),
      duration: Date.now() - start,
    };
  }
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "RUN_TEST") return;

  const steps: Step[] = msg.steps;
  networkBuffer = [];
  window.__flowtestActive = true;

  (async () => {
    let anyFail = false;
    for (let i = 0; i < steps.length; i++) {
      chrome.runtime.sendMessage({
        type: "STEP_RESULT",
        result: { stepIndex: i, type: steps[i].type, status: "running", duration: 0 },
      });

      const result = await executeStep(steps[i], i);
      chrome.runtime.sendMessage({ type: "STEP_RESULT", result });
      if (result.status === "fail") anyFail = true;
    }

    window.__flowtestActive = false;
    chrome.runtime.sendMessage({
      type: "RUN_COMPLETE",
      testId: msg.testId,
      status: anyFail ? "fail" : "pass",
    });

    sendResponse({ ok: true });
  })();

  return true; // keep channel open for async sendResponse
});
