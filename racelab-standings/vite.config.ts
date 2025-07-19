import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [{ src: "manifest.json", dest: "." }],
    }),
    dts({
      exclude: ["**/*.module.css"], // <-- prevent d.ts generation for CSS modules
    }),
  ],
  base: "",
});
