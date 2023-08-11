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
  <input
    bind:value="{newPlaylistTitle}"
    on:keyup|stopPropagation="{handleKeyup}"
    on:focus="{() => (focused = true)}"
    on:blur="{() => (focused = false)}"
    class="create-input"
  />
  <div class="placeholder">
    <div class="create-icon">
      <CreatePlaylist />
    </div>
    <div>Playlist title (Enter to add)</div>
  </div>
</div>

<style>
  .create-wrapper {
    --uno: 'flex h-[48px] items-center  pl-2 relative';
    transition: all linear 0.2s;
  }
  .focused {
    --uno: 'bg-secondary dark:bg-secondary text-white shadow-lg';
  }
  .placeholder {
    --uno: 'text-gray-4 absolute left-2 text-[14px] h-[16px] top-[16px] z-2 flex items-center';
    transition: all linear 0.2s;
    transform-origin: top left;
  }
  .focused .placeholder {
    --uno: 'top-[2px] bottom-unset flex items-center';
    transform: scale(0.8);
  }
  .create-input {
    --uno: 'relative flex-grow text-inherit text-[14px] w-full border-none outline-none bg-transparent z-3 my-0';
  }
  .focused .create-input {
    --uno: 'top-1';
  }
  .create-icon {
    --uno: 'text-5 flex items-center text-gray-4';
  }
</style>
