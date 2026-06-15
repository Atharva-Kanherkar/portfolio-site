import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Image } from '@tiptap/extension-image';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { InlineMath, BlockMath } from '@tiptap/extension-mathematics';
import { SlashCommand } from './SlashCommand';
import { GhostText } from './GhostText';

// Make the math nodes round-trip to $…$ / $$…$$ in markdown. The @tiptap/markdown
// manager reads `renderMarkdown` off the extension config when serializing.
const InlineMathMd = InlineMath.extend({
  renderMarkdown(node: { attrs: { latex?: string } }) {
    return `$${node.attrs.latex ?? ''}$`;
  },
});

const BlockMathMd = BlockMath.extend({
  renderMarkdown(node: { attrs: { latex?: string } }) {
    return `$$\n${node.attrs.latex ?? ''}\n$$`;
  },
});

export function buildExtensions() {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      link: { openOnClick: false, autolink: true },
    }),
    Image.configure({ inline: false, allowBase64: false }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    TaskList,
    TaskItem.configure({ nested: true }),
    InlineMathMd,
    BlockMathMd,
    Placeholder.configure({
      placeholder: ({ node }: { node: { type: { name: string } } }) =>
        node.type.name === 'heading' ? 'Heading…' : "Write, or press '/' for commands…",
    }),
    SlashCommand,
    GhostText,
    Markdown.configure({}),
  ];
}
