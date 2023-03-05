<script lang="ts">
  import { db } from "$lib/db"
    import type { Playlist } from "$lib/types"
  import { liveQuery } from "dexie"
  import type { Readable } from 'svelte/store'


  const playlists = liveQuery(() => db.playlists.toArray()) as unknown as Readable<Playlist[]>
</script>

<div class="playlist">
  {#if $playlists}
    {#each $playlists as playlist (playlist.id)}
      <div class="playlist-item">
        {playlist.title}
      </div>
    {/each}
  {/if}
</div>

<style>
  .playlist {
    --uno: 'w-[15vw] bg-light-4';
  }
  .playlist-item {
    --uno: 'py-2 px-4';
  }
</style>