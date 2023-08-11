<script lang="ts">
  import IconButton from './IconButton.svelte'
  import ListUnfold from '../../icons/ListUnfold.svelte'
  import ListFold from '../../icons/ListFold.svelte'
  import { fullscreen } from '../lyrics/store'

  export let expanded = false
</script>

<div class="playlist-expandable-button" class:expanded="{expanded}">
  <IconButton on:click="{() => (expanded = !expanded)}">
    {#if expanded}
      <ListFold />
    {:else}
      <ListUnfold />
    {/if}
  </IconButton>
</div>

<style>
  .playlist-expandable-button {
    --uno: 'sm:display-none absolute top-[50%] right-0 z-10';
    transition: transform linear 0.2s;
    transform: translate(70%, -50%);
  }
  .expanded {
    transform: translate(20%, -50%);
  }
</style>
