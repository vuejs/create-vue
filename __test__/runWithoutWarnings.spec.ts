/// <reference types="node" />

import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vite-plus/test'

const runWithoutWarningsPath = fileURLToPath(
  new URL('../scripts/run-without-warnings.mjs', import.meta.url),
)

function runWithoutWarnings(script: string) {
  return spawnSync(
    process.execPath,
    [runWithoutWarningsPath, process.execPath, '--input-type=module', '--eval', script],
    { encoding: 'utf8' },
  )
}

describe('runWithoutWarnings', () => {
  it('fails when a successful command writes a warning to stderr', () => {
    const result = runWithoutWarnings("console.error('probe warning')")

    expect(result.status).toBe(1)
    expect(result.stderr).toContain('probe warning')
    expect(result.stderr).toContain('Command succeeded with warnings on stderr.')
  })

  it('passes when a successful command does not write to stderr', () => {
    const result = runWithoutWarnings("console.log('clean output')")

    expect(result.status).toBe(0)
    expect(result.stdout).toContain('clean output')
  })

  it('preserves the exit code of a failed command', () => {
    const result = runWithoutWarnings('process.exit(2)')

    expect(result.status).toBe(2)
  })
})
