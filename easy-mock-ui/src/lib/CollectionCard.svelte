<script lang="ts">
  import { Button, H3, Headline, Popover } from "attractions";
  import { PlusIcon } from "svelte-feather-icons";
  import { classes } from "attractions/utils";
  import type { CollectionBrief } from "src/typings";
  import { createEventDispatcher } from "svelte";
  import DeleteDot from "./DeleteDot.svelte";
  import { PopoverPositions } from "attractions/popover";

  export let brief: CollectionBrief = {} as CollectionBrief;
  export let empty = false;

  const dispatch = createEventDispatcher();
</script>

<Popover position={PopoverPositions.TOP}>
  <Button
    class={classes(
      "collection-card-btn",
      "!border-3",
      "!p-4",
      "w-full",
      "h-full",
      empty && "!border-dashed"
    )}
    outline
    on:click={() => {
      dispatch("click");
    }}
  >
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
    {#if !empty}
      <div>
        <DeleteDot
          on:delete={() => {
            dispatch("delete");
          }}
        />
      </div>
    {/if}
  </div>
</Popover>
