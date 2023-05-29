<script lang="ts">
  import { page } from '$app/stores'

  export let label: string
  export let to: string | undefined = undefined
  export let rounded: boolean = false
  export let onlyIconOnSm = false

  $: active = $page.route.id?.replace(/\([\s\S]*\)\/?/g, '') === to
</script>

{#if to}
  <a
    class="menu-item"
    class:active="{active}"
    class:only-icon-on-sm="{onlyIconOnSm}"
    href="{to}"
    draggable="false"
    class:menu-rounded="{rounded}"
    target="{to?.startsWith('http') ? '_blank' : null}"
  >
    <div class="prepend">
      <div class="menu-icon">
        <slot name="icon" />
      </div>
      <div class="label">
        {label}
      </div>
    </div>

    <div class="append">
      <slot name="append" />
    </div>
  </a>
{:else}
  <div
    class="menu-item"
    class:active="{active}"
    draggable="false"
    class:menu-rounded="{rounded}"
    on:click|stopPropagation
    on:keypress|stopPropagation
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
  </div>
{/if}

<style>
  .menu-item {
    --uno: 'flex j-clickable-item items-center px-4 py-3 decoration-none text-inherit';
  }
  .menu-rounded {
    --uno: 'rounded-lg';
  }
  .menu-icon {
    --uno: 'text-5 flex items-center';
  }
  .label {
    --uno: 'ml-2';
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
  .only-icon-on-sm .label {
    --uno: 'display-none sm:display-block';
  }
</style>
