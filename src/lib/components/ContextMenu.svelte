<script lang="ts">
  import type { ContextMenu } from '$lib/actions/contextMenu'
  import { fade } from 'svelte/transition'

  export let x: number
  export let y: number
  export let menus: ContextMenu[]
  export let show: boolean = false
  export let actionHandler: (e: any) => any
</script>

{#if show}
  <div
    out:fade="{{ duration: 100 }}"
    class="context-menu"
    style="--joueur-context-menu-x:{x}px;--joueur-context-menu-y:{y}px;"
  >
    {#each menus as menu (menu.title)}
      <div class="menu-item" on:keypress on:click="{actionHandler}">
        {menu.title}
      </div>
    {/each}
  </div>
{/if}

<style>
  .context-menu {
    --uno: 'fixed z-101 bg-white shadow-lg';
    left: var(--joueur-context-menu-x);
    top: var(--joueur-context-menu-y);
  }
  .menu-item {
    --uno: 'j-clickable-item';
  }
</style>
