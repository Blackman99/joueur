<script lang="ts">
  import ControlPause from '$lib/icons/ControlPause.svelte'
  import ControlPlay from '$lib/icons/ControlPlay.svelte'
  import { paused, togglePlayOrPause } from '$lib/store'
  import FloatAction from './FloatAction.svelte'
</script>

<div class="play-or-pause" on:click="{togglePlayOrPause}" on:keypress>
  <FloatAction>
    {#if $paused}
      <ControlPlay />
    {:else}
      <ControlPause />
    {/if}
  </FloatAction>
</div>

<style>
  .play-or-pause {
    --uno: 'absolute right-4 bottom-[72px]';
  }
</style>
