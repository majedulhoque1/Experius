/*
  The site ships its own copy of the eight questions because it runs
  without a bundler. If the two lists drift, the map gets generated from
  different questions than the visitor actually answered — a silent, invisible
  correctness bug that would also corrupt the research dataset.

  This asserts they are identical. Run: npx tsx scripts/check-examination-sync.ts
*/

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { QUESTIONS } from '../lib/examination/questions'

const dataPath = resolve('assets/data.js')
const src = readFileSync(dataPath, 'utf8')

// data.js assigns to window.SITE; give it a window and read the result back.
const sandbox: { SITE?: { exam: { questions: { id: string; t: string; mod: string }[] } } } = {}
new Function('window', src)(sandbox)

const proto = sandbox.SITE?.exam?.questions
if (!proto) {
  console.error('✗ could not read SITE.exam.questions from', dataPath)
  process.exit(1)
}

let failures = 0
const fail = (msg: string) => {
  failures++
  console.error('  ✗ ' + msg)
}

if (proto.length !== QUESTIONS.length) {
  fail(`count differs: lib has ${QUESTIONS.length}, site has ${proto.length}`)
}

QUESTIONS.forEach((q, i) => {
  const p = proto[i]
  if (!p) return fail(`site missing question ${i + 1} (${q.id})`)
  // The id is what gets persisted and sent to the generator — a mismatch here
  // silently generates the map from different questions than were answered.
  if (p.id !== q.id) fail(`id differs at position ${i + 1}: lib=${q.id} site=${p.id}`)
  if (p.t !== q.text) fail(`text differs at ${q.id}:\n      lib:   ${q.text}\n      proto: ${p.t}`)
  if (p.mod !== q.module) fail(`module differs at ${q.id}: lib=${q.module} site=${p.mod}`)
})

if (failures) {
  console.error(`\n⚠ examination definitions have drifted (${failures} difference(s)).`)
  console.error('  lib/examination/questions.ts is canonical — update assets/data.js to match.\n')
  process.exit(1)
}

console.log(`✓ examination in sync — ${QUESTIONS.length} questions match between lib and site`)
