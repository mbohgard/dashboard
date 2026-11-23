import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  root: fileURLToPath(new URL("./src", import.meta.url)),
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
        svgoConfig: {
          plugins: [
            {
              name: "preset-default",
              params: { overrides: { removeViewBox: false } },
            },
          ],
        },
      },
    }),
  ],
  server: {
    port: 8080,
    strictPort: true,
    proxy: {
      "/socket.io": { target: "http://127.0.0.1:8081", ws: true },
      "/reloadAll": "http://127.0.0.1:8081",
    },
  },
  build: {
    target: "es2020",
    outDir: fileURLToPath(new URL("./dist", import.meta.url)),
    emptyOutDir: true,
    assetsInlineLimit: 0,
  },
});
