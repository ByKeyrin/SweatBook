import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugin officiel Tailwind CSS v4 pour Vite (plus besoin de tailwind.config.js)
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Pendant le développement, tout appel vers /api est transféré au backend
      // Express (port 3001). Voir docs/TECHNICAL.md §5 et §7.4.
      '/api': 'http://localhost:3001',
    },
  },
})
