<script lang="ts">
  import DialogClose from '$lib/icons/DialogClose.svelte'
  import QuitFullscreen from '$lib/icons/QuitFullscreen.svelte'
  import WindowMaximize from '$lib/icons/WindowMaximize.svelte'
  import WindowMinimize from '$lib/icons/WindowMinimize.svelte'
  import { inWindow, isDark } from '$lib/store'
  import { platform, type Platform } from '@tauri-apps/api/os'
  import { ask } from '@tauri-apps/api/dialog'
  import { appWindow } from '@tauri-apps/api/window'
  import GlobalSearch from './GlobalSearch.svelte'
  import IconButton from './IconButton.svelte'
  import { fullscreen, quittingFullscreen } from './lyrics/store'

  let platformName: Platform

  platform().then(name => {
    platformName = name
  })

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
  class:not-mac="{platformName !== 'darwin'}"
  class:fullscreen="{$fullscreen}"
  class:fullscreen-show="{$fullscreen && $inWindow}"
  on:mousedown="{handleMousedown}"
  on:dblclick="{async () => appWindow.toggleMaximize()}"
>
  <div class="window-buttons" class:not-mac="{platformName !== 'darwin'}">
    <IconButton smallPadding on:click="{askClose}">
      <DialogClose />
    </IconButton>
    <IconButton
      smallPadding
      on:click="{async () => appWindow.toggleMaximize()}"
    >
      <WindowMaximize />
    </IconButton>
    <IconButton smallPadding on:click="{() => appWindow.minimize()}">
      <WindowMinimize />
    </IconButton>
    {#if $fullscreen}
      <IconButton smallPadding on:click="{quitFullscreen}">
        <QuitFullscreen />
      </IconButton>
    {/if}
  </div>
  {#if !$fullscreen}
    <GlobalSearch />
  {/if}
  <img
    src="{$isDark ? '/logo-dark.svg' : '/logo.svg'}"
    alt="Joueur"
    class="logo"
    draggable="false"
  />
</div>

<style>
  .titlebar {
    --uno: 'fixed bg-white dark:bg-black left-0 top-0 right-0 z-106 h-[36px] flex items-center justify-between px-2 py-[2px] box-border rounded-t-lg';
  }
  .not-mac {
    --uno: 'flex-row-reverse';
  }
  .logo {
    --uno: 'h-[90%]';
  }
  .window-buttons {
    --uno: 'flex gap-1';
  }
  .titlebar:not(.fullscreen) {
    --uno: 'b-b-1 b-b-solid b-b-light-4 dark:b-b-gray-8';
  }
  .fullscreen {
    --uno: 'text-gray-1 bg-transparent dark:bg-transparent';
    transition: transform cubic-bezier(0, 0.55, 0.45, 1) 0.2s;
    transform: translateY(-100%);
  }
  .fullscreen-show {
    transform: translateY(0);
  }
</style>
