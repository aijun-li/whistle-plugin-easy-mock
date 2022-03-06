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
  class="cursor-pointer p-0.5 text-light-50 rounded-1/2 flex justify-center items-center"
  class:bg-attraction={!willDelete}
  class:bg-red-600={willDelete}
  on:click={deleteWithConfirm}
>
  <XIcon size="1x" />
</div>
