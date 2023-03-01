<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let label: string

  const dispatcher = createEventDispatcher()

  const handleAction = () => {
    dispatcher('click')
  }
</script>

<div class="action" on:click="{handleAction}" on:keypress="{handleAction}">
  <div class="icon">
    <slot name="icon" />
  </div>
  <div class:with-space="{$$slots.icon}">{label}</div>
</div>

<style>
  .action {
    --uno: 'transition b-dashed b-1 b-gray-4 rounded-lg w-[20vw] py-[4vh] px-[5vw] text-center flex items-center hover:b-primary hover:text-primary cursor-pointer';
    user-select: none;
    -webkit-user-select: none;
  }
  .with-space {
    --uno: 'ml-2';
  }
  .icon {
    --uno: 'text-8';
  }
</style>
