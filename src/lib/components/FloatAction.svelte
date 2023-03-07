<div class="float-action" on:mouseenter on:mouseleave>
  <slot />
</div>

<style>
  .float-action {
    --joueur-float-action-z-index: 3;
    --uno: 'text-6 cursor-pointer flex items-center bg-primary hover:bg-opacity-90 p-2 rounded-[20px] active:bg-opacity-80 text-white relative z-[var(--joueur-float-action-z-index)]';
    user-select: none;
    -webkit-user-select: none;
    box-shadow: rgb(50 50 93 / 25%) 0px 13px 27px -5px,
      rgb(0 0 0 / 30%) 0px 8px 16px -8px;
  }
</style>
