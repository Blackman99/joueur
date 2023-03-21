<script lang="ts">
  export let value = false
  export let inactiveLabel = ''
  export let activeLabel = ''
</script>

<div class="toggle">
  <div class:label-active="{!value}">{inactiveLabel}</div>
  <div class="toggler" class:active="{value}" class:inactive="{!value}">
    <div class="indicator"></div>
  </div>
  <div class:label-active="{value}">{activeLabel}</div>
</div>

<style>
  .toggle {
    --uno: 'flex items-center';
  }
  .toggler {
    --uno: 'w-[48px] h-[24px] rounded-[12px] relative mx-1';
  }
  .indicator {
    --uno: 'h-[20px] w-[20px] rounded-[10px] bg-white absolute left-[2px] top-[2px]';
    transition: all cubic-bezier(0.85, 0, 0.15, 1) 0.3s;
  }
  .inactive {
    --uno: 'bg-gray-3';
  }
  .active {
    --uno: 'bg-primary bg-opacity-20';
  }
  .active .indicator {
    --uno: 'left-[26px] bg-primary';
  }
  .label-active {
    --uno: 'text-primary';
  }
</style>
