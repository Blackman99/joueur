<script lang="ts">
  import { db } from '$lib/db'
  import CreatePlaylist from '$lib/icons/CreatePlaylist.svelte'

  let newPlaylistTitle = ''
  let focused = false

  const handleKeyup = async (e: KeyboardEvent) => {
    if (e.code === 'Enter') {
      await db.addPlaylist(newPlaylistTitle)
      newPlaylistTitle = ''
    }
  }
</script>

<div class="create-wrapper" class:focused="{focused}">
  <div class="create-icon">
    <CreatePlaylist />
  </div>
  <input
    bind:value="{newPlaylistTitle}"
    on:keyup|stopPropagation="{handleKeyup}"
    on:focus="{() => (focused = true)}"
    on:blur="{() => (focused = false)}"
    class="create-input"
    placeholder="Playlist title (Enter to add)"
  />
</div>

<style>
  .create-wrapper {
    --uno: 'flex items-center bg-white pl-2 transition-colors transition-300';
  }
  .focused {
    --uno: 'bg-primary text-white';
  }
  .create-input::placeholder {
    --uno: 'text-inherit';
  }
  .create-input {
    --uno: 'text-inherit pl-2 leading-10 flex-grow text-[14px] border-none outline-none bg-transparent';
  }
  .create-icon {
    --uno: 'text-5 flex items-center';
  }
</style>
