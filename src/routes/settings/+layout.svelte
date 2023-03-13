<script>
  import Menu from '$lib/components/Menu.svelte'
  import ArrowRight from '$lib/icons/ArrowRight.svelte'
  import SettingsAbout from '$lib/icons/SettingsAbout.svelte'

  const settingCategories = [
    {
      label: 'About',
      to: '/settings',
      icon: SettingsAbout,
    },
  ]
</script>

<div class="settings">
  <div class="settings-category">
    {#each settingCategories as category}
      <Menu label="{category.label}" to="{category.to}" rounded="{false}">
        <svelte:component this="{category.icon}" slot="icon" />
        <div slot="append" class="arrow">
          <ArrowRight />
        </div>
      </Menu>
    {/each}
  </div>
  <div class="settings-body">
    <slot />
  </div>
</div>

<style>
  .settings {
    --uno: 'flex-grow flex items-stretch bg-light-2';
  }
  .settings-category {
    --uno: 'w-[30vw] max-w-[480px] min-w-[200px]';
  }
  .arrow {
    --uno: 'flex items-center text-5';
  }
  .settings-body {
    --uno: 'bg-light-4 flex-grow';
  }
</style>
