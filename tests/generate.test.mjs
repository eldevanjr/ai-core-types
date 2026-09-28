import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { collectDefinitions, generateDts } from '../scripts/generate.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

test('gera interface, enums, opcionais e coleções', () => {
  const dts = generateDts({
    'Thing.schema.json': {
      type: 'object',
      additionalProperties: false,
      required: ['id'],
      properties: {
        id: { type: 'string' },
        status: { $ref: '#/$defs/Status', default: 'A' },
        note: { anyOf: [{ type: 'string' }, { type: 'null' }], default: null },
        tags: { type: 'array', items: { type: 'string' } },
        meta: { type: 'object', additionalProperties: true },
        weird: { type: 'string' }
      },
      $defs: { Status: { enum: ['A', 'B'] } }
    }
  })
  assert.match(dts, /export type Status = "A" \| "B";/)
  assert.match(dts, /export interface Thing \{/)
  assert.match(dts, /id: string/)
  assert.match(dts, /status\?: Status/)
  assert.match(dts, /note\?: string \| null/)
  assert.match(dts, /tags\?: Array<string>/)
  assert.match(dts, /meta\?: Record<string, unknown>/)
})

test('declara arrays de modelos referenciados', () => {
  const dts = generateDts({
    'Bag.schema.json': {
      type: 'object',
      additionalProperties: false,
      required: ['items'],
      properties: { items: { type: 'array', items: { $ref: '#/$defs/Item' } } },
      $defs: {
        Item: {
          type: 'object',
          additionalProperties: false,
          required: ['value'],
          properties: { value: { type: 'number' } }
        }
      }
    }
  })
  assert.match(dts, /export interface Bag \{/)
  assert.match(dts, /items: Array<Item>/)
  assert.match(dts, /export interface Item \{/)
})

test('a raiz tem prioridade sobre um $def de mesmo nome', () => {
  const definitions = collectDefinitions({
    'Source.schema.json': { type: 'object', properties: { id: { type: 'string' } } },
    'Other.schema.json': {
      type: 'object',
      properties: {},
      $defs: { Source: { enum: ['NAO_DEVE_VENCER'] } }
    }
  })
  assert.deepEqual(definitions.get('Source'), {
    type: 'object',
    properties: { id: { type: 'string' } }
  })
})

test('os schemas reais viram todos os modelos', async () => {
  const dir = join(ROOT, 'schemas')
  const files = (await readdir(dir)).filter((file) => file.endsWith('.schema.json'))
  assert.ok(files.length >= 29, `esperava >= 29 schemas, recebi ${files.length}`)
  const schemas = {}
  for (const file of files) schemas[file] = JSON.parse(await readFile(join(dir, file), 'utf8'))
  const dts = generateDts(schemas)
  for (const name of [
    'Workspace',
    'Evidence',
    'Source',
    'KnowledgeDocument',
    'KnowledgeChunk',
    'Task',
    'TaskProposal',
    'TaskExplanation',
    'DestinationRef',
    'AuditEvent',
    'LLMRequest',
    'LLMResponse',
    'Embedding',
    'SearchRequest',
    'SearchResult',
    'PrivacyPolicy',
    'ApprovalPolicy',
    'RoutingPolicy'
  ]) {
    assert.match(dts, new RegExp(`export (interface|type) ${name}\\b`), `faltou ${name}`)
  }
  assert.match(dts, /export type SourceKind = "FILE"/)
  assert.match(dts, /export interface SearchTask\w*Response/)
})
