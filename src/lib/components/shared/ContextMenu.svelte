<script lang="ts">
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-nocheck
  import { tick } from 'svelte'
  import { fade } from 'svelte/transition'
  import type {
    ContextHandler,
    ContextMenuItem,
  } from '$lib/actions/context-menu'
  import ContextMenuRight from '$lib/icons/ContextMenuRight.svelte'

  export let x: number
  export let y: number
  export let menus: ContextMenuItem[]
  export let show = false
  export let actionHandler: ContextHandler

  let contextMenu: HTMLDivElement

  let childrenAliasX = 'left'
  let childrenAliasY = 'top'

  $: aliasX = x < window.innerWidth / 2 ? 'left' : 'right'
  $: offsetX = aliasX === 'left' ? x : window.innerWidth - x
  $: aliasY = y < window.innerHeight / 2 ? 'top' : 'bottom'
  $: offsetY = aliasY === 'top' ? y : window.innerHeight - y

  const recomputeContextMenuWidth = () => {
    tick().then(() => {
      const { x, width, y, height } = contextMenu?.getBoundingClientRect()
      childrenAliasX = x + width / 2 < window.innerWidth / 2 ? 'left' : 'right'
      childrenAliasY =
        y + height / 2 < window.innerHeight / 2 ? 'top' : 'bottom'
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
        role="button"
        tabindex="0"
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
            style="{childrenAliasX}: 100%;{childrenAliasY}: 0;"
          >
            {#if Array.isArray(menu.children)}
              {#each menu.children as c}
                <div
                  class="menu-item"
                  on:click|stopPropagation="{e => actionHandler(e, c)}"
                  on:keypress
                  role="button"
                  tabindex="0"
                >
                  {c.title}
                </div>
              {/each}
            {/if}
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
    opacity: 0;
    visibility: none;
  }
  .menu-item:hover .children {
    opacity: 1;
    visibility: visible;
  }
</style>
