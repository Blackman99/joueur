<script lang="ts">
  export let size = '16px'
</script>

<div
  class="icon-button"
  style="--joueur-icon-button-size: {size};"
  on:click|stopPropagation
  on:keypress
>
  <slot />
</div>

<style>
  .icon-button {
    --uno: 'cursor-pointer flex items-center hover:bg-primary hover:bg-opacity-8 p-2 rounded-[20px] active:bg-opacity-16';
    font-size: var(--joueur-icon-button-size);
    user-select: none;
    -webkit-user-select: none;
  }
</style>
