<script lang="ts">
  import { currentSongs } from '$lib/store'
  import Backdrop from './Backdrop.svelte'
  import Songs from './Songs.svelte'

  export let show = false
</script>

<div class="current-songs" class:show="{show}">
  <Songs
    songs="{$currentSongs}"
    resetCurrentSongsOnClick="{false}"
    showActionsOnEmpty="{false}"
  />
</div>

{#if show}
  <Backdrop on:click="{() => (show = false)}" />
{/if}

<style>
  .current-songs {
    --uno: 'fixed z-101 left-[100%] top-0 bottom-0 overflow-y-auto w-[40vw] min-w-[320px] transition-transform transition-300';
  }
  .show {
    transform: translateX(-100%);
  }
</style>
