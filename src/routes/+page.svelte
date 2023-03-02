<script lang="ts">
  import { message, open } from '@tauri-apps/api/dialog'
  import { readBinaryFile, readDir } from '@tauri-apps/api/fs'
  import * as musicMetadata from 'music-metadata-browser'
  import { browser } from '$app/environment'
  import ActionButton from '$lib/ActionButton.svelte'
  import { getMainConfWithEnsure } from '$lib/os-store'
  import pageTransition from '$lib/page-transition'
  import type { JoueurConf } from '$lib/types'

  export const getMetadata = async (filePath: string) => {
    const fileContents = await readBinaryFile(filePath)
    console.log('fileContents: ', fileContents)

    const metadata = await musicMetadata.parseBuffer(fileContents)
    console.log(metadata)
    return metadata
  }

  const audioFilter = {
    name: 'audio',
    extensions: ['mp3', 'wav'],
  }

  let mainConf: JoueurConf

  const initMainConf = async () => {
    mainConf = await getMainConfWithEnsure()
  }
  if (browser) initMainConf()

  const handleAddDirectoryEntry = async () => {
    const selected = await open({
      directory: true,
    })
    if (typeof selected === 'string') {
      try {
        const entries = await readDir(selected)
      } catch (error) {
        await message('Something wrong', { title: 'Joueur', type: 'error' })
      }
    }
  }

  const handleAddFileEntry = async () => {
    const selected = await open({
      multiple: true,
      filters: [audioFilter],
    })
    if (Array.isArray(selected)) {
      selected.forEach(async selected => {
        await getMetadata(selected)
      })
    } else if (selected) {
    }
  }
</script>

<div class="start" transition:pageTransition>
  <div class="actions">
    {#if !mainConf?.directoryEntries?.length}
      <ActionButton label="Add directory" on:click="{handleAddDirectoryEntry}">
        <div class="i-icon-park-outline:folder-music" slot="icon"></div>
      </ActionButton>
    {/if}
    {#if !mainConf?.fileEntries?.length}
      <ActionButton label="Add file" on:click="{handleAddFileEntry}">
        <div class="i-icon-park-outline:file-music" slot="icon"></div>
      </ActionButton>
    {/if}
  </div>
</div>

<style>
  .start {
    --uno: 'flex justify-center items-center h-full';
  }
  .actions {
    --uno: 'flex flex-col gap-8';
  }
</style>
