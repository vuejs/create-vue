import { spawn } from 'node:child_process'

const [command, ...args] = process.argv.slice(2)

if (!command) {
  throw new Error('A command is required.')
}

// Stream the command normally, but capture stderr so successful commands that
// emit warnings can still make the CI job fail.
const child = spawn(command, args, {
  // Windows needs a shell to resolve pnpm's command shim.
  shell: process.platform === 'win32' && command === 'pnpm',
  stdio: ['inherit', 'inherit', 'pipe'],
})

let stderr = ''
child.stderr.on('data', (chunk) => {
  // Keep the original stderr visible while retaining it for the final check.
  stderr += chunk
  process.stderr.write(chunk)
})

const exitCode = await new Promise((resolve, reject) => {
  child.on('error', reject)
  child.on('close', resolve)
})

// Preserve real command failures; otherwise treat any stderr as a warning and
// turn the successful exit into a failure.
if (exitCode !== 0) {
  process.exitCode = exitCode ?? 1
} else if (stderr.trim()) {
  console.error('Command succeeded with warnings on stderr.')
  process.exitCode = 1
}
