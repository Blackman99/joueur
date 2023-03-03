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
    <div class="info">
      <div>{$playingSong.title}</div>
      <div class="meta">{$playingSong.artist} - {$playingSong.album}</div>
    </div>
    <div class="progress">
      <div>progress bar</div>
      <div>seconds</div>
    </div>
  </div>
{/if}

<style>
  .player-bottom-bar {
    --uno: 'shrink-0 bg-white shadow-t-lg py-3 px-4 text-[14px]';
  }
  .info {
    --uno: 'flex items-end';
  }
  .meta {
    --uno: 'text-gray-4 text-3 ml-4';
  }
  .progress {
    --uno: 'flex items-center';
  }
</style>
