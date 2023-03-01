<script lang="ts">
  import { browser } from '$app/environment'
  import ActionButton from '$lib/ActionButton.svelte'
  import { getMainConfWithEnsure } from '$lib/os-store'
  import pageTransition from '$lib/page-transition'
  import type { JoueurConf } from '$lib/types'

  let mainConf: JoueurConf

  const initMainConf = async () => {
    mainConf = await getMainConfWithEnsure()
  }
  if (browser) initMainConf()

  const handleAddDirectoryEntry = async () => {}

  const handleAddFileEntry = async () => {}
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
