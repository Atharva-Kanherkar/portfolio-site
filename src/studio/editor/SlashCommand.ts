import { Extension, type Editor, type Range } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import tippy, { type Instance } from 'tippy.js';
import { SlashMenu, type SlashItem, type SlashMenuRef } from './SlashMenu';

const insert = (editor: Editor, range: Range) => editor.chain().focus().deleteRange(range);

export const SLASH_ITEMS: SlashItem[] = [
  { title: 'Heading 1', hint: 'Large section title', run: ({ editor, range }) => insert(editor, range).setNode('heading', { level: 1 }).run() },
  { title: 'Heading 2', hint: 'Medium section title', run: ({ editor, range }) => insert(editor, range).setNode('heading', { level: 2 }).run() },
  { title: 'Heading 3', hint: 'Small section title', run: ({ editor, range }) => insert(editor, range).setNode('heading', { level: 3 }).run() },
  { title: 'Bullet list', hint: 'Unordered list', run: ({ editor, range }) => insert(editor, range).toggleBulletList().run() },
  { title: 'Numbered list', hint: 'Ordered list', run: ({ editor, range }) => insert(editor, range).toggleOrderedList().run() },
  { title: 'To-do list', hint: 'Checklist', run: ({ editor, range }) => insert(editor, range).toggleTaskList().run() },
  { title: 'Quote', hint: 'Blockquote', run: ({ editor, range }) => insert(editor, range).toggleBlockquote().run() },
  { title: 'Code block', hint: 'Monospace code', run: ({ editor, range }) => insert(editor, range).toggleCodeBlock().run() },
  { title: 'Divider', hint: 'Horizontal rule', run: ({ editor, range }) => insert(editor, range).setHorizontalRule().run() },
  { title: 'Table', hint: '3×3 with header', run: ({ editor, range }) => insert(editor, range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
  { title: 'Math block', hint: 'Display equation', run: ({ editor, range }) => insert(editor, range).insertContent({ type: 'blockMath', attrs: { latex: '' } }).run() },
  {
    title: 'Image (upload)',
    hint: 'Upload from your device',
    run: ({ editor, range }) => {
      insert(editor, range).run();
      window.dispatchEvent(new CustomEvent('studio:upload'));
    },
  },
  {
    title: 'Generate image (AI)',
    hint: 'Create with gpt-image-2',
    run: ({ editor, range }) => {
      insert(editor, range).run();
      window.dispatchEvent(new CustomEvent('studio:ai-image'));
    },
  },
];

export const SlashCommand = Extension.create({
  name: 'slashCommand',
  addProseMirrorPlugins() {
    return [
      Suggestion<SlashItem>({
        editor: this.editor,
        char: '/',
        startOfLine: false,
        items: ({ query }) =>
          SLASH_ITEMS.filter((i) => i.title.toLowerCase().includes(query.toLowerCase())).slice(0, 10),
        command: ({ editor, range, props }) => props.run({ editor, range }),
        render: () => {
          let component: ReactRenderer<SlashMenuRef> | null = null;
          let popup: Instance[] | null = null;
          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashMenu, { props, editor: props.editor });
              if (!props.clientRect) return;
              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              });
            },
            onUpdate: (props) => {
              component?.updateProps(props);
              if (props.clientRect && popup) {
                popup[0].setProps({ getReferenceClientRect: props.clientRect as () => DOMRect });
              }
            },
            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                popup?.[0].hide();
                return true;
              }
              return component?.ref?.onKeyDown(props.event) ?? false;
            },
            onExit: () => {
              popup?.[0].destroy();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});
