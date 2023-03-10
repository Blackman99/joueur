<script lang="ts">
  import ControlPause from '$lib/icons/ControlPause.svelte'
  import ControlPlay from '$lib/icons/ControlPlay.svelte'
  import { playing } from '$lib/store'
  import FloatAction from './FloatAction.svelte'
</script>

<div
  class="play-or-pause"
  on:click="{() => ($playing = !$playing)}"
  on:keypress
>
  <FloatAction>
    {#if $playing}
      <ControlPause />
    {:else}
      <ControlPlay />
    {/if}
  </FloatAction>
</div>

<style>
  .play-or-pause {
    --uno: 'absolute right-4 bottom-[72px]';
  }
</style>
