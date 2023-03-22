<script lang="ts">
  import SoundFull from '$lib/icons/SoundFull.svelte'
  import SoundLow from '$lib/icons/SoundLow.svelte'
  import { volume } from '$lib/store'
  import IconButton from './IconButton.svelte'

  let showBar = false

  let mouseDown = false

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

  const handleBarClick = (e: any) => {
    const newVolume =
      (e.target.offsetHeight - e.offsetY) / e.target.offsetHeight
    $volume = newVolume
  }

  const handleBarMousedown = () => {
    mouseDown = true
  }
  const handleBarMousemove = (e: any) => {
    if (mouseDown) {
      handleBarClick(e)
    }
  }
  const handleMouseup = (e: any) => {
    mouseDown = false
    handleBarClick(e)
  }
</script>

<IconButton
  on:wheel="{handleVolumeWheel}"
  on:mouseenter="{() => (showBar = true)}"
  on:mouseleave="{() => (showBar = false)}"
  on:click="{() => ($volume = 0)}"
>
  <div class="icon">
    <SoundLow />
  </div>
  {#if showBar}
    <div
      class="volume-wrapper"
      on:mousedown|stopPropagation="{handleBarMousedown}"
      on:mousemove|stopPropagation="{handleBarMousemove}"
      on:mouseup|stopPropagation="{handleMouseup}"
      on:click|stopPropagation
      on:keypress
    >
      <div
        class="volume-bar"
        style="--joueur-volume: {$volume * 100}%;--joueur-volume-n:{$volume *
          52}px;"
      >
        <div class="volume-thumb">
          <div class="volume-indicator"></div>
        </div>
      </div>
      <div class="sound-full">
        <IconButton on:click="{() => ($volume = 1)}">
          <SoundFull />
        </IconButton>
      </div>
    </div>
  {/if}
</IconButton>

<style>
  .volume-wrapper {
    --uno: 'w-48px left-[-8px] flex justify-center absolute bottom-[100%] pb-[2px] pt-[20px]';
  }
  .volume-bar {
    --uno: 'flex flex-col items-center bg-white dark:bg-zinc-8 box-border w-[6px] h-[60px] z-2 rounded-[8px] bg-white relative z-4';
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
    --uno: 'absolute left-0 bottom-0 right-0 bg-primary bg-opacity-50 z-3 rounded-[8px] pointer-events-none';
    height: calc(var(--joueur-volume));
  }
  .sound-full {
    --uno: 'absolute top-[-12px]';
  }
</style>
