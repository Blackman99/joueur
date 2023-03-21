<script lang="ts">
  import DialogClose from '$lib/icons/DialogClose.svelte'
  import QuitFullscreen from '$lib/icons/QuitFullscreen.svelte'
  import WindowMaximize from '$lib/icons/WindowMaximize.svelte'
  import WindowMinimize from '$lib/icons/WindowMinimize.svelte'
  import { ask } from '@tauri-apps/api/dialog'
  import { appWindow } from '@tauri-apps/api/window'
  import IconButton from './IconButton.svelte'
  import { fullscreen, quittingFullscreen } from './lyrics/store'

  const handleMousedown = async () => {
    appWindow.startDragging()
  }

  const askClose = async () => {
    const yes = await ask('Confirm to quit Joueur?', {
      title: 'Confirm',
      type: 'info',
    })
    if (yes) {
      appWindow.close()
    }
  }

  const quitFullscreen = () => {
    $quittingFullscreen = true
    $fullscreen = false
  }
</script>

<div
  class="titlebar"
  class:fullscreen="{$fullscreen}"
  on:mousedown="{handleMousedown}"
  on:dblclick="{async () => appWindow.toggleMaximize()}"
>
  <IconButton smallPadding on:click="{() => appWindow.minimize()}">
    <WindowMinimize />
  </IconButton>
  <IconButton smallPadding on:click="{async () => appWindow.toggleMaximize()}">
    <WindowMaximize />
  </IconButton>
  <IconButton smallPadding on:click="{askClose}">
    <DialogClose />
  </IconButton>
  {#if $fullscreen}
    <IconButton smallPadding on:click="{quitFullscreen}">
      <QuitFullscreen />
    </IconButton>
  {/if}
</div>

<style>
  .titlebar {
    --uno: 'fixed bg-white dark:bg-black top-0 left-0 right-0 z-106 h-[30px] flex items-center justify-end gap-1 px-2';
  }
  .fullscreen {
    --uno: 'text-gray-1 bg-transparent dark:bg-transparent';
  }
</style>
