<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { XIcon } from 'svelte-feather-icons';

  const dispatch = createEventDispatcher();

  let willDelete = false;

  function deleteWithConfirm() {
    if (willDelete) {
      dispatch('delete');
    } else {
      willDelete = true;
      setTimeout(() => {
        willDelete = false;
      }, 1000);
    }
  }
</script>

<div
  class="cursor-pointer"
  class:text-disabled={!willDelete}
  class:text-danger={willDelete}
  on:click={deleteWithConfirm}
>
  <XIcon size="1.1x" />
</div>
