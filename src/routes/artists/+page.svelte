<script lang="ts">
  import Songs from '$lib/components/Songs.svelte'
  import VirtualScroll from '$lib/components/VirtualScroll.svelte'
  import { db } from '$lib/db'
  import { currentPlayingSongIds } from '$lib/store'
  import type { Artist, Song } from '$lib/types'
  import { onMount } from 'svelte'
  import {
    SELECTED_ARTIST_KEY,
    selectedArtist,
    selectedArtistSongs,
    offset,
    totalArtistNumber,
    limit,
    artists,
    scrollTop,
  } from './store'

  let songs: Songs

  $: hasArtist = !!$artists.length

  const handleArtistClick = (artist: Artist) => {
    $selectedArtist = artist
  }

  const getArtistSongs = async () => {
    if (!$selectedArtist) return
    $selectedArtistSongs = await db.songs
      .where('id')
      .anyOf($selectedArtist.songIds)
      .toArray()
  }

  $: {
    if ($selectedArtist) {
      getArtistSongs()
      localStorage.setItem(SELECTED_ARTIST_KEY, $selectedArtist.id.toString())
      songs?.resetVirtualScroller()
    }
  }

  onMount(async () => {
    const selectedArtistId = Number(localStorage.getItem(SELECTED_ARTIST_KEY))
    $selectedArtist = await db.artists
      .where('id')
      .equals(selectedArtistId)
      .first()
  })

  const paginateArtists = async () => {
    $artists = await db.artists.offset($offset).limit($limit).toArray()
  }

  let songsOffset = 0
  let songsLimit = 10

  $: {
    $limit
    $offset
    paginateArtists()
  }

  const handlePlay = async (e: CustomEvent<Song>) => {
    $currentPlayingSongIds = $selectedArtistSongs.map(s => s.id)
  }
</script>

<div class="artists">
  <div class="artist-list">
    {#if hasArtist}
      <VirtualScroll
        bind:limit="{$limit}"
        bind:offset="{$offset}"
        bind:scrollTop="{$scrollTop}"
        items="{$artists}"
        total="{$totalArtistNumber}"
        customClass="j-song-bg"
      >
        <svelte:fragment slot="item" let:item="{artist}">
          {@const active = artist.id === $selectedArtist?.id}
          <div
            class="artist-item"
            class:active="{active}"
            on:click="{() => handleArtistClick(artist)}"
            on:keyup="{() => handleArtistClick(artist)}"
          >
            <div class="title">
              {artist.title}
            </div>
            <div class="tracks">
              {artist.songIds.length} tracks
            </div>
          </div>
        </svelte:fragment>
        <div slot="skeleton-item" class="artist-item artist-item-skeleton">
          <div class="title-skeleton"></div>
          <div class="tracks-skeleton"></div>
        </div>
      </VirtualScroll>
    {/if}
  </div>
  <Songs
    bind:this="{songs}"
    total="{$selectedArtistSongs.length}"
    songs="{$selectedArtistSongs.slice(songsOffset, songsOffset + songsLimit)}"
    showActionsOnEmpty="{false}"
    resetCurrentSongsOnClick="{false}"
    bind:offset="{songsOffset}"
    bind:limit="{songsLimit}"
    on:play="{handlePlay}"
  />
</div>

<style>
  .artists {
    --uno: 'flex-grow flex overflow-y-hidden items-stretch';
  }
  .artist-list {
    --uno: 'w-[18vw] min-w-[220px] max-w-[240px] relative overflow-y-hidden';
  }
  .artist-item {
    --uno: 'text-[14px] h-10 w-full flex items-center leading-10 j-clickable-item box-border';
  }
  .active {
    --uno: 'j-active-item';
  }
  .title {
    --uno: 'max-w-[50%] flex-grow truncate indent-[8px]';
  }
  .tracks {
    --uno: 'max-w-[50%] text-3 flex-grow truncate text-gray-5 text-right pr-2';
  }
  .title-skeleton {
    --uno: 'dark:bg-gray-8 h-[14px] ml-2 w-[40%]';
  }
  .tracks-skeleton {
    --uno: 'dark:bg-gray-8 h-[12px] mr-6 w-[20%]';
  }
  .artist-item-skeleton {
    --uno: 'justify-between';
  }
</style>
