<script lang="ts">
  import { fade } from 'svelte/transition'
</script>

<div
  transition:fade="{{ duration: 300, delay: 0 }}"
  class="backdrop"
  on:click
  on:keyup
></div>

<style>
  .backdrop {
    --uno: 'fixed top-0 left-0 right-0 bottom-0 z-99 bg-black bg-opacity-70';
  }
</style>
