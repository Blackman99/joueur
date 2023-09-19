<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Loading from './shared/Loading.svelte'

  export let label: string
  export let loading = false

  const dispatcher = createEventDispatcher()

  const handleAction = () => {
    if (loading) return
    dispatcher('click')
  }
</script>

<div
  class="action"
  class:loading
  role="button"
  tabindex="0"
  on:click="{handleAction}"
  on:keypress="{handleAction}"
>
  {#if loading}
    <di>
      <div class="icon">
        <Loading />
      </div>
      <div class="with-space">Just a sec...</div>
    </di>
  {:else}
    <div>
      <div class="icon">
        <slot name="icon" />
      </div>
      <div class="label">
        {label}
      </div>
    </div>
  {/if}
</div>

<style>
  .action {
    --uno: 'transition b-dashed b-1 b-gray-4 rounded-lg w-[30vw] text-center flex flex-col items-center relative justify-center hover:b-primary hover:text-primary cursor-pointer h-[20vh]';
    user-select: none;
    -webkit-user-select: none;
  }
  .loading {
    --uno: 'justify-center cursor-progress';
  }
  .icon {
    --uno: 'text-8 flex justify-center';
  }
  .label {
    --uno: 'mt-2';
  }
</style>
