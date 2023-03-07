<script lang="ts">
  import { db } from '$lib/db'
  import CreatePlaylist from '$lib/icons/CreatePlaylist.svelte'
  import PlaylistActive from '$lib/icons/PlaylistActive.svelte'
  import { selectedPlaylistId } from '$lib/store'
  import type { Playlist } from '$lib/types'
  import { liveQuery } from 'dexie'
  import type { Readable } from 'svelte/store'
  import Dialog from './Dialog.svelte'

  const playlists = liveQuery(() =>
    db.playlists.toArray()
  ) as unknown as Readable<Playlist[]>

  let open = false

  const handleOpenCreatePlaylistDialog = () => {
    open = true
  }
</script>

<div class="playlist">
  <div
    class="create-list"
    on:click="{handleOpenCreatePlaylistDialog}"
    on:keyup="{handleOpenCreatePlaylistDialog}"
  >
    <span> Create </span>
    <div class="create-icon">
      <CreatePlaylist />
    </div>
  </div>
  <div class="lists">
    {#if $playlists}
      {#each $playlists as playlist (playlist.id)}
        <div
          class="playlist-item"
          class:active="{playlist.id === $selectedPlaylistId}"
        >
          <div>
            {playlist.title}
          </div>
          <div class="active-icon">
            <PlaylistActive />
          </div>
        </div>
      {/each}
    {/if}
  </div>
</div>

<Dialog bind:open="{open}" title="Create playlist">
  <div slot="title" class="flex items-center">
    <div class="flex items-center text-6">
      <CreatePlaylist />
    </div>
    <div class="ml-2">Create playlist</div>
  </div>
  <div>Some content</div>
</Dialog>

<style>
  .playlist {
    --uno: 'w-[18vw] min-w-[160px] max-w-[240px] bg-light-3 flex flex-col text-[14px] pt-2';
    user-select: none;
    -webkit-user-select: none;
  }
  .playlist-item {
    --uno: 'py-2 px-4 flex items-center justify-between';
  }
  .lists {
    --uno: 'flex-grow';
  }
  .active {
    --uno: 'text-primary';
  }
  .active-icon {
    --uno: 'text-5 flex items-center';
  }
  .create-icon {
    --uno: 'text-5 ml-2 flex items-center';
  }
  .create-list {
    --uno: 'cursor-pointer hover:bg-primary hover:bg-opacity-8 active:bg-opacity-16 items-center flex justify-between mx-2 rounded-[40px] text-[12px] b-1 b-gray-4 text-gray-4 px-3 py-2 b-solid hover:text-primary hover:b-primary';
    user-select: none;
    -webkit-user-select: none;
  }
</style>
