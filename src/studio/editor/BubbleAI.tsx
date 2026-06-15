import { useState } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import type { Editor } from '@tiptap/core';
import type { TransformMode } from '@studio/ai-prompts';

const AI_ACTIONS: { mode: TransformMode; label: string }[] = [
  { mode: 'improve', label: 'Improve' },
  { mode: 'expand', label: 'Expand' },
  { mode: 'shorten', label: 'Shorten' },
  { mode: 'grammar', label: 'Fix grammar' },
  { mode: 'continue', label: 'Continue' },
];

export function BubbleAI({ editor, onBusy }: { editor: Editor; onBusy?: (busy: boolean) => void }) {
  const [aiMode, setAiMode] = useState(false);

  async function runTransform(mode: TransformMode) {
    setAiMode(false);
    const { from, to } = editor.state.selection;
    const selection = editor.state.doc.textBetween(from, to, '\n');
    if (!selection.trim() && mode !== 'continue') return;
    const context = editor.getText().slice(Math.max(0, from - 1500), from);

    onBusy?.(true);
    try {
      const res = await fetch('/api/studio/ai/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, selection, context }),
      });
      if (!res.ok || !res.body) return;

      if (mode !== 'continue') editor.chain().focus().deleteRange({ from, to }).run();
      let pos = mode === 'continue' ? to : from;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        editor.chain().insertContentAt(pos, chunk).run();
        pos += chunk.length;
      }
    } catch {
      /* surfaced via status elsewhere */
    } finally {
      onBusy?.(false);
    }
  }

  return (
    <BubbleMenu editor={editor} className="bubble">
      {aiMode ? (
        <>
          {AI_ACTIONS.map((a) => (
            <button key={a.mode} type="button" className="bubble__ai-item" onClick={() => runTransform(a.mode)}>
              {a.label}
            </button>
          ))}
          <button type="button" onClick={() => setAiMode(false)} aria-label="Back">×</button>
        </>
      ) : (
        <>
          <button type="button" aria-label="Bold" onClick={() => editor.chain().focus().toggleBold().run()}>
            <b>B</b>
          </button>
          <button type="button" aria-label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()}>
            <i>i</i>
          </button>
          <button type="button" aria-label="Inline code" onClick={() => editor.chain().focus().toggleCode().run()}>
            {'</>'}
          </button>
          <span className="bubble__sep" aria-hidden="true" />
          <button type="button" className="bubble__ask" onClick={() => setAiMode(true)}>
            ✦ Ask AI
          </button>
        </>
      )}
    </BubbleMenu>
  );
}
