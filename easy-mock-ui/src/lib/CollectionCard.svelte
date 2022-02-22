<script lang="ts">
  import { Button, H3, Headline } from "attractions";
  import { PlusIcon } from "svelte-feather-icons";
  import { classes } from "attractions/utils";
  import type { CollectionBrief } from "src/typings";
  import { navigate } from "svelte-routing";

  export let brief: CollectionBrief = {} as CollectionBrief;
  export let empty = false;
</script>

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
    navigate("/collection/2");
  }}
>
  {#if empty}
    <PlusIcon />
  {:else}
    <div class="flex h-full w-full flex-col justify-between">
      <Headline class="text-left">{brief.title}</Headline>
      <H3 class="text-left text-subtitle">{brief.id}</H3>
    </div>
  {/if}
</Button>
