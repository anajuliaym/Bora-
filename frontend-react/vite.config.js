import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Em dev, /api é encaminhado pro Spring Boot (backend/, porta 8080).
    // Assim o front chama a API na mesma origem — sem CORS e sem abrir
    // connect-src na CSP. SUBSTITUIR EM PRODUÇÃO: servir front e API atrás
    // do mesmo domínio (reverse proxy) ou liberar o domínio da API na CSP.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
