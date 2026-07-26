import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Single custom SW (src/sw.ts) that does BOTH PWA precache and FCM push.
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      // Prompt to reload on a new version rather than silently swapping the SW —
      // safer for an app with live auth/inventory data.
      registerType: "prompt",
      injectRegister: null, // registration handled manually in main.tsx
      injectManifest: {
        // Precache the built app shell. /api is never matched (not a build asset).
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
      },
      devOptions: {
        enabled: false, // SW only in production builds
        type: "module",
      },
      manifest: {
        name: "Honda Golaghat",
        short_name: "Honda Golaghat",
        description: "Honda Golaghat Dealership Management System",
        theme_color: "#e40521",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-512-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
