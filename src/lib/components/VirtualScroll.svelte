<script lang="ts">
  import debounce from '$lib/utils/debounce'
  import { onMount } from 'svelte'

  export let gapX = '0'
  export let gapY = '0'
  export let items: any[]
  export let customStyle = ''
  export let customClass = ''
  export let mode: 'list' | 'grid' | 'table' = 'list'

  let vScrollContainer: HTMLDivElement
  let maxItemsDisplayed = 10
  let start = 0
  let itemHeight = 0
  let scrollTop = 0
  let offset = 0
  let cols = 1
  let skeletonOffset = 0

  $: totalHeight = itemHeight * (items.length / cols)

  const recomputeInitialData = () => {
    if (!vScrollContainer) return
    const items =
      vScrollContainer.querySelectorAll<HTMLDivElement>('.v-scroll-item')
    const firstItem = items[0]
    if (!firstItem) return
    itemHeight = firstItem.offsetHeight
    cols = [...items].filter(item => item.offsetTop < 50).length

    maxItemsDisplayed =
      Math.ceil(vScrollContainer.clientHeight / itemHeight) * cols + cols
  }

  onMount(() => {
    if (vScrollContainer) {
      recomputeInitialData()
      const resizeObserver = new ResizeObserver(recomputeInitialData)
      resizeObserver.observe(vScrollContainer)
    }
  })

  $: {
    items
    recomputeInitialData()
  }

  const setStart = debounce((st: number) => {
    offset = -(st % itemHeight)
    scrollTop = st
    start = Math.floor(st / itemHeight) * cols
  }, 50)

  const handleScroll = (e: any) => {
    const st = e.target.scrollTop
    skeletonOffset = -(st % itemHeight)
    setStart(st)
  }
</script>

<div
  bind:this="{vScrollContainer}"
  class="v-scroll"
  style="--j-v-scroll-gap-x:{gapX};--j-v-scroll-gap-y:{gapY};--j-v-scroll-total-height:{totalHeight}px;"
  on:scroll="{handleScroll}"
>
  <div class="v-scroller"></div>
  <div
    class="v-scroll-grid {customClass}"
    class:mode-list="{mode === 'list'}"
    class:mode-grid="{mode === 'grid'}"
    style="--j-v-scroll-top: {scrollTop}px;--j-v-scroll-item-offset:{offset}px;{customStyle}"
  >
    {#each items.slice(start, start + maxItemsDisplayed) as item (item.id)}
      <div class="v-scroll-item">
        <slot name="item" item="{item}" />
      </div>
    {/each}
  </div>
</div>
{#if items.length > maxItemsDisplayed}
  <div
    class="v-skeletons"
    class:mode-list="{mode === 'list'}"
    class:mode-grid="{mode === 'grid'}"
    style="--j-v-scroll-gap-x:{gapX};--j-v-scroll-gap-y:{gapY};--j-v-scroll-cols:{cols};--j-v-scroll-skeleton-offset:{skeletonOffset}px;"
  >
    {#each Array.from({ length: maxItemsDisplayed }) as _, i (i)}
      <div class="v-skeleton-item" style="--j-skeleton-item-h: {itemHeight}px;">
        <slot name="skeleton-item" />
      </div>
    {/each}
  </div>
{/if}

<style>
  .v-scroll {
    --uno: 'h-full overflow-y-auto relative z-3';
  }
  .v-scroller {
    --uno: ' w-[1px]';
    height: var(--j-v-scroll-total-height);
  }
  .v-scroll-grid {
    --uno: 'grid absolute left-0 box-border z-3';
    width: 100%;
    column-gap: var(--j-v-scroll-gap-y);
    row-gap: var(--j-v-scroll-gap-x);
    top: var(--j-v-scroll-top);
  }
  .mode-grid {
    --uno: ' grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
  }

  .v-scroll-item {
    transform: translateY(var(--j-v-scroll-item-offset));
  }
  .v-skeletons {
    --uno: 'grid absolute overflow-hidden top-0 bottom-0 z-2 left-0 right-0';
    column-gap: var(--j-v-scroll-gap-y);
    row-gap: var(--j-v-scroll-gap-x);
    transform: translateY(var(--j-v-scroll-skeleton-offset));
  }
  .v-skeleton-item {
    height: var(--j-skeleton-item-h);
  }
</style>
