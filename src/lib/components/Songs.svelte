<!-- @component
  This component can be used as any song list in app
 -->
<script lang="ts">
  // @ts-nocheck
  import {
    playingSongId,
    playing,
    currentSongs,
    playedSeconds,
  } from '$lib/store'
  import type { Song } from '$lib/types'
  import { createEventDispatcher } from 'svelte'
  import Actions from './Actions.svelte'
  import PlayingIcon from './PlayingIcon.svelte'
  import contextMenu, { type ContextMenuItem } from '../actions/contextMenu'
  import Checked from '$lib/icons/Checked.svelte'
  import Uncheck from '$lib/icons/Uncheck.svelte'
  import FloatAction from './FloatAction.svelte'
  import DialogClose from '$lib/icons/DialogClose.svelte'
  import { fade } from 'svelte/transition'

  export let songs: Song[]
  export let showActionsOnEmpty = true
  export let resetCurrentSongsOnClick = true
  export let draggable = false
  export let draggingSongId: number | null = null
  export let contextMenus: ContextMenuItem[] = []
  export let inSelectionContextMenus: ContextMenuItem[] = []

  export let canSelectedMultiple: boolean = false
  export let selectedSongIds: number[] = []
  export let draggingSongIds: number[] = []

  const dispatch = createEventDispatcher()

  const handlePlay = (song: Song) => {
    if (selectedSongIds.length) return
    $playing = true
    $playingSongId = song.id
    $playedSeconds = 0
    if (resetCurrentSongsOnClick) {
      $currentSongs = songs
    }
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
    if (!selectedSongIds.length) return
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

  const handleContextMenuClick = (name: string, song: Song) => {
    switch (name) {
      case 'check-song':
        selectedSongIds.push(song.id)
        selectedSongIds = selectedSongIds
        break
      case 'uncheck-song':
        handleSongClick(song)
        break
      default:
        dispatch(name, song.id)
    }
  }
</script>

<div class="songs">
  {#if selectedSongIds.length}
    <div
      class="quit-selection"
      transition:fade="{{ duration: 100 }}"
      on:click="{() => (selectedSongIds = [])}"
      on:keypress
    >
      <FloatAction>
        <DialogClose />
      </FloatAction>
    </div>
  {/if}
  {#each songs as song (song.id)}
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
              ...contextMenus,
            ]
          : contextMenus,
      }}"
    >
      {#if selectedSongIds.length}
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
              <PlayingIcon
                animationPlayState="{$playing ? 'running' : 'paused'}"
              />
            </div>
          {/if}
        </div>
        <div class="meta">
          <div>
            {song.artist} - {song.album || 'Unknown'}
          </div>
          <div class="duration">
            {song.display_duration} <span class="text-light-8">|</span>
            {song.path.split('.').pop()}
          </div>
        </div>
      </div>
    </div>
  {/each}
  {#if !songs.length && showActionsOnEmpty}
    <Actions />
  {/if}
</div>

<style>
  .songs {
    --uno: 'flex-grow text-[14px] relative overflow-y-auto h-full bg-light-4';
  }
  .song-row {
    --uno: 'flex items-center px-4 py-2 cursor-pointer j-clickable-item transition-bg transition-200';
    user-select: none;
    -webkit-user-select: none;
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
  .info {
    --uno: 'flex-grow';
  }
  .title {
    --uno: 'flex items-center h-6';
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
  .quit-selection {
    --uno: 'absolute right-4 top-4';
  }
</style>
