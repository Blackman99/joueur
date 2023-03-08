<script lang="ts">
  import SoundLow from '$lib/icons/SoundLow.svelte'
  import { volume } from '$lib/store'
  import IconButton from './IconButton.svelte'

  let showBar = false

  const handleVolumeWheel = (e: any) => {
    const step = e.deltaY / 1000
    const next = $volume - step
    if (next > 1) {
      $volume = 1
    } else if (next < 0) {
      $volume = 0
    } else {
      $volume = next
    }
  }
</script>

<IconButton
  on:wheel="{handleVolumeWheel}"
  on:mouseenter="{() => (showBar = true)}"
  on:mouseleave="{() => (showBar = false)}"
>
  <div class="icon">
    <SoundLow />
  </div>
  {#if showBar}
    <div class="volume-wrapper">
      <div
        class="volume-bar"
        style="--joueur-volume: {$volume * 100}%;--joueur-volume-n:{$volume *
          92}px;"
      >
        <div class="volume-thumb">
          <div class="volume-indicator"></div>
        </div>
      </div>
    </div>
  {/if}
</IconButton>

<style>
  .volume-wrapper {
    --uno: 'w-48px left-[-8px] flex justify-center absolute bottom-[100%] pb-2';
  }
  .volume-bar {
    --uno: 'flex flex-col items-center bg-white box-border w-[6px] h-[100px] z-2 rounded-[8px] bg-white relative';
    box-shadow: rgb(50 50 93 / 100%) 0px 13px 27px -5px,
      rgb(0 0 0 / 30%) 0px 8px 16px -8px;
  }
  .icon {
    --uno: 'relative z-3 flex items-center';
  }
  .volume-indicator {
    --uno: 'absolute w-[12px] left-[-3px] bg-primary z-4 h-[12px] rounded-[8px]';
    bottom: var(--joueur-volume-n);
  }
  .volume-thumb {
    --uno: 'absolute left-0 bottom-0 right-0 bg-primary bg-opacity-50 z-3 rounded-[8px]';
    height: calc(var(--joueur-volume));
  }
</style>
