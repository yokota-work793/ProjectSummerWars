// 担当：指輪（画面）。React の開発サーバーの設定
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5123,          // 画面はここを開く：http://localhost:5123
    strictPort: true,
    // /api は Java（Spring Boot・5124）へ送る
    proxy: { '/api': 'http://localhost:5124' },
  },
  build: {
    // npm run build すると、Java がそのまま配れる場所に出す（本番用。Git には入れない）
    outDir: '../src/main/resources/static',
    emptyOutDir: true,
  },
})
