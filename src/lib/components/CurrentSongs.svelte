<script lang="ts">
  import { currentSongs } from '$lib/store'
  import Backdrop from './Backdrop.svelte'
  import { fullscreen } from './lyrics/store'
  import Songs from './Songs.svelte'

  export let show = false

  const handleRemoveFromList = (e: CustomEvent<number>) => {
    const songIdToRemove = e.detail
    const idx = $currentSongs.findIndex(song => song.id === songIdToRemove)
    if (idx !== -1) {
      $currentSongs = [
        ...$currentSongs.slice(0, idx),
        ...$currentSongs.slice(idx + 1),
      ]
    }
  }
</script>

<div class="current-songs" class:show="{show}" class:fullscreen="{$fullscreen}">
  <Songs
    songs="{$currentSongs}"
    resetCurrentSongsOnClick="{false}"
    showActionsOnEmpty="{false}"
    contextMenus="{[
      {
        title: 'Remove from list',
        name: 'remove-from-list',
      },
    ]}"
    on:remove-from-list="{handleRemoveFromList}"
  />
</div>

{#if show}
  <Backdrop on:click="{() => (show = false)}" />
{/if}

<style>
  .current-songs {
    --uno: 'fixed z-106 left-[100%] top-0 bottom-0 overflow-y-auto w-[40vw] min-w-[320px] transition-transform transition-300';
  }
  .fullscreen {
    --uno: 'w-[80vw] sm:w-[60vw]';
  }
  .show {
    transform: translateX(-100%);
  }
</style>
