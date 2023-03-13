<script lang="ts">
  import Songs from '$lib/components/Songs.svelte'
  import { currentPlaylistSongs, selectedPlaylistId } from '$lib/store'
  import Playlists from '$lib/components/Playlists.svelte'
  import { db } from '$lib/db'
  import { message, ask } from '@tauri-apps/api/dialog'

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
    {
      title: 'Delete from application',
      name: 'delete-from-application',
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

  const handleDeleteFromApplication = async (e: CustomEvent<number>) => {
    const yes = await ask(
      'Deletion from application can not be reverted. Are you sure?',
      { type: 'warning', title: 'Confirm' }
    )
    if (!yes) return
    const songIdToRemove = e.detail
    db.transaction(
      'rw',
      db.playlists,
      db.songs,
      db.artists,
      db.albums,
      async () => {}
    )
      .then(async () => {
        const playlistsContainSong = await db.playlists
          .filter(pl => pl.songIds.includes(songIdToRemove))
          .toArray()
        for (const pl of playlistsContainSong) {
          pl.songIds = pl.songIds.filter(id => id !== songIdToRemove)
          await db.playlists.update(pl.id, pl)
        }
        await db.songs.where('id').equals(songIdToRemove).delete()

        const artistsContainSong = await db.artists
          .filter(ar => ar.songIds.includes(songIdToRemove))
          .toArray()

        for (const ar of artistsContainSong) {
          ar.songIds = ar.songIds.filter(id => id !== songIdToRemove)
          if (!ar.songIds.length) await db.artists.delete(ar.id)
          else await db.artists.update(ar.id, ar)
        }

        const albumsContainSong = await db.albums
          .filter(al => al.songIds.includes(songIdToRemove))
          .toArray()

        for (const al of albumsContainSong) {
          al.songIds = al.songIds.filter(id => id !== songIdToRemove)
          if (!al.songIds.length) await db.albums.delete(al.id)
          else await db.albums.update(al.id, al)
        }

        message('Delete success', { title: 'Success', type: 'info' })
      })
      .catch(err => {
        message(err.message, { title: 'Error', type: 'error' })
      })
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
      on:delete-from-application="{handleDeleteFromApplication}"
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
