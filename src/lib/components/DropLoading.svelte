<script>
  import { fade } from 'svelte/transition'
  import Loading from './Loading.svelte'
</script>

<div transition:fade="{{ delay: 0, duration: 100 }}" class="drop-loading">
  <Loading />
  <div class="ml-2">Just a sec...</div>
</div>

<style>
  .drop-loading {
    --uno: 'fixed top-4 left-4 bottom-4 right-4 b-1 b-white b-dashed rounded-lg bg-black bg-opacity-30 text-8 flex items-center justify-center text-white z-99';
  }
</style>
