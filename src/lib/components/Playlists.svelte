<script lang="ts">
  import { db } from '$lib/db'
  import PlaylistActive from '$lib/icons/PlaylistActive.svelte'
  import { selectedPlaylistId } from '$lib/store'
  import type { Playlist } from '$lib/types'
  import { liveQuery } from 'dexie'
  import type { Readable } from 'svelte/store'
  import { scale } from 'svelte/transition'

  const playlists = liveQuery(() =>
    db.playlists.toArray()
  ) as unknown as Readable<Playlist[]>

  const handlePlaylistClick = (id: number) => {
    $selectedPlaylistId = id
  }
</script>

<div class="playlist">
  <div class="lists">
    {#if $playlists}
      {#each $playlists as playlist (playlist.id)}
        {@const active = playlist.id === $selectedPlaylistId}
        <div
          class="playlist-item"
          class:active="{active}"
          on:click="{() => handlePlaylistClick(playlist.id)}"
          on:keyup="{() => handlePlaylistClick(playlist.id)}"
        >
          <div>
            {playlist.title}
          </div>
          {#if active}
            <div class="active-icon" transition:scale>
              <PlaylistActive />
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .playlist {
    --uno: 'w-[18vw] min-w-[160px] max-w-[240px] bg-light-2 flex flex-col text-[14px] pt-2';
    user-select: none;
    -webkit-user-select: none;
  }
  .playlist-item {
    --uno: 'leading-10 px-4 flex items-center justify-between hover:bg-primary hover:bg-opacity-8 active:bg-opacity-16 cursor-pointer';
  }
  .lists {
    --uno: 'flex-grow';
  }
  .active {
    --uno: 'text-primary';
  }
  .active-icon {
    --uno: 'text-5 flex items-center';
  }
</style>
