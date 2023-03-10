<script lang="ts">
  import Songs from '$lib/components/Songs.svelte'
  import { currentPlaylistSongs, selectedPlaylistId } from '$lib/store'
  import Playlists from '$lib/components/Playlists.svelte'
  import { db } from '$lib/db'

  let draggingSongId: number | null
  let draggingSongIds: number[] = []
  let waitForDroppingPlaylistId: number | null

  let selectedSongIds: number[] = []

  const handleMaybeDropInPlaylist = async () => {
    if (waitForDroppingPlaylistId) {
      const playlist = await db.playlists
        .where('id')
        .equals(waitForDroppingPlaylistId)
        .first()
      if (playlist) {
        if (draggingSongIds.length) {
          draggingSongIds.forEach(id => {
            if (!playlist.songIds.includes(id)) {
              playlist.songIds.push(id)
            }
          })
        } else if (draggingSongId) {
          if (!playlist.songIds.includes(draggingSongId)) {
            playlist.songIds.push(draggingSongId)
          }
        }
        await db.playlists.update(playlist.id, playlist)
      }
      selectedSongIds = []
      waitForDroppingPlaylistId = null
    }
    draggingSongId = null
    draggingSongIds = []
  }

  const menus = [
    {
      title: 'Delete from playlist',
      name: 'delete-from-playlist',
    },
  ]

  const menusOnSelected = [
    {
      title: 'Delete all selected songs from playlist',
      name: 'delete-all-selected-songs-from-play-list',
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

  const handleRemoveAllSelectedSongsFromList = async () => {
    const currentPlaylist = await db.playlists
      .where('id')
      .equals($selectedPlaylistId)
      .first()
    if (currentPlaylist) {
      currentPlaylist.songIds = currentPlaylist.songIds.filter(
        id => !selectedSongIds.includes(id)
      )
      await db.playlists.update(currentPlaylist.id, currentPlaylist)
      selectedSongIds = []
    }
  }
</script>

<div class="start">
  <Playlists
    bind:waitForDroppingPlaylistId="{waitForDroppingPlaylistId}"
    draggingSongId="{draggingSongId}"
    draggingSongIds="{draggingSongIds}"
  />
  {#await $currentPlaylistSongs}
    <div class="loading">Just a sec...</div>
  {:then songs}
    <Songs
      songs="{songs}"
      draggable
      canSelectedMultiple
      contextMenus="{menus}"
      inSelectionContextMenus="{menusOnSelected}"
      bind:draggingSongId="{draggingSongId}"
      bind:draggingSongIds="{draggingSongIds}"
      bind:selectedSongIds="{selectedSongIds}"
      on:maybe-drop-in-playlist="{handleMaybeDropInPlaylist}"
      on:delete-from-playlist="{handleRemoveFromList}"
      on:delete-all-selected-songs-from-play-list="{handleRemoveAllSelectedSongsFromList}"
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
