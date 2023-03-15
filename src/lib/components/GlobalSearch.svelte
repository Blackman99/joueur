<script lang="ts">
  import { goto } from '$app/navigation'
  import { db } from '$lib/db'
  import Search from '$lib/icons/Search.svelte'
  import { currentSongs, playingSongId } from '$lib/store'
  import type { Album, Artist, Song } from '$lib/types'
  import debounce from '$lib/utils/debounce'
  import { slide } from 'svelte/transition'
  import { selectedArtist } from '../../routes/artists/store'
  import { selectedAlbum } from '../../routes/albums/store'
  import clickOutside from '../actions/outside-click'

  let focused = false
  let keyword = ''

  let songs: Song[] = []
  let artists: Artist[] = []
  let albums: Album[] = []

  const getSongs = async () => {
    songs = await db.songs
      .filter(song => song.title.indexOf(keyword) !== -1)
      .toArray()
  }

  const getArtists = async () => {
    artists = await db.artists
      .filter(ar => ar.title.indexOf(keyword) !== -1)
      .toArray()
  }

  const getAlbums = async () => {
    albums = await db.albums
      .filter(al => al.title.indexOf(keyword) !== -1)
      .toArray()
  }

  const researchAll = debounce(() => {
    if (keyword) {
      getSongs()
      getAlbums()
      getArtists()
    } else {
      songs = []
      artists = []
      albums = []
    }
  })

  $: {
    keyword
    researchAll()
  }

  const handlePlay = (song: Song) => {
    if (!$currentSongs.some(s => s.id === song.id)) {
      $currentSongs.push(song)
      $currentSongs = $currentSongs
    }
    $playingSongId = song.id
    focused = false
  }

  const handleToArtist = (artist: Artist) => {
    $selectedArtist = artist
    focused = false
    goto('/artists')
  }

  const handleToAlbum = (album: Album) => {
    $selectedAlbum = album
    focused = false
    goto('/albums')
  }
</script>

<div
  class="global-search"
  class:focused="{focused}"
  use:clickOutside="{{
    cbOutside: () => (focused = false),
  }}"
>
  <div class="search-icon">
    <Search />
  </div>
  <div class="input-wrapper">
    <input
      placeholder="search"
      on:keyup|stopPropagation
      on:focus="{() => (focused = true)}"
      bind:value="{keyword}"
    />
  </div>

  {#if focused}
    <div class="search-result" transition:slide="{{ duration: 300 }}">
      <div class="result-category">
        <div class="category-title">Tracks</div>
        {#each songs as song (song.id)}
          <div
            class="result-item"
            on:click="{() => handlePlay(song)}"
            on:keypress
          >
            {@html `${song.title.replace(
              new RegExp(keyword),
              m => `<span class="text-primary">${m}</span>`
            )}`}
          </div>
        {/each}
        {#if !songs.length}
          <div class="text-gray-4">No data</div>
        {/if}
      </div>
      <div class="result-category">
        <div class="category-title">Artists</div>
        {#each artists as ar (ar.id)}
          <div
            class="result-item"
            on:click="{() => handleToArtist(ar)}"
            on:keypress
          >
            {@html `${ar.title.replace(
              new RegExp(keyword),
              m => `<span class="text-primary">${m}</span>`
            )}`}
          </div>
        {/each}
        {#if !artists.length}
          <div class="text-gray-4">No data</div>
        {/if}
      </div>
      <div class="result-category">
        <div class="category-title">Albums</div>
        {#each albums as al (al.id)}
          <div
            class="result-item"
            on:click="{() => handleToAlbum(al)}"
            on:keypress
          >
            {@html `${al.title.replace(
              new RegExp(keyword),
              m => `<span class="text-primary">${m}</span>`
            )}`}
          </div>
        {/each}
        {#if !albums.length}
          <div class="text-gray-4">No data</div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .global-search {
    --uno: 'flex transition-colors transition-200 items-center b-1 b-solid b-gray-3 rounded-[16px] mx-3 h-[32px] px-2 text-gray-4 relative z-3';
  }
  .focused {
    --uno: 'b-primary';
  }
  .input-wrapper {
    --uno: 'flex-grow ';
  }
  .search-icon {
    --uno: 'text-5 flex items-center';
  }
  input {
    --uno: 'border-none outline-none text-[14px] w-full pl-1';
  }
  .search-result {
    --uno: 'absolute min-w-[200px] left-0 bg-white b-1 rounded b-gray-2 b-solid p-2 text-[14px] text-secondary';
    top: calc(100% + 12px);
    box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px,
      rgba(0, 0, 0, 0.3) 0px 18px 36px -18px;
  }
  .result-category:not(:first-child) {
    --uno: 'pt-2';
  }
  .result-category:not(:last-child) {
    --uno: 'b-b-1 b-b-solid b-b-gray-2 pb-2';
  }
  .category-title {
    --uno: 'font-700 mb-2';
  }
  .result-item {
    --uno: 'py-1 px-2 j-clickable-item text-gray-6';
  }
</style>
