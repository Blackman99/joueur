import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import Unocss from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno, transformerDirectives } from 'unocss'

export default defineConfig({
  plugins: [
    Unocss({
      mode: 'svelte-scoped',
      transformers: [transformerDirectives()],
      presets: [presetUno(), presetIcons(), presetAttributify()],
    }),
    sveltekit(),
  ],

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
})
