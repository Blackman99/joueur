<script lang="ts">
  import DialogClose from '$lib/icons/DialogClose.svelte'
  import { cubicInOut } from 'svelte/easing'
  import Backdrop from './Backdrop.svelte'
  import IconButton from './IconButton.svelte'

  export let open = false
  export let title: string = ''

  const handleClose = () => {
    open = false
  }

  const dialogTransition = (node: any) => {
    const existingTransform = getComputedStyle(node).transform.replace(
      'none',
      ''
    )
    return {
      duration: 300,
      easing: cubicInOut,
      css: (t: number, u: number) =>
        `transform: ${existingTransform} translateY(${
          -20 * u
        }px); opacity: ${t};`,
    }
  }
</script>

{#if open}
  <dialog class="dialog" open transition:dialogTransition>
    <div class="header">
      <div class="title">
        <slot name="title">
          {title}
        </slot>
      </div>
      <div class="close" on:click="{handleClose}" on:keyup="{handleClose}">
        <IconButton>
          <DialogClose />
        </IconButton>
      </div>
    </div>
    <div class="p-4">
      <slot />
    </div>
  </dialog>
{/if}

{#if open}
  <Backdrop on:click="{handleClose}" />
{/if}

<style>
  .dialog {
    --uno: 'bg-white rounded-lg border-0 relative z-100 fixed top-20vh p-0';
    --joueur-dialog-width: 60vw;
    width: var(--joueur-dialog-width);
  }
  .header {
    --uno: 'flex items-center justify-between px-4 py-3 b-b-1 b-b-solid b-b-light-4';
  }
  .close {
    --uno: 'flex items-center';
  }
</style>
