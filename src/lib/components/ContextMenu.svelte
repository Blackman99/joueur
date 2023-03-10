<script lang="ts">
  // @ts-nocheck
  import type {
    ContextMenuItem,
    ContextHandler,
  } from '$lib/actions/contextMenu'
  import { fade } from 'svelte/transition'

  export let x: number
  export let y: number
  export let menus: ContextMenuItem[]
  export let show: boolean = false
  export let actionHandler: ContextHandler
</script>

{#if show}
  <div
    out:fade="{{ duration: 100 }}"
    class="context-menu"
    style="--joueur-context-menu-x:{x}px;--joueur-context-menu-y:{y}px;"
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
    --uno: 'fixed z-101 bg-white shadow-xxl w-[20vw] min-w-[180px] max-2-[320px] rounded text-[14px] b-1 b-solid b-gray-4';
    left: var(--joueur-context-menu-x);
    top: var(--joueur-context-menu-y);
  }
  .menu-item {
    --uno: 'j-clickable-item px-4 py-2';
  }
</style>
