<script>
  import { createEventDispatcher, onDestroy, onMount } from 'svelte';
  import { spring } from 'svelte/motion';
  import { fade } from 'svelte/transition';

  /**
   * the scrolling host element.
   *
   * @type {Element}
   */
  export let viewport;

  /**
   * the area scrolled by host element.
   *
   * @type {Element}
   */
  export let contents;

  /**
   * milliseconds to keep scrollbar visible.
   *
   * @type {number}
   */
  export let hideAfter = 200;

  /**
   * make scrollbar always visible if the content is scrollable.
   *
   * @type {boolean}
   */
  export let alwaysVisible = false;

  /**
   * margin (px) from viewport top, right, bottom and left.
   *
   * @type {{ top?: number, right?: number, bottom?: number, left?: number }}
   */
  export let margin = {};

  /**
   * svelte transition to show track in.
   *
   * @type {(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig}
   */
  export let vTrackIn = (node) => fade(node, { duration: 100 });
  /**
   * svelte transition to hide track out.
   *
   * @type {(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig}
   */
  export let vTrackOut = (node) => fade(node, { duration: 300 });

  /**
   * svelte transition to show thumb in.
   *
   * @type {(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig}
   */
  export let vThumbIn = (node) => fade(node, { duration: 100 });

  /**
   * svelte transition to hide thumb out.
   *
   * @type {(node: HTMLElement, params: any) => import('svelte/transition').TransitionConfig}
   */
  export let vThumbOut = (node) => fade(node, { duration: 300 });

  export let horizontal = false;
  export let wheel = false;

  /**
   * @event show
   * @event hide
   */
  const dispatch = createEventDispatcher();

  let vTrack;
  let vThumb;
  let vScrollbar;

  let startTop = 0;
  let startY = 0;
  let startLeft = 0;
  let startX = 0;
  let timer = 0;
  let windowScrollEnabled = false;
  let interacted = false;
  let hovered = true;
  let pressed = false;

  let hWheelUnsubscribe;

  $: teardownViewport = setupViewport(viewport);
  $: teardownContents = setupContents(contents);
  // $: teardownTrack = setupTrack(vTrack);
  $: teardownScrollbar = setupScrollbar(vScrollbar);
  $: teardownThumb = setupThumb(vThumb);

  $: marginTop = margin.top ?? 0;
  $: marginBottom = margin.bottom ?? 0;
  $: marginRight = margin.right ?? 0;
  $: marginLeft = margin.left ?? 0;

  $: wholeHeight = viewport?.scrollHeight ?? 0;
  $: scrollTop = viewport?.scrollTop ?? 0;
  $: trackHeight = viewport?.clientHeight ?? 0 - (marginTop + marginBottom);
  $: thumbHeight = wholeHeight > 0 ? (trackHeight / wholeHeight) * trackHeight : 0;
  $: thumbTop = wholeHeight > 0 ? (scrollTop / wholeHeight) * trackHeight : 0;

  $: wholeWidth = viewport?.scrollWidth ?? 0;
  $: scrollLeft = viewport?.scrollLeft ?? 0;
  $: trackWidth = viewport?.clientWidth ?? 0 - (marginLeft + marginRight);
  $: thumbWidth = wholeWidth > 0 ? (trackWidth / wholeWidth) * trackWidth : 0;
  $: thumbLeft = wholeWidth > 0 ? (scrollLeft / wholeWidth) * trackWidth : 0;

  $: vScrollable = wholeHeight > trackHeight;
  $: hScrollable = wholeWidth > trackWidth;
  $: scrollable = horizontal ? hScrollable : vScrollable;

  $: visible = scrollable && (hovered || pressed || alwaysVisible);

  export function hScrollTo(el, center = false) {
    if (!el || !viewport || !contents) return;

    const { x: targetX, width: targetWidth } = el.getBoundingClientRect();
    const { x: contentX } = contents.getBoundingClientRect();

    const centerPosLeft = targetX - contentX - trackWidth / 2 + targetWidth / 2;
    const startPosLeft = targetX - contentX;

    const originalLeft = viewport.scrollLeft;
    const finalLeft = center ? centerPosLeft : startPosLeft;

    const sp = spring(originalLeft);

    sp.subscribe((value) => {
      viewport.scrollLeft = value;
    });

    sp.set(finalLeft);
  }

  function setupViewport(viewport) {
    if (!viewport) return;

    teardownViewport?.();

    if (typeof window.ResizeObserver === 'undefined') {
      throw new Error('window.ResizeObserver is missing.');
    }

    windowScrollEnabled = document.scrollingElement === viewport;

    // `document.scrollingElement` has the addEventListener function but scroll events wont occur.
    // so we should register the scroll listener to document.
    const element = windowScrollEnabled ? document : viewport;

    element.addEventListener('scroll', onScroll, { passive: true });
    element.addEventListener('mouseover', onViewportOver, true);
    element.addEventListener('mouseout', onViewportOut, true);

    if (horizontal && wheel) {
      element.addEventListener('wheel', onWheelScroll, { passive: true });
    }

    const observer = new ResizeObserver((entries) => {
      for (const _entry of entries) {
        if (!horizontal) {
          wholeHeight = viewport?.scrollHeight ?? 0;
          trackHeight = viewport?.clientHeight - (marginTop + marginBottom) ?? 0;
        } else {
          wholeWidth = viewport?.scrollWidth ?? 0;
          trackWidth = viewport?.clientWidth - (marginLeft + marginBottom) ?? 0;
        }
      }
    });

    observer.observe(viewport);

    return () => {
      element.removeEventListener('scroll', onScroll);
      element.removeEventListener('mouseover', onViewportOver, true);
      element.removeEventListener('mouseout', onViewportOut, true);
      element.removeEventListener('wheel', onWheelScroll);
      observer.unobserve(viewport);
      observer.disconnect();
    };
  }

  function setupScrollbar(scrollbar) {
    if (!scrollbar) return;

    teardownScrollbar?.();

    vScrollbar.addEventListener('mouseover', onViewportOver, true);
    vScrollbar.addEventListener('mouseout', onViewportOut, true);

    return () => {
      vScrollbar.removeEventListener('mouseover', onViewportOver, true);
      vScrollbar.removeEventListener('mouseout', onViewportOut, true);
    };
  }

  // function setupTrack(track) {
  //   if (!track) return;

  //   teardownTrack?.();

  //   vTrack.addEventListener('mouseover', onTrackOver);
  //   vTrack.addEventListener('mouseout', onTrackOut);
  //   return () => {
  //     vTrack.removeEventListener('mouseover', onTrackOver);
  //     vTrack.removeEventListener('mouseout', onTrackOut);
  //   };
  // }

  function setupThumb(thumb) {
    if (!thumb) return;

    teardownThumb?.();

    vThumb.addEventListener('mousedown', onThumbDown, { passive: true });
    vThumb.addEventListener('touchstart', onThumbDown, { passive: true });
    vThumb.addEventListener('mouseover', onThumbOver, { passive: true });
    vThumb.addEventListener('mouseout', onThumbOut, { passive: true });

    return () => {
      vThumb.removeEventListener('mousedown', onThumbDown);
      vThumb.removeEventListener('touchstart', onThumbDown);
      vThumb.removeEventListener('mouseover', onThumbOver);
      vThumb.removeEventListener('mouseout', onThumbOut);
    };
  }

  function setupContents(contents) {
    if (!contents) return;

    teardownContents?.();

    if (typeof window.ResizeObserver === 'undefined') {
      throw new Error('window.ResizeObserver is missing.');
    }

    const observer = new ResizeObserver((entries) => {
      for (const _entry of entries) {
        if (!horizontal) {
          wholeHeight = viewport?.scrollHeight ?? 0;
        } else {
          wholeWidth = viewport?.scrollWidth ?? 0;
        }
      }
    });

    observer.observe(contents);

    return () => {
      observer.unobserve(contents);
      observer.disconnect();
    };
  }

  function setupTimer() {
    timer = window.setTimeout(() => {
      hovered = false;
      dispatch('hide');
    }, hideAfter);
  }

  function clearTimer() {
    if (timer) {
      window.clearTimeout(timer);
      timer = 0;
    }
  }

  function onScroll() {
    if (!scrollable) return;
    // clearTimer();
    // setupTimer();

    // visible = true;
    if (!horizontal) {
      scrollTop = viewport?.scrollTop ?? 0;
    } else {
      scrollLeft = viewport?.scrollLeft ?? 0;
    }

    interacted = true;

    dispatch('show');
  }

  function onWheelScroll(e) {
    if (!horizontal || !wheel || vScrollable || !hScrollable) return;

    e.stopPropagation();

    const originalLeft = viewport.scrollLeft;
    const finalLeft = viewport.scrollLeft + e.deltaY;

    hWheelUnsubscribe?.();

    const sp = spring(originalLeft);

    hWheelUnsubscribe = sp.subscribe((value) => {
      viewport.scrollLeft = value;
    });

    sp.set(finalLeft);
  }

  function onTrackOver() {
    clearTimer();
  }

  function onTrackOut() {
    clearTimer();
    setupTimer();
  }

  function onViewportOver() {
    hovered = true;
    clearTimer();
  }

  function onViewportOut() {
    clearTimer();
    setupTimer();
  }

  function onThumbOver() {
    hovered = true;
    clearTimer();
  }

  function onThumbOut() {
    clearTimer();
    setupTimer();
  }

  function onThumbDown(event) {
    event.stopPropagation();

    pressed = true;

    if (!horizontal) {
      startTop = viewport.scrollTop;
      startY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;
    } else {
      startLeft = viewport.scrollLeft;
      startX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
    }

    document.addEventListener('mousemove', onThumbMove, { passive: true });
    document.addEventListener('touchmove', onThumbMove, { passive: true });
    document.addEventListener('mouseup', onThumbUp, { passive: true });
    document.addEventListener('touchend', onThumbUp, { passive: true });
  }

  function onThumbMove(event) {
    event.stopPropagation();

    if (!horizontal) {
      const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;
      const ratio = wholeHeight / trackHeight;

      viewport.scrollTop = startTop + ratio * (clientY - startY);
    } else {
      const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
      const ratio = wholeWidth / trackWidth;

      viewport.scrollLeft = startLeft + ratio * (clientX - startX);
    }
  }

  function onThumbUp(event) {
    event.stopPropagation();

    pressed = false;

    if (!horizontal) {
      startTop = 0;
      startY = 0;
    } else {
      startLeft = 0;
      startX = 0;
    }

    document.removeEventListener('mousemove', onThumbMove);
    document.removeEventListener('touchmove', onThumbMove);
    document.removeEventListener('mouseup', onThumbUp);
    document.removeEventListener('touchend', onThumbUp);
  }

  onMount(() => {
    viewport = viewport ?? document.scrollingElement;
    contents = contents ?? document.body;
  });

  onDestroy(() => {
    teardownViewport?.();
    teardownContents?.();
    // teardownTrack?.();
    teardownThumb?.();
  });
</script>

{#if visible}
  {#if !horizontal}
    <div
      class="v-scrollbar vertical"
      class:fixed={windowScrollEnabled}
      style="height: {trackHeight}px; margin: {marginTop}px {marginRight}px {marginBottom}px {marginLeft}px"
    >
      <div bind:this={vTrack} class="v-track" style="height: {trackHeight}px" in:vTrackIn out:vTrackOut />
      <div
        bind:this={vThumb}
        class="v-thumb"
        style="height: {thumbHeight}px; top: {thumbTop}px"
        in:vThumbIn
        out:vThumbOut
      />
    </div>
  {:else}
    <div
      bind:this={vScrollbar}
      class="v-scrollbar horizontal"
      class:fixed={windowScrollEnabled}
      style="width: {trackWidth}px; margin: {marginTop}px {marginRight}px {marginBottom}px {marginLeft}px"
    >
      <div bind:this={vTrack} class="v-track" style="width: {trackWidth}px" in:vTrackIn out:vTrackOut />
      <div
        bind:this={vThumb}
        class="v-thumb"
        style="width: {thumbWidth}px; left: {thumbLeft}px"
        in:vThumbIn
        out:vThumbOut
      />
    </div>
  {/if}
{/if}

<style>
  .v-scrollbar.vertical {
    position: absolute;
    top: 0;
    right: 0;
    width: var(--svrollbar-track-width, 10px);
  }

  .v-scrollbar.horizontal {
    position: absolute;
    left: 0;
    bottom: 0;
    height: var(--svrollbar-track-width, 10px);
  }

  .v-scrollbar.fixed {
    position: fixed;
  }

  .vertical .v-track {
    position: absolute;
    top: 0;
    right: 0;
    border-radius: var(--svrollbar-track-radius, initial);
    width: var(--svrollbar-track-width, 10px);
    opacity: var(--svrollbar-track-opacity, 1);
    background: var(--svrollbar-track-background, initial);
    box-shadow: var(--svrollbar-track-shadow, initial);
  }

  .horizontal .v-track {
    position: absolute;
    left: 0;
    bottom: 0;
    border-radius: var(--svrollbar-track-radius, initial);
    height: var(--svrollbar-track-width, 10px);
    opacity: var(--svrollbar-track-opacity, 1);
    background: var(--svrollbar-track-background, initial);
    box-shadow: var(--svrollbar-track-shadow, initial);
  }

  .v-thumb {
    cursor: pointer;
    position: relative;
    border-radius: var(--svrollbar-thumb-radius, 0.25rem);
    opacity: var(--svrollbar-thumb-opacity, 0.6);
    background: var(--svrollbar-thumb-background, gray);
    box-shadow: var(--svrollbar-thumb-shadow, initial);
  }

  .v-thumb:active,
  .v-thumb:hover {
    opacity: var(--svrollbar-thumb-active-opacity, 0.8);
  }

  .vertical .v-thumb {
    margin: 0 auto;
    width: var(--svrollbar-thumb-width, 8px);
  }

  .horizontal .v-thumb {
    margin: auto 0;
    height: var(--svrollbar-thumb-width, 8px);
  }
</style>
