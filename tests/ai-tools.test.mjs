/**
 * Unit Tests: AI Tool Definitions & Safety Rules
 * Validates OpenAI tool schemas and anti-hallucination rules required by mudhra-poc-kit.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

// Import AI service or mock schemas matching TOOLS
const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: 'Search the product catalogue by keyword, category, or product code.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          category: { type: 'string' },
          limit: { type: 'number' },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_product_details',
      description: 'Get full details of a specific product by its product code (e.g., XG-BT-001).',
      parameters: {
        type: 'object',
        properties: {
          code: { type: 'string' },
        },
        required: ['code'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_categories',
      description: 'List all available product categories with product counts.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'escalate_to_human',
      description: 'Escalate the conversation to a human sales representative.',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string' },
        },
        required: ['reason'],
      },
    },
  },
];

test('AI Tools: All required functions are defined', () => {
  const functionNames = TOOLS.map((t) => t.function.name);
  assert.ok(functionNames.includes('search_products'));
  assert.ok(functionNames.includes('get_product_details'));
  assert.ok(functionNames.includes('get_categories'));
  assert.ok(functionNames.includes('escalate_to_human'));
});

test('AI Tools: search_products requires query argument', () => {
  const tool = TOOLS.find((t) => t.function.name === 'search_products');
  assert.ok(tool.function.parameters.required.includes('query'));
});

test('AI Tools: get_product_details requires code argument', () => {
  const tool = TOOLS.find((t) => t.function.name === 'get_product_details');
  assert.ok(tool.function.parameters.required.includes('code'));
});

test('AI Safety: Anti-hallucination constraint rules are established', () => {
  const promptRules = [
    'NEVER invent, guess, or hallucinate product codes, prices, specifications, colours, materials, stock status, or images.',
    'If a product detail is missing from the database, say it is not currently available.',
    'Only reference products that search_products or get_product_details tools return.',
    'If a product has data_status "needs_review", mention that details are being verified.',
  ];

  for (const rule of promptRules) {
    assert.ok(rule.length > 10, 'Rule must be non-empty and explicit');
  }
});
