<script lang="ts">
  import { db } from "$lib/db"
  import type { Artist } from "$lib/types"
  import { liveQuery } from "dexie"
  import type { Readable } from "svelte/store"

  const artists = liveQuery(() => db.artists.toArray()) as unknown as Readable<Artist[]>

  $: hasArtist = $artists && $artists.length
</script>

<div class="artists">
  <div>
    {#if hasArtist}
      {#each $artists as artist}
        <div>
          {artist.title}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .artists {
    --uno: 'flex-grow';
  }
</style>
