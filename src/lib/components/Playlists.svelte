<script lang="ts">
  import { ask, message } from '@tauri-apps/api/dialog'
  import CreatePlaylistInput from './CreatePlaylistInput.svelte'
  import { fullscreen } from './lyrics/store'
  import ExpandableButton from './shared/ExpandableButton.svelte'
  import contextMenu from '$lib/actions/context-menu'
  import PlaylistActive from '$lib/icons/PlaylistActive.svelte'
  import { playlists, selectedPlaylistId } from '$lib/store'

  import { db } from '$lib/db'
  import { isSm } from '$lib/layout'

  export let draggingSongId: number | null
  export let waitForDroppingPlaylistId: number | null = null
  export let draggingSongIds: number[] = []

  let expanded = true

  const handlePlaylistClick = (id: number) => {
    $selectedPlaylistId = id
  }

  const handleDragenter = (e: any) => {
    e.preventDefault()

    const id = Number.parseInt(e.target.dataset.playlistId)
    if (!Number.isNaN(id))
      if (waitForDroppingPlaylistId !== id) waitForDroppingPlaylistId = id
  }

  const handleDragleave = (e: any) => {
    e.preventDefault()
    const id = Number.parseInt(e.target.dataset.playlistId)
    if (!Number.isNaN(id))
      if (waitForDroppingPlaylistId === id) waitForDroppingPlaylistId = null
  }

  const contextMenuHandler = async (name: string, id: number) => {
    switch (name) {
      case 'delete-playlist':
        if (id === -1) {
          await message('The All list is default list. Can not be deleted!', {
            title: 'Not permitted',
            type: 'error',
          })
          return
        }
        // eslint-disable-next-line no-case-declarations
        const yes = await ask(
          'Deleting of playlist cannot be reverted. Are you sure?',
          { title: 'Confirm', type: 'warning' },
        )
        if (yes) {
          await db.playlists.delete(id)
          $selectedPlaylistId = -1
        }
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->

<div
  class="playlist"
  class:fullscreen="{$fullscreen}"
  class:sm="{$isSm}"
  class:expanded="{$isSm && expanded}"
>
  <div class:hide="{$isSm && !expanded}" class="playlist-inner">
    <CreatePlaylistInput />
    <div class="lists">
      {#if $playlists}
        {#each $playlists as playlist (playlist.id)}
          {@const active = playlist.id === $selectedPlaylistId}
          <div
            class="playlist-item"
            class:active
            data-playlist-id="{playlist.id}"
            on:click="{() => handlePlaylistClick(playlist.id)}"
            on:keyup="{() => handlePlaylistClick(playlist.id)}"
            on:dragenter="{handleDragenter}"
            on:dragleave="{handleDragleave}"
            use:contextMenu="{{
              menus:
                playlist.id === -1
                  ? []
                  : [
                      {
                        title: 'Delete playlist',
                        name: 'delete-playlist',
                      },
                    ],
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
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
  <ExpandableButton bind:expanded />
</div>

<style>
  .playlist {
    --uno: 'w-[18vw] min-w-[240px] max-w-[280px] flex-shrink-0 flex flex-col text-[14px] b-r-solid b-r-1 dark:b-r-gray-8 b-r-light-5 bg-light-1 dark:bg-dark-9 sm:bg-unset relative';
    user-select: none;
    -webkit-user-select: none;
    overflow-y: auto;
  }
  .sm {
    --uno: 'min-w-unset max-w-0 w-[240px]';
    overflow: visible;
    transition: max-width ease-in-out 0.3s;
  }
  .sm.expanded {
    --uno: 'max-w-[240px]';
  }
  .hide {
    --uno: 'opacity-0';
  }
  .playlist-inner {
    transition: opacity ease-in-out 0.3s;
  }
  .fullscreen {
    --uno: 'display-none';
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
