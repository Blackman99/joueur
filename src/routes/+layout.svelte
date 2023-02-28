<script>
  import Menu from '$lib/Menu.svelte'
</script>

<main class="j-main">
  <aside class="j-side">
    <img src="/logo.svg" alt="Joueur" class="logo" />
    <div>
      <Menu label="Musics" to="/">
        <div slot="icon" class="i-bi:music-note-list"></div>
      </Menu>
      <Menu label="Album" to="/albums">
        <div slot="icon" class="i-iconoir:album-open"></div>
      </Menu>
      <Menu label="Settings" to="/settings">
        <div slot="icon" class="i-bytesize:settings"></div>
      </Menu>
    </div>
    <div></div>
  </aside>
  <div class="j-content">
    <slot />
  </div>
</main>

<style uno:preflights uno:safelist global>
  :global(body) {
    --uno: 'bg-light-5 m-0 p-0 overflow-hidden';
  }
  :global(a) {
    --uno: 'decoration-none text-inherit';
  }
  .logo {
    --uno: 'w-[80px] block mx-a';
  }
  .j-main {
    --uno: 'flex h-[100vh]';
  }
  .j-side {
    --uno: 'flex flex-col justify-between p-4 w-[15vw]';
  }
  .j-content {
    --uno: 'flex-grow';
  }
</style>
