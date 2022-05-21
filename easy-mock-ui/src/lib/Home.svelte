<script lang="ts">
  import { Button, Dialog, FormField, Headline, Loading, Modal, SnackbarContainer, TextField } from 'attractions';
  import { SnackbarPositions } from 'attractions/snackbar';
  import { tick } from 'svelte';
  import { push } from 'svelte-spa-router';
  import { LOCAL_DEFAULT_TYPE_KEY } from '../const';
  import { createCollection, deleteCollection, getCollectionsBrief } from '../services';
  import type { CollectionBrief } from '../typings';
  import CollectionCard from './CollectionCard.svelte';
  import { Svrollbar } from './Scrollbar';

  let briefs: CollectionBrief[] = [] as CollectionBrief[];
  let createDialogVisible = false;

  let newCollectionTitle = '';
  let newCollectionId = '';

  let toast;

  $: if (createDialogVisible) {
    tick().then(() => {
      document.getElementById('create-collection-title-input').focus();
    });
  } else {
    tick().then(() => {
      newCollectionId = '';
      newCollectionTitle = '';
    });
  }

  function showToast(msg: string, duration = 1500) {
    toast.showSnackbar({ props: { text: msg }, duration });
  }

  async function fetchCollectionsBrief() {
    briefs = await getCollectionsBrief();
  }

  function onEnterDown(e, closeModal) {
    if (e.detail.nativeEvent.code === 'Enter') {
      onCreateCollection(closeModal);
    }
  }

  async function onCreateCollection(closeModal) {
    if (!newCollectionTitle || !newCollectionId) {
      showToast('Please fill in required field!');
    } else if (newCollectionId.includes(' ')) {
      showToast('ID cannot contain space!');
    } else if (briefs.some((brief) => brief.id === newCollectionId)) {
      showToast('ID already exists!');
    } else {
      try {
        const newBrief = {
          title: newCollectionTitle,
          id: newCollectionId,
        };
        await createCollection(newBrief);
        await fetchCollectionsBrief();
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

      try {
        const storedDefaultTypeMap = JSON.parse(localStorage.getItem(LOCAL_DEFAULT_TYPE_KEY));
        if (storedDefaultTypeMap?.[id]) {
          delete storedDefaultTypeMap[id];
          localStorage.setItem(LOCAL_DEFAULT_TYPE_KEY, JSON.stringify(storedDefaultTypeMap));
        }
      } catch {}

      showToast('Deleted successfully!');
    } catch (e) {
      showToast(e.message);
    }
  }
</script>

<svelte:head>
  <style lang="scss">
    body {
      overflow-y: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
      -ms-overflow-style: none;
      min-width: 300px;
    }
  </style>
</svelte:head>

<svelte:window
  on:keydown={async (event) => {
    if (event.key === 'e' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      createDialogVisible = true;
    } else if (event.key === 'Escape' && createDialogVisible) {
      createDialogVisible = false;
    }
  }}
/>

<!-- {#await Promise.resolve()} -->
{#await fetchCollectionsBrief()}
  <Loading />
{:then}
  <Svrollbar viewport={document.scrollingElement} contents={document.body} />
  <div class="w-screen collections-container">
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
  <Modal bind:open={createDialogVisible} noClickaway let:closeCallback={closeModal}>
    <Dialog title="Create New Collection" danger>
      <FormField name="Title" required>
        <TextField
          id="create-collection-title-input"
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
        <Button on:click={closeModal}>Cancel</Button>
        <Button disabled={!newCollectionId || !newCollectionTitle} on:click={() => onCreateCollection(closeModal)}>
          Confirm
        </Button>
      </div>
    </Dialog>
  </Modal>

  <SnackbarContainer bind:this={toast} position={SnackbarPositions.TOP_MIDDLE} />
{:catch}
  <Headline class="flex justify-center items-center w-screen h-screen">
    Failed to fetch collections info! Please refresh!
  </Headline>
{/await}

<style lang="scss">
  @mixin responsive-grid-col($breakpoint, $count, $gap, $padding) {
    @media screen and (max-width: $breakpoint) {
      --collection-col-count: #{$count};
      --collection-col-gap: #{$gap};
      --collection-col-padding: #{$padding};
    }
  }

  @mixin responsive-grid-row($breakpoint, $height, $gap, $padding) {
    @media screen and (max-height: $breakpoint) {
      --collection-row-height: #{$height};
      --collection-row-gap: #{$gap};
      --collection-row-padding: #{$padding};
    }
  }

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

  .collections-container {
    --collection-col-count: 6;
    --collection-col-gap: 1.2vw;
    --collection-col-padding: 2vw;

    --collection-row-height: 30vh;
    --collection-row-gap: 3vh;
    --collection-row-padding: 2vh;

    @include responsive-grid-col(1024px, 5, 1.1vw, 1.6vw);
    @include responsive-grid-col(768px, 4, 1vw, 1.5vw);
    @include responsive-grid-col(640px, 3, 1vw, 1vw);
    @include responsive-grid-col(400px, 2, 0.5vw, 0.5vw);

    @include responsive-grid-row(500px, 47vh, 2vh, 2vh);

    padding: var(--collection-row-padding) var(--collection-col-padding);
    display: grid;
    grid-template-columns: repeat(var(--collection-col-count), 1fr);
    grid-auto-rows: var(--collection-row-height);

    @include grid-gap-row(var(--collection-row-gap));
    @include grid-gap-col(var(--collection-col-gap));
  }
</style>
