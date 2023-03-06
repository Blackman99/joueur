<script lang="ts">
  import { liveQuery } from 'dexie'
  import type { Readable } from 'svelte/store'
  import Menu from './Menu.svelte'
  import type { Song } from '$lib/types'
  import { db } from '$lib/db'
  import { playingSongId } from '$lib/store'

  $: playingSong = liveQuery(() =>
    db.songs.where('id').equals($playingSongId).first()
  ) as unknown as Readable<Song | undefined>
</script>

<aside class="j-side">
  <img src="/logo.svg" alt="Joueur" class="logo" />
  <div class="menus">
    <Menu label="Musics" to="/">
      <div slot="icon" class="i-bi:music-note-list"></div>
    </Menu>
    <Menu label="Artists" to="/artists">
      <div slot="icon" class="i-icon-park-outline:peoples-two"></div>
    </Menu>
    <Menu label="Album" to="/albums">
      <div slot="icon" class="i-iconoir:album-open"></div>
    </Menu>
    <Menu label="Settings" to="/settings">
      <div slot="icon" class="i-bytesize:settings"></div>
    </Menu>
  </div>
  <div>
    {#if $playingSong}
      <img class="cover" src="{$playingSong.cover}" alt="{$playingSong.title}" />
    {/if}
  </div>
</aside>

<style>
  .j-side {
    --uno: 'flex flex-col justify-between w-[18vw] box-border';
  }
  .menus {
    --uno: 'p-4';
  }
  .logo {
    --uno: 'w-[10vw] max-w-[120px] block mx-a';
  }
  .cover {
    --uno: 'w-full aspect-1 object-cover';
  }
</style>
