<script lang="ts">
  import { db } from "$lib/db"
  import type { Album } from "$lib/types"
  import { liveQuery } from "dexie"
  import type { Readable } from "svelte/store"

  const albums = liveQuery(() => db.albums.toArray()) as unknown as Readable<Album[]>

  $: hasAlbum = $albums && $albums.length
</script>

<div class="albums">
  <div>
    {#if hasAlbum}
      {#each $albums as album}
        <div>
          {#if album.cover}
            <img class="cover" src="{album.cover}" alt="{album.title}" />
          {/if}
          {album.title} - {album.artist}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .albums {
    --uno: 'flex-grow';
  }
  .cover {
    --uno: 'w-[40px] h-[40px] ';
  }
</style>
