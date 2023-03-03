<script lang="ts">
  import type { Song } from '$lib/types'

  export let songs: Song[]
</script>

<div class="songs">
  {#each songs as song (song.id)}
    <div class="song-row">
      <img class="cover" src="{song.cover}" alt="{song.title}" />
      <div class="info">
        <div>
          {song.title}
        </div>
        <div class="meta">
          <div>
            {song.artist} - {song.album || 'Unknown'}
          </div>
          <div>
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
    --uno: 'flex-grow h-full text-[14px] overflow-y-auto';
  }
  .song-row {
    --uno: 'flex items-start px-4 py-2 cursor-pointer hover:bg-primary hover:bg-opacity-8 transition-bg transition-200';
  }
  .cover {
    --uno: 'w-8 h-8 rounded mr-2';
  }
  .meta {
    --uno: 'text-warm-gray-5 text-[12px] flex justify-between';
  }
  .info {
    --uno: 'flex-grow';
  }
</style>
