<script lang="ts">
  import { Card, Dialog, Divider, Modal, Popover, TextField } from 'attractions';
  import { PopoverPositions } from 'attractions/popover';
  import { HelpCircleIcon } from 'svelte-feather-icons';
  import { Svroller } from '../lib/Scrollbar';
  import type { Variable } from '../typings';
  import VariableItem from './VariableItem.svelte';

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
</script>

<Modal bind:open={visible} let:closeCallback>
  <Dialog
    title="Variables"
    class="w-[90vw] h-[90vh] min-w-sm flex flex-col"
    titleClass="justify-start items-center"
    {closeCallback}
  >
    <svelte:fragment slot="title-icon">
      <Popover
        popoverClass="!left-0 !bottom-[-5px] !transform !translate-x-[-2rem] !translate-y-full"
        position={PopoverPositions.BOTTOM}
      >
        <div class="flex cursor-help">
          <HelpCircleIcon size="1x" />
        </div>
        <Card class="w-90vw" slot="popover-content">
          <div class="text-sm text-black">
            <div>Variable-Name:</div>
            <ul class="list-disc list-inside">
              <li>case insensitive</li>
              <li>only contain word characters, i.e. [0-9a-zA-Z_]</li>
              <li>not begin/end with an underscore</li>
            </ul>
            <br />
            <div>Variable-Value:</div>
            <ul class="list-disc list-inside">
              <li>valid JSON value, e.g. string should be wrapped with quotes</li>
            </ul>
            <br />
            <div>
              Use Variable 'VAR' in editor as '<span class="px-[1px]">_</span><span class="px-[1px]">_</span>VAR<span
                class="px-[1px]">_</span
              ><span class="px-[1px]">_</span>'
            </div>
          </div>
        </Card>
      </Popover>
    </svelte:fragment>

    <div class="flex items-center justify-center pb-1">
      <TextField class="flex-grow-[1]" placeholder="name" />
      <span class="text-2xl font-bold mx-0.5">=</span>
      <TextField class="flex-grow-[3]" placeholder="value" />
    </div>

    <Divider class="!my-4" />

    <Svroller
      wrapperClass="flex-1 pr-[12px] mr-[-12px] pl-[2em] ml-[-2em]"
      viewportClass="pl-[2em] ml-[-2em]"
      contentClass=""
      width="auto"
    >
      {#each variables as variable, index (index)}
        <VariableItem bind:variable />
      {/each}
    </Svroller>
  </Dialog>

  <Modal>
    <Dialog />
  </Modal>
</Modal>
