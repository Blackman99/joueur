<script lang="ts">
  import Songs from '$lib/components/Songs.svelte'
  import { currentPlaylistSongs, selectedPlaylistId } from '$lib/store'
  import Playlists from '$lib/components/Playlists.svelte'
  import { db } from '$lib/db'
  import type { ContextMenuItem } from '$lib/actions/contextMenu'

  let draggingSongId: number | null
  let waitForDroppingPlaylistId: number | null

  const handleMaybeDropInPlaylist = async () => {
    if (waitForDroppingPlaylistId && draggingSongId) {
      const playlist = await db.playlists
        .where('id')
        .equals(waitForDroppingPlaylistId)
        .first()
      if (playlist && !playlist.songIds.includes(draggingSongId)) {
        playlist.songIds.push(draggingSongId)
        await db.playlists.update(playlist.id, playlist)
      }
    }
    draggingSongId = null
    waitForDroppingPlaylistId = null
  }

  const menus: ContextMenuItem[] = [
    {
      title: 'Delete from playlist',
      name: 'delete-from-playlist',
    },
  ]

  const handleRemoveFromList = async (e: CustomEvent<number>) => {
    const songIdToRemove = e.detail
    const currentPlaylist = await db.playlists
      .where('id')
      .equals($selectedPlaylistId)
      .first()
    if (currentPlaylist) {
      const songIndexToRemove = currentPlaylist.songIds.findIndex(
        id => id === songIdToRemove
      )
      if (songIndexToRemove !== -1) {
        currentPlaylist.songIds = [
          ...currentPlaylist.songIds.slice(0, songIndexToRemove),
          ...currentPlaylist.songIds.slice(songIndexToRemove + 1),
        ]
        await db.playlists.update(currentPlaylist.id, currentPlaylist)
      }
    }
  }
</script>

<div class="start">
  <Playlists
    bind:waitForDroppingPlaylistId="{waitForDroppingPlaylistId}"
    draggingSongId="{draggingSongId}"
  />
  {#await $currentPlaylistSongs}
    <div class="loading">Just a sec...</div>
  {:then songs}
    <Songs
      songs="{songs}"
      draggable
      contextMenus="{menus}"
      bind:draggingSongId="{draggingSongId}"
      on:maybe-drop-in-playlist="{handleMaybeDropInPlaylist}"
      on:delete-from-playlist="{handleRemoveFromList}"
    />
  {/await}
</div>

<style>
  .start {
    --uno: 'flex-grow flex items-stretch overflow-y-hidden justify-center relative';
  }
  .loading {
    --uno: 'text-gray-6 py-3 px-2';
  }
</style>
