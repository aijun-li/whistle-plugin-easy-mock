<script lang="ts">
  import {
    Button,
    Tab,
    Dialog,
    Modal,
    FormField,
    TextField,
    SnackbarContainer,
    H3,
    Loading,
    Headline,
    Breadcrumbs,
    Popover,
    Card,
    Pagination,
    H2,
  } from 'attractions';
  import { SnackbarPositions } from 'attractions/snackbar';
  import { Collection, MockItem, MockType } from '../typings';
  import MockCardList from './MockCardList.svelte';
  import { saveCollection, getCollection, updateZapStatus } from '../services';
  import { MinusIcon, PlusIcon, ZapIcon, ZapOffIcon } from 'svelte-feather-icons';
  import { PopoverPositions } from 'attractions/popover';
  import { tick } from 'svelte';
  import Json5Editor, { formatJSON } from './Json5Editor.svelte';
  import JSON5 from 'json5';
  import { patch } from 'golden-fleece';

  export let params = {} as { id: string };

  $: id = params.id;

  const DefaultData = '{}';
  const DefaultSelectedItem = {
    type: MockType.IDL,
    pattern: '',
    data: [''],
    delay: 0,
    enabled: true,
    idx: 0,
  };
  const tabs = [
    { label: 'IDL', value: MockType.IDL },
    { label: 'HTTP', value: MockType.HTTP },
  ];

  let collection: Collection;
  let selectedType = MockType.IDL;
  let selectedItem: MockItem = { ...DefaultSelectedItem };

  let editor: Json5Editor;

  let toast;
  let newRulePattern = '';
  let newDialogVisible = false;

  let idlList: MockItem[] = [];
  let httpList: MockItem[] = [];

  $: crumbItems = [
    { href: '/whistle.easy-mock', text: 'Collections' },
    { text: `${collection?.title} #${collection?.id}` },
  ];

  $: selectIDL = selectedType === MockType.IDL;

  $: hasSelectedRule = Boolean(selectedItem.pattern);

  $: if (newDialogVisible) {
    tick().then(() => {
      document.getElementById('new-rule-input').focus();
    });
  } else {
    tick().then(() => {
      newRulePattern = '';
    });
  }

  async function fetchRemoteRules() {
    collection = await getCollection(id);
    idlList = collection.rules.idl ?? [];
    httpList = collection.rules.http ?? [];
  }

  function showToast(msg: string, duration = 1500) {
    toast.showSnackbar({ props: { text: msg }, duration });
  }

  function onTabChange(event) {
    selectedItem = {
      ...DefaultSelectedItem,
      type: event.detail.value,
    };
    editor.set('');
  }

  async function onItemSelect() {
    editor.set(selectedItem.data[selectedItem.idx]);
    await tick();
    editor.focus();
  }

  async function onAddNewRule(closeModal) {
    const arr = selectIDL ? idlList : httpList;
    if (arr.some((item) => item.pattern === newRulePattern)) {
      showToast('Pattern already exists!');
      return;
    }
    const newMockItem = {
      type: selectedType,
      pattern: newRulePattern,
      data: [DefaultData],
      delay: 0,
      enabled: true,
      idx: 0,
    };
    if (selectIDL) {
      idlList = [newMockItem, ...idlList];
    } else {
      httpList = [newMockItem, ...httpList];
    }
    selectedItem = newMockItem;
    editor.set(DefaultData);
    editor.moveCursorTo(0, 1);

    closeModal();

    await tick();
    editor.focus();
  }

  async function onSave() {
    // if no item is currently selected, save directly
    if (!hasSelectedRule) {
      try {
        await saveCollection(id, {
          idl: idlList,
          http: httpList,
        });
        showToast('Saved successfully!');
      } catch (e) {
        showToast(e.message);
      }
      return;
    }

    try {
      editor.format();
      const snapshot = editor.get();
      const arr = selectIDL ? [...idlList] : [...httpList];
      const idx = arr.findIndex((item) => item.pattern === selectedItem.pattern);
      const updateItem = arr.splice(idx, 1)[0];

      updateItem.data[updateItem.idx] = validateJSON(snapshot);

      arr.splice(idx, 0, updateItem);

      if (selectIDL) {
        idlList = arr;
      } else {
        httpList = arr;
      }

      editor.set(updateItem.data[updateItem.idx]);

      await saveCollection(id, {
        idl: idlList,
        http: httpList,
      });

      showToast('Saved successfully!');
    } catch (e) {
      showToast(e.message);
    }
  }

  async function onDelete(event) {
    const { pattern } = event.detail;
    const arr = selectIDL ? [...idlList] : [...httpList];
    const idx = arr.findIndex((item) => item.pattern === pattern);

    try {
      arr.splice(idx, 1);
      await saveCollection(
        id,
        selectIDL
          ? {
              idl: arr,
              http: httpList,
            }
          : {
              idl: idlList,
              http: arr,
            },
        true,
      );
      if (selectIDL) {
        idlList = arr;
      } else {
        httpList = arr;
      }
      selectedItem = {
        ...DefaultSelectedItem,
        type: selectedType,
      };

      editor.set('');

      showToast('Deleted successfully!');
    } catch (e) {
      showToast(e.message);
    }
  }

  async function onToggleZap() {
    try {
      await updateZapStatus(collection.id, !collection.zap);
      collection.zap = !collection.zap;
      showToast(collection.zap ? 'Turn on Zap mode!' : 'Turn off Zap mode!');
    } catch (e) {
      showToast(e.message);
    }
  }

  function validateJSON(snapshot: string) {
    try {
      const json = JSON5.parse(snapshot, function (key, value) {
        if (key.startsWith('$$$') && key.length > 3 && typeof value === 'string') {
          try {
            console.log(value, typeof value, this);
            this[key.slice(1)] = JSON.parse(value);
            return undefined;
          } catch (e) {
            throw new Error(`Invalid JSON string for '$$$' property!`);
          }
        } else {
          return value;
        }
      });

      return formatJSON(patch(snapshot, json));
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async function onCreateNewPage() {
    const copyData = selectedItem.data[selectedItem.idx];
    selectedItem.data.push(copyData);
    selectedItem.idx = selectedItem.data.length - 1;

    editor.set(selectedItem.data[selectedItem.idx]);

    await tick();
    onSave();
  }

  async function onDeleteCurrentPage() {
    if (selectedItem.data.length === 1) {
      return;
    }
    const currentIdx = selectedItem.idx;
    selectedItem.idx = currentIdx === selectedItem.data.length - 1 ? currentIdx - 1 : currentIdx;
    selectedItem.data.splice(currentIdx, 1);

    editor.set(selectedItem.data[selectedItem.idx]);

    await tick();
    onSave();
  }
</script>

<svelte:window
  on:keydown={(event) => {
    if (event.key === 's' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSave();
    } else if (event.key === 'e' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      newDialogVisible = true;
    } else if (event.key === 'Escape' && newDialogVisible) {
      newDialogVisible = false;
    }
  }}
/>

<!-- {#await Promise.resolve()} -->
{#await fetchRemoteRules()}
  <Loading />
{:then}
  <div class="flex">
    <div class="w-fit h-screen border-r flex flex-col justify-between">
      <div>
        {#each tabs as tab (tab.label)}
          <Tab
            contentClass="w-full justify-center !rounded-none"
            value={tab.value}
            name="mock-type"
            bind:group={selectedType}
            on:change={onTabChange}
          >
            {tab.label}
          </Tab>
        {/each}
      </div>
      <div class="flex-1" />
      <Popover position={PopoverPositions.RIGHT}>
        <Button class="!rounded-none flex justify-center w-full" rectangle on:click={onToggleZap}>
          {#if collection.zap}
            <ZapIcon size="1.5x" />
          {:else}
            <ZapOffIcon size="1.5x" />
          {/if}
        </Button>
        <div slot="popover-content">
          <Card>(Experimental!) Turn on Zap mode will cache all JSON response from GET/POST requests.</Card>
        </div>
      </Popover>
      <Popover position={PopoverPositions.RIGHT}>
        <Button class="!rounded-none w-full" selected={false} on:click={onSave} rectangle>Save</Button>
        <div slot="popover-content"><Card>ctrl/cmd + s</Card></div>
      </Popover>
      <Popover position={PopoverPositions.RIGHT}>
        <Button
          class="!rounded-none w-full"
          on:click={() => {
            newDialogVisible = true;
          }}
          rectangle
        >
          New
        </Button>
        <div slot="popover-content"><Card>ctrl/cmd + e</Card></div>
      </Popover>
    </div>
    <div class="w-1/2 h-screen border-r pt-5 pl-5 flex flex-col">
      <div>
        <Breadcrumbs items={crumbItems} />
      </div>
      <H3 class="pl-12">
        {selectIDL ? 'Service Method' : 'URL Path'}</H3
      >
      <div class="pt-5 flex-1 overflow-y-auto overflow-x-visible">
        <div class="pr-15 pb-3">
          <MockCardList
            list={selectIDL ? idlList : httpList}
            bind:selectedItem
            on:select={onItemSelect}
            on:delete={onDelete}
            on:toggle={onSave}
          />
        </div>
      </div>
    </div>
    <div class="flex-1 h-screen min-w-lg flex flex-col justify-start">
      <div class="flex-1 border-b">
        <Json5Editor bind:this={editor} on:blur={onSave} on:save={onSave} />
      </div>
      <div class="flex justify-between items-center p-2">
        <Button class="!p-2" round disabled={!hasSelectedRule} on:click={onCreateNewPage}>
          <PlusIcon size="2x" />
        </Button>
        {#if !hasSelectedRule}
          <H2 class="!m-0">select a rule to operate</H2>
        {:else}
          <Pagination
            class="!m-0"
            pages={selectedItem.data.length}
            currentPage={selectedItem.idx + 1}
            on:change={async (event) => {
              const { value } = event.detail;
              selectedItem.idx = value - 1;

              editor.set(selectedItem.data[value - 1]);

              await tick();
              onSave();
            }}
          />
        {/if}
        <Button
          class="!p-2"
          round
          disabled={!hasSelectedRule || selectedItem.data.length === 1}
          on:click={onDeleteCurrentPage}
        >
          <MinusIcon size="2x" />
        </Button>
      </div>
    </div>
  </div>

  <!-- modal for adding new rule -->
  <Modal bind:open={newDialogVisible} noClickaway let:closeCallback={closeModal}>
    <Dialog title={`Add New ${selectedType.toUpperCase()} Rule`} danger>
      <FormField name={selectIDL ? 'Service Method' : 'URL Path'} required>
        <TextField
          id="new-rule-input"
          bind:value={newRulePattern}
          on:keydown={(e) => {
            if (e.detail.nativeEvent.code === 'Enter') {
              onAddNewRule(closeModal);
            }
          }}
          autofocus
        />
      </FormField>
      <div class="flex justify-around">
        <Button on:click={closeModal}>Cancel</Button>
        <Button disabled={!newRulePattern} on:click={() => onAddNewRule(closeModal)}>Confirm</Button>
      </div>
    </Dialog>
  </Modal>

  <!-- Toast -->
  <SnackbarContainer bind:this={toast} position={SnackbarPositions.TOP_MIDDLE} />
{:catch}
  <Headline class="flex justify-center items-center w-screen h-screen">
    Failed to fetch rule list! Please refresh!
  </Headline>
{/await}

<style lang="scss">
  :global {
    .spinner.spinner.spinner {
      height: 100vh;
      width: 100vw;
      > {
        .bounce1,
        .bounce2,
        .bounce3 {
          height: 1.5em;
          width: 1.5em;
          margin: 3em;
        }
      }
    }
  }
</style>
