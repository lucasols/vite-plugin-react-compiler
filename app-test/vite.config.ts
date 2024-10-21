import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import Inspect from 'vite-plugin-inspect'
import { ViteStableId } from '../lib/src/main'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), Inspect(), ViteStableId()],
})
