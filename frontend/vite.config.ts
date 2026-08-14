import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
		vue(),
		tailwindcss(),
	],
	server: {
		// Wails v3's dev proxy dials 127.0.0.1 explicitly (IPv4), but Vite's
		// default "localhost" bind can resolve to IPv6-only (::1) depending on
		// the OS, causing "connect: connection refused" and an empty window.
		host: '127.0.0.1',
	},
})
