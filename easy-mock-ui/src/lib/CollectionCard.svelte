<script lang="ts">
  import { Button, H3, Headline, Popover } from 'attractions';
  import { PlusIcon } from 'svelte-feather-icons';
  import { classes } from 'attractions/utils';
  import type { CollectionBrief } from 'src/typings';
  import DeleteIcon from './DeleteIcon.svelte';
  import { PopoverPositions } from 'attractions/popover';
  import { createEventDispatcher } from 'svelte';

  export let brief: CollectionBrief = {} as CollectionBrief;
  export let empty = false;

  const dispatch = createEventDispatcher();
</script>

<Popover popoverClass="collection-delete-popover" position={PopoverPositions.TOP}>
  <Button class={classes('!border-3', '!p-4', 'w-full', 'h-full', empty && '!border-dashed')} outline on:click>
    {#if empty}
      <PlusIcon />
    {:else}
      <div class="flex h-full w-full flex-col justify-between relative">
        <Headline class="text-left">{brief.title}</Headline>
        <H3 class="text-left text-subtitle">{brief.id}</H3>
      </div>
    {/if}
  </Button>
  <div slot="popover-content">
    {#if !empty && brief.id !== 'default'}
      <DeleteIcon on:click={() => dispatch('delete')} />
    {/if}
  </div>
</Popover>

<style lang="scss">
  :global {
    .collection-delete-popover {
      left: 100% !important;
      transform: translate(calc(-100% - 0.6em), 0.6em) !important;
      z-index: 999;
    }
  }
</style>
