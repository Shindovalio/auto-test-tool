import type { NetworkEvent } from "../types";

declare global {
  interface Window {
    __flowtestBus: EventTarget;
    __flowtestActive: boolean;
  }
}

window.__flowtestBus = new EventTarget();

function emit(event: NetworkEvent) {
  window.__flowtestBus.dispatchEvent(
    new CustomEvent("network", { detail: event })
  );
}

function shouldCapture(): boolean {
  return window.__flowtestActive === true;
}

// Patch fetch
const originalFetch = window.fetch.bind(window);
window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const method = init?.method ?? (typeof input !== "string" && !(input instanceof URL) ? input.method : "GET") ?? "GET";
  const timestamp = Date.now();

  const response = await originalFetch(input, init);

  if (shouldCapture()) {
    let body = "";
    try {
      const clone = response.clone();
      body = await clone.text();
    } catch {
      // ignore body read errors
    }

    emit({ url, method, status: response.status, body, timestamp });
  }

  return response;
};

// Patch XHR
const OriginalXHR = window.XMLHttpRequest;

class PatchedXHR extends OriginalXHR {
  private _method = "GET";
  private _url = "";
  private _timestamp = 0;

  open(method: string, url: string | URL, ...rest: unknown[]) {
    this._method = method;
    this._url = typeof url === "string" ? url : url.toString();
    // @ts-ignore - rest spread for overload compatibility
    return super.open(method, url, ...rest);
  }

  send(body?: Document | XMLHttpRequestBodyInit | null) {
    this._timestamp = Date.now();
    this.addEventListener("loadend", () => {
      if (shouldCapture()) {
        emit({
          url: this._url,
          method: this._method,
          status: this.status,
          body: this.responseText ?? "",
          timestamp: this._timestamp,
        });
      }
    });
    return super.send(body);
  }
}

window.XMLHttpRequest = PatchedXHR as typeof XMLHttpRequest;
