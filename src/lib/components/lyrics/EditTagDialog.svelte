<script>
  import { open } from '@tauri-apps/api/dialog'
  import Dialog from '../shared/Dialog.svelte'
  import PopupEditor from '../shared/PopupEditor.svelte'
  import UploadImage from '../../icons/UploadImage.svelte'
  import {
    editLyricsContent,
    songToUpdateTags,
    updateLyricsDialogOpen,
  } from './store'
  import {
    updateAlbumBySong,
    updateArtist,
    updateCover,
    updateSongLyrics,
    updateTitle,
  } from '$lib/utils/audio'

  const handleSaveLyrics = async () => {
    await updateSongLyrics($songToUpdateTags, $editLyricsContent)
    $updateLyricsDialogOpen = false
    $editLyricsContent = ''
  }

  let editingAlbumTitle = ''
  let showAlbumEditor = false

  let editingSongTitle = ''
  let showSongTitleEditor = false

  let editingArtist = ''
  let showArtistEditor = false

  const handleEditAlbum = () => {
    editingAlbumTitle = $songToUpdateTags?.album
    showAlbumEditor = true
  }

  const handleEditTitle = () => {
    editingSongTitle = $songToUpdateTags.title
    showSongTitleEditor = true
  }

  const handleEditArtist = () => {
    editingArtist = $songToUpdateTags.artist
    showArtistEditor = true
  }

  const handleSaveAlbum = async () => {
    await updateAlbumBySong($songToUpdateTags, editingAlbumTitle)
    $songToUpdateTags.title = editingAlbumTitle
    $songToUpdateTags = $songToUpdateTags
    showAlbumEditor = false
  }

  const handleSaveTitle = async () => {
    await updateTitle($songToUpdateTags, editingSongTitle)
    $songToUpdateTags = $songToUpdateTags
    showSongTitleEditor = false
  }

  const handleSaveArtist = async () => {
    await updateArtist($songToUpdateTags, editingArtist)
    $songToUpdateTags = $songToUpdateTags
    showArtistEditor = false
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
    await updateCover($songToUpdateTags, selected)
    $songToUpdateTags = $songToUpdateTags
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->

<Dialog title="Update lyrics" bind:open="{$updateLyricsDialogOpen}">
  <div class="title" slot="title">
    <div class="cover-wrapper">
      <img
        class="cover"
        src="{$songToUpdateTags?.cover}"
        alt="{$songToUpdateTags?.title}"
      />
      <div class="upload-cover" on:keypress on:click="{openCoverPicker}">
        <div class="upload-icon-wrapper">
          <UploadImage />
        </div>
      </div>
    </div>
    <div class="flex-grow-1">
      <PopupEditor
        bind:value="{editingSongTitle}"
        bind:show="{showSongTitleEditor}"
        on:done="{handleSaveTitle}"
      >
        <div on:click="{handleEditTitle}" on:keypress>
          {$songToUpdateTags?.title}
        </div>
      </PopupEditor>
      <div class="text-3 mt-2">
        <PopupEditor
          bind:value="{editingArtist}"
          bind:show="{showArtistEditor}"
          on:done="{handleSaveArtist}"
        >
          <span on:click="{handleEditArtist}" on:keypress>
            {$songToUpdateTags?.artist}
          </span>
        </PopupEditor>
        -
        <PopupEditor
          bind:value="{editingAlbumTitle}"
          bind:show="{showAlbumEditor}"
          on:done="{handleSaveAlbum}"
        >
          <span on:click="{handleEditAlbum}" on:keypress
            >{$songToUpdateTags?.album}
          </span>
        </PopupEditor>
      </div>
    </div>
  </div>
  <div class="label">Lyrics</div>
  <textarea
    class="lyrics-editor"
    bind:value="{$editLyricsContent}"
    on:keyup|stopPropagation
  ></textarea>
  <div class="footer-actions">
    <div class="save-lyrics-btn" on:click="{handleSaveLyrics}" on:keypress>
      Close
    </div>
  </div>
</Dialog>

<style>
  .title {
    --uno: 'flex items-center mb-2 flex-grow';
  }
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
