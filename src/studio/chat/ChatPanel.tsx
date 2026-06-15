import { useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { Editor } from '@tiptap/core';

function textOf(message: { parts: Array<{ type: string; text?: string }> }): string {
  return message.parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text ?? '')
    .join('');
}

export function ChatPanel({ editor, onClose }: { editor: Editor; onClose: () => void }) {
  const [input, setInput] = useState('');
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/studio/ai/chat' }),
  });

  const send = () => {
    const text = input.trim();
    if (!text || status === 'streaming') return;
    sendMessage({ text }, { body: { docContext: editor.getText() } });
    setInput('');
  };

  const insert = (markdown: string) => {
    editor.chain().focus().insertContent(markdown, { contentType: 'markdown' } as never).run();
  };

  return (
    <aside className="chat-panel">
      <header className="chat-panel__head">
        <span>Writing chat</span>
        <button type="button" onClick={onClose} aria-label="Close chat">×</button>
      </header>

      <div className="chat-panel__messages">
        {messages.length === 0 && (
          <p className="chat-panel__hint">Ask for an outline, a rewrite, a title — it can see your draft.</p>
        )}
        {messages.map((m) => {
          const body = textOf(m as never);
          return (
            <div key={m.id} className={`chat-panel__msg chat-panel__msg--${m.role}`}>
              <p>{body}</p>
              {m.role === 'assistant' && body && (
                <button type="button" className="chat-panel__insert" onClick={() => insert(body)}>
                  Insert into editor
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="chat-panel__composer">
        <textarea
          value={input}
          rows={2}
          placeholder="Ask the assistant…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button type="button" onClick={send} disabled={status === 'streaming'}>
          {status === 'streaming' ? '…' : 'Send'}
        </button>
      </div>
    </aside>
  );
}
