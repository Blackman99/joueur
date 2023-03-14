<script lang="ts">
  import { page } from '$app/stores'

  export let label: string
  export let to: string | undefined = undefined
  export let rounded: boolean = false

  $: active = $page.route.id?.replace(/\([\s\S]*\)\/?/g, '') === to
</script>

<svelte:element
  this="{to ? 'a' : 'div'}"
  class="menu-item"
  class:active="{active}"
  href="{to}"
  draggable="false"
  class:menu-rounded="{rounded}"
  target="{to?.startsWith('http') ? '_blank' : null}"
  on:click|stopPropagation
  on:keypress
>
  <div class="prepend">
    <div class="menu-icon">
      <slot name="icon" />
    </div>
    <div>
      {label}
    </div>
  </div>

  <div class="append">
    <slot name="append" />
  </div>
</svelte:element>

<style>
  .menu-item {
    --uno: 'flex j-clickable-item items-center px-4 py-3 decoration-none text-inherit';
  }
  .menu-rounded {
    --uno: 'rounded-lg';
  }
  .menu-icon {
    --uno: 'text-5 flex items-center mr-2';
  }
  .active {
    --uno: 'j-active-item';
  }
  .append,
  .prepend {
    --uno: 'flex items-center';
  }
  .prepend {
    --uno: 'flex-grow';
  }
</style>
