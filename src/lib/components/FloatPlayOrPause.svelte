<script lang="ts">
  import ControlPause from '$lib/icons/ControlPause.svelte'
  import ControlPlay from '$lib/icons/ControlPlay.svelte'
  import { paused, playingSong, togglePlayOrPause } from '$lib/store'
  import FloatAction from './FloatAction.svelte'
</script>

{#if $playingSong}
  <div class="play-or-pause" on:click="{togglePlayOrPause}" on:keypress>
    <FloatAction>
      {#if $paused}
        <ControlPlay />
      {:else}
        <ControlPause />
      {/if}
    </FloatAction>
  </div>
{/if}

<style>
  .play-or-pause {
    --uno: 'absolute right-4 bottom-[72px]';
  }
</style>
