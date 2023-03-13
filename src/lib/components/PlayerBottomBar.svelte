<script lang="ts">
  import { slide } from 'svelte/transition'
  import IconButton from './IconButton.svelte'
  import {
    playingSong,
    displayPlayedSeconds,
    playedSeconds,
    playNext,
    playPrev,
    duration,
    displayDuration,
  } from '$lib/store'
  import ControlCurrentList from '$lib/icons/ControlCurrentList.svelte'
  import ControlPrev from '$lib/icons/ControlPrev.svelte'
  import ControlNext from '$lib/icons/ControlNext.svelte'
  import { createEventDispatcher } from 'svelte'
  import { spring } from 'svelte/motion'
  import VolumeControl from './VolumeControl.svelte'
  import ModeSwitcher from './ModeSwitcher.svelte'

  const pointerX = spring(0, {
    stiffness: 0.1,
    damping: 0.5,
  })

  let barDom: HTMLDivElement
  let showPointer = false
  let mouseTabbing = false
  let isHolding = false

  const dispatch = createEventDispatcher()

  $: percentage = ($playedSeconds / ($duration || 0)) * 100

  const handleBarClick = (e: any) => {
    const newPercentage = e.offsetX / barDom.offsetWidth
    if ($playingSong) {
      $playedSeconds = $duration * newPercentage
    }
  }

  const handlePointerMove = (e: any) => {
    if (e.target !== barDom.querySelector('.inner')) return
    if (mouseTabbing) {
      isHolding = true
    }
    pointerX.set(e.offsetX)
    if (isHolding) {
      handleBarClick(e)
    }
  }

  const handleMouseup = (e: any) => {
    mouseTabbing = false
    if (isHolding) {
      isHolding = false
    } else {
      handleBarClick(e)
    }
  }
</script>

{#if $playingSong}
  <div
    bind:this="{barDom}"
    class="player-bottom-bar"
    transition:slide
    on:mouseup="{handleMouseup}"
    on:mousedown="{() => (mouseTabbing = true)}"
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
      <IconButton size="20px" on:click="{playPrev}">
        <ControlPrev />
      </IconButton>

      <div class="middle">
        <div class="title">
          <div class="h-[24px] leading-[24px]">
            {$playingSong.title}
          </div>
          <div class="controls">
            <VolumeControl />
            <ModeSwitcher />
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
            {$displayPlayedSeconds} / {$displayDuration}
          </div>
        </div>
      </div>

      <IconButton size="20px" on:click="{playNext}">
        <ControlNext />
      </IconButton>
    </div>
  </div>
{/if}

<style>
  .player-bottom-bar {
    --uno: 'shrink-0 bg-white shadow-t-lg text-[14px] relative';
  }
  .inner {
    --uno: 'flex items-center relative z-3 px-4 pb-2 pt-1';
  }
  .meta {
    --uno: 'text-gray-4 text-3 flex justify-between h-[20px] leading-[20px]';
  }
  .controls {
    --uno: 'flex items-center pointer-events-auto';
  }
  .seconds {
    --uno: 'text-gray-4 text-3 mx-2';
  }
  .middle {
    --uno: 'flex-grow mx-2 pointer-events-none';
    user-select: none;
    -webkit-user-select: none;
  }
  .title {
    --uno: 'flex items-center justify-between';
  }
  .progress-bg {
    --uno: 'absolute bg-primary left-0 top-0 right-0 bottom-0 z-2 bg-opacity-8';
    transform: translateX(var(--joueur-played-percentage));
  }
  .pointer {
    --uno: 'absolute left-0 top-0 bottom-0 w-[1px] bg-primary bg-opacity-70 z-3';
    transform: translateX(var(--joueur-progress-pointer-x));
  }
</style>
