<script lang="ts">
  import { Button, Divider, H3, Popover, Slider, Switch, TextField } from 'attractions';
  import { PopoverPositions } from 'attractions/popover';
  import type { MockItem } from 'src/typings';
  import { createEventDispatcher } from 'svelte';
  import DeleteIcon from './DeleteIcon.svelte';
  import EditIcon from './EditIcon.svelte';

  export let item: MockItem;
  export let selected: boolean;
  export let first: boolean = false;

  let inEdit = false;

  const dispatch = createEventDispatcher();

  function handleEdit(e) {
    console.log('edit!');
    dispatch('edit', e.detail.value);
    inEdit = false;
  }
</script>

{#if !first}
  <Divider class="!my-4 !ml-1" />
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

  <Popover {...{ class: 'flex-1' }} popoverClass="delete-btn-popover" position={PopoverPositions.RIGHT}>
    {#if !inEdit}
      <Button {selected} class="w-full" on:click>
        <H3 class="w-full text-left px-1 !m-0">{item.pattern}</H3>
      </Button>
    {:else}
      <TextField
        class="!my-0 outline-none"
        inputClass="!text-[1.3rem] !font-medium !px-[1.1em] !h-[2.6em]"
        value={item.pattern}
        autofocus
        outline
        on:change={handleEdit}
        on:blur={() => (inEdit = false)}
        on:keydown={(e) => {
          if (['Enter', 'Escape'].includes(e.detail.nativeEvent.code)) {
            inEdit = false;
          }
        }}
      />
    {/if}
    <div slot="popover-content">
      {#if !inEdit}
        <div class="ml-2 flex flex-col justify-between">
          <div><EditIcon on:click={() => (inEdit = true)} /></div>
          <div class="mt-1"><DeleteIcon on:click={() => dispatch('delete')} /></div>
        </div>
      {/if}
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
