<script lang="ts">
  import LyricsEdit from '$lib/icons/LyricsEdit.svelte'
  import OpenFullscreen from '$lib/icons/OpenFullscreen.svelte'
  import QuitFullscreen from '$lib/icons/QuitFullscreen.svelte'
  import { playedSeconds, playingSong } from '$lib/store'
  import { spring } from 'svelte/motion'
  import { appWindow, LogicalSize } from '@tauri-apps/api/window'

  import {
    editLyricsContent,
    fullscreen,
    songToUpdateLyrics,
    updateLyricsDialogOpen,
  } from './store'

  $: lyricsLines = $playingSong?.lyrics?.[0]?.text?.split('\n') || []

  let totalHeight: number
  let activeIndex = 0
  let lyricsContainer: HTMLDivElement

  const scrollTop = spring(0, {
    stiffness: 0.15,
    damping: 1,
  })

  const getStartSecondsFromLine = (line: string) => {
    const matches = /^\[(\d{2}):(\d{2}\.\d{2,})\]/.exec(line)
    if (matches) {
      const [, mins, secs] = matches
      return parseInt(mins) * 60 + parseFloat(secs)
    }
    return -1
  }

  const computedActiveIndex = () => {
    const newActiveIndex = lyricsLines.findIndex((line, i) => {
      if (i >= lyricsLines.length - 1) return true
      const lineStartSeconds = getStartSecondsFromLine(line)
      const nextLineStartSeconds = getStartSecondsFromLine(lyricsLines[i + 1])
      return (
        $playedSeconds >= lineStartSeconds &&
        $playedSeconds < nextLineStartSeconds
      )
    })
    activeIndex = newActiveIndex
  }

  const computedScrollPosition = () => {
    const lineDom = lyricsContainer?.querySelector(
      `.lyrics-line:nth-child(${activeIndex + 1})`
    ) as any
    if (lineDom) {
      $scrollTop = lineDom.offsetTop - (totalHeight - lineDom.offsetHeight) / 2
    }
  }

  const handleOpenLyricsEdit = () => {
    if ($playingSong) {
      $songToUpdateLyrics = $playingSong
      $editLyricsContent = $playingSong?.lyrics?.[0]?.text || ''
      $updateLyricsDialogOpen = true
    }
  }

  const handleToggleFullscreen = async () => {
    if ($fullscreen) {
      appWindow.setSize(new LogicalSize(1000, 800))
    } else {
      appWindow.setSize(new LogicalSize(380, 600))
    }
    $fullscreen = !$fullscreen
  }

  $: {
    $playedSeconds
    computedActiveIndex()
  }

  $: {
    activeIndex
    computedScrollPosition()
  }

  $: {
    if (lyricsContainer) lyricsContainer.scrollTop = $scrollTop
  }
</script>

<div
  class="lyrics-wrapper"
  bind:clientHeight="{totalHeight}"
  class:fullscreen="{$fullscreen}"
>
  <div
    class="lyrics-display"
    bind:this="{lyricsContainer}"
    on:click="{handleOpenLyricsEdit}"
    on:keypress
  >
    {#if lyricsLines && lyricsLines.length}
      {#each lyricsLines as line, i}
        {@const active = i === activeIndex}
        <div
          class="lyrics-line"
          class:active="{active}"
          style="--joueur-lyrics-blur:{Math.abs(i - activeIndex) / 2}px;"
        >
          {line.replace(/^\[\d{2}:\d{2}\.\d{2,}\]/, '')}
        </div>
      {/each}
    {:else}
      <div class="lyfics-line active pr-6 flex items-center justify-center">
        <LyricsEdit />
        <div class="ml-1">No lyrics</div>
      </div>
    {/if}
  </div>

  <div
    class="fullscreen-toggle"
    on:click="{handleToggleFullscreen}"
    on:keypress
  >
    {#if $fullscreen}
      <QuitFullscreen />
    {:else}
      <OpenFullscreen />
    {/if}
  </div>
</div>

<style>
  .lyrics-wrapper {
    --uno: 'absolute left-0 right-0 top-0 bottom-0 overflow-x-hidden z-3';
  }
  .fullscreen {
    --uno: '';
  }
  .fullscreen-toggle {
    --uno: 'absolute top-[4px] right-[4px] z-2 text-white text-5 cursor-pointer';
  }
  .lyrics-display {
    --uno: 'text-center absolute left-0 right-[-16px] top-0 bottom-0 py-[80px] text-warm-gray-3 z-2 bg-black bg-opacity-40 hover:bg-opacity-20';
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    transition: all linear 0.2s;
    overflow-y: auto;
    transform: translateZ(0);
  }
  .lyrics-display:hover {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .lyrics-line {
    transform: translateZ(0);
    padding: 0 12px;
    filter: blur(var(--joueur-lyrics-blur));
    -webkit-filter: blur(var(--joueur-lyrics-blur));
  }
  .lyrics-wrapper:hover .lyrics-line {
    filter: none;
    -webkit-filter: none;
  }
  .active {
    --uno: 'text-light-1';
    filter: none;
    -webkit-filter: none;
  }
</style>