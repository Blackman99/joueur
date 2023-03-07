<script lang="ts">
  import { playingSongId } from '$lib/store'
  import type { Song } from '$lib/types'
  import PlayingIcon from './PlayingIcon.svelte'

  export let songs: Song[]
</script>

<div class="songs">
  {#each songs as song (song.id)}
    {@const isPlaying = song.id === $playingSongId}
    <div class="song-row" on:dblclick="{() => ($playingSongId = song.id)}">
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
</div>

<style>
  .songs {
    --uno: 'flex-grow text-[14px] overflow-y-auto h-full bg-light-4';
  }
  .song-row {
    --uno: 'flex items-start px-4 py-2 cursor-pointer hover:bg-primary hover:bg-opacity-8 transition-bg transition-200';
    user-select: none;
    -webkit-user-select: none;
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
</style>
