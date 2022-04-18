<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Edit2Icon } from 'svelte-feather-icons';

  const dispatch = createEventDispatcher();
</script>

<div
  class="cursor-pointer p-0.5 text-light-50 rounded-1/2 flex justify-center items-center bg-attraction w-20px h-20px"
  on:click={() => dispatch('click')}
>
  <Edit2Icon size="0.8x" />
</div>
