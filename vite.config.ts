import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'solar-icon-set/money': path.resolve(__dirname, 'node_modules/solar-icon-set/dist/icons/Money'),
      'solar-icon-set/arrows': path.resolve(__dirname, 'node_modules/solar-icon-set/dist/icons/Arrows')
    }
  },
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
})