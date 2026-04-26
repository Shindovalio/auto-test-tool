import { loadTests, saveTest, deleteTest } from "../engine/store";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  // Storage operations (from panel)
  if (msg.type === "GET_TESTS") {
    loadTests().then((tests) => sendResponse({ tests }));
    return true;
  }

  if (msg.type === "SAVE_TEST") {
    saveTest(msg.test).then(() => loadTests()).then((tests) => sendResponse({ tests }));
    return true;
  }

  if (msg.type === "DELETE_TEST") {
    deleteTest(msg.id).then(() => loadTests()).then((tests) => sendResponse({ tests }));
    return true;
  }

  // Forward RUN_TEST from panel to the active tab's content script
  if (msg.type === "RUN_TEST") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) {
        sendResponse({ error: "No active tab" });
        return;
      }
      chrome.tabs.sendMessage(tab.id, msg, () => {
        // Content script sends progress events back via runtime.sendMessage
        sendResponse({ ok: true });
      });
    });
    return true;
  }

  // Forward STEP_RESULT, NETWORK_EVENT, RUN_COMPLETE from content script to panel
  if (
    msg.type === "STEP_RESULT" ||
    msg.type === "NETWORK_EVENT" ||
    msg.type === "RUN_COMPLETE"
  ) {
    chrome.runtime.sendMessage(msg).catch(() => {
      // Panel may not be open — ignore
    });
  }
});

export {};
