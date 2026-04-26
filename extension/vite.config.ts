import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-extension-assets",
      closeBundle() {
        // Manifest
        copyFileSync("manifest.json", "dist/manifest.json");

        // Icons
        try { mkdirSync("dist/icons", { recursive: true }); } catch {}
        for (const f of ["icon16.png", "icon48.png", "icon128.png"]) {
          try { copyFileSync(`icons/${f}`, `dist/icons/${f}`); } catch {}
        }

        // Move panel HTML from dist/src/panel/ → dist/panel/
        try {
          mkdirSync("dist/panel", { recursive: true });
          copyFileSync("dist/src/panel/index.html", "dist/panel/index.html");
        } catch {}
      },
    },
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        panel: resolve(__dirname, "src/panel/index.html"),
        background: resolve(__dirname, "src/background/index.ts"),
        content: resolve(__dirname, "src/content/index.ts"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "background") return "background.js";
          if (chunk.name === "content") return "content.js";
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
