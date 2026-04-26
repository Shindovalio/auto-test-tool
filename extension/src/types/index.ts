export type WaitForStep = {
  type: "waitFor";
  selector: string;
  timeout?: number;
};

export type ClickStep = {
  type: "click";
  selector: string;
};

export type AssertVisibleStep = {
  type: "assertVisible";
  selector: string;
};

export type AssertTextStep = {
  type: "assertText";
  selector: string;
  expected: string;
};

export type AssertNetworkStep = {
  type: "assertNetwork";
  urlPattern: string;
  expectedStatus: number;
  assertBody?: string;
};

export type InputStep = {
  type: "input";
  selector: string;
  value: string;
};

export type Step =
  | WaitForStep
  | ClickStep
  | AssertVisibleStep
  | AssertTextStep
  | AssertNetworkStep
  | InputStep;

export type TestDefinition = {
  id: string;
  name: string;
  steps: Step[];
};

export type StepStatus = "pass" | "fail" | "running";

export type StepResult = {
  stepIndex: number;
  type: Step["type"];
  status: StepStatus;
  message?: string;
  duration: number;
};

export type NetworkEvent = {
  url: string;
  method: string;
  status: number;
  body: string;
  timestamp: number;
};

export type RunResult = {
  testId: string;
  steps: StepResult[];
  networkEvents: NetworkEvent[];
  status: "running" | "pass" | "fail";
};

// Messages between extension parts
export type MessageType =
  | { type: "RUN_TEST"; testId: string; steps: Step[] }
  | { type: "STEP_RESULT"; result: StepResult }
  | { type: "NETWORK_EVENT"; event: NetworkEvent }
  | { type: "RUN_COMPLETE"; testId: string; status: "pass" | "fail" }
  | { type: "GET_TESTS" }
  | { type: "SAVE_TEST"; test: TestDefinition }
  | { type: "DELETE_TEST"; id: string }
  | { type: "TESTS_LIST"; tests: TestDefinition[] };
