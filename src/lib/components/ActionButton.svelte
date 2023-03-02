<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { circInOut } from 'svelte/easing'
  import Loading from './Loading.svelte'

  export let label: string
  export let loading = false

  const dispatcher = createEventDispatcher()

  const handleAction = () => {
    dispatcher('click')
  }

  const loadingTransition = (node: any) => {
    const existingTransform = getComputedStyle(node).transform.replace(
      'none',
      ''
    )
    return {
      delay: 0,
      duration: 300,
      easing: circInOut,
      css: (t: number) =>
        `opacity: ${t}; position: absolute; top: 50%; left: 50%; z-index: ${Math.floor(
          10 * t
        )}; transform: ${existingTransform} translate(-50%, -50%) scale(${t});`,
    }
  }
</script>

<div
  class="action"
  class:loading="{loading}"
  on:click="{handleAction}"
  on:keypress="{handleAction}"
>
  {#if loading}
    <div transition:loadingTransition>
      <div class="icon">
        <Loading />
      </div>
      <div class="with-space">Just a sec...</div>
    </div>
  {:else}
    <div transition:loadingTransition>
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
