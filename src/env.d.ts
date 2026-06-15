/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Set by src/middleware.ts after validating the studio session cookie. */
    studio?: {
      /** GitHub login of the authenticated owner. */
      login: string;
      /** GitHub OAuth access token (gho_…), used to commit posts. */
      token: string;
    };
  }
}

interface ImportMetaEnv {
  readonly OPENAI_API_KEY: string;
  readonly OPENAI_MODEL?: string;

  // Studio auth
  readonly GITHUB_CLIENT_ID: string;
  readonly GITHUB_CLIENT_SECRET: string;
  /** Only this GitHub login may sign in to the studio. */
  readonly GITHUB_ALLOWED_LOGIN: string;
  /** 32-byte base64url secret for encrypting the session JWE. */
  readonly SESSION_SECRET: string;

  // Publish target (defaults applied in code if unset)
  readonly GITHUB_REPO_OWNER?: string;
  readonly GITHUB_REPO_NAME?: string;
  readonly GITHUB_REPO_BRANCH?: string;

  // Vercel Blob (drafts + images)
  readonly BLOB_READ_WRITE_TOKEN?: string;

  // Dev-only studio auth bypass (ignored in production builds).
  readonly STUDIO_DEV_LOGIN?: string;
  readonly STUDIO_DEV_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
