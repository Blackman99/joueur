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
  import PlayerBottomBar from '$lib/components/PlayerBottomBar.svelte'
  import Sidebar from '$lib/components/Sidebar.svelte'
  import { convertFileSrc } from '@tauri-apps/api/tauri'
  import {
    selectedPlaylistId,
    SELECTED_PLAYLIST_ID_KEY,
    refreshCurrentSongs,
    playlists,
    playing,
    currentTime,
    CURRENT_TIME_KEY,
    playingSong,
    playingSongId,
    PLAYING_KEY,
  } from '$lib/store'
  import { get } from 'svelte/store'
  import type { Subscription } from 'dexie'

  // Mount global Buffer
  globalThis.Buffer = Buffer

  let showDropZone = false
  let showDropLoading = false
  let ready = false

  // effects
  let cleanupDropListener: () => void
  let unsubscribePlaying: () => void
  let unsubscribePlayingSong: () => void
  let unsubscribePlaylistId: () => void
  let currentTimerInterval: ReturnType<typeof setInterval>
  let playlistSubscriber: Subscription

  let audio: HTMLAudioElement

  onMount(async () => {
    await db.getAllList()
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

                await db.addSong(song)
              } else {
                const res = await readDir(path, { recursive: true })
                const songs = await parseSongsFromFileEntries(res)
                await db.addSongs(songs)
              }
            }
          } catch (error) {
          } finally {
            showDropLoading = false
          }
      }
    })

    unsubscribePlaying = playing.subscribe(v => {
      if (!v) {
        audio?.pause()
      } else {
        audio?.play()
      }
      localStorage.setItem(PLAYING_KEY, v ? 'on' : 'off')
    })

    // The subscriptions below can only put here cause would cause unexpected errors like:
    // can not reach variable before initialized
    playlistSubscriber = playlists.subscribe(() =>
      refreshCurrentSongs(get(selectedPlaylistId))
    ) as any

    unsubscribePlaylistId = selectedPlaylistId.subscribe(async id => {
      localStorage.setItem(SELECTED_PLAYLIST_ID_KEY, id.toString())
      await refreshCurrentSongs(id)
      // mark page ready
      ready = true
    })

    audio.onloadedmetadata = () => {
      if (audio.paused && get(playing)) {
        audio.play()
      }
    }

    unsubscribePlayingSong = playingSong.subscribe(async promiseSong => {
      const song = await promiseSong
      if (song && audio) {
        audio.src = convertFileSrc(song.path)
      }
    })

    currentTimerInterval = setInterval(() => {
      currentTime.set(audio?.currentTime)
    }, 500)

    window.addEventListener('beforeunload', () => {
      console.log('beforeunload')

      localStorage.setItem(CURRENT_TIME_KEY, get(currentTime).toString())
    })
  })

  onDestroy(() => {
    cleanupDropListener?.()
    unsubscribePlaying?.()
    unsubscribePlaylistId?.()
    unsubscribePlayingSong?.()
    playlistSubscriber?.unsubscribe()
    if (currentTimerInterval) {
      clearInterval(currentTimerInterval)
    }
  })
</script>

<audio bind:this="{audio}" style="display: none;"></audio>

<main class="j-main">
  <Sidebar />
  <div class="j-content">
    {#if ready}
      <slot />
    {/if}
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
    --uno: 'bg-light-3 m-0 p-0 overflow-hidden text-secondary';
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
      'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
  }
  .j-main {
    --uno: 'flex h-[100vh] items-stretch';
  }
  .j-content {
    --uno: 'flex-grow bg-light- flex flex-col relative';
  }
</style>
