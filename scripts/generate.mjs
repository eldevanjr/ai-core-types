#!/usr/bin/env node
// Gera `dist/index.d.ts` a partir dos JSON Schemas do ai-core (fonte única, plano §22 / CA-17).
//
// Uso: node scripts/generate.mjs [diretório-de-schemas] [arquivo-de-saída]
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const INDENT = '  '
const API_REF = '#/$defs/'

function comment(text, indentLevel) {
  const pad = INDENT.repeat(indentLevel)
  const safe = String(text).replaceAll('*/', '*\\/').split('\n')
  return `${pad}/**\n${safe.map((line) => `${pad} * ${line}`).join('\n')}\n${pad} */\n`
}

function jsdoc(schema, indentLevel = 0) {
  if (!schema || (!schema.description && schema.default === undefined)) return ''
  const lines = []
  if (schema.description) lines.push(String(schema.description))
  if (schema.default !== undefined) lines.push(`@default ${JSON.stringify(schema.default)}`)
  return comment(lines.join('\n'), indentLevel)
}

function literalUnion(values) {
  return values.map((value) => JSON.stringify(value)).join(' | ')
}

function refName(ref) {
  const index = ref.indexOf(API_REF)
  return index >= 0 ? ref.slice(index + API_REF.length) : ref.split('/').pop()
}

function typeOf(schema) {
  if (schema.$ref) return refName(schema.$ref)
  if (Array.isArray(schema.enum)) return literalUnion(schema.enum)
  if (Array.isArray(schema.anyOf)) return schema.anyOf.map(typeOf).join(' | ')
  if (Array.isArray(schema.oneOf)) return schema.oneOf.map(typeOf).join(' | ')
  switch (schema.type) {
    case 'string':
      return 'string'
    case 'integer':
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    case 'null':
      return 'null'
    case 'array':
      return schema.items ? `Array<${typeOf(schema.items)}>` : 'Array<unknown>'
    case 'object':
      return schema.properties ? objectLiteral(schema) : 'Record<string, unknown>'
    default:
      return 'unknown'
  }
}

function objectLiteral(schema) {
  const required = new Set(schema.required ?? [])
  const properties = Object.entries(schema.properties ?? {})
  if (properties.length === 0) return 'Record<string, unknown>'
  const body = properties.map(([name, property]) => {
    const optional = required.has(name) ? '' : '?'
    return `${jsdoc(property, 2)}${INDENT.repeat(2)}${propName(name)}${optional}: ${typeOf(property)}`
  })
  return `{\n${body.join('\n')}\n${INDENT}}`
}

function propName(name) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : JSON.stringify(name)
}

function declaration(name, schema) {
  const doc = jsdoc(schema, 0)
  if (Array.isArray(schema.enum)) {
    return `${doc}export type ${name} = ${literalUnion(schema.enum)};`
  }
  if (schema.type === 'object' && schema.properties) {
    const required = new Set(schema.required ?? [])
    const body = Object.entries(schema.properties).map(([key, property]) => {
      const optional = required.has(key) ? '' : '?'
      return `${jsdoc(property, 1)}${INDENT}${propName(key)}${optional}: ${typeOf(property)}`
    })
    const inner = body.length > 0 ? `\n${body.join('\n')}\n` : ' '
    return `${doc}export interface ${name} {${inner}}`
  }
  return `${doc}export type ${name} = ${typeOf(schema)};`
}

/** Junta os modelos raiz e os `$defs` num único namespace (raiz tem prioridade). */
export function collectDefinitions(schemas) {
  const definitions = new Map()
  for (const file of Object.keys(schemas).sort()) {
    definitions.set(file.replace(/\.schema\.json$/, ''), schemas[file])
  }
  for (const file of Object.keys(schemas).sort()) {
    for (const [name, def] of Object.entries(schemas[file].$defs ?? {})) {
      if (!definitions.has(name)) definitions.set(name, def)
    }
  }
  return definitions
}

/** Gera o conteúdo de `index.d.ts` a partir de `{ arquivo: schema }`. */
export function generateDts(schemas) {
  const definitions = collectDefinitions(schemas)
  const names = [...definitions.keys()].sort((a, b) => a.localeCompare(b))
  return [
    '// Gerado por scripts/generate.mjs a partir dos JSON Schemas do ai-core.',
    '// Não edite à mão: rode `pnpm build` (ou `node scripts/generate.mjs`).',
    '',
    ...names.map((name) => declaration(name, definitions.get(name))),
    ''
  ].join('\n')
}

async function main() {
  const schemasDir = process.argv[2] ?? join(ROOT, 'schemas')
  const outFile = process.argv[3] ?? join(ROOT, 'dist', 'index.d.ts')
  const files = (await readdir(schemasDir)).filter((file) => file.endsWith('.schema.json'))
  const schemas = {}
  for (const file of files) {
    schemas[file] = JSON.parse(await readFile(join(schemasDir, file), 'utf8'))
  }
  await mkdir(dirname(outFile), { recursive: true })
  await writeFile(outFile, generateDts(schemas), 'utf8')
  await writeFile(join(dirname(outFile), 'index.js'), 'export {}\n', 'utf8')
  console.log(`${files.length} schemas -> ${outFile}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main()
}
