<script lang="ts">
  import CreatePlaylist from '../icons/CreatePlaylist.svelte'
  import FloatAction from './FloatAction.svelte'
  import { cubicInOut } from 'svelte/easing'
  import { db } from '$lib/db'
  import { tick } from 'svelte'

  let showInput = false
  let inputDom: HTMLInputElement

  const handleMouseEnter = async () => {
    showInput = true
    await tick()
    inputDom?.focus()
  }
  const handleMouseLeave = () => {
    showInput = false
  }

  const inputTransition = (_node: any) => {
    return {
      duration: 300,
      easing: cubicInOut,
      css: (t: number, u: number) => `width: ${t * 20}vw; opacity: ${t};`,
    }
  }

  let newPlaylistTitle = ''

  const handleCreate = async (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      db.addPlaylist(newPlaylistTitle)
      newPlaylistTitle = ''
    }
  }
</script>

<div
  class="create-playlist"
  on:mouseenter="{handleMouseEnter}"
  on:mouseleave="{handleMouseLeave}"
>
  <FloatAction>
    <CreatePlaylist />
  </FloatAction>
  {#if showInput}
    <input
      class="input"
      bind:this="{inputDom}"
      bind:value="{newPlaylistTitle}"
      transition:inputTransition
      on:keyup="{handleCreate}"
      placeholder="Enter new playlist title"
    />
  {/if}
</div>

<style>
  .create-playlist {
    --uno: 'absolute bottom-4 right-4 shadow-lg z-3';
  }
  .input {
    --uno: 'absolute top-0 right-0 bottom-0 h-full block b-none outline-none pl-4 pr-[48px] rounded-[20px] bg-primary text-white text-[14px] origin-r';
  }
  .input::placeholder {
    --uno: 'text-gray-2';
  }
</style>
