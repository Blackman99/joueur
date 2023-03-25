<script lang="ts">
  import { db } from '$lib/db'
  import { currentPlayingSongIds, CURRENT_SONGS_KEY } from '$lib/store'
  import type { Song } from '$lib/types'
  import Backdrop from './Backdrop.svelte'
  import { fullscreen } from './lyrics/store'
  import Songs from './Songs.svelte'

  export let show = false

  const handleRemoveFromList = (e: CustomEvent<number>) => {
    const songIdToRemove = e.detail
    const idx = $currentPlayingSongIds.findIndex(id => id === songIdToRemove)
    if (idx !== -1) {
      $currentPlayingSongIds = [
        ...$currentPlayingSongIds.slice(0, idx),
        ...$currentPlayingSongIds.slice(idx + 1),
      ]
    }
  }

  let paginatedSongs: Song[] = []

  let offset = 0
  let limit = 10

  const doPaginateSongs = async () => {
    paginatedSongs = await db.songs
      .where('id')
      .anyOf($currentPlayingSongIds)
      .offset(offset)
      .limit(limit)
      .toArray()
  }

  $: {
    offset
    limit
    doPaginateSongs()
  }

  const resetCurrentList = () => {
    localStorage.setItem(
      CURRENT_SONGS_KEY,
      JSON.stringify($currentPlayingSongIds)
    )
    offset = 0
    doPaginateSongs()
  }

  $: {
    $currentPlayingSongIds
    resetCurrentList()
  }
</script>

<div class="current-songs" class:show="{show}" class:fullscreen="{$fullscreen}">
  <Songs
    bind:limit="{limit}"
    bind:offset="{offset}"
    songs="{paginatedSongs}"
    total="{$currentPlayingSongIds.length}"
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
    --uno: 'fixed z-108 left-[100%] bg-white dark:bg-dark-9 top-0 bottom-0 overflow-y-auto w-[40vw] min-w-[320px] transition-transform transition-300';
  }
  .fullscreen {
    --uno: 'w-[80vw] sm:w-[60vw] text-gray-2 bg-black';
  }
  .show {
    transform: translateX(-100%);
  }
</style>
