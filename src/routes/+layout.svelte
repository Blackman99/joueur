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
    PLAYING_SONG_ID_KEY,
    MODE_KEY,
    refreshCurrentSongs,
    playlists,
    paused,
    playingSongId,
    playedSeconds,
    CURRENT_TIME_KEY,
    playingSong,
    currentSongs,
    CURRENT_SONGS_KEY,
    playNext,
    volume,
    VOLUME_KEY,
    audioDom,
    mode,
    PLAYING_KEY,
    togglePlayOrPause,
    duration,
  } from '$lib/store'
  import { get } from 'svelte/store'
  import type { Subscription } from 'dexie'
  import CurrentSongs from '$lib/components/CurrentSongs.svelte'
  import FloatPlayOrPause from '$lib/components/FloatPlayOrPause.svelte'
  import EditLyrics from '$lib/components/lyrics/EditLyrics.svelte'

  // Mount global Buffer
  globalThis.Buffer = Buffer

  let showDropZone = false
  let showDropLoading = false
  let ready = false
  let showCurrentList = false

  // effects
  // Notice that not use $ because the subscriptions timing is not fixed
  let cleanupDropListener: () => void
  let unsubscribePlaylistId: () => void
  let unsubscribePlayingSongId: () => void
  let unsubscribePlayedSeconds: () => void
  let unsubscribeCurrentSongs: () => void
  let unsubscribeVolume: () => void
  let unsubscribeMode: () => void
  let unsubscribePaused: () => void
  let playlistSubscriber: Subscription

  const handleSpaceKeyboard = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      togglePlayOrPause()
    }
  }

  onMount(async () => {
    const currentSongIds = JSON.parse(
      localStorage.getItem(CURRENT_SONGS_KEY) || '[]'
    ) as number[]

    currentSongs.set(await db.songs.where('id').anyOf(currentSongIds).toArray())

    await db.getAllList()

    cleanupDropListener = await appWindow.onFileDropEvent(async evt => {
      switch (evt.payload.type) {
        case 'hover':
          if (
            !evt.payload?.paths.length ||
            !evt.payload.paths.some(p => isAudio(p))
          )
            return
          showDropZone = true
          break
        case 'cancel':
          showDropZone = false
          break
        case 'drop':
          if (!showDropZone) return
          showDropZone = false
          showDropLoading = true
          try {
            for (const path of evt.payload.paths) {
              if (isAudio(path)) {
                const song = await getSongInfoFromFile(path)
                console.log(song)
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

    unsubscribeMode = mode.subscribe(m => {
      localStorage.setItem(MODE_KEY, m)
    })

    unsubscribeCurrentSongs = currentSongs.subscribe(async songs => {
      localStorage.setItem(
        CURRENT_SONGS_KEY,
        JSON.stringify(songs.map(song => song.id))
      )
    })

    unsubscribePlayingSongId = playingSongId.subscribe(async newSongId => {
      localStorage.setItem(PLAYING_SONG_ID_KEY, newSongId.toString())
      playingSong.set(await db.songs.where('id').equals(newSongId).first())
    })

    // The subscriptions below can only put here cause would cause unexpected errors like:
    // can not reach variable before initialized
    playlistSubscriber = playlists.subscribe(
      async () => await refreshCurrentSongs(get(selectedPlaylistId))
    ) as any

    unsubscribePlaylistId = selectedPlaylistId.subscribe(async id => {
      localStorage.setItem(SELECTED_PLAYLIST_ID_KEY, id.toString())
      await refreshCurrentSongs(id)
      // Mark page ready when live query is done.
      ready = true
    })

    await appWindow.onCloseRequested(async _evt => {
      localStorage.setItem(CURRENT_TIME_KEY, get(playedSeconds).toString())
    })

    unsubscribeVolume = volume.subscribe(v => {
      localStorage.setItem(VOLUME_KEY, v.toString())
    })

    window.addEventListener('keyup', handleSpaceKeyboard)
  })

  const handleContextMenu = (e: any) => {
    if (!import.meta.env.DEV) {
      e.preventDefault()
    }
  }

  let isFirst = true
  const handleLoadedMetadata = (e: any) => {
    if (isFirst) {
      e.target.currentTime = Number(localStorage.getItem(CURRENT_TIME_KEY))
      isFirst = false
      if (localStorage.getItem(PLAYING_KEY) === 'on') {
        e.target.play()
      }
    } else {
      e.target.currentTime = 0
      e.target.play()
    }
  }

  $: {
    localStorage.setItem(PLAYING_KEY, $paused ? 'off' : 'on')
  }

  onDestroy(() => {
    cleanupDropListener?.()
    unsubscribePlaylistId?.()
    unsubscribePlayingSongId?.()
    unsubscribePlayedSeconds?.()
    unsubscribeCurrentSongs?.()
    unsubscribeVolume?.()
    unsubscribeMode?.()
    unsubscribePaused?.()
    playlistSubscriber?.unsubscribe()
    localStorage.setItem(CURRENT_TIME_KEY, get(playedSeconds).toString())
    window.removeEventListener('keyup', handleSpaceKeyboard)
  })
</script>

{#if $playingSong}
  <audio
    bind:this="{$audioDom}"
    bind:volume="{$volume}"
    bind:currentTime="{$playedSeconds}"
    bind:paused="{$paused}"
    bind:duration="{$duration}"
    src="{convertFileSrc($playingSong.path)}"
    style="display: none;"
    title="{$playingSong.title} - {$playingSong.artist}"
    on:ended="{playNext}"
    on:loadedmetadata="{handleLoadedMetadata}"
  >
  </audio>
{/if}

<main class="j-main" on:contextmenu="{handleContextMenu}">
  <Sidebar />
  <div class="j-content">
    {#if ready}
      <slot />
    {/if}
    <PlayerBottomBar on:show-current-songs="{() => (showCurrentList = true)}" />
    <CurrentSongs bind:show="{showCurrentList}" />

    <FloatPlayOrPause />
  </div>
</main>

{#if showDropZone}
  <DropZone />
{/if}

{#if showDropLoading}
  <DropLoading />
{/if}

<EditLyrics />

<style uno:preflights uno:safelist global>
  :global(body) {
    --uno: 'bg-light-3 m-0 p-0 overflow-hidden text-secondary';
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
      'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
    user-select: none;
    -webkit-user-select: none;
  }
  .j-main {
    --uno: 'flex h-[100vh] items-stretch';
  }
  .j-content {
    --uno: 'flex-grow bg-light- flex flex-col relative';
  }
</style>
