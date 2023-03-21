<script lang="ts">
  import Menu from '$lib/components/Menu.svelte'
  import ExternalLink from '$lib/icons/ExternalLink.svelte'
  import LogoDiscord from '$lib/icons/LogoDiscord.svelte'
  import LogoGithub from '$lib/icons/LogoGithub.svelte'
</script>

<div class="top">
  <img class="logo" src="/logo.svg" alt="Joueur" />
  <div class="desc">A tiny and logical music player you've always wanted</div>
</div>

<div>
  <Menu label="Discord" to="https://discord.gg/SUnF2WxsV5">
    <LogoDiscord slot="icon" />
    <ExternalLink slot="append" />
  </Menu>
  <Menu label="Github" to="https://github.com/Blackman99/joueur">
    <LogoGithub slot="icon" />
    <ExternalLink slot="append" />
  </Menu>
</div>

<style>
  .top {
    --uno: 'pb-[10vh] b-b-1 b-b-solid b-b-gray-2 dark:b-gray-8';
  }
  .logo {
    --uno: 'block mx-auto w-[180px]';
  }
  .desc {
    --uno: 'px-4 text-center';
  }
</style>
