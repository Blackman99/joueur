<script>
  import { fade } from 'svelte/transition'
</script>

<div transition:fade="{{ delay: 0, duration: 100 }}" class="drop-zone">
  <div class="i-tabler:file-music mr-2"></div>
  <div>Release here</div>
</div>

<style>
  .drop-zone {
    --uno: 'fixed top-4 left-4 bottom-4 right-4 b-1 b-white b-dashed rounded-lg bg-black bg-opacity-30 dark:bg-white dark:bg-opacity-30 text-8 flex items-center justify-center text-white z-999';
  }
</style>
