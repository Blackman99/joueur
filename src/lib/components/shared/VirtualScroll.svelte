<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte'
  import debounce from '$lib/utils/debounce'

  export let gapX: number = 0
  export let gapY: number = 0
  export let items: any[]
  export let customStyle = ''
  export let customClass = ''
  export let mode: 'list' | 'grid' | 'table' = 'list'
  export let limit = 10
  export let offset = 0
  export let total = 0
  export let scrollTop = 0

  const dispatch = createEventDispatcher()

  let itemsOffsetY = 0
  let vScrollContainer: HTMLDivElement
  let itemHeight = 0
  let cols = 1
  let skeletonOffset = 0

  let st = 0

  let scrollPositionInitialized = false

  $: totalHeight = itemHeight * (total / cols)

  export const recomputeInitialData = debounce(() => {
    if (!vScrollContainer) return
    const firstItem =
      vScrollContainer.querySelector<HTMLDivElement>('.v-scroll-item')
    if (!firstItem) return
    itemHeight = firstItem.offsetHeight
    cols = Math.floor(vScrollContainer.offsetWidth / firstItem.offsetWidth)
    const newLimit =
      Math.ceil(vScrollContainer.clientHeight / itemHeight) * cols + cols
    dispatch('limit-change', newLimit)
    limit = newLimit
  }, 50)

  onMount(() => {
    vScrollContainer.scrollTop = scrollTop
    scrollPositionInitialized = true
    recomputeInitialData()
  })

  const setOffset = debounce((st: number) => {
    offset = Math.floor(st / (itemHeight + gapY)) * cols
  }, 200)

  const handleScroll = () => {
    if (!scrollPositionInitialized) return
    st = vScrollContainer.scrollTop
    skeletonOffset = -(st % itemHeight)
    setOffset(st)
  }

  export function reset() {
    offset = 0
    limit = 10
    vScrollContainer.scrollTop = 0
    scrollTop = 0
  }

  const setScrollTop = () => {
    if (!scrollPositionInitialized) return
    tick().then(() => {
      scrollTop = st
      itemsOffsetY = -(st % (itemHeight + gapY))
    })
  }

  $: {
    items
    setScrollTop()
  }
</script>

<div
  bind:this="{vScrollContainer}"
  class="v-scroll"
  style="--j-v-scroll-gap-x:{gapX}px;--j-v-scroll-gap-y:{gapY}px;--j-v-scroll-total-height:{totalHeight}px;--j-v-scroll-list-items-offset:{itemsOffsetY}px;"
  on:scroll="{handleScroll}"
>
  <div class="v-scroller"></div>
  <div
    class="v-scroll-grid {customClass}"
    class:mode-list="{mode === 'list'}"
    class:mode-grid="{mode === 'grid'}"
    style="--j-v-scroll-top:{scrollTop}px;{customStyle}"
  >
    {#each items as item (item.id)}
      <div class="v-scroll-item">
        <slot name="item" {item} />
      </div>
    {/each}
  </div>
</div>
{#if total > limit}
  <div
    class="v-skeletons {customClass}"
    class:mode-list="{mode === 'list'}"
    class:mode-grid="{mode === 'grid'}"
    style="--j-v-scroll-gap-x:{gapX}px;--j-v-scroll-gap-y:{gapY}px;--j-v-scroll-cols:{cols};--j-v-scroll-skeleton-offset:{skeletonOffset}px;{customStyle}"
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
    --uno: 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6';
    padding: var(--j-v-scroll-gap-y) var(--j-v-scroll-gap-x);
  }

  .v-scroll-item {
    --uno: 'w-full';
    transform: translateY(var(--j-v-scroll-list-items-offset));
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
