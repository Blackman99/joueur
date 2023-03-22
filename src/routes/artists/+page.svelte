<script lang="ts">
  import Songs from '$lib/components/Songs.svelte'
  import VirtualScroll from '$lib/components/VirtualScroll.svelte'
  import { db } from '$lib/db'
  import PlaylistActive from '$lib/icons/PlaylistActive.svelte'
  import type { Artist } from '$lib/types'
  import { onMount } from 'svelte'
  import {
    SELECTED_ARTIST_KEY,
    selectedArtist,
    selectedArtistSongs,
    offset,
    totalArtistNumber,
    limit,
    artists,
  } from './store'

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
</script>

<div class="artists">
  <div class="artist-list">
    {#if hasArtist}
      <VirtualScroll
        items="{$artists}"
        total="{$totalArtistNumber}"
        bind:limit="{$limit}"
        bind:offset="{$offset}"
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
              <div class="meta">
                ({artist.songIds.length})
              </div>
            </div>
            <div class="active-icon">
              {#if active}
                <PlaylistActive />
              {/if}
            </div>
          </div>
        </svelte:fragment>
      </VirtualScroll>
    {/if}
  </div>
  <Songs
    total="{$selectedArtistSongs.length}"
    songs="{$selectedArtistSongs.slice(songsOffset, songsOffset + songsLimit)}"
    showActionsOnEmpty="{false}"
    bind:offset="{songsOffset}"
    bind:limit="{songsLimit}"
  />
</div>

<style>
  .artists {
    --uno: 'flex-grow overflow-y-hidden flex items-stretch';
  }
  .artist-list {
    --uno: 'w-[18vw] min-w-[220px] max-w-[240px] overflow-y-auto';
  }
  .title {
    --uno: 'flex items-center';
  }
  .meta {
    --uno: 'text-gray-4 text-[12px] ml-2';
  }
  .artist-item {
    --uno: 'flex items-center justify-between text-[14px] leading-6 py-2 px-4 j-clickable-item';
  }
  .active {
    --uno: 'j-active-item';
  }
  .active-icon {
    --uno: 'text-4 ml-2';
  }
</style>
