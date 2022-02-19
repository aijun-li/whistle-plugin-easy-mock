<script lang="ts">
  import { Button, H3, Dot, Popover } from 'attractions';
  import { createEventDispatcher } from 'svelte';
  import { PopoverPositions } from 'attractions/popover';
  import type { MockItem } from 'src/typings';

  export let item: MockItem;
  export let selected: boolean;

  const dispatch = createEventDispatcher();

  let timer = 0;
  let willDelte = false;

  function deleteWithConfirm() {
    if (willDelte) {
      dispatch('delete');
    } else {
      willDelte = true;
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        willDelte = false;
      }, 1000);
    }
  }
</script>

<Popover popoverClass="delete-btn-popover" position={PopoverPositions.RIGHT}>
  <Button {selected} class="w-full" on:click={() => dispatch('click')}>
    <H3 class="w-full text-left px-5">{item.pattern}</H3>
  </Button>
  <div slot="popover-content">
    <div class="ml-2" on:click={deleteWithConfirm}>
      <Dot class="delete-dot" attention={!willDelte} danger={willDelte} />
    </div>
  </div>
</Popover>

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
