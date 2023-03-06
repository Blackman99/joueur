<script lang="ts">
  import { db } from "$lib/db"
    import type { Playlist } from "$lib/types"
  import { liveQuery } from "dexie"
  import type { Readable } from 'svelte/store'


  const playlists = liveQuery(() => db.playlists.toArray()) as unknown as Readable<Playlist[]>
</script>

<div class="playlist">
  <div class="lists">
    {#if $playlists}
      {#each $playlists as playlist (playlist.id)}
        <div class="playlist-item">
          {playlist.title}
        </div>
      {/each}
    {/if}
  </div>
  <div class="create-list playlist-item">
    <div class="i-ic:round-playlist-add"></div>
  </div>
</div>

<style>
  .playlist {
    --uno: 'w-[15vw] bg-light-3 flex flex-col';
  }
  .playlist-item {
    --uno: 'py-2 px-4';
  }
  .lists {
    --uno: 'flex-grow';
  }
  .create-list {
    --uno: 'text-6 cursor-pointer hover:bg-primary hover:bg-opacity-8 active:bg-opacity-16 items-center flex justify-center';
  }
</style>