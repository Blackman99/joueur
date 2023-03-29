<script lang="ts">
  import ExpandableButton from '$lib/components/ExpandableButton.svelte'
  import Songs from '$lib/components/Songs.svelte'
  import VirtualScroll from '$lib/components/VirtualScroll.svelte'
  import { db } from '$lib/db'
  import { isSm } from '$lib/layout'
  import { currentPlayingSongIds } from '$lib/store'
  import type { Artist, Song } from '$lib/types'
  import { onMount, tick } from 'svelte'
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

  let expanded = true

  let artistVirtualScroller: VirtualScroll

  const resetVScroller = () => {
    if (expanded || !$isSm) {
      $limit = 10
      tick().then(() => {
        artistVirtualScroller?.recomputeInitialData()
      })
    }
  }
</script>

<div class="artists">
  <div
    class="artist-list"
    class:expanded="{expanded}"
    on:transitionend|self="{resetVScroller}"
  >
    {#if hasArtist}
      <VirtualScroll
        bind:this="{artistVirtualScroller}"
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
    <ExpandableButton bind:expanded="{expanded}" />
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
    --uno: 'w-[240px] max-w-0 sm:max-w-[240px] relative';
    overflow: visible;
    transition: max-width ease-in-out 0.3s;
  }
  .expanded {
    --uno: 'max-w-[240px]';
  }
  .artist-item {
    --uno: 'w-[225px] text-[14px] max-w-[100%] h-10 leading-10 j-clickable-item box-border';
  }
  .active {
    --uno: 'j-active-item';
  }
  .title {
    --uno: 'indent-[8px] w-65% inline-block truncate';
  }
  .tracks {
    --uno: 'text-3 text-gray-5 w-30% inline-block text-right truncate box-border';
  }
  .title-skeleton {
    --uno: 'bg-gray-3 dark:bg-gray-8 h-[14px] ml-2 w-[40%]';
  }
  .tracks-skeleton {
    --uno: 'bg-gray-3 dark:bg-gray-8 h-[12px] mr-2 w-[20%]';
  }
  .artist-item-skeleton {
    --uno: 'justify-between flex items-center';
  }
</style>
