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
  import LyricsDisplay from './lyrics/LyricsDisplay.svelte'
  import DefaultCover from '$lib/icons/DefaultCover.svelte'
  import GlobalSearch from './GlobalSearch.svelte'
  import { fullscreen } from './lyrics/store'

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
</script>

<aside class="j-side">
  <div>
    <img src="/logo.svg" alt="Joueur" class="logo" />
    <GlobalSearch />
  </div>
  <div class="menus">
    <Menu label="Musics" to="/" rounded>
      <MenuMusics slot="icon" />
    </Menu>
    <Menu label="Artists" to="/artists" rounded>
      <MenuArtists slot="icon" />
    </Menu>
    <Menu label="Albums" to="/albums" rounded>
      <MenuAlbums slot="icon" />
    </Menu>
    <Menu label="Settings" to="/settings" rounded>
      <MenuSettings slot="icon" />
    </Menu>
  </div>
  <div class="cover-wrapper" class:fullscreen="{$fullscreen}">
    <LyricsDisplay />
    {#if $playingSong}
      {#key $playingSongId}
        {#if $playingSong.cover}
          <img
            in:coverIn
            out:coverOut
            class="cover"
            src="{$playingSong.cover}"
            alt="{$playingSong.title}"
          />
        {:else}
          <div class="default-cover">
            <DefaultCover />
          </div>
        {/if}
      {/key}
    {/if}
  </div>
</aside>

<style>
  @keyframes fullscreen-enter {
    from {
      width: 18vw;
      height: 18vw;
    }
    to {
      height: 100%;
      width: 100%;
    }
  }
  .j-side {
    --uno: 'flex flex-col shrink-0 justify-between bg-white w-[18vw] min-w-180px max-w-[240px] box-border';
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
    --uno: 'relative z-9 transition-all transition-300 left-0 bottom-0 text-[12px] leading-5';
  }
  .fullscreen {
    --uno: 'fixed bottom-0 left-0 h-full w-full z-103 text-14px leading-[28px] sm:text-[16px] leading-[32px] lg:text-[18px] lg:leading-[36px]';
    animation: fullscreen-enter 300ms ease-in-out 0s 1;
  }
  .fullscreen .cover {
    --uno: 'aspect-unset h-full';
  }
  .default-cover {
    --uno: 'w-full aspect-1 flex items-center text-10 justify-center bg-white';
  }
</style>
