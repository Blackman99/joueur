<script lang="ts">
  import ModeRepeatList from '$lib/icons/ModeRepeatList.svelte'
  import ModeRepeatOne from '$lib/icons/ModeRepeatOne.svelte'
  import ModeShuffle from '$lib/icons/ModeShuffle.svelte'
  import { mode } from '$lib/store'
  import { modes } from '$lib/types'
  import { scale } from 'svelte/transition'
  import IconButton from './IconButton.svelte'

  const handleModeSwitch = () => {
    const index = modes.findIndex(m => m === $mode)
    if (index !== -1) {
      $mode = modes[(index + 1) % modes.length]
    }
  }
</script>

<IconButton on:click="{handleModeSwitch}">
  {#if $mode === 'repeat-one'}
    <ModeRepeatOne />
  {:else if $mode === 'repeat-list'}
    <ModeRepeatList />
  {:else}
    <ModeShuffle />
  {/if}
</IconButton>
