import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 設定: React プラグインを有効化
export default defineConfig({
  plugins: [react()],
})
