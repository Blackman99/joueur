<script lang="ts">
  import { goto } from '$app/navigation'
  import { db } from '$lib/db'
  import Search from '$lib/icons/Search.svelte'
  import { currentPlayingSongIds, playingSongId } from '$lib/store'
  import type { Album, Artist, Song } from '$lib/types'
  import debounce from '$lib/utils/debounce'
  import { slide } from 'svelte/transition'
  import { selectedArtist } from '../../routes/artists/store'
  import { selectedAlbum } from '../../routes/albums/store'
  import clickOutside from '../actions/outside-click'
  import Loading from './Loading.svelte'

  let focused = false
  let keyword = ''

  let songs: Song[] = []
  let artists: Artist[] = []
  let albums: Album[] = []

  let songsLoading = false
  let artistsLoading = false
  let albumsLoading = false

  const getSongs = async () => {
    try {
      songsLoading = true
      songs = await db.songs
        .filter(song => song.title.indexOf(keyword) !== -1)
        .limit(10)
        .toArray()
    } catch (error) {
    } finally {
      songsLoading = false
    }
  }

  const getArtists = async () => {
    try {
      artistsLoading = true
      artists = await db.artists
        .filter(ar => ar.title.indexOf(keyword) !== -1)
        .limit(10)
        .toArray()
    } catch (error) {
    } finally {
      artistsLoading = false
    }
  }

  const getAlbums = async () => {
    try {
      albumsLoading = true
      albums = await db.albums
        .filter(al => al.title.indexOf(keyword) !== -1)
        .limit(10)
        .toArray()
    } catch (error) {
    } finally {
      albumsLoading = false
    }
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
    if (!$currentPlayingSongIds.some(id => id === song.id)) {
      $currentPlayingSongIds.push(song.id)
      $currentPlayingSongIds = $currentPlayingSongIds
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
    <div class="search-result" transition:slide="{{ duration: 200 }}">
      <div class="result-category">
        <div class="category-title">Tracks</div>
        {#if songsLoading}
          <div class="loading">
            <Loading />
          </div>
        {:else if !songs.length}
          <div class="no-data">No data</div>
        {:else}
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
        {/if}
      </div>
      <div class="result-category">
        <div class="category-title">Artists</div>
        {#if artistsLoading}
          <div class="loading">
            <Loading />
          </div>
        {:else if !artists.length}
          <div class="no-data">No data</div>
        {:else}
          {#each artists as ar (ar.id)}
            <div
              class="result-item"
              on:click="{() => handleToArtist(ar)}"
              on:keypress
            >
              {@html `${ar.title.replace(
                new RegExp(keyword),
                m => `<span class="text-primary">${m}</span>`
              )}`} · <small>{ar.songIds.length} tracks</small>
            </div>
          {/each}
        {/if}
      </div>
      <div class="result-category">
        <div class="category-title">Albums</div>
        {#if albumsLoading}
          <div class="loading">
            <Loading />
          </div>
        {:else if !albums.length}
          <div class="no-data">No data</div>
        {:else}
          {#each albums as al (al.id)}
            <div
              class="result-item"
              on:click="{() => handleToAlbum(al)}"
              on:keypress
            >
              {@html `${al.title.replace(
                new RegExp(keyword),
                m => `<span class="text-primary">${m}</span>`
              )}`} · <small>{al.songIds.length} tracks</small>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .global-search {
    --uno: 'flex transition-colors transition-200 items-center b-1 b-solid b-gray-3 dark:b-gray-7 rounded-[16px] mx-3 h-[28px] px-2 text-gray-4 relative z-10 ';
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
    --uno: 'border-none outline-none text-3 w-full pl-1 bg-transparent dark:text-gray-4';
  }
  .search-result {
    --uno: 'absolute min-w-[320px] w-[70vw] left-[50%] bg-white dark:bg-black b-1 rounded b-gray-2 dark:b-gray-7 b-solid p-2 text-[14px] flex text-secondary dark:text-gray-3 z-3';
    top: calc(100% + 12px);
    box-shadow: rgba(50, 50, 93, 0.25) 0px 30px 60px -12px,
      rgba(0, 0, 0, 0.3) 0px 18px 36px -18px;
    transform: translateX(-50%);
  }
  .result-category {
    --uno: 'max-h-[50vh] overflow-y-auto relative pb-2 flex-shrink-0';
    width: 33.333%;
  }
  .result-category:not(:first-child) .category-title {
    --uno: 'pt-2';
  }
  .category-title {
    --uno: 'font-700 py-2 pl-2 sticky top-0 b-b-1 b-b-solid b-b-light-4 dark:b-b-gray-8 text-center';
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }
  .result-item {
    --uno: 'py-2 px-2 j-clickable-item text-gray-6 dark:text-gray-4';
  }
  .no-data {
    --uno: 'text-gray-4 text-center pt-2';
  }
  .loading {
    --uno: 'flex justify-center text-5 py-2';
  }
</style>
