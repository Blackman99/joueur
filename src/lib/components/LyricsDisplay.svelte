<script lang="ts">
  import { playedSeconds, playingSong } from '$lib/store'

  $: lyricsLines = $playingSong?.lyrics?.[0].text?.split('\n')
</script>

<div class="lyrics-wrapper">
  <div class="lyrics-display">
    {#if lyricsLines}
      {#each lyricsLines as line}
        <div class="lyrics-line">
          {line.replace(/^\[\d{2}:\d{2}\.\d{2}\]/, '')}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .lyrics-wrapper {
    --uno: 'absolute left-0 right-0 top-0 bottom-0 overflow-x-hidden';
  }
  .lyrics-display {
    --uno: 'text-[12px] text-center absolute left-0 right-[-16px] top-0 bottom-0 p-2 text-warm-gray-2 z-2 bg-black bg-opacity-40 leading-6 hover:bg-opacity-20';
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    transition: all linear 0.2s;
    overflow-y: auto;
  }
  .lyrics-display:hover {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
</style>
