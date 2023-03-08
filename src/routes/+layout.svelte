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
    refreshCurrentSongs,
    playlists,
    playing,
    playingSongId,
    playedSeconds,
    CURRENT_TIME_KEY,
    playingSong,
    PLAYING_KEY,
    currentSongs,
    CURRENT_SONGS_KEY,
    playNext,
    volume,
    VOLUME_KEY,
  } from '$lib/store'
  import { get } from 'svelte/store'
  import type { Subscription } from 'dexie'
  import CurrentSongs from '$lib/components/CurrentSongs.svelte'

  // Mount global Buffer
  globalThis.Buffer = Buffer

  let showDropZone = false
  let showDropLoading = false
  let ready = false
  let showCurrentList = false

  // effects
  let cleanupDropListener: () => void
  let cleanupWindowClose: () => void
  let unsubscribePlaying: () => void
  let unsubscribePlayingSong: () => void
  let unsubscribePlaylistId: () => void
  let unsubscribePlayingSongId: () => void
  let unsubscribePlayedSeconds: () => void
  let unsubscribeCurrentSongs: () => void
  let unsubscribeVolume: () => void
  let currentTimerInterval: ReturnType<typeof setInterval>
  let playlistSubscriber: Subscription

  let audio: HTMLAudioElement

  onMount(async () => {
    const currentSongIds = JSON.parse(
      localStorage.getItem(CURRENT_SONGS_KEY) || '[]'
    ) as number[]

    currentSongs.set(await db.songs.where('id').anyOf(currentSongIds).toArray())

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

    cleanupWindowClose = await appWindow.onCloseRequested(async evt => {
      localStorage.setItem(CURRENT_TIME_KEY, get(playedSeconds).toString())
    })

    unsubscribeVolume = volume.subscribe(v => {
      localStorage.setItem(VOLUME_KEY, v.toString())
    })
  })

  let first = true

  // This happens as the audio element is ready
  const handleCanPlayThrough = () => {
    if (first) {
      audio.currentTime = get(playedSeconds)
      first = false
    } else if (get(playing)) {
      audio.play()
    }

    // Subscriptions below should add here to avoid happen before audio is ready
    if (!unsubscribePlaying) {
      unsubscribePlaying = playing.subscribe(v => {
        if (!v) {
          audio?.pause()
        } else {
          audio?.play()
        }
        localStorage.setItem(PLAYING_KEY, v ? 'on' : 'off')
      })
    }

    if (!currentTimerInterval) {
      currentTimerInterval = setInterval(() => {
        playedSeconds.set(audio?.currentTime)
      }, 500)
    }

    if (unsubscribePlayedSeconds) {
      unsubscribePlayedSeconds = playedSeconds.subscribe(ps => {
        console.log('ps: ', ps)

        audio.currentTime = ps
      })
    }
  }

  const handleContextMenu = (e: any) => {
    if (!import.meta.env.DEV) {
      e.preventDefault()
    }
  }

  const handleCurrentTimeChange = (e: any) => {
    if (audio) {
      audio.currentTime = e.detail
      playedSeconds.set(e.detail)
    }
  }

  onDestroy(() => {
    cleanupDropListener?.()
    cleanupWindowClose?.()
    unsubscribePlaying?.()
    unsubscribePlaylistId?.()
    unsubscribePlayingSong?.()
    unsubscribePlayingSongId?.()
    unsubscribePlayedSeconds?.()
    unsubscribeCurrentSongs?.()
    playlistSubscriber?.unsubscribe()
    if (currentTimerInterval) {
      clearInterval(currentTimerInterval)
    }

    localStorage.setItem(CURRENT_TIME_KEY, get(playedSeconds).toString())
  })
</script>

{#if $playingSong}
  <audio
    bind:this="{audio}"
    src="{convertFileSrc($playingSong.path)}"
    on:canplaythrough="{handleCanPlayThrough}"
    style="display: none;"
    on:ended="{playNext}"
    bind:volume="{$volume}"></audio>
{/if}

<main class="j-main" on:contextmenu="{handleContextMenu}">
  <Sidebar />
  <div class="j-content">
    {#if ready}
      <slot />
    {/if}
    <PlayerBottomBar
      on:current-time-change="{handleCurrentTimeChange}"
      on:show-current-songs="{() => (showCurrentList = true)}"
    />
    <CurrentSongs bind:show="{showCurrentList}" />
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
