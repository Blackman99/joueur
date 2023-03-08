<script lang="ts">
  import PlaylistActive from '$lib/icons/PlaylistActive.svelte'
  import { selectedPlaylistId } from '$lib/store'
  import { playlists } from '$lib/store'

  const handlePlaylistClick = (id: number) => {
    $selectedPlaylistId = id
  }
</script>

<div class="playlist">
  <div class="lists">
    {#if $playlists}
      {#each $playlists as playlist (playlist.id)}
        {@const active = playlist.id === $selectedPlaylistId}
        <div
          class="playlist-item"
          class:active="{active}"
          on:click="{() => handlePlaylistClick(playlist.id)}"
          on:keyup="{() => handlePlaylistClick(playlist.id)}"
        >
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
    --uno: 'leading-10 px-4 flex items-center justify-between j-clickable-item';
  }
  .lists {
    --uno: 'flex-grow';
  }
  .active {
    --uno: 'text-primary';
  }
  .active-icon {
    --uno: 'text-4 flex items-center';
  }
  .num {
    --uno: 'text-gray-6 text-[12px]';
  }
</style>
