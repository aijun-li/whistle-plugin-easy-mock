<script lang="ts">
  import {
    Breadcrumbs,
    Button,
    Chip,
    Dialog,
    FormField,
    H2,
    H3,
    Headline,
    Label,
    Loading,
    Modal,
    Popover,
    Tab,
    TextField,
  } from 'attractions';
  import { PopoverPositions } from 'attractions/popover';
  import { patch } from 'golden-fleece';
  import JSON5 from 'json5';
  import { getContext, onDestroy, tick } from 'svelte';
  import { ChevronLeftIcon, MinusIcon, PlusIcon, ZapIcon, ZapOffIcon } from 'svelte-feather-icons';
  import { getCollection, saveCollection, updateZapStatus } from '../services';
  import { setupWebSocket } from '../services/websocket';
  import { Collection, ContextKey, LocalKey, MockItem, MockType, ShowToast } from '../typings';
  import EditIcon from './EditIcon.svelte';
  import Json5Editor, { formatJSON } from './Json5Editor.svelte';
  import MockCardList from './MockCardList.svelte';
  import { Svroller } from './Scrollbar';

  export let params = {} as { id: string };

  const isMacOS = navigator.platform.toLowerCase().startsWith('mac');

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
    { label: 'RPC', value: MockType.IDL },
    { label: 'HTTP', value: MockType.HTTP },
  ];

  const showToast = getContext<ShowToast>(ContextKey.toast);

  let collection: Collection;
  let selectedType = (function () {
    try {
      const storedDefaultTypeMap = JSON.parse(localStorage.getItem(LocalKey.defaultType) || '{}');
      return storedDefaultTypeMap[params.id] || MockType.IDL;
    } catch {
      return MockType.IDL;
    }
  })();

  let selectedItem: MockItem = { ...DefaultSelectedItem };

  let editor: Json5Editor;
  let dataPageScroll;

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
  $: selectedList = selectIDL ? idlList : httpList;

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

  function onTabChange(event) {
    selectedItem = {
      ...DefaultSelectedItem,
      type: event.detail.value,
    };

    try {
      const storedDefaultTypeMap = JSON.parse(localStorage.getItem(LocalKey.defaultType) || '{}');
      storedDefaultTypeMap[id] = event.detail.value;
      localStorage.setItem(LocalKey.defaultType, JSON.stringify(storedDefaultTypeMap));
    } catch {}

    editor.set('');
  }

  async function onItemSelect() {
    editor.set(selectedItem.data[selectedItem.idx].value);
    await tick();
    editor.focus();
    dataPageScroll?.hScrollTo(document.querySelector('.page-button .btn.selected'), true);
  }

  async function onAddNewRule(closeModal) {
    const arr = selectedList;
    if (arr.some((item) => item.pattern === newRulePattern)) {
      showToast('Pattern already exists!');
      return;
    }
    const newMockItem = {
      type: selectedType,
      pattern: newRulePattern,
      data: [{ ...DefaultData }],
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
    onSave();

    setTimeout(editor.focus, 100);
  }

  async function onSave() {
    // if no item is currently selected, save directly
    if (!hasSelectedRule) {
      try {
        await saveCollection(id, {
          idl: idlList,
          http: httpList,
        });
        showToast('Saved!');
      } catch (e) {
        showToast(e.message);
      }
      return;
    }

    try {
      editor.format();
      const snapshot = editor.get();
      const arr = [...selectedList];
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

      showToast('Saved!');
    } catch (e) {
      showToast(e.message);
    }
  }

  async function onDelete(event) {
    const { pattern } = event.detail;
    const arr = [...selectedList];
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
    onSave();

    setTimeout(editor.focus, 100);
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

  const closeWebSocket = setupWebSocket(params.id, async (data) => {
    if (data.type === 'update') {
      await fetchRemoteRules();
      await tick();
      if (hasSelectedRule) {
        selectedItem = selectedList.find((item) => item.pattern === selectedItem.pattern);
      }
    }
  });
  onDestroy(() => {
    closeWebSocket();
  });
</script>

<svelte:window
  on:keydown={(event) => {
    const modifierKey = isMacOS ? event.metaKey : event.ctrlKey;
    if (event.key === 's' && modifierKey) {
      event.preventDefault();
      onSave();
    } else if (event.key === 'e' && modifierKey) {
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
    <div class={`w-fit h-screen border-r flex flex-col justify-between ${hasSelectedRule ? '<sm:hidden' : ''}`}>
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
        <Button class="!rounded-none flex justify-center w-full !px-3" rectangle on:click={onToggleZap}>
          {#if collection.zap}
            <ZapIcon size="1.5x" class="fill-orange-300" />
          {:else}
            <ZapOffIcon size="1.5x" />
          {/if}
        </Button>
        <div slot="popover-content">
          <Chip small class="w-max max-w-[30vw]">
            Turn on Zap mode will cache all JSON response from GET/POST requests.
          </Chip>
        </div>
      </Popover>
      <Popover position={PopoverPositions.RIGHT}>
        <Button class="!rounded-none w-full !px-3 justify-center" selected={false} on:click={onSave} rectangle
          >Save</Button
        >
        <div slot="popover-content">
          <Chip small class="w-max">{`${isMacOS ? 'CMD' : 'CTRL'} + S`}</Chip>
        </div>
      </Popover>
      <Popover position={PopoverPositions.RIGHT}>
        <Button
          class="!rounded-none w-full !px-3 justify-center"
          on:click={() => {
            newDialogVisible = true;
          }}
          rectangle
        >
          New
        </Button>
        <div slot="popover-content">
          <Chip small class="w-max">{`${isMacOS ? 'CMD' : 'CTRL'} + E`}</Chip>
        </div>
      </Popover>
    </div>
    <div
      class={`w-2/5 min-w-sm h-screen pt-5 pl-2 flex flex-col sm:border-r <sm:flex-1 ${
        hasSelectedRule ? '<sm:hidden' : ''
      }`}
    >
      <div>
        <Breadcrumbs items={crumbItems} />
      </div>
      <H3 class="pl-12">
        {selectIDL ? 'Service Method' : 'URL Path'}</H3
      >

      <Svroller wrapperClass="flex-1" viewportClass="pt-5 pr-15 pb-3" contentClass="pr-15 pb-3">
        <MockCardList
          list={selectedList}
          bind:selectedItem
          on:select={onItemSelect}
          on:delete={onDelete}
          on:edit={onEdit}
          on:toggle={onSave}
          on:delay-change={onSave}
        />
      </Svroller>
    </div>

    <div
      class={`flex-1 h-screen min-w-md <sm:min-w-sm flex flex-col justify-start ${hasSelectedRule ? '' : '<sm:hidden'}`}
    >
      <div class="flex-none flex border-b items-center justify-between sm:hidden">
        <Button
          class="!rounded-none"
          small
          round
          on:click={() => {
            selectedItem = {
              ...DefaultSelectedItem,
              type: selectedType,
            };
          }}
        >
          <ChevronLeftIcon size="1.5x" />
          <Label>{selectedItem.type.toUpperCase()}</Label>
        </Button>
        <H3 class="!m-0 !mx-2 text-attraction truncate">{selectedItem.pattern}</H3>
        <Button class="!rounded-none invisible" small round>
          <ChevronLeftIcon size="1.5x" />
          <Label>{selectedItem.type.toUpperCase()}</Label>
        </Button>
      </div>
      <div class="flex-1 border-b">
        <Json5Editor bind:this={editor} on:blur={onSave} on:save={onSave} readOnly={!hasSelectedRule} />
      </div>
      <div class="flex justify-between items-center">
        <Button
          class={`!p-3 !py-4 !rounded-none ${hasSelectedRule ? '!cursor-pointer' : '!cursor-not-allowed'}`}
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
          <Svroller bind:this={dataPageScroll} wrapperClass="flex-1" contentClass="flex items-center h-full pl-1">
            {#each selectedItem.data as page, index (index)}
              <div class="page-button">
                <Button
                  outline
                  selected={index === selectedItem.idx}
                  rectangle
                  small
                  on:click={(event) => {
                    dataPageScroll?.hScrollTo(event.detail.nativeEvent.target, true);
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
            <div class="w-1">&nbsp;</div>
          </Svroller>
        {/if}
        <Button
          class={`!p-3 !py-4 !rounded-none ${
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
{:catch}
  <Headline class="flex justify-center items-center w-screen h-screen text-center">
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
      transform: translate(20%, -30%) scale(0.8);
    }

    &:hover > .page-button-edit-icon {
      @apply block;
    }
  }
</style>
