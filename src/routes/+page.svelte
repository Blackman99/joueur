<script lang="ts">
  import { message, open } from '@tauri-apps/api/dialog'
  import { liveQuery } from 'dexie'
  import { readDir } from '@tauri-apps/api/fs'
  import type { Readable } from 'svelte/store'
  import { db } from '$lib/db'
  import ActionButton from '$lib/components/ActionButton.svelte'
  import pageTransition from '$lib/page-transition'
  import { AUDIO_EXTENSIONS } from '$lib/constants'
  import type { Song } from '$lib/types'
  import Songs from '$lib/components/Songs.svelte'
  import { getSongInfoFromFile } from '$lib/utils/audio'

  const songs = liveQuery(() => db.songs.toArray()) as unknown as Readable<
    Song[]
  >

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
        const entries = await readDir(selected)
      } catch (error) {
        await message('Something went wrong', {
          title: 'Joueur',
          type: 'error',
        })
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
          db.songs.put(song)
        }
      }
    } catch (error) {
    } finally {
      loading = false
    }
  }
</script>

<div class="start" transition:pageTransition>
  {#if $songs && $songs.length}
    <Songs songs="{$songs}" />
  {:else}
    <div class="actions">
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
</div>

<style>
  .start {
    --uno: 'flex justify-center items-center h-full';
  }
  .actions {
    --uno: 'flex flex-col gap-8';
  }
</style>
