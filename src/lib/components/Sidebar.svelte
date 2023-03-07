<script lang="ts">
  import { liveQuery } from 'dexie'
  import type { Readable } from 'svelte/store'
  import Menu from './Menu.svelte'
  import type { Song } from '$lib/types'
  import { db } from '$lib/db'
  import { playingSongId } from '$lib/store'
    import MenuMusics from '$lib/icons/MenuMusics.svelte'
    import MenuArtists from '$lib/icons/MenuArtists.svelte'
    import MenuAlbums from '$lib/icons/MenuAlbums.svelte'
    import MenuSettings from '$lib/icons/MenuSettings.svelte'

  $: playingSong = liveQuery(() =>
    db.songs.where('id').equals($playingSongId).first()
  ) as unknown as Readable<Song | undefined>
</script>

<aside class="j-side">
  <img src="/logo.svg" alt="Joueur" class="logo" />
  <div class="menus">
    <Menu label="Musics" to="/">
      <MenuMusics slot="icon" />
    </Menu>
    <Menu label="Artists" to="/artists">
      <MenuArtists slot="icon" />
    </Menu>
    <Menu label="Albums" to="/albums">
      <MenuAlbums slot="icon" />
    </Menu>
    <Menu label="Settings" to="/settings">
      <MenuSettings slot="icon" />
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
    --uno: 'flex flex-col justify-between bg-white w-[18vw] min-w-180px max-w-[240px] box-border';
  }
  .menus {
    --uno: 'p-4';
  }
  .logo {
    --uno: 'w-[10vw] max-w-[120px] min-w-[80px] block mx-a';
  }
  .cover {
    --uno: 'w-full aspect-1 object-cover block';
  }
</style>
