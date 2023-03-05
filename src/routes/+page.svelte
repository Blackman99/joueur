<script lang="ts">
  import { message, open } from '@tauri-apps/api/dialog'
  import { liveQuery } from 'dexie'
  import { readDir } from '@tauri-apps/api/fs'
  import type { Readable } from 'svelte/store'
  import { db } from '$lib/db'
  import ActionButton from '$lib/components/ActionButton.svelte'
  import { AUDIO_EXTENSIONS } from '$lib/constants'
  import type { Song } from '$lib/types'
  import Songs from '$lib/components/Songs.svelte'

  import {
    getSongInfoFromFile,
    parseSongsFromFileEntries,
  } from '$lib/utils/audio'

  let queryEnd = false

  const songs = liveQuery(() => db.songs.toArray()) as unknown as Readable<
    Song[]
  >

  const unsubscribe = songs.subscribe(() => {
    queryEnd = true
    // The unsubscribe returned by dexie is not identical with svelte store
    if (!unsubscribe.closed) unsubscribe.unsubscribe()
  }) as any

  const audioFilter = {
    name: 'audio',
    extensions: AUDIO_EXTENSIONS,
  }

  const handleAddDirectoryEntry = async () => {
    const selected = await open({
      directory: true,
    })
    if (typeof selected === 'string') {
      try {
        loading = true
        const entries = await readDir(selected, {
          recursive: true,
        })
        const songs: Song[] = await parseSongsFromFileEntries(entries)
        await db.addSongs(songs)
      } catch (error) {
        await message('Something went wrong', {
          title: 'Joueur',
          type: 'error',
        })
      } finally {
        loading = false
      }
    }
  }

  let loading = false

  const handleAddFileEntry = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [audioFilter],
      })
      if (Array.isArray(selected)) {
        loading = true
        for (const path of selected) {
          const song = await getSongInfoFromFile(path)
          await db.addSong(song)
        }
      }
    } catch (error) {
    } finally {
      loading = false
    }
  }
</script>

<div class="start">
  {#if queryEnd}
    {#if $songs && $songs.length}
      <Songs songs="{$songs}" />
    {:else}
      <div class="actions">
        <div>
          You can drag any files into this window or clicked the add button
          below
        </div>
        <ActionButton
          label="Add directory"
          on:click="{handleAddDirectoryEntry}"
          loading="{loading}"
        >
          <div class="i-icon-park-outline:folder-music" slot="icon"></div>
        </ActionButton>
        <ActionButton
          label="Add file"
          on:click="{handleAddFileEntry}"
          loading="{loading}"
        >
          <div class="i-icon-park-outline:file-music" slot="icon"></div>
        </ActionButton>
      </div>
    {/if}
  {/if}
</div>

<style>
  .start {
    --uno: 'flex-grow overflow-y-auto';
  }
  .actions {
    --uno: 'flex flex-col gap-8 h-full flex items-center justify-center';
  }
</style>
