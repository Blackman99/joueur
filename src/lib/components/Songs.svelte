<!-- @component
  This component can be used as any song list in app
 -->
<script lang="ts">
  // @ts-nocheck
  import {
    playingSongId,
    currentPlayingSongIds,
    currentPlaylistSongs,
    playedSeconds,
    selectedPlaylistId,
  } from '$lib/store'
  import type { Song } from '$lib/types'
  import { createEventDispatcher } from 'svelte'
  import Actions from './Actions.svelte'
  import PlayingIcon from './PlayingIcon.svelte'
  import contextMenu, { type ContextMenuItem } from '../actions/context-menu'
  import Checked from '$lib/icons/Checked.svelte'
  import Uncheck from '$lib/icons/Uncheck.svelte'
  import Menu from './Menu.svelte'
  import DialogClose from '$lib/icons/DialogClose.svelte'
  import {
    editLyricsContent,
    fullscreen,
    songToUpdateLyrics,
    updateLyricsDialogOpen,
  } from './lyrics/store'
  import VirtualScroll from './VirtualScroll.svelte'
  import { db } from '$lib/db'

  export let transparentBg: boolean = false
  export let songs: Song[]
  export let offset: number
  export let limit: number
  export let total: number
  export let scrollTop: number = 0
  export let showActionsOnEmpty = true
  export let resetCurrentSongsOnClick = true
  export let draggable = false
  export let draggingSongId: number | null = null
  export let contextMenus: ContextMenuItem[] = []
  export let inSelectionContextMenus: ContextMenuItem[] = []

  export let canSelectedMultiple: boolean = false
  export let selectedSongIds: number[] = []
  export let draggingSongIds: number[] = []

  let virtualScroller: VirtualScroll
  let selectionMode = false

  const dispatch = createEventDispatcher()

  const handlePlay = async (song: Song) => {
    if (selectedSongIds.length) return
    $playingSongId = song.id
    $playedSeconds = 0
    if (resetCurrentSongsOnClick) {
      const playlist = await db.playlists
        .where('id')
        .equals($selectedPlaylistId)
        .first()
      $currentPlayingSongIds = playlist?.songIds || []
    }
    dispatch('play', song)
  }
  const handleDragstart = (song: Song) => {
    if (selectedSongIds.length && selectedSongIds.includes(song.id)) {
      draggingSongIds = selectedSongIds
      return
    }
    draggingSongId = song.id
  }

  const onDragend = () => {
    dispatch('maybe-drop-in-playlist')
  }

  const handleSongClick = (song: Song) => {
    if (!selectionMode) return
    const index = selectedSongIds.findIndex(id => id === song.id)
    if (index !== -1) {
      selectedSongIds = [
        ...selectedSongIds.slice(0, index),
        ...selectedSongIds.slice(index + 1),
      ]
    } else {
      selectedSongIds.push(song.id)
      selectedSongIds = selectedSongIds
    }
  }

  const handleEditLyrics = (song: Song) => {
    $songToUpdateLyrics = song
    $editLyricsContent = song.lyrics?.[0]?.text || ''
    $updateLyricsDialogOpen = true
  }

  const handleContextMenuClick = (name: string, song: Song) => {
    switch (name) {
      case 'check-song':
        selectedSongIds.push(song.id)
        selectionMode = true
        selectedSongIds = selectedSongIds
        break
      case 'uncheck-song':
        handleSongClick(song)
        break
      case 'edit-lyrics':
        handleEditLyrics(song)
        break
      default:
        dispatch(name, song.id)
    }
  }

  const handleQuitSelectionMode = () => {
    selectionMode = false
    selectedSongIds = []
  }

  export const resetVirtualScroller = () => {
    virtualScroller?.recomputeInitialData()
  }
</script>

<div
  class="songs"
  class:transparent-bg="{transparentBg}"
  class:fullscreen="{$fullscreen}"
>
  {#if selectionMode}
    <div class="selection-mode-buttons">
      <div class="select-and-unselect-all">
        <Menu
          label="Select all"
          on:click="{() =>
            (selectedSongIds = $currentPlaylistSongs.map(song => song.id))}"
        >
          <Checked slot="icon" />
        </Menu>
        <Menu label="Unselect all" on:click="{() => (selectedSongIds = [])}">
          <Uncheck slot="icon" />
        </Menu>
      </div>
      <Menu label="Quit" on:click="{handleQuitSelectionMode}">
        <DialogClose slot="icon" />
      </Menu>
    </div>
  {/if}

  {#if !songs.length && showActionsOnEmpty}
    <Actions />
  {:else}
    <VirtualScroll
      bind:this="{virtualScroller}"
      bind:offset="{offset}"
      bind:limit="{limit}"
      bind:scrollTop="{scrollTop}"
      total="{total}"
      items="{songs}"
      customClass="{transparentBg ? 'bg-black' : 'j-song-bg'}"
    >
      <svelte:fragment slot="item" let:item="{song}">
        {@const isPlaying = song.id === $playingSongId}
        {@const isInSelection = selectedSongIds.includes(song.id)}
        {@const isDragging =
          draggingSongId === song.id || draggingSongIds.includes(song.id)}
        <div
          draggable="{draggable}"
          class="song-row"
          class:active="{isPlaying}"
          class:dragging="{isDragging}"
          class:multi-selected="{isInSelection}"
          on:keypress
          on:click="{() => handleSongClick(song)}"
          on:dblclick="{() => handlePlay(song)}"
          on:dragstart="{() => handleDragstart(song)}"
          on:dragend="{onDragend}"
          use:contextMenu="{{
            actionHandler: (_e, m) => handleContextMenuClick(m.name, song),
            menus: canSelectedMultiple
              ? [
                  ...(isInSelection
                    ? [
                        {
                          title: 'Unselect',
                          name: 'uncheck-song',
                        },
                        ...inSelectionContextMenus,
                      ]
                    : [
                        {
                          title: 'Select',
                          name: 'check-song',
                        },
                      ]),
                  {
                    title: 'Edit lyrics',
                    name: 'edit-lyrics',
                  },
                  ...contextMenus,
                ]
              : contextMenus,
          }}"
        >
          {#if selectionMode}
            <div class="checked-icon">
              {#if isInSelection}
                <Checked />
              {:else}
                <Uncheck />
              {/if}
            </div>
          {/if}
          <img
            class="cover"
            src="{song.cover}"
            alt="{song.title}"
            draggable="false"
          />
          <div class="info">
            <div class="title">
              {song.title}
              {#if isPlaying}
                <div class="playing-icon-wrapper">
                  <PlayingIcon />
                </div>
              {/if}
            </div>
            <div class="meta">
              <div class="artist-album">
                {song.artist} - {song.album || 'Unknown'}
              </div>
              <div class="duration">
                {song.display_duration}
                <span class="text-light-8 dark:text-gray-7">|</span>
                {song.path.split('.').pop()}
              </div>
            </div>
          </div>
        </div>
      </svelte:fragment>
      <div class="song-row" slot="skeleton-item">
        <div class="cover cover-skeleton"></div>
        <div class="info">
          <div class="title title-skeleton"></div>
          <div class="meta mt-2 pr-4">
            <div class="meta-skeleton"></div>
            <div class="duration-skeleton"></div>
          </div>
        </div>
      </div>
    </VirtualScroll>
  {/if}
</div>

<style>
  .selection-mode-buttons {
    --uno: 'flex items-center justify-between sticky top-0 bg-white dark:bg-black z-4';
  }
  .select-and-unselect-all {
    --uno: 'flex items-center';
  }
  .songs {
    --uno: 'flex-grow text-[14px] relative overflow-y-hidden h-full';
  }
  .transparent-bg {
    --uno: 'bg-transparent';
  }
  .song-row {
    --uno: 'flex items-center px-4 py-2 cursor-pointer j-clickable-item transition-bg transition-200';
    user-select: none;
    -webkit-user-select: none;
  }
  .transparent-bg .song-row {
    --uno: 'hover:bg-opacity-10';
  }
  .active {
    --uno: 'j-active-item';
  }
  .cover {
    --uno: 'w-8 h-8 rounded mr-2';
    object-fit: cover;
  }
  .meta {
    --uno: 'text-warm-gray-5 text-[12px] flex justify-between';
  }
  .fullscreen .meta {
    --uno: 'display-none sm:flex';
  }
  .info {
    --uno: 'flex-grow';
  }
  .title {
    --uno: 'flex items-center h-6';
  }
  .artist-album {
    --uno: 'h-5';
  }
  .playing-icon-wrapper {
    --uno: 'text-primary ml-1';
  }
  .duration {
    --uno: 'flex-shrink-0';
  }
  .dragging {
    transform: scale(0.95);
  }
  .multi-selected {
    --uno: '';
  }
  .checked-icon {
    --uno: 'text-5 mr-2';
  }
  :global(.bg-black) {
    --uno: 'bg-black';
  }
  .cover-skeleton {
    --uno: 'bg-gray-2 dark:bg-gray-8';
  }
  .fullscreen .cover-skeleton {
    --uno: 'bg-gray-8';
  }
  .title-skeleton {
    --uno: 'h-[14px] bg-gray-3 dark:bg-gray-9 w-[100px]';
  }
  .fullscreen .title-skeleton {
    --uno: 'h-[14px] bg-gray-9 w-[100px]';
  }
  .duration-skeleton,
  .meta-skeleton {
    --uno: 'h-[12px] w-[30%] bg-gray-2 dark:bg-gray-9';
  }
  .fullscreen .duration-skeleton,
  .fullscreen .meta-skeleton {
    --uno: 'bg-gray-9';
  }
  .duration-skeleton {
    --uno: 'w-[15%]';
  }
</style>
