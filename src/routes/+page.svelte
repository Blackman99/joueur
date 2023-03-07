<script lang="ts">
  import { message, open } from '@tauri-apps/api/dialog'
  import { readDir } from '@tauri-apps/api/fs'
  import { db } from '$lib/db'
  import ActionButton from '$lib/components/ActionButton.svelte'
  import { AUDIO_EXTENSIONS } from '$lib/constants'
  import type { Song } from '$lib/types'
  import Songs from '$lib/components/Songs.svelte'
  import { currentSongsInList } from '$lib/store'

  import {
    getSongInfoFromFile,
    parseSongsFromFileEntries,
  } from '$lib/utils/audio'
  import Playlists from '$lib/components/Playlists.svelte'
  import ActionFolderMusic from '$lib/icons/ActionFolderMusic.svelte'
  import ActionFileMusic from '$lib/icons/ActionFileMusic.svelte'
  import CreatePlaylistFloatButton from '$lib/components/CreatePlaylistFloatButton.svelte'

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
  {#await $currentSongsInList}
    <div class="loading">Just a sec...</div>
  {:then songs}
    {#if songs.length}
      <Playlists />
      <Songs songs="{songs}" />
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
          <ActionFolderMusic slot="icon" />
        </ActionButton>
        <ActionButton
          label="Add file"
          on:click="{handleAddFileEntry}"
          loading="{loading}"
        >
          <ActionFileMusic slot="icon" />
        </ActionButton>
      </div>
    {/if}
  {/await}
  <CreatePlaylistFloatButton />
</div>

<style>
  .start {
    --uno: 'flex-grow flex items-stretch overflow-y-auto justify-center relative';
  }
  .actions {
    --uno: 'flex flex-col gap-8 h-full items-center justify-center';
  }
  .loading {
    --uno: 'text-gray-6 py-3 px-2';
  }
</style>
