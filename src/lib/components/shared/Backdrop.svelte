<script lang="ts">
  import { fade } from 'svelte/transition'
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->

<div
  transition:fade="{{ duration: 300, delay: 0 }}"
  class="backdrop"
  on:click
  on:keyup
></div>

<style>
  .backdrop {
    --uno: 'fixed top-0 left-0 right-0 bottom-0 z-107 bg-black bg-opacity-70 dark:bg-white dark:bg-opacity-20';
  }
</style>
