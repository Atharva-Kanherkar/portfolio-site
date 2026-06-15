export type TransformMode =
  | 'improve'
  | 'expand'
  | 'shorten'
  | 'grammar'
  | 'tone'
  | 'continue'
  | 'autocomplete';

const BASE =
  'You are a writing assistant embedded in a personal blog editor. ' +
  'Output ONLY the resulting text — no preamble, no surrounding quotes, no explanation. ' +
  'Preserve the author’s voice and any markdown formatting already present.';

export function transformSystemPrompt(mode: TransformMode, tone?: string): string {
  switch (mode) {
    case 'improve':
      return `${BASE} Rewrite the text to be clearer and more engaging without changing its meaning.`;
    case 'expand':
      return `${BASE} Expand the text with more detail and supporting points, in the same voice.`;
    case 'shorten':
      return `${BASE} Make the text more concise while keeping its key points.`;
    case 'grammar':
      return `${BASE} Fix grammar, spelling, and punctuation only. Keep wording and meaning otherwise unchanged.`;
    case 'tone':
      return `${BASE} Rewrite the text in a ${tone ?? 'clear, natural'} tone.`;
    case 'continue':
      return `${BASE} Continue writing naturally from where the text leaves off (one short paragraph).`;
    case 'autocomplete':
      return `${BASE} Continue the text with a short, natural continuation — at most one sentence.`;
  }
}
