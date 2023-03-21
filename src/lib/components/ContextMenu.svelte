<script lang="ts">
  // @ts-nocheck
  import type {
    ContextMenuItem,
    ContextHandler,
  } from '$lib/actions/context-menu'
  import { fade } from 'svelte/transition'

  export let x: number
  export let y: number
  export let menus: ContextMenuItem[]
  export let show: boolean = false
  export let actionHandler: ContextHandler

  $: aliasX = x < window.innerWidth / 2 ? 'left' : 'right'
  $: offsetX = aliasX === 'left' ? x : window.innerWidth - x
  $: aliasY = y < window.innerHeight / 2 ? 'top' : 'bottom'
  $: offsetY = aliasY === 'top' ? y : window.innerHeight - y
</script>

{#if show}
  <div
    out:fade="{{ duration: 100 }}"
    class="context-menu"
    style="{aliasX}:{offsetX}px;{aliasY}:{offsetY}px;"
  >
    {#each menus as menu (menu.name)}
      <div
        class="menu-item"
        on:keypress
        on:click="{e => actionHandler(e, menu)}"
      >
        {menu.title}
      </div>
    {/each}
  </div>
{/if}

<style>
  .context-menu {
    --uno: 'fixed z-101 bg-white dark:bg-black shadow-xxl w-[20vw] min-w-[180px] max-2-[320px] rounded text-[14px] b-1 b-solid b-gray-4 dark:b-gray-8';
    top: var(--joueur-context-menu-y);
  }
  .menu-item {
    --uno: 'j-clickable-item px-4 py-2';
  }
</style>
