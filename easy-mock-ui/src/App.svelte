<script lang="ts">
  import { SnackbarContainer } from 'attractions';
  import { SnackbarPositions } from 'attractions/snackbar';
  import { setContext } from 'svelte';
  import Router from 'svelte-spa-router';
  import { fade } from 'svelte/transition';
  import Collection from './lib/Collection.svelte';
  import Home from './lib/Home.svelte';
  import Svrollbar from './lib/Scrollbar/Svrollbar.svelte';
  import { ContextKey, ShowToast } from './typings';

  const routes = {
    '/': Home,
    '/collection/:id': Collection,
  };

  let toast;
  let lastToastCloseCallback;
  function showToast(msg: string, duration = 1500) {
    lastToastCloseCallback?.();
    const { close } = toast?.showSnackbar({
      props: { text: msg, transitionOptions: { duration: 200 }, transition: fade },
      duration,
    });
    lastToastCloseCallback = close;
  }

  setContext<ShowToast>(ContextKey.toast, showToast);
</script>

<Router {routes} />

<SnackbarContainer bind:this={toast} position={SnackbarPositions.TOP_MIDDLE} />

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
