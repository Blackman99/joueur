<script lang="ts">
  import { onMount } from 'svelte'
  import visualizer from '../../utils/visualizer'
  import { audioDom } from '$lib/store'

  let canvas: HTMLCanvasElement

  onMount(() => {
    const { draw, drawWave } = visualizer(canvas, $audioDom)
    drawWave()
  })
</script>

<canvas class="visualizer" bind:this="{canvas}"> </canvas>

<style>
  .visualizer {
    --uno: 'absolute top-0 left-0 right-0 bottom-0 w-full h-full bg-transparent';
  }
</style>
