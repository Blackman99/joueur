<script>
  import { updateAlbumBySong, updateSongLyrics } from '$lib/utils/audio'
  import Dialog from '../Dialog.svelte'
  import PopupEditor from '../PopupEditor.svelte'
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

  let editingAlbumTitle = ''
  let showAlbumEditor = false

  const handleEditAlbum = () => {
    editingAlbumTitle = $songToUpdateLyrics?.album
    showAlbumEditor = true
  }

  const handleSaveAlbum = async () => {
    await updateAlbumBySong($songToUpdateLyrics, editingAlbumTitle)
    $songToUpdateLyrics.title = editingAlbumTitle
    $songToUpdateLyrics = $songToUpdateLyrics
    showAlbumEditor = false
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
      <span>
        {$songToUpdateLyrics?.title}
      </span>
      <div class="text-gray-4 text-3 ml-2">
        {$songToUpdateLyrics?.artist}
        -
        <PopupEditor
          bind:value="{editingAlbumTitle}"
          bind:show="{showAlbumEditor}"
          on:done="{handleSaveAlbum}"
        >
          <span on:click="{handleEditAlbum}" on:keypress
            >{$songToUpdateLyrics?.album}
          </span>
        </PopupEditor>
      </div>
    </div>
  </div>
  <div class="label">Lyrics</div>
  <textarea
    class="lyrics-editor"
    bind:value="{$editLyricsContent}"
    on:keyup|stopPropagation></textarea>
  <div class="footer-actions">
    <div class="save-lyrics-btn" on:click="{handleSaveLyrics}" on:keypress>
      Save
    </div>
  </div>
</Dialog>

<style>
  .lyrics-editor {
    --uno: 'w-full resize-none h-[40vh] b-none outline-none b-1 b-solid b-gray-4 dark:b-gray-7 rounded text-secondary dark:text-gray-2 leading-5 bg-transparent';
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
  .label {
    --uno: 'mb-2';
  }
</style>
