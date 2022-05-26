<script lang="ts">
  import { onMount } from 'svelte';
  import * as monaco from 'monaco-editor';
  import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
  import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
  // import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker();
      }
      // if (label === 'typescript' || label === 'javascript') {
      //   return new tsWorker()
      // }
      return new editorWorker();
    },
  };

  let editorContainer;
  let editor: monaco.editor.IStandaloneCodeEditor;

  onMount(() => {
    editor = monaco.editor.create(editorContainer, {
      value: `{"code": 0, "msg": "123"}`,
      language: 'json',
      tabSize: 2,
      formatOnPaste: true,
      formatOnType: true,
      comments: {
        ignoreEmptyLines: true,
        insertSpace: true,
      },
    });

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      allowComments: true,
      trailingCommas: 'ignore',
    });
  });

  function format() {
    editor.getAction('editor.action.formatDocument').run();
  }

  function getValue() {
    console.log(editor.getValue());
    console.log(monaco.languages.getLanguages());
  }
</script>

<button class="m-5 border" on:click={format}>Format</button>
<button class="m-5 border" on:click={getValue}>Get Value</button>
<div bind:this={editorContainer} class="h-screen" />
