<script lang="ts">
  import {
    Button,
    Dialog,
    FormField,
    Headline,
    Loading,
    Modal,
    SnackbarContainer,
    TextField,
  } from "attractions";
  import { push } from "svelte-spa-router";
  import { SnackbarPositions } from "attractions/snackbar";
  import {
    createCollection,
    deleteCollection,
    getCollectionsBrief,
  } from "../services";
  import type { CollectionBrief } from "../typings";
  import CollectionCard from "./CollectionCard.svelte";

  let briefs: CollectionBrief[] = [] as CollectionBrief[];
  let createDialogVisible = false;

  let newCollectionTitle = "";
  let newCollectionId = "";

  let toast;

  function showToast(msg: string, duration = 1500) {
    toast.showSnackbar({ props: { text: msg }, duration });
  }

  async function fetchCollectionsBrief() {
    briefs = await getCollectionsBrief();
  }

  function onEnterDown(e, closeModal) {
    if (e.detail.nativeEvent.code === "Enter") {
      onCreateCollection(closeModal);
    }
  }

  async function onCreateCollection(closeModal) {
    if (!newCollectionTitle || !newCollectionId) {
      showToast("Please fill in required field!");
    } else if (newCollectionId.includes(" ")) {
      showToast("ID cannot contain space!");
    } else if (briefs.some((brief) => brief.id === newCollectionId)) {
      showToast("ID already exists!");
    } else {
      try {
        const newBrief = {
          title: newCollectionTitle,
          id: newCollectionId,
        };
        await createCollection(newBrief);
        await fetchCollectionsBrief();
        // briefs = [...briefs, newBrief];
        closeModal();
      } catch (e) {
        showToast(e.message);
      }
    }
  }

  async function onDeleteCollection(id: string) {
    try {
      await deleteCollection(id);
      await fetchCollectionsBrief();
      showToast("Deleted successfully!");
    } catch (e) {
      showToast(e.message);
    }
  }
</script>

<svelte:head>
  <style>
    body {
      overflow-y: auto;
    }
  </style>
</svelte:head>

<!-- {#await Promise.resolve()} -->
{#await fetchCollectionsBrief()}
  <Loading />
{:then}
  <div class="w-screen container">
    {#each briefs as brief (brief.id)}
      <CollectionCard
        {brief}
        on:click={() => push(`/collection/${brief.id}`)}
        on:delete={() => onDeleteCollection(brief.id)}
      />
    {/each}
    <CollectionCard
      empty
      on:click={() => {
        createDialogVisible = true;
      }}
    />
  </div>

  <!-- modal for creating new collection -->
  <Modal
    bind:open={createDialogVisible}
    noClickaway
    let:closeCallback={closeModal}
  >
    <Dialog title="Create New Collection" danger>
      <FormField name="Title" required>
        <TextField
          bind:value={newCollectionTitle}
          autofocus
          on:keydown={(e) => {
            onEnterDown(e, closeModal);
          }}
        />
      </FormField>
      <FormField name="ID" required>
        <TextField
          bind:value={newCollectionId}
          on:keydown={(e) => {
            onEnterDown(e, closeModal);
          }}
        />
      </FormField>
      <div class="flex justify-around">
        <Button
          on:click={() => {
            newCollectionId = "";
            newCollectionTitle = "";
            closeModal();
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={!newCollectionId || !newCollectionTitle}
          on:click={() => onCreateCollection(closeModal)}
        >
          Confirm
        </Button>
      </div>
    </Dialog>
  </Modal>

  <SnackbarContainer
    bind:this={toast}
    position={SnackbarPositions.TOP_MIDDLE}
  />
{:catch}
  <Headline class="flex justify-center items-center w-screen h-screen">
    Failed to fetch collections info! Please refresh!
  </Headline>
{/await}

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
    padding: 3vh 2vw;
    display: grid;
    grid-template-columns: repeat(6, 15vw);
    grid-auto-rows: 30vh;

    @include grid-gap-row(2vh);
    @include grid-gap-col(1.2vw);
  }
</style>
