<script lang="ts">
  import { Buffer } from 'buffer'
  import { appWindow } from '@tauri-apps/api/window'
  import { readDir } from '@tauri-apps/api/fs'
  import { onDestroy, onMount } from 'svelte'
  import DropZone from '$lib/components/DropZone.svelte'
  import {
    getSongInfoFromFile,
    isAudio,
    parseSongsFromFileEntries,
  } from '$lib/utils/audio'
  import DropLoading from '$lib/components/DropLoading.svelte'
  import { db } from '$lib/db'
  import { DEFAULT_PLAYLIST_TITLE } from '$lib/constants'
  import PlayerBottomBar from '$lib/components/PlayerBottomBar.svelte'
  import Sidebar from '$lib/components/Sidebar.svelte'

  globalThis.Buffer = Buffer

  let showDropZone = false

  let showDropLoading = false

  let cleanupDropListener: () => void

  const createDefaultPlaylist = async () => {
    if (
      (await db.playlists
        .where('title')
        .equals(DEFAULT_PLAYLIST_TITLE)
        .count()) < 1
    ) {
      await db.playlists.put({
        title: DEFAULT_PLAYLIST_TITLE,
        songIds: [],
      })
    }
  }

  onMount(async () => {
    await createDefaultPlaylist()
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
          showDropLoading = true
          try {
            for (const path of evt.payload.paths) {
              if (isAudio(path)) {
                const song = await getSongInfoFromFile(path)
                console.log(song)
                db.songs.put(song)
              } else {
                const res = await readDir(path, { recursive: true })
                const songs = await parseSongsFromFileEntries(res)
                db.songs.bulkAdd(songs)
              }
            }
          } catch (error) {
          } finally {
            showDropLoading = false
          }
      }
    })
  })

  onDestroy(() => {
    cleanupDropListener?.()
  })
</script>

<main class="j-main">
  <Sidebar />
  <div class="j-content">
    <slot />
    <PlayerBottomBar />
  </div>
</main>

{#if showDropZone}
  <DropZone />
{/if}

{#if showDropLoading}
  <DropLoading />
{/if}

<style uno:preflights uno:safelist global>
  :global(body) {
    --uno: 'bg-white m-0 p-0 overflow-hidden text-secondary';
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
      'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
  }
  .j-main {
    --uno: 'flex h-[100vh] items-stretch';
  }
  .j-content {
    --uno: 'flex-grow bg-light-3 flex flex-col';
  }
</style>
