<script>
  import {
    updateAlbumBySong,
    updateCover,
    updateSongLyrics,
  } from '$lib/utils/audio'
  import { open } from '@tauri-apps/api/dialog'
  import Dialog from '../shared/Dialog.svelte'
  import PopupEditor from '../shared/PopupEditor.svelte'
  import UploadImage from '../../icons/UploadImage.svelte'
  import {
    updateLyricsDialogOpen,
    songToUpdateLyrics,
    editLyricsContent,
  } from './store'
  import { convertFileSrc } from '@tauri-apps/api/tauri'

  /**
   * @type {HTMLInputElement}
   */
  let uploader

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

  const openCoverPicker = async () => {
    const selected = await open({
      multiple: false,
      filters: [
        {
          name: 'image',
          extensions: ['png', 'jpg', 'jpeg'],
        },
      ],
    })
    if (!selected || Array.isArray(selected)) return
    await updateCover($songToUpdateLyrics, selected)
    $songToUpdateLyrics = $songToUpdateLyrics
  }
</script>

<Dialog title="Update lyrics" bind:open="{$updateLyricsDialogOpen}">
  <div class="flex items-center mb-2" slot="title">
    <div class="cover-wrapper">
      <img
        class="cover"
        src="{$songToUpdateLyrics?.cover}"
        alt="{$songToUpdateLyrics?.title}"
      />
      <div class="upload-cover" on:keypress on:click="{openCoverPicker}">
        <div class="upload-icon-wrapper">
          <UploadImage />
        </div>
      </div>
    </div>
    <div class="flex-grow">
      <div>
        {$songToUpdateLyrics?.title}
      </div>
      <div class="text-3 mt-2">
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
  .cover-wrapper {
    --uno: 'relative mr-2 cursor-pointer';
  }
  .cover {
    --uno: 'w-15 h-15 rounded';
    object-fit: cover;
  }
  .upload-cover {
    --uno: 'absolute z-3 top-0 left-0 right-0 bottom-0 visibility-none opacity-0 bg-black bg-opacity-70 dark:bg-white dark:bg-opacity-50 rounded flex items-center justify-center text-primary dark:text-secondary text-5';
    transition: opacity ease-in-out 0.2s;
  }
  .cover-wrapper:hover .upload-cover {
    --uno: 'visibility-unset opacity-100';
  }

  .label {
    --uno: 'mb-2';
  }
</style>
