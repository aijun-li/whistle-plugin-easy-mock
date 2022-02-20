<script lang="ts">
  import { JSONEditor } from 'svelte-jsoneditor';
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
  } from 'attractions';
  import { SnackbarPositions } from 'attractions/snackbar';
  import { Content, MockItem, MockType } from './typings';
  import MockCardList from './lib/MockCardList.svelte';
  import { saveRuleList, getRuleList } from './services';

  const DefaultData = '{}';
  const tabs = [
    { label: 'IDL', value: MockType.IDL },
    { label: 'HTTP', value: MockType.HTTP },
  ];

  let selectedType = MockType.IDL;
  let selectedItem: MockItem = {
    type: selectedType,
    pattern: '',
    data: '',
  };
  let content: Content = {
    text: '',
  };
  let editor;
  let toast;
  let newRulePattern = '';
  let newDialogVisible = false;

  let idlList: MockItem[] = [];
  let httpList: MockItem[] = [];

  $: selectIDL = selectedType === MockType.IDL;

  async function fetchRemoteRules() {
    const { idl, http } = await getRuleList();
    idlList = idl;
    httpList = http;
  }

  function showToast(msg: string, duration = 1500) {
    toast.showSnackbar({ props: { text: msg }, duration });
  }

  function onTabChange(event) {
    selectedItem = {
      type: event.detail.value,
      pattern: '',
      data: '',
    };
    content = {
      text: '',
    };
    setTimeout(() => {
      editor.expand();
    }, 0);
  }

  function onItemSelect() {
    content = {
      text: selectedItem.data,
    };
    setTimeout(() => {
      editor.expand();
    }, 0);
  }

  function onAddNewRule(closeModal) {
    const arr = selectIDL ? idlList : httpList;
    if (arr.some((item) => item.pattern === newRulePattern)) {
      showToast('Pattern already exists!');
      return;
    }
    const newMockItem = {
      type: selectedType,
      pattern: newRulePattern,
      data: DefaultData,
    };
    if (selectIDL) {
      idlList = [newMockItem, ...idlList];
    } else {
      httpList = [newMockItem, ...httpList];
    }
    newRulePattern = '';
    selectedItem = newMockItem;
    content = {
      text: newMockItem.data,
    };

    closeModal();
    setTimeout(() => {
      editor.expand();
      editor.focus();
    }, 100);
  }

  async function onSave() {
    const snapshot = editor.get();
    const arr = selectIDL ? [...idlList] : [...httpList];
    const idx = arr.findIndex((item) => item.pattern === selectedItem.pattern);
    const updateItem = arr.splice(idx, 1)[0];

    try {
      updateItem.data = validateJSON(snapshot);

      arr.splice(idx, 0, updateItem);

      if (selectIDL) {
        idlList = arr;
      } else {
        httpList = arr;
      }
      content = {
        text: updateItem.data,
      };

      await saveRuleList({
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
      await saveRuleList(
        selectIDL
          ? {
              idl: arr,
              http: httpList,
            }
          : {
              idl: idlList,
              http: arr,
            },
        true
      );
      if (selectIDL) {
        idlList = arr;
      } else {
        httpList = arr;
      }
      showToast('Deleted successfully!');
    } catch (e) {
      showToast(e.message);
    }
  }

  function validateJSON(snapshot: Content) {
    try {
      const json = snapshot.json ?? JSON.parse(snapshot.text);

      for (const key of Object.keys(json)) {
        if (key === '') {
          delete json[key];
        }
      }

      return JSON.stringify(json);
    } catch (e) {
      throw new Error('Invalid JSON format!');
    }
  }
</script>

{#await Promise.resolve()}
  <!-- {#await fetchRemoteRules()} -->
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
      <Button
        class="!rounded-none"
        disabled={!selectedItem.pattern}
        selected={false}
        on:click={onSave}
        rectangle
      >
        Save
      </Button>
      <Button
        class="!rounded-none"
        on:click={() => {
          newDialogVisible = true;
        }}
        rectangle
      >
        New
      </Button>
    </div>
    <div class="w-1/2 border-r p-8 overflow-auto">
      <H3 class="pl-10">
        {selectIDL ? 'Service Method' : 'URL Path'}</H3
      >
      <div class="w-14/15 mt-5">
        <MockCardList
          list={selectIDL ? idlList : httpList}
          bind:selectedItem
          on:select={onItemSelect}
          on:delete={onDelete}
        />
      </div>
    </div>
    <div class="flex-1 min-w-lg flex flex-col">
      <JSONEditor bind:content bind:this={editor} mainMenuBar={true} />
    </div>
  </div>

  <!-- modal for adding new rule -->
  <Modal
    bind:open={newDialogVisible}
    noClickaway
    let:closeCallback={closeModal}
  >
    <Dialog title={`Add New ${selectedType.toUpperCase()} Rule`} danger>
      <FormField name={selectIDL ? 'Service Method' : 'URL Path'} required>
        <TextField
          bind:value={newRulePattern}
          on:keydown={(e) => {
            if (e.detail.nativeEvent.code === 'Enter') {
              onAddNewRule(closeModal);
            }
          }}
          autofocus={true}
        />
      </FormField>
      <div class="flex justify-around">
        <Button
          on:click={() => {
            newRulePattern = '';
            closeModal();
          }}
        >
          Cancel
        </Button>
        <Button
          disabled={!newRulePattern}
          on:click={() => onAddNewRule(closeModal)}
        >
          Confirm
        </Button>
      </div>
    </Dialog>
  </Modal>

  <!-- Toast -->
  <SnackbarContainer
    bind:this={toast}
    position={SnackbarPositions.TOP_MIDDLE}
  />
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
