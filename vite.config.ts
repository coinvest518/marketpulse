import path from "path"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

export default defineConfig({
  // Set the root to the client directory
  root: 'client',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // The alias path needs to be resolved from the project root
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
  build: {
    // The output directory is relative to the project root
    outDir: '../dist/public',
    emptyOutDir: true,
  }
})