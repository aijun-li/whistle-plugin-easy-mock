<script lang="ts">
  import { Router, Link, Route } from 'svelte-routing';
  import Collection from './lib/Collection.svelte';
  import Home from './lib/Home.svelte';
</script>

<Router>
  <Route path="/" component={Home} />
  <Route path="/collection/:id" component={Collection} />
</Router>
