<script lang="ts">
  import Songs from '$lib/components/Songs.svelte'
  import { db } from '$lib/db'
  import PlaylistActive from '$lib/icons/PlaylistActive.svelte'
  import type { Artist, Song } from '$lib/types'
  import { liveQuery } from 'dexie'
  import type { Readable } from 'svelte/store'

  const artists = liveQuery(() => db.artists.toArray()) as unknown as Readable<
    Artist[]
  >

  let selectedArtist: Artist

  $: hasArtist = $artists && $artists.length

  const handleArtistClick = (artist: Artist) => {
    selectedArtist = artist
  }

  let selectedArtistSongs: Song[] = []

  const getArtistSongs = async () => {
    selectedArtistSongs = await db.songs
      .where('id')
      .anyOf(selectedArtist.songIds)
      .toArray()
  }

  $: {
    if (selectedArtist) {
      getArtistSongs()
    }
  }
</script>

<div class="artists">
  <div class="artist-list">
    {#if hasArtist}
      {#each $artists as artist (artist.id)}
        {@const active = artist.id === selectedArtist?.id}
        <div
          class="artist-item"
          class:active="{active}"
          on:click="{() => handleArtistClick(artist)}"
          on:keyup="{() => handleArtistClick(artist)}"
        >
          <div class="title">
            {artist.title}
            <div class="meta">
              ({artist.songIds.length})
            </div>
          </div>
          <div class="active-icon">
            {#if active}
              <PlaylistActive />
            {/if}
          </div>
        </div>
      {/each}
    {/if}
  </div>
  <Songs songs="{selectedArtistSongs}" showActionsOnEmpty="{false}" />
</div>

<style>
  .artists {
    --uno: 'flex-grow overflow-y-hidden flex items-stretch';
  }
  .artist-list {
    --uno: 'w-[18vw] min-w-[220px] max-w-[240px] bg-light-2 overflow-y-auto';
  }
  .title {
    --uno: 'flex items-center';
  }
  .meta {
    --uno: 'text-gray-4 text-[12px] ml-2';
  }
  .artist-item {
    --uno: 'flex items-center justify-between text-[14px] leading-6 py-2 px-4 j-clickable-item';
  }
  .active {
    --uno: 'j-active-item';
  }
  .active-icon {
    --uno: 'text-4 ml-2';
  }
</style>
