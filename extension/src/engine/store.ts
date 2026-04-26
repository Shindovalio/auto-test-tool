import type { TestDefinition } from "../types";

const STORAGE_KEY = "flowtest_tests";
const INITIALIZED_KEY = "flowtest_initialized";

const DEFAULT_TESTS: TestDefinition[] = [
  {
    id: "default-1",
    name: "Button click reveals panel",
    steps: [
      { type: "waitFor", selector: "#my-app-btn", timeout: 5000 },
      { type: "click", selector: "#my-app-btn" },
      { type: "assertVisible", selector: "#my-app-panel" },
    ],
  },
  {
    id: "default-2",
    name: "API call on load",
    steps: [
      { type: "waitFor", selector: "#my-app-root", timeout: 5000 },
      { type: "assertNetwork", urlPattern: "/api/data*", expectedStatus: 200 },
    ],
  },
];

export async function loadTests(): Promise<TestDefinition[]> {
  const result = await chrome.storage.local.get([STORAGE_KEY, INITIALIZED_KEY]);

  if (!result[INITIALIZED_KEY]) {
    await chrome.storage.local.set({
      [STORAGE_KEY]: DEFAULT_TESTS,
      [INITIALIZED_KEY]: true,
    });
    return DEFAULT_TESTS;
  }

  return (result[STORAGE_KEY] as TestDefinition[]) ?? [];
}

export async function saveTest(test: TestDefinition): Promise<void> {
  const tests = await loadTests();
  const idx = tests.findIndex((t) => t.id === test.id);
  if (idx >= 0) {
    tests[idx] = test;
  } else {
    tests.push(test);
  }
  await chrome.storage.local.set({ [STORAGE_KEY]: tests });
}

export async function deleteTest(id: string): Promise<void> {
  const tests = await loadTests();
  const filtered = tests.filter((t) => t.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
}
