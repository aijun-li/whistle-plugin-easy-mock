<script lang="ts">
  import {
    Breadcrumbs,
    Button,
    Card,
    Dialog,
    FormField,
    H2,
    H3,
    Headline,
    Loading,
    Modal,
    Popover,
    SnackbarContainer,
    Tab,
    TextField,
  } from 'attractions';
  import { PopoverPositions } from 'attractions/popover';
  import { SnackbarPositions } from 'attractions/snackbar';
  import { patch } from 'golden-fleece';
  import JSON5 from 'json5';
  import { tick } from 'svelte';
  import { MinusIcon, PlusIcon, ZapIcon, ZapOffIcon } from 'svelte-feather-icons';
  import { LOCAL_DEFAULT_TYPE_KEY } from '../const';
  import { getCollection, saveCollection, updateZapStatus } from '../services';
  import { Collection, MockItem, MockType } from '../typings';
  import EditIcon from './EditIcon.svelte';
  import Json5Editor, { formatJSON } from './Json5Editor.svelte';
  import MockCardList from './MockCardList.svelte';
  import { Svroller } from './Scrollbar';

  export let params = {} as { id: string };

  const DefaultData = { label: 'default', value: '{}' };
  const DefaultSelectedItem = {
    type: MockType.IDL,
    pattern: '',
    data: [],
    delay: 0,
    enabled: true,
    idx: 0,
  };
  const tabs = [
    { label: 'IDL', value: MockType.IDL },
    { label: 'HTTP', value: MockType.HTTP },
  ];

  let collection: Collection;
  let selectedType = (function () {
    try {
      const storedDefaultTypeMap = JSON.parse(localStorage.getItem(LOCAL_DEFAULT_TYPE_KEY) || '{}');
      return storedDefaultTypeMap[params.id] || MockType.IDL;
    } catch {
      return MockType.IDL;
    }
  })();

  let selectedItem: MockItem = { ...DefaultSelectedItem };

  let editor: Json5Editor;

  let toast;

  let newRulePattern = '';
  let newDialogVisible = false;

  let newDataPageLabel = '';
  let editDataPageIndex = undefined;
  let newDataPageVisible = false;

  let idlList: MockItem[] = [];
  let httpList: MockItem[] = [];

  $: id = params.id;

  $: crumbItems = [
    { href: '/whistle.easy-mock', text: 'Collections' },
    { text: `${collection?.title} #${collection?.id}` },
  ];

  $: selectIDL = selectedType === MockType.IDL;

  $: hasSelectedRule = Boolean(selectedItem.pattern);

  $: isEditingDataPageLabel = typeof editDataPageIndex === 'number';

  $: if (newDialogVisible) {
    tick().then(() => {
      document.getElementById('new-rule-input').focus();
    });
  } else {
    tick().then(() => {
      newRulePattern = '';
    });
  }

  $: if (newDataPageVisible) {
    tick().then(() => {
      const input = document.getElementById('new-data-page-input') as HTMLInputElement;
      input.focus();
      if (typeof editDataPageIndex === 'number') {
        input.select();
      }
    });
  } else {
    tick().then(() => {
      newDataPageLabel = '';
      editDataPageIndex = undefined;
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

    try {
      const storedDefaultTypeMap = JSON.parse(localStorage.getItem(LOCAL_DEFAULT_TYPE_KEY) || '{}');
      storedDefaultTypeMap[id] = event.detail.value;
      localStorage.setItem(LOCAL_DEFAULT_TYPE_KEY, JSON.stringify(storedDefaultTypeMap));
    } catch {}

    editor.set('');
  }

  async function onItemSelect() {
    editor.set(selectedItem.data[selectedItem.idx].value);
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
    editor.set(DefaultData.value);
    editor.moveCursorTo(0, 1);

    closeModal();

    await tick();
    editor.focus();
    onSave();
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

      updateItem.data[updateItem.idx].value = validateJSON(snapshot);

      arr.splice(idx, 0, updateItem);

      if (selectIDL) {
        idlList = arr;
      } else {
        httpList = arr;
      }

      editor.set(updateItem.data[updateItem.idx].value);

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

  function onEdit(event) {
    const { oldPattern, newPattern, type } = event.detail;
    const list = type === MockType.IDL ? idlList : httpList;

    const newIdx = list.findIndex((item) => item.pattern === newPattern);
    if (newIdx !== -1) {
      showToast('Pattern already exists!');
      return;
    }

    const item = list.find((item) => item.pattern === oldPattern);
    if (item) {
      item.pattern = newPattern;
      onSave();
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

  async function onCreateDataPage(closeModal) {
    if (isEditingDataPageLabel) {
      selectedItem.data[editDataPageIndex].label = newDataPageLabel || 'unnamed';
    } else {
      const copyData = selectedItem.data[selectedItem.idx].value;
      selectedItem.data.push({ label: newDataPageLabel || 'unnamed', value: copyData });
      selectedItem.idx = selectedItem.data.length - 1;

      editor.set(selectedItem.data[selectedItem.idx].value);
    }

    closeModal();

    await tick();
    editor.focus();
    onSave();
  }

  async function onDeleteCurrentPage() {
    if (selectedItem.data.length === 1) {
      return;
    }
    const currentIdx = selectedItem.idx;
    selectedItem.idx = currentIdx === selectedItem.data.length - 1 ? currentIdx - 1 : currentIdx;
    selectedItem.data.splice(currentIdx, 1);

    editor.set(selectedItem.data[selectedItem.idx].value);

    await tick();
    onSave();
  }

  async function onDataPageChange(idx) {
    selectedItem.idx = idx;

    editor.set(selectedItem.data[idx].value);

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
    } else if (event.key === 'Escape' && (newDialogVisible || newDataPageVisible)) {
      newDialogVisible = false;
      newDataPageVisible = false;
    }
  }}
/>

<svelte:head>
  <style lang="scss">
    body {
      overflow-y: hidden;
    }
  </style>
</svelte:head>

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
          <Card>Turn on Zap mode will cache all JSON response from GET/POST requests.</Card>
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
    <div class="w-1/2 h-screen border-r pt-5 pl-5 flex flex-col ">
      <div>
        <Breadcrumbs items={crumbItems} />
      </div>
      <H3 class="pl-12">
        {selectIDL ? 'Service Method' : 'URL Path'}</H3
      >

      <Svroller wrapperClass="flex-1" viewportClass="pt-5 pr-15 pb-3" contentClass="pr-15 pb-3">
        <MockCardList
          list={selectIDL ? idlList : httpList}
          bind:selectedItem
          on:select={onItemSelect}
          on:delete={onDelete}
          on:edit={onEdit}
          on:toggle={onSave}
        />
      </Svroller>
    </div>

    <div class="flex-1 h-screen min-w-lg flex flex-col justify-start">
      <div class="flex-1 border-b">
        <Json5Editor bind:this={editor} on:blur={onSave} on:save={onSave} />
      </div>
      <div class="flex justify-between items-center px-1">
        <Button
          class={`!p-2 !my-2 ${hasSelectedRule ? '!cursor-pointer' : '!cursor-not-allowed'}`}
          round
          disabled={!hasSelectedRule}
          on:click={() => {
            newDataPageVisible = true;
          }}
        >
          <PlusIcon size="2x" />
        </Button>
        {#if !hasSelectedRule}
          <H2 class="!m-0 select-rule-prompt">select a rule to operate</H2>
        {:else}
          <Svroller wrapperClass="flex-1" contentClass="inline-flex justify-between items-center h-full px-1" wheel>
            {#each selectedItem.data as page, index (index)}
              <div class="page-button">
                <Button
                  outline
                  selected={index === selectedItem.idx}
                  rectangle
                  small
                  on:click={() => {
                    if (index === selectedItem.idx) {
                      return;
                    }
                    onDataPageChange(index);
                  }}
                >
                  {page.label}
                </Button>
                <div
                  class="page-button-edit-icon"
                  on:click={() => {
                    newDataPageLabel = page.label;
                    editDataPageIndex = index;
                    newDataPageVisible = true;
                  }}
                >
                  <EditIcon />
                </div>
              </div>
            {/each}
          </Svroller>
        {/if}
        <Button
          class={`!p-2 !my-2 ${
            !hasSelectedRule || selectedItem.data.length === 1 ? '!cursor-not-allowed' : '!cursor-pointer'
          }`}
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
  <Modal bind:open={newDialogVisible} let:closeCallback={closeModal}>
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

  <!-- modal for adding new data page -->
  <Modal bind:open={newDataPageVisible} let:closeCallback={closeModal}>
    <Dialog title={isEditingDataPageLabel ? 'Edit Mock Data Label' : 'Add New Mock Data'} danger>
      <FormField name="Label">
        <TextField
          id="new-data-page-input"
          placeholder="unnamed"
          bind:value={newDataPageLabel}
          on:keydown={(e) => {
            if (e.detail.nativeEvent.code === 'Enter') {
              onCreateDataPage(closeModal);
            }
          }}
          autofocus
        />
      </FormField>
      <div class="flex justify-around">
        <Button on:click={closeModal}>Cancel</Button>
        <Button on:click={() => onCreateDataPage(closeModal)}>Confirm</Button>
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

    .popover {
      z-index: 2;
    }

    .select-rule-prompt {
      color: #888888 !important;
    }
  }

  .page-button {
    @apply relative not-first:ml-1 flex-none;

    .page-button-edit-icon {
      @apply absolute top-0 right-0 hidden;
      transform: translate(20%, -30%);
    }

    &:hover > .page-button-edit-icon {
      @apply block;
    }
  }
</style>
