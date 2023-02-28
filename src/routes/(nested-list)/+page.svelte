<script lang="ts">
  import pageTransition from '$lib/page-transition'
</script>

<div class="start" transition:pageTransition>
  <div class="action">
    <div class="i-ph-plus-bold mr-2"></div>
    <div>Add Musics</div>
  </div>
</div>

<style>
  .start {
    --uno: 'flex justify-center items-center h-full';
  }
  .action {
    --uno: 'transition b-dashed b-1 rounded-lg p-4 flex items-center hover:bg-primary hover:text-white cursor-pointer select-none';
  }
</style>
