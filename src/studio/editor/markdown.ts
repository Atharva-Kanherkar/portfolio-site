import type { Editor } from '@tiptap/core';

/** Serialize the editor to clean markdown (body only — no frontmatter fence). */
export function serializeMarkdown(editor: Editor): string {
  return editor.getMarkdown().trim();
}

/** Replace the editor content with markdown (used when loading a draft/post). */
export function setMarkdown(editor: Editor, markdown: string): void {
  editor.commands.setContent(markdown, { contentType: 'markdown' } as never);
}
