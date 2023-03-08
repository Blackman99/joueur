<script lang="ts">
  import Songs from '$lib/components/Songs.svelte'
  import { currentPlaylistSongs } from '$lib/store'
  import Playlists from '$lib/components/Playlists.svelte'
  import CreatePlaylistFloatButton from '$lib/components/CreatePlaylistFloatButton.svelte'
</script>

<div class="start">
  <Playlists />
  {#await $currentPlaylistSongs}
    <div class="loading">Just a sec...</div>
  {:then songs}
    <Songs songs="{songs}" />
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
