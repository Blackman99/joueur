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
    paginateSelectedPlaylistSongs,
    playlists,
    paused,
    playingSongId,
    playedSeconds,
    CURRENT_TIME_KEY,
    playingSong,
    currentPlayingSongIds,
    CURRENT_SONGS_KEY,
    playNext,
    volume,
    VOLUME_KEY,
    audioDom,
    mode,
    PLAYING_KEY,
    togglePlayOrPause,
    duration,
    COLOR_MODE_KEY,
    isDark,
    inWindow,
    selectedPlaylistSongsOffset,
    selectedPlaylistSongsScrollTop,
  } from '$lib/store'
  import { get } from 'svelte/store'
  import type { Subscription } from 'dexie'
  import CurrentPlayingSongs from '$lib/components/CurrentPlayingSongs.svelte'
  import EditLyrics from '$lib/components/lyrics/EditLyrics.svelte'
  import AppBar from '$lib/components/AppBar.svelte'

  // Mount global Buffer
  globalThis.Buffer = Buffer

  let showDropZone = false
  let showDropLoading = false
  let showCurrentList = false
  let percentage = '0'

  // effects
  // Notice that not use $ because the subscriptions timing is not fixed
  let cleanupDropListener: () => void
  let unsubscribePlayingSongId: () => void
  let unsubscribePlayedSeconds: () => void
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

    currentPlayingSongIds.set(currentSongIds)

    await db.getAllList()

    cleanupDropListener = await appWindow.onFileDropEvent(async evt => {
      switch (evt.payload.type) {
        case 'hover':
          if (!evt.payload?.paths.length) return
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
                if (song) await db.addSong(song)
              } else {
                const res = await readDir(path, { recursive: true })
                const songs = await parseSongsFromFileEntries(res)
                await db.addSongs(songs, addedSongNumber => {
                  percentage = ((addedSongNumber * 100) / songs.length).toFixed(
                    2
                  )
                })
              }
            }
          } catch (error) {
          } finally {
            showDropLoading = false
          }
      }
    })

    unsubscribePlayingSongId = playingSongId.subscribe(async newSongId => {
      localStorage.setItem(PLAYING_SONG_ID_KEY, newSongId.toString())
      playingSong.set(await db.songs.where('id').equals(newSongId).first())
    })

    await appWindow.onCloseRequested(async _evt => {
      localStorage.setItem(CURRENT_TIME_KEY, get(playedSeconds).toString())
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

  $: {
    if ($isDark) {
      document.querySelector('html')?.classList.add('dark')
    } else {
      document.querySelector('html')?.classList.remove('dark')
    }
    localStorage.setItem(COLOR_MODE_KEY, $isDark ? 'on' : 'off')
  }

  const resetPlaylistSongs = () => {
    localStorage.setItem(
      SELECTED_PLAYLIST_ID_KEY,
      $selectedPlaylistId.toString()
    )
    $selectedPlaylistSongsOffset = 0
    $selectedPlaylistSongsScrollTop = 0
    paginateSelectedPlaylistSongs()
  }

  $: {
    $playlists
    paginateSelectedPlaylistSongs()
  }

  $: {
    $selectedPlaylistId
    resetPlaylistSongs()
  }

  $: {
    localStorage.setItem(MODE_KEY, $mode)
  }

  onDestroy(() => {
    cleanupDropListener?.()
    unsubscribePlayingSongId?.()
    unsubscribePlayedSeconds?.()
    unsubscribePaused?.()
    playlistSubscriber?.unsubscribe()
    localStorage.setItem(CURRENT_TIME_KEY, get(playedSeconds).toString())
    window.removeEventListener('keyup', handleSpaceKeyboard)
  })

  const setVolume = () => {
    localStorage.setItem(VOLUME_KEY, $volume.toString())
    if ($audioDom) {
      $audioDom.volume = $volume
    }
  }

  $: {
    $volume
    setVolume()
  }

  const handleTimeUpdate = () => {
    $playedSeconds = $audioDom.currentTime
  }
</script>

{#if $playingSong}
  <audio
    bind:this="{$audioDom}"
    bind:duration="{$duration}"
    src="{convertFileSrc($playingSong.path)}"
    style="display: none;"
    title="{$playingSong.title} - {$playingSong.artist}"
    crossorigin="anonymous"
    on:ended="{playNext}"
    on:timeupdate="{handleTimeUpdate}"
    on:play="{() => ($paused = false)}"
    on:loadedmetadata="{handleLoadedMetadata}"
    on:pause="{() => ($paused = true)}"
  >
  </audio>
{/if}

<svelte:head>
  {@html `
<script>
  if(window.localStorage.getItem('${COLOR_MODE_KEY}') === 'on') {
    document.querySelector('html').classList.add('dark')
  } else {
    document.querySelector('html').classList.remove('dark')
  }
</script>`}
</svelte:head>

<svelte:body
  on:mouseenter="{() => ($inWindow = true)}"
  on:mouseleave="{() => ($inWindow = false)}"
/>

<AppBar />
<main class="j-main" on:contextmenu="{handleContextMenu}">
  <Sidebar />
  <div class="j-content">
    <slot />
    <PlayerBottomBar on:show-current-songs="{() => (showCurrentList = true)}" />
    <CurrentPlayingSongs bind:show="{showCurrentList}" />
  </div>
</main>

{#if showDropZone}
  <DropZone />
{/if}

{#if showDropLoading}
  <DropLoading>
    ({percentage}%) Just a sec...
  </DropLoading>
{/if}

<EditLyrics />

<style uno:preflights uno:safelist global>
  :global(body) {
    --uno: 'bg-light-1 dark:bg-dark-9 m-0 p-0 overflow-hidden text-secondary text-secondary dark:text-[#e3e3e3]';
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande',
      'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
    user-select: none;
    -webkit-user-select: none;
  }
  :global(.j-song-bg) {
    --uno: 'bg-light-1 dark:bg-dark-9';
  }
  :global(html.dark) {
    color-scheme: dark;
  }
  .j-main {
    --uno: 'flex h-[100vh] items-stretch box-border pt-[42px]';
  }
  .j-content {
    --uno: 'flex-grow flex flex-col relative';
  }
</style>
