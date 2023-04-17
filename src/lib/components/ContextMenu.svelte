<script lang="ts">
  // @ts-nocheck
  import type {
    ContextMenuItem,
    ContextHandler,
  } from '$lib/actions/context-menu'
  import ContextMenuRight from '$lib/icons/ContextMenuRight.svelte'
  import { tick } from 'svelte'
  import { fade } from 'svelte/transition'

  export let x: number
  export let y: number
  export let menus: ContextMenuItem[]
  export let show: boolean = false
  export let actionHandler: ContextHandler

  let contextMenu: HTMLDivElement

  let childrenAliasX = 'left'

  $: aliasX = x < window.innerWidth / 2 ? 'left' : 'right'
  $: offsetX = aliasX === 'left' ? x : window.innerWidth - x
  $: aliasY = y < window.innerHeight / 2 ? 'top' : 'bottom'
  $: offsetY = aliasY === 'top' ? y : window.innerHeight - y

  const recomputeContextMenuWidth = () => {
    tick().then(() => {
      const { x, width } = contextMenu?.getBoundingClientRect()
      childrenAliasX = x + width / 2 < window.innerWidth / 2 ? 'left' : 'right'
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
    class="context-menu context-menu-box"
    style="{aliasX}:{offsetX}px;{aliasY}:{offsetY}px;"
  >
    {#each menus as menu (menu.name)}
      {@const hasChildren = menu.children && menu.children.length}
      <div
        class="menu-item"
        class:has-children="{hasChildren}"
        on:keypress
        on:click="{e => actionHandler(e, menu)}"
      >
        {menu.title}
        {#if hasChildren}
          <div class="icon-right-wrapper">
            <ContextMenuRight />
          </div>
          <div
            class="children context-menu-box"
            style="{childrenAliasX}: 100%;"
          >
            {#each menu.children as c}
              <div
                class="menu-item"
                on:click|stopPropagation="{e => actionHandler(e, c)}"
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
  .context-menu-box {
    --uno: 'bg-white dark:bg-black shadow-xxl w-[20vw] min-w-[180px] max-2-[320px] rounded text-[14px] b-1 b-solid b-gray-4 dark:b-gray-8';
  }
  .context-menu {
    --uno: 'fixed z-201';
    top: var(--joueur-context-menu-y);
  }
  .menu-item {
    --uno: 'j-clickable-item px-4 py-2 relative';
  }
  .has-children {
    --uno: 'justify-between flex items-center';
  }
  .icon-right-wrapper {
    --uno: 'text-5 flex items-center';
  }
  .children {
    --uno: 'z-202 absolute';
    top: 0;
    opacity: 0;
    visibility: none;
  }
  .menu-item:hover .children {
    opacity: 1;
    visibility: visible;
  }
</style>
