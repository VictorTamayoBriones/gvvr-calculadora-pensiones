import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@PublicPages": path.resolve(__dirname, "./src/pages/public"),
      "@PrivatePages": path.resolve(__dirname, "./src/pages/private"),
    },
  },
})
