<script lang="ts" context="module">
  export function formatJSON(json: string) {
    return prettier.format(json, {
      parser: 'json',
      plugins: [jsonParser],
    });
  }
</script>

<script lang="ts">
  import ace, { Ace } from 'ace-builds';
  import 'ace-builds/src-min-noconflict/mode-json5';
  import 'ace-builds/src-min-noconflict/ext-searchbox';
  import { showErrorMarker } from 'ace-builds/src-min-noconflict/ext-error_marker';
  import { onMount, tick } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import prettier from 'prettier';
  import jsonParser from 'prettier/esm/parser-babel.mjs';
  import JSON5 from 'json5';

  export let readOnly = false;

  const dispatch = createEventDispatcher();

  let editor: Ace.Editor;

  $: if (editor) {
    editor.setReadOnly(readOnly);
    if (readOnly) {
      editor.setValue('');
    }
  }

  onMount(() => {
    editor = ace.edit('json-5-editor', {
      mode: 'ace/mode/json5',
      fontSize: 15,
      wrap: true,
      showPrintMargin: false,
      newLineMode: 'unix',
      tabSize: 2,
    });

    editor.on('paste', async () => {
      await tick();
      format();
    });

    editor.on('blur', () => {
      dispatch('blur');
    });

    editor.commands.addCommands([
      {
        name: 'Save',
        bindKey: { win: 'Ctrl-S', mac: 'Command-S' },
        exec: () => {
          try {
            format();
          } catch {}
          dispatch('save');
        },
      },
      {
        name: 'Format',
        bindKey: { win: 'Shift-Alt-F', mac: 'Shift-Command-F' },
        exec: () => {
          try {
            format();
          } catch {}
        },
      },
      {
        name: 'Zoom Out',
        bindKey: { win: 'Ctrl--', mac: 'Command--' },
        exec: () => {
          const oldFontSize = Number(editor.getFontSize());
          if (oldFontSize > 12) {
            editor.setFontSize((oldFontSize - 1) as unknown as string);
          }
        },
      },
      {
        name: 'Zoom In',
        bindKey: { win: 'Ctrl-=', mac: 'Command-=' },
        exec: () => {
          const oldFontSize = Number(editor.getFontSize());
          if (oldFontSize < 30) {
            editor.setFontSize((oldFontSize + 1) as unknown as string);
          }
        },
      },
      {
        name: 'Insert New Line',
        bindKey: { win: 'Ctrl-Enter', mac: 'Command-Enter' },
        exec: () => {
          editor.navigateDown();
          editor.navigateLineStart();
          editor.splitLine();
        },
      },
    ]);
  });

  function validateJSON(json: string) {
    JSON5.parse(json);
  }

  export function format() {
    try {
      const content = editor.getValue();
      validateJSON(content);
      editor.setValue(formatJSON(content), 1);
      return editor.getValue();
    } catch (error) {
      if (error.message.startsWith('JSON5:')) {
        editor.session.setAnnotations([
          {
            row: error.lineNumber - 1,
            column: error.columnNumber - 1,
            text: error.message,
            type: 'error',
          },
        ]);
        showErrorMarker(editor, 1);
      }
      throw error;
    }
  }

  export function focus() {
    editor.focus();
  }

  export function get() {
    return editor.getValue();
  }

  export function set(content: string) {
    editor.setValue(content, 1);
  }

  export function moveCursorTo(row: number, col: number) {
    editor.moveCursorTo(row, col);
  }
</script>

<div
  id="json-5-editor"
  class="w-full h-full"
  on:keydown={(event) => {
    // avoid calling save page when error occurs
    if (event.code === 'KeyS' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
    }
  }}
/>

<style lang="scss">
  :global {
    #json-5-editor {
      .ace_gutter {
        background-color: #f5f2fb;
        color: #4300b0;
      }
      .ace_gutter-active-line {
        background-color: #e8e0f5;
        color: #4300b0;
      }
      .ace_active-line {
        background-color: rgba(245, 242, 251, 0.8);
      }
      .ace_cursor {
        color: #4300b0;
      }
    }
  }
</style>
