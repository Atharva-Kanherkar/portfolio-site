export type CrashoutRow = {
  model: string;
  tool: string;
  color: string;
  total: number;
  n: number;
  claudeN: number;
  codexN: number;
  rage: number;
  rate: number;
};

export type CrashoutReceipt = {
  quote: string;
  model: string;
  tool: string;
  color: string;
  tag: string;
};

export type CrashoutTake = {
  color: string;
  lead: string;
  body: string;
};

export const CRASHOUT_TITLE = 'The CrashoutBench';
export const CRASHOUT_EYEBROW = "The one benchmark where I'm the one being tested";
export const CRASHOUT_DESCRIPTION =
  "A leaderboard of me getting absolutely cooked by AI models until I start typing like I'm having a public breakdown. 11,787 messages read, the 88 genuine crashouts pulled out, models ranked by how fast they made it happen.";

export const CRASHOUT_FLAGGED = 88;
export const CRASHOUT_AGREED = 81;
export const CRASHOUT_TOOLS = 3;
export const CRASHOUT_REGRETS = 0;

export const CRASHOUT_ROWS: CrashoutRow[] = [
  { model: 'gpt-5.x', tool: 'Codex', color: '#10a37f', total: 889, n: 12, claudeN: 13, codexN: 11, rage: 2, rate: 13.5 },
  { model: 'claude-opus-4-8', tool: 'Claude Code', color: '#d97e55', total: 7143, n: 64.5, claudeN: 67, codexN: 62, rage: 4, rate: 9.0 },
  { model: 'claude-sonnet-4-6', tool: 'Claude Code', color: '#4a8fe2', total: 629, n: 3, claudeN: 3, codexN: 3, rage: 0, rate: 4.8 },
  { model: 'claude-fable-5', tool: 'Claude Code', color: '#8a6fc8', total: 846, n: 4, claudeN: 4, codexN: 4, rage: 0, rate: 4.7 },
  { model: 'claude-haiku-4-5', tool: 'Claude Code', color: '#b0578d', total: 2280, n: 1, claudeN: 1, codexN: 1, rage: 0, rate: 0.4 },
];

export const CRASHOUT_RECEIPTS: CrashoutReceipt[] = [
  { quote: 'What the fuck man. Are you like really dumb? What effort would it have taken for you to crop those images and the music i told you too, push the gap longer, and render. are you like just a fucking lazy sick fuck?', model: 'claude-opus-4-8', tool: 'Claude Code', color: '#d97e55', tag: 'character assassination' },
  { quote: "its a fucking hobby project. why the fuck are you questioning me like yourte my fucking boss? just askewd the rimo part bcs maybe we could intergaste", model: 'gpt-5.x', tool: 'Codex', color: '#10a37f', tag: 'unhinged' },
  { quote: 'Really? Whatt the fck is this? there are still emojis. What inthe fuck is thius man', model: 'claude-opus-4-8', tool: 'Claude Code', color: '#d97e55', tag: 'emoji rage' },
  { quote: 'its been 9 mins what u doing ??', model: 'gpt-5.x', tool: 'Codex', color: '#10a37f', tag: 'the waiting' },
  { quote: 'Dont fucking school me. Tell me eqach last commit how latest they were and trrhat is your job.', model: 'claude-opus-4-8', tool: 'Claude Code', color: '#d97e55', tag: 'do your job' },
  { quote: 'So were thee fuck is my code?', model: 'claude-opus-4-8', tool: 'Claude Code', color: '#d97e55', tag: 'existential' },
  { quote: 'U added gradients agauin, That is so stpd. Waht theufck is the whole deisgn it looks liek absosltue clown show', model: 'claude-opus-4-8', tool: 'Claude Code', color: '#d97e55', tag: 'clown show' },
  { quote: 'Wtf is that color lmfao. it looks usper crigne and i cnat evene rerwad it', model: 'claude-fable-5', tool: 'Claude Code', color: '#8a6fc8', tag: 'design crimes' },
  { quote: 'You pushed without my permissions, andmain is failing right now. PLease fix it asap.', model: 'claude-opus-4-8', tool: 'Claude Code', color: '#d97e55', tag: 'betrayal' },
  { quote: 'please edit the PR. no commentrs. do not act like you are a fool', model: 'gpt-5.x', tool: 'Codex', color: '#10a37f', tag: 'condescension arc' },
  { quote: 'Just tell me how much time before each eprson pushed the develop branch you dumass.', model: 'claude-opus-4-8', tool: 'Claude Code', color: '#d97e55', tag: 'name-calling' },
  { quote: 'Can you not generate scripts better just use a subagent... fuzzy logic or matching wont result in semantic meanings', model: 'claude-haiku-4-5', tool: 'Claude Code', color: '#b0578d', tag: 'the one (1) time i stayed calm' },
];

export const CRASHOUT_TAKES: CrashoutTake[] = [
  {
    color: '#10a37f',
    lead: 'gpt-5.x is actually evil.',
    body: "Highest rage rate by a mile. That model doesn't even try to be helpful, it just exists to make me type in all caps like a fucking lunatic.",
  },
  {
    color: '#d97e55',
    lead: 'Opus has the highest body count',
    body: "because I keep going back like an idiot. Sixty-something times. That's not a model, that's my toxic ex.",
  },
  {
    color: '#b0578d',
    lead: 'Haiku is actually terrifying.',
    body: "2,280 messages and it only made me mildly annoyed once. Either it's perfect or it's studying me. I don't like it.",
  },
];

export const crashoutBoard = [...CRASHOUT_ROWS].sort((a, b) => b.rate - a.rate);
export const crashoutTotalReviewed = CRASHOUT_ROWS.reduce((sum, row) => sum + row.total, 0);

export const fmtCrashoutN = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export function crashoutMethodology(totalReviewed = crashoutTotalReviewed): string {
  return `Every JSONL transcript under Claude Code and Codex, plus Cursor's chat sessions, was parsed for messages I actually typed, each tagged with the model that answered. Twelve agents read all ${totalReviewed.toLocaleString()} of them and flagged genuine crashouts: real anger, swearing out of frustration, caps-lock shouting, or being fully done with the agent. Never a keyword hit. Then a second judge (Codex gpt-5.5) re-graded every flagged message blind, and the two scores were averaged per model. Ranked by crashouts per 1,000 messages, categorised by model across all three tools. Cursor contributed one usable message and zero crashouts, so, respect.`;
}
