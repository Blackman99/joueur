<script lang="ts">
  import { db } from '$lib/db'
  import type { Album, Song } from '$lib/types'
  import { liveQuery } from 'dexie'
  import type { Readable } from 'svelte/store'
  import { selectedAlbum, selectedAlbumSongs } from './store'
  import Backdrop from '$lib/components/Backdrop.svelte'
  import PlayingIcon from '$lib/components/PlayingIcon.svelte'
  import { currentSongs, playedSeconds, playingSongId } from '$lib/store'
  import { flip } from 'svelte/animate'
  import { crossfade, fade } from 'svelte/transition'

  const [send, receive] = crossfade({
    fallback() {
      return {
        duration: 0,
        css: () => `
					display: none;
				`,
      }
    },
  })

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

  const handlePlayAlbumSongs = (song: Song) => {
    $playingSongId = song.id
    $playedSeconds = 0
    $currentSongs = $selectedAlbumSongs
  }

  $: {
    if ($selectedAlbum) {
      getAlbumSongs()
    }
  }
</script>

<div class="albums">
  <div class="album-list">
    {#if hasAlbum}
      {#each $albums.filter(al => al.id !== $selectedAlbum?.id) as album (album.id)}
        <div
          class="album-row"
          on:click="{() => ($selectedAlbum = album)}"
          on:keypress
          animate:flip="{{
            duration: 500,
          }}"
          in:receive="{{ key: album.id }}"
          out:send="{{ key: album.id }}"
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
                {album.artist} · {album.songIds.length} tracks
              </span>
            </div>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

{#if $selectedAlbum}
  <Backdrop on:click="{() => ($selectedAlbum = undefined)}" />
{/if}

{#if $selectedAlbum}
  <div class="selected-album" transition:fade="{{ duration: 300 }}">
    <div class="selected-album-info">
      {#if $albums}
        {#each $albums.filter(al => al.id === $selectedAlbum?.id) as sAlbum (sAlbum.id)}
          <img
            class="selected-album-cover"
            animate:flip="{{
              duration: 500,
            }}"
            in:receive="{{ key: sAlbum.id }}"
            out:send="{{ key: sAlbum.id }}"
            src="{sAlbum.cover}"
            alt="{sAlbum.title}"
          />
        {/each}
      {/if}
      <div class="selected-album-meta">
        <div class="selected-album-title">
          {$selectedAlbum.title}
        </div>
        <div class="selected-album-artist">
          {$selectedAlbum.artist}
        </div>
      </div>
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
    --uno: 'flex-grow overflow-y-auto';
  }
  .album-list {
    --uno: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4';
  }
  .cover {
    --uno: 'aspect-1 w-full object-cover';
  }
  .album-row {
    --uno: 'flex flex-col item-start';
  }
  .info {
    --uno: 'ml-2 text-[14px] mt-2 text-center';
  }
  .meta {
    --uno: 'text-warm-gray-5 text-[12px]';
  }
  .selected-album {
    --uno: 'fixed w-[80vw] h-[80vh] top-[10vh] left-[10vw] z-101 flex flex-col rounded-lg p-4 bg-white bg-opacity-20;';
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
  .selected-album-info {
    --uno: 'flex mb-4 text-gray-2';
  }
  .selected-album-meta {
    --uno: 'ml-2';
  }
  .selected-album-title {
    --uno: 'text-8';
  }
  .selected-album-artist {
    --uno: 'text-4 text-gray-3';
  }
  .selected-album-songs {
    --uno: 'text-gray-2 text-[14px]';
  }
  .selected-album-song-item {
    --uno: 'flex items-center transition-colors px-2 justify-between py-1 hover:bg-white hover:bg-opacity-30';
  }
  .selected-album-cover {
    --uno: 'w-[200px] aspect-1 object-cover';
  }
</style>
