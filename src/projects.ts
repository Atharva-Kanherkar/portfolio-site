export type Project = {
  name: string;
  description: string;
  github?: string;
  live?: string;
};

export const PROJECTS: Project[] = [
  {
    name: 'AgentClash',
    description:
      'Open-source eval platform for AI agents. Same workload, captured evidence, scorecards, and CI regression gates.',
    github: 'https://github.com/agentclash/agentclash',
    live: 'https://www.agentclash.dev',
  },
  {
    name: 'learnframe',
    description:
      'YouTube-first learning toolkit that turns public videos into local courses with transcripts and timestamp-cited Q&A.',
    github: 'https://github.com/Atharva-Kanherkar/learnframe',
  },
  {
    name: 'chalkboard',
    description:
      'Turns a prompt into a narrated whiteboard explainer video. Self-hostable, MIT, works with local models.',
    github: 'https://github.com/Atharva-Kanherkar/chalkboard',
  },
  {
    name: 'agentic-memory',
    description:
      'Cognitive memory for AI agents with separate semantic, episodic, and procedural stores.',
    github: 'https://github.com/agentclash/agentic-memory',
    live: 'https://memory.agentclash.dev',
  },
  {
    name: 'datasmith',
    description:
      'Provider-agnostic SDK and CLI for building targeted synthetic training and eval datasets — web-grounded seed construction feeding a weak-vs-strong generation loop, with OpenTelemetry trace ingestion.',
    github: 'https://github.com/Atharva-Kanherkar/datasmith',
  },
  {
    name: 'AnimeVocab',
    description:
      'Learn Japanese from anime — romaji-first Chrome extension, spaced repetition, Listening Mode, Manga Studio, and cloud sync. Free and open source.',
    github: 'https://github.com/Atharva-Kanherkar/anime-vocab-coach',
    live: 'https://animevocab.com',
  },
  {
    name: 'e2b-go',
    description: 'Unofficial Go SDK for E2B sandboxes.',
    github: 'https://github.com/Atharva-Kanherkar/e2b-go',
  },
];
