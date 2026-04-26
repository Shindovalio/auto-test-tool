import type { NetworkEvent } from "../types";

export function assertVisible(selector: string): void {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`assertVisible: element "${selector}" not found`);
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    throw new Error(`assertVisible: element "${selector}" has zero size`);
  }
}

export function assertText(selector: string, expected: string): void {
  const el = document.querySelector(selector);
  if (!el) throw new Error(`assertText: element "${selector}" not found`);
  const text = el.textContent ?? "";
  if (!text.includes(expected)) {
    throw new Error(`assertText: expected "${expected}" in "${text.slice(0, 100)}"`);
  }
}

export function assertNetwork(
  events: NetworkEvent[],
  urlPattern: string,
  expectedStatus: number,
  assertBody?: string
): void {
  const regex = new RegExp(urlPattern.replace(/\*/g, ".*"));
  const match = events.find((ev) => regex.test(ev.url) && ev.status === expectedStatus);
  if (!match) {
    throw new Error(
      `assertNetwork: no call matched "${urlPattern}" with status ${expectedStatus}`
    );
  }
  if (assertBody && !match.body.includes(assertBody)) {
    throw new Error(`assertNetwork: body did not contain "${assertBody}"`);
  }
}
