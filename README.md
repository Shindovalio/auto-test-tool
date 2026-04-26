# FlowTest

A Chrome DevTools extension for testing embedded React UIs inside complex host platforms (Jira, Salesforce, etc.) without controlling the browser launch.

## Stack

- Vite + React 18 (DevTools panel UI)
- Pure CSS — dark devtools aesthetic
- Vanilla TypeScript (content/background scripts)
- Manifest V3

## Setup

```bash
cd extension
npm install
npm run build        # one-off build → dist/
npm run dev          # watch mode (rebuilds on save)
```

## Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/dist/` folder

## Open the FlowTest panel

1. Navigate to any page you want to test
2. Open Chrome DevTools (`F12` or `Cmd+Option+I`)
3. Find the **FlowTest** tab in the DevTools toolbar
4. Select a test from the sidebar and click **▶ Run**

## Project layout

```
extension/
├── manifest.json
├── vite.config.ts
├── package.json
├── tsconfig.json
├── icons/                  ← extension icons
└── src/
    ├── types/index.ts      ← shared types
    ├── background/         ← service worker / message bus
    ├── content/            ← injected into host page
    │   ├── observer.ts     ← MutationObserver waitForElement
    │   ├── emulator.ts     ← realistic click/input dispatch
    │   └── interceptor.ts  ← fetch + XHR capture
    ├── engine/
    │   ├── runner.ts       ← step executor
    │   ├── assertions.ts   ← assertion helpers
    │   └── store.ts        ← chrome.storage.local CRUD
    └── panel/              ← React DevTools UI
        ├── App.tsx
        └── components/
```

## Step types

| Type | Description |
|------|-------------|
| `waitFor` | Wait for a CSS selector to appear (MutationObserver) |
| `click` | Dispatch mousedown + mouseup + click (React-compatible) |
| `input` | Set value via native setter, dispatch input/change events |
| `assertVisible` | Assert element exists and has non-zero size |
| `assertText` | Assert element textContent contains expected string |
| `assertNetwork` | Assert a matching network call was captured during the run |

## Adding tests

Tests are stored in `chrome.storage.local`. Two example tests are seeded on first install. To add more, edit `src/engine/store.ts` → `DEFAULT_TESTS` or add a UI for it later.
