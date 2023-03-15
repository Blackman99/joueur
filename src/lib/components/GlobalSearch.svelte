<script lang="ts">
  import Search from '$lib/icons/Search.svelte'

  let focused = false
</script>

<div class="global-search" class:focused="{focused}">
  <div class="search-icon">
    <Search />
  </div>
  <div class="input-wrapper">
    <input
      placeholder="search"
      on:keyup|stopPropagation
      on:focus="{() => (focused = true)}"
      on:blur="{() => (focused = false)}"
    />
  </div>
</div>

<style>
  .global-search {
    --uno: 'flex transition-colors transition-200 items-center b-1 b-solid b-gray-3 rounded mx-3 h-[32px] px-2 text-gray-4';
  }
  .focused {
    --uno: 'b-primary';
  }
  .input-wrapper {
    --uno: 'flex-grow ';
  }
  .search-icon {
    --uno: 'text-5 flex items-center';
  }
  input {
    --uno: 'border-none outline-none text-[14px] w-full pl-1';
  }
</style>
