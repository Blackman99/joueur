<script lang="ts">
  import { db } from '$lib/db'
  import CreatePlaylist from '$lib/icons/CreatePlaylist.svelte'
  import PlaylistActive from '$lib/icons/PlaylistActive.svelte'
  import { selectedPlaylistId } from '$lib/store'
  import type { Playlist } from '$lib/types'
  import { liveQuery } from 'dexie'
  import type { Readable } from 'svelte/store'
  import FloatAction from './FloatAction.svelte'
  import IconButton from './IconButton.svelte'

  const playlists = liveQuery(() =>
    db.playlists.toArray()
  ) as unknown as Readable<Playlist[]>
</script>

<div class="playlist">
  <div class="lists">
    {#if $playlists}
      {#each $playlists as playlist (playlist.id)}
        <div
          class="playlist-item"
          class:active="{playlist.id === $selectedPlaylistId}"
        >
          <div>
            {playlist.title}
          </div>
          <div class="active-icon">
            <PlaylistActive />
          </div>
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
    --uno: 'py-2 px-4 flex items-center justify-between';
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
