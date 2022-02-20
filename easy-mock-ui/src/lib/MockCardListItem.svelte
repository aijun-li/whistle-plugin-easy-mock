<script lang="ts">
  import {
    Button,
    H3,
    Dot,
    Popover,
    Switch,
    Slider,
    Divider,
  } from 'attractions';
  import { createEventDispatcher } from 'svelte';
  import { PopoverPositions } from 'attractions/popover';
  import type { MockItem } from 'src/typings';

  export let item: MockItem;
  export let selected: boolean;
  export let first: boolean = false;

  const dispatch = createEventDispatcher();

  let willDelte = false;

  function deleteWithConfirm() {
    if (willDelte) {
      dispatch('delete');
    } else {
      willDelte = true;
      setTimeout(() => {
        willDelte = false;
      }, 1000);
    }
  }
</script>

{#if !first}
  <Divider class="!m-2" />
{/if}

<div class="flex">
  <Switch class="mx-3" bind:value={item.enabled} />
  <div class="py-2 self-stretch mr-2 ml-1">
    <Slider
      class=""
      bind:value={item.delay}
      min={0}
      max={5}
      step={0.5}
      tooltips="active"
      vertical
    />
  </div>

  <Popover
    class="flex-1"
    popoverClass="delete-btn-popover"
    position={PopoverPositions.RIGHT}
  >
    <Button {selected} class="w-full" on:click={() => dispatch('click')}>
      <H3 class="w-full text-left px-1 !m-0">{item.pattern}</H3>
    </Button>
    <div slot="popover-content">
      <div class="ml-2" on:click={deleteWithConfirm}>
        <Dot class="delete-dot" attention={!willDelte} danger={willDelte} />
      </div>
    </div>
  </Popover>
</div>

<style lang="scss">
  :global {
    .delete-dot.dot {
      width: 1.5rem;
      height: 1.5rem;

      &:hover {
        cursor: pointer;
      }
    }
    .popover-container {
      &:focus-within > .popover.popover.delete-btn-popover {
        display: none;
      }
      &:hover > .popover.popover.delete-btn-popover {
        display: block;
      }
    }
  }
</style>
