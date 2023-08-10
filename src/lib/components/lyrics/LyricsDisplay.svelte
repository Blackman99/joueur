<script lang="ts">
  import { spring } from 'svelte/motion'
  import {
    editLyricsContent,
    fullscreen,
    quittingFullscreen,
    songToUpdateTags,
    updateLyricsDialogOpen,
  } from './store'
  import LyricsEdit from '$lib/icons/LyricsEdit.svelte'
  import OpenFullscreen from '$lib/icons/OpenFullscreen.svelte'
  import { playedSeconds, playingSong } from '$lib/store'
  import debounce from '$lib/utils/debounce'
  import throttle from '$lib/utils/throttle'
  import { isSm } from '$lib/layout'

  $: lyricsLines = $playingSong?.lyrics?.[0]?.text?.split('\n') || []
  $: noLyrics = !lyricsLines || !lyricsLines.length

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
      return Number.parseInt(mins) * 60 + Number.parseFloat(secs)
    }
    return -1
  }

  const computedActiveIndex = throttle(() => {
    const newActiveIndex = lyricsLines.findIndex((line, i) => {
      if (!line.trim()) return false
      if (i >= lyricsLines.length - 1) return true
      const lineStartSeconds = getStartSecondsFromLine(line)
      const nextLineStartSeconds = getStartSecondsFromLine(lyricsLines[i + 1])
      return (
        $playedSeconds >= lineStartSeconds &&
        $playedSeconds < nextLineStartSeconds
      )
    })
    activeIndex = newActiveIndex
  }, 100)

  const computedScrollPosition = debounce(() => {
    const lineDom = lyricsContainer?.querySelector(
      `.lyrics-line:nth-child(${activeIndex + 1})`,
    ) as any
    if (lineDom)
      $scrollTop = lineDom.offsetTop - (totalHeight - lineDom.offsetHeight) / 2
  }, 50)

  const handleOpenLyricsEdit = () => {
    if ($playingSong) {
      $songToUpdateTags = $playingSong
      $editLyricsContent = $playingSong?.lyrics?.[0]?.text || ''
      $updateLyricsDialogOpen = true
    }
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

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="lyrics-wrapper"
  class:lyrics-wrapper-sm="{$isSm}"
  bind:clientHeight="{totalHeight}"
  class:fullscreen="{$fullscreen}"
>
  <div
    class="lyrics-display"
    class:no-lyrics="{noLyrics}"
    class:hide-lyrics="{$isSm && !$fullscreen && !$quittingFullscreen}"
    bind:this="{lyricsContainer}"
    on:click="{handleOpenLyricsEdit}"
    on:keypress
  >
    {#if !noLyrics}
      {#each lyricsLines as line, i}
        {@const active = i === activeIndex}
        <div
          class="lyrics-line"
          class:active
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

  {#if !$fullscreen}
    <div
      class="fullscreen-toggle"
      class:fullscreen-toggle-sm="{$isSm}"
      on:click="{() => ($fullscreen = true)}"
      on:keypress
    >
      <OpenFullscreen />
    </div>
  {/if}
</div>

<style>
  .lyrics-wrapper {
    --uno: 'absolute left-0 right-0 top-0 bottom-0 overflow-hidden z-3';
  }
  .fullscreen {
    --uno: '';
  }
  .fullscreen-toggle {
    --uno: 'absolute sm:top-[4px] sm:right-[4px] sm:left-unset sm:bottom-unset z-2 text-white text-5 cursor-pointer top-0 right-0 left-0 bottom-0 bg-black px-2 py-1 bg-opacity-40 sm:bg-opacity-0';
  }
  .fullscreen-toggle-sm {
    --uno: 'flex items-center justify-center opacity-0';
    transition: opacity linear 0.2s;
  }
  .lyrics-wrapper-sm .fullscreen-toggle-sm {
    --uno: 'hover:opacity-100';
  }
  .lyrics-display {
    --uno: 'text-center absolute left-0 right-[-16px] top-0 bottom-0 py-[80px] text-warm-gray-3 z-2 bg-black bg-opacity-40 dark:bg-opacity-50 hover:bg-opacity-20 dark:hover:bg-opacity-20';
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    transition: all linear 0.2s;
    overflow-y: auto;
    transform: translateZ(0);
  }
  .fullscreen .lyrics-display {
    --uno: 'py-[20vh]';
  }
  .no-lyrics {
    --uno: 'flex items-center justify-center';
  }
  .hide-lyrics {
    --uno: 'display-none';
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
