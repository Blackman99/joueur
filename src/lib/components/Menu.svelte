<script lang="ts">
  import { page } from '$app/stores'

  export let label: string
  export let to: string

  $: active = $page.route.id?.replace(/\([\s\S]*\)\/?/g, '') === to
</script>

<a class="menu-item" class:active="{active}" href="{to}" draggable="false">
  <div class="menu-icon">
    <slot name="icon" />
  </div>

  <div>
    {label}
  </div>
</a>

<style>
  .menu-item {
    --uno: 'flex j-clickable-item items-center gap-2 px-4 py-3 rounded-lg decoration-none text-inherit';
  }
  .menu-icon {
    --uno: 'text-5 flex items-center';
  }
  .active {
    --uno: 'j-active-item';
  }
</style>
