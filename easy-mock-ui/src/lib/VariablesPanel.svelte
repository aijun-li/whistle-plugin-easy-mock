<script lang="ts">
  import { Dialog, Divider, Modal, TextField } from 'attractions';
  import { DollarSignIcon } from 'svelte-feather-icons';
  import type { Variable } from '../typings';
  import { Svroller } from '../lib/Scrollbar';
  import DeleteIcon from './DeleteIcon.svelte';

  export let visible = false;
  export let variables = [
    { name: 'x', value: '1' },
    { name: 'y', value: '2' },
    { name: 'z', value: '3' },
    { name: 'x', value: '1' },
    { name: 'y', value: '2' },
    { name: 'z', value: '3' },
    { name: 'x', value: '1' },
    { name: 'y', value: '2' },
    { name: 'z', value: '3' },
    { name: 'x', value: '1' },
    { name: 'y', value: '2' },
    { name: 'z', value: '3' },
    { name: 'x', value: '1' },
    { name: 'y', value: '2' },
    { name: 'z', value: '3' },
  ] as Variable[];

  let errorIndex;
  let errorMsg;
</script>

<Modal bind:open={visible} let:closeCallback>
  <Dialog
    title="Variables"
    class="w-[90vw] h-[90vh] min-w-sm flex flex-col"
    titleClass="justify-start items-center"
    {closeCallback}
  >
    <svelte:fragment slot="title-icon">
      <DollarSignIcon size="1x" />
    </svelte:fragment>

    <div class="flex items-center justify-center pb-1">
      <TextField class="flex-grow-[1]" placeholder="name" />
      <span class="text-2xl font-bold mx-2">=</span>
      <TextField class="flex-grow-[3]" placeholder="value" />
    </div>

    <Divider class="!my-4" />

    <Svroller wrapperClass="flex-1 pr-[12px] mr-[-12px]" width="auto">
      {#each variables as variable, index (index)}
        <div class="flex items-center justify-center pb-1 not-first:mt-4 relative">
          <TextField
            bind:value={variable.name}
            class="flex-grow-[1] relative"
            errorClass="absolute bottom-0 left-0 transform translate-y-full truncate w-full"
            placeholder="name"
            on:change={(e) => {
              console.log(e.detail.value);
              console.log(variables);
              errorIndex = index;
              errorMsg = 'test error';
            }}
            error={errorIndex === index && errorMsg}
          />
          <span class="text-2xl font-bold mx-2">=</span>
          <TextField bind:value={variable.value} class="flex-grow-[3]" placeholder="value" />
          <!-- <DeleteIcon /> -->
        </div>
      {/each}
    </Svroller>
  </Dialog>
</Modal>
