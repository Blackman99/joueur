<script lang="ts">
  import Songs from '$lib/components/Songs.svelte'
  import { db } from '$lib/db'
  import PlaylistActive from '$lib/icons/PlaylistActive.svelte'
  import type { Album } from '$lib/types'
  import { liveQuery } from 'dexie'
  import type { Readable } from 'svelte/store'
  import { onMount } from 'svelte'
  import {
    selectedAlbum,
    selectedAlbumSongs,
    SELECTED_ALBUM_KEY,
  } from './store'

  const albums = liveQuery(() => db.albums.toArray()) as unknown as Readable<
    Album[]
  >

  $: hasAlbum = $albums && $albums.length

  const getAlbumSongs = async () => {
    if (!$selectedAlbum) return
    $selectedAlbumSongs = await db.songs
      .where('id')
      .anyOf($selectedAlbum.songIds)
      .toArray()
  }

  $: {
    if ($selectedAlbum) {
      localStorage.setItem(SELECTED_ALBUM_KEY, $selectedAlbum.id.toString())
      getAlbumSongs()
    }
  }

  onMount(async () => {
    const selectedAlbumId = Number(localStorage.getItem(SELECTED_ALBUM_KEY))
    $selectedAlbum = await db.albums.where('id').equals(selectedAlbumId).first()
  })
</script>

<div class="albums">
  <div class="album-list">
    {#if hasAlbum}
      {#each $albums as album (album.id)}
        {@const active = $selectedAlbum?.id === album.id}
        <div
          class="album-row"
          class:active="{active}"
          on:click="{() => ($selectedAlbum = album)}"
          on:keypress
        >
          {#if album.cover}
            <img class="cover" src="{album.cover}" alt="{album.title}" />
          {/if}
          <div class="info">
            <div class="title">
              <div>
                {album.title}
              </div>
              <span class="meta">
                By {album.artist} - ({album.songIds.length})
              </span>
            </div>
            {#if active}
              <div class="icon-wrapper">
                <PlaylistActive />
              </div>
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
  <Songs songs="{$selectedAlbumSongs}" showActionsOnEmpty="{false}" />
</div>

<style>
  .albums {
    --uno: 'flex-grow overflow-y-hidden flex items-stretch';
  }
  .album-list {
    --uno: 'overflow-y-auto w-[40vw] min-w-[280px] max-w-[360px]';
  }
  .cover {
    --uno: 'w-[40px] h-[40px] fit-cover rounded';
  }
  .album-row {
    --uno: 'flex item-start py-2 px-4 j-clickable-item';
  }
  .active {
    --uno: 'j-active-item';
  }

  .info {
    --uno: 'ml-2 text-[14px] flex-grow flex items-center justify-between';
  }
  .meta {
    --uno: 'text-warm-gray-5 text-[12px]';
  }
  .icon-wrapper {
    --uno: 'flex-shrink-0 text-4';
  }
</style>
