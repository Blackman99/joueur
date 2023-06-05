<script lang="ts">
  import { Buffer } from 'buffer'
  import { appWindow } from '@tauri-apps/api/window'
  import { readDir } from '@tauri-apps/api/fs'
  import { onDestroy, onMount } from 'svelte'
  import { get } from 'svelte/store'
  import DropZone from '$lib/components/layouts/DropZone.svelte'
  import {
    getSongInfoFromFile,
    isAudio,
    parseSongsFromFileEntries,
  } from '$lib/utils/audio'
  import DropLoading from '$lib/components/layouts/DropLoading.svelte'
  import { db } from '$lib/db'
  import PlayerBottomBar from '$lib/components/controls/PlayerBottomBar.svelte'
  import Sidebar from '$lib/components/layouts/Sidebar.svelte'
  import {
    COLOR_MODE_KEY,
    CURRENT_SONGS_KEY,
    CURRENT_TIME_KEY,
    MODE_KEY,
    PLAYING_KEY,
    PLAYING_SONG_ID_KEY,
    SELECTED_PLAYLIST_ID_KEY,
    currentPlayingSongIds,
    inWindow,
    isDark,
    mode,
    paginateSelectedPlaylistSongs,
    paused,
    playedSeconds,
    playingSong,
    playingSongId,
    playlists,
    selectedPlaylistId,
    selectedPlaylistSongsOffset,
    selectedPlaylistSongsScrollTop,
    togglePlayOrPause,
  } from '$lib/store'
  import CurrentPlayingSongs from '$lib/components/CurrentPlayingSongs.svelte'
  import EditTagDialog from '$lib/components/lyrics/EditTagDialog.svelte'
  import AppBar from '$lib/components/layouts/AppBar.svelte'
  import { windowInnerWidth } from '$lib/layout'

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

  const handleSpaceKeyboard = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault()
      togglePlayOrPause()
    }
  }

  const handleContextMenu = (e: any) => {
    if (!import.meta.env.DEV) e.preventDefault()
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
    window.addEventListener('contextmenu', handleContextMenu)
  })

  $: {
    localStorage.setItem(PLAYING_KEY, $paused ? 'off' : 'on')
  }

  $: {
    if ($isDark) document.querySelector('html')?.classList.add('dark')
    else document.querySelector('html')?.classList.remove('dark')

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
    localStorage.setItem(CURRENT_TIME_KEY, get(playedSeconds).toString())
    window.removeEventListener('keyup', handleSpaceKeyboard)
    window.removeEventListener('contextmenu', handleContextMenu)
  })
</script>

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

<svelte:window bind:innerWidth="{$windowInnerWidth}" />

<AppBar />
<main class="j-main">
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

<EditTagDialog />

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
    --uno: 'flex h-[100vh] items-stretch box-border pt-[36px]';
  }
  .j-content {
    --uno: 'flex-grow flex flex-col relative';
  }
</style>
