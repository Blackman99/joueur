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
  import { cubicInOut } from 'svelte/easing'
  import IconButton from './IconButton.svelte'
  import ControlPlay from '$lib/icons/ControlPlay.svelte'
  import { playing } from '../store'
  import ControlPause from '$lib/icons/ControlPause.svelte'
  import { fade } from 'svelte/transition'

  $: playingSong = liveQuery(() =>
    db.songs.where('id').equals($playingSongId).first()
  ) as unknown as Readable<Song | undefined>

  const coverIn = (node: any) => {
    const existingTransform = getComputedStyle(node).transform.replace(
      'none',
      ''
    )
    return {
      duration: 800,
      easing: cubicInOut,
      css: (t: number, u: number) =>
        `transform: ${existingTransform} translateX(${
          t < 0.5 ? 100 * t : 100 * (1 - t)
        }%) scale(${
          1 - u * 0.5
        }); opacity: ${t};position: relative;z-index: ${Math.floor(10 * t)}`,
    }
  }

  const coverOut = (node: any) => {
    const existingTransform = getComputedStyle(node).transform.replace(
      'none',
      ''
    )
    return {
      duration: 800,
      easing: cubicInOut,
      css: (t: number, u: number) =>
        `transform: ${existingTransform} translateX(${
          t < 0.5 ? -100 * t : -100 * (1 - t)
        }%) rotate(${
          u < 0.5 ? -60 * u : -60 * (1 - u)
        }deg); transform-origin: bottom left; position: absolute; z-index: ${Math.floor(
          10 * t
        )};`,
    }
  }

  let showControl = false

  const togglePlayPause = () => {
    $playing = !$playing
  }
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
  <div
    class="cover-wrapper"
    on:mouseenter="{() => (showControl = true)}"
    on:mouseleave="{() => (showControl = false)}"
    on:click="{togglePlayPause}"
    on:keyup="{togglePlayPause}"
  >
    {#if $playingSong}
      {#key $playingSongId}
        <img
          in:coverIn
          out:coverOut
          class="cover"
          src="{$playingSong.cover}"
          alt="{$playingSong.title}"
        />
      {/key}
      {#if showControl}
        <div
          class="play-control"
          transition:fade="{{ duration: 100, delay: 0 }}"
        >
          <IconButton size="48px">
            {#if $playing}
              <ControlPause />
            {:else}
              <ControlPlay />
            {/if}
          </IconButton>
        </div>
      {/if}
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
  .cover-wrapper {
    --uno: 'relative';
  }
  .play-control {
    --uno: 'absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-70 text-white flex items-center justify-center cursor-pointer active:bg-opacity-50';
  }
</style>
