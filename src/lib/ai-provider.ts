/**
 * AI Provider Abstraction
 * 
 * Provides a clean interface for multiple LLM providers (Google Gemini, OpenAI).
 * Keeps sales-agent reasoning decoupled from specific LLM SDK implementations.
 * Server-side only: never expose provider clients or keys to the client.
 */

import { GoogleGenAI, Type, type FunctionDeclaration, type Schema } from '@google/genai';
import { getGeminiClient, getGeminiModel } from './gemini';
import { getOpenAIClient, getOpenAIModel } from './openai';
import type { Product } from '@/types';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions';

export interface ToolParamProperty {
  type: string;
  description?: string;
  enum?: string[];
  items?: { type: string };
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, ToolParamProperty>;
    required?: string[];
  };
}

export interface ChatMessageContext {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProviderChatParams {
  systemPrompt: string;
  history: ChatMessageContext[];
  userMessage: string;
  tools: ToolDefinition[];
  executeTool: (
    name: string,
    args: Record<string, unknown>
  ) => Promise<{ result: string; products?: Product[] }>;
}

export interface ProviderChatResult {
  reply: string;
  collectedProducts: Product[];
}

export interface AIProvider {
  name: string;
  chat(params: ProviderChatParams): Promise<ProviderChatResult>;
}

// ============================================================
// Google Gemini Provider (Default / Active)
// Uses official @google/genai SDK with automatic model failover for Free Tier rate limits
// ============================================================
export class GeminiProvider implements AIProvider {
  public name = 'gemini';

  private fallbackModels = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
  ];

  async chat(params: ProviderChatParams): Promise<ProviderChatResult> {
    const ai = getGeminiClient();
    const primaryModel = getGeminiModel();
    const modelsToTry = Array.from(new Set([primaryModel, ...this.fallbackModels]));

    // Map history to Gemini format
    const history = params.history.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    // Map tools to Gemini function declarations
    const functionDeclarations: FunctionDeclaration[] = params.tools.map((tool) => {
      const properties: Record<string, Schema> = {};
      for (const [key, prop] of Object.entries(tool.parameters.properties)) {
        let geminiType = Type.STRING;
        if (prop.type === 'number') geminiType = Type.NUMBER;
        else if (prop.type === 'integer') geminiType = Type.INTEGER;
        else if (prop.type === 'boolean') geminiType = Type.BOOLEAN;
        else if (prop.type === 'object') geminiType = Type.OBJECT;
        else if (prop.type === 'array') geminiType = Type.ARRAY;

        const schema: Schema = {
          type: geminiType,
          description: prop.description,
        };

        if (geminiType === Type.ARRAY) {
          schema.items = { type: Type.STRING };
        }

        properties[key] = schema;
      }

      return {
        name: tool.name,
        description: tool.description,
        parameters: {
          type: Type.OBJECT,
          properties,
          required: tool.parameters.required || [],
        },
      };
    });

    let lastError: unknown = null;

    for (const model of modelsToTry) {
      try {
        const collectedProducts: Product[] = [];

        // Create chat session with system instruction and tool definitions
        const chat = ai.chats.create({
          model,
          history,
          config: {
            systemInstruction: params.systemPrompt,
            temperature: 0.2, // Low temperature for high factual accuracy
            tools: [
              {
                functionDeclarations,
              },
            ],
          },
        });

        // Send user message
        let response = await chat.sendMessage({ message: params.userMessage });

        // Handle tool calling loop
        let iterations = 0;
        const MAX_ITERATIONS = 5;

        while (
          response.functionCalls &&
          response.functionCalls.length > 0 &&
          iterations < MAX_ITERATIONS
        ) {
          iterations++;

          const functionResponses = [];
          for (const call of response.functionCalls) {
            const toolName = call.name || '';
            const toolArgs = (call.args as Record<string, unknown>) || {};
            const { result, products } = await params.executeTool(toolName, toolArgs);

            if (products && products.length > 0) {
              collectedProducts.push(...products);
            }

            functionResponses.push({
              functionResponse: {
                name: toolName,
                response: { result },
              },
            });
          }

          // Send function responses back to model
          response = await chat.sendMessage({
            message: functionResponses,
          });
        }

        const reply =
          response.text ||
          'I apologize, I was unable to process your request. Please try again or contact our sales team.';

        return {
          reply,
          collectedProducts,
        };
      } catch (err: unknown) {
        const errMsg = String(err);
        const isRecoverable =
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('Quota exceeded') ||
          errMsg.includes('404') ||
          errMsg.includes('NOT_FOUND') ||
          errMsg.includes('no longer available');

        if (isRecoverable && model !== modelsToTry[modelsToTry.length - 1]) {
          console.warn(`[GeminiProvider] Model ${model} failed (${errMsg}). Falling back to next model...`);
          lastError = err;
          continue;
        }

        lastError = err;
        break;
      }
    }

    // If all candidate models failed due to rate limits, return a graceful corporate message
    const errorStr = String(lastError);
    if (errorStr.includes('429') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      return {
        reply:
          'Our AI sales assistant is currently experiencing a high volume of requests. Please wait a moment and try again, or connect directly with our sales desk to assist with your enquiry.',
        collectedProducts: [],
      };
    }

    throw lastError;
  }
}

// ============================================================
// OpenAI Provider (Alternative / Legacy)
// Kept for seamless provider switching without rewriting sales logic
// ============================================================
export class OpenAIProvider implements AIProvider {
  public name = 'openai';

  async chat(params: ProviderChatParams): Promise<ProviderChatResult> {
    const openai = getOpenAIClient();
    const model = getOpenAIModel();
    const collectedProducts: Product[] = [];

    // Map tools to OpenAI ChatCompletionTool format
    const openAiTools: ChatCompletionTool[] = params.tools.map((t) => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: {
          type: 'object',
          properties: t.parameters.properties,
          required: t.parameters.required,
        },
      },
    }));

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: params.systemPrompt },
      ...params.history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: params.userMessage },
    ];

    let response = await openai.chat.completions.create({
      model,
      messages,
      tools: openAiTools,
      tool_choice: 'auto',
      temperature: 0.3,
      max_tokens: 1000,
    });

    let assistantMessage = response.choices[0].message;
    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (assistantMessage.tool_calls && iterations < MAX_ITERATIONS) {
      iterations++;
      messages.push(assistantMessage as ChatCompletionMessageParam);

      for (const toolCall of assistantMessage.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments);
        const { result, products } = await params.executeTool(toolCall.function.name, args);

        if (products && products.length > 0) {
          collectedProducts.push(...products);
        }

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: result,
        });
      }

      response = await openai.chat.completions.create({
        model,
        messages,
        tools: openAiTools,
        tool_choice: 'auto',
        temperature: 0.3,
        max_tokens: 1000,
      });

      assistantMessage = response.choices[0].message;
    }

    const reply =
      assistantMessage.content ||
      'I apologize, I was unable to process your request. Please try again or contact our sales team.';

    return {
      reply,
      collectedProducts,
    };
  }
}

// ============================================================
// Provider Factory
// Configurable via AI_PROVIDER environment variable ('gemini' | 'openai')
// Defaults to 'gemini' when GEMINI_API_KEY is configured
// ============================================================
export function getAIProvider(): AIProvider {
  const provider = (process.env.AI_PROVIDER || '').toLowerCase().trim();

  if (provider === 'openai') {
    return new OpenAIProvider();
  }

  // Default to Gemini
  return new GeminiProvider();
}
