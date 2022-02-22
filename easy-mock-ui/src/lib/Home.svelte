<script lang="ts">
  import { Button, Card, H3, Headline } from "attractions";
  import { PlusIcon } from "svelte-feather-icons";
  import { Link } from "svelte-routing";
  import CollectionCard from "./CollectionCard.svelte";
</script>

<svelte:head>
  <style>
    body {
      overflow-y: auto;
    }
  </style>
</svelte:head>

<div class="w-screen container">
  {#each Array(20)
    .fill(0)
    .map((item) => ({ title: "test", id: "tt" })) as item, index (index)}
    <CollectionCard brief={item} />
  {/each}
  <CollectionCard empty />
</div>

<style lang="scss">
  @mixin grid-gap-row($gap) {
    -webkit-row-gap: $gap;
    -moz-row-gap: $gap;
    grid-row-gap: $gap;
    row-gap: $gap;
  }

  @mixin grid-gap-col($gap) {
    -webkit-column-gap: $gap;
    -moz-column-gap: $gap;
    grid-column-gap: $gap;
    column-gap: $gap;
  }

  .container {
    padding: 2vh 1.5vw;
    display: grid;
    grid-template-columns: repeat(6, 15vw);
    grid-auto-rows: 30vh;

    @include grid-gap-row(3vh);
    @include grid-gap-col(1.2vw);
  }
</style>
