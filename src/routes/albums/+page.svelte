<script lang="ts">
  import { db } from '$lib/db'
  import type { Song } from '$lib/types'
  import {
    selectedAlbum,
    selectedAlbumSongs,
    albums,
    offset,
    limit,
    totalAlbumNumber,
    scrollTop,
  } from './store'
  import Backdrop from '$lib/components/Backdrop.svelte'
  import PlayingIcon from '$lib/components/PlayingIcon.svelte'
  import {
    currentPlayingSongIds,
    playedSeconds,
    playingSongId,
  } from '$lib/store'
  import { fade } from 'svelte/transition'
  import { onMount } from 'svelte'
  import VirtualScroll from '$lib/components/VirtualScroll.svelte'
  import PopupEditor from '$lib/components/PopupEditor.svelte'
  import { updateAlbum } from '$lib/utils/audio'
  import IconButton from '$lib/components/IconButton.svelte'
  import DialogClose from '$lib/icons/DialogClose.svelte'

  $: hasAlbum = !!$albums.length

  const queryAlbums = async () => {
    $albums = await db.albums.offset($offset).limit($limit).toArray()
  }

  $: {
    $offset
    $limit
    queryAlbums()
  }

  const getAlbumSongs = async () => {
    if (!$selectedAlbum) return
    $selectedAlbumSongs = await db.songs
      .where('id')
      .anyOf($selectedAlbum.songIds)
      .toArray()
  }

  const handlePlayAlbumSongs = (song: Song) => {
    $playingSongId = song.id
    $playedSeconds = 0
    $currentPlayingSongIds = $selectedAlbum?.songIds || []
  }

  $: {
    if ($selectedAlbum) {
      getAlbumSongs()
    }
  }

  onMount(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        $selectedAlbum = undefined
      }
    }
    window.addEventListener('keyup', handler)
    return () => {
      window.removeEventListener('keyup', handler)
    }
  })

  let editingAlbumTitle = ''
  let showAlbumTitleEditor = false

  const handleShowAlbumTitleEditor = () => {
    editingAlbumTitle = $selectedAlbum?.title || ''
    showAlbumTitleEditor = true
  }

  const handleSaveAlbum = async () => {
    if (!$selectedAlbum) return
    await updateAlbum($selectedAlbum, editingAlbumTitle)
    $selectedAlbum.title = editingAlbumTitle
    $selectedAlbum = $selectedAlbum
    showAlbumTitleEditor = false
  }
</script>

<div class="albums">
  {#if hasAlbum}
    <VirtualScroll
      bind:offset="{$offset}"
      bind:limit="{$limit}"
      bind:scrollTop="{$scrollTop}"
      total="{$totalAlbumNumber}"
      items="{$albums}"
      gapX="20px"
      gapY="20px"
      mode="grid"
      customStyle="padding: 24px;"
      customClass="j-song-bg"
    >
      <div
        slot="item"
        let:item="{album}"
        class="album-row"
        on:click="{() => ($selectedAlbum = album)}"
        on:keypress
      >
        {#if album.cover}
          <img class="cover" src="{album.cover}" alt="{album.title}" />
        {/if}
        <div class="info">
          <div class="title">
            <div class="truncate">
              {album.title}
            </div>
            <div class="meta">
              <div class="text-right">
                {album.artist}
              </div>
              &nbsp;·&nbsp;
              <div class="text-left">
                {album.songIds.length} tracks
              </div>
            </div>
          </div>
        </div>
      </div>
      <div slot="skeleton-item" class="album-row">
        <div class="cover cover-skeleton"></div>
        <div class="info">
          <div class="title">
            <div class="title-skeleton"></div>
            <div class="meta meta-skeleton"></div>
          </div>
        </div>
      </div>
    </VirtualScroll>
  {/if}
</div>

{#if $selectedAlbum}
  <Backdrop on:click="{() => ($selectedAlbum = undefined)}" />
{/if}

{#if $selectedAlbum}
  <div class="selected-album" transition:fade="{{ duration: 300 }}">
    <div class="selected-album-info">
      <div class="flex">
        {#if $albums}
          <img
            class="selected-album-cover"
            src="{$selectedAlbum.cover}"
            alt="{$selectedAlbum.title}"
          />
        {/if}
        <div class="selected-album-meta">
          <PopupEditor
            bind:show="{showAlbumTitleEditor}"
            bind:value="{editingAlbumTitle}"
            on:done="{handleSaveAlbum}"
          >
            <div
              class="selected-album-title"
              on:keypress
              on:click="{handleShowAlbumTitleEditor}"
            >
              {$selectedAlbum.title}
            </div>
          </PopupEditor>
          <div class="selected-album-artist">
            {$selectedAlbum.artist}
          </div>
        </div>
      </div>

      <IconButton on:click="{() => ($selectedAlbum = undefined)}">
        <DialogClose />
      </IconButton>
    </div>
    <div class="selected-album-songs">
      <div class="py-2">Tracks</div>
      {#each $selectedAlbumSongs as song (song.id)}
        <div
          class="selected-album-song-item"
          on:dblclick="{() => handlePlayAlbumSongs(song)}"
        >
          <div class="flex items-center">
            <div class="mr-2">
              {song.title}
            </div>
            {#if $playingSongId === song.id}
              <PlayingIcon />
            {/if}
          </div>
          <div class="text-gray-3 text-[12px]">
            {song.display_duration}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .albums {
    --uno: 'flex-grow overflow-y-hidden relative';
  }
  .cover {
    --uno: 'aspect-1 w-full object-cover';
  }
  .album-row {
    --uno: 'flex flex-col item-start max-w-[200px]';
  }
  .info {
    --uno: 'ml-2 text-[14px] mt-2 text-center';
  }
  .meta {
    --uno: 'text-warm-gray-5 text-[12px] truncate flex justify-center';
  }
  .meta > div {
    --uno: 'truncate';
    width: 50%;
  }
  .selected-album {
    --uno: 'fixed w-[80vw] h-[80vh] top-[10vh] left-[10vw] z-101 flex flex-col rounded-lg p-4 bg-white bg-opacity-20 dark:bg-black dark:bg-opacity-70 z-108';
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
  .selected-album-info {
    --uno: 'flex mb-4 text-gray-2 justify-between items-start';
  }
  .selected-album-meta {
    --uno: 'ml-2';
  }
  .selected-album-title {
    --uno: 'text-8';
  }
  .selected-album-artist {
    --uno: 'text-4 text-gray-3 mt-2';
  }
  .selected-album-songs {
    --uno: 'text-gray-2 text-[14px]';
  }
  .selected-album-song-item {
    --uno: 'flex items-center transition-colors px-2 justify-between py-1 hover:bg-white hover:bg-opacity-30';
  }
  .selected-album-cover {
    --uno: 'w-[180px] aspect-1 object-cover';
  }
  .cover-skeleton {
    --uno: 'bg-gray-2 dark:bg-gray-8';
  }
  .title-skeleton {
    --uno: 'h-[14px] bg-gray-3 dark:bg-gray-8 w-[100px] mx-auto';
  }
  .meta-skeleton {
    --uno: 'h-[12px] w-[40%] dark:bg-gray-8 bg-gray-2 mt-2 mx-auto';
  }
  :global(.bg-light-2) {
    --uno: 'bg-light-2';
  }
</style>
