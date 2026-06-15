import { useState } from 'react';
import type { Editor } from '@tiptap/core';

export function ImagePrompt({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    const text = prompt.trim();
    if (!text || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/studio/ai/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; alt?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Generation failed.');
        return;
      }
      editor.chain().focus().setImage({ src: data.url, alt: data.alt ?? text }).run();
      onClose();
    } catch {
      setError('Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Generate image">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__card">
        <h2 className="modal__title">Generate an image</h2>
        <textarea
          className="modal__input"
          rows={3}
          autoFocus
          placeholder="Describe the image…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        {error && <p className="modal__error">{error}</p>}
        <div className="modal__actions">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="button" className="modal__primary" onClick={generate} disabled={loading}>
            {loading ? 'Generating… (~20s)' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
}
