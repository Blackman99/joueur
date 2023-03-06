<div class="icon-button">
  <slot />
</div>

<style>
  .icon-button {
    --uno: 'text-4 cursor-pointer flex items-center hover:bg-primary hover:bg-opacity-8 p-2 rounded-[20px] active:bg-opacity-16';
    user-select: none;
    -webkit-user-select: none;
  }
</style>
