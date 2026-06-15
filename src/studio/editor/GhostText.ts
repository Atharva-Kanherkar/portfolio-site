import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet, type EditorView } from '@tiptap/pm/view';

const key = new PluginKey('ghostText');

/** Tab-to-accept inline autocomplete. Fires on idle at the end of a non-trivial paragraph. */
export const GhostText = Extension.create({
  name: 'ghostText',
  addProseMirrorPlugins() {
    let suggestion = '';
    let timer: ReturnType<typeof setTimeout> | null = null;
    let controller: AbortController | null = null;

    const redraw = (view: EditorView) => view.dispatch(view.state.tr.setMeta(key, true));

    const request = (view: EditorView) => {
      const { state } = view;
      const sel = state.selection;
      if (!sel.empty) return;
      const $from = sel.$from;
      if ($from.parentOffset < $from.parent.content.size) return; // only at block end
      if ($from.parent.textContent.trim().length < 12) return;
      const context = state.doc.textBetween(Math.max(0, sel.from - 1200), sel.from, '\n');
      controller?.abort();
      controller = new AbortController();
      fetch('/api/studio/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'autocomplete', context }),
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok || !res.body) return;
          const text = (await res.text()).trim();
          if (text && view.state.selection.from === sel.from) {
            suggestion = text;
            redraw(view);
          }
        })
        .catch(() => {});
    };

    return [
      new Plugin({
        key,
        props: {
          decorations(state) {
            if (!suggestion) return null;
            const widget = document.createElement('span');
            widget.className = 'ghost-text';
            widget.textContent = suggestion;
            return DecorationSet.create(state.doc, [Decoration.widget(state.selection.from, widget, { side: 1 })]);
          },
          handleKeyDown(view, event) {
            if (event.key === 'Tab' && suggestion) {
              event.preventDefault();
              const text = suggestion;
              suggestion = '';
              view.dispatch(view.state.tr.insertText(text));
              return true;
            }
            if (suggestion && event.key.length === 1) {
              suggestion = '';
              redraw(view);
            }
            return false;
          },
        },
        view() {
          return {
            update(view, prev) {
              const changed = !view.state.doc.eq(prev.doc) || !view.state.selection.eq(prev.selection);
              if (!changed) return;
              if (suggestion) {
                suggestion = '';
                redraw(view);
              }
              if (timer) clearTimeout(timer);
              timer = setTimeout(() => request(view), 1400);
            },
            destroy() {
              if (timer) clearTimeout(timer);
              controller?.abort();
            },
          };
        },
      }),
    ];
  },
});
