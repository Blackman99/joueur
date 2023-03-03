<script lang="ts">
  import { liveQuery } from 'dexie'
  import type { Readable } from 'svelte/store'
  import { slide } from 'svelte/transition'
  import type { Song } from '$lib/types'
  import { db } from '$lib/db'
  import { playingSongId } from '$lib/store'

  $: playingSong = liveQuery(() =>
    db.songs.where('id').equals($playingSongId).first()
  ) as unknown as Readable<Song | undefined>
</script>

{#if $playingSong}
  <div class="player-bottom-bar" transition:slide>
    <div>Album cover</div>
    <div>
      <div>title - artist</div>
      <div>bar</div>
    </div>
    <div>seconds</div>
  </div>
{/if}

<style>
  .player-bottom-bar {
    --uno: 'h-[60px] flex shrink-0 bg-white';
  }
</style>
