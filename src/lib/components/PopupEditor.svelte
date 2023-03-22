<script lang="ts">
  import DialogClose from '$lib/icons/DialogClose.svelte'
  import Done from '$lib/icons/Done.svelte'
  import { createEventDispatcher, tick } from 'svelte'
  import IconButton from './IconButton.svelte'

  export let value: string
  export let show = false
  let editorOffset = 0

  let input: HTMLInputElement

  const dispatch = createEventDispatcher()

  const handleCancel = () => {
    show = false
    dispatch('cancel')
  }

  const handleDone = () => {
    dispatch('done')
  }

  const handleKeyup = (e: KeyboardEvent) => {
    if (e.code === 'Enter') {
      handleDone()
    } else if (e.code === 'Escape') {
      handleCancel()
    }
  }

  $: {
    if (show) {
      tick().then(() => {
        input?.focus()
        const parentHeight =
          input.parentElement?.parentElement?.offsetHeight || 0
        const editorHeight = input.parentElement?.offsetHeight || 1
        editorOffset = (parentHeight - editorHeight) / 2
      })
    }
  }
</script>

<div class="wrapper">
  {#if show}
    <div class="popup-editor" style="--j-popup-editor-offset:{editorOffset}px;">
      <input
        bind:this="{input}"
        class="popup-input"
        bind:value="{value}"
        on:keyup|stopPropagation="{handleKeyup}"
      />
      <IconButton on:click="{handleCancel}" smallPadding>
        <DialogClose />
      </IconButton>
      <IconButton on:click="{handleDone}" smallPadding>
        <Done />
      </IconButton>
    </div>
  {/if}
  <slot />
</div>

<style>
  .wrapper {
    --uno: 'relative inline-block';
  }
  .popup-editor {
    --uno: 'flex py-1 pr-2 rounded gap-2 items-center absolute top-0 left-0 z-10 bg-white dark:bg-black';
    transform: translateY(var(--j-popup-editor-offset));
  }
  .popup-input {
    --uno: 'border-none py-1 pl-2 outline-none text-inherit b-1 b-solid b-transparent focus:b-primary rounded h-full';
    font-size: inherit;
  }
</style>
