<script lang="ts">
  import { audioDom } from '$lib/store'
  import { onMount } from 'svelte'
  import visualizer from '../utils/visualizer'

  let canvas: HTMLCanvasElement

  onMount(() => {
    const { draw } = visualizer(canvas, $audioDom)
    draw()
  })
</script>

<canvas class="visualizer" bind:this="{canvas}"> </canvas>

<style>
  .visualizer {
    --uno: 'absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-transparent';
  }
</style>
