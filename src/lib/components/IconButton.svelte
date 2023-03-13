<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let size = '16px'

  const dispatch = createEventDispatcher()

  let active = false

  const handleMousedown = () => {
    active = true
    dispatch('mousedown')
  }

  const handleBarMouseup = () => {
    active = false
    dispatch('mouseup')
  }
</script>

<div
  class="icon-button"
  class:active="{active}"
  style="--joueur-icon-button-size: {size};"
  on:click|stopPropagation
  on:keypress|stopPropagation
  on:mouseup|stopPropagation="{handleBarMouseup}"
  on:mouseenter|stopPropagation
  on:mouseleave|stopPropagation
  on:mousedown|stopPropagation="{handleMousedown}"
  on:wheel|stopPropagation
>
  <slot />
</div>

<style>
  .icon-button {
    --uno: 'cursor-pointer flex items-center hover:bg-primary hover:bg-opacity-8 p-2 rounded-[20px]  relative z-3';
    font-size: var(--joueur-icon-button-size);
    user-select: none;
    -webkit-user-select: none;
  }
  .active {
    --uno: 'active:bg-opacity-16';
  }
</style>
