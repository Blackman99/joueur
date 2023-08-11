<script lang="ts">
  import ActionButton from './ActionButton.svelte'
  import ActionFolderMusic from '../icons/ActionFolderMusic.svelte'
  import ActionFileMusic from '../icons/ActionFileMusic.svelte'
  import { message, open } from '@tauri-apps/api/dialog'
  import { readDir } from '@tauri-apps/api/fs'
  import { db } from '../db'
  import type { Song } from '../types'
  import {
    getSongInfoFromFile,
    parseSongsFromFileEntries,
  } from '../utils/audio'
  import { AUDIO_EXTENSIONS } from '$lib/constants'

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

<div class="actions">
  <div class="tip">
    You can drag any files into this window or clicked the add button below
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

<style>
  .actions {
    --uno: 'flex flex-col gap-8 h-full items-center justify-center';
  }
  .tip {
    --uno: 'px-4';
    text-align-last: center;
  }
</style>
