<script lang="ts">
  import { Button, H3, Dot, Popover, Switch, Slider, Divider } from 'attractions';
  import { createEventDispatcher } from 'svelte';
  import { PopoverPositions } from 'attractions/popover';
  import type { MockItem } from 'src/typings';
  import DeleteDot from './DeleteDot.svelte';

  export let item: MockItem;
  export let selected: boolean;
  export let first: boolean = false;

  const dispatch = createEventDispatcher();
</script>

{#if !first}
  <Divider class="!m-4" />
{/if}

<div class="flex">
  <Switch class="mx-3" bind:value={item.enabled} on:change={() => dispatch('toggle')} />
  <div class="self-stretch mr-8 ml-1">
    <Slider
      class=""
      bind:value={item.delay}
      min={0}
      max={15}
      step={0.5}
      tooltips="active"
      vertical
      ticks={{ mode: 'steps', step: 5, subDensity: 20 / 3 }}
    />
  </div>

  <Popover class="flex-1" popoverClass="delete-btn-popover" position={PopoverPositions.RIGHT}>
    <Button {selected} class="w-full" on:click={() => dispatch('click')}>
      <H3 class="w-full text-left px-1 !m-0">{item.pattern}</H3>
    </Button>
    <div slot="popover-content">
      <div class="ml-2">
        <DeleteDot on:delete={() => dispatch('delete')} />
      </div>
    </div>
  </Popover>
</div>

<style lang="scss">
  :global {
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
