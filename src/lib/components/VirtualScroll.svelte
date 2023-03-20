<script lang="ts" context="module">
  export type FetchParams = {
    start: number
    limit: 1
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte'

  export let cols = 1
  export let gapX = '0'
  export let gapY = '0'
  export let items: any[]

  let vScrollContainer: HTMLDivElement
  let maxItemsDisplayed = 10
  let start = 0
  let totalHeight = 0
  let itemHeight = 0
  let scrollTop = 0
  let offset = 0

  const recomputeInitialData = () => {
    if (!vScrollContainer) return
    const firstItem =
      vScrollContainer.querySelector<HTMLDivElement>('.v-scroll-item')
    if (!firstItem) return
    itemHeight = firstItem.offsetHeight
    maxItemsDisplayed = Math.ceil(vScrollContainer.clientHeight / itemHeight)
    totalHeight = (itemHeight * items.length) / cols
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

  const handleScroll = (e: any) => {
    const st = e.target.scrollTop
    scrollTop = st
    start = Math.ceil(scrollTop / itemHeight)
    offset = start * itemHeight - st
  }
</script>

<div
  bind:this="{vScrollContainer}"
  class="v-scroll"
  style="--j-v-scroll-gap-x:{gapX};--j-v-scroll-gap-y:{gapY};--j-v-scroll-cols:{cols};--j-v-scroll-total-height:{totalHeight}px;"
  on:scroll="{handleScroll}"
>
  <div class="v-scroller"></div>
  <div
    class="v-scroll-grid"
    style="--j-v-scroll-top: {scrollTop}px;--j-v-scroll-item-offset:{offset}px;"
  >
    {#each items.slice(start, start + maxItemsDisplayed) as item}
      <div class="v-scroll-item">
        <slot name="item" item="{item}" />
      </div>
    {/each}
  </div>
</div>

<style>
  .v-scroll {
    --uno: 'h-full overflow-y-auto relative z-3';
  }
  .v-scroller {
    --uno: ' w-[1px]';
    height: var(--j-v-scroll-total-height);
  }
  .v-scroll-grid {
    --uno: 'grid absolute left-0';
    width: 100%;
    column-gap: var(--j-v-scroll-gap-y);
    row-gap: var(--j-v-scroll-gap-x);
    grid-template-columns: repeat(var(--j-v-scroll-cols), minmax(0, 1fr));
    top: var(--j-v-scroll-top);
  }
  .v-scroll-item {
    transform: translateY(var(--j-v-scroll-item-offset));
  }
</style>
