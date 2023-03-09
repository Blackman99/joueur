<script lang="ts">
  import Songs from '$lib/components/Songs.svelte'
  import { currentPlaylistSongs } from '$lib/store'
  import Playlists from '$lib/components/Playlists.svelte'
  import CreatePlaylistFloatButton from '$lib/components/CreatePlaylistFloatButton.svelte'
  import { db } from '$lib/db'

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
      bind:draggingSongId="{draggingSongId}"
      on:maybe-drop-in-playlist="{handleMaybeDropInPlaylist}"
    />
  {/await}
  <CreatePlaylistFloatButton />
</div>

<style>
  .start {
    --uno: 'flex-grow flex items-stretch overflow-y-hidden justify-center relative';
  }
  .loading {
    --uno: 'text-gray-6 py-3 px-2';
  }
</style>
