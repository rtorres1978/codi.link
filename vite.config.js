import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    include: ["monaco-editor"],
  },
  worker: {
    format: "es", // o "iife" según el caso
  },
});
