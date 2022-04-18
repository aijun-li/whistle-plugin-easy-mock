<script lang="ts">
  import type { MockItem } from 'src/typings';
  import MockCardListItem from './MockCardListItem.svelte';
  import { createEventDispatcher } from 'svelte';

  export let list: MockItem[];
  export let selectedItem: MockItem;

  const dispatch = createEventDispatcher();
</script>

{#each list as item, index (item.pattern)}
  <MockCardListItem
    {item}
    first={index === 0}
    selected={item.pattern === selectedItem.pattern}
    on:click={() => {
      selectedItem = item;
      dispatch('select', { ...item });
    }}
    on:delete={() => {
      dispatch('delete', { pattern: item.pattern });
    }}
    on:edit={(e) => {
      dispatch('edit', { oldPattern: item.pattern, newPattern: e.detail, type: item.type });
    }}
    on:toggle={() => {
      dispatch('toggle');
    }}
  />
{/each}
