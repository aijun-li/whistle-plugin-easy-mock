<script>
  import { fade } from 'svelte/transition';
  import Svrollbar from './Svrollbar.svelte';

  export let width = '100%';
  export let height = '100%';

  export let hideAfter = 200;

  /**
   * @type {boolean}
   */
  export let alwaysVisible = false;

  /**
   * margin (px) from viewport top, right, bottom and left.
   *
   * @type {{ top?: number, right?: number, buttom?: number, left?: number }}
   */
  export let margin = {};

  /**
   * @type {(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig}
   */
  export let vTrackIn = (node) => fade(node, { duration: 100 });
  /**
   * @type {(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig}
   */
  export let vTrackOut = (node) => fade(node, { duration: 300 });

  /**
   * @type {(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig}
   */
  export let vThumbIn = (node) => fade(node, { duration: 100 });
  /**
   * @type {(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig}
   */
  export let vThumbOut = (node) => fade(node, { duration: 300 });

  export let wrapperClass = '';
  export let contentClass = '';
  export let viewportClass = '';

  export let wheel = false;

  let viewport;
  let contents;

  let hScrollbar;
  export const hScrollTo = (el, center) => {
    hScrollbar?.hScrollTo(el, center);
  };
</script>

<div class={`svlr-wrapper ${wrapperClass}`} style="width: {width}; height: {height}">
  <div bind:this={viewport} class={`svlr-viewport ${viewportClass}`} style="width: {width}; height: {height}">
    <div bind:this={contents} class={`svlr-contents ${contentClass}`}>
      <slot />
    </div>
  </div>
  <Svrollbar
    {viewport}
    {contents}
    {hideAfter}
    {alwaysVisible}
    {margin}
    {vTrackIn}
    {vTrackOut}
    {vThumbIn}
    {vThumbOut}
    on:show
    on:hide
  />
  <Svrollbar
    bind:this={hScrollbar}
    {viewport}
    {contents}
    {hideAfter}
    {alwaysVisible}
    {margin}
    {vTrackIn}
    {vTrackOut}
    {vThumbIn}
    {vThumbOut}
    {wheel}
    horizontal
    on:show
    on:hide
  />
</div>

<style>
  .svlr-wrapper {
    position: relative;
    overflow: hidden;
  }

  .svlr-viewport {
    position: relative;
    overflow: scroll;
    box-sizing: border-box;

    /* hide scrollbar */
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .svlr-viewport::-webkit-scrollbar {
    /* hide scrollbar */
    display: none;
  }
</style>
