<script lang="ts">
  import { Dot } from "attractions";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let willDelte = false;

  function deleteWithConfirm() {
    if (willDelte) {
      dispatch("delete");
    } else {
      willDelte = true;
      setTimeout(() => {
        willDelte = false;
      }, 1000);
    }
  }
</script>

<div on:click={deleteWithConfirm}>
  <Dot class="delete-dot" attention={!willDelte} danger={willDelte} />
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
  }
</style>
