<script lang="ts">
  import { paused } from '$lib/store'
</script>

<div
  class="bars"
  style="--joueur-playing-icon-state: {$paused ? 'paused' : 'running'};"
>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
  <div class="bar"></div>
</div>

<style>
  .bars {
    --uno: 'flex items-end gap-[2px] h-[12px] w-[16px]';
  }
  .bar {
    --uno: 'bg-primary w-[2px]';
    animation: first 2.4s cubic-bezier(0.36, 0.72, 1, 0.19) 0s infinite
      alternate-reverse;
    animation-play-state: var(--joueur-playing-icon-state);
  }
  @keyframes first {
    0% {
      height: 0%;
    }
    10% {
      height: 90%;
    }
    20% {
      height: 66%;
    }
    30% {
      height: 16%;
    }
    40% {
      height: 95%;
    }
    50% {
      height: 8%;
    }
    60% {
      height: 27%;
    }
    70% {
      height: 50%;
    }
    80% {
      height: 0%;
    }
    90% {
      height: 88%;
    }
    100% {
      height: 9%;
    }
  }
  .bar:nth-child(2) {
    animation-timing-function: cubic-bezier(0, 0.73, 0.75, 0.18);
    animation-delay: 0.6s;
  }
  .bar:nth-child(3) {
    animation-timing-function: cubic-bezier(0.56, 0.99, 1, 0.54);
    animation-delay: 1.2s;
  }
  .bar:nth-child(4) {
    animation-timing-function: cubic-bezier(0.9, 0.03, 0.47, 0.76);
    animation-delay: 1.8s;
  }
</style>
