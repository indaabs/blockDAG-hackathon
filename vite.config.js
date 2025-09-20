import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['ethers'] // Ensure ethers is included in optimization
  },
  define: {
    global: 'globalThis' // This might help with some ethers issues
  }
})
