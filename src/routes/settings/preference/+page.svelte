<script lang="ts">
  import Toggle from '$lib/components/shared/Toggle.svelte'
  import { isDark } from '$lib/store'
  const toggle = () => {
    $isDark = !$isDark
  }
</script>

<div class="preference">
  <div class="section-title">Theme</div>
  <div class="toggle-item" on:click="{toggle}" on:keypress>
    <div>Color Mode</div>
    <Toggle value="{$isDark}" activeLabel="Dark" inactiveLabel="Light" />
  </div>
</div>

<style>
  .preference {
    --uno: '';
  }
  .section-title {
    --uno: 'leading-8 font-bold indent-[12px]';
  }
  .toggle-item {
    --uno: 'text-[14px] py-3 px-4 j-clickable-item flex justify-between items-center';
  }
</style>
