<script lang="ts">
  import { Buffer } from 'buffer'
  import { appWindow } from '@tauri-apps/api/window'
  import { readDir } from '@tauri-apps/api/fs'
  import { onDestroy, onMount } from 'svelte'
  import Menu from '$lib/components/Menu.svelte'
  import DropZone from '$lib/components/DropZone.svelte'
  import { getSongInfoFromFile, isAudio } from '$lib/utils/audio'

  globalThis.Buffer = Buffer

  let showDropZone = false

  let cleanupDropListener: () => void

  onMount(async () => {
    cleanupDropListener = await appWindow.onFileDropEvent(async evt => {
      switch (evt.payload.type) {
        case 'hover':
          showDropZone = true
          break
        case 'cancel':
          showDropZone = false
          break
        case 'drop':
          showDropZone = false

          evt.payload.paths.forEach(async path => {
            try {
              if (isAudio(path)) {
                const song = await getSongInfoFromFile(path)
              } else {
                const res = await readDir(path, { recursive: true })
              }
            } catch (error) {}
          })
      }
    })
  })

  onDestroy(() => {
    cleanupDropListener?.()
  })
</script>

<main class="j-main">
  <aside class="j-side">
    <img src="/logo.svg" alt="Joueur" class="logo" />
    <div>
      <Menu label="Musics" to="/">
        <div slot="icon" class="i-bi:music-note-list"></div>
      </Menu>
      <Menu label="Artists" to="/artists">
        <div slot="icon" class="i-icon-park-outline:peoples-two"></div>
      </Menu>
      <Menu label="Album" to="/albums">
        <div slot="icon" class="i-iconoir:album-open"></div>
      </Menu>
      <Menu label="Settings" to="/settings">
        <div slot="icon" class="i-bytesize:settings"></div>
      </Menu>
    </div>
    <div></div>
  </aside>
  <div class="j-content">
    <slot />
  </div>
</main>

{#if showDropZone}
  <DropZone />
{/if}

<style uno:preflights uno:safelist global>
  :global(body) {
    --uno: 'bg-white m-0 p-0 overflow-hidden text-secondary';
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
      'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
  }
  :global(a) {
    --uno: 'decoration-none text-inherit';
  }
  .logo {
    --uno: 'w-[10vw] block mx-a';
  }
  .j-main {
    --uno: 'flex h-[100vh]';
  }
  .j-side {
    --uno: 'flex flex-col justify-between p-4 w-[18vw] box-border';
  }
  .j-content {
    --uno: 'flex-grow bg-light-2';
  }
</style>
