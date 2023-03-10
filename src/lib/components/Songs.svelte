<!-- @component
  This component can be used as any song list in app
 -->
<script lang="ts">
  // @ts-nocheck
  import { playingSongId, playing, currentSongs } from '$lib/store'
  import type { Song } from '$lib/types'
  import { createEventDispatcher } from 'svelte'
  import Actions from './Actions.svelte'
  import PlayingIcon from './PlayingIcon.svelte'
  import contextMenu from '../actions/contextMenu'
  import type { ContextMenu } from '../actions/contextMenu'
  import ContextMenu from './ContextMenu.svelte'

  export let songs: Song[]
  export let showActionsOnEmpty = true
  export let resetCurrentSongsOnClick = true
  export let draggable = false
  export let draggingSongId: number | null = null
  export let contextMenus: ContextMenu[] = []

  const dispatch = createEventDispatcher()

  const handlePlay = (song: Song) => {
    $playing = true
    $playingSongId = song.id
    if (resetCurrentSongsOnClick) {
      $currentSongs = songs
    }
  }
  const handleDragstart = (song: Song) => {
    draggingSongId = song.id
  }

  const onDragend = () => {
    dispatch('maybe-drop-in-playlist')
  }
</script>

<div class="songs">
  {#each songs as song (song.id)}
    {@const isPlaying = song.id === $playingSongId}
    <!-- ignore the type error below -->
    <div
      draggable="{draggable}"
      class="song-row"
      class:active="{isPlaying}"
      class:dragging="{draggingSongId === song.id}"
      on:dblclick="{() => handlePlay(song)}"
      on:dragstart="{() => handleDragstart(song)}"
      on:dragend="{onDragend}"
      use:contextMenu="{{
        actionHandler: (_e, m) => {
          dispatch(m.name, song.id)
        },
        menus: contextMenus,
      }}"
    >
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
    --uno: 'flex-grow text-[14px] overflow-y-auto h-full bg-light-4';
  }
  .song-row {
    --uno: 'flex items-start px-4 py-2 cursor-pointer j-clickable-item transition-bg transition-200';
    user-select: none;
    -webkit-user-select: none;
  }
  .active {
    --uno: 'j-active-item';
  }
  .cover {
    --uno: 'w-8 rounded mr-2';
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
</style>
