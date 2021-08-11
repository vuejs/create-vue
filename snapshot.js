import { spawnSync } from 'child_process'

const bin = new URL('./index.js', import.meta.url).pathname
const playgroundDir = new URL('./playground/', import.meta.url).pathname

function createProjectWithFeatureFlags(flags) {
  const projectName = flags.join('-')
  console.log(`Creating project ${projectName}`)
  spawnSync(
    'node',
    [bin, projectName, ...flags.map((flag) => `--${flag}`), '--force'],
    {
      cwd: playgroundDir
    }
  )
}

const featureFlags = ['typescript', 'jsx', 'router', 'vuex', 'with-tests']

function getCombinations(arr) {
  const combinations = []

  for (let i = 0; i < arr.length; i++) {
    for (let j = i; j < arr.length; j++) {
      const combination = arr.slice(i, j + 1)
      combinations.push(combination)
    }
  }

  return combinations
}

const flagCombinations = getCombinations(featureFlags)
flagCombinations.push(['default'])

for (const flags of flagCombinations) {
  createProjectWithFeatureFlags(flags)
}
