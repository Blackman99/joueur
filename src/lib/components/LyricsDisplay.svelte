<script lang="ts">
  import { playedSeconds, playingSong } from '$lib/store'
  import { spring } from 'svelte/motion'

  $: lyricsLines = $playingSong?.lyrics?.[0]?.text?.split('\n') || []

  let totalHeight: number
  let activeIndex = 0
  let lyricsContainer: HTMLDivElement

  const scrollTop = spring(0, {
    stiffness: 0.15,
    damping: 1,
  })

  const getStartSecondsFromLine = (line: string) => {
    const matches = /^\[(\d{2}):(\d{2}\.\d{2})\]/.exec(line)
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

<div class="lyrics-wrapper" bind:clientHeight="{totalHeight}">
  <div class="lyrics-display" bind:this="{lyricsContainer}">
    {#if lyricsLines && lyricsLines.length}
      {#each lyricsLines as line, i}
        <div class="lyrics-line" class:active="{i === activeIndex}">
          {line.replace(/^\[\d{2}:\d{2}\.\d{2}\]/, '')}
        </div>
      {/each}
    {:else}
      <div class="lyfics-line active">No lyrics</div>
    {/if}
  </div>
</div>

<style>
  .lyrics-wrapper {
    --uno: 'absolute left-0 right-0 top-0 bottom-0 overflow-x-hidden z-3';
  }
  .lyrics-display {
    --uno: 'text-[12px] text-center absolute left-0 right-0 top-0 bottom-0 py-[80px] text-warm-gray-3 z-2 bg-black bg-opacity-70 hover:bg-opacity-40 leading-5';
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    transition: all linear 0.2s;
    overflow-y: auto;
  }
  .lyrics-display:hover {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .lyrics-line {
    padding: 0 12px;
    filter: blur(1px);
    -webkit-filter: blur(1px);
  }
  .lyrics-wrapper:hover .lyrics-line {
    filter: none;
  }
  .active {
    --uno: 'text-light-1';
    filter: none;
  }
  .lyrics-display:hover .active {
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
</style>
