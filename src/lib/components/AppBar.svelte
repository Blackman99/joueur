<script lang="ts">
  import DialogClose from '$lib/icons/DialogClose.svelte'
  import QuitFullscreen from '$lib/icons/QuitFullscreen.svelte'
  import WindowMaximize from '$lib/icons/WindowMaximize.svelte'
  import WindowMinimize from '$lib/icons/WindowMinimize.svelte'
  import { inWindow } from '$lib/store'
  import { ask } from '@tauri-apps/api/dialog'
  import { appWindow } from '@tauri-apps/api/window'
  import { onMount } from 'svelte'
  import IconButton from './IconButton.svelte'
  import { fullscreen, quittingFullscreen } from './lyrics/store'

  const handleMousedown = async () => {
    appWindow.startDragging()
  }

  let left = 0

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

  const handleResize = () => {
    left = document.getElementById('sidebar')?.offsetWidth || 0
  }

  onMount(() => {
    handleResize()
  })
</script>

<svelte:window on:resize="{handleResize}" />

<div
  class="titlebar"
  class:fullscreen="{$fullscreen}"
  class:fullscreen-show="{$fullscreen && $inWindow}"
  on:mousedown="{handleMousedown}"
  on:dblclick="{async () => appWindow.toggleMaximize()}"
  style="--j-app-bar-left: {left}px;"
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
    --uno: 'fixed bg-white dark:bg-black top-0 right-0 z-106 h-[30px] flex items-center justify-end gap-1 px-2';
    left: var(--j-app-bar-left);
  }
  .titlebar:not(.fullscreen) {
    --uno: 'b-b-1 b-b-solid b-b-light-4 dark:b-b-gray-8';
  }
  .fullscreen {
    --uno: 'text-gray-1 bg-transparent dark:bg-transparent';
    transition: transform linear 0.3s;
    transform: translateY(-100%);
  }
  .fullscreen-show {
    transform: translateY(0);
  }
</style>
