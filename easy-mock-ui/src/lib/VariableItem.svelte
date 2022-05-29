<script lang="ts">
  import { TextField } from 'attractions';
  import type { Variable } from '../typings';

  export let variable: Variable;
</script>

<div class="variable-item flex items-center justify-center pb-1 not-first:mt-4 relative">
  <TextField
    bind:value={variable.name}
    class="flex-grow-[1] relative"
    inputClass="!h-10"
    errorClass="absolute bottom-0 left-0 transform translate-y-full truncate w-full"
    placeholder="name"
  />
  <span class="text-2xl font-bold mx-0.5">=</span>
  <TextField
    bind:value={variable.value}
    class="flex-grow-[3] relative"
    inputClass="!h-10"
    errorClass="absolute bottom-0 left-0 transform translate-y-full truncate w-full"
    placeholder="value"
  />
</div>
