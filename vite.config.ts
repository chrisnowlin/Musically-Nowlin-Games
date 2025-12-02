import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Vite configuration optimized for Bun 1.3
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Use VITE_BASE_PATH env var for flexibility (defaults to "/" for Vercel)
  base: process.env.VITE_BASE_PATH || "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    // Optimizations for Bun
    target: "esnext",
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "radix-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
          ],
        },
      },
    },
  },
  server: {
    port: 5174,
    strictPort: false,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // Bun has faster HMR
    hmr: true,
  },
  // Optimize dependency pre-bundling with Bun
  optimizeDeps: {
    include: ["react", "react-dom", "wouter", "vexflow"],
    exclude: [],
  },
}));
