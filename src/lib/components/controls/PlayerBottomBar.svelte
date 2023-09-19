<script lang="ts">
  import { slide } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  import { spring } from 'svelte/motion'
  import IconButton from '../shared/IconButton.svelte'
  import { fullscreen } from '../lyrics/store'
  import VolumeControl from './VolumeControl.svelte'
  import ModeSwitcher from './ModeSwitcher.svelte'
  import AudioVisualizer from './AudioVisualizer.svelte'
  import {
    audioDom,
    displayDuration,
    displayPlayedSeconds,
    duration,
    inWindow,
    paused,
    playNext,
    playPrev,
    playedSeconds,
    playingSong,
    togglePlayOrPause,
  } from '$lib/store'
  import ControlCurrentList from '$lib/icons/ControlCurrentList.svelte'
  import ControlPrev from '$lib/icons/ControlPrev.svelte'
  import ControlNext from '$lib/icons/ControlNext.svelte'
  import ControlPlay from '$lib/icons/ControlPlay.svelte'
  import ControlPause from '$lib/icons/ControlPause.svelte'

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
    if ($audioDom) $audioDom.currentTime = $duration * newPercentage
  }

  const handlePointerMove = (e: any) => {
    if (e.target !== barDom) return
    if (mouseTabbing) isHolding = true

    pointerX.set(e.offsetX)
    if (isHolding) handleBarClick(e)
  }

  const handleMouseup = (e: any) => {
    mouseTabbing = false
    if (isHolding) isHolding = false
    else handleBarClick(e)
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
{#if $playingSong}
  <div
    class="player-bottom-bar"
    class:fullscreen="{$fullscreen}"
    class:fullscreen-show="{$fullscreen && $inWindow}"
    transition:slide
  >
    {#if $audioDom}
      <AudioVisualizer />
    {/if}

    <div class="inner">
      <div
        class="middle"
        bind:this="{barDom}"
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
        <div class="title">
          {$playingSong.title}
        </div>
        <div class="meta">
          <div class="artist-album">
            {$playingSong.artist} - {$playingSong.album || 'Unknown'}
          </div>
          <div class="seconds">
            {$displayPlayedSeconds} / {$displayDuration}
          </div>
        </div>
      </div>
      <div class="controls">
        <VolumeControl />
        <ModeSwitcher />
        <IconButton on:click="{() => dispatch('show-current-songs')}">
          <ControlCurrentList />
        </IconButton>
        <IconButton on:click="{playPrev}">
          <ControlPrev />
        </IconButton>
        <IconButton on:click="{togglePlayOrPause}" size="18px">
          {#if $paused}
            <ControlPlay />
          {:else}
            <ControlPause />
          {/if}
        </IconButton>
        <IconButton on:click="{playNext}">
          <ControlNext />
        </IconButton>
      </div>
    </div>
  </div>
{/if}

<style>
  .player-bottom-bar {
    --uno: 'shrink-0 bg-white dark:bg-black shadow-t-lg text-[14px] relative';
    transition: transform cubic-bezier(0, 0.55, 0.45, 1) 0.2s;
  }
  .fullscreen {
    --uno: 'fixed bottom-0 left-0 right-0 z-104 bg-opacity-20 bg-black text-gray-2';
    transform: translateY(100%);
  }
  .fullscreen-show {
    transform: translateY(0);
  }
  .inner {
    --uno: 'flex items-stretch justify-between pr-4 bg-inherit';
  }
  .meta {
    --uno: 'text-gray-4 text-3 flex sm:justify-between justify-end flex-grow h-[20px] leading-[20px] ml-2 pointer-events-none';
  }
  .artist-album {
    --uno: 'display-none sm:block';
  }
  .title {
    --uno: 'flex items-baseline pointer-events-none';
  }
  .controls {
    --uno: 'flex items-center ml-2 gap-1';
  }
  .seconds {
    --uno: 'text-gray-4 text-3 mx-2';
    white-space: nowrap;
  }
  .middle {
    --uno: 'flex items-baseline p-2 flex-grow relative overflow-hidden';
  }
  .middle::after {
    --uno: 'absolute right-0 top-[30%] bottom-[30%] w-[1px] bg-gray-2 dark:bg-gray-8';
    content: ' ';
  }
  .progress-bg {
    --uno: 'absolute bg-primary left-0 top-0 right-0 bottom-0 z-2 pointer-events-none bg-opacity-8 dark:bg-opacity-20';
    transform: translateX(var(--joueur-played-percentage));
  }
  .pointer {
    --uno: 'absolute left-0 top-0 bottom-0 w-[1px] bg-primary bg-opacity-70 z-3 pointer-events-none';
    transform: translateX(var(--joueur-progress-pointer-x));
  }
</style>
