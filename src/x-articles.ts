import type { WritingSectionId } from './consts';

// Titles and dates from the Articles tab at x.com/attharrva15/articles.
// X uses the same ID for an article and its accompanying post.
export const X_ARTICLES: {
  id: string;
  title: string;
  date: string;
  section: WritingSectionId;
}[] = [
  {
    id: '2088234380724690972',
    title: "Your LLM proxy's health check is handing out your API keys",
    date: '2026-08-14',
    section: 'ai',
  },
  {
    id: '2087817964783649154',
    title: 'You are (probably) wrong about open Intelligence.',
    date: '2026-08-13',
    section: 'ai',
  },
  {
    id: '2072722732366934225',
    title: "I read every AI-agent transcript on my laptop. Claude and Codex don't talk alike.",
    date: '2026-07-03',
    section: 'ai',
  },
  {
    id: '2071547410929860918',
    title: 'The Next Bottleneck Is Data That Actually Improves Models at Scale',
    date: '2026-06-29',
    section: 'ai',
  },
  {
    id: '2067888789419380950',
    title: 'The Next Unit of AI Evaluation Is the Session, not Benchmarks.',
    date: '2026-06-19',
    section: 'ai',
  },
  {
    id: '2066125408903561563',
    title: 'India Built the Bomb Under Pressure. Can It Build AI Under Dependency?',
    date: '2026-06-14',
    section: 'ai',
  },
  {
    id: '2060825741126979894',
    title: 'Ram as a Man, Not a Symbol: What the Ramayan Teaches Urban India in 2026',
    date: '2026-05-31',
    section: 'vedanta',
  },
  {
    id: '2059001263208202502',
    title: 'I Fingerprinted How AI Agents Cheat. The Algorithm Told Me Something Nobody Expected',
    date: '2026-05-26',
    section: 'ai',
  },
  {
    id: '2055205833697546285',
    title: 'AI made me a worse engineer.',
    date: '2026-05-15',
    section: 'ai',
  },
  {
    id: '2054292678117036442',
    title: "We've always wondered if we're in a simulation. I made one and asked three AIs to live in it.",
    date: '2026-05-13',
    section: 'vedanta',
  },
  {
    id: '2048821128744038595',
    title: 'How building software is harder than ever',
    date: '2026-04-28',
    section: 'ai',
  },
  {
    id: '2047762979790442922',
    title: 'Everyone’s Mad at Garry Tan. They’re Missing the Point.',
    date: '2026-04-25',
    section: 'ai',
  },
];

export function xArticleUrl(id: string): string {
  return `https://x.com/attharrva15/article/${id}`;
}
