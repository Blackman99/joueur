<script lang="ts">
  // @ts-nocheck
  import type {
    ContextMenuItem,
    ContextHandler,
  } from '$lib/actions/context-menu'
  import { tick } from 'svelte'
  import { fade } from 'svelte/transition'

  export let x: number
  export let y: number
  export let menus: ContextMenuItem[]
  export let show: boolean = false
  export let actionHandler: ContextHandler

  let contextMenu: HTMLDivElement

  let contextMenuWidth = 0

  $: aliasX = x < window.innerWidth / 2 ? 'left' : 'right'
  $: offsetX = aliasX === 'left' ? x : window.innerWidth - x
  $: aliasY = y < window.innerHeight / 2 ? 'top' : 'bottom'
  $: offsetY = aliasY === 'top' ? y : window.innerHeight - y

  const recomputeContextMenuWidth = () => {
    tick().then(() => {
      contextMenuWidth = contextMenu?.offsetWidth
    })
  }

  $: {
    show
    recomputeContextMenuWidth()
  }
</script>

{#if show}
  <div
    out:fade="{{ duration: 100 }}"
    bind:this="{contextMenu}"
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
        {#if menu.children && menu.children.length}
          <div
            class="children"
            style="--j-context-menu-width: {-contextMenuWidth}px;"
          >
            {#each menu.children as c}
              <div
                class="menu-item"
                on:click="{e => actionHandler(e, c)}"
                on:keypress
              >
                {c.title}
              </div>
            {/each}
          </div>
        {/if}
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
    --uno: 'j-clickable-item px-4 py-2 relative';
  }
  .children {
    --uno: 'z-102 absolute ';
    right: 0;
    transform: translateX(var(----j-context-menu-width));
  }
</style>
