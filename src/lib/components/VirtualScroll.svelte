<script lang="ts">
  import debounce from '$lib/utils/debounce'
  import { onMount, tick } from 'svelte'

  export let gapX = '0'
  export let gapY = '0'
  export let items: any[]
  export let customStyle = ''
  export let customClass = ''
  export let mode: 'list' | 'grid' | 'table' = 'list'
  export let limit = 10
  export let offset = 0
  export let total = 0
  export let scrollTop = 0

  let vScrollContainer: HTMLDivElement
  let itemHeight = 0
  let itemsOffsetY = 0
  let cols = 1
  let skeletonOffset = 0

  $: totalHeight = itemHeight * (total / cols)

  const recomputeInitialData = debounce(() => {
    if (!vScrollContainer) return
    const firstItem =
      vScrollContainer.querySelector<HTMLDivElement>('.v-scroll-item')
    if (!firstItem) return
    itemHeight = firstItem.offsetHeight
    cols = Math.floor(vScrollContainer.offsetWidth / firstItem.offsetWidth)
    limit = Math.ceil(vScrollContainer.clientHeight / itemHeight) * cols + cols
  }, 50)

  onMount(() => {
    recomputeInitialData()
    const resizeObserver = new ResizeObserver(recomputeInitialData)
    resizeObserver.observe(vScrollContainer)
    return () => {
      resizeObserver.unobserve(vScrollContainer)
      resizeObserver.disconnect()
    }
  })

  const setOffset = debounce((st: number) => {
    offset = Math.floor(st / itemHeight) * cols
    tick().then(() => {
      scrollTop = st
      itemsOffsetY = -(st % itemHeight)
    })
  }, 50)

  const handleScroll = () => {
    const st = vScrollContainer.scrollTop
    skeletonOffset = -(st % itemHeight)
    setOffset(st)
  }

  export const reset = () => {
    offset = 0
    limit = 10
    vScrollContainer.scrollTop = 0
    screenTop = 0
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
    style="--j-v-scroll-top:{scrollTop + itemsOffsetY}px;{customStyle}"
  >
    {#each items as item (item.id)}
      <div class="v-scroll-item">
        <slot name="item" item="{item}" />
      </div>
    {/each}
  </div>
</div>
{#if total > limit}
  <div
    class="v-skeletons {customClass}"
    class:mode-list="{mode === 'list'}"
    class:mode-grid="{mode === 'grid'}"
    style="--j-v-scroll-gap-x:{gapX};--j-v-scroll-gap-y:{gapY};--j-v-scroll-cols:{cols};--j-v-scroll-skeleton-offset:{skeletonOffset}px;{customStyle}"
  >
    {#each Array.from({ length: limit }) as _, i (i)}
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
    --uno: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
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
