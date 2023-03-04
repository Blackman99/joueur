<script lang="ts">
  import { liveQuery } from 'dexie'
  import type { Readable } from 'svelte/store'
  import { slide } from 'svelte/transition'
  import IconButton from './IconButton.svelte'
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
      <div class="title">
        <div>{$playingSong.title}</div>
        <div class="meta">
          {$playingSong.artist} - {$playingSong.album || 'Unknown'}
        </div>
      </div>
      <div class="append">
        <IconButton>
          <div class="i-iconoir:sound-low"></div>
        </IconButton>
        <div class="seconds">/{$playingSong.display_duration}</div>
      </div>
    </div>
    <div class="controls">
      <IconButton>
        <div class="i-fluent:previous-48-regular"></div>
      </IconButton>
      <div class="bar">progress bar</div>
      <IconButton>
        <div class="i-fluent:next-48-regular"></div>
      </IconButton>
    </div>
  </div>
{/if}

<style>
  .player-bottom-bar {
    --uno: 'shrink-0 bg-white shadow-t-lg py-2 px-4 text-[14px]';
  }
  .info {
    --uno: 'flex items-center justify-between';
  }
  .meta {
    --uno: 'text-gray-4 text-3 ml-2';
  }
  .controls {
    --uno: 'flex items-center mt-1';
  }
  .title {
    --uno: 'flex items-end';
  }

  .bar {
    --uno: 'flex-grow mx-2';
  }
  .seconds {
    --uno: 'text-gray-4 text-3 ml-2';
  }
  .append {
    --uno: 'flex items-center';
  }
</style>
