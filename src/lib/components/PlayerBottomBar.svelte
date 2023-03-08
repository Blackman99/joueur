<script lang="ts">
  import { slide } from 'svelte/transition'
  import IconButton from './IconButton.svelte'
  import { playingSong, displayPlayedSeconds, playedSeconds } from '$lib/store'
  import SoundLow from '$lib/icons/SoundLow.svelte'
  import ControlCurrentList from '$lib/icons/ControlCurrentList.svelte'
  import ControlPrev from '$lib/icons/ControlPrev.svelte'
  import ControlNext from '$lib/icons/ControlNext.svelte'
  import { createEventDispatcher } from 'svelte'
  import { spring } from 'svelte/motion'

  const pointerX = spring(0, {
    stiffness: 0.1,
    damping: 0.25,
  })

  let barDom: HTMLDivElement
  let showPointer = false

  const dispatch = createEventDispatcher()

  $: percentage =
    ($playedSeconds / (($playingSong?.duration || 0) / 1000)) * 100

  const handleBarClick = (e: any) => {
    const newPercentage = e.offsetX / barDom.offsetWidth
    if ($playingSong) {
      dispatch(
        'current-time-change',
        ($playingSong.duration / 1000) * newPercentage
      )
    }
  }

  const handlePointerMove = (e: any) => {
    if (e.target !== barDom.querySelector('.inner')) return
    pointerX.set(e.offsetX)
  }
</script>

{#if $playingSong}
  <div
    bind:this="{barDom}"
    class="player-bottom-bar"
    transition:slide
    on:mouseup="{handleBarClick}"
    on:mousemove="{handlePointerMove}"
    on:mouseenter="{() => (showPointer = true)}"
    on:mouseleave="{() => (showPointer = false)}"
    on:keypress
  >
    <div
      class="progress-bg"
      style="--joueur-played-percentage: -{100 - percentage}%;"
    ></div>

    {#if showPointer}
      <div
        class="pointer"
        style="--joueur-progress-pointer-x:{$pointerX}px;"
      ></div>
    {/if}

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
            <IconButton on:click="{() => dispatch('show-current-songs')}">
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
    --uno: 'shrink-0 bg-white shadow-t-lg text-[14px] relative overflow-hidden';
  }
  .inner {
    --uno: 'flex items-center relative z-3 px-4 pb-2 pt-1';
  }
  .meta {
    --uno: 'text-gray-4 text-3 flex justify-between';
  }
  .controls {
    --uno: 'flex items-center pointer-events-auto';
  }
  .seconds {
    --uno: 'text-gray-4 text-3 mx-2';
  }
  .middle {
    --uno: 'flex-grow mx-2 pointer-events-none';
  }
  .title {
    --uno: 'flex items-center justify-between';
  }
  .progress-bg {
    --uno: 'absolute bg-primary left-0 top-0 right-0 bottom-0 z-2 bg-opacity-10 transition-transform transition-300';
    transform: translateX(var(--joueur-played-percentage));
  }
  .pointer {
    --uno: 'absolute left-0 top-0 bottom-0 w-[1px] bg-primary z-3';
    transform: translateX(var(--joueur-progress-pointer-x));
  }
</style>
