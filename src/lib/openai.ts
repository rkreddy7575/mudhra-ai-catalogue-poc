/**
 * OpenAI Client & Configuration
 * 
 * STRICT SECURITY CONSTRAINTS:
 * - Server-side only: NEVER import or expose in client components.
 * - OPENAI_API_KEY is a confidential server secret and must NEVER be prefixed with NEXT_PUBLIC_.
 * - OPENAI_MODEL is fully configurable via the OPENAI_MODEL environment variable; no hardcoded model.
 */

import OpenAI from 'openai';

let _openai: OpenAI | null = null;

/**
 * Retrieve the configured OpenAI model from the environment.
 * Throws an error if OPENAI_MODEL is not configured.
 */
export function getOpenAIModel(): string {
  const model = process.env.OPENAI_MODEL?.trim();
  if (!model) {
    throw new Error(
      'OPENAI_MODEL environment variable is not configured. Please set OPENAI_MODEL in .env.local.'
    );
  }
  return model;
}

/**
 * Lazy-initialized OpenAI client using server-side OPENAI_API_KEY.
 * Throws an error if OPENAI_API_KEY is missing when invoked.
 */
export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY environment variable is not configured. Please set OPENAI_API_KEY in .env.local.'
    );
  }

  if (!_openai) {
    _openai = new OpenAI({
      apiKey,
    });
  }
  return _openai;
}
