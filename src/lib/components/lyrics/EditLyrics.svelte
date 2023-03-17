<script>
  import { updateSongLyrics } from '$lib/utils/audio'
  import { onMount } from 'svelte'
  import Dialog from '../Dialog.svelte'
  import {
    updateLyricsDialogOpen,
    songToUpdateLyrics,
    editLyricsContent,
  } from './store'

  const handleSaveLyrics = async () => {
    await updateSongLyrics($songToUpdateLyrics, $editLyricsContent)
    $updateLyricsDialogOpen = false
    $editLyricsContent = ''
  }
</script>

<Dialog title="Update lyrics" bind:open="{$updateLyricsDialogOpen}">
  <div class="flex items-center mb-2" slot="title">
    <img
      class="cover"
      src="{$songToUpdateLyrics?.cover}"
      alt="{$songToUpdateLyrics?.title}"
    />
    <div class="flex items-end">
      {$songToUpdateLyrics?.title}
      <span class="text-gray-4 text-3 ml-2">
        {$songToUpdateLyrics?.artist} - {$songToUpdateLyrics?.album}
      </span>
    </div>
  </div>
  <textarea class="lyrics-editor" bind:value="{$editLyricsContent}"></textarea>
  <div class="footer-actions">
    <div class="save-lyrics-btn" on:click="{handleSaveLyrics}" on:keypress>
      Save
    </div>
  </div>
</Dialog>

<style>
  .lyrics-editor {
    --uno: 'w-full resize-none h-[40vh] b-none outline-none b-1 b-solid b-gray-4 rounded text-secondary leading-5';
  }
  .footer-actions {
    --uno: 'flex justify-end pt-4';
  }
  .save-lyrics-btn {
    --uno: 'py-2 px-3 bg-primary bg-opacity-80 rounded text-[14px] text-white cursor-pointer hover:bg-opacity-90 active:bg-opacity-100';
  }
  .cover {
    --uno: 'w-8 h-8 rounded mr-2';
    object-fit: cover;
  }
</style>
