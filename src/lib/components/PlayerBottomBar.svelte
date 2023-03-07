<script lang="ts">
  import { liveQuery } from 'dexie'
  import type { Readable } from 'svelte/store'
  import { slide } from 'svelte/transition'
  import IconButton from './IconButton.svelte'
  import type { Song } from '$lib/types'
  import { db } from '$lib/db'
  import { playingSongId, displayPlayedSeconds } from '$lib/store'
  import SoundLow from '$lib/icons/SoundLow.svelte'
  import ControlCurrentList from '$lib/icons/ControlCurrentList.svelte'
  import ControlPrev from '$lib/icons/ControlPrev.svelte'
  import ControlNext from '$lib/icons/ControlNext.svelte'

  $: playingSong = liveQuery(() =>
    db.songs.where('id').equals($playingSongId).first()
  ) as unknown as Readable<Song | undefined>
</script>

{#if $playingSong}
  <div class="player-bottom-bar" transition:slide>
    <IconButton size="20px">
      <ControlPrev />
    </IconButton>

    <div class="middle">
      <div class="title">
        <div>{$playingSong.title}</div>
        <div class="controls">
          <IconButton>
            <SoundLow />
          </IconButton>
          <IconButton>
            <ControlCurrentList />
          </IconButton>
        </div>
      </div>
      <div class="meta">
        <div>
          {$playingSong.artist} - {$playingSong.album || 'Unknown'}
        </div>
        <div class="seconds">
          {$displayPlayedSeconds} / {$playingSong.display_duration}
        </div>
      </div>
    </div>

    <IconButton size="20px">
      <ControlNext />
    </IconButton>
  </div>
{/if}

<style>
  .player-bottom-bar {
    --uno: 'shrink-0 bg-white shadow-t-lg py-2 px-4 text-[14px] flex items-center';
  }
  .meta {
    --uno: 'text-gray-4 text-3 flex justify-between';
  }
  .controls {
    --uno: 'flex items-center';
  }
  .seconds {
    --uno: 'text-gray-4 text-3 mx-2';
  }
  .middle {
    --uno: 'flex-grow mx-2';
  }
  .title {
    --uno: 'flex items-center justify-between';
  }
</style>
