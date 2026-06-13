import DOMPurify from 'dompurify';
import { marked } from 'marked';

const renderer = new marked.Renderer();

renderer.link = ({ href, title, tokens }) => {
  const text = marked.parser(tokens);
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
};

marked.setOptions({
  gfm: true,
  breaks: true,
  renderer,
});

export function renderChatMarkdown(content: string): string {
  const html = marked.parse(content, { async: false }) as string;

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target', 'rel'],
  });
}
