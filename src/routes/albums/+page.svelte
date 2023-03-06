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
        <div class="album-row">
          {#if album.cover}
            <img class="cover" src="{album.cover}" alt="{album.title}" />
          {/if}
          <div class="info">
            {album.title} <br>
            <span class="meta">
             By {album.artist} - {album.songIds.length} songs 
            </span>
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .albums {
    --uno: 'flex-grow overflow-y-auto';
  }
  .cover {
    --uno: 'w-[40px] h-[40px] fit-cover rounded';
  }
  .album-row {
    --uno: 'flex item-start py-2 px-4';
  }
  .info {
    --uno: 'ml-2 text-[14px]';
  }
  .meta {
    --uno: 'text-warm-gray-5 text-[12px]';
  }
</style>
