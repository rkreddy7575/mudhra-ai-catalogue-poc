/**
 * Google Gemini Client & Configuration
 * 
 * STRICT SECURITY CONSTRAINTS:
 * - Server-side only: NEVER import or expose in client components.
 * - GEMINI_API_KEY is a confidential server secret and must NEVER be prefixed with NEXT_PUBLIC_.
 * - GEMINI_MODEL is fully configurable via the GEMINI_MODEL environment variable; defaults to gemini-3.5-flash.
 */

import { GoogleGenAI } from '@google/genai';

let _gemini: GoogleGenAI | null = null;

/**
 * Retrieve the configured Gemini model from the environment.
 * Defaults to 'gemini-3.5-flash' if not explicitly set.
 */
export function getGeminiModel(): string {
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash';
  return model;
}

/**
 * Lazy-initialized GoogleGenAI client using server-side GEMINI_API_KEY.
 * Throws an error if GEMINI_API_KEY is missing when invoked.
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY environment variable is not configured. Please set GEMINI_API_KEY in .env.local.'
    );
  }

  if (!_gemini) {
    _gemini = new GoogleGenAI({
      apiKey,
    });
  }
  return _gemini;
}
