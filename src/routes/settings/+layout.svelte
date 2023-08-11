<script>
  import Menu from '$lib/components/shared/Menu.svelte'
  import ArrowRight from '$lib/icons/ArrowRight.svelte'
  import SettingsAbout from '$lib/icons/SettingsAbout.svelte'
  import SettingsPreference from '$lib/icons/SettingsPreference.svelte'

  const settingCategories = [
    {
      label: 'Preference',
      to: '/settings/preference',
      icon: SettingsPreference,
    },
    {
      label: 'About',
      to: '/settings/about',
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
    --uno: 'flex-grow flex items-stretch bg-light-2 dark:bg-dark-9';
  }
  .settings-category {
    --uno: 'w-[30vw] max-w-[480px] min-w-[200px] b-r-1 b-r-solid dark:b-r-gray-8 b-r-light-6';
  }
  .arrow {
    --uno: 'flex items-center text-5';
  }
  .settings-body {
    --uno: 'bg-light-2 dark:bg-dark-9 flex-grow';
  }
</style>
