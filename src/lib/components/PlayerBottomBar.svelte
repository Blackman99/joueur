<script lang="ts">
  import { liveQuery } from 'dexie'
  import type { Readable } from 'svelte/store'
  import { slide } from 'svelte/transition'
  import IconButton from './IconButton.svelte'
  import type { Song } from '$lib/types'
  import { db } from '$lib/db'
  import {
    playingSongId,
    displayPlayedSeconds,
    playedSeconds,
  } from '$lib/store'
  import SoundLow from '$lib/icons/SoundLow.svelte'
  import ControlCurrentList from '$lib/icons/ControlCurrentList.svelte'
  import ControlPrev from '$lib/icons/ControlPrev.svelte'
  import ControlNext from '$lib/icons/ControlNext.svelte'

  $: playingSong = liveQuery(() =>
    db.songs.where('id').equals($playingSongId).first()
  ) as unknown as Readable<Song | undefined>
  $: percentage =
    ($playedSeconds / (($playingSong?.duration || 0) / 1000)) * 100

  const handleBarClick = (e: any) => {
    console.log(e)
  }
</script>

{#if $playingSong}
  <div
    class="player-bottom-bar"
    transition:slide
    on:click="{handleBarClick}"
    on:keypress
  >
    <div
      class="progress-bg"
      style="--joueur-played-percentage: -{100 - percentage}%;"
    ></div>

    <div class="inner">
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
  </div>
{/if}

<style>
  .player-bottom-bar {
    --uno: 'shrink-0 bg-white shadow-t-lg px-4 pb-2 pt-1 text-[14px] relative';
  }
  .inner {
    --uno: 'flex items-center relative z-3';
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
  .progress-bg {
    --uno: 'absolute bg-primary left-0 top-0 right-0 bottom-0 z-2 bg-opacity-10 transition-transform transition-300';
    transform: translateX(var(--joueur-played-percentage));
  }
</style>
