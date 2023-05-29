<script lang="ts">
  import type { Selection } from '../../types'

  export let items: Selection[]
  export let selected: any
</script>

<div class="radio-group">
  {#each items as { label, value }}
    {@const active = value === selected}
    <div class="radio" class:active="{active}">
      {label}
    </div>
  {/each}
</div>

<style>
</style>
