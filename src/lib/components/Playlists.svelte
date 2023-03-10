<script lang="ts">
  import contextMenu, { type ContextMenuItem } from '$lib/actions/contextMenu'
  import PlaylistActive from '$lib/icons/PlaylistActive.svelte'
  import { selectedPlaylistId } from '$lib/store'
  import { playlists } from '$lib/store'
  import CreatePlaylistInput from './CreatePlaylistInput.svelte'
  import { ask } from '@tauri-apps/api/dialog'
  import { db } from '$lib/db'

  export let draggingSongId: number | null
  export let waitForDroppingPlaylistId: number | null = null
  export let draggingSongIds: number[] = []

  const handlePlaylistClick = (id: number) => {
    $selectedPlaylistId = id
  }

  const handleDragenter = (e: any) => {
    e.preventDefault()

    const id = parseInt(e.target.dataset.playlistId)
    if (!isNaN(id)) {
      if (waitForDroppingPlaylistId !== id) {
        waitForDroppingPlaylistId = id
      }
    }
  }

  const handleDragleave = (e: any) => {
    e.preventDefault()
    const id = parseInt(e.target.dataset.playlistId)
    if (!isNaN(id)) {
      if (waitForDroppingPlaylistId === id) {
        waitForDroppingPlaylistId = null
      }
    }
  }

  const contextMenus: ContextMenuItem[] = [
    {
      title: 'Delete playlist',
      name: 'delete-playlist',
    },
  ]

  const contextMenuHandler = async (name: string, id: number) => {
    switch (name) {
      case 'delete-playlist':
        const yes = await ask(
          'Deleting of playlist cannot be reverted. Are you sure?',
          { title: 'Confirm', type: 'warning' }
        )
        if (yes) {
          await db.playlists.delete(id)
          $selectedPlaylistId = -1
        }
    }
  }
</script>

<div class="playlist">
  <CreatePlaylistInput />
  <div class="lists">
    {#if $playlists}
      {#each $playlists as playlist (playlist.id)}
        {@const active = playlist.id === $selectedPlaylistId}
        <div
          class="playlist-item"
          class:active="{active}"
          data-playlist-id="{playlist.id}"
          on:click="{() => handlePlaylistClick(playlist.id)}"
          on:keyup="{() => handlePlaylistClick(playlist.id)}"
          on:dragenter="{handleDragenter}"
          on:dragleave="{handleDragleave}"
          use:contextMenu="{{
            menus: contextMenus,
            actionHandler: (e, m) => contextMenuHandler(m.name, playlist.id),
          }}"
        >
          {#if (draggingSongId || draggingSongIds.length) && waitForDroppingPlaylistId === playlist.id}
            <div class="drop-hint"></div>
          {/if}
          <div>
            {playlist.title}
            <span class="num">
              ({playlist.songIds.length})
            </span>
          </div>
          {#if active}
            <div class="active-icon">
              <PlaylistActive />
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
</div>

<style>
  .playlist {
    --uno: 'w-[18vw] min-w-[220px] max-w-[240px] bg-light-2 flex flex-col text-[14px] overflow-y-auto';
    user-select: none;
    -webkit-user-select: none;
  }
  .playlist-item {
    --uno: 'leading-10 px-4 flex items-center justify-between j-clickable-item relative';
  }
  .lists {
    --uno: 'flex-grow';
  }
  .active {
    --uno: 'j-active-item';
  }
  .active-icon {
    --uno: 'text-4 flex items-center';
  }
  .num {
    --uno: 'text-gray-6 text-[12px]';
  }
  .drop-hint {
    --uno: 'absolute left-0 right-0 bottom-0 top-0 b-2 rounded b-dashed b-primary bg-primary bg-opacity-10 z-3 pointer-events-none';
  }
</style>
