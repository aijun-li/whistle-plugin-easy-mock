<script lang="ts">
  import type { MockItem } from 'src/typings';
  import { createEventDispatcher } from 'svelte';
  import MockCardListItem from './MockCardListItem.svelte';

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
    on:toggle
    on:delay-change
  />
{/each}
