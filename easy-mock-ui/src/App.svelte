<script lang="ts">
  import Router from 'svelte-spa-router';
  import Collection from './lib/Collection.svelte';
  import Home from './lib/Home.svelte';
  import Svrollbar from './lib/Scrollbar/Svrollbar.svelte';

  const routes = {
    '/': Home,
    '/collection/:id': Collection,
  };
</script>

<Router {routes} />

<Svrollbar viewport={document.body} contents={document.body} />
<Svrollbar viewport={document.scrollingElement} contents={document.body} horizontal />

<svelte:head>
  <style lang="scss">
    body {
      overflow-y: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
      -ms-overflow-style: none;
      min-width: 300px;
    }
  </style>
</svelte:head>
