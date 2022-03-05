<script lang="ts">
  import Router from 'svelte-spa-router';
  import Collection from './lib/Collection.svelte';
  import Home from './lib/Home.svelte';

  const routes = {
    '/': Home,
    '/collection/:id': Collection,
  };
</script>

<Router {routes} />
