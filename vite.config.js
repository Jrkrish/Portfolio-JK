import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages serves this repo from /Portfolio-JK/.
export default defineConfig({
  base: "/Portfolio-JK/",
  plugins: [react()],
});
