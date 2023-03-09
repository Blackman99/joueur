import { defineConfig } from 'vite'
import { sveltekit } from '@sveltejs/kit/vite'
import Unocss from 'unocss/vite'
import { presetIcons, presetUno, transformerDirectives } from 'unocss'

export default defineConfig({
  plugins: [
    Unocss({
      mode: 'svelte-scoped',
      transformers: [transformerDirectives()],
      presets: [presetUno(), presetIcons()],
      theme: {
        colors: {
          primary: '#37A6CA',
          secondary: '#0F2C4D',
        },
      },
      shortcuts: {
        'j-clickable-item': 'hover:bg-light-7 active:bg-light-9 cursor-pointer',
        'j-active-item': 'text-primary hover:bg-primary hover:bg-opacity-8 active:bg-opacity-16 cursor-default',
      },
    }),
    sveltekit(),
  ],

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: true,
  },
  envPrefix: ['VITE_', 'TAURI_'],
  build: {
    target: process.env.TAURI_PLATFORM === 'windows' ? 'chrome105' : 'safari13',
    minify: !process.env.TAURI_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_DEBUG,
  },
  optimizeDeps: {
    // exclude: ['music-metadata-browser'],
  },
})
