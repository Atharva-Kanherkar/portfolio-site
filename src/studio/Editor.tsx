import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
import type { EditorView } from '@tiptap/pm/view';
import { buildExtensions } from './editor/extensions';
import { serializeMarkdown } from './editor/markdown';
import { FrontmatterForm } from './frontmatter/FrontmatterForm';
import { BubbleAI } from './editor/BubbleAI';
import { ImagePrompt } from './editor/ImagePrompt';
import { ChatPanel } from './chat/ChatPanel';
import { emptyFrontmatter, type Frontmatter } from '@studio/types';
import 'katex/dist/katex.min.css';
import 'tippy.js/dist/tippy.css';
import './editor/editor.css';

interface Props {
  slug: string;
  initialMarkdown: string;
  initialFrontmatter: Frontmatter;
  draftId?: string;
  publishSlug?: string;
  initialPubDate?: string;
}

export default function Editor({
  slug,
  initialMarkdown,
  initialFrontmatter,
  draftId,
  publishSlug,
  initialPubDate,
}: Props) {
  const [frontmatter, setFrontmatter] = useState<Frontmatter>(initialFrontmatter ?? emptyFrontmatter());
  const [status, setStatus] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

  const frontmatterRef = useRef(frontmatter);
  frontmatterRef.current = frontmatter;
  const draftIdRef = useRef<string | undefined>(draftId);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRef = useRef<() => void>(() => {});
  const handleFileRef = useRef<(file: File) => void>(() => {});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: buildExtensions(),
    content: initialMarkdown || '',
    contentType: 'markdown',
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'studio-prose', spellcheck: 'true' },
      handlePaste: (_view: EditorView, event: ClipboardEvent) => {
        const file = event.clipboardData?.files?.[0];
        if (file && file.type.startsWith('image/')) {
          handleFileRef.current(file);
          return true;
        }
        return false;
      },
      handleDrop: (_view: EditorView, event: DragEvent) => {
        const file = event.dataTransfer?.files?.[0];
        if (file && file.type.startsWith('image/')) {
          event.preventDefault();
          handleFileRef.current(file);
          return true;
        }
        return false;
      },
    },
    onUpdate: () => scheduleRef.current(),
  });

  useEffect(() => {
    if (import.meta.env.DEV && editor) {
      (window as unknown as { __editor?: unknown }).__editor = editor;
    }
  }, [editor]);

  const saveDraft = useCallback(async () => {
    if (!editor) return;
    const markdown = serializeMarkdown(editor);
    if (!frontmatterRef.current.title.trim() && !markdown.trim()) {
      setStatus(''); // nothing to save yet
      return;
    }
    try {
      const res = await fetch('/api/studio/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draftIdRef.current,
          frontmatter: frontmatterRef.current,
          markdown,
          publishedSlug: publishSlug,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id?: string };
        if (data.id) draftIdRef.current = data.id;
        setStatus('Saved');
      }
    } catch {
      /* offline — keep editing */
    }
  }, [editor, publishSlug]);

  const scheduleSave = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setStatus('Saving…');
    saveTimer.current = setTimeout(() => void saveDraft(), 1500);
  }, [saveDraft]);
  scheduleRef.current = scheduleSave;

  // Autosave on frontmatter edits too (skip the initial mount).
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) scheduleSave();
    else mounted.current = true;
  }, [frontmatter, scheduleSave]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!editor) return;
      const form = new FormData();
      form.append('file', file);
      setStatus('Uploading image…');
      try {
        const res = await fetch('/api/studio/upload', { method: 'POST', body: form });
        const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
        if (res.ok && data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
          setStatus('');
        } else {
          setStatus(data.error ?? 'Upload failed.');
        }
      } catch {
        setStatus('Upload failed.');
      }
    },
    [editor],
  );
  handleFileRef.current = handleFile;

  useEffect(() => {
    const onUpload = () => fileInputRef.current?.click();
    const onAiImage = () => setImageOpen(true);
    window.addEventListener('studio:upload', onUpload);
    window.addEventListener('studio:ai-image', onAiImage);
    return () => {
      window.removeEventListener('studio:upload', onUpload);
      window.removeEventListener('studio:ai-image', onAiImage);
    };
  }, []);

  const onPublish = useCallback(async () => {
    if (!editor) return;
    const markdown = serializeMarkdown(editor);
    if (!frontmatter.title.trim()) {
      setStatus('Add a title before publishing.');
      return;
    }
    setStatus('Publishing…');
    try {
      const res = await fetch('/api/studio/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frontmatter, markdown, slug: publishSlug, pubDate: initialPubDate }),
      });
      const data = (await res.json().catch(() => ({}))) as { slug?: string; error?: string };
      setStatus(res.ok ? `Published "${data.slug}" — live in ~1–2 min.` : data.error ?? 'Publish failed.');
    } catch {
      setStatus('Publish failed.');
    }
  }, [editor, frontmatter, publishSlug, initialPubDate]);

  return (
    <div className={`studio${chatOpen ? ' studio--chat' : ''}`}>
      <header className="studio__bar">
        <a className="studio__back" href="/studio">← Studio</a>
        <span className="studio__status" role="status">{aiBusy ? 'AI writing…' : status}</span>
        <button className="studio__chat-toggle" type="button" onClick={() => setChatOpen((o) => !o)}>
          {chatOpen ? 'Hide chat' : '✦ Chat'}
        </button>
        <button className="studio__publish" type="button" onClick={onPublish}>Publish</button>
      </header>

      <div className="studio__body">
        <main className="studio__main">
          <FrontmatterForm value={frontmatter} onChange={setFrontmatter} />
          {editor && <BubbleAI editor={editor} onBusy={setAiBusy} />}
          {editor && (
            <DragHandle editor={editor} className="drag-handle">
              <span aria-hidden="true">⠿</span>
            </DragHandle>
          )}
          <EditorContent editor={editor} />
        </main>

        {chatOpen && editor && <ChatPanel editor={editor} onClose={() => setChatOpen(false)} />}
      </div>

      {imageOpen && editor && <ImagePrompt editor={editor} onClose={() => setImageOpen(false)} />}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
